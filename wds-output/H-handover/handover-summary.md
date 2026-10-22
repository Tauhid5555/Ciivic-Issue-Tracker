---
title: Handover Summary — Civic Issue Reporter & Tracker
phase: 4 UX Design → Development
created: 2026-09-06
status: ready-for-handoff
---

# Handover Summary

A developer-facing summary of the Phase 4 UX Design package for **Civic Issue Reporter & Tracker**. This document is the **single entry point** to the design package; everything else cross-references from here.

---

## 1. What you're building

Two web apps (Citizen Portal + Authority Dashboard), three transactional emails, sharing one data model and one design system.

**Read first:**
1. `D-Design-System/01-concept.md` — the *why* and the *feeling*
2. `D-Design-System/02-tokens.md` — the raw values
3. `D-Design-System/03-components.md` — the reusable building blocks
4. `D-Design-System/04-patterns.md` — composition rules

**Then read the page specs in build order (see §5 below).**

---

## 2. Architecture map

### 2.1 Surfaces

| Surface | URL pattern | Auth | Render context |
|---------|-------------|------|----------------|
| Citizen Portal — Submit | `/` | Public | Mobile-first (responsive) |
| Citizen Portal — Confirmation | `/confirmation` | Public (URL is the auth) | Mobile-first |
| Citizen Portal — Tracking | `/tracking/:id` | Public (Tracking ID = credential) | Mobile-first |
| Citizen Portal — Personal History | `/history` | Magic-link | Mobile-first |
| Citizen Portal — Magic Link Request | `/history` | Public | Mobile-first |
| Citizen Portal — Invalid ID | `/tracking/invalid` | Public | Mobile-first |
| Authority Dashboard — Sign In | `/sign-in` | Public | Desktop-first |
| Authority Dashboard — Queue | `/dashboard` | Auth (admin) | Desktop-first |
| Authority Dashboard — Report Detail | (drawer over queue) | Auth (admin) | Desktop |
| Authority Dashboard — Filters | (drawer over queue) | Auth (admin) | Desktop |
| Authority Dashboard — Empty | `/dashboard` (empty state) | Auth (admin) | Desktop |
| Authority Dashboard — Account | (popover from top bar) | Auth (admin) | Desktop |
| Transactional Emails | (outbound) | n/a | Email clients |

### 2.2 Email types

| Email | Trigger | Recipient |
|-------|---------|-----------|
| Acknowledgement | Submission success | Email provided on form (none if anonymous) |
| Status Change | Every status transition | Same as above (batched if >1 within 30 min) |
| Magic Link | Request from `/history` | Email entered on request form |

### 2.3 Shared data model

The Report is the central entity. Public-facing API returns a **subset** of fields (zone-level location, no admin attribution). Admin API returns full record including internal notes and admin names.

```
Report {
  id: cuid
  tracking_id: base32 crockford (≥8 chars, unambiguous alphabet)
  status: 'submitted' | 'acknowledged' | 'in_progress' | 'resolved' | 'disputed' | 'closed_duplicate'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'streetlight' | 'pothole' | 'garbage' | 'drainage' | 'noise'
  description: string (≤500)
  photo_url: string (signed, time-limited)
  geo: { lat, lng, zone }  // lat/lng stored server-side, NEVER returned to public
  reporter_email?: string  // optional
  is_anonymous: boolean   // derived from reporter_email absence
  submitted_at: timestamp
  acknowledged_at?: timestamp
  in_progress_at?: timestamp
  resolved_at?: timestamp
  resolution_note?: string
  resolution_photo_url?: string
  duplicate_of_id?: id (Report)
  history: [StatusTransition]
  internal_notes: [InternalNote]  // admin-only, never returned by public API
  disputes: [Dispute]  // FR-13
}
```

---

## 3. FR → Pages → Components map

### 3.1 Citizen Portal

