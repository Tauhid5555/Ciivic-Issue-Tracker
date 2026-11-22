"""Bolt 7, real email (U2 Notifications): data model, content, sender, sending and retry, API flow.

Real SES is never called: moto and botocore's Stubber stand in for it, and conftest.py sets EMAIL_BACKEND=log
and EMAIL_SWEEP_SECONDS=0 so the background sender never runs during tests.
"""
import json
import logging
import threading
import time
from datetime import datetime, timedelta, timezone

import boto3
import pytest
from botocore.exceptions import EndpointConnectionError
from botocore.stub import Stubber
from moto import mock_aws
from moto.core import DEFAULT_ACCOUNT_ID
from moto.ses.models import ses_backends
from sqlalchemy import create_engine, inspect, select, text

from app import config, email_sender, email_templates, notifications
from app.db import SessionLocal, engine
from app.email_sender import EmailConfigError, LogSender, PermanentEmailError, SesSender, TransientEmailError
from app.main import ensure_notification_columns
from app.models import NOTIFICATION_ADDED_COLUMNS, NotificationRequest

from conftest import sign_in, submit

CITIZEN = "citizen@example.org"
SENDER = "noreply@example.org"
DESCRIPTION = "Deep hole outside the school"  # what conftest.submit sends
REGION = "ap-south-1"


@pytest.fixture()
def aws_env(monkeypatch):
    """Fake credentials so nothing can reach a real AWS account."""
    for name, value in {
        "AWS_ACCESS_KEY_ID": "testing",
        "AWS_SECRET_ACCESS_KEY": "testing",
        "AWS_SESSION_TOKEN": "testing",
        "AWS_DEFAULT_REGION": REGION,
    }.items():
        monkeypatch.setenv(name, value)


def stubbed_sender() -> tuple[SesSender, Stubber]:
    sender = SesSender(SENDER, REGION, client=boto3.client("sesv2", region_name=REGION))
    return sender, Stubber(sender.client)


def send_one(sender) -> str:
    return sender.send(CITIZEN, "Subject", "text", "<p>html</p>", "event-1", kind="acknowledgement")


NOW = datetime(2026, 11, 22, 8, 0, 0, tzinfo=timezone.utc)


class FakeSender:
    """Stands in for SES. ``failures`` is a list of exceptions raised by the first calls, in order."""

    def __init__(self, failures=(), pause=0.0):
        self.failures = list(failures)
        self.pause = pause
        self.sent: list[str] = []  # event IDs, in order
        self.calls = 0
        self._lock = threading.Lock()

    def send(self, to, subject, text, html, event_id, *, kind=None):
        with self._lock:
            self.calls += 1
            failure = self.failures.pop(0) if self.failures else None
        time.sleep(self.pause)
        if failure is not None:
            raise failure
        with self._lock:
            self.sent.append(event_id)
        return f"msg-{event_id}"


def queue_rows(count=1, email=CITIZEN) -> list[str]:
    """Queue ``count`` acknowledgement requests and return their event IDs."""
    with SessionLocal() as db:
        made = [
            notifications.queue_notification(db, "acknowledgement", f"TRACK{i:05d}", "Submitted", email, category="pothole")
            for i in range(count)
        ]
        db.commit()
        return [r.event_id for r in made]


def send(sender, now=NOW) -> int:
    with SessionLocal() as db:
        return notifications.send_pending(db, now=now, sender=sender)


def payload(**over) -> dict:
    """A C7 StatusChanged payload, as queue_notification writes it."""
    base = {
        "eventId": "e" * 32,
        "kind": "acknowledgement",
        "trackingId": "ABCD234567",
        "category": "Pothole",
        "toStatus": "Submitted",
        "changedAt": "2026-11-22T08:05:00+00:00",
        "trackingUrl": "http://localhost:5173/track/ABCD234567",
    }
    base.update(over)
    return base


