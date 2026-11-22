"""U2 Notifications: the outbox of citizen emails and the sender that empties it.

* queue_notification writes a request in the same transaction as the change it reports, so a saved report or
  status change always has its email queued and an email outage can never stop the save (ADR-006). Nothing is
  queued without an email address (FR5.1). The payload carries its own data (contract C7 StatusChanged).
* send_pending sends what is due: the acknowledgement on submission (FR2.3) and every status change (FR5).
  Attempt 1 is immediate; a temporary failure is tried again after 30 s, 60 s, 120 s and 240 s (5 attempts in about
  7.5 minutes), then recorded as failed; a permanent failure is recorded at once (C7, ADR-006).
* Timing (NFR3: 99% of acknowledgements within 60 s; NFR4: 95% of status emails within 5 min): the API sends right
  after each request, and EmailSweeper runs send_pending every EMAIL_SWEEP_SECONDS (default 5) for anything left.
* A process-wide lock means the request-time send and the sweeper never send one email twice. Sent rows are never
  picked again, so a repeated eventId is ignored. One backend instance is assumed; a second needs a row lock.
* Logs name the notification ID, kind, outcome and error code only, never the address (ADR-006, NFR14).
"""
import json
import logging
import threading
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import or_, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from . import config, email_templates
from .email_sender import EmailSender, PermanentEmailError, TransientEmailError, get_sender
from .email_templates import KINDS
from .models import Category, NotificationRequest, utcnow

log = logging.getLogger("notifications")
_send_lock = threading.Lock()


# --------------------------------------------------------------------- queue
def category_label(db: Session, code: str | None) -> str | None:
    if not code:
        return None
    row = db.get(Category, code)
    if row is not None:
        return row.label
    return dict(config.CATEGORIES).get(code, code)


def queue_notification(
    db: Session,
    kind: str,
    tracking_id: str,
    to_status: str,
    email: str | None,
    *,
    category: str | None = None,
    changed_at: datetime | None = None,
) -> NotificationRequest | None:
    """Queue one email request carrying its own data (contract C7 StatusChanged payload).

    ``category`` is the category code; the payload carries its label. ``changed_at`` defaults to now.
    The recipient is stored in its own column, never in the payload.
    """
    if not email:
        return None
    if kind not in KINDS:
        raise ValueError(f"unknown email kind: {kind!r}")
    event_id = uuid.uuid4().hex
    payload = {
        "eventId": event_id,
        "kind": kind,
        "trackingId": tracking_id,
        "category": category_label(db, category),
        "toStatus": to_status,
        "changedAt": (changed_at or utcnow()).isoformat(),
        "trackingUrl": f"{config.PUBLIC_BASE_URL}/track/{tracking_id}",
    }
    request = NotificationRequest(
        event_id=event_id,
        kind=kind,
        tracking_id=tracking_id,
        recipient_email=email,
        payload=json.dumps(payload),
    )
    db.add(request)
    return request


# ---------------------------------------------------------------------- send
def retry_delay(attempts: int) -> timedelta:
    """Pause before the next attempt after ``attempts`` failed ones: 30 s x 2^(attempts - 1)."""
    return timedelta(seconds=config.EMAIL_RETRY_BASE_SECONDS * 2 ** max(attempts - 1, 0))


def _mark_failed(row: NotificationRequest, code: str) -> str:
    row.status = "failed"
    row.next_attempt_at = None
    row.last_error_code = code[:60]
    return "failed"


