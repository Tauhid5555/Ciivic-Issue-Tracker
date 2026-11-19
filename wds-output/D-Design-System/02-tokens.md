---
title: Design Tokens — Civic Issue Reporter & Tracker
scenario: 00 Foundations (used by 01 Citizen Portal and 02 Authority Dashboard)
created: 2026-09-06
status: draft
---

# Design Tokens

Foundational values for color, typography, spacing, radius, elevation, and motion. Every page spec references these.

---

## 1. Color

### 1.1 Brand & surface

| Token | Value (suggested) | Use |
|-------|-------------------|-----|
| `--color-bg` | `#FAFAF7` (warm off-white) | Page background — warmth, not stark white |
| `--color-surface` | `#FFFFFF` | Card / form surface |
| `--color-surface-muted` | `#F2F1EC` | Subtle dividers, disabled bg |
| `--color-ink` | `#1B1F23` (near-black, warm) | Primary text |
| `--color-ink-muted` | `#5A6168` | Secondary text |
| `--color-ink-subtle` | `#8A9099` | Tertiary, timestamps, captions |
| `--color-border` | `#E5E3DD` | Hairline borders |
| `--color-focus` | `#2563EB` | Keyboard focus ring (AA on white) |

### 1.2 Brand accent

| Token | Value | Use |
|-------|-------|-----|
| `--color-brand` | `#2F6F4E` (muted civic green) | Primary buttons, links, active state |
| `--color-brand-strong` | `#1F4F36` | Hover, pressed |
| `--color-brand-soft` | `#E6F1EA` | Selected card, chip background |

> **Why green?** Civic, calm, "we're handling it." Avoids the government-blue cliché. Tests as a primary brand on neutral surfaces without screaming.

### 1.2b Accent palette (added Nov 2026 for the modern look)

Decorative only. Status colours in 1.3 keep their meaning and are not replaced by these. Violet was tried and removed (Nov 2026): it read as a second brand beside the green. Rule: green carries actions; accents are for status, priority and small highlights. Dark text on the soft tints and white text on the gradients were chosen for AA contrast; they have not been checked with a contrast tool.

| Token | Value | Use |
|-------|-------|-----|
| `--accent-teal` / `-soft` | `#1F7A8C` / `#DDF0F4` | Links, focus ring, gradient end |
| `--accent-sky` / `-soft` | `#3B82C4` / `#E1EEF9` | Tracking ID box, page wash, tracker step 1, Medium priority pill, empty-state drawing |
| `--accent-sun` / `-soft` | `#F2B84B` / `#FDF1D6` | Warning tint, page wash, tracker step 3, High priority pill |
| `--accent-coral` / `-soft` | `#E4694F` / `#FCE6E0` | Urgent priority pill |
| `--gradient-brand` | `135deg, #2F6F4E to #1F7A8C` | Primary buttons, brand name |
| `--gradient-hero` | green, teal, sky (`135deg, #2F6F4E, #1F7A8C 55%, #3B82C4`) | Header stripe, footer stripe, card top edge, headline, tracker line |

### 1.3 Status colors (status is hero — these carry meaning everywhere)

| Token | Value | Meaning | Use |
|-------|-------|---------|-----|
| `--status-submitted` | `#7A6F5C` (warm gray) | "Received. Not yet looked at." | Submitted pill, "waiting" moments |
| `--status-submitted-bg` | `#F2EFE8` | Submitted pill bg | |
| `--status-acknowledged` | `#2F6F4E` (brand green) | "We're looking at it." | Acknowledged pill |
| `--status-acknowledged-bg` | `#E6F1EA` | Acknowledged pill bg | |
| `--status-in-progress` | `#B5791F` (warm amber) | "Work has started." | In Progress pill |
| `--status-in-progress-bg` | `#FBF1DE` | In Progress pill bg | |
| `--status-resolved` | `#1F4F36` (deep green) | "Done." | Resolved pill, success states |
| `--status-resolved-bg` | `#D9E8E0` | Resolved pill bg | |
| `--status-disputed` | `#A23B2B` (warm red) | "Citizen flagged not fixed." | Disputed flag |
| `--status-disputed-bg` | `#F6E2DD` | Disputed pill bg | |
| `--status-duplicate` | `#6B6B6B` | Closed-Duplicate | Duplicate pill |

### 1.4 Feedback

| Token | Value | Use |
|-------|-------|-----|
| `--color-error` | `#A23B2B` | Form errors |
| `--color-error-bg` | `#F6E2DD` | Error inline bg |
| `--color-warning` | `#B5791F` | Warnings |
| `--color-success` | `#2F6F4E` | Confirmations |

