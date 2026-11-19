---
project: Civic-Issue-Tracker
created: 2026-09-06
updated: 2026-11-20
---

# Design Log — Civic Issue Reporter & Tracker

## Backlog

- [ ] Initialize scenarios from PRD (§4 Features)
- [ ] Scenario 01: Citizen Portal — design all pages
- [ ] Scenario 02: Authority Dashboard — design all pages
- [ ] Build shared Design System (D-Design-System/)

## Current

| Task | Status | Started |
|------|--------|---------|
| Scenario 02 — Authority Dashboard (UJ-2, UJ-3; FR-7..FR-15, FR-14) | In progress | 2026-09-06 |

## Design Loop Status

| Scenario | Page | Status | Updated |
|----------|------|--------|---------|
| 01 Citizen Portal | 01 Submit a Report | Specified | 2026-09-06 |
| 01 Citizen Portal | 02 Confirmation | Specified | 2026-09-06 |
| 01 Citizen Portal | 03 Tracking Page | Specified | 2026-09-06 |
| 01 Citizen Portal | 04 Personal History | Specified | 2026-09-06 |
| 01 Citizen Portal | 05 Email — Acknowledgement | Specified | 2026-09-06 |
| 01 Citizen Portal | 06 Email — Status Changed | Specified | 2026-09-06 |
| 01 Citizen Portal | 07 Email — Magic Link | Specified | 2026-09-06 |
| 01 Citizen Portal | 08 Invalid Tracking ID | Specified | 2026-09-06 |
| 02 Authority Dashboard | 01 Sign In | Specified | 2026-09-06 |
| 02 Authority Dashboard | 02 Dashboard / Queue | Specified | 2026-09-06 |
| 02 Authority Dashboard | 03 Report Detail | Specified | 2026-09-06 |
| 02 Authority Dashboard | 04 Bulk Acknowledge | Specified | 2026-09-06 |
| 02 Authority Dashboard | 05 Filters | Specified | 2026-09-06 |
| 02 Authority Dashboard | 06 Empty State | Specified | 2026-09-06 |
| 02 Authority Dashboard | 07 Account / Sign Out | Specified | 2026-09-06 |

## Log

- **2026-09-06** — Phase 4 initialized. PRD read; design log created. Two scenarios identified from PRD §4:
  - 01 Citizen Portal (FR-1..FR-6 + tracking/magic-link/dispute surfaces)
  - 02 Authority Dashboard (FR-7..FR-15 + queue/detail/lifecycle/dispute surfaces)
