"""U4 Public-side backend: ReportIntake and CitizenAccess (contract C1)."""
import re

from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, Header, Request, Response, UploadFile
from sqlalchemy.orm import Session

from . import case_workflow as cw, config, platform_services as platform, ratelimit
from .db import SessionLocal, get_db
from .errors import ApiError
from .models import Report

router = APIRouter(prefix="/v1")

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _send_in_background() -> None:
    db = SessionLocal()
    try:
        platform.send_pending(db)
    finally:
        db.close()


def tracking_view(report: Report) -> dict:
    """The public answer: exact pin yes; photo and email never (NFR7.1)."""
    return {
        "trackingId": report.tracking_id,
        "category": report.category,
        "submittedAt": report.submitted_at.isoformat(),
        "status": report.status,
        "disputed": report.disputed,
        "history": [{"status": h.to_status, "changedAt": h.changed_at.isoformat()} for h in report.history],
        "description": report.description,
        "location": {"latitude": report.latitude, "longitude": report.longitude},
        "resolutionNote": report.resolution_note,
    }


@router.get("/categories")
def categories(db: Session = Depends(get_db)):
    return [{"categoryCode": c.category_code, "label": c.label} for c in cw.list_categories(db)]


@router.post("/reports", status_code=201)
async def submit_report(
    request: Request,
    background: BackgroundTasks,
    category: str = Form(...),
    description: str = Form(..., min_length=1, max_length=2000),
    latitude: float = Form(..., ge=-90, le=90),
    longitude: float = Form(..., ge=-180, le=180),
    email: str | None = Form(None),
    photo: UploadFile = File(...),
    idempotency_key: str = Header(..., alias="Idempotency-Key", min_length=16, max_length=64),
    db: Session = Depends(get_db),
):
    ratelimit.check("submit", ratelimit.client_key_hash(request), config.SUBMIT_LIMIT)
    email = (email or "").strip() or None
    if email and (len(email) > 254 or not EMAIL_RE.match(email)):
        raise ApiError(422, "invalid_email", "That email address does not look right.", [{"field": "email", "message": "Invalid email"}])
    if not description.strip():
        raise ApiError(422, "description_required", "Please describe the problem.", [{"field": "description", "message": "Required"}])
    south, west, north, east = config.SERVICE_AREA
    if not (south <= latitude <= north and west <= longitude <= east):
        raise ApiError(
            422,
            "outside_service_area",
            "For now we can only take reports inside the Dhaka area.",
            [{"field": "latitude", "message": "Outside the Dhaka area"}, {"field": "longitude", "message": "Outside the Dhaka area"}],
        )

    # A repeated key replays the original result and stores nothing new.
    from sqlalchemy import select

    existing = db.scalar(select(Report).where(Report.idempotency_key == idempotency_key))
    if existing is None:
        # Photo first: if it fails a check, no report is created.
        data = await photo.read(config.MAX_PHOTO_BYTES + 1)
        photo_id = platform.store_photo(db, data, photo.content_type or "")
        db.commit()
        report = cw.open_report(
            db,
            category=category,
            description=description.strip(),
            latitude=latitude,
            longitude=longitude,
            contact_email=email,
            photo_id=photo_id,
            idempotency_key=idempotency_key,
        )
    else:
        report = existing
    background.add_task(_send_in_background)
    return {
        "trackingId": report.tracking_id,
        "submittedAt": report.submitted_at.isoformat(),
        "confirmationText": "Thank you. Your report has been received. Keep your Tracking ID to check progress.",
        "emailNotice": "acknowledgement-will-be-sent" if report.contact_email else "no-email-no-notifications",
    }


@router.get("/reports/{tracking_id}")
def get_tracking_view(tracking_id: str, request: Request, db: Session = Depends(get_db)):
    ratelimit.check("lookup", ratelimit.client_key_hash(request), config.LOOKUP_LIMIT)
    report = cw.get_report(db, tracking_id)
    if report is None:  # unknown and malformed IDs give the same answer (NFR16.1)
        raise ApiError(404, "not_found", "We could not find a report with that Tracking ID.")
    return tracking_view(report)


@router.post("/reports/{tracking_id}/dispute", status_code=204)
def dispute(tracking_id: str, request: Request, db: Session = Depends(get_db)):
    ratelimit.check("lookup", ratelimit.client_key_hash(request), config.LOOKUP_LIMIT)  # shared limit (NFR16.3)
    report = cw.get_report(db, tracking_id)
    if report is None:
        raise ApiError(404, "not_found", "We could not find a report with that Tracking ID.")
    cw.record_dispute(db, report)
    return Response(status_code=204)
