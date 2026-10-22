---
page: 07 Account / Sign Out
scenario: 02 Authority Dashboard
realizes: [OQ-2 — session management]
created: 2026-09-06
status: draft
---

# Page 07 — Account / Sign Out

## Purpose

Account menu and sign-out flow. Lives as a popover from the admin avatar in the dashboard top bar. Also covers session expiry handling.

## Personas & journey

- **Primary:** Carlos (UJ-2) — end-of-day sign-out.
- **Edge case:** session expired mid-work — graceful re-auth.

## When this surface appears

- Click avatar (top-right of dashboard) → menu opens.
- Session expires → modal dialog appears.
- Sign-out confirmed → redirect to Page 01 Sign In.

## Patterns used

See `D-Design-System/04-patterns.md` plus inline spec for menu popover and session-expiry modal.

- **Menu popover:** new pattern (documented inline).
- **Modal:** same as Page 03 modals.

## Composition

### 1. Account menu popover

**Trigger:** avatar button in dashboard top bar.

**Avatar spec:** 32px circle, initials on `--color-brand-soft` bg with `--color-brand` text, semibold.

**Menu popover:**
- **Position:** below avatar, right-aligned, margin-top `--space-2`.
- **Width:** 240px.
- **Background:** `--color-surface`, `--radius-md`, `--shadow-lg`.
- **Header section:** admin name (full name, `--text-body-sm` `--weight-semibold`) + email (`--text-caption`, `--color-ink-muted`).
- **Items (vertical list):**
  - *Account settings* (v2 placeholder — disabled in v1 with tooltip *"Coming soon"*)
  - *Keyboard shortcuts* (v2 placeholder — disabled)
  - divider
  - *Sign out* (`--color-error` text)
- **Behavior:** click outside or ESC closes. Focus returns to avatar button.

### 2. Sign-out action

- Click *Sign out* → inline confirmation in popover: *"Sign out of [name]?"* with *Confirm* (primary, sm) + *Cancel* (ghost, sm).
- Confirm: server `POST /api/auth/sign-out` invalidates session. Redirect to Page 01 Sign In with toast: *"Signed out."*
- Cancel: popover returns to main menu.

### 3. Session expiry modal

When server returns 401 on any authenticated request:

- **Modal:** centered, max-width 400px.
- **Title:** *Your session has ended.* (`--text-h2`)
- **Body:** *Please sign in again to continue. Your work in progress has been saved.* (`--text-body`, `--color-ink-muted`)
- **Primary:** *Sign in again* → redirect to Page 01 with `?next={current_path}`.
- **Note:** any unsaved form data is lost (drawer edits, internal notes mid-typing, resolution notes). The page title says "your work in progress has been saved" because queue filters and bulk selections are preserved server-side.

### 4. Idle timeout warning (optional, v2 — stub for now)

Per PRD out-of-scope, but the spec notes: if idle timeout policy is added, show a warning modal at 25 minutes idle ("You'll be signed out in 5 minutes"), with *Stay signed in* + auto-sign-out at 30 minutes.

## States

| State | Behavior |
|-------|----------|
| Menu closed | Avatar visible, no popover |
| Menu open | Popover visible below avatar |
| Sign-out confirming | Inline confirmation shown |
| Sign-out in flight | Confirm button shows spinner |
| Sign-out success | Redirect to Page 01 with toast |
| Session expired | Modal shown, focus on primary button |
| Session expired → sign in success | Redirect to original `?next=` path |

## Accessibility

- Avatar: `<button aria-label="Account menu, signed in as [name]" aria-haspopup="menu" aria-expanded="false">`.
- Menu: `role="menu"`, items `role="menuitem"`.
- Arrow keys navigate menu items; ESC closes; Enter activates.
- Session expiry modal: `role="alertdialog"`, focus on primary button.
- All text AA contrast.
- `prefers-reduced-motion`: popover/modal animations become instant.

## What is intentionally NOT on this page

- Profile editing / password change (deferred; password reset lives outside dashboard).
- Avatar photo upload (initials-only in v1).
- Notification preferences (email-only channel in v1, no opt-in/opt-out surface).
- Theme switcher (light only in v1; dark mode deferred).

## Implementation handoff notes

**Components used:** `<CIVButton>` (primary + ghost, sm), `<CIVToast>`, `<CIVSpinner>`, plus inline popover + modal patterns.

**Endpoints:**
- `POST /api/auth/sign-out` — invalidates session server-side.
- `GET /api/me` — returns `{ id, name, email, role }` for menu header.
- 401 on any auth-required endpoint triggers the session-expiry modal.

**Idle timeout:** configurable per deployment; default 8 hours or browser close. v2: 30-min idle warning.

**Audit (NFR-5):** every sign-in / sign-out recorded server-side with timestamp, IP, user agent.

## Open questions deferred

- **OQ-2** (auth) — email/password resolved; SSO deferred.
- **MFA** — v2.
- **Idle timeout policy** — operational config; v2 UI surface.
