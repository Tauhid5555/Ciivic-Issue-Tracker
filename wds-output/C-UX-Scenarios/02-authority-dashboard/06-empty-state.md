---
page: 06 Empty State
scenario: 02 Authority Dashboard
realizes: [FR-7 — defensive empty queue]
created: 2026-09-06
status: draft
---

# Page 06 — Empty State

## Purpose

Two empty-state variants for the dashboard queue. Renders inside the main content area, replacing the queue table. The empty state must be **informative without being a dead-end** — every variant either offers a clear action or tells the user why they're seeing this.

## Personas & journey

- **Primary:** Carlos (UJ-2) — applies a filter that returns 0 results; needs to know how to clear it.
- **Edge case:** Monday morning, weekend was quiet, queue genuinely empty.

## When this surface appears

- Page 02 Queue with 0 reports after filter applied.
- Page 02 Queue with 0 reports total (no filter).

## Patterns used

See `D-Design-System/04-patterns.md` §14 (empty state).

- **Empty state:** `<CIVEmptyState>` (large variant — full main content area)

## Variants

### 6a. Empty — No Reports Yet

- **Illustration slot:** simple line illustration (decorative, `aria-hidden`) — clipboard with checkmark, or empty inbox.
- **Title:** *No reports yet.* (`--text-h2`)
- **Body:** *When citizens submit issues, they'll appear here. This page will update automatically.* (`--text-body`, `--color-ink-muted`)
- **Subtle secondary line:** *"If you just signed in, this might mean everything has been triaged — nice work."* (`--text-body-sm`, `--color-ink-subtle`)
- **CTA:** none (nothing to do).
- **Auto-refresh:** page polls `/api/reports?limit=1` every 30s. If results >0, page refreshes silently.

### 6b. Empty — No Results for Current Filter

- **Illustration slot:** optional — magnifying glass with empty result, or filter funnel.
- **Title:** *No reports match your filters.* (`--text-h2`)
- **Body:** *Try removing a filter or broadening your date range.* (`--text-body`, `--color-ink-muted`)
- **Active filter chips row:** rendered inside the empty state area (so user sees what's filtering).
- **CTA:** `<CIVButton variant="secondary">Clear all filters</CIVButton>` — resets to default view.
- **Secondary:** `<CIVButton variant="ghost">Adjust filters</CIVButton>` — opens advanced filter drawer (Page 05).

## Composition

- **Container:** centered in main content area, max-width 480px, padding `--space-12` vertical.
- **Layout:** vertical, centered, illustration → title → body → active chips (variant 6b only) → CTA.
- **Spacing:** `--space-6` illustration → title, `--space-3` title → body, `--space-6` body → CTA.

## States

| State | Behavior |
|-------|----------|
| 6a. No reports ever | Full layout with auto-refresh indicator (`<CIVSpinner>` small + *"Checking for new reports…"*) |
| 6b. No matches for filter | Full layout with active filter chips and CTA |
| Polling → new report arrived | Empty state replaces with queue silently |
| User clears filter (6b) | Empty state replaces with filtered queue |

## Accessibility

- Title is `<h2>` (page's `<h1>` is the page title above).
- Active filter chips in variant 6b are still `<button>` removable (per Page 05 spec).
- Auto-refresh polling: use `aria-live="polite"` to announce new reports to screen readers (but avoid announcing on every poll — only when count changes).
- `prefers-reduced-motion`: spinner doesn't spin.

## What is intentionally NOT on this page

- Onboarding flow for new admins (out of scope — admins are invited by supervisors, expected to know the dashboard).
- Tutorials / coach marks (out of scope).
- "Load more" or pagination (zero results — nothing to paginate).

## Implementation handoff notes

**Components used:** `<CIVEmptyState>` (large variant), `<CIVFilterChip>` (removable), `<CIVButton>` (secondary + ghost), `<CIVSpinner>`.

**Polling:** `GET /api/reports?limit=1` every 30s. Stop polling on user activity (page interaction) or tab visibility change.

**No-results detection:** server returns `count: 0` + `total_unfiltered: 247` so UI can distinguish "no reports exist" from "filter has no matches".

## Open questions deferred

None.
