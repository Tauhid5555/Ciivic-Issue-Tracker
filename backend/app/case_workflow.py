"""U3 CaseWorkflow: the system of record for reports and every rule about them."""
import secrets

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from . import config, platform_services as platform
from .errors import ApiError
from .models import (
    PRIORITIES,
    STATUSES,
    Category,
    InternalNote,
    Report,
    StatusChange,
    utcnow,
)


def new_tracking_id() -> str:
    return "".join(secrets.choice(config.TRACKING_ID_ALPHABET) for _ in range(config.TRACKING_ID_LENGTH))


def seed_categories(db: Session) -> None:
    for code, label in config.CATEGORIES:
        if db.get(Category, code) is None:
            db.add(Category(category_code=code, label=label))
    db.commit()


def list_categories(db: Session) -> list[Category]:
    return list(db.scalars(select(Category).where(Category.active.is_(True)).order_by(Category.label)))


def _append_history(db: Session, report: Report, to_status: str, reason: str | None, actor_type: str, staff_id: str | None):
    last = db.scalar(select(func.max(StatusChange.sequence)).where(StatusChange.tracking_id == report.tracking_id)) or 0
    db.add(
        StatusChange(
            tracking_id=report.tracking_id,
            sequence=last + 1,
            from_status=report.status if last else None,
            to_status=to_status,
            reason=reason,
            actor_type=actor_type,
            actor_staff_id=staff_id,
        )
    )


def open_report(
    db: Session,
    *,
    category: str,
    description: str,
    latitude: float,
    longitude: float,
    contact_email: str | None,
    photo_id: str,
    idempotency_key: str,
) -> Report:
    """Create the report and its first history entry in one transaction.
    A repeated key returns the original report (no second report)."""
    existing = db.scalar(select(Report).where(Report.idempotency_key == idempotency_key))
    if existing:
        return existing
    cat = db.get(Category, category)
    if cat is None or not cat.active:
        raise ApiError(422, "unknown_category", "Please choose one of the listed categories.", [{"field": "category", "message": "Unknown category"}])
    platform.attach_photo(db, photo_id)
    report = Report(
        tracking_id=new_tracking_id(),
        category=category,
        description=description,
        latitude=latitude,
        longitude=longitude,
        contact_email=contact_email or None,
        photo_id=photo_id,
        idempotency_key=idempotency_key,
    )
    db.add(report)
    db.flush()
    _append_history(db, report, "Submitted", None, "system", None)
    platform.queue_notification(db, "acknowledgement", report.tracking_id, "Submitted", report.contact_email)
    try:
        db.commit()
    except IntegrityError:  # two requests with the same key at once
        db.rollback()
        winner = db.scalar(select(Report).where(Report.idempotency_key == idempotency_key))
        if winner:
            return winner
        raise
    return report


def get_report(db: Session, tracking_id: str) -> Report | None:
    return db.get(Report, tracking_id.upper()) if tracking_id else None


def change_status(
    db: Session,
    report: Report,
    to_status: str,
    *,
    staff_id: str,
    reason: str | None = None,
    resolution_note: str | None = None,
    duplicate_of: str | None = None,
) -> Report:
    """FR11 rules. Forward is one step; backward needs a reason; Resolved needs a note;
    Closed-Duplicate needs the original report. History is saved in the same transaction."""
    if to_status not in STATUSES:
        raise ApiError(422, "unknown_status", "That is not a status.", [{"field": "toStatus", "message": "Unknown status"}])
    current = report.status
    if to_status == current:
        raise ApiError(409, "no_change", "The report already has that status.")
    if to_status == "Closed-Duplicate":
        if not duplicate_of or db.get(Report, duplicate_of.upper()) is None or duplicate_of.upper() == report.tracking_id:
            raise ApiError(422, "duplicate_link_required", "Link the original report.", [{"field": "duplicateOfTrackingId", "message": "Enter an existing Tracking ID"}])
        report.duplicate_of = duplicate_of.upper()
    elif current == "Closed-Duplicate":
        raise ApiError(409, "move_not_allowed", "A duplicate report cannot be moved to another status.")
    else:
        i, j = STATUSES.index(current), STATUSES.index(to_status)
        if j > i + 1:
            raise ApiError(409, "move_not_allowed", "Reports move forward one step at a time.")
        if j < i and not (reason and reason.strip()):
            raise ApiError(422, "reason_required", "A reason is needed to move a report back.", [{"field": "reason", "message": "Required"}])
        if to_status == "Resolved":
            if not (resolution_note and resolution_note.strip()):
                raise ApiError(422, "resolution_note_required", "Add a resolution note before resolving.", [{"field": "resolutionNote", "message": "Required"}])
            report.resolution_note = resolution_note.strip()
            report.disputed = False  # re-resolving clears a dispute (ADR-003)
        if j < i:
            report.disputed = False  # reopening clears a dispute
    _append_history(db, report, to_status, reason, "staff", staff_id)
    report.status = to_status
    report.updated_at = utcnow()
    platform.queue_notification(
        db, "acknowledgement" if to_status == "Acknowledged" else "status-change",
        report.tracking_id, to_status, report.contact_email,
    )
    db.commit()
    return report


def set_priority(db: Session, report: Report, priority: str) -> Report:
    if priority not in PRIORITIES:
        raise ApiError(422, "unknown_priority", "Choose Low, Medium, High or Urgent.", [{"field": "priority", "message": "Unknown priority"}])
    report.priority = priority
    report.updated_at = utcnow()
    db.commit()
    return report


def add_note(db: Session, report: Report, text: str, staff_id: str) -> InternalNote:
    note = InternalNote(tracking_id=report.tracking_id, text=text, author_staff_id=staff_id)
    db.add(note)
    report.updated_at = utcnow()
    db.commit()
    return note


def record_dispute(db: Session, report: Report) -> None:
    if report.status != "Resolved":
        raise ApiError(409, "not_resolved", "Only a resolved report can be marked Not Resolved.")
    report.disputed = True
    report.updated_at = utcnow()
    db.commit()


QUEUE_SORTS = {
    "submittedAt": Report.submitted_at,
    "updatedAt": Report.updated_at,
    "category": Report.category,
}


def queue(
    db: Session,
    *,
    statuses: list[str] | None,
    categories: list[str] | None,
    disputed: bool | None,
    sort: str,
    page: int,
    page_size: int,
):
    q = select(Report)
    if statuses:
        q = q.where(Report.status.in_(statuses))
    if categories:
        q = q.where(Report.category.in_(categories))
    if disputed is not None:
        q = q.where(Report.disputed.is_(disputed))
    total = db.scalar(select(func.count()).select_from(q.subquery())) or 0
    if sort == "priority":
        order = {p: i for i, p in enumerate(reversed(PRIORITIES))}
        rows = sorted(db.scalars(q).all(), key=lambda r: (order.get(r.priority, 9), r.submitted_at))
        rows = rows[(page - 1) * page_size : page * page_size]
    else:
        col = QUEUE_SORTS.get(sort, Report.submitted_at)
        # oldest first by default so Submitted reports are not forgotten (FR7.1)
        rows = db.scalars(q.order_by(col.asc()).offset((page - 1) * page_size).limit(page_size)).all()
    return rows, total