| FR | Page(s) | Key components |
|----|---------|----------------|
| FR-1 Submit a Report | `01-submit-report.md` | `<CIVCategoryCard>`, `<CIVLocationPicker>`, `<CIVFileInput variant="photo-dropzone">`, `<CIVTextarea>`, `<CIVEmailInput>` |
| FR-2 Tracking ID + Confirmation | `02-confirmation.md`, `05-email-acknowledgement.md` | `<CIVCard variant="hero">`, `<CIVButton>` (ghost), `<CIVEmailFrame>` |
| FR-3 Public Tracking Page | `03-tracking-page.md`, `08-invalid-tracking-id.md` | `<CIVStatusPill>` (lg), `<CIVRelativeTime>`, `<CIVPhotoThumbnail>`, `<CIVLightbox>`, `<CIVTimeline>`, `<CIVBanner>`, `<CIVEmptyState>` |
| FR-4 Personal History | `04-personal-history.md`, `04b`, `07-email-magic-link.md` | `<CIVFilterChip>`, `<CIVReportCard>`, `<CIVEmailFrame>` |
| FR-5 Status Change Notification | `06-email-status-change.md` | `<CIVEmailFrame>`, `<CIVStatusPill>` |
| FR-6 24h Acknowledgement SLA | (cross-cutting, behavioral) | enforced via FR-9 dashboard + email dispatch |
| FR-13 Citizen Dispute Action | `03-tracking-page.md` §5 | `<CIVButton variant="danger">` |

### 3.2 Authority Dashboard

| FR | Page(s) | Key components |
|----|---------|----------------|
| (Auth) | `02-D01-sign-in.md` | `<CIVEmailInput>`, `<CIVTextInput>` (with show/hide), `<CIVBanner>` (error) |
| FR-7 Triage Queue | `02-D02-dashboard-queue.md` | `<CIVDataTable>`, `<CIVStatusPill>`, `<CIVButton>` (status-conditional), `<CIVRelativeTime>` |
| FR-8 Filters | `02-D05-filters.md` | `<CIVFilterChip>`, `<CIVDrawer>` (left), `<CIVRadio>`, `<CIVCheckbox>`, `<CIVDateInput>` |
| FR-9 Two-click Acknowledge | `02-D02`, `02-D04-bulk-acknowledge.md` | `<CIVButton>` (row quick action), bulk bar |
| FR-10 Set Priority | `02-D03-report-detail.md` §4 | `<CIVPrioritySegmentedControl>` |
| FR-11 Update Status Workflow | `02-D03` §6 | `<CIVButton>` (status-conditional action panel) |
| FR-12 Resolution Notes + After-Photo | `02-D03` §7b | `<CIVModal>` (resolution form), `<CIVTextarea>`, `<CIVFileInput>` |
| FR-14 Reopen Disputed | `02-D03` §6, §7c | `<CIVModal>` (reopen form), `<CIVTextarea>` |
| FR-15 Categories | (cross-cutting) | Categories config table; consumed by `<CIVCategoryCard>`, `<CIVFilterChip>` |

---

## 4. API endpoints (consolidated)

### 4.1 Citizen-facing

| Endpoint | Method | Purpose | Notes |
|----------|--------|---------|-------|
| `/api/reports` | POST | Submit a report | Returns `{ tracking_id, email_queued }`. Idempotent on client request ID. |
| `/api/reports/:id/public` | GET | Public tracking data | Returns zone-only geo. No admin fields. Anti-enumeration: same timing/response for 400/404/500. |
| `/api/auth/magic-link/request` | POST | Request magic link | Rate-limited. Always returns success-style copy. |
| `/api/auth/magic-link` | GET (token in query) | Consume magic link | Single-use, 15-min expiry. Sets session cookie scoped to `/history/*`. |
| `/api/reports/:id/dispute` | POST | Mark as not fixed | FR-13. Records timestamp; doesn't auto-change status. |
| `/api/reports/:id/confirm-fixed` | POST | Positive confirmation | Updates SM-4 metric. |

