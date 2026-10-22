---
page: 03 Tracking Page
scenario: 01 Citizen Portal
realizes: [UJ-4, FR-3, FR-13]
created: 2026-09-06
status: polished (v2 — references components/patterns)
---

# Page 03 — Tracking Page

## Purpose

The single page a citizen returns to. Answers one question immediately: *"What happened with my report?"* The page that closes the loop — or fails to.

## Personas & journey

- **Primary:** Marcus (UJ-4) — reported 3 weeks ago, returning via bookmark or email link.
- **Secondary:** Aisha (UJ-1, return phase) — checking the morning after her report.
- **Edge case:** Stranger with the link. Page is public by design.

## When this page appears

- Direct URL with `?tracking_id=XXX` (and optional `&email=` for Personal History auth).
- From Page 02 Confirmation, status-change emails, or magic-link emails.

## Patterns used

See `D-Design-System/04-patterns.md` §1, §8, §9, §10, §11, §12, §7.

- **Page container:** `<CIVContainer size="md">`
- **Status hero** (§8) — the most important pattern in the product
- **Report summary block** (§9)
- **Timeline** (§10)
- **Resolution block** (§11)
- **Action row** (§7) — status-conditional
- **Anonymous email offer** (§12)

## Sections (top to bottom)

### 1. Status hero (per pattern §8)

- **Tracking ID row:** eyebrow + monospace ID + *Copy* ghost link.
- **Status pill:** `<CIVStatusPill variant size="lg">` — pill text per status table.
- **Headline** (`--text-h1`, status-conditional):
  - Received → *"We've received your report. The team will look at it soon."*
  - Being looked at → *"The team is looking at this."*
  - Work in progress → *"Work has started on this."*
  - Resolved → *"This has been resolved."* (+ optional resolution-note attribution)
  - You flagged this → *"You flagged this as not fixed. The team will review and get back to you."*
- **Last updated:** `<CIVRelativeTime>`
- **SLA reassurance** (Submitted + Acknowledged only): *"We'll be in touch within 24 hours."* / *"Our team aims to resolve similar issues within 7 days."*
- **Card wrapper:** `<CIVCard variant="hero">`

### 2. Report summary block (per pattern §9)

Composite inside `<CIVCard>`:

- **Category row:** icon + label.
- **Submitted:** label + `<CIVRelativeTime>`.
- **Photo:** `<CIVPhotoThumbnail size=96>` (tap → `<CIVLightbox>`).
- **Location:** zone-level text only + inline "Why am I seeing a general location?" expand.
- **Description:** blockquote with left brand border.

### 3. Status timeline (per pattern §10)

- **Header:** *What's happened so far* (`--text-h3`)
- **Component:** `<CIVTimeline>` containing `<CIVTimelineRow>` instances.
- **Reverse order:** most recent first; current row has brand-soft ring.
- **Event types** (with actor label):
  - Submitted (System)
  - Acknowledged (The team)
  - In Progress (The team)
  - Resolution entry (The team) — includes note + after-photo thumbnail
  - Dispute entry (You) — *"You flagged this as not fixed — X ago."*
  - Reopen entry (The team) — includes reopen reason note
- **Empty state** (Submitted <1min): single row *"Your report just landed…"*

### 4. Resolution block (Resolved only, per pattern §11)

- Background `--status-resolved-bg`, padding `--space-5`, radius `--radius-lg`.
- **Label:** *What the team did.*
- **Note:** verbatim from authority.
- **After-photo:** optional `<CIVPhotoThumbnail size=96>`.

### 5. Action row (status-conditional)

| Status | Actions |
|--------|---------|
| **Resolved** | Primary: `<CIVButton variant="danger">This isn't fixed</CIVButton>` (opens dispute flow). Secondary: ghost link *"✓ It was fixed — close this out"* (inline confirmation, no navigation). |
| **Disputed** | `<CIVBanner tone="warning">` with date + "the team will review." Inline *"Add a note for the team"* ghost link (one-shot, not a thread). |
| **Acknowledged / In Progress / Submitted** | No action buttons. Single ghost link *"Need to add something?"* explains report is not editable; provides contact email. |

### 6. Anonymous email offer (when arrived without `&email=` param, per pattern §12)

- `<CIVCard>` with `--color-surface-muted` bg.
- Body + `<CIVEmailInput>` + `<CIVButton variant="ghost">Notify me</CIVButton>`.
- On success: card collapses to *"You're subscribed to updates for this report."*

## States

| State | Behavior |
|-------|----------|
| Loading | Skeleton for hero + summary card |
| Loaded | Full layout |
| Not found / invalid ID | Routes to Page 08 (graceful failure) |
| Disputed (post FR-13) | Hero + timeline reflect dispute; Section 5b shown |
| Reopened (post FR-14) | Status returns to In Progress or Acknowledged; timeline shows reopen entry |

## Accessibility

- Status pill text is the accessible name (per component spec) — never color-only.
- Timeline uses `<ol>` + `<time datetime>`.
- Lightbox: `role="dialog"` `aria-modal="true"` (per component spec).
- Focus order matches reading order: pill → action → secondary link → email offer.
- All text meets AA contrast.

## What is intentionally NOT on this page

Login, comments thread (FR-3 out-of-scope), editing the report, sharing buttons (FR-3 out-of-scope), public map, authority identity, internal priority data.

## Open questions deferred

- **OQ-3, OQ-4, OQ-6** — all addressed here: zone-only geo, no public map, universal anonymity posture.

## Implementation handoff notes

**Components used:** `<CIVContainer>`, `<CIVCard>` (default + hero), `<CIVStatusPill>` (lg), `<CIVRelativeTime>`, `<CIVPhotoThumbnail>`, `<CIVLightbox>`, `<CIVTimeline>` + `<CIVTimelineRow>`, `<CIVBanner>`, `<CIVButton>` (primary + ghost + danger), `<CIVEmailInput>`, `<CIVSpinner>`.

**Data:** GET `/api/reports/:id/public` returns zone-level location, current status, status history, resolution note, optional after-photo URL (signed, time-limited).

**Security:** Rate-limit by IP for failed lookups. 404 vs 200 distinction must be obscured (anti-enumeration per R-6).

**Performance:** NFR-1: ≤ 2s on 4G at p50. Photo thumbnails lazy-loaded.
