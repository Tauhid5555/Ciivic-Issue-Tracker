---
page: 01 Submit a Report
scenario: 01 Citizen Portal
realizes: [UJ-1, FR-1]
created: 2026-09-06
status: polished (v2 — references components/patterns)
---

# Page 01 — Submit a Report

## Purpose

Single entry point for a citizen to report a civic problem. Reachable from a municipal site or shared link without authentication. Page-open to confirmation ≤ 90 seconds (SM-5).

## Personas & journey

- **Primary:** Aisha (UJ-1) — resident, mobile browser, time-poor, low technical tolerance. Walking past a broken streetlight at dusk.
- **Entry state:** Mobile browser, no account. May or may not have geolocation permission.

## When this page appears

- Direct URL from municipal site / shared link.
- "Report a problem" CTA from any portal entry point.

## Patterns used

See `D-Design-System/04-patterns.md` §1, §3, §5, §6, §7, §16.1, §16.3 for full specifications.

- **Page container:** `<CIVContainer size="md">`
- **Page title block** (§3)
- **Card grid** (§5) — 2 cols mobile, 5 cols tablet+
- **Form section** (§6) — used for each of the 5 fields
- **Action row** (§7) — sticky variant (§16.1) on mobile
- **Step indicator** (§16.3) — mobile only

## Sections (top to bottom)

### 0. Header strip

City wordmark ("ReportIt"), `--text-body-sm`, `--color-ink-muted`. No nav.

### 1. Page title block (mobile-only step indicator above)

- **H1:** *Report a problem*
- **Subtitle:** *It takes about a minute.*

### 2. Section: Category (required)

- Pattern: **Card grid** with 5 `<CIVCategoryCard>` instances.
- **Label:** *What's the problem?* (with required `*`)
- **Items:** Streetlight, Pothole, Garbage, Drainage, Noise.

### 3. Section: Location (required)

- Pattern: **Form section** with composite `<CIVLocationPicker>`.
- **Label:** *Where is it?*
- **Helper:** *We'll show the neighborhood, not your exact address.*
- **Default control:** `<CIVButton variant="secondary">` *Use my location*
  - On grant: `<CIVMapPin variant="placed">` + small static map preview.
  - On deny/timeout: `<CIVMapPin variant="draggable">` on map with tap-to-place crosshair.
- **Server:** reverse-geocoded to neighborhood string only (per NFR-7).

### 4. Section: Photo (required)

- Pattern: **Form section** with `<CIVFileInput variant="photo-dropzone">`.
- **Label:** *Add a photo*
- **Helper:** *Helps the city team understand the problem. JPEG, PNG, or HEIC up to 10MB.*
- **States:** default (drop zone) → filled (thumbnail + remove) → error (inline message)

### 5. Section: Description (optional)

- Pattern: **Form section** with `<CIVTextarea>`.
- **Label:** *Anything else to add?*
- **Helper:** *A sentence is fine. Tell us anything that helps the team respond.*
- **Placeholder:** *What did you see?*
- **Char counter:** 500 max (warning at 450, error at 500 — no hard block).

### 6. Section: Email (optional, warmly framed)

- Pattern: **Form section** with `<CIVEmailInput>`.
- **Label:** *Get notified the moment we look at this?*
- **Helper:** *We'll email you when your report is reviewed and again when it's resolved. Leave blank to stay anonymous.*

### 7. Action row (sticky submit bar on mobile)

- Pattern: **Action row** sticky variant (§16.1).
- **Privacy microcopy:** *By submitting, you agree to our [privacy policy](#).*
- **Button:** `<CIVButton variant="primary">Submit Report</CIVButton>`, full-width mobile, max 240px desktop.

## States

| State | Behavior |
|-------|----------|
| Default | All sections visible, no errors |
| Filling out | Step indicator updates as each conceptual step completes |
| Submitting | All inputs disabled; button shows `<Spinner>` + *"Submitting…"*; browser back is only escape |
| Validation errors (after submit pressed) | Section labels gain `*`; affected borders tint `--color-error`; error summary scrolls to first invalid section |
| Submit success | Route to Page 02 Confirmation with `?tracking_id=XXX&email=YYY` |
| Submit failure | Button returns to active; `<CIVToast>` at top: *"We couldn't submit your report. Check your connection and try again."* Form data preserved. |

## Accessibility

- Every input has programmatic `<label>` (per component spec).
- Tap targets ≥ 44×44px (per component spec).
- `<CIVLocationPicker>` has tap-to-place fallback for drag-only interactions.
- Form submits via Enter from any input AND via visible button.
- All states meet AA contrast (per design system floors).
- Respects `prefers-reduced-motion`.

## What is intentionally NOT on this page

Login, multiple photos per report (FR-1 assumption), comments, public map of other issues (OQ-6), file attachments beyond photo, language picker.

## Open questions deferred

- **OQ-3** (per-category anonymity) — v1 universal anonymous-by-default.
- **OQ-4** (geo-precision public display) — handled on Tracking Page, not here.

## Implementation handoff notes

**Components used:** `<CIVContainer>`, `<CIVCategoryCard>`, `<CIVLocationPicker>`, `<CIVMapPin>`, `<CIVFileInput>`, `<CIVTextarea>`, `<CIVEmailInput>`, `<CIVButton>`, `<CIVSpinner>`, `<CIVToast>`, `<CIVStepIndicator>`.

**Performance:** Form must work on flaky mobile data. Show explicit submit state, allow retry without re-entering data.

**Privacy:** Store full lat/long server-side; show only neighborhood string to citizen on Tracking Page (per NFR-7).