### 4.2 Admin-facing (all require session)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/sign-in` | POST | Email + password |
| `/api/auth/sign-out` | POST | Invalidate session |
| `/api/me` | GET | Current admin profile |
| `/api/reports` | GET | List with filters (status, category, date, zone, priority, reporter, disputed) |
| `/api/reports/:id` | GET | Full record (admin fields included) |
| `/api/reports/:id/priority` | POST | Set priority |
| `/api/reports/:id/transition` | POST | Status change (with required reason note for backwards moves) |
| `/api/reports/:id/notes` | POST | Add internal note (admin-only) |
| `/api/reports/:id/duplicate` | POST | Mark as duplicate of original |
| `/api/reports/:id/resolution` | POST | Save resolution (note required, after-photo optional) |
| `/api/reports/:id/reopen` | POST | Reopen (reason required) |
| `/api/reports/bulk` | POST | Bulk action: `{ ids, action, priority? }` |
| `/api/reports/search` | GET | For duplicate picker (search by ID, category, location, date) |

### 4.3 Webhooks / events

| Event | Emitted when | Consumed by |
|-------|--------------|-------------|
| `report.submitted` | Submission success | Email dispatch (acknowledgement) |
| `report.status_changed` | Every status transition | Email dispatch (status change, with 30-min batching) |
| `report.disputed` | FR-13 triggered | Notification to assigned admin (in-app, v2) |

---

## 5. Recommended build order

A pragmatic sequence that gets a working end-to-end MVP before polishing:

### Sprint 0 — Foundations (3–5 days)
1. Set up project (web framework, email service, file storage, database).
2. Implement `02-tokens.md` as CSS variables + base typography.
3. Implement core components: `<CIVButton>`, `<CIVStatusPill>`, `<CIVTextInput>`, `<CIVEmailInput>`, `<CIVTextarea>`, `<CIVCard>`, `<CIVBanner>`, `<CIVRelativeTime>`, `<CIVSpinner>`.

### Sprint 1 — Citizen Portal happy path (1 week)
4. Page 01 Submit a Report (form + upload + geolocation + submit API).
5. Page 02 Confirmation (route + Tracking ID display).
6. Page 03 Tracking Page (read API + timeline + dispute action).
7. Page 08 Invalid Tracking ID (404 handler).
8. Email 05 Acknowledgement (template + dispatch wiring).
9. **End-to-end test:** Aisha submits → sees confirmation → receives email → opens tracking page → sees status update.

### Sprint 2 — Authority Dashboard MVP (1 week)
10. Page 02-D01 Sign In (auth API + session).
11. Page 02-D02 Dashboard / Queue (list API + filters + table).
12. Page 02-D03 Report Detail (right drawer + priority + notes + status workflow).
13. Page 02-D04 Bulk Acknowledge (bulk API + bar).
14. **End-to-end test:** Carlos signs in → sees Submitted reports → acknowledges one → marks another resolved.

### Sprint 3 — Remaining surfaces + email (3–5 days)
15. Page 02-D05 Filters (advanced panel + URL state).
16. Page 02-D06 Empty State (both variants).
17. Page 02-D07 Account / Sign Out (popover + session expiry).
18. Page 04 Personal History (magic-link flow + 04b + Email 07).
19. Email 06 Status Change (with batching logic).
20. **End-to-end test:** Aisha's report flows through every status; emails fire; dispute + reopen flow works.

### Sprint 4 — Polish (2–3 days)
21. Cross-browser QA (Chrome, Firefox, Safari, Edge; mobile Safari + Chrome on Android).
22. Accessibility audit (axe + manual screen reader pass on key flows).
23. Performance: NFR-1 (≤ 2s Tracking Page on 4G), NFR-2 (≤ 1s Queue with 1k reports).
24. Anti-enumeration verification: timing tests on public report lookup.
25. Privacy verification: zone-only geo on public responses.

---

## 6. Open questions to resolve before/early in build

These are decisions the spec assumes but doesn't lock down. Resolve with the team before they block build:

