---
page: 02 Dashboard / Queue
scenario: 02 Authority Dashboard
realizes: [FR-7, FR-8, FR-9]
created: 2026-09-06
status: draft
---

# Page 02 — Dashboard / Queue

## Purpose

The primary surface where authority staff triage incoming reports. Carlos spends most of his day here. The page must enable bulk triage, fast filtering, and a two-click acknowledge from any row.

## Personas & journey

- **Primary:** Carlos (UJ-2) — opens dashboard, sees 30–80 new reports. Wants to clear them in <5 min.
- **Secondary:** Deepa (UJ-3) — opens filtered to "In Progress", reviews at end of week.

## When this page appears

- Sign-in success redirect (default landing).
- Direct visit to `/dashboard` while authenticated.
- Sign-in redirect from any other `/dashboard/*` URL.

## Patterns used

See `D-Design-System/04-patterns.md` §1, §15 (lightbox used for photo zoom — less relevant here; replaced by inline thumbnail), plus a new pattern: **Data table**.

A new pattern (`05-patterns-data-table.md` will be added in a follow-up; for now this spec embeds the rules inline).

- **Page container:** `<CIVContainer size="lg">` (1200px max)
- **Filter chip row** — `<CIVCluster>` of `<CIVFilterChip>` (Page 05)
- **Bulk action bar** — sticky bottom variant (similar to Submit mobile sticky)
- **Right drawer** — for Report Detail (Page 03)

## Sections (top to bottom)

### 1. Top bar (sticky)

- **Left:** city wordmark + small "Dashboard" label.
- **Right:** admin avatar circle (initials, 32px). Click → menu: *Account*, *Sign out*.

### 2. Page title strip

- **H1:** *Queue* (`--text-h2`)
- **Result count** (right-aligned): *247 reports* (matches current filter)
- **Active filter chips row** (below title) — `<CIVCluster>` of `<CIVFilterChip variant="removable">` showing active filters. Each chip × to remove. *Clear all* ghost link if >1 active.

### 3. Quick-stats strip (subtle, no visual weight)

- `--text-caption`, `--color-ink-subtle`
- Format: *"5 need acknowledgment · 12 in progress · 3 disputed"*
- Each segment is a ghost link that sets a one-click filter.

### 4. Queue table

**Performance target:** NFR-2 ≤ 1s p50 with 1,000 reports.

**Columns** (left to right):

| # | Column | Width | Content | Sortable |
|---|--------|-------|---------|----------|
| 1 | Checkbox | 40px | `<input type="checkbox">` for bulk select | — |
| 2 | Status | 140px | `<CIVStatusPill variant size="sm">` | Yes |
| 3 | Priority | 60px | Icon (arrow up/down/dash) + color: `--color-error` / `--color-warning` / `--color-ink-subtle` | Yes |
| 4 | Category | 140px | Icon (24px) + label | Yes |
| 5 | Location | 180px | Zone text (truncate with ellipsis) | No |
| 6 | Submitted | 120px | `<CIVRelativeTime>` | Yes (default sort) |
| 7 | Photo | 56px | 40px square thumbnail, tap → `<CIVLightbox>` | No |
| 8 | Tracking ID | 110px | Monospace, copy-able on tap | Yes |
| 9 | Reporter | 160px | Email if provided; "—" if anonymous (truncate) | No |
| 10 | Action | 140px | Status-conditional quick-action button | — |

**Default sort:** Status = Submitted + Submitted-date oldest first.

**Row hover:** subtle bg `--color-surface-muted`. Click row → opens Report Detail (Page 03) in right drawer.

**Row selection:** checkbox. Selected rows get `--color-brand-soft` bg. Header checkbox = select all visible (with banner showing total).

### 5. Quick-action button per row (column 10)

The status-conditional quick action. This is FR-9 realized.

| Status | Button | Action on click |
|--------|--------|----------------|
| Submitted | `<CIVButton variant="primary" size="sm">Acknowledge</CIVButton>` | Move to Acknowledged, default priority. Toast confirm. (2 clicks total: 1 row click optional, 1 action click. Or 1 checkbox + 1 bulk-bar button.) |
| Acknowledged | `<CIVButton variant="primary" size="sm">Start work</CIVButton>` | Move to In Progress. Toast. |
| In Progress | `<CIVButton variant="primary" size="sm">Mark resolved</CIVButton>` | Opens resolution form (Page 03 §5). |
| Resolved | (no button — open detail to see notes/photos) | — |
| Disputed | `<CIVButton variant="warning" size="sm">Review</CIVButton>` | Opens detail with dispute banner pre-shown. |
| Closed-Duplicate | (no button) | — |

