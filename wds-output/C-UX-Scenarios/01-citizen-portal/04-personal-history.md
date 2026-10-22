---
page: 04 Personal History
scenario: 01 Citizen Portal
realizes: [UJ-1 return, FR-4]
created: 2026-09-06
status: polished (v2 — references components/patterns)
---

# Page 04 — Personal History

## Purpose

A list surface giving a returning citizen reassurance that everything they reported is still in one place. Opposite of the Tracking Page record-detail hero — this is the **inventory view**.

## Personas & journey

- **Primary:** Aisha (returning) — submitted a streetlight 2 weeks ago and a pothole yesterday.
- **Edge case:** First-time visitor with this email — list is empty.

## When this page appears

- After clicking a magic link from email (`/history?token=XXX`).
- Token single-use, expires 15 minutes after issue.
- Cookie scoped to `/history/*`. No password.
- Not reachable by direct URL without a valid token.

## Patterns used

See `D-Design-System/04-patterns.md` §1, §3, §14.

- **Page container:** `<CIVContainer size="md">`
- **Page title block** (§3)
- **Filter chip row** — `<CIVCluster>` of `<CIVFilterChip>`
- **Empty state** (§14) — first-time vs filter-empty variants

## Sections (top to bottom)

### 1. Header

- **Eyebrow:** *Your reports* (uppercase, semibold, `--text-caption`, muted).
- **H1:** *Your reports* (`--text-h1`).
- **Attribution row:** *Signed in as you@example.com* + ghost link *Sign out* (right-aligned).

### 2. Filter chip row

- `<CIVCluster>` of `<CIVFilterChip>` instances.
- Default selection: *All*.
- Chips: *All (count)*, *Open (count)*, *Resolved (count)*, *Disputed (count)*.
- `Open = Submitted + Acknowledged + In Progress`.
- Tap filters immediately; URL updates with `?status=...`.
- Multi-select not supported.

### 3. Report card list

- `<CIVStack gap="space-4">` of `<CIVReportCard>` instances.
- **Ordering:** newest first.
- **Card content** (per component spec): status pill (sm) + date + category icon/label + description snippet (~80 chars).
- **Tap target:** entire card wrapped in `<a>` to Page 03 with `tracking_id`.

### 4. Empty states

| Variant | Content |
|---------|---------|
| First-time (no reports at all) | `<CIVEmptyState illustration title="You haven't reported anything yet." body="When you do, you'll see all your reports here — past and present." cta="Report a problem" →` Page 01) |
| Filter-empty | `<CIVEmptyState>` (no illustration): *"No reports in this view. Try a different filter, or [report a problem](#)."* |

### 5. Footer note

- *We only show reports submitted with this email address.* (`--text-caption`, centered, muted)
- Link: *Request a new magic link* → Page 04b.

### 6. Sign-out

- Inline confirmation: *"Signing out…"* for ~300ms, then reload to Page 04b.
- Server invalidates the cookie (not just client-side).

## Page 04b: Request Magic Link (companion)

Reached via:
- Direct URL `/history` with no token
- After sign-out
- After expired/invalid token

**Composition:** `<CIVContainer>` + `<CIVEmptyState>` (no illustration, single-column form variant):

- **H1:** *See all your reports*
- **Body:** *Enter your email and we'll send you a link. It expires in 15 minutes and can only be used once.*
- **Field:** `<CIVEmailInput>`.
- **Button:** `<CIVButton variant="primary">Send me the link</CIVButton>` (full-width mobile, max 280px desktop).
- **On submit (success, regardless of email existence):** *If that email matches a report, a link is on its way.* (security-conscious; never leaks existence)
- **On invalid format:** inline error.
- **On rate-limited:** *"You've requested a few links recently. Try again in a few minutes, or check your spam folder."*

## States (Page 04 proper)

| State | Behavior |
|-------|----------|
| Loading (after magic link click) | Skeletons for 3 cards |
| Loaded with reports | Full layout |
| Loaded empty | Section 4a |
| Token expired/invalid | Page 04b with `<CIVBanner tone="warning">` at top: *"That link has expired or already been used. Enter your email to get a new one."* |
| Rate-limited | Page 04b post-submit messaging (see above) |

## Accessibility

- Filter chips: `<button aria-pressed>` (per component spec).
- Cards: `<a>` wrapping for full keyboard nav; focus ring on the whole card.
- Sign-out link has visible focus state.
- `prefers-reduced-motion`: card press lift removed.

## What is intentionally NOT on this page

Login/password, profile editing, search, bulk actions, stats, public sharing, comments.

## Security notes (handoff)

- **Token format:** opaque random ≥ 128 bits, base64url. Single-use, 15-min expiry.
- **Rate-limit:** max 5/email/hour, max 10/IP/hour.
- **Token consumption:** atomic; second use returns 401 + log out.
- **Enumeration protection:** request-magic-link always returns success-style copy.
- **Session cookie:** HttpOnly, Secure, SameSite=Lax, scoped `/history/*`, 24h lifetime.

## Implementation handoff notes

**Components used:** `<CIVContainer>`, `<CIVFilterChip>`, `<CIVStatusPill>` (sm), `<CIVReportCard>`, `<CIVEmptyState>`, `<CIVBanner>`, `<CIVEmailInput>`, `<CIVButton>` (primary + ghost), `<CIVLoadingSkeleton>`, `<CIVSpinner>`.

**Data:**
- GET `/api/reports?email=...&status=...` — list (light shape).
- GET `/api/auth/magic-link` — consumes token, sets cookie.
- POST `/api/auth/magic-link/request` — issues token, sends email.

**Dependency:** Page 07 (Magic Link email) must be spec'd before end-to-end testing of this page.

## Open questions deferred

- **OQ-3** (per-category anonymity) — universal posture for v1.
- **OQ-5** (additional channels) — email-only.