| # | Question | Spec assumption | Where to decide |
|---|----------|-----------------|-----------------|
| **OQ-1** | Hosting / governance model | — | Affects infra, auth, data ownership. **Pre-build.** |
| **OQ-2** | Authority auth method | Email/password (decision locked in Phase 4) | ✅ Resolved for v1. |
| **OQ-3** | Anonymity per category | Universal anonymous-by-default | Defer to v2 unless pilot requires per-category. |
| **OQ-4** | Geo-precision public display | Zone-level only | ✅ Resolved (NFR-7 default). |
| **OQ-5** | Notification channels | Email only for v1 | ✅ Resolved for v1. |
| **OQ-6** | Public read-only map | Not in v1 | Defer. |
| **A-1** | Photo size cap (10MB) — `02-tokens.md` | `[ASSUMPTION]` from PRD | Confirm with infra. |
| **A-2** | Single photo per report | `[ASSUMPTION]` from PRD | Confirm. |
| **A-3** | Tracking ID alphabet (base32 crockford) | `[ASSUMPTION]` from PRD | Confirm. |
| **A-4** | 30-min email batching window | Spec'd inline Page 06 | Confirm with product. |
| **A-5** | Session lifetime (8h) | Spec'd inline | Confirm with security. |
| **A-6** | Idle timeout (none in v1) | Spec defers to v2 | Confirm acceptable. |
| **A-7** | Category list as config table | `[ASSUMPTION]` from PRD | Confirm with infra. |
| **A-8** | Magic-link rate-limit (5/email/hr, 10/IP/hr) | Spec'd inline Page 04 | Confirm with security. |
| **A-9** | Bulk action max (50 per batch) | Spec'd inline Page 04 | Confirm with infra (request timeout). |
| **A-10** | Image moderation | Out of scope for v1 | Confirm. |
| **A-11** | Photo retention period | Not specified | Confirm with privacy/legal. |
| **A-12** | Authority → assigned admin routing | Not in v1 | Confirm. |

---

## 7. NFRs to enforce in code

From PRD §10 + spec implications:

| NFR | Where enforced |
|-----|----------------|
| **NFR-1** Tracking Page ≤ 2s p50 on 4G | Lazy-load photos, inline CSS, no external fonts |
| **NFR-2** Queue ≤ 1s p50 with 1k reports | Server-side pagination, virtualized rows, debounced filters |
| **NFR-3** Acknowledgement email ≥ 99% within 60s | Idempotent dispatch with retries; queue monitoring |
| **NFR-4** Notification ≥ 95% within 5min | Dispatch queue with backoff; bounce handling |
| **NFR-5** Every status change audit-trailed | Server-side actor + timestamp on every transition endpoint |
| **NFR-6** Citizen anonymous-by-default | No email required; default field behavior |
| **NFR-7** Zone-only public geo | Server strips lat/lng from public endpoint response |
| **NFR-8** Dashboard auth required | Middleware on all `/dashboard/*` and admin endpoints |
| **NFR-9** Latest 2 browser versions + mobile Safari/Chrome | Cross-browser QA in Sprint 4 |
| **NFR-10** Spreadsheets remain system of record | No migration scope; explicit dashboard copy avoids claiming otherwise |

---

## 8. Security checklist (handoff)

| Item | Spec source | Implementation note |
|------|-------------|---------------------|
| HTTPS-only sign-in | Page 02-D01 §Security | HTTP→HTTPS redirect; HSTS |
| Anti-enumeration (public report lookup) | Page 03 §Security, Page 08 §Anti-enumeration | Same response time + body for 400/404/500; rate-limit by IP |
| Anti-enumeration (magic-link request) | Page 04 §Security | Same response body regardless of email existence |
| Magic-link rate limits | Page 04 §Security | 5/email/hr, 10/IP/hr, soft message at limit |
| Magic-link single-use + atomic | Page 04 §Security | Second use of same token returns 401 + logout |
| Session cookie hardening | Page 02-D01, Page 04 §Security | HttpOnly, Secure, SameSite=Lax, scoped |
| Photo URL signing | Page 03 §Handoff | Signed, time-limited; never embed in HTML |
| Password storage | Page 02-D01 §Handoff | bcrypt or argon2id; never log |
| Failed-login throttling | Page 02-D01 §Security | Per-email and per-IP |
| CSRF protection | (cross-cutting) | Token on all state-changing requests |
| Content Security Policy | (cross-cutting) | Strict CSP; no inline scripts in email templates |
| Audit log | NFR-5 | Actor + timestamp + IP + user-agent on every action |
| Concurrency conflict | Page 02-D02, 02-D03 | 409 response → optimistic UI revert + toast |

