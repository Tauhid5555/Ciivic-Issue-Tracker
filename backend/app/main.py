"""One backend service with internal modules (Units Generation, Q3-A)."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine

from . import case_workflow, config, errors, models  # noqa: F401  (models registers the tables)
from .db import Base, SessionLocal, engine
from .email_sender import get_sender
from .notifications import EmailSweeper
from .public_api import router as public_router
from .staff_api import router as staff_router


def ensure_notification_columns(target: Engine) -> list[str]:
    """Add the Bolt 7 columns to an existing SQLite notification_requests table.

    create_all makes missing tables but never alters an existing one, so a database made before Bolt 7 would
    lack these columns. The step is idempotent: it only adds what is missing. Other databases are left to the
    migration tool that arrives with the PostgreSQL move in Bolt 6. Returns the names of the columns added.
    """
    if target.dialect.name != "sqlite":
        return []
    present = {c["name"] for c in inspect(target).get_columns("notification_requests")}
    missing = [name for name in models.NOTIFICATION_ADDED_COLUMNS if name not in present]
    with target.begin() as conn:
        for name in missing:  # names and types come from the fixed map in models.py, never from input
            conn.execute(text(f"ALTER TABLE notification_requests ADD COLUMN {name} {models.NOTIFICATION_ADDED_COLUMNS[name]}"))
    return missing


@asynccontextmanager
async def lifespan(_: FastAPI):
    get_sender()  # fail fast on email settings that cannot work (for example "ses" without EMAIL_FROM)
    Base.metadata.create_all(engine)
    ensure_notification_columns(engine)
    with SessionLocal() as db:
        case_workflow.seed_categories(db)
    sweeper = EmailSweeper(config.EMAIL_SWEEP_SECONDS, SessionLocal) if config.EMAIL_SWEEP_SECONDS > 0 else None
    if sweeper:
        sweeper.start()
    try:
        yield
    finally:
        if sweeper:
            sweeper.stop()


app = FastAPI(title="Civic Issue Tracker", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_methods=["GET", "POST", "PUT", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Idempotency-Key"],
)
errors.install(app)
app.include_router(public_router)
app.include_router(staff_router)


@app.get("/health")
def health():
    return {"ok": True}
