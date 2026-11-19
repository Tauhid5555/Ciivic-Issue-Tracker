import os
import tempfile
from pathlib import Path

_tmp = tempfile.mkdtemp(prefix="civic-test-")
os.environ["DATABASE_URL"] = f"sqlite:///{Path(_tmp) / 'test.db'}"
os.environ["PHOTO_DIR"] = str(Path(_tmp) / "photos")

import pyotp  # noqa: E402
import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app import ratelimit  # noqa: E402
from app.db import Base, SessionLocal, engine  # noqa: E402
from app.main import app  # noqa: E402
from app.platform_services import create_staff  # noqa: E402

import io  # noqa: E402

from PIL import Image  # noqa: E402


def make_jpeg(width=16, height=8, exif=None) -> bytes:
    out = io.BytesIO()
    kwargs = {"exif": exif} if exif is not None else {}
    Image.new("RGB", (width, height), (30, 120, 60)).save(out, format="JPEG", **kwargs)
    return out.getvalue()


JPEG = make_jpeg()
PASSWORD = "correct-horse-battery"


@pytest.fixture()
def client():
    Base.metadata.drop_all(engine)
    ratelimit.reset()
    with TestClient(app) as c:  # runs startup: creates tables and categories
        yield c


@pytest.fixture()
def staff(client):
    with SessionLocal() as db:
        account, secret = create_staff(db, "staff@example.org", "Sam Staff", PASSWORD)
        db.commit()
        return {"id": account.staff_id, "secret": secret}


def sign_in(client, secret, email="staff@example.org", password=PASSWORD):
    r = client.post("/v1/staff/sign-in", json={"email": email, "password": password})
    assert r.status_code == 200, r.text
    r = client.post(
        "/v1/staff/sign-in/second-factor",
        json={"challengeId": r.json()["challengeId"], "code": pyotp.TOTP(secret).now()},
    )
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['accessToken']}"}


def submit(client, key="k" * 16, email=None, photo=JPEG, content_type="image/jpeg", **over):
    data = {"category": "pothole", "description": "Deep hole outside the school", "latitude": "51.5", "longitude": "-0.12"}
    if email:
        data["email"] = email
    data.update(over)
    return client.post(
        "/v1/reports",
        data=data,
        files={"photo": ("p.jpg", photo, content_type)},
        headers={"Idempotency-Key": key},
    )