def rows() -> list[NotificationRequest]:
    with SessionLocal() as db:
        return list(db.scalars(select(NotificationRequest).order_by(NotificationRequest.notification_id)))


# ------------------------------------------------------------------ data model
def test_fresh_database_has_the_new_notification_columns(client):
    names = {c["name"] for c in inspect(engine).get_columns("notification_requests")}
    assert set(NOTIFICATION_ADDED_COLUMNS) <= names
    assert ensure_notification_columns(engine) == []  # nothing to add on a fresh database


def test_startup_step_adds_missing_columns_to_an_old_table_and_is_safe_twice(tmp_path):
    old = create_engine(f"sqlite:///{tmp_path / 'old.db'}")
    with old.begin() as conn:  # the table as it shipped before Bolt 7
        conn.execute(text(
            "CREATE TABLE notification_requests (notification_id INTEGER PRIMARY KEY, event_id VARCHAR(40), "
            "kind VARCHAR(20), tracking_id VARCHAR(16), recipient_email VARCHAR(254), payload TEXT, "
            "status VARCHAR(10), attempts INTEGER, created_at DATETIME)"
        ))
        conn.execute(text(
            "INSERT INTO notification_requests VALUES (1, 'e1', 'acknowledgement', 'T1', 'x@example.org', '{}', "
            "'pending', 0, '2026-01-01 00:00:00')"
        ))
    assert sorted(ensure_notification_columns(old)) == sorted(NOTIFICATION_ADDED_COLUMNS)
    assert ensure_notification_columns(old) == []  # second run changes nothing
    names = {c["name"] for c in inspect(old).get_columns("notification_requests")}
    assert set(NOTIFICATION_ADDED_COLUMNS) <= names
    with old.connect() as conn:  # the existing row survives with the new columns empty
        row = conn.execute(text("SELECT event_id, next_attempt_at, last_error_code FROM notification_requests")).one()
    assert tuple(row) == ("e1", None, None)
    old.dispose()


# --------------------------------------------------------------- email content
def test_acknowledgement_email_holds_id_category_dhaka_time_and_link():
    subject, body, html = email_templates.build("acknowledgement", payload())
    assert "ABCD234567" in subject
    for part in (body, html):
        assert "ABCD234567" in part and "Pothole" in part
        assert "22 Nov 2026, 14:05 (Dhaka time)" in part  # 08:05 UTC is 14:05 in Dhaka
        assert "http://localhost:5173/track/ABCD234567" in part


def test_status_change_email_holds_id_new_status_dhaka_time_and_link():
    p = payload(kind="status-change", toStatus="In Progress", changedAt="2026-11-22T20:30:00+00:00")
    subject, body, html = email_templates.build("status-change", p)
    assert subject == "Your report ABCD234567 is now In Progress"
    for part in (body, html):
        assert "In Progress" in part and "ABCD234567" in part
        assert "23 Nov 2026, 02:30 (Dhaka time)" in part  # crosses midnight in Dhaka
        assert "http://localhost:5173/track/ABCD234567" in part


def test_values_are_escaped_in_the_html_part():
    _, body, html = email_templates.build("acknowledgement", payload(category="<script>alert(1)</script>"))
    assert "<script>" not in html and "&lt;script&gt;" in html
    assert "<script>alert(1)</script>" in body  # plain text is not HTML, so it is shown as typed


def test_emails_never_carry_the_recipient_address_or_the_description():
    p = payload(recipientEmail=CITIZEN, description=DESCRIPTION)  # even if a caller adds them to the payload
    for kind in email_templates.KINDS:
        for part in email_templates.build(kind, {**p, "kind": kind}):
            assert CITIZEN not in part and DESCRIPTION not in part


def test_unknown_kind_or_bad_payload_raises_instead_of_sending():
    with pytest.raises(ValueError, match="unknown email kind"):
        email_templates.build("reminder", payload())
    with pytest.raises(ValueError, match="missing trackingId"):
        email_templates.build("acknowledgement", payload(trackingId=""))
    with pytest.raises(ValueError, match="http"):
        email_templates.build("status-change", payload(trackingUrl="javascript:alert(1)"))


