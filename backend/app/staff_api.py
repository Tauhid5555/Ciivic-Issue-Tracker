"""Staff surface: sign-in (contract C3) and case actions (contract C2)."""
from typing import Annotated, Literal

from fastapi import APIRouter, BackgroundTasks, Depends, Header, Query, Request, Response
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from . import case_workflow as cw, config, platform_services as platform, ratelimit
from .db import SessionLocal, get_db
from .errors import ApiError
from .models import PRIORITIES, STATUSES, Report, StaffAccount

router = APIRouter(prefix="/v1/staff")


def bearer(authorization: Annotated[str | None, Header()] = None) -> str | None:
    if authorization and authorization.lower().startswith("bearer "):
        return authorization[7:].strip()
    return None


def current_staff(token: Annotated[str | None, Depends(bearer)], db: Session = Depends(get_db)) -> StaffAccount:
    return platform.resolve_session(db, token)


Staff = Annotated[StaffAccount, Depends(current_staff)]


def _send_in_background() -> None:
    db = SessionLocal()
    try:
        platform.send_pending(db)
    finally:
        db.close()


# ----------------------------------------------------------------- C3 sign-in
class SignIn(BaseModel):
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=1, max_length=200)


class SecondFactor(BaseModel):
    challengeId: str
    code: str = Field(min_length=6, max_length=6)


@router.post("/sign-in")
def sign_in(body: SignIn, request: Request, db: Session = Depends(get_db)):
    ratelimit.check("sign-in", ratelimit.client_key_hash(request), config.SIGN_IN_LIMIT)
    return {"challengeId": platform.begin_sign_in(db, body.email, body.password)}


@router.post("/sign-in/second-factor")
def second_factor(body: SecondFactor, request: Request, db: Session = Depends(get_db)):
    ratelimit.check("sign-in", ratelimit.client_key_hash(request), config.SIGN_IN_LIMIT)
    token, expires = platform.finish_sign_in(db, body.challengeId, body.code)
    return {"accessToken": token, "expiresAt": expires.isoformat()}


@router.post("/sign-out", status_code=204)
def sign_out(token: Annotated[str | None, Depends(bearer)], db: Session = Depends(get_db)):
    if token:
        platform.sign_out(db, token)
    return Response(status_code=204)


@router.get("/me")
def me(staff: Staff):
    return {"staffId": staff.staff_id, "displayName": staff.display_name, "email": staff.email}


# ------------------------------------------------------------------- C2 queue
def _row(r: Report) -> dict:
    return {
        "trackingId": r.tracking_id,
        "category": r.category,
        "status": r.status,
        "priority": r.priority,
        "disputed": r.disputed,
        "submittedAt": r.submitted_at.isoformat(),
        "updatedAt": r.updated_at.isoformat(),
    }


def _detail(r: Report) -> dict:
    return {
        **_row(r),
        "description": r.description,
        "location": {"latitude": r.latitude, "longitude": r.longitude},
        "zone": None,
        "contactEmail": r.contact_email,
        "resolutionNote": r.resolution_note,
        "duplicateOfTrackingId": r.duplicate_of,
        "photoUrl": f"/v1/staff/photos/{r.photo_id}" if r.photo_id else None,
        "history": [
            {
                "sequence": h.sequence,
                "fromStatus": h.from_status,
                "toStatus": h.to_status,
                "reason": h.reason,
                "changedAt": h.changed_at.isoformat(),
                "actorType": h.actor_type,
                "actorStaffId": h.actor_staff_id,
            }
            for h in r.history
        ],
        "notes": [
            {"noteId": str(n.note_id), "text": n.text, "createdAt": n.created_at.isoformat(), "authorStaffId": n.author_staff_id}
            for n in r.notes
        ],
    }


def _report_or_404(db: Session, tracking_id: str) -> Report:
    report = cw.get_report(db, tracking_id)
    if report is None:
        raise ApiError(404, "not_found", "That report does not exist.")
    return report


@router.get("/categories")
def staff_categories(staff: Staff, db: Session = Depends(get_db)):
    return [{"categoryCode": c.category_code, "label": c.label} for c in cw.list_categories(db)]


@router.get("/reports")
def queue(
    staff: Staff,
    db: Session = Depends(get_db),
    status: Annotated[list[str] | None, Query()] = None,
    category: Annotated[list[str] | None, Query()] = None,
    disputed: bool | None = None,
    sort: Literal["submittedAt", "priority", "category", "updatedAt"] = "submittedAt",
    page: Annotated[int, Query(ge=1)] = 1,
    pageSize: Annotated[int, Query(ge=1, le=100)] = 25,
):
    rows, total = cw.queue(db, statuses=status, categories=category, disputed=disputed, sort=sort, page=page, page_size=pageSize)
    return {"items": [_row(r) for r in rows], "page": page, "pageSize": pageSize, "total": total}


@router.get("/reports/{tracking_id}")
def detail(tracking_id: str, staff: Staff, db: Session = Depends(get_db)):
    return _detail(_report_or_404(db, tracking_id))


@router.post("/reports/{tracking_id}/acknowledge")
def acknowledge(tracking_id: str, staff: Staff, background: BackgroundTasks, db: Session = Depends(get_db)):
    report = _report_or_404(db, tracking_id)
    if report.status != "Submitted":
        raise ApiError(409, "move_not_allowed", "Only a Submitted report can be acknowledged.")
    cw.change_status(db, report, "Acknowledged", staff_id=staff.staff_id)
    background.add_task(_send_in_background)
    return _detail(report)


class PriorityBody(BaseModel):
    priority: Literal["Low", "Medium", "High", "Urgent"]


@router.put("/reports/{tracking_id}/priority")
def priority(tracking_id: str, body: PriorityBody, staff: Staff, db: Session = Depends(get_db)):
    return _detail(cw.set_priority(db, _report_or_404(db, tracking_id), body.priority))


class NoteBody(BaseModel):
    text: str = Field(min_length=1, max_length=2000)


@router.post("/reports/{tracking_id}/notes", status_code=201)
def note(tracking_id: str, body: NoteBody, staff: Staff, db: Session = Depends(get_db)):
    cw.add_note(db, _report_or_404(db, tracking_id), body.text, staff.staff_id)
    return Response(status_code=201)


class StatusBody(BaseModel):
    toStatus: str
    reason: str | None = Field(default=None, max_length=2000)
    resolutionNote: str | None = Field(default=None, max_length=2000)
    duplicateOfTrackingId: str | None = None


@router.post("/reports/{tracking_id}/status")
def status(tracking_id: str, body: StatusBody, staff: Staff, background: BackgroundTasks, db: Session = Depends(get_db)):
    report = _report_or_404(db, tracking_id)
    cw.change_status(
        db,
        report,
        body.toStatus,
        staff_id=staff.staff_id,
        reason=body.reason,
        resolution_note=body.resolutionNote,
        duplicate_of=body.duplicateOfTrackingId,
    )
    background.add_task(_send_in_background)
    return _detail(report)


@router.get("/photos/{photo_id}")
def staff_photo(photo_id: str, staff: Staff, db: Session = Depends(get_db)):
    data, content_type = platform.read_photo(db, photo_id)
    return Response(content=data, media_type=content_type)
