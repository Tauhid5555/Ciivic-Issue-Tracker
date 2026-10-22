# ReportIt — Clickable Prototype (P-prototype)

A hand-coded, fully-clickable prototype built directly from the design system tokens and component specs. **No build step. No external services. Open `index.html` in any browser.**

> **Origin:** This artifact was produced by Freya (WDS Designer, Phase 4) on 2026-09-06 from the project specs in `../C-UX-Scenarios/` and design system in `../D-Design-System/`.

---

## How to use it

1. Open `index.html` in any modern browser (Chrome, Firefox, Safari, Edge).
2. From the flow map, click any screen to enter that view.
3. Once inside a screen, use the **demo bar** (bottom-right) to jump to any other screen without returning to the flow map.
4. Most interactions are wired:
   - **Submit Report** → fills form → "Submit Report" → Confirmation
   - **Confirmation** → "Check status now" → Tracking Page (In Progress variant)
   - **Tracking Page** → "This isn't fixed" (Resolved only) → Disputed variant
   - **Sign In** → any email except `wrong@example.com` → Queue
   - **Queue** → 32 realistic reports across all 8 categories and every status
   - **Queue** → click any row → Report Detail drawer with full timeline, notes, location, photo placeholder, priority, action panel
   - **Queue** → row "Acknowledge / Start work / Mark resolved / Review" buttons → updates state immediately (status pill + drawer content re-render)
   - **Queue** → check rows → sticky bulk bar appears with "Acknowledge N" / "Start work N" / "Set priority" → updates all selected rows + toast
   - **Queue** → Filters button → left drawer (search, category, status, date, location, priority, reporter) → live filter + active-filter chips with × to clear
   - **Queue** → click Status / Priority / Submitted / Category / Location column headers → sort asc/desc
   - **Queue** → pagination 10/25/50 per page, with ‹ Prev / Next › and numeric pages
   - **Queue** → "Add note" inside any drawer → adds entry to the timeline and re-renders
   - **Queue** → avatar (top-right) → account popover → Sign out
   - **Photo thumbnails** → click → lightbox
   - All state changes persist for the session via an in-memory store; navigating across queue variants keeps your filters, sort, selection, and status edits

---

## What's in here

```
P-prototype/
├── index.html                     ← Flow map / entry point
├── README.md                      ← You are here
├── styles/
│   ├── tokens.css                 ← All design tokens as CSS custom properties
│   ├── base.css                   ← Resets, typography, utilities
│   └── components.css             ← All CIV* components
├── scripts/
│   ├── app.js                     ← Toasts, demo data, demo bar
│   ├── interactions.js            ← Drawers, modals, popovers, dropdowns
│   ├── prototype-state.js         ← In-memory store: 32 reports, filters, transitions
│   └── prototype-ui.js            ← Queue rendering, drawer, filters, pagination wiring
└── pages/
    ├── citizen/                   ← 14 Citizen Portal screens
    │   ├── index.html                   ← Citizen Portal landing
    │   ├── 01-submit.html
    │   ├── 02-confirmation.html
    │   ├── 03-tracking-submitted.html
    │   ├── 03-tracking-acknowledged.html
    │   ├── 03-tracking-in-progress.html
    │   ├── 03-tracking-resolved.html
    │   ├── 03-tracking-disputed.html       ← 5 status variants
    │   ├── 04-personal-history.html
    │   ├── 04b-magic-link-request.html
    │   ├── 05-email-acknowledgement.html   ← Email 1
    │   ├── 06-email-status-change.html     ← Email 2
    │   ├── 07-email-magic-link.html        ← Email 3
    │   └── 08-invalid-tracking.html
    └── admin/                     ← 9 Admin Portal screens (was Authority Dashboard)
        ├── index.html                   ← Admin Portal landing
        ├── 01-sign-in.html
        ├── 02-queue.html                 ← Base queue (11 rows)
        ├── 02-queue-empty.html           ← Variant: filter returns 0
        ├── 02-queue-bulk.html            ← Variant: 3 rows pre-selected (shows bulk bar)
        ├── 02-queue-filters.html         ← Variant: filters drawer auto-open
        ├── 02-queue-account.html         ← Variant: account popover auto-open
        ├── 03-report-detail.html         ← Standalone Report Detail
        └── 06-empty-state.html           ← Page 06 (6a + 6b variants)
```

---

## What's wired (interactions map)

| From | To | Trigger |
|---|---|---|
| 01 Submit | 02 Confirmation | Submit Report button |
| 02 Confirmation | 03 Tracking (In Progress) | "Check status now" |
| 02 Confirmation | 01 Submit | "Report another problem" |
| 03 Tracking (any) | (in-place) | Copy ID button (toast confirms) |
| 03 Tracking (Submitted) | (in-page form) | "Notify me" email subscribe |
| 03 Tracking (Resolved) | 03 Tracking (Disputed) | "This isn't fixed" |
| 04 Personal History | 03 Tracking (any) | Click any report card |
| 04 Personal History | 04b Magic Link Request | "Sign out" |
| 01 Sign In | 02 Queue | Submit (any email except `wrong@example.com`) |
| 02 Queue | (drawer) | Click any table row |
| 02 Queue | (modal: Duplicate picker) | "Mark as duplicate" |
| 02 Queue | (modal: Resolution form) | "Mark resolved" |
| 02 Queue | (modal: Reopen form) | "Reopen" (Disputed rows) |
| 02 Queue | (left drawer: Filters) | Filters button |
| 02 Queue | (popover: Account menu) | Avatar button |
| Any email page | (in-page) | All CTAs demo toasts |

