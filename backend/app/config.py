"""Settings read from environment variables, with safe local defaults."""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

DATABASE_URL = os.environ.get("DATABASE_URL", f"sqlite:///{BASE_DIR / 'data' / 'app.db'}")
PHOTO_DIR = Path(os.environ.get("PHOTO_DIR", str(BASE_DIR / "data" / "photos")))
MAX_PHOTO_BYTES = 10 * 1024 * 1024
ALLOWED_PHOTO_TYPES = {"image/jpeg", "image/png", "image/heic"}
MAX_PHOTO_PIXELS = 50_000_000  # guards against decompression bombs (a small file that expands hugely)
SESSION_MINUTES = int(os.environ.get("SESSION_MINUTES", "480"))
CHALLENGE_MINUTES = 5
PUBLIC_BASE_URL = os.environ.get("PUBLIC_BASE_URL", "http://localhost:5173")
CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(",")

# Rate limits (requests, window seconds) per client.
SUBMIT_LIMIT = (10, 3600)
LOOKUP_LIMIT = (60, 60)
SIGN_IN_LIMIT = (10, 300)

# Service area for the pilot: a box around Dhaka (south, west, north, east). Keep in step with SERVICE_BOUNDS in
# frontend/src/LocationPicker.tsx. Reports with a position outside it are refused.
SERVICE_AREA = (23.62, 90.28, 23.95, 90.55)

TRACKING_ID_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"  # no 0/O, 1/I
TRACKING_ID_LENGTH = 10

# Email (U2 Notifications). "log" keeps every email on this machine; "ses" sends through Amazon SES (API v2).
# No credentials live here: SES uses the standard AWS credential chain (environment, profile or the server's role).
EMAIL_BACKEND = os.environ.get("EMAIL_BACKEND", "log").strip().lower()
EMAIL_FROM = os.environ.get("EMAIL_FROM", "").strip()  # required when EMAIL_BACKEND is "ses"
AWS_REGION = os.environ.get("AWS_REGION", "ap-south-1")
SES_CONFIGURATION_SET = os.environ.get("SES_CONFIGURATION_SET", "").strip() or None
EMAIL_SWEEP_SECONDS = float(os.environ.get("EMAIL_SWEEP_SECONDS", "5"))  # 0 turns the background sender off
EMAIL_MAX_ATTEMPTS = int(os.environ.get("EMAIL_MAX_ATTEMPTS", "5"))
EMAIL_RETRY_BASE_SECONDS = int(os.environ.get("EMAIL_RETRY_BASE_SECONDS", "30"))

CATEGORIES = [
    ("streetlight", "Streetlight"),
    ("pothole", "Pothole"),
    ("garbage", "Garbage"),
    ("drainage", "Drainage"),
    ("noise", "Noise"),
]