def test_opening_queues_acknowledgement_and_a_move_to_acknowledged_queues_status_change(client, staff):
    tid = submit(client, email=CITIZEN).json()["trackingId"]
    client.post(f"/v1/staff/reports/{tid}/acknowledge", headers=sign_in(client, staff["secret"]))
    first, second = rows()
    assert (first.kind, second.kind) == ("acknowledgement", "status-change")
    ack, change = json.loads(first.payload), json.loads(second.payload)
    assert ack["category"] == "Pothole" and ack["toStatus"] == "Submitted" and ack["eventId"] == first.event_id
    assert change["toStatus"] == "Acknowledged" and change["changedAt"]
    assert CITIZEN not in first.payload  # the address lives only in its own column


# ---------------------------------------------------------------------- sender
def test_ses_sender_sends_through_ses_and_returns_the_message_id(aws_env):
    with mock_aws():
        boto3.client("ses", region_name=REGION).verify_email_identity(EmailAddress=SENDER)
        sender = SesSender(SENDER, REGION)  # created inside the mock so moto hooks its client
        message_id = sender.send(CITIZEN, "We received your report ABCD234567", "text", "<p>html</p>", "event-1")
        sent = ses_backends[DEFAULT_ACCOUNT_ID][REGION].sent_messages
        assert len(sent) == 1
        assert sent[0].destinations["ToAddresses"] == [CITIZEN]
        assert sent[0].subject == "We received your report ABCD234567"
        assert message_id == sent[0].id


def test_ses_sender_with_an_unverified_sender_raises_permanent(aws_env):
    with mock_aws():
        sender = SesSender("unverified@example.org", REGION)
        with pytest.raises(PermanentEmailError) as caught:
            send_one(sender)
    assert caught.value.code == "MessageRejected"
    assert "@" not in str(caught.value)  # the botocore text, which names the address, is not kept


def test_ses_throttling_becomes_transient(aws_env):
    sender, stub = stubbed_sender()
    stub.add_client_error("send_email", service_error_code="TooManyRequestsException", http_status_code=429)
    with stub, pytest.raises(TransientEmailError) as caught:
        send_one(sender)
    assert caught.value.code == "TooManyRequestsException"
    stub.assert_no_pending_responses()


def test_ses_rejected_message_becomes_permanent_and_5xx_becomes_transient(aws_env):
    sender, stub = stubbed_sender()
    stub.add_client_error("send_email", service_error_code="MessageRejected", http_status_code=400)
    stub.add_client_error("send_email", service_error_code="InternalServerError", http_status_code=503)
    with stub:
        with pytest.raises(PermanentEmailError, match="MessageRejected"):
            send_one(sender)
        with pytest.raises(TransientEmailError, match="InternalServerError"):
            send_one(sender)


def test_network_error_becomes_transient(aws_env, monkeypatch):
    sender, _ = stubbed_sender()

    def unreachable(**_):
        raise EndpointConnectionError(endpoint_url=f"https://email.{REGION}.amazonaws.com")

    monkeypatch.setattr(sender.client, "send_email", unreachable)
    with pytest.raises(TransientEmailError, match="EndpointConnectionError"):
        send_one(sender)


def test_get_sender_defaults_to_log_and_refuses_bad_settings(monkeypatch):
    email_sender._build_sender.cache_clear()
    assert isinstance(email_sender.get_sender(), LogSender)
    monkeypatch.setattr(config, "EMAIL_BACKEND", "ses")
    monkeypatch.setattr(config, "EMAIL_FROM", "")
    with pytest.raises(EmailConfigError, match="EMAIL_FROM"):
        email_sender.get_sender()
    monkeypatch.setattr(config, "EMAIL_BACKEND", "carrier-pigeon")
    with pytest.raises(EmailConfigError, match="EMAIL_BACKEND"):
        email_sender.get_sender()