---

## 9. Accessibility requirements (cross-cutting)

Already enforced per component, but a summary:

- All interactive elements ≥ 44×44px tap target.
- Visible focus rings (`--color-focus`, 2px offset 2px) on every interactive element.
- Color is never the only signal — status pills carry text labels; banners have icons.
- All form inputs have programmatic labels.
- Modals trap focus, restore on close, close on ESC.
- Tables use semantic markup (`<table>`, `<thead>`, `<th scope>`).
- Drag-only interactions have tap/click fallbacks (location picker).
- All text meets WCAG 2.1 AA contrast on its actual background.
- `prefers-reduced-motion` respected: animations become instant, springs become fades.
- Screen reader: error regions use `role="alert"`; live regions use `aria-live="polite"`.

**Verification:** Sprint 4 includes axe-core + manual screen reader pass.

---

## 10. Things that are *not* in this package

Be aware of what's deliberately out:

- **No visual mockups or hi-fi designs.** Specs are text + ASCII. A designer should generate Figma frames before Sprint 1 if pixel-perfect fidelity is needed.
- **No copy deck.** All microcopy is mine. A communications professional should review tone + clarity before launch.
- **No real email templates.** Specs describe content + structure; actual HTML templates need to be built (MJML / React Email / SendGrid dynamic).
- **No admin invitation flow.** The spec assumes admins are invited out-of-band (by supervisors). Building admin invite UI is a v2 task.
- **No analytics.** Specs reference tracking events implicitly (SM-1..SM-7) but no analytics platform integration is designed.
- **No internationalization.** English-only per PRD.
- **No API specs.** This doc lists endpoints at a high level. Full request/response schemas are out of scope here; should be derived from page specs as build proceeds.
- **No database schema.** Schema is implied by the data model in §2.3; final schema decisions (indexes, constraints) are for the backend team.

---

## 11. Where to look for what

| If you need to… | Read |
|------------------|------|
| Understand the *why* | `D-Design-System/01-concept.md` |
| Get the *raw values* | `D-Design-System/02-tokens.md` |
| Build a *component* | `D-Design-System/03-components.md` |
| Compose a *page section* | `D-Design-System/04-patterns.md` |
| Build a *specific page* | `C-UX-Scenarios/0[12]-*/[NN]-*.md` |
| Get the *session memory* | `_progress/00-design-log.md` |
| See *what was decided when* | `_progress/00-design-log.md` §Log |
| Get a *dev summary* | This document |

---

## 12. Sign-off

This package represents the Phase 4 (UX Design) output. The next phase is implementation.

**Status:** ✅ Ready for handoff to development.

**Known limitations:**
- No visual mockups (Phase 5 territory).
- No copy review (communications team review recommended).
- A-1 through A-12 in §6 are assumptions awaiting confirmation.

**Recommended pre-build steps:**
1. Resolve OQ-1 (hosting model).
2. Confirm A-1 through A-12.
3. Generate hi-fi mockups for at least: Page 01 Submit, Page 03 Tracking (Resolved), Page 02-D02 Queue, Page 02-D03 Report Detail.
4. Communications review of all microcopy.
5. Sprint 0 environment setup.

**Built by:** Freya (WDS Designer), in collaboration with Tauhid5555.
**Phase 4 duration:** ~3 hours of collaborative work.
**Pages specified:** 15 (8 Citizen Portal + 7 Authority Dashboard).
**Components spec'd:** 17 component families.
**Patterns documented:** 25 composition rules.