- **2026-09-06** — Design Concept written: *Friendly Civic Accountability* (warm, plain-spoken, status-as-hero). Anti-references: SaaS-density, government-form-heavy, civic-engagement-game.
- **2026-09-06** — Design tokens seeded (`02-tokens.md`): warm off-white surfaces, muted civic green accent, status palette (Submitted→Acknowledged→In Progress→Resolved + Disputed + Duplicate). System fonts, 4px spacing, AA floors.
- **2026-09-06** — Component library written (`03-components.md`): 14 component families (buttons ×4 variants, form inputs ×5, status pill ×6 statuses, banner, toast, card ×3 variants, report card, category card, filter chip, relative time, timeline ×2, map pin ×3 variants, photo thumbnail, lightbox, empty state, loading skeleton, layout primitives ×4, email frame). Every page now references components instead of describing inline.
- **2026-09-06** — Pattern library written (`04-patterns.md`): 17 composition rules (container, vertical rhythm, page title, hero, card grid, form section, action row, status hero, report summary, timeline, resolution block, anonymous email offer, email body, empty state, lightbox, mobile sticky submit bar, step indicator) + application matrix mapping each page to its pattern stack.
- **2026-09-06** — Pages 01–04 polished (v2): rewrote to reference components/patterns from `03-components.md` and `04-patterns.md` instead of describing inline. Each page now lists "Patterns used" + "Components used" up front; spec bodies are 30–50% shorter while being more consistent and buildable.
- **2026-09-06** — Pages 05–08 specified (emails + error page). Acknowledgement email (5 variants baked into a single spec via status-conditional copy), Status Change email (5 status transitions + 30-min batching logic), Magic Link email (security note + token handling), Invalid Tracking ID page (anti-enumeration by design — identical response for wrong-format/404/500).
- **2026-09-06** — Scenario 02 (Authority Dashboard) initiated. Decision on OQ-2: invited admins with email/password for v1; SSO deferred to v2. Translates Concept "Friendly Civic Accountability" to dashboard: calm/efficient (not warm/reassuring), dense (not sparse), 5s-per-task (not 90s-per-task).
- **2026-09-06** — Scenario 02 fully specified: Sign In (Welcome back, email/password, show/hide toggle), Dashboard/Queue (10-col table, status-conditional quick-actions, bulk bar, right drawer), Report Detail (right drawer with priority segmented control, internal notes, status-conditional action panel, 3 modal flows: duplicate picker, resolution form, reopen form), Bulk Acknowledge (sticky bottom bar, optimistic UI, partial-failure reconciliation), Filters (quick chips + advanced left drawer with category/status/date/zone/priority/reporter/disputed filters), Empty State (2 variants: no reports ever vs no matches), Account/Sign Out (avatar popover menu + session-expiry modal).
- **2026-09-06** — Design system polished: extracted 4 new components (`<CIVCheckbox>`, `<CIVRadio>`, `<CIVDropdown>`, `<CIVDateInput>`, `<CIVSegmentedControl>`, `<CIVPrioritySegmentedControl>`, `<CIVMenuPopover>`, `<CIVModal>`, `<CIVBottomSheet>`, `<CIVDrawer>`, `<CIVDataTable>`) and 8 new patterns (right drawer, left drawer, bottom sticky action bar, modal/sheet, menu popover, data table, top bar, auth-conditional header note) into 03-components.md §14–17 and 04-patterns.md §17–25.
- **2026-09-06** — Developer handover package: `H-handover/handover-summary.md` — single entry point for devs. Maps FRs→pages→components, lists all 14 API endpoints (citizen + admin), surfaces 12 open assumptions (A-1..A-12), NFR enforcement map, security checklist, accessibility requirements, 5-sprint build order.
- **2026-09-06** — Visual mockups: `W-visual-mockups/` — ASCII wireframes for 5 key surfaces: Submit (mobile), Confirmation (mobile), Tracking Resolved (mobile + Acknowledged variant), Dashboard Queue (desktop), Report Detail drawer (desktop + 3 modal variants). Layout reference; not pixel-perfect.
- **2026-09-06** — Phase 4 visual pass delivered: `P-prototype/` — fully clickable HTML+CSS+JS prototype built directly from tokens + components. 23 screens covering all 15 page specs (Citizen Portal 8 specs × 13 files, Authority Dashboard 7 specs × 8 files including 5 variants of the Queue). Hand-coded (no external services). Open `index.html` in any browser. Demo bar in bottom-right for cross-screen jumps.
- **2026-09-06** — **Responsive system overhaul.** User flagged that opening the prototype on a desktop screen produced a "phone-in-the-middle" effect (narrow content column floating in empty space). Two product decisions locked:
  1. **Citizen Portal: intentional narrow column.** Does NOT stretch to fill viewport. Stays at 640px content width with growing gutter on desktop. Compensates with **enrichment at `lg`+**: display type → 2.5rem, h1 → 1.75rem, section gaps → `--space-8`–`--space-12`.
  2. **Authority Dashboard: filters collapse to drawer button below `lg`; become persistent 240px sidebar at `xl`+.** Below `md`, Report Detail drawer becomes a bottom sheet.
  - `02-tokens.md` §7 — replaced 4-token scale (mobile/tablet/desktop/wide) with Tailwind-aligned scale (base/sm/md/lg/xl/2xl); added Citizen/Dashboard container split; new gutter matrix.
  - `04-patterns.md` §0 — new cross-cutting responsive rules section. §1 — page container matrix per variant. §5, §6, §7, §18, §19, §23 — all major patterns retrofitted with per-breakpoint behavior. §17 — pattern application matrix updated to new container variants.
  - Prototype: `tokens.css` adds new container/breakpoint tokens; `base.css` adds responsive container classes + enrichment at `lg`+ for `.civ-page--citizen`; `components.css` adds progressive column-hiding (`.civ-col--*`) + 3-tier drawer behavior (bottom sheet → 60vw → 480px) + filters sidebar trigger at `xl`+. 13 Citizen Portal pages tagged with `civ-page--citizen`. Queue table headers and JS-rendered rows updated with column classes. Flow map `index.html` notes the responsive behavior.
  - Audit: all 15 page specs scanned for fixed-width conflicts. Audit report at `_progress/2026-09-06-responsive-audit.md`. **8 High-severity items found** (mostly legacy `<CIVContainer size="md/lg">` tokens and missing drawer/tier transitions). Spec pass recommended before frontend dev starts.
