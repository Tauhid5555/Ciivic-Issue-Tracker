---
page: 02 Confirmation
scenario: 01 Citizen Portal
realizes: [UJ-1, FR-2]
created: 2026-09-06
status: polished (v2 — references components/patterns)
---

# Page 02 — Confirmation

## Purpose

The first proof of the 24-hour promise. One job: hand the citizen a Tracking ID and make them feel a real human saw their report. Also serves as a durable, reload-safe "I just submitted" anchor.

## Personas & journey

- **Primary:** Aisha (UJ-1) — resident, mobile browser, mid-evening walk.
- **Secondary:** Marcus (UJ-4 entry point) — if he lands here from an old email, this is his re-entry.

## When this page appears

- After successful submission from Page 01 with `?tracking_id=XXX&email=YYY` in URL.
- Renders in ≤ 2 seconds (NFR-1).

## Patterns used

See `D-Design-System/04-patterns.md` §1, §4, §7.

- **Page container:** `<CIVContainer size="md">`
- **Hero** (§4) — large icon + display headline + sub
- **Tracking ID card** — composite (see Section 2)
- **Next-steps list** — composite (see Section 3)
- **Action row** (§7)

## Sections (top to bottom)

### 1. Hero

- **Icon:** 64px checkmark in 96px circle, `--status-acknowledged-bg` fill, `--status-acknowledged` stroke.
- **Headline:** *We've received your report.* (`--text-display`)
- **Sub:** *Here's your tracking ID — save it to check what happens next.*

### 2. Tracking ID card

- Container: `--color-surface-muted` bg, `--radius-lg`, padding `--space-6`.
- **Label:** *Your tracking ID* (uppercase, `--text-caption`, semibold, muted).
- **ID display:** monospace, `--text-display`, letter-spacing 0.05em, centered.
- **Copy button:** `<CIVButton variant="ghost">Copy ID</CIVButton>` — copy changes to *"Copied!"* (`--color-success`) for 2s, then reverts. `aria-live="polite"` announces success.
- **Caption (conditional):**
  - Email provided: *We've also sent this to you@example.com.*
  - Anonymous: *You didn't leave an email — bookmark this page or save your tracking ID. It's the only way to check on this report.* (action framing, not negative)

### 3. "What happens next" timeline (composite)

- **Title:** *What happens next* (`--text-h3`)
- **3 numbered steps** (vertical list, `--color-surface-muted` bg, `--radius-md` items):
  1. **The city team will look at this within 24 hours.**
  2. *(Email provided)* **We'll email you when they do.** / *(Anonymous)* **Bookmark this page — we'll update it here.**
  3. *(Email provided)* **You can check anytime using the link in your email.** / *(Anonymous)* **You can check anytime by returning to this page.**

### 4. Action row

- **Primary:** `<CIVButton variant="primary">Check status now</CIVButton>` → Page 03 with `?tracking_id=XXX&email=YYY`.
- **Secondary:** `<CIVButton variant="ghost">Report another problem</CIVButton>` → Page 01 (fresh form).

## States

| State | Behavior |
|-------|----------|
| Default (post-submit, email provided) | All sections visible; email-conditional copy shows email variant |
| Default (post-submit, anonymous) | Email-conditional copy shows bookmark framing; steps 2/3 swapped |
| Reload / direct visit days later | Identical render — URL is source of truth |
| Link shared with stranger | Same render; Tracking ID alone is the public credential |

## Browser back behavior

`router.replace()` on submit-success, not `push`. Back goes to whatever was before Page 01 entry, not to the empty submit form.

## Accessibility

- Hero checkmark: `aria-label="Report submitted"`.
- Tracking ID: selectable text (no `user-select: none`).
- Copy button: `aria-live="polite"` announces *"Tracking ID copied to clipboard."*
- Default focus lands on *Check status now* (most useful next action).
- All text meets AA contrast.

## What is intentionally NOT on this page

Login, marketing copy, internal status jargon, analytics-visible content.

## Open questions deferred

- **OQ-5** (additional channels) — email-only in v1.
- **OQ-3** (per-category anonymity) — universal posture for v1.

## Implementation handoff notes

**Components used:** `<CIVContainer>`, `<CIVButton>` (primary + ghost), `<CIVStatusPill>` (in step 2 for email-conditional variant — optional), `<CIVSpinner>` (in copy button transient state).

**Performance:** Inline-able CSS/JS. No external fonts. Renders in ≤ 2s on 4G.

**Email dispatch independent:** FR-2 requires dispatch within 60s of submit, not on Confirmation render.
