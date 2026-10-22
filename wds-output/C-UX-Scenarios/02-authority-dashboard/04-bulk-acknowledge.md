---
page: 04 Bulk Acknowledge
scenario: 02 Authority Dashboard
realizes: [FR-9 — two-click acknowledge, extended to batch]
created: 2026-09-06
status: draft
---

# Page 04 — Bulk Acknowledge

## Purpose

Formalize the bulk action flow that lives as the bottom sticky bar on Page 02 (Dashboard / Queue). Documents the **two-click acknowledge pattern** scaled to a batch — Carlos's primary productivity surface.

## Personas & journey

- **Primary:** Carlos (UJ-2) — end-of-morning batch: 30 Submitted reports need Acknowledged. Two clicks per row would take 60 clicks; bulk takes 3.

## When this surface appears

- Triggered by selecting ≥1 row in Page 02 Queue.
- Hides when selection cleared or all rows deselected.
- Lives at `position: sticky; bottom: 0` of the dashboard viewport.

## Patterns used

See `D-Design-System/04-patterns.md` §7 (action row) + new **sticky bulk action bar** pattern (to be extracted to patterns.md in polish).

- **Bulk action bar:** sticky bottom variant, similar pattern to Submit Page 01's sticky submit bar but desktop-first.
- **Filter chip:** `<CIVFilterChip>` (selection chips in queue rows).

## Composition

### Bar appearance (when ≥1 row selected)

| Property | Spec |
|----------|------|
| Position | sticky, bottom 0, full viewport width |
| Background | `--color-surface` |
| Shadow | `--shadow-lg` (above the queue) |
| Padding | `--space-3 × --space-6` |
| Border-top | 1px `--color-border` |
| Animation | slide up from `--space-4` on appear, `--motion-normal` |

### Bar contents

**Left side:**
- Selection count: *3 selected* (`--text-body-sm`, `--weight-semibold`)
- Sub-text: *3 Submitted · 0 Acknowledged · 0 In Progress* (status breakdown of selection — shows Carlos what's eligible for Acknowledge)

**Right side (button cluster):**
- `<CIVButton variant="primary" size="sm">Acknowledge {n}</CIVButton>` — only enabled if ≥1 Submitted in selection. Shows count.
- `<CIVButton variant="secondary" size="sm">Set priority</CIVButton>` — opens priority dropdown (Low / Medium / High / Urgent). Applies to all selected.
- `<CIVButton variant="ghost" size="sm">Clear selection</CIVButton>` — deselects all, hides bar.

### Acknowledgment dropdown (when Acknowledge clicked)

- Quick menu: Acknowledge at Low / Medium / High / Urgent (default Medium).
- Or: *Acknowledge with priority…* → opens small inline priority picker.
- Selection triggers immediate action.

## Behavior

### On Acknowledge click

1. Optimistic UI: all selected Submitted rows update to Acknowledged status (status pill changes color, row bg flashes briefly via `--color-brand-soft` for 200ms).
2. Server request: `POST /api/reports/bulk` with `{ ids, action: "acknowledge", priority }`.
3. On success: rows stay Acknowledged. Bulk bar updates count (some Submitted rows are gone). Toast: *"3 reports acknowledged."* (`<CIVToast>`).
4. On partial failure (some succeeded, some didn't): toast: *"2 reports acknowledged. 1 couldn't be updated — it may already be in a different status."* UI reconciles to server state.
5. On full failure: toast: *"We couldn't acknowledge those reports. Try again."* All rows revert to previous state.

### On Set priority click

- Dropdown appears below the button.
- Selecting a priority triggers `POST /api/reports/bulk` with `{ ids, action: "set-priority", priority }`.
- Toast: *"Priority set to [level] on 3 reports."*

### On Clear selection click

- All checkboxes deselected.
- Bar hides (slides down, `--motion-normal`).

### Selection persistence across filter changes

- **Filter change clears selection** (cleaner mental model — selection is for visible rows only). Toast if selection was non-empty: *"Selection cleared."*

### Selection across pagination

- Header checkbox: "Select all {n} matching this filter" — selects across pages.
- Bulk bar updates count to reflect total.
- All pages show selected state.

## States

| State | Behavior |
|-------|----------|
| No selection | Bar hidden |
| 1+ selected | Bar appears with count |
| Selection contains 0 Submitted | Acknowledge button disabled (label: *"Acknowledge 0"*) |
| Action in flight | All buttons disabled, spinner on the active button |
| Action success | Toast + UI update |
| Partial failure | Toast + row-by-row reconciliation |
| Full failure | Toast + UI revert |
| Filter applied while selected | Selection cleared, toast notification |

## Accessibility

- Bar uses `role="region" aria-live="polite" aria-label="Bulk actions"`.
- Selection count announced on update.
- Buttons keyboard-accessible.
- Focus visible on all interactive elements.
- Bar doesn't trap focus (queue is still navigable).
- No mouse-only interactions (click and keyboard both work).

## What is intentionally NOT on this page

- Bulk *resolve* (resolution requires a note + optional photo — doesn't scale to bulk; per-row resolution is the right shape)
- Bulk *mark duplicate* (requires picking original — per-row only)
- Bulk *delete* (out of scope — no deletion in MVP)
- Bulk *reopen* (similar reasoning — needs reason note)

## Implementation handoff notes

**Components used:** `<CIVButton>` (primary + secondary + ghost, sm), `<CIVToast>`, `<CIVSpinner>`, `<CIVStatusPill>` (sm), `<CIVDropdown>` (new component, to be added in polish).

**Endpoint:** `POST /api/reports/bulk` with `{ ids: [...], action: "acknowledge"|"set-priority", priority?: "low"|"medium"|"high"|"urgent" }`. Returns `{ succeeded: [...], failed: [{ id, reason }] }`.

**Audit:** NFR-5. Each bulk action recorded server-side with actor, timestamp, list of affected IDs. UI doesn't need to surface this.

**Performance:**
- NFR-2 carries: bulk action endpoint responds in ≤ 500ms for batches ≤ 50.
- Optimistic UI doesn't wait for server; reconciles on response.

**Concurrency:**
- If a selected row was updated by another admin between selection and action, server returns that ID in `failed[]` with reason `"already-updated"`. UI reverts only that row's state and toast explains.

## Open questions deferred

None — fully scoped.
