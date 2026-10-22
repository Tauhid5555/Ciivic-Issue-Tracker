---
page: 05 Email — Acknowledgement
scenario: 01 Citizen Portal
realizes: [FR-2]
created: 2026-09-06
status: draft
---

# Page 05 — Email: Acknowledgement

## Purpose

The email counterpart of Page 02 Confirmation. Lands in the citizen's inbox within 60 seconds of submission (NFR-3). Reinforces the *received* leg of the 24-hour promise and gives the citizen a permanent, bookmarkable artifact.

## When this email is sent

- Trigger: report submission success.
- Recipient: the email address provided on the submission form. *Not sent* if the citizen was anonymous (the on-screen Confirmation is the only acknowledgement).
- Dispatch: within 60 seconds of submission (NFR-3 ≥ 99% reliability).

## Patterns used

See `D-Design-System/04-patterns.md` §13 (email body composition).

- **Frame:** `<CIVEmailFrame>`
- **Body block:** eyebrow + salutation + status pill + CTA + sign-off

## Sections (top to bottom)

### Email header (per `<CIVEmailFrame>`)

- Wordmark: "ReportIt"
- Centered, padding `--space-6 × --space-4`

### Body

#### Eyebrow

*Update on your report* (uppercase, semibold, `--color-brand`, `--text-caption`).

#### Salutation

*Hi,* (anonymous — no name). *Hi [name],* (if name available; v2).

#### Paragraph 1 — receipt

> *We've received your report about a [Category] near [Zone]. Your tracking ID is below — save this email so you can check what happens.*

#### Status block

Inline status card with:
- Tracking ID (monospace, prominent — the email's hero element)
- Status pill: `<CIVStatusPill variant size="md">` showing *"Received"* with `--status-submitted` colors
- Category label
- Submitted timestamp (absolute, in citizen's local timezone)

#### Primary CTA

`<CIVButton variant="primary">` rendered as button-shaped link → Page 03 Tracking Page with `?tracking_id=XXX&email=YYY`.

Label: **"View your report"** (or **"Check status"** — A/B candidate; default to *"View your report"*).

#### Paragraph 2 — what to expect

> *The team will look at this within 24 hours. You'll get another email when they do, and again when it's resolved.*

#### Sign-off

*— The [City Name] team*

### Email footer (per `<CIVEmailFrame>`)

- *You're getting this because you submitted a report on [date]. [Why am I getting this?] [Privacy]*
- City contact info (small, muted)

## Subject line

**"We received your report — tracking ID [XXX-XXXX]"**

(Subject includes the Tracking ID so the email is searchable in inbox; never bury it.)

## Sender

- **From name:** "ReportIt" (human, not "noreply@")
- **From address:** `civic-issues@[city-domain].gov` (monitored mailbox for replies)
- **Reply-to:** same (real humans monitor — but auto-responder can acknowledge if volume demands)

## Variants

| Variant | Trigger | Body adjustment |
|---------|---------|-----------------|
| Standard (with email) | Submission with email | As above |
| (no anonymous variant — not sent for anonymous submissions) | — | — |

## States

| State | Behavior |
|-------|----------|
| Successful dispatch | Standard email rendered above |
| Bounce / undeliverable | Logged; no retry to citizen (the on-screen Confirmation is the source of truth); surface in admin tooling later |
| Citizen clicks CTA | Lands on Page 03 with email param (Personal History auto-authed) |

## Accessibility

- All semantic structure preserved (headings, lists).
- Button-shaped link uses real `<a>` with inline-styled button appearance.
- Color contrast AA on all text (inline-styled hex from token palette).
- Preheader text: *"Tracking ID [XXX-XXXX] — we received your report."* (visible in inbox preview, full text below)
- Plain-text alternative part: required (some clients prefer plain text).

## What is intentionally NOT in this email

Marketing copy, related reports suggestions, survey requests, social links, "follow us" CTAs.

## Implementation handoff notes

**Components used:** `<CIVEmailFrame>`, `<CIVStatusPill>` (md), `<CIVButton>` (primary, as link).

**Template:** transactional email template (e.g., MJML / React Email / SendGrid dynamic templates). Inline styles only — email clients don't render CSS variables.

**Idempotency:** Email dispatch must be idempotent. Re-triggering the same submission event (e.g., webhook retry) must not send duplicate emails.

**Preheader:** 90–100 chars. Rendered as hidden `<span>` after the closing `</table>` of the preheader.