def test_log_sender_writes_no_email_address_to_the_log(caplog):
    caplog.set_level(logging.DEBUG)
    message_id = send_one(LogSender())
    assert message_id == "log-event-1"
    assert "event-1" in caplog.text and "acknowledgement" in caplog.text
    assert CITIZEN not in caplog.text and "@" not in caplog.text
    with pytest.raises(PermanentEmailError, match="InvalidRecipient"):  # bad input is refused at the boundary
        LogSender().send("not-an-address", "s", "t", "h", "event-2")


# ---------------------------------------------------------- sending and retry
def test_due_pending_row_is_sent_and_marked_with_its_message_id(client):
    (event_id,) = queue_rows()
    sweeper = notifications.EmailSweeper(5, SessionLocal)  # one pass of the background sender, default log sender
    assert sweeper.run_once() == 1
    (row,) = rows()
    assert (row.status, row.attempts, row.provider_message_id) == ("sent", 1, f"log-{event_id}")
    assert row.next_attempt_at is None and row.last_error_code is None
    assert sweeper.run_once() == 0  # a sent row is never sent again (repeated eventId ignored)


def test_transient_failure_waits_30_seconds_and_is_skipped_until_then(client):
    queue_rows()
    sender = FakeSender([TransientEmailError("TooManyRequestsException")])
    assert send(sender) == 0
    (row,) = rows()
    assert (row.status, row.attempts, row.last_error_code) == ("pending", 1, "TooManyRequestsException")
    assert row.next_attempt_at == NOW + timedelta(seconds=30)
    assert send(sender, NOW + timedelta(seconds=29)) == 0 and sender.calls == 1  # not due yet: not tried
    assert send(sender, NOW + timedelta(seconds=30)) == 1 and sender.calls == 2
    assert rows()[0].status == "sent"


def test_five_transient_failures_mark_the_row_failed_with_growing_pauses(client):
    queue_rows()
    sender = FakeSender([TransientEmailError("SendingPausedException")] * 4 + [TransientEmailError("EndpointConnectionError")])
    now, pauses = NOW, []
    for _ in range(5):
        send(sender, now)
        row = rows()[0]
        if row.next_attempt_at:
            pauses.append((row.next_attempt_at - now).total_seconds())
            now = row.next_attempt_at
    assert pauses == [30, 60, 120, 240]  # about 7.5 minutes in all
    assert (row.status, row.attempts, row.last_error_code, row.next_attempt_at) == ("failed", 5, "EndpointConnectionError", None)
    assert send(sender, now + timedelta(hours=1)) == 0 and sender.calls == 5  # failed rows are left alone


def test_permanent_failure_marks_the_row_failed_after_one_attempt(client):
    queue_rows()
    sender = FakeSender([PermanentEmailError("MessageRejected")])
    assert send(sender) == 0
    (row,) = rows()
    assert (row.status, row.attempts, row.last_error_code) == ("failed", 1, "MessageRejected")
    assert send(sender, NOW + timedelta(hours=1)) == 0 and sender.calls == 1


def test_one_failing_row_does_not_stop_the_next_from_sending(client):
    first, second, third = queue_rows(3)
    with SessionLocal() as db:  # a broken request: it is recorded as failed, not retried forever
        broken = db.scalar(select(NotificationRequest).where(NotificationRequest.event_id == third))
        broken.payload = "{not json"
        db.commit()
    sender = FakeSender([RuntimeError("unexpected fault in a sender")])
    assert send(sender) == 1
    by_event = {r.event_id: r for r in rows()}
    assert (by_event[first].status, by_event[first].last_error_code) == ("pending", "RuntimeError")
    assert by_event[second].status == "sent" and sender.sent == [second]
    assert (by_event[third].status, by_event[third].last_error_code) == ("failed", "BadPayload")


