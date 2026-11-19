"""U2 Platform services: StaffAccess, EvidenceRetention, Notifications.

Slice notes (not yet production):
  * Photos go to a local folder; the production store is private object storage.
  * Malware scanning is a pluggable hook that accepts everything here.
  * Embedded location metadata (EXIF) is NOT stripped yet; see README "Known gaps".
  * Notification sending logs the notification id and kind only (never the address).
"""
import hashlib
import hmac
import json
import logging
import os
import secrets
import uuid
from datetime import timedelta

import pyotp
from sqlalchemy import select
from sqlalchemy.orm import Session

from . import config
from .errors import ApiError
from .models import (
    MfaChallenge,
    NotificationRequest,
    Photo,
    StaffAccount,
    StaffSession,
    utcnow,
)

log = logging.getLogger("notifications")


# ---------------------------------------------------------------- EvidenceRetention
def _sniff_type(data: bytes) -> str | None:
    if data[:3] == b"\xff\xd8\xff":
        return "image/jpeg"
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return "image/png"
    if data[4:8] == b"ftyp" and data[8:12] in (b"heic", b"heix", b"mif1", b"hevc"):
        return "image/heic"
    return None


def scan_for_malware(_: bytes) -> bool:
    """Hook for the malware scanning service. True means clean."""
    return True


def store_photo(db: Session, data: bytes, declared_type: str, kind: str = "citizen") -> str:
    if declared_type not in config.ALLOWED_PHOTO_TYPES:
        raise ApiError(415, "unsupported_photo_type", "Please upload a JPEG, PNG or HEIC photo.")
    if len(data) > config.MAX_PHOTO_BYTES:
        raise ApiError(413, "photo_too_large", "The photo must be 10 MB or smaller.")
    if len(data) == 0 or _sniff_type(data) != declared_type:
        raise ApiError(415, "unsupported_photo_type", "That file does not look like the photo type it claims to be.")
    if not scan_for_malware(data):
        raise ApiError(422, "photo_rejected", "That photo could not be accepted.")
    photo_id = uuid.uuid4().hex
    storage_key = f"{photo_id}.bin"
    config.PHOTO_DIR.mkdir(parents=True, exist_ok=True)
    try:
        (config.PHOTO_DIR / storage_key).write_bytes(data)
    except OSError:
        raise ApiError(503, "storage_unavailable", "We could not store the photo right now. Please try again.")
    db.add(Photo(photo_id=photo_id, kind=kind, content_type=declared_type, size_bytes=len(data), storage_key=storage_key))
    db.flush()
    return photo_id


def attach_photo(db: Session, photo_id: str) -> None:
    """CC-3: mark a stored photo as attached so the 24-hour cleanup keeps it."""
    photo = db.get(Photo, photo_id)
    if photo is None or photo.deleted_at is not None or photo.attached_at is not None:
        raise ApiError(422, "photo_unavailable", "That photo is no longer available. Please upload it again.")
    photo.attached_at = utcnow()


def expire_unattached_photos(db: Session, older_than_hours: int = 24) -> int:
    cutoff = utcnow() - timedelta(hours=older_than_hours)
    rows = db.scalars(
        select(Photo).where(Photo.attached_at.is_(None), Photo.deleted_at.is_(None), Photo.uploaded_at < cutoff)
    ).all()
    for p in rows:
        delete_photo(db, p.photo_id)
    return len(rows)


def delete_photo(db: Session, photo_id: str) -> bool:
    photo = db.get(Photo, photo_id)
    if photo is None or photo.deleted_at is not None:
        return True  # deleting an already-deleted photo succeeds
    path = config.PHOTO_DIR / photo.storage_key
    if path.exists():
        path.unlink()
    photo.deleted_at = utcnow()
    return True


def read_photo(db: Session, photo_id: str) -> tuple[bytes, str]:
    photo = db.get(Photo, photo_id)
    if photo is None or photo.deleted_at is not None:
        raise ApiError(404, "not_found", "That photo does not exist.")
    return (config.PHOTO_DIR / photo.storage_key).read_bytes(), photo.content_type


