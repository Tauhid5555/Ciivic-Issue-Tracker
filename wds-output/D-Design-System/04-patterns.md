---
title: Patterns — Civic Issue Reporter & Tracker
scenario: 00 Foundations (used by 01 Citizen Portal and 02 Authority Dashboard)
created: 2026-09-06
status: draft
---

# Patterns

Composition rules — how to assemble components and tokens into consistent page sections. This is the layer that prevents layout drift across pages.

Tokens from `02-tokens.md`. Components from `03-components.md`.

> **Breakpoint scale used throughout this document:** `base` (<640) · `sm` (≥640) · `md` (≥768) · `lg` (≥1024) · `xl` (≥1280) · `2xl` (≥1536). See `02-tokens.md` §7.1. Mobile-first: each pattern is defined at `base` then adds behavior at each larger breakpoint.

---

## 0. Responsive behavior rules (cross-cutting)

These rules apply to **every** pattern below. Each pattern spec is a refinement; the rules here are invariants.

### 0.1 Citizen Portal — intentional narrow column

**Decision:** Citizen Portal does **not** stretch. On desktop (≥`lg`), content stays in a 640px-wide centered column with growing gutter on each side. The narrow column + rich whitespace reads as **intentional focus**, not "phone in the middle of a desktop screen."

| Breakpoint | Container | Layout | Vertical rhythm |
|------------|-----------|--------|-----------------|
| `base` (<640) | full-width − 16px each side | 1 column, edge-to-edge | standard |
| `sm` (≥640) | 640px centered | 1 column, centered, gutter grows | standard |
| `md` (≥768) | 640px centered | 1 column, larger gutter | standard |
| `lg` (≥1024) | 640px centered | 1 column, **hero typography scales up** (display → 2.5rem, h1 → 1.75rem), generous `--space-12` section gaps | **enriched** |
| `xl` (≥1280) | 640px centered | same as `lg`, gutter continues to grow | enriched |
| `2xl` (≥1536) | 640px centered | same as `xl` | enriched |

**Enrichment on `lg`+** (compensates for the narrow column visually):
- Hero/display text: `--text-display` becomes `2.5rem / 3rem` (40/48)
- Page title: `--text-h1` becomes `1.75rem / 2.25rem` (28/36)
- Section gaps: `--space-6` → `--space-8`; page-level padding: `--space-12` → `--space-16` (added token, 64px)
- Cards: `--radius-lg` (16px) stays; padding increases `--space-5` → `--space-6`
- Eyebrow captions: spacing above hero blocks grows `--space-2` → `--space-3`

**Why:** A narrow column on a wide screen feels empty without richer typography and breathing room. Enrichment signals "this page was designed for this canvas," not "this is a mobile screen we forgot to expand."

### 0.2 Authority Dashboard — fill the canvas

**Decision:** Dashboard **fills** available width and restructures itself based on canvas size. Below `lg` (1024px), the layout collapses (filters → drawer button, table → fewer columns). At `lg`+ it uses a full layout.

| Breakpoint | Container | Layout |
|------------|-----------|--------|
| `base` (<640) | full-width − 16px | Queue table single column view (cards) OR scroll-x with sticky status+actions. Filters = drawer button. Detail = bottom sheet. |
| `sm` (≥640) | full-width − 24px | Same as base, more padding. |
| `md` (≥768) | full-width − 32px, max 1024px | Filters = drawer button. Queue table shows more columns (status, category, age, actions). Detail = right drawer 60% width. |
| `lg` (≥1024) | max 1440px | **Full layout.** Filters sidebar option OR drawer (decided per page). Queue table all 10 columns. Detail = right drawer 480px. |
| `xl` (≥1280) | max 1440px (or up to 1536 with gutters) | Filters as persistent left sidebar (240px) + queue (rest). Denser row height. |
| `2xl` (≥1536) | max 1536px | Wider table; gains optional Zone + Reporter columns if not already visible. |

