"""One backend service with internal modules (Units Generation, Q3-A)."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import case_workflow, config, errors, models  # noqa: F401  (models registers the tables)
from .db import Base, SessionLocal, engine
from .public_api import router as public_router
from .staff_api import router as staff_router


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        case_workflow.seed_categories(db)
    yield


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
