---
page: 07 Email — Magic Link
scenario: 01 Citizen Portal
realizes: [FR-4]
created: 2026-09-06
status: draft
---

# Page 07 — Email: Magic Link

## Purpose

The entry point to Personal History (Page 04). The only way a citizen accesses their multi-report view, by design — no password. Also handles re-authentication when the session expires.

## When this email is sent

- Trigger 1: citizen requests a magic link from Page 04b.
- Trigger 2: citizen's session cookie is about to expire and they have unread status changes (optional, v2 — v1 sends only on request).
- Recipient: the email address entered on Page 04b.
- Dispatch: within 30 seconds of request.

## Patterns used

See `D-Design-System/04-patterns.md` §13.

- **Frame:** `<CIVEmailFrame>`
- **Body block:** eyebrow + salutation + brief explanation + primary CTA + security note

## Body composition

### Header / footer

Per `<CIVEmailFrame>`.

### Eyebrow

*Sign in to your reports*

### Salutation

*Hi,* (no name — we don't have it).

### Paragraph 1 — what this is

> *You asked for a link to see all your reports. Tap below to sign in. The link expires in 15 minutes and can only be used once.*

### Primary CTA

`<CIVButton variant="primary">` → Page 04 with `?token=XXX`.

Label: **"View your reports"**

### Security note (small, muted)

> *Didn't request this? You can safely ignore this email — nothing will change.*

### Sign-off

*— The [City Name] team*

## Subject line

**"Your sign-in link for ReportIt"**

(No tracking ID in subject — the magic link email isn't about a specific report.)

## Sender

Same as Page 05.

## Variants

| Variant | Trigger | Body adjustment |
|---------|---------|-----------------|
| Standard | Magic link request | As above |
| (no other variants in v1) | — | — |

## States

| State | Behavior |
|-------|----------|
| Successful dispatch | Standard email rendered |
| Token consumed → second click on same link | Returns 401; Page 04 shows *"That link has expired or already been used"* `<CIVBanner tone="warning">` |
| Token expired (>15 min) | Same as second-click path |
| Rate-limited (too many requests) | No email sent; Page 04b shows *"You've requested a few links recently. Try again in a few minutes."* |
| Bounce | Logged; user must re-request |

## Accessibility

Same as Page 05.

**Preheader:** *"Tap to see all your reports. The link expires in 15 minutes."*

## What is intentionally NOT in this email

Personal data beyond the email itself (no listing of reports, no "you have 3 reports" count — that's the destination page's job, not the email's).

## Implementation handoff notes

**Components used:** `<CIVEmailFrame>`, `<CIVButton>` (primary, as link).

**Token generation:** 128-bit random, base64url-encoded. Hashed at rest (never store raw token).

**Rate-limit enforcement:** Must precede email dispatch. Max 5/email/hour, max 10/IP/hour.

**Idempotency:** Multiple identical requests within the rate-limit window should send *one* email (with the latest token), not multiple.

**Plain-text alternative:** Required.

**Security:**
- Never include the token directly in the email body — only in the CTA link.
- Link is `https://` only (no http://).
- Link has `rel="noopener noreferrer"` if `target="_blank"`.
- Consider `referrer-policy: no-referrer` on the landing page.
