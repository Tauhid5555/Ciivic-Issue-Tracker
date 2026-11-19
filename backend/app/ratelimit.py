"""In-process sliding-window rate limiter. One process in the slice; a shared
counter store (cache) replaces this behind the same interface in production."""
import hashlib
import threading
import time
from collections import defaultdict, deque

from fastapi import Request

from .errors import ApiError

_lock = threading.Lock()
_hits: dict[str, deque] = defaultdict(deque)


def client_key_hash(request: Request) -> str:
    """One-way hash of the client address; never returned to any caller."""
    host = request.client.host if request.client else "unknown"
    return hashlib.sha256(host.encode()).hexdigest()[:32]


def check(bucket: str, client: str, limit: tuple[int, int]) -> None:
    max_hits, window = limit
    now = time.monotonic()
    key = f"{bucket}:{client}"
    with _lock:
        q = _hits[key]
        while q and now - q[0] > window:
            q.popleft()
        if len(q) >= max_hits:
            raise ApiError(429, "rate_limited", "Too many attempts. Please wait a little and try again.")
        q.append(now)


def reset() -> None:
    with _lock:
        _hits.clear()