- **2026-09-06** — **Visual refresh pass** (after user feedback that prototype still looked "phone-in-the-middle" and lacked navigation):
  - **Logo system:** CSS-only inline SVG (civic shield + check mark in brand green) + wordmark. Two variants: `--citizen` (larger, warm) and `--dashboard` (denser, smaller). Mark is 36px / 28px / 40px depending on variant.
  - **Hero nav on flow map (`index.html`):** sticky top nav with logo + 5 primary links (Overview · Citizen Portal · Authority Dashboard · Design System · Handover) + version meta. Below the nav, a real hero section with two-column layout (title + lede + CTAs on left; "What's inside" card on right) at md+. Removed the 1100px-cap that caused the "phone-in-the-middle" effect.
  - **Citizen Portal side rail:** all 13 citizen pages wrapped in `civ-shell-citizen` with a 240px left rail (logo + 4 nav items: Report · My Reports · Help · About + footer with phone number). Hidden on mobile, shown at md+. Mobile gets a slim header with logo + "+ Report" button.
  - **Dashboard top bar upgrade:** all 7 dashboard pages get a richer top bar with logo (left) + 3 nav items (Queue · My Work · Reports, center) + avatar popover (right). Active state on Queue when on a queue variant. All dashboard pages tagged with `civ-page--dashboard`.
  - **New utility classes** in `base.css`: `.civ-logo`, `.civ-logo--citizen`, `.civ-logo--dashboard`, `.civ-nav`, `.civ-nav__item`, `.civ-nav__item--active`, `.civ-rail`, `.civ-mobile-header`, `.civ-shell-citizen`, `.civ-shell-citizen__main`, `.civ-shell-citizen__content`.
- **2026-09-06** — **Content audit + polish pass.** Full audit of `P-prototype/` for internal/developer-facing content. Removed:
  - From `index.html`: links to spec files (Design System, Handover, README), version meta (`v1 · WDS Phase 4 · 2026-09-06`), "Clickable Prototype" eyebrow, internal counts in "What's inside" card, "Resources for development" section (6 cards to .md files), Legend block (`15 page specs · 23 screen variants`), "Built from..." attribution, `data-screen="Flow map"`, demo-bar script. **Replaced with:** real-feeling hero (eyebrow "Report. Track. Resolve.", h1 "Report problems in your neighborhood. Watch them get fixed."), real card copy ("Account" / "Sign in" / "Status" tags instead of "Scenario 01" / "Companion" / "Variant"), edge-case notes rewritten, and a real site footer with Privacy / Accessibility / Contact / phone number.
  - From 13 Citizen Portal pages: `data-screen="..."` attributes, "Help center coming soon" toast → "Help center", `// Filter chip toggle (demo only)` comment, fixed `href="#"` privacy policy → `mailto:privacy@mapleheights.gov` in 01-submit, fixed `href="#"` civic email → `mailto:` in 08-invalid-tracking.
  - From 7 Dashboard pages: `data-screen="..."` attributes, `<!-- Variant override: ... -->` HTML comments in 4 queue variants, `(v2)` suffix in My Work / Reports nav toasts (now "— coming soon"), self-referential cross-link in 06-empty-state, `// ---- Filter demo actions ----` → `// ---- Filter actions ----`, `// (visual only)` comments, "Sample description for ${category}..." template literal → per-category realistic seed text (streetlight, pothole, garbage, drainage, noise each get their own real-feeling description).
  - Sign-in: removed `wrong@example.com` dev short-circuit; now uses empty-field validation with realistic toast ("Please enter your email and password." / "Signed in.").
  - **Favicon** added to all 21 pages as inline SVG data URI (no separate asset file needed).
  - **Page titles** updated on all 21 pages: `— Civic Issue Tracker` → `— Maple Heights Civic Issues`.
  - **Audit report** filed at `_progress/2026-09-06-content-audit.md` (summary in this log entry).

  Final verification: zero remaining `WDS`, `Phase 4`, `prototype`, `Handover`, `data-screen`, or `v1 ·` in any HTML file. The README.md still mentions "prototype" and "WDS Designer" — this is intentional (README is dev-facing, not end-user).