def _try_send(row: NotificationRequest, sender: EmailSender, now: datetime, max_attempts: int) -> str:
    """One attempt for one row. Changes the row and returns the outcome; never raises for a send failure."""
    try:
        subject, text, html = email_templates.build(row.kind, json.loads(row.payload))
    except (ValueError, TypeError):  # a broken request cannot become a good email by waiting
        row.attempts += 1
        return _mark_failed(row, "BadPayload")
    row.attempts += 1
    try:
        message_id = sender.send(row.recipient_email, subject, text, html, row.event_id, kind=row.kind)
    except PermanentEmailError as e:
        return _mark_failed(row, e.code)
    except TransientEmailError as e:
        code = e.code
    except Exception as e:  # noqa: BLE001 - an unexpected sender fault is retried, then recorded; never fatal
        code = type(e).__name__
    else:
        row.status, row.provider_message_id = "sent", message_id
        row.next_attempt_at, row.last_error_code = None, None
        return "sent"
    if row.attempts >= max_attempts:
        return _mark_failed(row, code)
    row.last_error_code = code[:60]
    row.next_attempt_at = now + retry_delay(row.attempts)
    return "retry"


def _due_ids(db: Session, now: datetime) -> list[int]:
    query = (
        select(NotificationRequest.notification_id)
        .where(
            NotificationRequest.status == "pending",
            or_(NotificationRequest.next_attempt_at.is_(None), NotificationRequest.next_attempt_at <= now),
        )
        .order_by(NotificationRequest.created_at, NotificationRequest.notification_id)
    )
    return list(db.scalars(query))


def send_pending(
    db: Session,
    max_attempts: int | None = None,
    *,
    now: datetime | None = None,
    sender: EmailSender | None = None,
) -> int:
    """Send every due pending email, oldest first, and return how many were sent.

    Each row is committed on its own, so one bad row never stops the others. ``now`` and ``sender`` can be passed
    in (tests use a fixed time); by default they are the current UTC time and the configured sender.
    """
    with _send_lock:
        moment = (now or utcnow()).astimezone(timezone.utc)
        mailer = sender or get_sender()
        limit = max_attempts or config.EMAIL_MAX_ATTEMPTS
        sent = 0
        for notification_id in _due_ids(db, moment):
            row = db.get(NotificationRequest, notification_id)
            if row is None or row.status != "pending":
                continue
            outcome = _try_send(row, mailer, moment, limit)
            try:
                db.commit()
            except SQLAlchemyError as e:  # the error text can hold row values, so only its type is logged
                db.rollback()
                log.error("notification %s (%s): could not record the outcome: %s", notification_id, row.kind, type(e).__name__)
                continue
            sent += outcome == "sent"
            log.info(
                "notification %s (%s): %s%s", notification_id, row.kind, outcome,
                f" [{row.last_error_code}]" if row.last_error_code else "",
            )
        return sent


def send_due_safely(session_factory) -> int:
    """One send pass in its own session that never raises: used right after an API request (it shortens the delay
    towards NFR3) and by EmailSweeper. A failure is logged by type only and never changes an API answer."""
    try:
        with session_factory() as db:
            return send_pending(db)
    except Exception as e:  # noqa: BLE001 - email must never break a save (ADR-006); the text may hold row values
        log.error("email send pass failed: %s", type(e).__name__)
        return 0


class EmailSweeper:
    """Runs send_pending in a worker thread every ``interval`` seconds until stopped. A failed pass is logged and
    the loop goes on. Started and stopped by the app lifespan in main.py."""

    def __init__(self, interval: float, session_factory):
        if interval <= 0:
            raise ValueError("interval must be greater than 0")
        self.interval = interval
        self.session_factory = session_factory
        self._stop = threading.Event()
        self._thread: threading.Thread | None = None

    def run_once(self) -> int:
        return send_due_safely(self.session_factory)

    def _run(self) -> None:
        while not self._stop.is_set():
            self.run_once()
            self._stop.wait(self.interval)

    def start(self) -> None:
        self._stop.clear()
        self._thread = threading.Thread(target=self._run, name="email-sweeper", daemon=True)
        self._thread.start()

    def stop(self, timeout: float = 10.0) -> None:
        self._stop.set()
        if self._thread is not None:
            self._thread.join(timeout)
            self._thread = None
