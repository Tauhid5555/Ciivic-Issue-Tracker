---
page: 03 Report Detail
scenario: 02 Authority Dashboard
realizes: [FR-10, FR-11, FR-12, FR-14]
created: 2026-09-06
status: draft
---

# Page 03 — Report Detail

## Purpose

Single-report view in the right drawer. Surfaces everything about a report and every action that can be taken on it. The dashboard's action surface — Carlos opens reports here to act on them, not to admire them.

## Personas & journey

- **Primary:** Carlos (UJ-2) — clicks row from queue, drawer opens, clicks *Acknowledge*, drawer closes, next row.
- **Secondary:** Deepa (UJ-3) — opens resolved reports, reviews resolution, may add internal note.

## When this page appears

- Click any row in Page 02 Queue → drawer slides in from right.
- Click a Tracking ID link from anywhere in the dashboard.
- After action via bulk bar → toast confirm + row updates in background.

## Patterns used

See `D-Design-System/04-patterns.md` §1, §8 (status hero adapted), §10 (timeline), §11 (resolution block), plus **right drawer** pattern.

- **Drawer:** new pattern. Specified inline below.
- **Status hero (compact)** — adapted for drawer width.
- **Timeline** (`<CIVTimeline>`) — same component as Citizen Portal Page 03, but with admin attribution.
- **Form section** — for internal notes and resolution/reopen forms.
- **Modal/sheet** — for resolution form and reopen form.

## Drawer pattern (new — documented inline, can be extracted to patterns.md later)

| Property | Spec |
|----------|------|
| Width | 480px desktop, 100% mobile |
| Position | fixed right, full viewport height |
| Background | `--color-bg` (page bg shows through) |
| Inner surface | `--color-surface` for content cards |
| Shadow | `--shadow-lg` on left edge (drawer casts shadow on the queue behind) |
| Open animation | slide from right, `--motion-normal` |
| Close animation | slide to right, `--motion-fast` |
| Backdrop | dimmed queue at 30% `--color-ink` overlay; click backdrop or press ESC closes |
| Focus trap | yes, while open |
| Restore focus | to the queue row that opened the drawer |

## Sections (top to bottom inside drawer)

### 1. Drawer header (sticky top)

- **Left:** `<CIVStatusPill variant size="md">` + Tracking ID (monospace, `--text-caption`, copy-able).
- **Right:** ghost icon button *Close* (X, 32×32, `aria-label="Close report detail"`).
- **Border-bottom:** 1px `--color-border`.

### 2. Report content (read-only)

- **Photo:** 240px wide, full-width-of-card, tap → `<CIVLightbox>`. If multiple photos in v2, gallery here.
- **Category row:** icon + label (`--text-h3`).
- **Submitted:** *Submitted 2 days ago by [name if known, else "anonymous"]* (`--text-body-sm`, `--color-ink-muted`). Absolute timestamp on hover.
- **Location:** zone text + small static map preview (~200px tall, no interaction). The map is *visual confirmation* — staff don't need to drag pins.
- **Description:** blockquote per Citizen Portal pattern §9.
- **Reporter:** if email provided → *Reporter: you@example.com.* If anonymous → *Anonymous submission.* (`--text-caption`, `--color-ink-subtle`).

### 3. Status timeline

