---
page: 08 Invalid Tracking ID
scenario: 01 Citizen Portal
realizes: [FR-3 — graceful failure]
created: 2026-09-06
status: draft
---

# Page 08 — Invalid Tracking ID

## Purpose

The graceful-failure counterpart to Page 03 Tracking Page. Handles two cases: (a) the Tracking ID is malformed or doesn't exist; (b) the report was deleted or is otherwise inaccessible. Designed to be informative without leaking whether a specific ID exists (anti-enumeration per R-6).

## Personas & journey

- **Primary:** Aisha — copied a Tracking ID wrong, or is using an old email with a typo'd link.
- **Edge case:** Someone guessing Tracking IDs (we treat all misses identically).

## When this page appears

- Direct URL `/tracking/:id` where `:id` is malformed (wrong alphabet, wrong length).
- GET `/api/reports/:id/public` returns 404.
- Internal error during lookup.

## Patterns used

See `D-Design-System/04-patterns.md` §1, §14.

- **Page container:** `<CIVContainer size="md">`
- **Empty state** (§14) — full-page variant

## Sections (top to bottom)

### 1. Header strip

Same as Page 01 (city wordmark only).

### 2. Empty state (full-page)

- **Icon:** `<CIVEmptyState illustration>` — slot reserved; for v1 a simple icon (search-with-question-mark or document-with-x) in muted ink. Decorative (`aria-hidden`).
- **Title:** *We can't find that report.* (`--text-h2`)
- **Body:** *The tracking ID may have a typo, or the link may be old. Please check the email or note where you saved it.*
- **Secondary body:** *If you submitted without an email and lost your tracking ID, you'll need to submit a new report.*
- **CTA:** `<CIVButton variant="primary">Report a problem</CIVButton>` → Page 01.

### 3. Footer micro-helper (optional)

Small, muted, centered, bottom of page:
*Need help? Contact [city contact email].*

## States

| State | Behavior |
|-------|----------|
| Malformed ID (e.g., wrong alphabet, wrong length) | Page 08 renders. No API call needed. |
| Valid-format but 404 | Page 08 renders. |
| Server error during lookup | Page 08 renders. (Identical UX regardless of failure mode — anti-enumeration.) |
| Citizen clicks CTA | Routes to Page 01 with fresh form. |

## Accessibility

- Page is fully readable without any visual indicators.
- Icon is decorative — title + body carry the message.
- Single primary CTA, focusable by default.
- No keyboard traps; back button works.
- All text AA contrast.

## Anti-enumeration notes

- Identical response for "wrong format" vs "doesn't exist" vs "server error." A stranger cannot tell whether a guessed ID is *almost* right.
- No mention of the specific ID the citizen entered (don't echo it back).
- No suggestion to "try similar IDs."
- 404 timing must match 200 timing (no oracle via response time).
- Rate-limit by IP for failed lookups (per Page 03 security notes).

## What is intentionally NOT on this page

Search by email, "did you mean..." suggestions, contact form to look up report manually (would defeat anti-enumeration), tracking pixels.

## Implementation handoff notes

**Components used:** `<CIVContainer>`, `<CIVEmptyState>`, `<CIVButton>` (primary).

**Server:** All error responses (400 bad-format, 404 not-found, 500 server-error) render the same page client-side. Response times normalized server-side.

**Analytics:** Track invalid-ID page views as a funnel signal. If we see many visits, it may indicate:
- Citizens are typo'ing IDs (consider a "did you mean" feature in v2 — explicitly NOT in v1 for anti-enumeration).
- Bots are probing (escalate rate-limit).

## Open questions deferred

None — this page is fully scoped by R-6 mitigations.