- **2026-09-06** — **Admin Portal rename + portal isolation.** User decision: "Authority Dashboard" → "Admin Portal" (everywhere user-visible). Each portal gets its own landing page. Citizen Portal must NOT link to Admin Portal in nav (separate surfaces).
  - **Rename scope:** all user-facing copy ("Authority Dashboard" / "Admin" / "Dashboard") replaced with "Admin Portal". CSS class names retained (`civ-page--dashboard`, `civ-logo--dashboard`, `civ-container--dashboard`) — user opted to keep these since they describe layout variant, not product surface.
  - **File move:** `pages/dashboard/*.html` (8 files) → `pages/admin/`. Empty `pages/dashboard/` directory deleted. `pages/admin/index.html` is now the Admin Portal landing; all admin internal links already pointed to `../admin/index.html` so they resolve correctly from the new location.
  - **New landings:**
    - `pages/admin/index.html` — Admin-only nav (Overview / Sign in). Hero: "Triage and resolve reports, all in one queue" + "Sign in to the admin portal →" CTA + "Jump to queue" ghost button. Today's snapshot stats card. 6-step flow chain + edge-cases grid.
    - `pages/citizen/index.html` — Citizen-only nav (Overview / Report a problem / My reports). Hero: "Report problems in your neighborhood. Watch them get fixed." + "Report a problem →" CTA + "Sign in to see my reports" ghost button. "How it works" card (4 steps). End-to-end flow chain (submit → resolved → disputed). Account/help grid. No admin link anywhere.
  - **Root `index.html`:** updated all 9 `pages/dashboard/` references in admin flow chain/grid to `pages/admin/`. Top-nav links now point to both portal landings (`pages/citizen/index.html` + `pages/admin/index.html`).
  - **`scripts/app.js` demo bar:** renamed group `Authority Dashboard` → `Admin Portal`, all 8 paths updated. Added new "Home" group with `index.html` (Overview). Added `Overview` entries for both portals.
  - **Cross-portal link audit:** citizen pages (13 files) reference zero admin paths. Admin pages reference zero citizen paths (after removing the "View citizen portal" ghost button and "Citizen Portal" nav item from the admin landing page, in the spirit of the isolation request — portals communicate only via the root `index.html`).
  - **`README.md`:** tree listing updated (citizen: 14 screens with landing; admin: 9 screens with landing; both paths use new names).
