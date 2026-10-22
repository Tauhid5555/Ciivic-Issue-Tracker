---
page: 05 Filters
scenario: 02 Authority Dashboard
realizes: [FR-8]
created: 2026-09-06
status: draft
---

# Page 05 — Filters

## Purpose

The filter controls available on Page 02 (Dashboard / Queue). Two-tier: **quick chips** for one-click common filters, **advanced panel** for full control.

## Personas & journey

- **Primary:** Carlos (UJ-2) — quick filters (Submitted + today) for the morning batch.
- **Secondary:** Deepa (UJ-3) — advanced filter (In Progress + this week + Drainage category) for end-of-week review.

## When this surface appears

- Quick chips are always visible above the queue (per Page 02 §2).
- Advanced panel is opened via a *Filters* button in the page title strip.

## Patterns used

See `D-Design-System/04-patterns.md` §1, §15 (drawer pattern, similar to Page 03 right drawer but reversed), plus **filter chip** and **filter panel** patterns.

## Composition

### 1. Quick chips (always visible)

Above the queue table. `<CIVCluster>` of `<CIVFilterChip>`:

| Chip | Default selected? | Action |
|------|-------------------|--------|
| *All* | Yes (default) | Clears all filters |
| *Submitted* | No | Sets status = Submitted |
| *Acknowledged* | No | Sets status = Acknowledged |
| *In Progress* | No | Sets status = In Progress |
| *Resolved* | No | Sets status = Resolved |
| *Disputed* | No | Sets status = Disputed |
| *Today* | No | Date range = today |
| *This week* | No | Date range = last 7 days |
| *Overdue* (smart) | No | Computed: Submitted or Acknowledged > 24h |

Multi-select on status (e.g., Submitted + Acknowledged). Date chips are single-select. *All* is exclusive.

Counts in parentheses: *Submitted (47)*.

### 2. Active filter chips row (below title, above queue)

Shows removable chips for non-default filters (e.g., category, custom date range, location text). Each × removes that filter. *Clear all* ghost link at end if >1.

### 3. Advanced panel — *Filters* button (right side of title strip)

`<CIVButton variant="secondary" size="sm">Filters</CIVButton>` with badge showing count of active advanced filters.

Opens **left drawer** (mirrors Page 03 right drawer pattern).

### 4. Advanced filter drawer

| Property | Spec |
|----------|------|
| Width | 360px |
| Position | fixed left, full viewport height |
| Animation | slide from left, `--motion-normal` |
| Backdrop | same dim overlay; click closes |
| Header | *Filters* title + *Reset* ghost link + close X |
| Footer (sticky) | *Apply* (primary) + *Cancel* (ghost) |

**Sections inside drawer:**

#### Category (multi-select)
- 5 `<CIVFilterChip>` instances (Streetlight, Pothole, Garbage, Drainage, Noise). Selected chips show brand-soft bg.

#### Status (multi-select)
- Same as quick chips but with all 6 statuses including Closed-Duplicate.

#### Date range
- Quick presets (radio): *Today* / *This week* / *This month* / *Custom*
- Custom: two date inputs (from, to).
- *Overdue* smart filter (per above) — checkbox.

#### Location (text + zone — per FR-8 assumption)
- Text input: *"Search by neighborhood or address keyword"*
- Zone dropdown: list of known zones (configurable).
- Geographic radius: NOT in v1 (per FR-8 assumption).

#### Priority (multi-select)
- Low / Medium / High / Urgent chips.

#### Reporter
- *With email* / *Anonymous* / *All* radio.

#### Disputed only
- Checkbox: *"Show disputed only"*.

### 5. Behavior

- **Apply:** closes drawer, applies filters to queue, updates active filter chips row. URL updates with `?status=...&category=...&from=...`.
- **Reset:** clears all advanced filters, keeps quick-chip selection.
- **Cancel:** closes drawer without applying.
- **URL shareability:** filters reflected in URL for sharing among admins.

## States

| State | Behavior |
|-------|----------|
| No active filters | Quick chip = *All*. Active chips row hidden. |
| Active filters (any) | Active chips row visible. Queue URL updates. |
| Advanced panel open | Drawer shown. Apply/Cancel in footer. |
| Advanced filter applied | Drawer closes, queue refreshes, URL updates. |
| Result count = 0 | Page 06 Empty State — No Results variant. |
| Result count = 247 | Queue table renders normally. |

## Accessibility

- Quick chips: `<button aria-pressed>` (per component spec).
- Active filter × removal: `<button aria-label="Remove [filter name] filter">`.
- Advanced drawer: `<aside role="dialog" aria-modal="true" aria-label="Filters">`.
- All form fields labeled.
- ESC closes drawer (with unsaved-changes confirm if needed — actually no, Apply/Cancel pattern means no unsaved state).
- Tab order: drawer sections top-to-bottom, then footer buttons.

## What is intentionally NOT on this page

- Saved filter views per user (PRD: out for MVP).
- Geographic radius filter (FR-8 assumption: zone or text only).
- Full-text search across description content (deferred).
- Filter presets per category (e.g., "Show all Drainage reports older than 7 days") — too powerful for v1.

## Implementation handoff notes

**Components used:** `<CIVFilterChip>`, `<CIVButton>` (primary + secondary + ghost), `<CIVTextInput>`, `<CIVRadio>`, `<CIVCheckbox>`, `<CIVDateInput>` (new component, to be added).

**URL format:** `?status=submitted,acknowledged&category=streetlight&from=2026-09-01&to=2026-09-06&zone=Maple+Heights&priority=high&anonymous=true&disputed=true`

**Backend:** Filter params translate to a single query. Debounced 300ms on rapid changes.

**Performance:** NFR-2 carries — filtered queue renders in ≤ 1s p50.

## Open questions deferred

None — fully scoped per FR-8.