- **Component:** `<CIVTimeline>` + `<CIVTimelineRow>` (same as Citizen Portal Page 03 §3).
- **Actor labels:** *"You"* (current admin's own actions), *"[Admin first name last initial]"* for other admins (e.g., *"Deepa P."*, *"Carlos M."*), *"System"* for initial Submitted row.
- **Order:** most recent first. Current row highlighted with brand-soft ring.
- **For Resolved rows:** resolution note + after-photo inline in the content slot.
- **For Disputed rows:** dispute timestamp + plain reason (*"Citizen marked this as not fixed"*).
- **For Duplicate rows:** link to original Tracking ID.

### 4. Priority control (FR-10)

- **Component:** 4-segment toggle (custom; spec below).
- **Options:** Low / Medium / High / Urgent.
- **Default:** Medium (per FR-10).
- **Visual:** horizontal segmented control, full-width. Each segment: label + optional color dot:
  - Low: `--color-ink-subtle` dot
  - Medium: `--color-brand` dot
  - High: `--color-warning` dot
  - Urgent: `--color-error` dot
- **Selected:** bg `--color-brand-soft`, text `--color-brand`, semibold.
- **Click:** instantly saves (one-click per FR-10 implication). No submit button. `<CIVToast>` confirms save.
- **Concurrency:** if another admin changes priority while drawer is open, optimistic UI reverts with toast.
- **Recent change:** if changed within last 5 minutes, shows *"Updated 2 minutes ago by [admin]"* below the toggle.

### 5. Internal notes (admin-only — NEW for dashboard)

Append-only notes visible only to admins. Citizens never see these.

- **Existing notes list** (most recent first):
  - Each note: author name + timestamp + body. Simple card per note, `--color-surface-muted` bg.
  - No edit, no delete (audit integrity).
- **Add note input:**
  - `<CIVTextarea>` placeholder: *"Add a note for the team (internal only)"*
  - Char counter: 1000 max.
  - `<CIVButton variant="secondary" size="sm">Add note</CIVButton>` right-aligned below.
  - On save: note prepends to list with *"just now • You"*, textarea clears, focus stays in textarea for rapid follow-up.
- **Use case examples** (in placeholder / hint copy):
  - *"Spoke to Juan from Public Works — bulb ordered, ETA Friday."*
  - *"Duplicate of #ABC-1234"* (then also Mark as Duplicate)
- **Visibility:** server returns internal notes only to authenticated admins; never to citizen-facing endpoints.

### 6. Action panel (status-conditional — FR-11, FR-12, FR-14)

Status-conditional UI in a clearly demarcated section with a top border (`--color-border`).

#### Status: Submitted

- **Primary:** `<CIVButton variant="primary" full> Acknowledge </CIVButton>` — moves to Acknowledged at default priority.
- **Secondary:** `<CIVButton variant="ghost" full> Mark as duplicate </CIVButton>` — opens Duplicate picker (Section 7a).

#### Status: Acknowledged

- **Primary:** `<CIVButton variant="primary" full> Start work </CIVButton>` → moves to In Progress.
- **Secondary:** `<CIVButton variant="ghost" full> Mark as duplicate </CIVButton>`.

#### Status: In Progress

- **Primary:** `<CIVButton variant="primary" full> Mark resolved </CIVButton>` — opens Resolution form (Section 7b).
- **Secondary:** `<CIVButton variant="ghost" full> Revert to Acknowledged </CIVButton>` — requires a reason note (inline textarea revealed on click).

#### Status: Resolved

- **Read-only summary:**
  - Resolution note (verbatim)
  - After-photo thumbnail (if any)
  - *"Resolved by [admin] on [date]"*
- **If disputed** (Disputed status overlay): see Disputed variant below.

#### Status: Disputed

- **Banner** at top of action panel (`<CIVBanner tone="warning">`):
  - *"Disputed by citizen on [date]. The status remains Resolved until an admin reopens."*
  - Optional auto-captured citizen note (FR-13 currently captures timestamp only; if extended, show note here).
- **Primary:** `<CIVButton variant="primary" full> Reopen </CIVButton>` — opens Reopen form (Section 7c).
- **Secondary:** `<CIVButton variant="ghost" full> Keep resolved </CIVButton>` — closes dispute (records in timeline; notifies citizen that admin reviewed and upheld resolution).

#### Status: Closed-Duplicate

- **Read-only summary:**
  - *"Marked as duplicate of [Original Tracking ID]"* + link to original.
  - Closed by [admin] on [date].
- **No actions.**

### 7. Modals / sheets (opened from action panel)

#### 7a. Duplicate picker

- **Component:** modal with searchable list of existing reports.
- **Search:** by Tracking ID, category, location, or recent date.
- **Select:** row click → confirms link, requires confirmation (*"Link as duplicate of [original]?"*).
- **Confirm:** closes modal, drawer updates to Closed-Duplicate status.
- **Required:** FR-11 mandates linking to original. Form blocks save until selected.

#### 7b. Resolution form (FR-12)

- **Component:** modal sheet (slides up from bottom on mobile, centered modal on desktop).
- **Fields:**
  - **Resolution note** (required, `<CIVTextarea>`): placeholder *"What did the team do? E.g., 'Bulb replaced; tested on 2026-08-29.'"*. Min 1 char (effectively). Max 1000.
  - **After-photo upload** (optional, `<CIVFileInput variant="photo-dropzone">`): same as Submit Page 01 §4. JPEG/PNG/HEIC, 10MB max.
- **Validation:**
  - Empty note → inline error: *"Please describe what was done."*
  - Save disabled until valid.
- **Primary:** `<CIVButton variant="primary">Save resolution</CIVButton>`.
- **Cancel:** ghost link → returns to drawer.

#### 7c. Reopen form

- **Component:** same modal pattern.
- **Field:** **Reopen reason note** (required, `<CIVTextarea>`): placeholder *"Why is this being reopened? E.g., 'Resident reports bulb still out.'"*. Min 1, max 500.
- **Primary:** `<CIVButton variant="primary">Reopen report</CIVButton>`.

### 8. Drawer footer (sticky bottom)

- **For Submitted/Acknowledged/In Progress:** mirrors the Section 6 primary action — always visible without scroll. This is the velocity surface.
- **For Resolved/Disputed/Closed-Duplicate:** shows *"Last updated [CIVRelativeTime]"* + actor name only.
- **Border-top:** 1px `--color-border`.

## States

| State | Behavior |
|-------|----------|
| Loading (drawer opens) | Skeleton for header + report content + action panel. Footer solid. |
| Loaded | Full layout |
| Action in flight | Section 6 button disabled, spinner. Other actions in panel disabled. |
| Action success | Drawer updates to new state. Toast confirms. Queue row behind also updates. |
| Action failure | Toast: *"We couldn't update that report. Try again."* Drawer state preserved. |
| Resolution form invalid | Save disabled, inline error shown |
| Reopen form invalid | Save disabled, inline error shown |
| Duplicate picker empty (no reports to link) | Empty state: *"No matching reports found."* Hint: *"Search by Tracking ID or check filters."* |
| Concurrency conflict | Toast: *"This report was updated by [other admin]. Reloading."* Drawer refreshes. |

## Accessibility

- Drawer is `<aside role="dialog" aria-modal="true" aria-label="Report detail">`.
- Focus trapped while open.
- ESC closes (after confirm if any form is dirty).
- All form fields labeled.
- Priority toggle is radiogroup (`role="radiogroup"`) with `aria-checked` on selected segment.
- Internal notes list uses semantic `<ol>`.
- All buttons meet 44px tap target on mobile (drawer is full-width on mobile).
- Photo lightbox: `role="dialog"` `aria-modal="true"`.
- `prefers-reduced-motion`: drawer slide becomes instant; modal slide becomes instant.

## What is intentionally NOT on this page

- Edit submitted fields (PRD: "Editing a submitted report" out of scope for citizen; dashboard doesn't either — the citizen's submission is the record).
- Authority-to-authority messaging (notes are append-only, not threaded).
- Bulk actions (those happen on Page 02 from queue).
- Audit log export (operational; admin tooling, not dashboard UI).
- Map editing (location is read-only display).

## Implementation handoff notes

**Components used:** `<CIVStatusPill>` (md), `<CIVButton>` (primary + secondary + ghost, multiple sizes), `<CIVTextarea>`, `<CIVEmailInput>`, `<CIVFileInput>` (photo-dropzone), `<CIVLightbox>`, `<CIVTimeline>` + `<CIVTimelineRow>`, `<CIVBanner>`, `<CIVToast>`, `<CIVSpinner>`, `<CIVRelativeTime>`, `<CIVEmptyState>`, `<CIVLoadingSkeleton>`, `PrioritySegmentedControl` (new component).

**New component to add to `03-components.md`:** `PrioritySegmentedControl` (4-segment toggle). Will be added in a follow-up polish pass; for now spec'd inline here.

**Data:**
- `GET /api/reports/:id` (auth required) returns full record including internal notes and admin attribution.
- `POST /api/reports/:id/notes` to add internal note.
- `POST /api/reports/:id/priority` to set priority.
- `POST /api/reports/:id/transition` for status changes, with reason notes where required.
- `POST /api/reports/:id/duplicate` with `{ original_id }`.
- `POST /api/reports/:id/resolution` with `{ note, photo_url? }`.
- `POST /api/reports/:id/reopen` with `{ reason }`.

**Audit (NFR-5):** every action recorded server-side with `actor_id`, `timestamp`, `action_type`, `payload_diff`. UI surfaces `actor_name` and `timestamp` in the timeline; admin IDs not shown.

**Concurrency:** optimistic UI; server returns 409 on conflict; UI reverts and shows toast.

**Performance:**
- Drawer open ≤ 300ms.
- Skeleton-to-content transition ≤ 200ms after data load.

## Open questions deferred

- **OQ-1** (hosting) — doesn't affect UI design.
- **OQ-6** (public map) — deferred.
- **MFA** (v2) — re-auth prompt on sensitive actions not in v1.