def test_request_time_send_and_background_loop_together_send_each_row_once(client, monkeypatch):
    event_ids = queue_rows(4)
    sender = FakeSender(pause=0.02)
    monkeypatch.setattr(notifications, "get_sender", lambda: sender)
    sweeper = notifications.EmailSweeper(0.01, SessionLocal)
    sweeper.start()
    workers = [threading.Thread(target=lambda: send(None, None)) for _ in range(2)]  # request-time sends
    for w in workers:
        w.start()
    for w in workers:
        w.join(10)
    deadline = time.monotonic() + 5
    while len(sender.sent) < 4 and time.monotonic() < deadline:
        time.sleep(0.01)
    sweeper.stop()
    assert sorted(sender.sent) == sorted(event_ids)  # each row exactly once
    assert all(r.status == "sent" for r in rows())


def test_a_full_send_and_retry_cycle_logs_no_email_address(client, caplog):
    caplog.set_level(logging.DEBUG)
    queue_rows(2)

    class FlakyLogSender(LogSender):
        failed = False

        def send(self, to, *args, **kwargs):
            if not self.failed:
                self.failed = True
                raise TransientEmailError("TooManyRequestsException")
            return super().send(to, *args, **kwargs)

    sender = FlakyLogSender()
    send(sender)
    send(sender, NOW + timedelta(minutes=1))
    assert [r.status for r in rows()] == ["sent", "sent"]
    assert "retry [TooManyRequestsException]" in caplog.text and "sent" in caplog.text
    assert CITIZEN not in caplog.text and "@" not in caplog.text


# -------------------------------------------------------------------- API flow
def test_submitting_with_an_email_sends_one_acknowledgement(client):
    r = submit(client, email=CITIZEN)
    assert r.status_code == 201 and r.json()["emailNotice"] == "acknowledgement-will-be-sent"
    (row,) = rows()
    assert (row.kind, row.tracking_id, row.status) == ("acknowledgement", r.json()["trackingId"], "sent")
    assert row.provider_message_id == f"log-{row.event_id}"  # the background send ran after the answer


def test_submitting_without_an_email_queues_nothing(client):
    r = submit(client)
    assert r.status_code == 201 and r.json()["emailNotice"] == "no-email-no-notifications"
    assert rows() == []


def test_an_email_outage_never_stops_a_report_from_saving(client, monkeypatch):
    monkeypatch.setattr(notifications, "get_sender", lambda: FakeSender([TransientEmailError("ServiceUnavailable")] * 99))
    r = submit(client, key="a" * 16, email=CITIZEN)
    assert r.status_code == 201
    assert client.get(f"/v1/reports/{r.json()['trackingId']}").status_code == 200
    (row,) = rows()
    assert (row.status, row.attempts, row.last_error_code) == ("pending", 1, "ServiceUnavailable")  # retried later

    def broken_settings():
        raise EmailConfigError("settings broke after startup")

    monkeypatch.setattr(notifications, "get_sender", broken_settings)
    assert submit(client, key="b" * 16, email=CITIZEN).status_code == 201  # even a failed send pass is harmless


def test_staff_status_change_queues_status_change_only_for_reports_with_an_email(client, staff):
    with_email = submit(client, key="c" * 16, email=CITIZEN).json()["trackingId"]
    without = submit(client, key="d" * 16).json()["trackingId"]
    headers = sign_in(client, staff["secret"])
    for tid in (with_email, without):
        r = client.post(f"/v1/staff/reports/{tid}/status", json={"toStatus": "Acknowledged"}, headers=headers)
        assert r.status_code == 200, r.text
    changes = [r for r in rows() if r.kind == "status-change"]
    assert [(r.tracking_id, r.status) for r in changes] == [(with_email, "sent")]
    assert json.loads(changes[0].payload)["toStatus"] == "Acknowledged"
