"""U2 Notifications: the words of each citizen email.

Two kinds, matching contract C7:
  * ``acknowledgement``: sent when a report is opened with an email (FR2.3). Holds the Tracking ID, the category,
    the submission time and a link to the tracking page.
  * ``status-change``: sent on every later status change (FR5, FR5.2). Holds the Tracking ID, the new status, the
    time of the change and a link to the tracking page.

Email is the only channel (FR5.3). Every value is HTML-escaped and a plain-text part is always built. The citizen's
description, photo and email address are never put in an email body (ADR-006, NFR14). Times are shown in Dhaka
time (UTC+6, no daylight saving), matching the screens.
"""
from datetime import datetime, timedelta, timezone
from html import escape

DHAKA = timezone(timedelta(hours=6), "Dhaka")
KINDS = ("acknowledgement", "status-change")

_STATUS_WORDS = {"Closed-Duplicate": "Closed as a duplicate"}
_REQUIRED = {
    "acknowledgement": ("trackingId", "category", "changedAt", "trackingUrl"),
    "status-change": ("trackingId", "toStatus", "changedAt", "trackingUrl"),
}


def dhaka_time(iso_value: str) -> str:
    """'2026-11-22T08:05:00+00:00' -> '22 Nov 2026, 14:05 (Dhaka time)'. A time without a zone is taken as UTC."""
    moment = datetime.fromisoformat(iso_value)
    if moment.tzinfo is None:
        moment = moment.replace(tzinfo=timezone.utc)
    return moment.astimezone(DHAKA).strftime("%d %b %Y, %H:%M") + " (Dhaka time)"


def _one_line(value: object) -> str:
    """Values go into a subject line too, so no line breaks survive."""
    return " ".join(str(value).split())


def _checked(kind: str, payload: dict) -> dict:
    if kind not in KINDS:
        raise ValueError(f"unknown email kind: {kind!r}")
    missing = [k for k in _REQUIRED[kind] if not payload.get(k)]
    if missing:
        raise ValueError(f"{kind} email is missing {', '.join(missing)}")
    url = str(payload["trackingUrl"])
    if not url.startswith(("https://", "http://")):
        raise ValueError("trackingUrl must be an http(s) link")
    values = {k: _one_line(payload[k]) for k in _REQUIRED[kind]}
    values["when"] = dhaka_time(str(payload["changedAt"]))
    if "toStatus" in values:
        values["toStatus"] = _STATUS_WORDS.get(values["toStatus"], values["toStatus"])
    return values


def _html(paragraphs: list[str], rows: list[tuple[str, str]], url: str) -> str:
    table = "".join(
        f'<tr><td style="padding:4px 12px 4px 0;color:#555">{escape(label)}</td>'
        f'<td style="padding:4px 0"><strong>{escape(value)}</strong></td></tr>'
        for label, value in rows
    )
    intro = "".join(f"<p>{escape(p)}</p>" for p in paragraphs)
    link = escape(url, quote=True)
    return (
        '<!doctype html><html><body style="font-family:Arial,sans-serif;font-size:15px;color:#222">'
        f"{intro}<table>{table}</table>"
        f'<p><a href="{link}">Track your report</a></p>'
        f'<p style="color:#555;font-size:13px">If the link does not open, copy this address: {link}</p>'
        "<p style=\"color:#555;font-size:13px\">This is an automatic message from the Civic Issue Tracker. "
        "Please do not reply.</p></body></html>"
    )


def _text(paragraphs: list[str], rows: list[tuple[str, str]], url: str) -> str:
    lines = [*paragraphs, "", *(f"{label}: {value}" for label, value in rows), "", f"Track your report: {url}", ""]
    lines.append("This is an automatic message from the Civic Issue Tracker. Please do not reply.")
    return "\n".join(lines)


def build(kind: str, payload: dict) -> tuple[str, str, str]:
    """Return (subject, plain text, HTML) for one notification. Raises ValueError for an unknown kind or a
    payload missing a field, so an empty or broken email is never sent."""
    v = _checked(kind, payload)
    if kind == "acknowledgement":
        subject = f"We received your report {v['trackingId']}"
        paragraphs = ["Thank you. Your report has been received.", "Keep your Tracking ID to check progress."]
        rows = [("Tracking ID", v["trackingId"]), ("Category", v["category"]), ("Submitted", v["when"])]
    else:
        subject = f"Your report {v['trackingId']} is now {v['toStatus']}"
        paragraphs = ["The status of your report has changed."]
        rows = [("Tracking ID", v["trackingId"]), ("New status", v["toStatus"]), ("Changed", v["when"])]
    url = v["trackingUrl"]
    return subject, _text(paragraphs, rows, url), _html(paragraphs, rows, url)