---

## 2. Typography

### 2.1 Font families

| Token | Value | Use |
|-------|-------|-----|
| `--font-sans` | `"Plus Jakarta Sans Variable", "Noto Sans Bengali Variable", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` | All UI. Plus Jakarta Sans for Latin text, Noto Sans Bengali for Bangla, system fonts as the fallback |
| `--font-mono` | `ui-monospace, "SF Mono", Menlo, monospace` | Tracking ID display |

> **Decision (changed Nov 2026):** the original decision was system-ui only (zero network cost, native feel). It is replaced: the system font made every page look generic, and the service is for Dhaka, where Bangla text needs a proper Bengali font. The fonts are **self-hosted** from the npm packages `@fontsource-variable/plus-jakarta-sans` and `@fontsource-variable/noto-sans-bengali`, so the browser makes no request to a font provider (no third party sees the visitor's IP address). The Bengali font is split by character range, so it is downloaded only when a page contains Bengali text. Cost: about 50 kB of Latin font files on every first visit. The system stack stays in `--font-sans` as the fallback while the files load.
>
> **Open point:** the service has no Bangla text yet. Whether v1 must be available in Bangla is not settled in the requirements.

### 2.2 Type scale (rem-based, mobile-first)

| Token | Size / line-height | Use |
|-------|---------------------|-----|
| `--text-display` | `2rem / 2.25rem` (32/36) | Hero status on Tracking Page, Confirmation |
| `--text-h1` | `1.5rem / 2rem` (24/32) | Page titles |
| `--text-h2` | `1.25rem / 1.75rem` (20/28) | Section headers |
| `--text-h3` | `1.0625rem / 1.5rem` (17/24) | Card titles |
| `--text-body` | `1rem / 1.5rem` (16/24) | Default body — meets 16px AA floor on mobile |
| `--text-body-sm` | `0.9375rem / 1.375rem` (15/22) | Secondary copy |
| `--text-caption` | `0.8125rem / 1.125rem` (13/18) | Timestamps, helper text |
| `--text-label` | `0.875rem / 1.25rem` (14/20) | Form labels (semibold) |

### 2.3 Weight

| Token | Value | Use |
|-------|-------|-----|
| `--weight-regular` | `400` | Body |
| `--weight-medium` | `500` | Labels, buttons |
| `--weight-semibold` | `600` | Section heads, status text |
| `--weight-bold` | `700` | Reserved for status display |

---

## 3. Spacing scale

`4px base, geometric.`

| Token | Value | Use |
|-------|-------|-----|
| `--space-1` | `4px` | Tightest |
| `--space-2` | `8px` | Inline gaps |
| `--space-3` | `12px` | Form field gaps |
| `--space-4` | `16px` | Standard gap |
| `--space-5` | `20px` | Card inner padding |
| `--space-6` | `24px` | Section gap |
| `--space-8` | `32px` | Large section gap |
| `--space-10` | `40px` | Hero spacing |
| `--space-12` | `48px` | Page-level padding |

---

## 4. Radius

| Token | Value | Use |
|-------|-------|-----|
| `--radius-sm` | `6px` | Pills, chips |
| `--radius-md` | `10px` | Buttons, inputs |
| `--radius-lg` | `16px` | Cards |
| `--radius-pill` | `999px` | Status pills, category chips |

---

## 5. Elevation (soft, warm)

| Token | Value | Use |
|-------|-------|-----|
| `--shadow-sm` | `0 1px 2px rgba(27,31,35,0.06)` | Inputs, subtle lift |
| `--shadow-md` | `0 4px 12px rgba(27,31,35,0.08)` | Cards, popovers |
| `--shadow-lg` | `0 12px 32px rgba(27,31,35,0.12)` | Modals, sheets |

---

## 6. Motion

| Token | Value | Use |
|-------|-------|-----|
| `--motion-fast` | `120ms ease-out` | Hovers, taps |
| `--motion-normal` | `220ms ease-out` | Card transitions |
| `--motion-slow` | `360ms ease-out` | Page transitions |
| `--motion-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Status pill flips (delight, but restrained) |

---

## 7. Layout & breakpoints

| Token | Width | Notes |
|-------|-------|-------|
| `--bp-mobile` | `≤ 640px` | Design primary for Citizen Portal |
| `--bp-tablet` | `641–1024px` | Two-column layouts on Portal |
| `--bp-desktop` | `≥ 1025px` | Authority Dashboard primary |
| `--bp-wide` | `≥ 1440px` | Dashboard wide tables *(deprecated — see 7.1)* |

**→ Replaced by Tailwind-aligned scale (7.1) and Citizen/Dashboard container split (7.2). See below.**

### 7.1 Breakpoint scale (Tailwind-aligned)

> **Decision (2026-09-06):** Adopt Tailwind's default scale as the source of truth. The previous 1025px boundary was non-standard; Tailwind's 1024px aligns with common laptop widths and gives free utility-class alignment in dev.

| Token | Width | Tailwind | Primary use |
|-------|-------|----------|-------------|
| `--bp-base` | `< 640px` | (default) | Mobile. Citizen Portal primary. |
| `--bp-sm` | `≥ 640px` | `sm:` | Large phone / small tablet. Same mobile layout, more breathing room. |
| `--bp-md` | `≥ 768px` | `md:` | Tablet. Citizen Portal still narrow-centered; Dashboard begins. |
| `--bp-lg` | `≥ 1024px` | `lg:` | Laptop. Citizen Portal intentional-narrow column; Dashboard full layout. |
| `--bp-xl` | `≥ 1280px` | `xl:` | Desktop. Dashboard gains density + filters sidebar option. |
| `--bp-2xl` | `≥ 1536px` | `2xl:` | Wide desktop. Dashboard table gains extra columns. |

**Mobile-first rule:** styles apply at `--bp-base` by default; use `--bp-sm` / `--bp-md` / `--bp-lg` / `--bp-xl` / `--bp-2xl` to **add** behavior at larger sizes. Never remove behavior at larger sizes.

### 7.2 Container widths

**Design intent:** Citizen Portal stays narrow on purpose. Dashboard fills the screen.

| Token | Value | Use | Rationale |
|-------|-------|-----|-----------|
| `--container-citizen` | `640px` | Citizen Portal content column (Submit form, Tracking, History, Email) | Reads at a comfortable line length; matches mobile width; feels intentional on desktop, not "phone-in-the-middle." |
| `--container-citizen-wide` | `768px` | Citizen Portal when form needs more horizontal space (e.g., location picker with map + list) | Two-step wider zone, still narrow. |
| `--container-dashboard` | `1440px` | Authority Dashboard full layout | Uses available width. Filters + queue + drawer fit comfortably. |
| `--container-dashboard-narrow` | `1024px` | Dashboard at `--bp-md` to `--bp-lg` (filters collapse to drawer button) | Compact mode; queue + report drawer fit. |
| `--container-dashboard-wide` | `1536px` | Dashboard at `--bp-2xl` | Optional wider container for very wide screens; gains extra columns in queue. |

### 7.3 Side padding (gutter) at each breakpoint

**Critical:** Citizen Portal must NOT stretch content. It keeps a fixed 640px column and grows gutter space at larger breakpoints.

| Breakpoint | Citizen gutter (each side) | Dashboard gutter |
|------------|---------------------------|------------------|
| `--bp-base` | `16px` (full-width minus screen padding) | `16px` |
| `--bp-sm` | `auto` (640px column, centered, rest is gutter) | `24px` |
| `--bp-md` | `auto` (640px column centered) | `32px` |
| `--bp-lg` | `auto` (640px column centered, large gutter) | `32px` |
| `--bp-xl` | `auto` (640px column centered) | `48px` |
| `--bp-2xl` | `auto` (640px column centered) | `64px` |

> **Why no stretch:** Citizen Portal is form/status content — it should read at a comfortable line length (~60–75 characters). Stretching it to fill a 1920px screen makes forms and status text feel sparse and unanchored. The narrow column + rich gutter is **deliberate** and reads as "intentional focus," not "phone in the middle of a desktop screen."

---

## 8. Accessibility floors (apply everywhere)

- **Text contrast:** ≥ 4.5:1 for body, ≥ 3:1 for ≥18px or semibold ≥14px.
- **Tap targets:** ≥ 44×44px on mobile.
- **Focus:** visible `--color-focus` ring on every interactive element.
- **Motion:** respect `prefers-reduced-motion`; replace springs with fades.
- **Forms:** every input has a `<label>` (not just placeholder).

---

## 9. Component inventory (to be detailed later)

Reserved slots in `03-components.md`:
- Button (primary / secondary / ghost / destructive)
- Text input / textarea / file input
- Status pill (Submitted / Acknowledged / In Progress / Resolved / Disputed / Duplicate)
- Category card (icon + label, selectable)
- Timeline item (status history row)
- Map pin (small / draggable / placed)
- Toast / inline notice
- Empty state
- Email frame (header + body + footer)