- **2026-09-06** — **Generic rebrand (Maple Heights → ReportIt).** User decision: drop the city-specific "Maple Heights" name; product reads as **ReportIt** (generic civic-issues tracker); city is `[Your City]` placeholder until dev replaces; email domain switches to `@city.gov`.
  - **Product wordmark:** `Civic Issues` → `ReportIt` across all 23 HTML pages (logo primary, page titles, footer brand, email sender, document titles).
  - **City:** every visible "Maple Heights" / "City of Maple Heights" → `[Your City]`. Used in logo sub-line, hero copy ("Built for [Your City]", "submitted in [Your City]", "approximate area"), footer brand line, email body lines ("City of [Your City] · 123 Main St · [Your City] · civic@city.gov"), demo data zone field (`app.js`).
  - **Email domain:** `@mapleheights.gov` → `@city.gov` in 8 mailto links (root index, citizen 01/05/06/07/08, admin index) + email sender header (`civic-issues@city.gov` → `civic@city.gov`).
  - **Dev-facing docs:** `D-Design-System/` (`01-concept.md`, `03-components.md`, `04-patterns.md`), `C-UX-Scenarios/01-citizen-portal/` (3 files), `C-UX-Scenarios/02-authority-dashboard/01-sign-in.md`, `W-visual-mockups/` (4 files), `README.md` — all updated to remove "Civic Issues" / "Maple Heights" placeholders and use the new `ReportIt` brand.
  - **History preserved:** `_progress/00-design-log.md` retains historical mentions of "Maple Heights Civic Issues" as legitimate descriptions of past work (history isn't rewritten).
- **2026-09-06** — **Logo redesign: pin + check.** User feedback that the shield mark was generic and didn't fit the renamed product. Switched to a stylized map pin with a checkmark in the head.
  - **Concept:** brand-green teardrop pin (the universal "your location" symbol — ties to the tracking-ID metaphor) with a white circular cutout holding a brand-green check (the "we did it" symbol). 24×24 viewBox.
  - **Geometry:** `M12 22.5 L4.5 13.5 A7.5 7.5 0 1 1 19.5 13.5 Z` (teardrop, point at bottom) + `<circle cx="12" cy="10.5" r="3.5" fill="white"/>` + `<path d="M9.7 10.6 L11.3 12.2 L14.4 9" stroke="#2F6F4E" stroke-width="2" .../>` (check inside circle).
  - **Centralization:** moved the SVG from inline-in-HTML (24 copies) into a single CSS rule on `.civ-logo__mark { background-image: url("data:image/svg+xml,..."); }`. Now swapping the logo = editing **one** CSS rule, not 24 HTML files. Verified across all 23 HTML pages.
  - **Inline SVG cleanup:** removed the 6-line `<svg>...</svg>` block from inside every `<span class="civ-logo__mark">` (now empty `<span class="civ-logo__mark" aria-hidden="true"></span>` — the CSS background-image paints the mark).
  - **Favicon updated:** pin+check SVG in all 23 pages' `<link rel="icon">`. Single source of truth for browser tab icon.
  - **File restored:** `styles/base.css` was accidentally truncated by an over-eager Write call (dropped from 369 → 61 lines mid-task). Restored in full: reset, skip-link, page wrapper, container classes, typography utilities, stack/grid primitives, map+pin, responsive media queries (md/lg/xl/2xl), citizen lg+ enrichments, logo system (now background-image), top-nav, mobile-header, rail, shell-citizen, site-footer, top-bar. 384 lines final.
  - **Verification:** zero remaining shield paths anywhere (`M12 2L3 6`); all logo `<a>` tags balanced; HTML structure clean across all 23 pages; favicon updated.

- **2026-11-20** — **Thin slice built; design adjusted as built.** The design was implemented directly as a working slice (`backend/`, `frontend/`), after the AI-DLC design workflow was closed early. Changes made to the design while building, all recorded in `D-Design-System/`:
  - **Colour:** added an accent palette (teal, sky, sun, coral) and two gradients (`02-tokens.md` §1.2b). A violet accent was tried and removed.
  - **Typeface:** the original "system-ui only" decision is replaced by Plus Jakarta Sans plus Noto Sans Bengali, self-hosted (`02-tokens.md` §2.1). Open point: whether v1 needs Bangla.
  - **Components:** `03-components.md` §18 maps each specified component to what was built and lists the differences (photo drop area, category tiles, location picker with a Dhaka-only limit and place search, empty state) and the components the spec did not have (progress tracker, landing showcase, "what happens next", priority pill, map link, footer).
  - **Patterns:** `04-patterns.md` §26 records the landing composition as built.
  - **Logo:** a pin + check logo was drawn again as a React component. The design log already recorded this concept (Sep 2026, kept in the prototype's CSS); the two match in idea.
  - **Not carried over from the design:** product name ReportIt, the Citizen Portal left rail, bulk acknowledge, filter chips and drawers, personal history.
  - **Revision, same day:** the "What happens after you send a report" cards were first built as a normal block under the form. The person asked for it to stay fixed while scrolling and rest above the footer, and to keep the original wording. Decision: a sticky bar from 1024px up (an ordinary block below), full wording kept, about 150px tall. Documented here and in `04-patterns.md` section 26 before the code was changed. A shortened-text version was tried for a few minutes and reverted at the person's request.
  - **Accepted risks** from the map work are in the root `README.md` ("Accepted risks for the pilot"), not here.
