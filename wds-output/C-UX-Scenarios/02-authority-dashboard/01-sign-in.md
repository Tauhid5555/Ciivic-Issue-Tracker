---
page: 01 Sign In
scenario: 02 Authority Dashboard
realizes: [OQ-2 — email/password for v1]
created: 2026-09-06
status: draft
---

# Page 01 — Sign In

## Purpose

Authenticates a municipal staff member into the Authority Dashboard. Per OQ-2 decision, v1 uses email + password for invited admins. SSO is deferred to v2.

## Personas & journey

- **Primary:** Carlos (UJ-2) — opens dashboard daily, signs in 5+ days a week, wants no friction.
- **Secondary:** Deepa (UJ-3) — same pattern, less frequent.
- **Edge case:** New admin who hasn't activated yet; locked-out admin who needs password reset.

## When this page appears

- Direct visit to any `/dashboard/*` URL without an authenticated session → redirect to `/sign-in?next=...`.
- After explicit sign-out.
- After session expiry (re-auth required).

## Patterns used

See `D-Design-System/04-patterns.md` §1, §6, §7.

- **Page container:** `<CIVContainer size="sm">` (400px max — this is a focused single-column page)
- **Form section** (§6) — twice (email + password)
- **Action row** (§7) — centered

## Sections (top to bottom)

### 1. Header

- **City wordmark:** "ReportIt" (centered, `--text-body-sm`, `--color-ink-muted`)
- **H1:** *Welcome back.* (`--text-display`, centered, `--weight-semibold`)
- **Sub:** *Sign in to manage reported issues.* (`--text-body`, `--color-ink-muted`, centered)

### 2. Card

`<CIVCard variant="hero">` wrapper, max-width 400px, centered.

### 3. Form

**Field 1 — Email**
- `<CIVEmailInput>` with `autocomplete="email"`
- **Label:** *Email*
- **Placeholder:** *you@city.gov*

**Field 2 — Password**
- `<CIVTextInput type="password">` with show/hide toggle
- **Label:** *Password*
- **Show/hide:** ghost icon button (eye / eye-off) right-aligned inside the input, `aria-label="Show password"` / `"Hide password"`. Tapping toggles `type="password"` ↔ `type="text"`.
- `autocomplete="current-password"`

### 4. Inline error region

`<CIVBanner tone="error">` rendered above the submit button when an error occurs (initially hidden).

- Wrong credentials: *"That email and password didn't match. Try again or reset your password."*
- Rate-limited: *"Too many attempts. Try again in 15 minutes or reset your password."*
- Server error: *"Something went wrong on our end. Try again in a moment."*

### 5. Action row

- **Primary:** `<CIVButton variant="primary">Sign in</CIVButton>` — full-width.
- **Below:** ghost link centered: *Forgot your password?* → `/forgot-password` (out of scope for v1 spec — placeholder page).
- **Below that:** subtle text: *"Don't have an account? Ask your supervisor to invite you."* (`--text-caption`, `--color-ink-subtle`)

## States

| State | Behavior |
|-------|----------|
| Default | Empty form, submit enabled |
| Submitting | Submit disabled with `<Spinner>` + "Signing in…", inputs disabled |
| Wrong credentials | `<CIVBanner tone="error">` shown; password cleared (kept); email preserved; focus → password field |
| Rate-limited (5+ failures from same IP) | `<CIVBanner tone="error">` with rate-limit message; submit disabled; reset-password link emphasized |
| Server error | `<CIVBanner tone="error">` with generic message; form remains |
| Success | Redirect to `?next=...` (default: `/dashboard`) with `router.replace()` |

## Security notes

- **HTTPS only** — password fields must never be served over http.
- **No autocomplete on submit button** (prevents browser saving "Sign in" as a form value).
- **`autocomplete` set correctly** so password managers work.
- **No "remember me"** in v1 — session expires per server policy (e.g., 8 hours or browser close).
- **No password reveal on submit** even if user requests show — only during typing.
- **Anti-enumeration:** identical response time and message for "user not found" vs "wrong password" (server-side enforcement).
- **Failed-attempt tracking:** by IP and by email; both throttled.
- **Audit trail:** every sign-in (success and failure) logged with timestamp, IP, user agent.

## Accessibility

- All inputs have programmatic labels (per component spec).
- Show/hide toggle is keyboard accessible (Tab-able, Space/Enter to activate).
- Error region uses `role="alert"` so screen readers announce errors.
- After failed submit, focus moves to the password field.
- All text meets AA contrast.
- `prefers-reduced-motion`: spinner doesn't spin, just appears.

## What is intentionally NOT on this page

- Social SSO buttons (deferred per OQ-2 decision).
- "Sign up" link (admin invitation only — admins don't self-register).
- Marketing or city branding beyond the wordmark.
- Multi-factor authentication setup (v2).

## Implementation handoff notes

**Components used:** `<CIVContainer>`, `<CIVCard>` (hero), `<CIVEmailInput>`, `<CIVTextInput>` (with show/hide variant), `<CIVButton>` (primary + ghost), `<CIVBanner>` (error), `<CIVSpinner>`.

**Auth endpoint:** `POST /api/auth/sign-in` with `{ email, password }`. Returns 200 + session cookie on success; 401 on bad credentials; 429 on rate-limit.

**Session cookie:** HttpOnly, Secure, SameSite=Lax, 8h lifetime (configurable).

**Redirect target:** `?next=` param validated against allowed paths (open-redirect protection). Default: `/dashboard`.

## Open questions deferred

- **OQ-2** resolved: email/password for v1.
- **MFA** out of scope for v1.
- **Session timeout policy** is operational, configurable.