**Filter mode transition:**
- `<lg`: filters behind a "Filters" button → left drawer (per §19)
- `lg` only: still a button (one breakpoint isn't enough to justify a sidebar)
- `xl+`: persistent left sidebar (240px) replaces the drawer trigger

### 0.3 Progressive column hiding (data table)

When the queue table cannot fit all columns, **hide low-value columns first** (right-most), keep high-value columns visible. Status and actions are always sticky/visible.

| Breakpoint | Visible columns |
|------------|-----------------|
| `base` | Status, Category, Age, Actions (sticky right) |
| `sm` | + Submitted date |
| `md` | + Tracking ID, Priority |
| `lg` | + Zone, Photo (full 10 columns) |
| `xl` | + Reporter email, Disputed flag |
| `2xl` | All columns + comfortable column widths |

**Rule:** never horizontally scroll the whole page. Either hide columns or let inner table scroll (with sticky left/right cells).

### 0.4 Drawer width by breakpoint

| Drawer type | `base`/`sm` | `md` | `lg`+ |
|-------------|-------------|------|-------|
| Right (Report Detail) | bottom sheet | 60vw drawer | 480px drawer |
| Left (Filters) | 100vw drawer | 360px drawer | 360px drawer (or persistent sidebar at `xl+`) |
| Modal | full-width sheet (95vw) | 95vw or max-width per size | per size (sm 400, md 560, lg 720) |

---

## 1. Page container

Every page uses `<CIVContainer variant>` with explicit behavior per breakpoint.

### 1.1 Variants

| Variant | Container token | Used by |
|---------|-----------------|---------|
| `citizen` | `--container-citizen` (640px) | All Citizen Portal pages (Submit, Confirmation, Tracking, History, Invalid ID). Stays narrow-centered on desktop — **never stretches**. |
| `citizen-wide` | `--container-citizen-wide` (768px) | Citizen Portal pages that need extra horizontal room (e.g., location picker with map). Two-step wider zone, still narrow. |
| `dashboard` | `--container-dashboard` (1440px) | Authority Dashboard pages at `lg`+. |
| `dashboard-narrow` | `--container-dashboard-narrow` (1024px) | Authority Dashboard at `md` (filters collapsed). |
| `dashboard-wide` | `--container-dashboard-wide` (1536px) | Authority Dashboard at `2xl`+. |
| `email` | 600px (intrinsic to `<CIVEmailFrame>`) | Email bodies. |

### 1.2 Per-breakpoint behavior

| Variant | `base` | `sm` | `md` | `lg` | `xl` | `2xl` |
|---------|--------|------|------|------|------|-------|
| `citizen` | full−16px | 640px center | 640px center | 640px center + enriched typography | 640px center + enriched | 640px center + enriched |
| `citizen-wide` | full−16px | 640px center | 768px center | 768px center + enriched | 768px center + enriched | 768px center + enriched |
| `dashboard` | full−16px | full−24px | full−32px (max 1024) | max 1440px | max 1440px | max 1536px |
| `dashboard-narrow` | full−16px | full−24px | max 1024px | (transitions to `dashboard`) | — | — |
| `dashboard-wide` | (uses `dashboard`) | — | — | — | — | max 1536px |

### 1.3 Padding-x (gutters)

See `02-tokens.md` §7.3 for the full gutter matrix.

### 1.4 Rules

- **Never** override container width per-page.
- **Never** stretch Citizen Portal to fill viewport. The narrow column is intentional.
- If a section needs narrower content than its page container, nest `<CIVContainer variant="citizen">` inside.
- Dashboard adapts its structure (filter mode, table columns, drawer widths) per breakpoint — never just shrinks the same layout.

---

## 2. Vertical rhythm

Standard gap between top-level page sections.

| Context | Gap |
|---------|-----|
| Page title → first section | `--space-8` |
| Between sections | `--space-6` |
| Within a section (between related items) | `--space-4` |
| Within a tight group (e.g., label + helper + field) | `--space-2` |
| Last section → footer / page bottom | `--space-12` |

Use `<CIVStack gap>` to enforce. Never use ad-hoc margins between sections.

---

## 3. Page title block

Every page starts with this block. Used at the top of Submit, Tracking, Personal History.

```
┌──────────────────────────────────────────┐
│  [eyebrow — optional, --text-caption    ] │
│  [H1 title — --text-h1 or --text-display]│
│  [subtitle / body — --text-body, muted  ] │
└──────────────────────────────────────────┘
```

| Element | Style |
|---------|-------|
| Eyebrow (optional) | `--text-caption` `--weight-semibold` uppercase, `--color-ink-subtle`, letter-spacing 0.05em |
| H1 | `--text-h1` `--weight-semibold` `--color-ink` |
| Subtitle | `--text-body` `--color-ink-muted`, max-width 60ch |

**Vertical spacing inside the block:** `--space-2` between eyebrow → H1, `--space-3` between H1 → subtitle.

**Spacing after the block:** `--space-8` before the first section.

**Variant:** On Confirmation, the H1 becomes `--text-display` for hero impact. Same block, larger type.

---

## 4. Hero block (Confirmation, Tracking Page status)

A larger, centered version of the page title block. Used for emotional peaks.

```
┌──────────────────────────────────────────┐
│                                          │
│            [icon — 64–96px]              │
│                                          │
│       [headline — --text-display]        │
│                                          │
│       [sub — --text-body, muted]         │
│                                          │
└──────────────────────────────────────────┘
```

| Element | Style |
|---------|-------|
| Icon container | centered, 96px circle with status-soft bg |
| Icon | 64px, status color |
| Headline | `--text-display` (32/36) `--weight-semibold` `--color-ink`, centered |
| Sub | `--text-body` `--color-ink-muted`, centered, max-width 36ch |
| Vertical gaps | `--space-6` icon → headline, `--space-3` headline → sub |

**Used for:** Confirmation, Tracking Page status hero. Same pattern, different content.

---

## 5. Card grid

Used for category cards on Submit and report cards on Personal History.

### 5.1 Category grid (Submit)

| Breakpoint | Columns | Cell width |
|------------|---------|------------|
| `base` | 2 | ~`140px` (within 640px−32px container = 304px / 2 − gap) |
| `sm` | 3 | ~`200px` |
| `md` | 5 | fits 5 categories in single row |

```
base:
┌──────┬──────┐
│ C1   │ C2   │
├──────┼──────┤
│ C3   │ C4   │
├──────┤      │
│ C5   │      │
└──────┴──────┘

md+:
┌────┬────┬────┬────┬────┐
│ C1 │ C2 │ C3 │ C4 │ C5 │
└────┴────┴────┴────┴────┘
```

| Property | Spec |
|----------|------|
| Gap | `--space-4` |
| Cell | `<CIVCategoryCard>` (96px min height) |

### 5.2 Report card grid (Personal History)

| Breakpoint | Columns | Notes |
|------------|---------|-------|
| `base` | 1 | full-width stacked cards |
| `sm` | 2 | two-up cards |
| `md+` | 2 | stays two-up — narrower column is intentional, no stretch to 3+ |

| Property | Spec |
|----------|------|
| Gap | `--space-4` |
| Cell | `<CIVReportCard>` |

**Use `<CIVGrid cols={{ base: 1, sm: 2, md: 2 }} gap>` — never hand-roll.**

---

## 6. Form section

Every form input is wrapped in this pattern.

```
┌──────────────────────────────────────────┐
│  Label [required * if applicable]        │
│  Helper text (optional)                  │
│  ┌──────────────────────────────────┐    │
│  │  Field                           │    │
│  └──────────────────────────────────┘    │
│  Inline error (if any)                   │
└──────────────────────────────────────────┘
```

| Element | Style |
|---------|-------|
| Label | `--text-label` `--weight-semibold` `--color-ink`, semibold, 14px |
| Required `*` | `--color-error`, aria-described-by to the field |
| Helper | `--text-caption` `--color-ink-subtle` |
| Field | per component spec |
| Error | `--text-caption` `--color-error`, role `alert`, aria-live `polite` |

**Vertical spacing:** `--space-2` label → helper, `--space-2` helper → field, `--space-2` field → error.

**Spacing between sections:** `--space-6` (use `<CIVStack gap="space-6">`).

### 6.1 Two-column form layouts (desktop only)

On Citizen Portal at `md`+ (≥768px), some form sections can split into two columns to use horizontal space without stretching:

| Pattern | `base`/`sm` | `md`+ |
|---------|-------------|-------|
| Submit: Location picker | full-width | left col (text input + "Use my location" button), right col (small map preview placeholder) |
| Sign In: email + password | stacked | can stay stacked (only 2 fields, no benefit) |

**Rule:** only split when both fields benefit from being side-by-side. Most Citizen Portal forms stay single-column by design.

### 6.2 Authority Dashboard forms

Forms inside drawers/modals follow the same vertical rhythm but have **smaller spacing** due to density:
- `--space-2` between sections (vs `--space-6` on Citizen Portal)
- Label size `--text-label` (14px) — same, but helper text uses `--text-caption` (13px) more readily
- No enrichment on `lg`+ — drawers stay consistent across breakpoints

---

## 7. Action row

Where buttons live at the end of a view. Used on Submit (sticky), Confirmation, Tracking Page, Request Magic Link.

```
┌──────────────────────────────────────────┐
│  [Privacy microcopy — optional]          │
│                                          │
│  [Primary button]                        │
│  [Secondary button / ghost link]         │
└──────────────────────────────────────────┘
```

### 7.1 Per-breakpoint behavior

| Breakpoint | Primary | Secondary | Layout |
|------------|---------|-----------|--------|
| `base` | full-width | full-width below primary | stacked, centered, gap `--space-3` |
| `sm` | max 280px, centered | max 280px, centered below | stacked, centered |
| `md` | max 320px, centered | max 320px, centered below | stacked, centered |
| `lg+` | max 320px, **right-aligned** within container | below primary, right-aligned | right-aligned (within the 640px container), gap `--space-3` |

**Privacy microcopy:** `--text-caption` `--color-ink-subtle`, inline link, above primary. Stays above primary at all breakpoints.

**Sticky variant (Submit only):** `position: sticky; bottom: 0; padding: --space-4; bg: --color-surface with --shadow-lg;` — applies only on `base`/`sm` (mobile). On `md`+ the Submit button is **not sticky** (it stays inline with the form). This is critical: desktop users don't need a sticky button competing with their scrolling.

### 7.2 Authority Dashboard action rows

In drawers and modals, action rows are right-aligned at all breakpoints, with primary on the right. No full-width behavior — always inline.

---

## 8. Status hero (Tracking Page variant)

Special case of the hero block — the most important pattern in the product. Combines eyebrow + status pill + headline + last-updated.

```
┌──────────────────────────────────────────┐
│   Tracking ID: ABC-1234 [copy]           │
│                                          │
│   [Status pill — large]                  │
│                                          │
│   Status headline (--text-h1)            │
│                                          │
│   Updated 2 hours ago                    │
│                                          │
│   [SLA reassurance — conditional]        │
└──────────────────────────────────────────┘
```

| Element | Style |
|---------|-------|
| Tracking ID row | `--text-caption`, `--color-ink-subtle`, monospace for the ID itself. *Copy* is a ghost link. |
| Status pill | `<CIVStatusPill size="lg">` |
| Headline | `--text-h1` `--weight-semibold` `--color-ink` |
| Last updated | `<CIVRelativeTime>` |
| SLA line (Submitted/Acknowledged only) | `--text-caption` `--color-ink-subtle` |

**Vertical gaps:** `--space-2` ID → pill, `--space-3` pill → headline, `--space-2` headline → updated, `--space-2` updated → SLA.

**Card wrapper:** `<CIVCard variant="hero">`.

---

## 9. Report summary block (Tracking Page §2)

Displays the citizen's submitted content. Compact, scannable.

```
┌──────────────────────────────────────────┐
│  Category: 🪧 Streetlight                 │
│  Submitted: Aug 28, around 8:42 PM       │
│  Photo: [thumbnail]                      │
│  Location: Near [Your City] Park         │
│  What you told us:                       │
│  ┌──────────────────────────────────┐    │
│  │  Description quoted              │    │
│  └──────────────────────────────────┘    │
└──────────────────────────────────────────┘
```

| Property | Spec |
|----------|------|
| Field label | `--text-caption` `--weight-semibold` `--color-ink-subtle`, uppercase, letter-spacing 0.05em |
| Field value | `--text-body` `--color-ink` |
| Photo | `<CIVPhotoThumbnail size=96>` |
| Location helper | inline "Why am I seeing a general location?" link → inline expand (privacy explanation) |
| Description | blockquote: left border 3px `--color-brand`, bg `--color-surface-muted`, padding `--space-4 × --space-5`, radius `--radius-md` |

**Spacing:** `--space-4` between rows, `--space-5` between fields and description.

---

## 10. Timeline (Tracking Page §3)

Vertical list of status transitions. Uses `<CIVTimeline>` + `<CIVTimelineRow>`.

```
┌──────────────────────────────────────────┐
│ ●  Acknowledged                         │  ← current (ring highlight)
│    The team is looking at your report.   │
│    2 hours ago                           │
│ ─                                       │
│ ●  Received                             │
│    You submitted this on Aug 28.         │
│    2 days ago                            │
└──────────────────────────────────────────┘
```

**For Resolved rows:** include resolution note + after-photo in the content slot.
**For Disputed rows:** include dispute timestamp + plain-language description.

**Layout:** see component spec. `<CIVTimeline>` handles the rail + markers.

---

## 11. Resolution block (Tracking Page §4)

Special content block, status-conditional. Rendered only when Status = Resolved.

```
┌──────────────────────────────────────────┐
│  What the team did                       │
│                                          │
│  Bulb replaced; tested on Aug 29.         │
│                                          │
│  [after-photo if any]                    │
└──────────────────────────────────────────┘
```

| Property | Spec |
|----------|------|
| Background | `--status-resolved-bg` |
| Padding | `--space-5` |
| Radius | `--radius-lg` |
| Label | `--text-label` `--weight-semibold` `--color-ink` |
| Note | `--text-body` `--color-ink` |
| Photo | `<CIVPhotoThumbnail size=96>` |

---

## 12. Anonymous email offer (Tracking Page §6)

Soft inline card asking the citizen to add their email. Rendered only when arriving without `&email=` param.

```
┌──────────────────────────────────────────┐
│  Get notified when this changes.         │
│  Add your email — we'll only use it      │
│  for this report.                        │
│                                          │
│  [email input] [Notify me]               │
└──────────────────────────────────────────┘
```

| Property | Spec |
|----------|------|
| Background | `--color-surface-muted` |
| Padding | `--space-5` |
| Radius | `--radius-md` |
| Body | `--text-body-sm` `--color-ink-muted` |
| Input row | `<CIVCluster>` of `<CIVEmailInput>` + `<CIVButton variant="ghost">Notify me</CIVButton>` |
| On success | collapse card to *"You're subscribed to updates for this report."* |

---

## 13. Email body (Acknowledgement, Status Change, Magic Link)

All transactional emails follow this composition.

```
┌──────────────────────────────────────────┐
│          ReportIt        │  ← email header
├──────────────────────────────────────────┤
│                                          │
│  [eyebrow — "Update on your report"]     │
│                                          │
│  Hi [name or empty],                     │
│                                          │
│  [body paragraph 1 — what's happening]  │
│                                          │
│  [status pill or relevant detail card]   │
│                                          │
│  [primary CTA button → Tracking Page]    │
│                                          │
│  [body paragraph 2 — what to expect]     │
│                                          │
│  — The team                              │
│                                          │
├──────────────────────────────────────────┤
│  You're getting this because you         │  ← email footer
│  submitted a report. [Why am I getting   │
│  this?] [Privacy]                        │
└──────────────────────────────────────────┘
```

| Property | Spec |
|----------|------|
| Outer bg | `--color-bg` (warm off-white) |
| Inner max-width | 600px |
| Header padding | `--space-6 × --space-4` |
| Body padding | `--space-8 × --space-6` |
| Body bg | `--color-surface` |
| Footer padding | `--space-6 × --space-4` |
| Footer text | `--text-caption` `--color-ink-subtle` |
| Eyebrow | same as web, uppercase, `--color-brand` |
| Body text | `--text-body` `--color-ink` |
| CTA button | button-shaped link, bg `--color-brand`, text `#FFFFFF`, padding `--space-4 × --space-5`, radius `--radius-md`, inline-styled |
| Salutation | "Hi," (no name — we don't have it for anonymous); or "Hi Aisha," if name available (v2) |
| Sign-off | "— The [City Name] team" — never "Sincerely" or full bureaucratic tone |

**Tone:** warm, plain, human. One CTA per email. No marketing.

---

## 14. Empty state (Personal History, Invalid Tracking ID, Filter empty)

Three flavors (per component spec), all follow this pattern:

```
┌──────────────────────────────────────────┐
│                                          │
│          [illustration — optional]       │
│                                          │
│         Title (--text-h2)                │
│                                          │
│         Body (--text-body, muted)        │
│                                          │
│         [CTA — optional]                 │
│                                          │
└──────────────────────────────────────────┘
```

| Property | Spec |
|----------|------|
| Max-width | 360px content width |
| Padding | `--space-8` around |
| Alignment | centered |
| Vertical gaps | `--space-4` illustration → title, `--space-3` title → body, `--space-6` body → CTA |

---

## 15. Lightbox overlay (photo viewer)

Used by `<CIVLightbox>`. Covers the viewport.

| Property | Spec |
|----------|------|
| Background | `--color-ink` at 95% alpha |
| Image fit | contain, max 90vw × 90vh |
| Close button | top-right, 44×44px tap target, `aria-label="Close"` |
| Close triggers | close button, tap outside, ESC key |
| Body scroll | locked while open |
| Focus | trapped, restored to thumbnail on close |

---

## 16. Mobile-only patterns

### 16.1 Sticky submit bar (Submit Page only)

Primary button pinned to bottom of viewport during form fill.

| Property | Spec |
|----------|------|
| Position | `sticky; bottom: 0;` |
| Background | `--color-surface` with `box-shadow: 0 -4px 12px rgba(0,0,0,0.04)` |
| Padding | `--space-4 × --space-4` (above iOS safe area inset) |
| Button | full-width, height 52px |
| Above button | privacy microcopy, optional |

### 16.2 Bottom safe area

All sticky bottom content respects iOS safe-area-inset:

```css
padding-bottom: max(--space-4, env(safe-area-inset-bottom));
```

### 16.3 Step indicator (Submit Page only)

Single-line indicator above form, mobile only.

```
Step 2 of 4
████████░░░░░░░
```

| Property | Spec |
|----------|------|
| Position | top of form, below title block |
| Text | `--text-caption` `--color-ink-subtle` |
| Bar | 4px height, bg `--color-surface-muted`, fill `--color-brand` |
| Animation | bar fill transition `--motion-normal` |

**Replaces** a wizard step UI. Updates as user completes each conceptual step (Category → Location → Photo → Description/Contact).

---

## 17. Pattern application matrix

| Page | Container variant | Patterns used |
|------|-------------------|---------------|
| 01 Submit a Report | `citizen` | page title block → form section ×5 → sticky submit bar (`base`/`sm` only) → step indicator (`base`/`sm` only) → action row (`md`+) |
| 02 Confirmation | `citizen` | hero → tracking-ID card → next-steps list → action row |
| 03 Tracking Page | `citizen` | status hero → report summary block → timeline → resolution block (conditional) → action row (conditional) → anonymous email offer (conditional) |
| 04 Personal History | `citizen` | page title block → filter chips (cluster) → report card grid → empty state (conditional) |
| 05 Email — Acknowledgement | `email` | email frame → body block (status pill + CTA) |
| 06 Email — Status Change | `email` | email frame → body block (new status + CTA) |
| 07 Email — Magic Link | `email` | email frame → body block (single CTA to Personal History) |
| 08 Invalid Tracking ID | `citizen` | empty state (with CTA back to Submit) |
| 02-D01 Sign In | `citizen` | centered card → form section ×2 → action row |
| 02-D02 Dashboard / Queue | `dashboard` | top bar → title strip → quick chips → stats strip → data table → bulk action bar (sticky) |
| 02-D03 Report Detail | (drawer over queue) | right drawer → header (sticky) → report content → timeline → priority control → internal notes → action panel (status-conditional) → footer (sticky) + 3 modal flows (duplicate, resolution, reopen) |
| 02-D04 Bulk Acknowledge | (within dashboard) | sticky bottom action bar (variant of action row) |
| 02-D05 Filters | (drawer or sidebar) | quick chips + left drawer (advanced, `<xl`) / persistent sidebar (`xl+`) |
| 02-D06 Empty State | (within dashboard) | empty state, 2 variants |
| 02-D07 Account / Sign Out | (popover within top bar) | menu popover + modal (session expiry) |

---

## 18. Right drawer pattern

Used for Report Detail (Page 02-D03). Slides in from the right; preserves queue context.

### 18.1 Per-breakpoint behavior

| Breakpoint | Form | Width | Notes |
|------------|------|-------|-------|
| `base` | bottom sheet | 100vw, slides up from bottom | height 90vh; rounded top corners `--radius-lg`; backdrop same |
| `sm` | bottom sheet | 100vw, 90vh | same as base |
| `md` | right drawer | 60vw (max 720px) | slides from right; less invasive than full-width sheet |
| `lg` | right drawer | 480px | standard drawer; queue table remains visible behind |
| `xl+` | right drawer | 480px | same as `lg`; queue table widens so remaining context is even more readable |

### 18.2 Spec

| Property | Spec |
|----------|------|
| Width | per breakpoint above |
| Position (drawer) | `position: fixed; top: 0; right: 0; height: 100vh;` |
| Position (sheet) | `position: fixed; bottom: 0; left: 0; right: 0; height: 90vh; border-radius: --radius-lg --radius-lg 0 0;` |
| Background | `--color-bg` |
| Shadow | `--shadow-lg` on left edge (drawer) or top edge (sheet) |
| Animation | slide from right `--motion-normal` (drawer) / slide up `--motion-normal` (sheet), fade backdrop |
| Backdrop | `--color-ink` at 30% alpha, click closes |
| Header (sticky top) | status pill + Tracking ID + close X, border-bottom 1px |
| Footer (sticky bottom) | primary action(s), border-top 1px |
| Body | scrollable, `<CIVStack gap="space-6">` of report content + timeline + controls |
| ARIA | `<aside role="dialog" aria-modal="true" aria-label="Report detail">` |
| Focus | trapped; restore focus to the row that opened it on close |
| Close triggers | X button, ESC, backdrop click, primary action completion |

**Use cases:** Report Detail (right), Filters advanced (left).

---

## 19. Left drawer pattern

Used for advanced Filters (Page 02-D05). Slides in from left.

### 19.1 Per-breakpoint behavior

| Breakpoint | Mode | Width | Notes |
|------------|------|-------|-------|
| `base`/`sm` | left drawer | 100vw | standard mobile drawer |
| `md` | left drawer | 360px | standard tablet drawer |
| `lg` | left drawer | 360px | still a drawer (one breakpoint isn't enough to justify persistent sidebar) |
| `xl+` | **persistent left sidebar** | 240px | replaces the drawer trigger entirely; queues see filters always |

**At `xl`+:** the "Filters" button in the queue top bar is replaced by a persistent 240px sidebar showing filter state. Drawer no longer needed; user changes filters inline.

### 19.2 Spec

| Property | Spec |
|----------|------|
| Width (drawer mode) | 360px desktop, 100vw mobile (per breakpoint above) |
| Position | `position: fixed; top: 0; left: 0; height: 100vh;` |
| Header | *Filters* title + *Reset* ghost link + close X |
| Footer (sticky) | *Apply* (primary) + *Cancel* (ghost) |
| Body | `<CIVStack gap="space-6">` of filter sections (Category, Status, Date, Location, Priority, Reporter, Disputed) |
| ARIA | `<aside role="dialog" aria-modal="true" aria-label="Filters">` |
| Behavior | Apply closes drawer; Cancel closes drawer; Reset clears advanced filters |

---

## 20. Bottom sticky action bar pattern

Used for Bulk Acknowledge (Page 02-D04). Desktop-first sticky bar.

| Property | Spec |
|----------|------|
| Position | `position: sticky; bottom: 0;` (within scroll container) |
| Background | `--color-surface` |
| Shadow | `--shadow-lg` (above queue) |
| Padding | `--space-3 × --space-6` |
| Border-top | 1px `--color-border` |
| Layout | space-between: selection count + status breakdown left, button cluster right |
| Selection count | `--text-body-sm` `--weight-semibold` |
| Status breakdown | `--text-caption` `--color-ink-subtle`, e.g., *"3 Submitted · 0 Acknowledged · 0 In Progress"* |
| Animation | slide up from `--space-4`, `--motion-normal` |
| ARIA | `role="region" aria-live="polite" aria-label="Bulk actions"` |
| Hidden when | selection empty |

**Spinning off the Submit mobile sticky submit bar (§16.1)** — same pattern, different context.

---

## 21. Modal / sheet pattern

Used for: Duplicate picker, Resolution form, Reopen form (Report Detail), Session expiry (Account), Sign-out confirm.

| Property | Spec |
|----------|------|
| Trigger | primary/secondary action button |
| Component | `<CIVModal>` (desktop) or `<CIVBottomSheet>` (mobile) |
| Header | title + optional subtitle + close X |
| Body | form content (fields per use case) |
| Footer | primary action (right) + cancel ghost (left or right depending on context) |
| Size | small (400px) for confirms; medium (560px) for forms; large (720px) for pickers |
| Backdrop | `--color-ink` at 50% alpha |
| Close triggers | X, Cancel, ESC (with unsaved-changes guard for forms) |
| ARIA | `role="dialog"` (or `role="alertdialog"` for urgent/destructive), `aria-modal="true"`, `aria-labelledby` |
| Focus | trapped, restored on close |

---

## 22. Menu popover pattern

Used for: Account menu (Page 02-D07).

| Property | Spec |
|----------|------|
| Trigger | avatar / icon button in top bar |
| Component | `<CIVMenuPopover>` |
| Position | below trigger, right-aligned (or left near viewport edge) |
| Width | 240px |
| Header section | name + email stacked, padding `--space-3 × --space-4` |
| Items | `<button>` or `<a>`, full-width, left-aligned, padding `--space-2 × --space-3` |
| Item hover | bg `--color-surface-muted` |
| Item destructive | text `--color-error` |
| Divider | 1px `--color-border`, margin `--space-1` |
| Inline confirm | replaces item with Confirm + Cancel pair (sign-out) |
| Close triggers | click outside, ESC, item click |
| ARIA | `<button aria-haspopup="menu" aria-expanded>`, popover `role="menu"`, items `role="menuitem"` |

---

## 23. Data table pattern

Used for Queue (Page 02-D02).

### 23.1 Per-breakpoint behavior (progressive column visibility)

| Breakpoint | Visible columns (in order) | Hidden columns | Total |
|------------|---------------------------|----------------|-------|
| `base` | Status, Category, Age, Actions | Tracking ID, Submitted, Zone, Photo, Priority, Reporter, Disputed | 4 |
| `sm` | + Submitted date | Tracking ID, Zone, Photo, Priority, Reporter, Disputed | 5 |
| `md` | + Tracking ID, Priority | Zone, Photo, Reporter, Disputed | 7 |
| `lg` | + Zone, Photo | Reporter, Disputed | 9 |
| `xl` | + Reporter email, Disputed flag | — | 10 (full) |
| `2xl` | all 10 + comfortable widths | — | 10 |

**Sticky columns at narrow breakpoints:**
- Status: sticky-left at all sizes
- Actions: sticky-right at all sizes
- When columns hide, status and actions always remain visible

**Row density by breakpoint:**
- `base`/`sm`: comfortable (`--space-3 × --space-4`)
- `md`+ : default (same — density comes from showing more columns, not cramming)
- `xl`+: compact optional (`--space-2 × --space-3`) for power users — toggled in account settings, off by default

### 23.2 Spec

| Property | Spec |
|----------|------|
| Component | `<CIVDataTable>` |
| Wrapper | semantic `<table>` |
| Header row | `--color-surface-muted` bg, uppercase `--text-label` |
| Sortable columns | `<button>` inside `<th>` with `aria-sort` |
| Row hover | bg `--color-surface-muted` |
| Row selected | bg `--color-brand-soft` |
| Cell padding | `--space-3 × --space-4` (default), `--space-2 × --space-3` (compact at `xl`+) |
| Photo column | fixed 56px, 40px square thumbnail |
| Action column | right-aligned, fixed 140px |
| Loading | skeleton rows (5 visible) |
| Pagination | row count + page nav right, page size selector left |
| Responsive | horizontal scroll inside table container (NOT page); status sticky-left, actions sticky-right |
| Performance target | ≤ 1s p50 with 1,000 rows (NFR-2) |

**Quick-action button per row:** status-conditional (per component §1 buttons). This is FR-9 realized.

### 23.3 Mobile alternative — card list

On `base` (and optionally `sm`), the table may render as a **card list** instead of a `<table>`:

```
┌────────────────────────────────────┐
│ [pill] Pothole        3 hrs ago    │
│ Submitted · Zone 4 · ⚠ High        │
│ ABC-1234                           │
│ [Mark acknowledged] [Open]         │
└────────────────────────────────────┘
```

This is FR-7 realized on mobile. Above `sm` the table takes over. Decide per implementation which is friendlier; the spec supports both.

---

## 24. Top bar pattern (dashboard)

Used for all dashboard pages.

| Property | Spec |
|----------|------|
| Position | sticky top, full width |
| Background | `--color-surface` |
| Border-bottom | 1px `--color-border` |
| Height | 56px |
| Padding | `--space-3 × --space-6` |
| Left | city wordmark + small "Dashboard" label |
| Right | avatar circle (32px, initials on brand-soft bg) → `<CIVMenuPopover>` |

---

## 25. Auth-conditional header note (Citizen Portal)

Pages 01, 02, 03, 08 (Citizen Portal) have **no header navigation** — the citizen is not authenticated, distractions are removed.

Pages 04 (Personal History) and 04b (Request Magic Link) have a minimal auth-state indicator: *Signed in as you@example.com*.

This is **not** a top bar pattern — it's a *header strip* that varies per page. See individual page specs for behavior.

---

## 26. Landing composition as built (Nov 2026)

The report page in the thin slice, from top to bottom. This is the composition to keep when the screens are rebuilt.

1. **Header:** logo and name on the left, three links on the right, a thin gradient stripe along the top edge.
2. **Two columns from 1024px up:** the showcase on the left (sticky while the form scrolls), the form on the right (640px, the Citizen Portal column width). Below 1024px the showcase shrinks to a smaller phone above the form, with the headline and floating badges hidden.
3. **Form order:** category tiles, description, location (search and "Use my location" in one row, the map, then the smaller latitude and longitude fields), photo drop area, optional email, send button.
4. **"What happens after you send a report":** a bar of three steps under both columns, with the full wording below. From 1024px up it is sticky: it stays at the bottom of the window while the page scrolls and comes to rest just above the footer. Below 1024px it is an ordinary block, because a pinned bar would cover too much of a phone screen.
   - Layout: the heading on one line, then the three steps side by side, each an icon, a bold title and its text. About 150px tall on a wide screen, which is a sixth of a typical window; this is the cost of keeping the full wording in a pinned bar. If it proves too heavy, the options are a shorter text or a bar that does not stick.
   - Wording (unchanged from the first version):
     1. **We receive it:** "You get a Tracking ID straight away. Keep it: it is how you check on your report."
     2. **Staff look at it:** "A member of staff reviews your report, sets a priority and acknowledges it."
     3. **You can follow it:** "Use your Tracking ID any time to see each step, from received to resolved. If it is not fixed, you can tell us."
5. **Footer:** brand, links, and the note that maps and place search are provided by OpenStreetMap and what that shares.

**Rules this composition follows**
- One brand colour (green) for actions; accent colours only for status, priority and small highlights.
- Motion shows state or gives feedback. It never carries information on its own, and it switches off under reduced motion.
- Empty and loading states have their own design (drawing or shimmer), never a bare "Loading…".
