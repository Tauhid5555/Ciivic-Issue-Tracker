---
title: Responsive Audit — Fixed-Width Assumptions in Page Specs
created: 2026-09-06
scope: All 15 page specs (8 Citizen Portal + 7 Authority Dashboard)
triggered_by: Breakpoint realignment + Citizen Portal desktop treatment decision
---

# Responsive Audit — Page Specs

After updating `02-tokens.md` §7 and `04-patterns.md` §0–§1 to the Tailwind-aligned breakpoint scale and Citizen Portal "intentional narrow column" rule, every page spec was audited for fixed-width assumptions, legacy container tokens, and breakpoint terminology drift.

This document is the **change list** for the next spec pass. Each row tells a future implementer (or spec editor) what to fix and why.

---

## Audit Summary

| Severity | Count | Status |
|----------|-------|--------|
| **High** | 8 | Must fix before frontend dev starts |
| **Medium** | 13 | Should fix; ambiguous behavior otherwise |
| **Low** | 8 | Cosmetic — terminology drift |

**Pattern of issues:**
1. **Legacy `<CIVContainer size="md">`** appears in 5 Citizen specs — uses old token names; needs migration to `variant="citizen-narrow"`.
2. **"Mobile/desktop" terminology** appears throughout — should be replaced with the new scale (`base`/`sm`/`md`/`lg`/`xl`/`2xl`).
3. **Drawer pattern** in Dashboard specs assumes 480px width universally — missing the `md` 60vw tier and the bottom-sheet transition at `<md`.
4. **Queue table** assumes all 10 columns visible — missing progressive column hiding.
5. **Filters spec** doesn't reflect the `xl+` persistent sidebar transition.

---

## Citizen Portal Specs

### `01-submit-report.md`

| Line | Severity | Issue | Fix |
|------|----------|-------|-----|
| 30 | **High** | `<CIVContainer size="md">` — legacy token | Switch to `variant="citizen-narrow"` |
| 31 | Medium | "2 cols mobile, 5 cols tablet+" | Rewrite as "2 cols `base`/`sm`/`md`, 5 cols `lg`+" |
| 33 | **High** | "sticky variant on mobile" — generic | Scope to `base` and `sm` only; explicit `md`+ exclusion |
| 34 | Medium | "Step indicator — mobile only" | Specify `base`/`sm` only; hidden at `md`+ |
| 42 | Medium | Same step indicator scoping issue | Add `md`+ hide rule |
| 88 | Medium | "full-width mobile, max 240px desktop" | Replace with "full-width `base`/`sm`/`md`, max 240px `lg`+"; lg+ right-align per rule 5 |

### `02-confirmation.md`

| Line | Severity | Issue | Fix |
|------|----------|-------|-----|
| 29 | **High** | `<CIVContainer size="md">` — legacy token | Switch to `variant="citizen-narrow"` |
| 40 | Medium | Hero `--text-display` — no lg+ enrichment callout | Note lg+ inherits enrichment scale automatically (display → 2.5rem) |

### `03-tracking-page.md`

| Line | Severity | Issue | Fix |
|------|----------|-------|-----|
| 30 | **High** | `<CIVContainer size="md">` — legacy token | Switch to `variant="citizen-narrow"` |
| §3, §8 | Low | Status pill / H1 — no lg+ enrichment note | Confirm §8 inherits 1.75rem h1 at lg+ |

### `04-personal-history.md`

| Line | Severity | Issue | Fix |
|------|----------|-------|-----|
| 31 | **High** | `<CIVContainer size="md">` — legacy token | Switch to `variant="citizen-narrow"` |
| 89 | Medium | "full-width mobile, max 280px desktop" | Replace with new scale; lg+ right-align in column |
| 42 | Low | Attribution row right-aligned — no lg+ scoping | Confirm right-align is intentional at all breakpoints |

### `05-email-acknowledgement.md` ✅ Clean
### `06-email-status-change.md` ✅ Clean
### `07-email-magic-link.md` ✅ Clean

Email specs are not viewport-bound — rendered in email clients at fixed width. No fixes needed.

### `08-invalid-tracking-id.md`

| Line | Severity | Issue | Fix |
|------|----------|-------|-----|
| 30 | **High** | `<CIVContainer size="md">` — legacy token | Switch to `variant="citizen-narrow"` |

---

## Authority Dashboard Specs

### `01-sign-in.md`

| Line | Severity | Issue | Fix |
|------|----------|-------|-----|
| §X | Low | `<CIVContainer size="sm">` (400px) — legacy token | Rename to `variant="citizen"` (Sign In uses Citizen Portal container, narrow) |

### `02-dashboard-queue.md`