**Size:** compact (height 32px) to fit row. **Disabled state:** while a server request is in flight for this row.

### 6. Bulk action bar (sticky bottom)

Appears when ≥1 row selected. Hidden otherwise.

- `--color-surface` bg, `--shadow-lg`, padding `--space-4 × --space-6`
- **Left:** *3 selected* (count, `--text-body-sm`)
- **Buttons (right cluster):**
  - `<CIVButton variant="primary" size="sm">Acknowledge all</CIVButton>` — moves all selected Submitted rows to Acknowledged. (Disabled if zero Submitted in selection.)
  - `<CIVButton variant="secondary" size="sm">Set priority</CIVButton>` — opens priority dropdown (Low/Medium/High/Urgent).
  - `<CIVButton variant="ghost" size="sm">Clear selection</CIVButton>`
- **Above bar (when bar appears):** auto-scroll to keep it visible.

### 7. Pagination footer

- Right-aligned: *Showing 1–50 of 247* + page navigation (Prev / [1] [2] [3] ... [5] / Next)
- Left-aligned: page size selector (25 / 50 / 100 per page, default 50)

## States

| State | Behavior |
|-------|----------|
| Loading | `<CIVLoadingSkeleton>` rows (5 visible). Header + filter strip solid. |
| Loaded with results | Full layout |
| Empty (no filter) | Page 06 — Empty Queue state |
| Empty (filter returns 0) | Page 06 — No Results variant |
| Filter drawer open | Left rail or modal drawer with full filter controls (Page 05) |
| Report Detail open | Right drawer slides in (Page 03). Queue remains in background, dimmed. Closing drawer returns to queue at same scroll position. |
| Bulk select active | Bulk action bar appears at bottom |
| Action in flight (row) | Action button shows spinner, row disabled |
| Error (action failed) | `<CIVToast>`: *"We couldn't update that report. Try again."* Row returns to previous state. |
| Server error (page load) | `<CIVEmptyState>` with retry CTA. |

## Accessibility

- Table uses semantic `<table>` with `<thead>`/`<tbody>` and proper `<th scope>`.
- Sortable column headers are `<button>` inside `<th>`, with `aria-sort` attribute reflecting current state.
- Checkboxes are real `<input type="checkbox">` with associated labels (visually hidden).
- Row click → drawer: drawer is `<aside role="dialog" aria-modal="true" aria-label="Report detail">`.
- Bulk action bar uses `role="region" aria-live="polite"` so screen readers announce selection count.
- Quick-action buttons in rows: keyboard-accessible (Tab through rows).
- All text meets AA contrast.
- Photos have alt text (or empty alt if decorative — but row context implies citizen-photo so empty alt acceptable for visual scan).
- `prefers-reduced-motion`: drawer slide becomes instant; row hover doesn't animate.

## What is intentionally NOT on this page

- Charts / analytics dashboards (per design philosophy — staff are here to work, not reflect).
- Saved filter views (per PRD: `[NON-GOAL for MVP]`).
- Map view of all reports (OQ-6 deferred).
- Bulk delete / archive (out of scope).
- Authority-to-authority messaging.

## Implementation handoff notes

**Components used:** `<CIVContainer>`, `<CIVFilterChip>` (default + removable variants), `<CIVStatusPill>` (sm), `<CIVButton>` (primary + secondary + ghost + warning, multiple sizes), `<CIVLightbox>`, `<CIVRelativeTime>`, `<CIVToast>`, `<CIVEmptyState>`, `<CIVLoadingSkeleton>`, `<CIVSpinner>`.

**Data:** `GET /api/reports?status=...&category=...&from=...&to=...&zone=...&sort=...&page=...&page_size=...` returns paginated list with embedded quick-action metadata.

**Performance:**
- NFR-2: ≤ 1s p50 with 1,000 reports.
- Virtualized rows beyond 100 visible (consider react-window or equivalent).
- Lazy-load photo thumbnails (intersection observer).
- Debounce filter changes (300ms).

**Bulk action endpoint:** `POST /api/reports/bulk` with `{ ids: [...], action: "acknowledge"|"set-priority", priority?: ... }`.

**Audit:** NFR-5 requires every action recorded with timestamp + actor. Server-side; UI doesn't need to surface audit IDs.

## Open questions deferred

- **OQ-1** (hosting/governance) — doesn't affect UI design.
- **OQ-5** (channels) — dashboard doesn't notify citizens directly; emails are system-driven.
- **OQ-6** (public map) — deferred.
