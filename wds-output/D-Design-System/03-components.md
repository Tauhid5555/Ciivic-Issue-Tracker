---
title: Component Library — Civic Issue Reporter & Tracker
scenario: 00 Foundations (used by 01 Citizen Portal and 02 Authority Dashboard)
created: 2026-09-06
status: draft
---

# Component Library

Canonical specifications for every reusable component. Pages reference these by name instead of describing inline. Tokens are from `02-tokens.md`.

Naming convention: `{Namespace}{ComponentName}` — e.g., `<CIVButton>`, `<CIVStatusPill>`. Implementation prefix TBD by dev team.

---

## 1. Buttons

### 1.1 `<CIVButton variant="primary">`

The default action affordance. One per view, max. Always full-width on mobile when sticky or in a form submit row.

| Property | Spec |
|----------|------|
| Padding | `--space-4` horizontal × `--space-3` vertical |
| Min height | 52px (mobile tap target floor) |
| Radius | `--radius-md` |
| Background | `--color-brand` |
| Text color | `#FFFFFF` (AA on brand) |
| Font | `--text-body` `--weight-medium` |
| Hover | bg `--color-brand-strong`, transition `--motion-fast` |
| Pressed | scale `0.98`, transition `--motion-fast` |
| Disabled | bg `--color-surface-muted`, text `--color-ink-subtle`, cursor `not-allowed` |
| Loading | text replaced by `<Spinner size=sm>` + "…" suffix; button stays same width |
| Focus | 2px ring `--color-focus` offset 2px |

### 1.2 `<CIVButton variant="secondary">`

For secondary actions on the same view (e.g., the dispute button on Tracking Page, the magic-link re-request link).

| Property | Spec |
|----------|------|
| Padding | `--space-4 × --space-3` |
| Min height | 52px |
| Radius | `--radius-md` |
| Background | `--color-surface` |
| Border | 1px `--color-border` |
| Text color | `--color-ink` |
| Hover | bg `--color-surface-muted` |
| Pressed | scale `0.98` |
| Disabled | text `--color-ink-subtle`, bg `--color-surface-muted` |
| Focus | ring `--color-focus` offset 2px |

### 1.3 `<CIVButton variant="ghost">`

For tertiary actions and inline links styled as buttons (e.g., "Report another problem", "Add a note for the team").

| Property | Spec |
|----------|------|
| Padding | `--space-3 × --space-2` |
| Min height | 44px |
| Background | transparent |
| Text color | `--color-brand` (or `--color-ink-muted` for de-emphasized) |
| Hover | underline, color `--color-brand-strong` |
| Focus | ring `--color-focus` offset 2px |

### 1.4 `<CIVButton variant="danger">`