# ------------------------------------------------------------------- StaffAccess
def hash_password(password: str) -> str:
    salt = os.urandom(16)
    digest = hashlib.scrypt(password.encode(), salt=salt, n=2**14, r=8, p=1)
    return f"scrypt${salt.hex()}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        _, salt_hex, digest_hex = stored.split("$")
        digest = hashlib.scrypt(password.encode(), salt=bytes.fromhex(salt_hex), n=2**14, r=8, p=1)
        return hmac.compare_digest(digest.hex(), digest_hex)
    except ValueError:
        return False


def _token_hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def create_staff(db: Session, email: str, display_name: str, password: str) -> tuple[StaffAccount, str]:
    secret = pyotp.random_base32()
    account = StaffAccount(
        staff_id=uuid.uuid4().hex[:12],
        email=email.lower(),
        display_name=display_name,
        password_hash=hash_password(password),
        totp_secret=secret,
    )
    db.add(account)
    db.flush()
    return account, secret


def begin_sign_in(db: Session, email: str, password: str) -> str:
    """Step one. The same answer for a wrong password, an unknown account and a deactivated one."""
    account = db.scalar(select(StaffAccount).where(StaffAccount.email == email.lower()))
    ok = account is not None and account.active and verify_password(password, account.password_hash)
    if not ok:
        raise ApiError(401, "invalid_credentials", "That email and password do not match.")
    challenge = MfaChallenge(
        challenge_id=secrets.token_urlsafe(24),
        staff_id=account.staff_id,
        expires_at=utcnow() + timedelta(minutes=config.CHALLENGE_MINUTES),
    )
    db.add(challenge)
    db.commit()
    return challenge.challenge_id


def finish_sign_in(db: Session, challenge_id: str, code: str):
    challenge = db.get(MfaChallenge, challenge_id)
    if challenge is None or challenge.used or challenge.expires_at < utcnow():
        raise ApiError(401, "invalid_code", "That code was not accepted.")
    account = db.get(StaffAccount, challenge.staff_id)
    if account is None or not account.active or not pyotp.TOTP(account.totp_secret).verify(code, valid_window=1):
        raise ApiError(401, "invalid_code", "That code was not accepted.")
    challenge.used = True
    token = secrets.token_urlsafe(32)
    expires = utcnow() + timedelta(minutes=config.SESSION_MINUTES)
    db.add(StaffSession(token_hash=_token_hash(token), staff_id=account.staff_id, expires_at=expires))
    db.commit()
    return token, expires


def resolve_session(db: Session, token: str | None) -> StaffAccount:
    """CC-2: turn a bearer token into a staff identity on every staff call."""
    if not token:
        raise ApiError(401, "not_signed_in", "Please sign in.")
    session = db.get(StaffSession, _token_hash(token))
    if session is None or session.signed_out or session.expires_at < utcnow():
        raise ApiError(401, "not_signed_in", "Please sign in again.")
    account = db.get(StaffAccount, session.staff_id)
    if account is None or not account.active:
        raise ApiError(401, "not_signed_in", "Please sign in again.")
    return account


def sign_out(db: Session, token: str) -> None:
    session = db.get(StaffSession, _token_hash(token))
    if session:
        session.signed_out = True
        db.commit()


# ------------------------------------------------------------------ Notifications
def queue_notification(db: Session, kind: str, tracking_id: str, to_status: str, email: str | None) -> None:
    """Written in the same transaction as the status change. Nothing is queued without an email (FR5.1)."""
    if not email:
        return
    payload = {
        "kind": kind,
        "trackingId": tracking_id,
        "toStatus": to_status,
        "trackingUrl": f"{config.PUBLIC_BASE_URL}/track/{tracking_id}",
    }
    db.add(
        NotificationRequest(
            event_id=uuid.uuid4().hex,
            kind=kind,
            tracking_id=tracking_id,
            recipient_email=email,
            payload=json.dumps(payload),
        )
    )


def send_pending(db: Session, max_attempts: int = 5) -> int:
    """Send queued emails. The slice logs instead of sending; the address is never logged."""
    sent = 0
    rows = db.scalars(select(NotificationRequest).where(NotificationRequest.status == "pending")).all()
    for n in rows:
        n.attempts += 1
        try:
            log.info("notification %s (%s) for report %s delivered to the email service", n.notification_id, n.kind, n.tracking_id)
            n.status = "sent"
            sent += 1
        except Exception:  # noqa: BLE001 - delivery failure must never break a status change
            n.status = "failed" if n.attempts >= max_attempts else "pending"
    db.commit()
    return sent
