"""The thin slice: submit, track, staff sign-in, queue, acknowledge, and the rules around them."""
import pytest
from sqlalchemy import select

from app import ratelimit
from app.db import SessionLocal
from app.models import NotificationRequest, Report, StaffAccount

from conftest import JPEG, sign_in, submit


# ---------------------------------------------------------------- happy path
def test_submit_track_acknowledge_end_to_end(client, staff):
    r = submit(client, email="citizen@example.org")
    assert r.status_code == 201
    body = r.json()
    tid = body["trackingId"]
    assert len(tid) >= 8 and body["emailNotice"] == "acknowledgement-will-be-sent"

    view = client.get(f"/v1/reports/{tid}").json()
    assert view["status"] == "Submitted"
    assert view["location"] == {"latitude": 23.81, "longitude": 90.41}

    headers = sign_in(client, staff["secret"])
    queue = client.get("/v1/staff/reports", headers=headers).json()
    assert queue["total"] == 1 and queue["items"][0]["trackingId"] == tid

    ack = client.post(f"/v1/staff/reports/{tid}/acknowledge", headers=headers)
    assert ack.status_code == 200 and ack.json()["status"] == "Acknowledged"
    assert ack.json()["history"][-1]["actorStaffId"] == staff["id"]

    view = client.get(f"/v1/reports/{tid}").json()
    assert [h["status"] for h in view["history"]] == ["Submitted", "Acknowledged"]


def test_tracking_view_never_carries_email_or_photo(client):
    tid = submit(client, email="citizen@example.org").json()["trackingId"]
    text = client.get(f"/v1/reports/{tid}").text
    assert "citizen@example.org" not in text and "photo" not in text.lower()


def test_no_email_means_warning_and_no_notification(client):
    body = submit(client).json()
    assert body["emailNotice"] == "no-email-no-notifications"
    with SessionLocal() as db:
        assert db.scalars(select(NotificationRequest)).all() == []


def test_notifications_queued_with_the_change_and_marked_sent(client, staff):
    tid = submit(client, email="citizen@example.org").json()["trackingId"]
    headers = sign_in(client, staff["secret"])
    client.post(f"/v1/staff/reports/{tid}/acknowledge", headers=headers)
    with SessionLocal() as db:
        rows = db.scalars(select(NotificationRequest)).all()
        # submission sends "acknowledgement"; the staff acknowledge is a status change (Bolt 7, decision 5)
        assert sorted(n.kind for n in rows) == ["acknowledgement", "status-change"]
        assert len(rows) == 2  # on submission and on acknowledge
        assert all(n.status == "sent" for n in rows)  # background send ran


# ------------------------------------------------------------ submission rules
def test_same_key_replays_the_original_report(client):
    first = submit(client, key="a" * 16).json()
    second = submit(client, key="a" * 16).json()
    assert first["trackingId"] == second["trackingId"]
    with SessionLocal() as db:
        assert len(db.scalars(select(Report)).all()) == 1


def test_missing_or_short_key_is_rejected(client):
    r = client.post(
        "/v1/reports",
        data={"category": "pothole", "description": "x", "latitude": "1", "longitude": "1"},
        files={"photo": ("p.jpg", JPEG, "image/jpeg")},
    )
    assert r.status_code == 422 and r.json()["code"] == "validation_failed"


def test_wrong_photo_type_creates_no_report(client):
    r = submit(client, photo=b"not an image at all", content_type="text/plain")
    assert r.status_code == 415 and r.json()["code"] == "unsupported_photo_type"
    r = submit(client, key="b" * 16, photo=b"<html>", content_type="image/jpeg")  # lies about its type
    assert r.status_code == 415
    r = submit(client, key="c" * 16, photo=b"\xff\xd8\xff\xe0" + b"\x00" * 64)  # right header, not a picture
    assert r.status_code == 415 and r.json()["code"] == "unsupported_photo_type"
    with SessionLocal() as db:
        assert db.scalars(select(Report)).all() == []


def test_oversize_photo_is_rejected(client):
    r = submit(client, photo=JPEG + b"\x00" * (10 * 1024 * 1024))
    assert r.status_code == 413