---

## Coverage vs. spec

| Spec | Pages in prototype | States represented |
|---|---|---|
| 01 Submit | ✓ | Default + form interactions |
| 02 Confirmation | ✓ | With-email + anonymous variants |
| 03 Tracking | ✓ | All 5 status variants (Submitted, Acknowledged, In Progress, Resolved, Disputed) |
| 04 Personal History | ✓ | Loaded + 04b magic link request |
| 05 Email Acknowledgement | ✓ | Standard |
| 06 Email Status Change | ✓ | In Progress variant (most common transition) |
| 07 Email Magic Link | ✓ | Standard |
| 08 Invalid Tracking ID | ✓ | Default |
| 02-01 Sign In | ✓ | Default + wrong-credentials error |
| 02-02 Dashboard Queue | ✓ | Loaded (32 rows), empty-filter, bulk-selected, filters-open, account-open |
| 02-03 Report Detail | ✓ | In Progress variant + 3 modals (Duplicate picker, Resolution, Reopen) |
| 02-04 Bulk Acknowledge | ✓ | Embedded in queue via bulk variant |
| 02-05 Filters | ✓ | Drawer with all sections + apply/reset |
| 02-06 Empty State | ✓ | Both 6a (no reports) + 6b (no matches) |
| 02-07 Account/Sign Out | ✓ | Popover + sign-out (redirects to Sign In) |

**Coverage: 100% of 15 page specs realized as interactive screens.**

---

## Design system fidelity

Every page references the tokens in `styles/tokens.css`. **No inline color, font, or spacing values** are used outside that file. To re-skin the prototype (e.g., test dark mode or a different accent), change the tokens and everything updates.

Component classes (`.civ-card`, `.civ-btn`, `.civ-pill`, `.civ-banner`, etc.) are defined in `styles/components.css`. They're directly translatable to whatever UI framework the dev team chooses — they're written in plain CSS with no framework dependencies.

---

## What this prototype is NOT

- **Not pixel-perfect.** Layouts follow the patterns in `D-Design-System/04-patterns.md` but are not tuned to the last px.
- **Not a real app.** No backend, no persistence, no auth. Form submissions show toasts and link to the next demo state.
- **Not a Figma file.** A Figma export is a separate pass — see `_bmad/wds/workflows/6-asset-generation/workflow-figma.md`.
- **Not production code.** Inline JS, no test coverage, no build pipeline. Use it as a design reference and a UX validation tool.

---

## Dev handoff notes

This prototype is the **definitive reference for visual implementation**. When building:

1. **Tokens are the source of truth.** `styles/tokens.css` should map 1:1 to whatever design-tokens file your framework uses (Tailwind config, CSS variables in your app, etc.).
2. **Component CSS is the structural reference.** The class names (`.civ-btn--primary`, `.civ-pill--acknowledged`, etc.) are intentionally descriptive — keep them when you implement.
3. **The interaction logic in `scripts/interactions.js` is a sketch, not a recipe.** Your real implementation needs:
   - Optimistic UI with proper server reconciliation (the bulk-action flow in `02-queue.html` is a sketch)
   - Real auth flow (the sign-in here just redirects)
   - Real magic-link request/consume flow (the form here just toasts)
   - Server-driven state for report detail (here the drawer renders client-side demo data)
4. **Accessibility checklist** (per spec):
   - All inputs have `<label>`
   - All status pills carry text + color (never color-only)
   - All tap targets ≥ 44×44px
   - Modals/drawers trap focus and restore it on close
   - `prefers-reduced-motion` honored (see `tokens.css`)
   - All text meets AA contrast (token palette is AA by construction)

---

## Updating the prototype

When you change a spec:

1. Update the relevant page in `C-UX-Scenarios/`.
2. Update the matching page in `P-prototype/pages/`.
3. If tokens change, edit `styles/tokens.css`.
4. If component patterns change, edit `styles/components.css` and the spec in `D-Design-System/03-components.md`.

This prototype is intended to track the spec — when one changes, the other should too.

---

## How this was built

- **Approach:** Hand-coded HTML+CSS+JS using design tokens as CSS custom properties.
- **Rejected:** Stitch (free-tier limits, less control), Figma (not clickable in browser without prototype mode), static images (not interactive).
- **Why this works:** The design system is complete. Tokens + components give us everything we need to express every spec literally.
- **Effort:** ~1 design pass to map every page → screen, then token-by-token assembly.
- **Trade-off:** Visual fidelity is high (matches tokens exactly), but the prototype is not a Figma design file — devs will want Figma frames for handoff if their team uses Figma.

---

_Maintained by Freya (WDS Designer). Last updated 2026-09-06._