| Line | Severity | Issue | Fix |
|------|----------|-------|-----|
| 32 | **High** | `<CIVContainer size="lg">` (1200px) — old `--container-lg` token | Replace with `variant="dashboard"` (1440px) / `dashboard-narrow` (1024px) per breakpoint |
| §4 | **High** | All 10 columns listed as visible | Add progressive visibility: base 4, sm 5, md 7, lg 9, xl 10. Mark Status + Actions as sticky |
| §X | Medium | "Filter drawer open" — doesn't reflect xl+ sidebar | Note at `xl`+ filters become persistent 240px sidebar (not a drawer) |
| Bulk bar | Medium | Sticky bottom "full viewport width desktop-first" — no `<md` adaptation | State bar becomes compact bottom-anchored sheet on mobile; confirm widths per breakpoint |

### `03-report-detail.md`

| Line | Severity | Issue | Fix |
|------|----------|-------|-----|
| §X | **High** | Drawer: "480px desktop, 100% mobile" — uses "mobile/desktop" binary | Replace with: bottom sheet `<md`, 60vw at `md`, 480px at `lg`+ |
| §7b | Medium | "modal sheet (mobile) / centered modal (desktop)" — same drift | Use new scale: bottom sheet `<md`, centered modal `md`+ |
| A11y | Low | "drawer is full-width on mobile" — uses "mobile" not breakpoint | Replace "mobile" with `<md` |

### `04-bulk-acknowledge.md`

| Line | Severity | Issue | Fix |
|------|----------|-------|-----|
| §X | Medium | "Position: sticky, full viewport width" + "desktop-first" — no `<md` adaptation | Specify behavior at `<md` (still sticky bottom; may collapse to compact layout) |

### `05-filters.md`

| Line | Severity | Issue | Fix |
|------|----------|-------|-----|
| §3, §4 | **High** | "Opens left drawer" universally; no `xl+` 240px persistent sidebar | Add: at `xl`+ filters become persistent 240px left sidebar; `<xl` filters behind *Filters* button → left drawer |
| Width | Medium | Drawer width 360px stated as fixed | State drawer width applies only at `<xl`; sidebar at `xl`+ is 240px |

### `06-empty-state.md`

| Line | Severity | Issue | Fix |
|------|----------|-------|-----|
| §X | Low | Auto-refresh / polling — no scope on which container | Confirm container uses `dashboard`/`dashboard-narrow` per breakpoint |

### `07-account-sign-out.md`

| Line | Severity | Issue | Fix |
|------|----------|-------|-----|
| §X | Low | No container token specified; popover positioned in top bar | State top bar lives inside `dashboard`/`dashboard-narrow` container |
| Modal | Low | Session expiry modal "max-width 400px" — not tied to §1.5 | Add note that modals remain modal at all sizes per §1.5 |

---

## What Was Updated (no spec edits needed)

- `02-tokens.md` §7 — full breakpoint rewrite + new container tokens
- `04-patterns.md` §0 (new) — responsive invariants
- `04-patterns.md` §1 — page container with explicit per-breakpoint matrix
- `04-patterns.md` §5 — card grids now have per-breakpoint column counts
- `04-patterns.md` §6 — form section with two-column `md`+ opt-in
- `04-patterns.md` §7 — action row with sticky-on-mobile-only clarification
- `04-patterns.md` §18 — right drawer (3-tier: bottom sheet → 60vw → 480px)
- `04-patterns.md` §19 — left drawer + persistent sidebar at `xl+`
- `04-patterns.md` §23 — data table with progressive column hiding + card-list mobile alternative
- `04-patterns.md` §17 — pattern application matrix updated to new container variants

## What Was Updated in the Prototype

- `styles/tokens.css` — added `--container-citizen*`, `--container-dashboard*`, `--bp-*`, `--text-display-lg`, `--text-h1-lg`
- `styles/base.css` — added new responsive container classes + enrichment rules for `.civ-page--citizen` at `lg`+; rewrote grid breakpoints
- `styles/components.css` — added `.civ-col--*` progressive column visibility; rewrote drawer styles to support bottom sheet at `<md` and 60vw at `md`; added `.civ-filters-sidebar` and `.civ-filters-trigger` rules for the `xl+` sidebar transition
- 13 Citizen Portal HTML files — added `civ-page--citizen` body class
- `pages/dashboard/02-queue.html` — added column-hiding classes to headers and JS-rendered rows
- `index.html` — added responsive note + breakpoint hint in legend

---

## Recommended Next Step

Run a focused spec pass to fix the **8 High-severity** items before frontend dev begins. Specifically:

1. Replace `<CIVContainer size="md">` → `<CIVContainer variant="citizen-narrow">` in 5 Citizen specs
2. Replace `<CIVContainer size="lg">` → `<CIVContainer variant="dashboard">` in `02-dashboard-queue.md`
3. Add progressive column-hiding rules to `02-dashboard-queue.md`
4. Add `xl+` persistent sidebar transition to `05-filters.md`
5. Replace "mobile/desktop" binary in `03-report-detail.md` with 3-tier scale

Medium and Low items can be addressed in the same pass as polish.