@pytest.mark.parametrize(
    "over",
    [
        {"category": "unicorns"},
        {"latitude": "123"},
        {"description": "   "},
        {"email": "not-an-email"},
    ],
)
def test_bad_fields_are_rejected_with_the_standard_error_shape(client, over):
    r = submit(client, **over)
    assert r.status_code in (422,)
    assert set(r.json()) == {"code", "message", "fieldErrors"}


@pytest.mark.parametrize(
    "lat,lng",
    [("51.5", "-0.12"), ("23.5", "90.41"), ("24.1", "90.41"), ("23.81", "90.1"), ("23.81", "90.7"), ("0", "0")],
    ids=["london", "south", "north", "west", "east", "null-island"],
)
def test_position_outside_dhaka_is_refused_and_stores_nothing(client, lat, lng):
    from app import config

    before = len(list(config.PHOTO_DIR.glob("*.bin"))) if config.PHOTO_DIR.exists() else 0
    r = submit(client, latitude=lat, longitude=lng)
    assert r.status_code == 422 and r.json()["code"] == "outside_service_area"
    assert {f["field"] for f in r.json()["fieldErrors"]} == {"latitude", "longitude"}
    with SessionLocal() as db:
        assert db.scalars(select(Report)).all() == []
    after = len(list(config.PHOTO_DIR.glob("*.bin"))) if config.PHOTO_DIR.exists() else 0
    assert after == before  # the photo was not stored either


def test_positions_on_the_edge_of_the_area_are_accepted(client):
    assert submit(client, key="e" * 16, latitude="23.62", longitude="90.28").status_code == 201
    assert submit(client, key="f" * 16, latitude="23.95", longitude="90.55").status_code == 201


def test_rate_limit_returns_429(client):
    for i in range(10):
        assert submit(client, key=f"{i:016d}").status_code == 201
    assert submit(client, key="z" * 16).status_code == 429


# ------------------------------------------------------------- tracking rules
@pytest.mark.parametrize("bad", ["x", "NOPE12345", "a" * 40, "%20"])
def test_unknown_and_malformed_ids_give_the_same_404(client, bad):
    r = client.get(f"/v1/reports/{bad}")
    assert r.status_code == 404 and r.json()["code"] == "not_found"


def test_lookups_are_rate_limited(client):
    for _ in range(60):
        client.get("/v1/reports/NOPE123456")
    assert client.get("/v1/reports/NOPE123456").status_code == 429


def test_dispute_only_while_resolved_and_flags_report(client, staff):
    tid = submit(client).json()["trackingId"]
    assert client.post(f"/v1/reports/{tid}/dispute").status_code == 409
    h = sign_in(client, staff["secret"])
    for to, extra in [("Acknowledged", {}), ("In Progress", {}), ("Resolved", {"resolutionNote": "Filled"})]:
        assert client.post(f"/v1/staff/reports/{tid}/status", headers=h, json={"toStatus": to, **extra}).status_code == 200
    ratelimit.reset()
    assert client.post(f"/v1/reports/{tid}/dispute").status_code == 204
    assert client.get(f"/v1/staff/reports?disputed=true", headers=h).json()["total"] == 1
    assert client.get(f"/v1/reports/{tid}").json()["status"] == "Resolved"  # status does not change by itself


# -------------------------------------------------------------- staff sign-in
def test_staff_endpoints_need_a_session(client):
    assert client.get("/v1/staff/reports").status_code == 401
    assert client.get("/v1/staff/reports", headers={"Authorization": "Bearer nonsense"}).status_code == 401


def test_wrong_password_and_unknown_account_look_the_same(client, staff):
    a = client.post("/v1/staff/sign-in", json={"email": "staff@example.org", "password": "wrong-password-x"})
    b = client.post("/v1/staff/sign-in", json={"email": "nobody@example.org", "password": "wrong-password-x"})
    assert a.status_code == b.status_code == 401 and a.json() == b.json()


def test_second_factor_is_required_and_codes_are_checked(client, staff):
    cid = client.post("/v1/staff/sign-in", json={"email": "staff@example.org", "password": "correct-horse-battery"}).json()["challengeId"]
    assert client.post("/v1/staff/sign-in/second-factor", json={"challengeId": cid, "code": "000000"}).status_code == 401
    assert client.get("/v1/staff/me").status_code == 401  # the password alone gives no access


