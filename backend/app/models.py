"""Tables for the slice. Owner components follow components.md."""
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, TypeDecorator, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class UTCDateTime(TypeDecorator):
    """Always timezone-aware UTC, also on SQLite, which drops the zone."""

    impl = DateTime(timezone=True)
    cache_ok = True

    def process_result_value(self, value, dialect):
        if value is not None and value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        return value


STATUSES = ["Submitted", "Acknowledged", "In Progress", "Resolved", "Closed-Duplicate"]
PRIORITIES = ["Low", "Medium", "High", "Urgent"]


# --- CaseWorkflow (U3) -------------------------------------------------------
class Category(Base):
    __tablename__ = "categories"
    category_code: Mapped[str] = mapped_column(String(40), primary_key=True)
    label: Mapped[str] = mapped_column(String(80))
    active: Mapped[bool] = mapped_column(Boolean, default=True)


class Report(Base):
    __tablename__ = "reports"
    tracking_id: Mapped[str] = mapped_column(String(16), primary_key=True)
    category: Mapped[str] = mapped_column(ForeignKey("categories.category_code"))
    description: Mapped[str] = mapped_column(Text)
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    contact_email: Mapped[str | None] = mapped_column(String(254), nullable=True)
    photo_id: Mapped[str | None] = mapped_column(String(40), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="Submitted")
    priority: Mapped[str] = mapped_column(String(10), default="Medium")
    disputed: Mapped[bool] = mapped_column(Boolean, default=False)
    resolution_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    duplicate_of: Mapped[str | None] = mapped_column(String(16), nullable=True)
    idempotency_key: Mapped[str] = mapped_column(String(64), unique=True)
    submitted_at: Mapped[datetime] = mapped_column(UTCDateTime(), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(UTCDateTime(), default=utcnow)

    history: Mapped[list["StatusChange"]] = relationship(
        order_by="StatusChange.sequence", cascade="all, delete-orphan"
    )
    notes: Mapped[list["InternalNote"]] = relationship(
        order_by="InternalNote.created_at", cascade="all, delete-orphan"
    )


class StatusChange(Base):
    """Append-only: no update or delete operation is exposed (ADR-002)."""

    __tablename__ = "status_changes"
    __table_args__ = (UniqueConstraint("tracking_id", "sequence"),)
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tracking_id: Mapped[str] = mapped_column(ForeignKey("reports.tracking_id"))
    sequence: Mapped[int] = mapped_column(Integer)
    from_status: Mapped[str | None] = mapped_column(String(20), nullable=True)
    to_status: Mapped[str] = mapped_column(String(20))
    reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    changed_at: Mapped[datetime] = mapped_column(UTCDateTime(), default=utcnow)
    actor_type: Mapped[str] = mapped_column(String(10))  # staff | system
    actor_staff_id: Mapped[str | None] = mapped_column(String(40), nullable=True)


class InternalNote(Base):
    __tablename__ = "internal_notes"
    note_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tracking_id: Mapped[str] = mapped_column(ForeignKey("reports.tracking_id"))
    text: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(UTCDateTime(), default=utcnow)
    author_staff_id: Mapped[str] = mapped_column(String(40))


# --- EvidenceRetention (U2) --------------------------------------------------
class Photo(Base):
    __tablename__ = "photos"
    photo_id: Mapped[str] = mapped_column(String(40), primary_key=True)
    kind: Mapped[str] = mapped_column(String(10))  # citizen | after
    content_type: Mapped[str] = mapped_column(String(40))
    size_bytes: Mapped[int] = mapped_column(Integer)
    storage_key: Mapped[str] = mapped_column(String(80))
    uploaded_at: Mapped[datetime] = mapped_column(UTCDateTime(), default=utcnow)
    attached_at: Mapped[datetime | None] = mapped_column(UTCDateTime(), nullable=True)
    deleted_at: Mapped[datetime | None] = mapped_column(UTCDateTime(), nullable=True)


# --- StaffAccess (U2) --------------------------------------------------------
class StaffAccount(Base):
    __tablename__ = "staff_accounts"
    staff_id: Mapped[str] = mapped_column(String(40), primary_key=True)
    email: Mapped[str] = mapped_column(String(254), unique=True)
    display_name: Mapped[str] = mapped_column(String(120))
    password_hash: Mapped[str] = mapped_column(String(200))
    totp_secret: Mapped[str] = mapped_column(String(64))
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(UTCDateTime(), default=utcnow)


class MfaChallenge(Base):
    __tablename__ = "mfa_challenges"
    challenge_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    staff_id: Mapped[str] = mapped_column(ForeignKey("staff_accounts.staff_id"))
    expires_at: Mapped[datetime] = mapped_column(UTCDateTime())
    used: Mapped[bool] = mapped_column(Boolean, default=False)


class StaffSession(Base):
    __tablename__ = "staff_sessions"
    token_hash: Mapped[str] = mapped_column(String(64), primary_key=True)
    staff_id: Mapped[str] = mapped_column(ForeignKey("staff_accounts.staff_id"))
    expires_at: Mapped[datetime] = mapped_column(UTCDateTime())
    signed_out: Mapped[bool] = mapped_column(Boolean, default=False)


# --- Notifications (U2): outbox written in the same transaction as the change ---
class NotificationRequest(Base):
    __tablename__ = "notification_requests"
    notification_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    event_id: Mapped[str] = mapped_column(String(40), unique=True)
    kind: Mapped[str] = mapped_column(String(20))  # acknowledgement | status-change
    tracking_id: Mapped[str] = mapped_column(String(16))
    recipient_email: Mapped[str] = mapped_column(String(254))
    payload: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(10), default="pending")  # pending | sent | failed
    attempts: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(UTCDateTime(), default=utcnow)
    # Retry and outcome (contract C7, ADR-006). Empty next_attempt_at means "due now".
    next_attempt_at: Mapped[datetime | None] = mapped_column(UTCDateTime(), nullable=True)
    provider_message_id: Mapped[str | None] = mapped_column(String(100), nullable=True)  # matches bounces later
    last_error_code: Mapped[str | None] = mapped_column(String(60), nullable=True)  # a code, never message text


# Columns added to notification_requests after the table first shipped: name -> SQL type for ALTER TABLE.
NOTIFICATION_ADDED_COLUMNS = {
    "next_attempt_at": "DATETIME",
    "provider_message_id": "VARCHAR(100)",
    "last_error_code": "VARCHAR(60)",
}