Reserved for the dispute action — destructive in intent but not in effect (dispute doesn't delete, just flags).

| Property | Spec |
|----------|------|
| Padding | `--space-4 × --space-3` |
| Min height | 52px |
| Radius | `--radius-md` |
| Background | `--color-surface` |
| Border | 1.5px `--color-error` |
| Text color | `--color-error` `--weight-medium` |
| Hover | bg `--color-error-bg` |
| Pressed | scale `0.98` |
| Focus | ring `--color-focus` offset 2px |

---

## 2. Form inputs

All form inputs share:
- 52px height (mobile tap target)
- 16px font (prevents iOS zoom)
- Label above field (not floating)
- Helper text below field
- Inline error below helper

### 2.1 `<CIVTextInput>`

| Property | Spec |
|----------|------|
| Height | 52px |
| Padding | `--space-4` horizontal, `--space-3` vertical |
| Radius | `--radius-md` |
| Background | `--color-surface` |
| Border | 1px `--color-border`, 1.5px on focus (`--color-focus`) |
| Text | `--text-body` `--weight-regular`, `--color-ink` |
| Placeholder | `--color-ink-subtle` |
| Disabled | bg `--color-surface-muted`, text `--color-ink-subtle` |
| Error border | 1.5px `--color-error` |
| Required indicator | "*" in label, color `--color-error`, aria-described-by |

### 2.2 `<CIVTextarea>`

| Property | Spec |
|----------|------|
| Min height | 4 rows visible (~120px) |
| Padding | `--space-4 × --space-3` |
| Radius | `--radius-md` |
| Resize | vertical only |
| Font | `--text-body` `--weight-regular` |
| Char counter | bottom-right, `--text-caption`, `--color-ink-subtle`. `--color-warning` at 90% of max. `--color-error` at 100% (no hard block, just signal). |

### 2.3 `<CIVEmailInput>`

Inherits `<CIVTextInput>`. Adds:
- `type="email"`
- `autocomplete="email"`
- On blur: format validation; invalid → inline error: *"That doesn't look like a valid email."*

### 2.4 `<CIVFileInput variant="photo-dropzone">`

| Property | Spec |
|----------|------|
| Default | Dashed border 2px `--color-border`, bg `--color-surface`, height 120px. Icon (camera, 32px) + copy *"Tap to add a photo."* Centered. |
| Hover | border `--color-brand`, bg `--color-brand-soft` |
| Drag-over (desktop) | border `--color-brand-strong`, bg `--color-brand-soft` |
| Filled | Replace drop zone with thumbnail 96px + filename + size + *Remove* ghost link |
| Error | Border `--color-error`, error message below: *"That file is too large…"* or *"We accept JPEG, PNG, or HEIC."* |
| Accept | `image/jpeg,image/png,image/heic` |
| Max size | 10MB (FR-1) |

### 2.5 `<CIVSelect>` (dropdown)

Used only for category pickers where chip cards aren't appropriate (rare in this product — Category is chip-cards on Submit).

| Property | Spec |
|----------|------|
| Inherits | `<CIVTextInput>` styling |
| Caret | chevron-down icon, right-aligned, `--color-ink-muted` |
| Open | native dropdown (or custom popover per browser support) |

---

## 3. Status & state components

### 3.1 `<CIVStatusPill variant size>`

The single most-repeated component in the product. Carries status meaning. **Every status color decision lives here, not in pages.**

| Status | Pill text | Color (text) | Background | Border |
|--------|-----------|--------------|------------|--------|
| Submitted | "Received" | `--status-submitted` | `--status-submitted-bg` | none |
| Acknowledged | "Being looked at" | `--status-acknowledged` | `--status-acknowledged-bg` | none |
| In Progress | "Work in progress" | `--status-in-progress` | `--status-in-progress-bg` | none |
| Resolved | "Resolved" | `--status-resolved` | `--status-resolved-bg` | none |
| Disputed | "You flagged this" | `--status-disputed` | `--status-disputed-bg` | none |
| Closed-Duplicate | "Duplicate" | `--status-duplicate` | `--color-surface-muted` | none |

| Property | Spec |
|----------|------|
| Padding | `--space-1` vertical × `--space-3` horizontal |
| Radius | `--radius-pill` |
| Font | `--text-caption` `--weight-semibold` |
| Height (sm variant) | 24px |
| Height (md variant) | 28px |
| Height (lg variant — hero) | 36px |
| Icon | none — color + text carries meaning (never color-only signaling) |
| Accessibility | pill text is the accessible name; `aria-label` not needed |

### 3.2 `<CIVBanner tone="info|warning|error|success">`

Used for inline status messages (e.g., the disputed banner, the expired-link banner, the "you didn't leave an email" card).

| Property | Spec |
|----------|------|
| Padding | `--space-4 × --space-5` |
| Radius | `--radius-md` |
| Background | tone-specific (info: `--color-brand-soft`, warning: `--color-warning` 8% alpha or surface-muted, error: `--color-error-bg`, success: `--status-resolved-bg`) |
| Border | none |
| Icon (left) | tone-specific (info circle, warning triangle, error circle, check) |
| Text | `--text-body-sm` `--color-ink` (or `--color-error` for error tone) |
| Optional action | ghost button right-aligned |
| Role | `role="status"` for success/info, `role="alert"` for error |

### 3.3 `<CIVToast>`

Transient feedback (e.g., "Tracking ID copied", "Email saved").

| Property | Spec |
|----------|------|
| Position | top-center, `--space-4` from top |
| Auto-dismiss | 3 seconds (info), 5 seconds (success), manual dismiss only (error) |
| Background | `--color-ink` `#FFFFFF` text |
| Radius | `--radius-lg` |
| Shadow | `--shadow-lg` |
| Role | `role="status"` `aria-live="polite"` |

---

## 4. Cards & containers

### 4.1 `<CIVCard>`

The base card. Every card-based surface (summary, report, list item, hero) uses this.

| Property | Spec |
|----------|------|
| Background | `--color-surface` |
| Radius | `--radius-lg` |
| Shadow | `--shadow-sm` |
| Padding | `--space-5` (default), `--space-6` (large variant), `--space-4` (compact variant) |
| Border | none (shadow carries elevation) |
| Interactive (whole-card link) | hover bg `--color-surface-muted`, pressed `--motion-fast` scale 0.99 |

### 4.2 `<CIVCard variant="hero">`

For the Tracking Page status hero block.

| Property | Spec |
|----------|------|
| Background | `--color-surface` |
| Padding | `--space-8` |
| Shadow | `--shadow-md` |
| Layout | vertical, centered text |
| Used for | status headline, confirmation hero |

### 4.3 `<CIVReportCard>`

The list item used in Personal History (and reusable elsewhere).

| Property | Spec |
|----------|------|
| Inherits | `<CIVCard>` |
| Top row | `<CIVStatusPill size=sm>` left + submitted date (`--text-caption`) right |
| Middle row | category icon + label |
| Bottom row | description snippet (truncated, 80 chars max) |
| Tap target | entire card → wrapped in `<a>` to Tracking Page |
| Hover/press | per `<CIVCard>` interactive behavior |

---

## 5. Selection components

### 5.1 `<CIVCategoryCard>`

Used in the Submit form for the 5 categories.

| Property | Spec |
|----------|------|
| Default | bg `--color-surface`, border 1.5px `--color-border`, radius `--radius-lg`, padding `--space-5` |
| Default size | min height 96px (mobile tap target) |
| Layout | vertical — icon 24px top-left, label `--text-h3` below |
| Hover (desktop) | border `--color-brand` |
| Selected | bg `--color-brand-soft`, border 2px `--color-brand`, checkmark top-right |
| Pressed | scale 0.98, transition `--motion-fast` |
| Focus | ring `--color-focus` offset 2px |
| Disabled (rare) | opacity 0.5 |

### 5.2 `<CIVFilterChip>`

Used in Personal History and (later) Authority Dashboard.

| Property | Spec |
|----------|------|
| Default | bg `--color-surface`, border 1px `--color-border`, text `--color-ink`, radius `--radius-pill`, padding `--space-2 × --space-4`, height 36px |
| Active | bg `--color-brand-soft`, border 1.5px `--color-brand`, text `--color-brand` |
| Hover | bg `--color-surface-muted` |
| Focus | ring `--color-focus` offset 2px |
| ARIA | `<button aria-pressed="true|false">` |

---

## 6. Time & relative display

### 6.1 `<CIVRelativeTime datetime>`

| Property | Spec |
|----------|------|
| Format | <1min: "just now"; <1h: "X minutes ago"; <24h: "X hours ago"; <7d: "X days ago"; else: absolute date |
| Tooltip | absolute datetime on hover/focus |
| Refresh | every 60s while page is open |
| Update behavior | smooth, no animation — text just replaces |

---

## 7. Timeline

### 7.1 `<CIVTimeline>`

Container for status history.

| Property | Spec |
|----------|------|
| List element | `<ol>` (ordered by occurrence) |
| Gap between rows | `--space-4` |
| Left rail | 2px line `--color-border` (vertical) connecting markers |
| Marker | 16px circle, fill = status color of the row's entered status, white border 2px |
| Current row marker | ring `--color-brand-soft` 4px (highlight) |
| Reverse order | yes, most recent first (CSS `flex-direction: column-reverse` or source order reversed) |

### 7.2 `<CIVTimelineRow status actor timestamp>`

| Property | Spec |
|----------|------|
| Layout | marker (left, 32px column) + content (right) |
| Status | pill text + status-conditional description |
| Actor label | "You" for citizen actions; "The team" for authority actions; "System" for system-generated (only first Submitted row) |
| Timestamp | `<CIVRelativeTime>` + absolute datetime on tap/hover |
| Content slot | optional resolution block (for Resolved rows), dispute note (for Disputed rows) |

---

## 8. Map & location

### 8.1 `<CIVMapPin variant="static|draggable|placed">`

Used on Submit (location picker) and Tracking Page (location display, static).

| Property | Spec |
|----------|------|
| static (display) | brand-colored pin, no interaction |
| draggable | larger pin (40px), cursor `grab`, dragging → `grabbing` |
| placed | post-confirmation animation: pin drops from `--space-2` above with `--motion-spring` |
| Accessibility | visible focus ring when keyboard-navigable; tap-to-place fallback always available |

### 8.2 `<CIVLocationPicker>`

Composite: `<CIVMapPin>` + map + helper text + tap-to-place fallback. See Submit page spec §3 for full behavior.

---

## 9. Photo & media

### 9.1 `<CIVPhotoThumbnail size src caption onRemove>`

Used in: Submit (filled state), Tracking Page summary, Tracking Page timeline (resolution after-photo).

| Property | Spec |
|----------|------|
| Default size | 96px square |
| Radius | `--radius-md` |
| Tap | opens `<CIVLightbox>` |
| Caption | below or beside, `--text-caption`, `--color-ink-subtle` |
| Remove (Submit only) | ghost link below thumbnail: *"Remove"* |

### 9.2 `<CIVLightbox>`

| Property | Spec |
|----------|------|
| Open | full screen on mobile, centered modal on desktop (max 90vw × 90vh) |
| Background | `--color-ink` at 95% alpha |
| Close | X button top-right + tap outside + ESC key |
| Image | fit-contain |
| ARIA | `role="dialog"` `aria-modal="true"` `aria-label="Photo viewer"` |
| Focus | trapped inside; returns to thumbnail on close |

---

## 10. Empty & loading states

### 10.1 `<CIVEmptyState illustration title body cta>`

Used for: Personal History (no reports), filter-empty, Invalid Tracking ID.

| Property | Spec |
|----------|------|
| Layout | vertical, centered, max-width 360px, padding `--space-8` |
| Illustration | optional, max 160px height, gray-on-white (decorative, `aria-hidden`) |
| Title | `--text-h2`, `--color-ink` |
| Body | `--text-body`, `--color-ink-muted` |
| CTA | optional `<CIVButton variant="primary">` below body |

### 10.2 `<CIVLoadingSkeleton variant>`

| Property | Spec |
|----------|------|
| Shimmer | subtle gradient sweep, 1.5s loop, respects `prefers-reduced-motion` |
| Card skeleton | matches `<CIVCard>` dimensions |
| Text skeleton | rounded rect, height = line-height |
| Photo skeleton | square rect with `--radius-md` |
| Status pill skeleton | pill-shaped, height 28px, width varies |

---

## 11. Layout primitives

### 11.1 `<CIVContainer size>`

| Property | Spec |
|----------|------|
| Width | `100%` mobile; max `--container-sm` (640px) / `--container-md` (768px) / `--container-lg` (1200px) per size prop |
| Padding-x | `--space-4` mobile, `--space-6` tablet+ |
| Margin | auto (centered) |

### 11.2 `<CIVStack gap>`

Vertical stack. `gap` is a spacing token name. Replaces ad-hoc flexbox with `flex-direction: column`.

### 11.3 `<CIVCluster gap wrap>`

Horizontal flow with wrap. Used for filter chips, action buttons, info clusters.

### 11.4 `<CIVGrid cols gap>`

Used for category cards (2 cols mobile, 5 cols tablet+).

---

## 12. Email frame

### 12.1 `<CIVEmailFrame header body footer>`

All transactional emails use this frame.

| Property | Spec |
|----------|------|
| Outer background | `--color-bg` (warm off-white) |
| Inner max-width | 600px |
| Header | "ReportIt" wordmark, centered, padding `--space-6 × --space-4` |
| Body | `--color-surface` bg, padding `--space-8 × --space-6` |
| Footer | small text, `--color-ink-subtle`, padding `--space-6 × --space-4`. Includes: city contact, privacy link, "why am I getting this?" link |
| Typography | same type scale as web; `--text-body` default |
| Colors | inline-styled (email clients don't render CSS vars) — use literal hex from tokens |
| CTA button | `<CIVButton>` rendered as a button-shaped link (inline-styled) |

---

## 13. Accessibility hooks (apply across all components)

- Every interactive element has a visible focus indicator (`--color-focus` ring, 2px offset 2px).
- Every icon-only button has an `aria-label`.
- Every form field has a programmatic `<label>`.
- Every status/color signal has a text equivalent (no color-only meaning).
- Every modal/dialog has focus trap + ESC-to-close + restore-focus.
- Every component respects `prefers-reduced-motion` (springs become fades, no scale).
- Every text color combination passes AA contrast on its actual background.

---

## 14. Form controls (advanced)

### 14.1 `<CIVCheckbox>`

| Property | Spec |
|----------|------|
| Box size | 20px square, `--radius-sm` |
| Border | 1.5px `--color-border`, 2px `--color-brand` when checked |
| Checked bg | `--color-brand` with white checkmark (inline SVG, 14px) |
| Indeterminate bg | `--color-brand` with white dash |
| Hover (unchecked) | border `--color-ink-muted` |
| Focus | ring `--color-focus` offset 2px |
| Disabled | opacity 0.5, cursor `not-allowed` |
| Label gap | `--space-3` from box |
| Label click | toggles checkbox (entire row interactive) |
| Touch target | wrapping `<label>` ≥ 44px tall |

### 14.2 `<CIVRadio>`

| Property | Spec |
|----------|------|
| Outer circle | 20px, border 1.5px `--color-border` |
| Selected | border 2px `--color-brand`, inner dot 10px `--color-brand` |
| Hover | border `--color-ink-muted` |
| Focus | ring `--color-focus` offset 2px |
| Group semantics | `<fieldset>` + `<legend>` for accessibility |
| ARIA | uses native `<input type="radio">`; styling only |

### 14.3 `<CIVDropdown>` (custom popover)

Used where native `<select>` doesn't fit (filter panels, quick menus). Falls back to native on small screens.

| Property | Spec |
|----------|------|
| Trigger | `<button>` with current value + chevron-down icon |
| Open state | popover below trigger, `--radius-md`, `--shadow-md`, `--color-surface` bg |
| Popover width | min 200px, max-content |
| Items | `<button>` or `<a>`, padding `--space-3 × --space-4`, full-width, hover bg `--color-surface-muted` |
| Active item | bg `--color-brand-soft`, text `--color-brand` |
| Divider | 1px `--color-border`, margin `--space-2` vertical |
| Close triggers | item click, click outside, ESC |
| Keyboard | Arrow keys navigate items; Enter activates; ESC closes |
| ARIA | `<button aria-haspopup="listbox" aria-expanded>`, popover `role="listbox"` |

### 14.4 `<CIVDateInput>`

Native `<input type="date">` styled to match `<CIVTextInput>`. v1 uses browser-native picker.

| Property | Spec |
|----------|------|
| Height | 52px (matches `<CIVTextInput>`) |
| Padding | `--space-4 × --space-3` |
| Radius | `--radius-md` |
| Border | 1px `--color-border`, 1.5px `--color-focus` on focus |
| Picker icon | native calendar icon (right-aligned, `--color-ink-muted`) |
| Min/max | set per use case (e.g., no future dates for "from" filters) |
| Keyboard | fully native |

### 14.5 `<CIVSegmentedControl>` (generic)

Generic 2-4 segment toggle. Used by `<CIVPrioritySegmentedControl>` (specialized variant).

| Property | Spec |
|----------|------|
| Container | horizontal flex, full-width, `--radius-md`, bg `--color-surface-muted`, padding `--space-1` |
| Segment | flex 1, height 40px, padding `--space-2 × --space-3`, `--radius-sm` |
| Segment default | text `--color-ink`, bg transparent |
| Segment selected | bg `--color-surface`, text `--color-ink`, `--shadow-sm` |
| Segment hover (unselected) | bg `--color-surface` opacity 0.5 |
| Focus | ring `--color-focus` offset 2px on selected segment |
| ARIA | `role="radiogroup"` on container, `role="radio" aria-checked` on each segment |

### 14.6 `<CIVPrioritySegmentedControl>` (specialized)

| Property | Spec |
|----------|------|
| Inherits | `<CIVSegmentedControl>` |
| Options | Low / Medium / High / Urgent |
| Each segment | label + color dot (8px, left of label): `--color-ink-subtle` / `--color-brand` / `--color-warning` / `--color-error` |
| Selected segment | bg `--color-brand-soft`, text `--color-brand`, semibold |
| Behavior | one-click save (no submit). Optimistic. Toast on save. |
| Concurrency | revert on 409 with toast |

---

## 15. Overlays & menus

### 15.1 `<CIVMenuPopover>`

Account menu, user menus. Used in dashboard top bar.

| Property | Spec |
|----------|------|
| Trigger | avatar / icon button |
| Position | below trigger, right-aligned (or left-aligned near edge) |
| Width | 240px |
| Background | `--color-surface`, `--radius-md`, `--shadow-lg` |
| Padding | `--space-2` |
| Header section | padding `--space-3 × --space-4`, name + email stacked |
| Item | `<button>` or `<a>`, padding `--space-2 × --space-3`, `--radius-sm`, full-width, text left-aligned |
| Item hover | bg `--color-surface-muted` |
| Item destructive | text `--color-error` |
| Divider | 1px `--color-border`, margin `--space-1 × 0` |
| Close triggers | click outside, ESC, item click |
| ARIA | `<button aria-haspopup="menu" aria-expanded>`, popover `role="menu"`, items `role="menuitem"` |
| Animation | fade + scale from 0.95, `--motion-fast`. Respects `prefers-reduced-motion`. |

### 15.2 `<CIVModal>` (centered)

Used for: Duplicate picker, Resolution form, Reopen form, Session expiry, Sign-out confirm.

| Property | Spec |
|----------|------|
| Width | 400px (small) / 560px (medium) / 720px (large) |
| Background | `--color-surface`, `--radius-lg`, `--shadow-lg` |
| Backdrop | `--color-ink` at 50% alpha |
| Padding | `--space-6` content, `--space-4 × --space-6` header/footer |
| Header | title + optional subtitle + close X |
| Footer | right-aligned actions (primary + ghost) |
| Animation | fade + scale from 0.96, `--motion-normal`. Respects `prefers-reduced-motion`. |
| Close triggers | X button, Cancel action, ESC (with confirm if dirty form) |
| ARIA | `role="dialog"` or `role="alertdialog"` (for session expiry), `aria-modal="true"`, `aria-labelledby` (title) |
| Focus | trapped, restored on close |

### 15.3 `<CIVBottomSheet>` (mobile modal)

Same content as `<CIVModal>` but slides up from bottom on mobile.

| Property | Spec |
|----------|------|
| Width | 100% mobile, max 560px on tablet+ |
| Position | fixed bottom, full width |
| Border-radius | top corners `--radius-lg` |
| Animation | slide up from `--space-8`, `--motion-normal` |
| Drag to dismiss | optional v2 (v1: explicit close button + backdrop tap) |
| Padding-top | `--space-2` (for the drag handle visual) |

### 15.4 `<CIVDrawer>` (side panel)

Used for: Report Detail (right), Filters (left).

| Property | Spec |
|----------|------|
| Width | 360px (filters) / 480px (report detail) / 100% mobile |
| Position | fixed (right or left), full viewport height |
| Background | `--color-bg` (page bg shows through) or `--color-surface` (alt) |
| Shadow | `--shadow-lg` on the leading edge |
| Animation | slide from edge, `--motion-normal`. Respects `prefers-reduced-motion`. |
| Backdrop | `--color-ink` at 30% alpha, click closes |
| Header (sticky) | title + close X, border-bottom 1px `--color-border` |
| Footer (sticky, optional) | primary action(s), border-top 1px `--color-border` |
| ARIA | `<aside role="dialog" aria-modal="true" aria-label="...">` |
| Focus | trapped, restored on close |

---

## 16. Data table

### 16.1 `<CIVDataTable columns rows>`

The Queue table (Page 02). Used wherever tabular data needs to be dense, sortable, and selectable.

| Property | Spec |
|----------|------|
| Wrapper | semantic `<table>` with `<thead>` / `<tbody>` |
| Header row | `--color-surface-muted` bg, `--text-label` semibold, uppercase, `--color-ink-subtle` |
| Header cell padding | `--space-3 × --space-4` |
| Sortable header | `<button>` inside `<th>` with `aria-sort="ascending"|"descending"|"none"` |
| Sort indicator | chevron-up / chevron-down / chevron-up-down icon |
| Row hover | bg `--color-surface-muted` |
| Row selected | bg `--color-brand-soft` |
| Cell padding | `--space-3 × --space-4` |
| Compact variant | padding `--space-2 × --space-3`, font `--text-body-sm` |
| Photo column | fixed width 56px, 40px square thumbnail |
| Action column | right-aligned, fixed width 140px |
| Pagination | row count + page navigation right-aligned; page size selector left-aligned |
| Loading | `<CIVLoadingSkeleton>` rows (5 visible) |
| Empty | `<CIVEmptyState>` slot |
| Responsive | horizontal scroll on mobile; key columns sticky-left (status) and sticky-right (actions) |
| ARIA | `<table>` semantics; `aria-busy` during load |

---

## 17. Component checklist (per component, before "done")

- [ ] Tokens referenced (no raw hex/px in props)
- [ ] All variants documented (default, hover, pressed, disabled, focus, error, loading)
- [ ] Mobile + desktop behavior documented
- [ ] Accessibility notes (ARIA, focus, contrast)
- [ ] At least one usage example
- [ ] Cross-referenced from at least one page spec

---

## 18. As built in the thin slice (Nov 2026)

How the specified components were actually built in `frontend/src/`. Where the build differs from the spec above, the difference is listed so the spec and the code do not drift apart silently. Names in the code are plain React names, not the `CIV…` names used in this document.

| Spec | Built as | Differences from the spec |
|------|----------|---------------------------|
| 2.4 `<CIVFileInput variant="photo-dropzone">` | `PhotoPicker.tsx` | Drag-over, hover, filled state with a 96px preview, file name and size are built. **Not built:** the *Remove* link (choose a different photo instead), the red error border, a fixed 120px height. Adds a note that location details inside the photo are removed on save. HEIC photos show the file name where the browser cannot preview them. |
| 5.1 `<CIVCategoryCard>` | `CategoryPicker.tsx` | Real radio buttons shown as tiles with a line icon per category (streetlight, pothole, garbage, drainage, noise). The tiles fill the row (`auto-fill`, minimum 7.5rem) and lift on hover. **Not built:** the check mark top-right (the selected tile uses a filled background, a green border and a popping icon). Padding is `--space-4`, not `--space-5`. |
| 8.1 `<CIVMapPin>` and 8.2 `<CIVLocationPicker>` | `LocationPicker.tsx` | Leaflet map limited to a box around Dhaka, a draggable pin, tap-to-place, keyboard control (Enter places the pin, arrow keys move it), a search box (results as the person types), and the latitude and longitude fields kept in sync as the fallback. Not in the spec: the Dhaka limit, the search. See `README.md`, "Accepted risks for the pilot" (R1 to R4). |
| 10.1 `<CIVEmptyState>` | `EmptyState` in `components.tsx` | A small drawing, a title and a line of text. **Not built:** the call-to-action button. Used on the staff queue; the invalid Tracking ID page still uses plain text. |
| 10.2 `<CIVLoadingSkeleton>` | `.skeleton` in `styles.css` | A shimmering block. Used on the tracking page and while the category tiles load. |
| 3.1 `<CIVStatusPill>` | `StatusBadge` | Same statuses. Adds the Disputed flag. |
| 7.1 `<CIVTimeline>` | `ol.timeline` | Plain list. Backward moves are not yet labelled "Reopened". |

**Built but not in the spec above**

| Component | Where | What it is |
|-----------|-------|------------|
| `Logo` | `components.tsx` | Pin with a check mark, in the brand gradient. Same idea as the pin + check logo recorded in the design log (Sep 2026), drawn again as a React component. |
| `ProgressTracker` | `components.tsx` | Four steps (Submitted, Acknowledged, In Progress, Resolved) with a line that fills when the page opens. Each step has its own accent colour. Closed-Duplicate shows only the badge. |
| `HeroShowcase` | `HeroShowcase.tsx` | Looping phone animation beside the report form (photo, pin, Tracking ID, progress). Built with the `motion` library. Decorative: hidden from screen readers, paused when the tab is hidden, one still frame under reduced motion. |
| `NextSteps` | `components.tsx` | "What happens after you send a report": a bar of three steps (we receive it, staff look at it, you can follow it) with their full wording. Sticky at the bottom of the window from 1024px up, resting above the footer; an ordinary block below 1024px. About 150px tall when sticky. Wording is in `04-patterns.md` section 26. |
| `PriorityBadge` | `components.tsx` | Priority pill: grey Low, blue Medium, amber High, coral Urgent. |
| `MapLink` | `components.tsx` | "View on map" link to OpenStreetMap, shown beside coordinates. It leaves the site (risk R1). |
| `useCategoryLabel` | `components.tsx` | Turns a category code into its label. |
| Footer | `App.tsx` | Brand, three links and the map-provider privacy note. Not in the spec; the prototype footer had Privacy, Accessibility and Contact links and a phone number, which the thin slice does not have. |

**Formatting rules built into `api.ts`**
- Dates are shown in Dhaka time, day first, without seconds: `19 Nov 2026, 10:03 PM`.
- The staff queue shows relative time (`2 h ago`); hovering shows the full date.

**Differences from the design as a whole**
- **Name:** the design (and its prototype) uses the product name *ReportIt* with a `[Your City]` placeholder. The thin slice uses the working title *Civic Issue Tracker* and names Dhaka.
- **Navigation:** the design has a left rail on desktop for the Citizen Portal. The thin slice uses a top bar and a footer.
- **One app:** the citizen and staff screens are one app here; the design calls for two surfaces.
- **Not built:** bulk acknowledge, filter chips and drawer, report detail drawer and modals, personal history.