def test_deactivated_account_stops_at_once(client, staff):
    h = sign_in(client, staff["secret"])
    assert client.get("/v1/staff/me", headers=h).status_code == 200
    with SessionLocal() as db:
        db.get(StaffAccount, staff["id"]).active = False
        db.commit()
    assert client.get("/v1/staff/me", headers=h).status_code == 401


def test_sign_out_ends_the_session(client, staff):
    h = sign_in(client, staff["secret"])
    assert client.post("/v1/staff/sign-out", headers=h).status_code == 204
    assert client.get("/v1/staff/me", headers=h).status_code == 401


# ---------------------------------------------------------------- status rules
def _report(client, staff):
    tid = submit(client).json()["trackingId"]
    return tid, sign_in(client, staff["secret"])


def test_forward_moves_are_one_step(client, staff):
    tid, h = _report(client, staff)
    r = client.post(f"/v1/staff/reports/{tid}/status", headers=h, json={"toStatus": "In Progress"})
    assert r.status_code == 409 and r.json()["code"] == "move_not_allowed"


def test_backward_move_needs_a_reason_and_is_recorded(client, staff):
    tid, h = _report(client, staff)
    client.post(f"/v1/staff/reports/{tid}/acknowledge", headers=h)
    bad = client.post(f"/v1/staff/reports/{tid}/status", headers=h, json={"toStatus": "Submitted"})
    assert bad.status_code == 422 and bad.json()["code"] == "reason_required"
    ok = client.post(f"/v1/staff/reports/{tid}/status", headers=h, json={"toStatus": "Submitted", "reason": "Wrong ward"})
    assert ok.status_code == 200 and ok.json()["history"][-1]["reason"] == "Wrong ward"


def test_resolving_needs_a_note(client, staff):
    tid, h = _report(client, staff)
    for to in ("Acknowledged", "In Progress"):
        client.post(f"/v1/staff/reports/{tid}/status", headers=h, json={"toStatus": to})
    r = client.post(f"/v1/staff/reports/{tid}/status", headers=h, json={"toStatus": "Resolved"})
    assert r.status_code == 422 and r.json()["code"] == "resolution_note_required"


def test_closed_duplicate_needs_an_existing_original(client, staff):
    tid, h = _report(client, staff)
    r = client.post(f"/v1/staff/reports/{tid}/status", headers=h, json={"toStatus": "Closed-Duplicate"})
    assert r.status_code == 422
    other = submit(client, key="o" * 16).json()["trackingId"]
    r = client.post(f"/v1/staff/reports/{tid}/status", headers=h, json={"toStatus": "Closed-Duplicate", "duplicateOfTrackingId": other})
    assert r.status_code == 200 and r.json()["duplicateOfTrackingId"] == other


def test_acknowledging_twice_is_refused(client, staff):
    tid, h = _report(client, staff)
    assert client.post(f"/v1/staff/reports/{tid}/acknowledge", headers=h).status_code == 200
    assert client.post(f"/v1/staff/reports/{tid}/acknowledge", headers=h).status_code == 409


def test_staff_can_see_the_citizen_photo_but_the_public_cannot(client, staff):
    tid, h = _report(client, staff)
    url = client.get(f"/v1/staff/reports/{tid}", headers=h).json()["photoUrl"]
    shown = client.get(url, headers=h)
    assert shown.status_code == 200 and shown.headers["content-type"] == "image/jpeg"
    assert shown.content[:3] == b"\xff\xd8\xff"  # a real picture, re-saved without metadata
    assert client.get(url).status_code == 401


def test_queue_filters_and_pages(client, staff):
    for i in range(3):
        submit(client, key=f"{i:016d}")
    h = sign_in(client, staff["secret"])
    page = client.get("/v1/staff/reports?pageSize=2&page=2", headers=h).json()
    assert page["total"] == 3 and len(page["items"]) == 1
    assert client.get("/v1/staff/reports?status=Resolved", headers=h).json()["total"] == 0
    assert client.get("/v1/staff/reports?pageSize=500", headers=h).status_code == 422
