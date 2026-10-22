---
title: PRD — Local Civic Issue Reporter & Tracker
created: 2026-08-30
updated: 2026-08-30
status: final
project: Civic-Issue-Tracker
based_on:
  - _bmad-output/planning-artifacts/briefs/brief-Civic-Issue-Tracker-2026-08-30/brief.md
  - _bmad-output/planning-artifacts/brd.md
  - _bmad-output/brainstorming/brain-civic-issue-tracker-2026-08-30/.memlog.md
  - idea.txt
finalized: 2026-08-30
---

# PRD: Local Civic Issue Reporter & Tracker

## 0. Document Purpose

This PRD defines the v1 product capability for the Local Civic Issue Reporter & Tracker — a web-based, two-sided civic engagement platform connecting citizens and municipal authorities. It is written for the Product team, Architects, QA, and any pilot authority partner.

The PRD inherits the business intent and requirement set from the **Product Brief v0.4** and **BRD v0.1**. Those documents remain the source of truth for business objectives, business rules, and stakeholder intent; this PRD focuses on **capability definition** — what each product surface must do, the user journeys it realizes, and how success is measured.

Vocabulary is Glossary-anchored (§3). All requirements use Glossary terms verbatim. Assumptions are tagged inline as `[ASSUMPTION: ...]` and indexed in §9.

---

## 1. Vision

The Local Civic Issue Reporter & Tracker is a web-based platform that connects citizens to municipal staff for reporting and resolving neighborhood problems — potholes, broken streetlights, garbage, drainage, and noise. The product closes the loop between citizen and city in a way the existing helpline-and-spreadsheet workflow does not.

**v1 is authority-led, citizen-supported.** All product value depends on authority staff actively using the dashboard; therefore the Authority Dashboard is the v1 priority, and the Citizen Portal is built to be simple enough that submission and tracking require no friction.

**v1 is platform-only in scope.** The dashboard handles reports submitted through the platform. Helpline, WhatsApp, in-person, and other channels continue to use existing processes. Inbox unification is a v2 objective.

**v1 success = the 24-hour promise.** Within 24 hours of a citizen submitting a report, they must feel *"received, being looked at, will not be forgotten."* This is operationalized as instant acknowledgement, a Status move to **Acknowledged**, and proactive notification when Status later changes. The qualitative feeling is measured indirectly through SM-1, SM-6, and SM-7.

---

## 2. Target User

The product has two primary user groups. All other parties (department leads, field crews, internal product/architecture teams, pilot sponsors) are out of scope as stakeholders in v1 and v2.

### 2.1 Jobs To Be Done

**Citizens / Residents**
- *Functional:* report a neighborhood problem quickly, with enough context that an authority can act on it; check what happened after reporting.
- *Emotional:* feel that someone saw the report and is doing something about it (correlated with SM-6 return rate).
- *Social:* contribute to a better local environment without needing to organize or escalate publicly.

**Municipal Authorities**
- *Functional:* see every report coming through the platform in one place; triage and update them quickly; record what was done and why.
- *Emotional:* spend less time reconciling scattered inputs; demonstrate responsiveness without manual reporting overhead.
- *Contextual:* keep the existing spreadsheet workflow running for advanced reports and audit (see §5 and NFR-10).

### 2.2 Non-Users (v1)

- Citizens whose only reporting channel is the helpline or WhatsApp — they keep their existing workflow in v1.
- Other municipal staff whose work does not involve intake or triage (e.g. dispatchers, field crews, finance, audit).
- Citizens who require native mobile apps — web only in v1.
- Anyone outside English-language support in v1.

### 2.3 Key User Journeys

Numbered globally UJ-1 through UJ-4. Realizes-links in §4 reference these IDs.

- **UJ-1. Aisha reports a broken streetlight and feels heard within a day.**
  - **Persona + context:** Aisha, a resident who walks her dog past the same dark stretch every evening. She wants it fixed and a way to know it won't be forgotten.
  - **Entry state:** Not authenticated. Lands on the Citizen Portal from a shared link or municipal site.
  - **Path:** (1) Opens the portal in a mobile browser. (2) Picks "Streetlight" as the category. (3) Allows geolocation; the portal pins the location on a small map. (4) Uploads a photo. (5) Writes a one-sentence description. (6) Submits.
  - **Climax:** The portal returns an on-screen confirmation with a tracking ID and the text *"We've received your report."* An acknowledgement email lands in her inbox within seconds. The next morning she sees a notification: *"Your report is being looked at."*
  - **Resolution:** She bookmarks the tracking page, returns a week later, sees a "Resolved" status with a short note from the authority, and a photo of the working light.
  - **Edge case:** Geolocation is denied — Aisha can drag a pin to the location manually before submitting.

- **UJ-2. Carlos triages the morning queue and acknowledges new reports in under five minutes total.**
  - **Persona + context:** Carlos, a municipal helpdesk operator who starts each day with 30–80 new reports to look at. He needs to move them out of "Submitted" fast so citizens don't feel ignored.
  - **Entry state:** Authenticated into the Authority Dashboard on a desktop browser. Lands on the queue view.
  - **Path:** (1) The queue is sorted with the oldest unreviewed report at the top, filter chips pre-set to "Submitted" + today. (2) He clicks a row, opens the report detail. (3) He clicks **Acknowledge** — single action, two clicks from the queue — and optionally selects a priority. (4) The row updates to status "Acknowledged" with a green dot. (5) He repeats across the morning batch; queue moves to zero by mid-morning.
  - **Climax:** Within 24 hours, every report submitted yesterday has been acknowledged. A status change notification has been queued for each citizen.
  - **Resolution:** Carlos closes the dashboard. Spreadsheets untouched.
  - **Edge case:** A report is clearly a duplicate of one already acknowledged — Carlos opens the duplicate, picks **Mark as Duplicate**, links the original, and is done.

- **UJ-3. Deepa marks a report resolved with a short note and a photo.**
  - **Persona + context:** Deepa, a senior authority user reviewing resolved cases at end of week. She needs to demonstrate what was done.
  - **Entry state:** Authenticated. Filter set to "In Progress."
  - **Path:** (1) Opens a report. (2) Clicks **Mark Resolved**. (3) Writes a short resolution note ("Bulb replaced; tested on 2026-08-29."). (4) Optionally uploads an "after" photo. (5) Saves.
  - **Climax:** Status flips to Resolved. A notification is queued to the original reporter.
  - **Resolution:** The report moves to a "Recently Resolved" filter; Deepa can filter to all reports she resolved this week.
  - **Edge case:** A citizen disputes the resolution — Deepa sees a "Disputed" flag in the queue and reopens with one click.

- **UJ-4. Marcus checks the status of an old report he forgot about.**
  - **Persona + context:** Marcus, who reported a pothole three weeks ago and hasn't checked back since.
  - **Entry state:** Returns to the portal via bookmark or the tracking ID link in his email.
  - **Path:** (1) Opens the tracking page using his tracking ID. (2) Sees the current status and a timeline of every transition: Submitted → Acknowledged → In Progress → Resolved.
  - **Climax:** The page tells him clearly what was done and when, with the resolution note and any "after" photo.
  - **Resolution:** Marcus is satisfied and exits; he may return to report the next problem.
  - **Edge case:** The report is still "In Progress" — the page shows how long it's been open and the latest update note.

---

## 3. Glossary

- **Citizen** — A resident or other member of the public who submits reports through the platform. Used synonymously with "resident." v1 uses no formal account system.
- **Authority** — A municipal staff member who uses the Authority Dashboard to triage and resolve reports. Roles are not subdivided in v1.
- **Report** — A single citizen-submitted issue record. Has a category, description, photo, geo, priority, status, history, and an optional resolution note.
- **Category** — One of: streetlight, pothole, garbage, drainage, noise.
- **Status** — One of: Submitted, Acknowledged, In Progress, Resolved, Closed-Duplicate.
- **Tracking ID** — A unique opaque identifier issued to a citizen on submission. Lets them revisit their report without an account.
- **Citizen Portal** — The public-facing web surface where citizens submit and track reports.
- **Authority Dashboard** — The internal web surface where authorities triage and resolve reports.
- **24-hour promise** — Within 24 hours of submission, the citizen feels: *received* (instant confirmation + tracking ID), *being looked at* (status moves to Acknowledged), *will not be forgotten* (proactive notification on subsequent changes).
- **v1 / MVP** — The initial release: web-only, two interfaces, platform-submitted complaints only.

---

## 4. Features

Features are grouped by product surface. FRs are numbered globally. Feature-specific NFRs and notes live under each feature; cross-cutting NFRs are in §10.

### 4.1 Citizen Submission (Citizen Portal)

**Description:** A web-only form that lets a citizen submit a report (category, description, photo, geolocation) without creating an account. On successful submission the citizen sees an on-screen confirmation with a Tracking ID and receives an acknowledgement email. Realizes UJ-1.

#### FR-1: Submit a Report

A Citizen can submit a Report through the Citizen Portal with category, description, photo, and geolocation, without creating an account. Realizes UJ-1.

**Consequences (testable):**
- The submission form supports the five Categories defined in §3.
- Geolocation may be auto-captured from the browser OR placed manually via a draggable pin (one path must always work).
- Photo upload accepts JPEG, PNG, and HEIC up to a documented size limit. `[ASSUMPTION: 10MB; JPEG/PNG/HEIC.]`
- On successful submission, the citizen sees an on-screen confirmation including the Tracking ID.

**Out of Scope:**
- Mandatory account creation.
- Multiple photos per report in v1. `[ASSUMPTION: single photo per report.]`
- File attachments beyond a single photo.

#### FR-2: Receive Tracking ID and Confirmation

Upon successful submission, the system displays an on-screen confirmation to the Citizen including the Tracking ID, and sends an acknowledgement email.

**Consequences (testable):**
- On-screen confirmation is shown within 2 seconds of submit success.
- The Tracking ID is at least 8 characters and uses an unambiguous alphabet (no 0/O/1/l collisions). `[ASSUMPTION: base32 crockford-style.]`
- The acknowledgement email includes the Tracking ID, the Category, the submission timestamp, and a deep link to the tracking page.
- Email is dispatched within 60 seconds of submission.

#### Feature-specific NFRs
- **Performance:** Form-open-to-confirmation completes in ≤ 90 seconds median; ≤ 60 seconds for repeat reporters (no account state to load).

---

### 4.2 Report Tracking (Citizen Portal)

**Description:** A Tracking Page accessible to any citizen who has a Tracking ID, showing the current Status of their Report and its full history. The Portal also exposes a personal history view if the citizen provides a contact channel they used on submit. Realizes UJ-4, supports UJ-1.

#### FR-3: Public Tracking Page by Tracking ID

A Citizen with a Tracking ID can view the public Tracking Page for their Report. Realizes UJ-4.

**Consequences (testable):**
- The page is reachable without authentication, via direct URL containing the Tracking ID.
- The page displays: Category, submission date, current Status, full Status history (with timestamps), the original description, the photo, and the location (subject to geo-precision policy — see Open Question OQ-4 in §8).
- Resolution note and any "after" photo from Authority are shown once present.

**Out of Scope:**
- Editing a submitted report.
- Adding follow-up comments from the citizen in v1. `[NON-GOAL for MVP: citizen comments.]`
- Sharing the tracking page publicly (no deep social features).

#### FR-4: Personal History View

If a Citizen provides a contact channel (email) at submission, they can access a Personal History view listing all Reports associated with that channel. Supports UJ-1.

**Consequences (testable):**
- Access is via a "magic link" emailed to the contact channel — no password.
- The view lists Reports sorted by most recent first, with current Status and Category.

**Out of Scope:**
- Full account creation, password login, profile pages.

---

### 4.3 Status Notifications (Cross-cutting)

**Description:** Proactive notifications to the Citizen when their Report's Status changes. Realizes the "will not be forgotten" leg of the 24-hour promise.

#### FR-5: Notification on Status Change

The system sends the Citizen a notification each time their Report's Status changes after submission.

**Consequences (testable):**
- A notification is queued when Status moves from any state to any other state, including terminal states.
- Each notification includes the Tracking ID, the new Status, the timestamp, and a link to the Tracking Page.
- v1 channel: email. `[ASSUMPTION: email only for v1; SMS is a v2 candidate.]`
- Notification dispatch reliability: ≥ 95% delivered within 5 minutes of the Status change.

**Out of Scope:**
- Push notifications (no native app).
- In-app notifications (no persistent citizen app).

#### FR-6: Acknowledgement Notification within 24 Hours

Authority staff acknowledge Reports such that the Status reaches **Acknowledged** within 24 hours of submission in ≥ 80% of cases. Realizes the "being looked at" leg of the 24-hour promise.

**Consequences (testable):**
- ≥ 80% of Reports submitted during business hours reach Acknowledged within 24 hours. (Out-of-business-hours submissions get the next business day.)
- Authority staff can move a Report to Acknowledged in no more than two dashboard actions from the queue view (see FR-9).

---

### 4.4 Authority Queue and Triage (Authority Dashboard)

**Description:** The dashboard's primary surface. A sortable, filterable list of all Reports submitted through the platform. Realizes UJ-2.

#### FR-7: Triage Queue

The Dashboard presents a triage Queue of all Reports submitted through the platform.

**Consequences (testable):**
- The Queue supports sorting by submission date (default oldest-first for Submitted status), priority, Category, and last-update time.
- The Queue is paginated and remains responsive at 1,000+ reports in the system.
- Filters can be combined: Status, Category, location (zone/text), date range.

#### FR-8: Filters

The Authority can filter the Queue by Status, Category, location, and date range.

**Consequences (testable):**
- Filter chips show current filter state and can be cleared individually or together.
- "Today" and "This week" presets are available for date.

**Out of Scope:**
- Saved filter views per user. `[NON-GOAL for MVP.]`
- Geographic radius filters in v1. `[ASSUMPTION: zone or text location only in v1.]`

#### FR-9: Acknowledge in Two Clicks

An Authority can move a Report from **Submitted** to **Acknowledged** in no more than two dashboard actions from the queue view. Realizes UJ-2.

**Consequences (testable):**
- A single **Acknowledge** button on each row performs the transition with default priority.
- A detail view allows the Authority to set priority and add an optional internal note before acknowledging.
- No modal confirmation interrupts the bulk-move workflow.

---

### 4.5 Report Lifecycle (Authority Dashboard)

**Description:** The dashboard's per-Report actions: priority, status updates, resolution notes, duplicate handling. Realizes UJ-2 and UJ-3.

#### FR-10: Set Priority

An Authority can set a Priority on a Report (e.g. Low / Medium / High / Urgent).

**Consequences (testable):**
- Priority is visible in the Queue and on the Report detail.
- Default priority is Medium at submission.

**Out of Scope:**
- Auto-priority by Category, geo, or volume. `[NON-GOAL for MVP: no priority rules engine.]`

#### FR-11: Update Status through Canonical Workflow

An Authority can move a Report through the Status workflow: Submitted → Acknowledged → In Progress → Resolved (plus Closed-Duplicate as terminal).

**Consequences (testable):**
- Forward transitions are one-click on the Report detail.
- Backward transitions (e.g. In Progress → Acknowledged) require an explicit reason note and are recorded in the Status history with the acting user.
- The transition to **Resolved** requires a non-empty Resolution Note (FR-12).
- The transition to **Closed-Duplicate** requires a link to the original Report.

#### FR-12: Resolution Notes and After-Photo

An Authority can attach a Resolution Note and an optional "after" photo when transitioning a Report to **Resolved**. Realizes UJ-3.

**Consequences (testable):**
- Resolution Note is required to save a Resolved transition.
- The note and photo are shown on the public Tracking Page (FR-3) once the Status is Resolved.

---

### 4.6 Dispute and Reopen (Authority Dashboard)

**Description:** When a Citizen disputes a resolution (via a "This isn't fixed" action on the Tracking Page), the Report is flagged for Authority review and can be reopened.

#### FR-13: Citizen Dispute Action

A Citizen can mark a Resolved Report as "Not Resolved" from the Tracking Page.

**Consequences (testable):**
- The action is reachable only when Status = Resolved.
- The action records a timestamp and opens the Report for Authority review; Status does not auto-revert.

**Out of Scope:**
- Citizen-to-Authority messaging beyond the dispute flag.

#### FR-14: Reopen Disputed Report

An Authority can reopen a disputed Report, moving Status from Resolved back to In Progress (or Acknowledged) with one action.

**Consequences (testable):**
- Disputed reports are visibly flagged in the Queue.
- Reopen requires a short reason note.

---

### 4.7 Categories and Configuration

**Description:** The v1 Category set is fixed; later versions may expand it.

#### FR-15: Supported Categories

The system supports the following Categories: streetlight, pothole, garbage, drainage, noise.

**Consequences (testable):**
- The Category list is presented as a fixed dropdown in the submission form and as filter chips on the Dashboard.
- Adding a Category in the future is a configuration change, not a code change. `[ASSUMPTION: categories live in a small config table, not hardcoded.]`

**Out of Scope:**
- User-defined or authority-defined categories.
- Sub-categories within a category.

---

## 5. Non-Goals (Explicit)

- **Helpline, WhatsApp, and in-person channel ingestion** — these stay on existing processes in v1.
- **Replacing spreadsheets for advanced reporting, audit, or historical work** — spreadsheets remain the system of record for those in v1.
- **Native mobile apps** — web only in v1.
- **Predictive analytics, AI-driven routing, auto-categorization, and AI-generated summaries** — out per product direction.
- **Multi-language UI beyond English** — out in v1.
- **Cross-municipality federation, multi-tenancy, payments, fines, ticketing, or enforcement workflows** — out in v1.
- **Real-time integration with municipal back-office systems** — out in v1.
- **Mandatory citizen accounts** — out in v1.
- **Citizen-to-authority messaging beyond the dispute flag** — out in v1.

---

## 6. MVP Scope

### 6.1 In Scope

- Citizen submission with category, description, photo, geolocation. (FR-1)
- Tracking ID and on-screen confirmation plus acknowledgement email. (FR-2)
- Public Tracking Page by Tracking ID. (FR-3)
- Personal History view via magic-link email. (FR-4)
- Status change notifications by email. (FR-5)
- 24-hour Acknowledgement SLA enforced through FR-9. (FR-6)
- Authority triage Queue with sort/filter. (FR-7, FR-8)
- Two-click Acknowledge. (FR-9)
- Priority, status workflow, resolution notes and after-photo. (FR-10, FR-11, FR-12)
- Dispute and reopen. (FR-13, FR-14)
- Fixed Category set. (FR-15)
- Cross-cutting NFRs (privacy, performance, auditability) — §10.

### 6.2 Out of Scope for MVP

- Anything listed in §5.
- Comment threads from citizens.
- Saved filter views per Authority user. `[NON-GOAL for MVP: revisit post-pilot.]`
- Geographic radius filters.
- Citizen accounts, profiles, password login.
- SMS or push notifications.
- Auto-priority rules.

---

## 7. Success Metrics

Each metric cross-references the FR(s) it validates. Counter-metrics prevent optimizing the wrong thing.

**Primary**
- **SM-1**: % of reports reaching Acknowledged within 24 hours — target ≥ 80%. Validates FR-6, FR-9.
- **SM-2**: Median time from Submitted → Resolved for top-3 Categories — target ≤ 7 days. Validates FR-11, FR-12.
- **SM-3**: % of reports reaching terminal status (Resolved or Closed-Duplicate) within 30 days — target ≥ 80% `[ASSUMPTION: 30-day window is a placeholder pending pilot calibration]`. Validates FR-11.
- **SM-4**: % of resolved reports that receive a citizen confirmation or dispute action — target ≥ 25%. Validates FR-13.

**Secondary**
- **SM-5**: Report-to-confirm time (median) — target ≤ 90 seconds for new reporters, ≤ 60 seconds for repeat reporters. Validates FR-1, FR-2.
- **SM-6**: % of reporters who return to view status at least once — target ≥ 40%. Validates FR-3, FR-4.
- **SM-7**: Notification delivery rate (status change → citizen sees it) — target ≥ 95% within 5 minutes. Validates FR-5.

**Counter-metrics (do not optimize)**
- **SM-C1**: Authority clicks per report handled — do not drive clicks artificially low at the cost of accuracy. Counterbalances FR-9.
- **SM-C2**: Total reports acknowledged — do not game by acknowledging without reviewing. Counterbalances SM-1.
- **SM-C3**: Total reports resolved — do not game by auto-resolving duplicates to inflate the count. Counterbalances SM-3.
- **SM-C4**: % of reports disputed by citizens — a *higher* number here is not a failure; it indicates the loop is working. Counterbalances SM-4.

---

## 8. Open Questions

Numbered. These are the questions that must be answered before UX/architecture/epics, or that are explicitly deferred.

- **OQ-1 — Hosting / governance model (scope-blocking):** Civic-tech nonprofit, municipal SaaS, community open-source, or commercial venture? Determines licensing, data ownership, and pricing. **Must be resolved before architecture/epics.**
- **OQ-2 — Authority authentication (scope-blocking):** SSO with city credentials, invited admins, or both? Drives auth model and access scope. **Must be resolved before architecture/epics.**
- **OQ-3 — Anonymity vs accountability per Category:** Noise complaints may benefit from anonymity; infrastructure reports benefit from accountability. Affects submission flow and data exposure.
- **OQ-4 — Geo-precision and retention policy:** What precision is shown on the public Tracking Page and any public surfaces? How long are photos and locations retained?
- **OQ-5 — v1 notification channels:** Email-only confirmed; do we add SMS or in-app later, and at what trigger volume?
- **OQ-6 — Public read-only map of open issues:** Originally in earlier drafts; needs a clean v1 in/out decision.

---

## 9. Assumptions Index

Every `[ASSUMPTION]` from the document, surfaced for explicit confirmation:

- `[ASSUMPTION: 10MB, JPEG/PNG/HEIC.]` — Photo upload size and format cap. (§4.1, FR-1)
- `[ASSUMPTION: single photo per report.]` — Photo count per report. (§4.1, FR-1)
- `[ASSUMPTION: base32 crockford-style.]` — Tracking ID alphabet and minimum length. (§4.1, FR-2)
- `[ASSUMPTION: email only for v1; SMS is a v2 candidate.]` — Notification channel scope. (§4.3, FR-5)
- `[ASSUMPTION: zone or text location only in v1.]` — Location filter granularity on dashboard. (§4.4, FR-8)
- `[ASSUMPTION: categories live in a small config table, not hardcoded.]` — Category configuration approach. (§4.7, FR-15)

---

## 10. Cross-Cutting NFRs

System-wide quality attributes not tied to a single feature.

- **NFR-1 (Performance):** Tracking Page renders in ≤ 2 seconds median at p50 on a modern mobile browser over a typical 4G connection.
- **NFR-2 (Performance):** Authority Dashboard Queue renders in ≤ 1 second median at p50 with up to 1,000 reports in the system.
- **NFR-3 (Reliability):** Acknowledgement email dispatch reliability ≥ 99% within 60 seconds of submission.
- **NFR-4 (Reliability):** Notification dispatch reliability ≥ 95% within 5 minutes of Status change (links to SM-7).
- **NFR-5 (Auditability):** Every Status change on a Report is recorded with timestamp and acting user (or system actor).
- **NFR-6 (Privacy):** Citizen does not need an account; submission is anonymous-by-default unless the citizen provides an email for notifications. `[ASSUMPTION: linked to OQ-3.]`
- **NFR-7 (Privacy):** Geo-precision on public surfaces is governed by the policy in OQ-4; default is to show only the Category-level zone (e.g. neighborhood) until OQ-4 is resolved.
- **NFR-8 (Security):** Authority Dashboard access requires authentication; access scope follows OQ-2.
- **NFR-9 (Compatibility):** Citizen Portal and Authority Dashboard are usable on the latest two stable versions of Chrome, Firefox, Safari, and Edge, and on mobile Safari and Chrome on Android at typical responsive breakpoints.
- **NFR-10 (Operational):** Spreadsheets remain the system of record for advanced reports, audit, and historical work in v1; the platform does not duplicate that responsibility. (Mirrors BR-904.)

---

## 11. Risks and Mitigations

Operational, security, and trust risks specific to the PRD's capability set.

| ID | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R-1 | Authority does not adopt the dashboard; citizen value never materializes. | High | High | Authority UX is the v1 priority (FR-9 two-click Acknowledge); pilot before scaling; minimize time-per-action. |
| R-2 | Volume spike (post-storm, etc.) overwhelms the Queue and staff revert to spreadsheets. | Medium | Medium | FR-7/FR-8 sort/filter cover the load; FR-9 minimizes per-report action cost; NFR-2 keeps the Queue fast at 1,000 reports. |
| R-3 | Citizens lose trust when "Submitted" never moves. | High | High | FR-6 enforces 24-hour Acknowledgement SLA; FR-5 proactive notifications signal momentum. |
| R-4 | Photo and geo-data expose residents or sensitive locations. | Medium | High | NFR-7 default zone-only public precision; OQ-3/OQ-4 govern anonymity and retention. |
| R-5 | Authority uses auto-resolve or duplicate-close to game SM-3. | Medium | Medium | FR-11 requires a resolution note to resolve; FR-12 enforces note presence; FR-11 requires linking an original to close as duplicate; SM-C3 explicitly counterbalances. |
| R-6 | Magic-link Personal History is abused to enumerate Tracking IDs. | Low | Medium | Magic links are single-use, short-lived, and rate-limited per email. |
| R-7 | Notification deliverability issues erode the "not forgotten" feeling. | Medium | High | NFR-4 ≥ 95% target; FR-5 monitoring; fall back to in-portal status as source of truth. |

---

## Appendix A: Source Trace

Each FR traces back to a BRD requirement, brief element, or brainstorm decision.

| FR | BRD equivalent | Brief / Brainstorm origin |
|---|---|---|
| FR-1 | BR-001 | Brief — Key Features (Citizen Portal) |
| FR-2 | BR-003, BR-201 | Brief + Brainstorm 24h promise ("received") |
| FR-3 | BR-004 | Brief — Key Features (Citizen Portal) |
| FR-4 | BR-005 | Brief — Key Features (Citizen Portal) |
| FR-5 | BR-006, BR-202 | Brief + Brainstorm 24h promise ("not forgotten") |
| FR-6 | BR-201 (operationalized), NFR-02 | Brainstorm 24h promise ("being looked at") |
| FR-7 | BR-101 | Brief — Key Features (Admin Dashboard) |
| FR-8 | BR-102 | Brief — Key Features (Admin Dashboard) |
| FR-9 | BR-106 | Brainstorm — authority walk-away |
| FR-10 | BR-103 | Brief — Key Features (Admin Dashboard) |
| FR-11 | BR-104, BR-901, BR-902 | Brief + Business Rules |
| FR-12 | BR-105 | Brief — Key Features (Admin Dashboard) |
| FR-13 | derived from BR-006 (notify on change) | Brainstorm loop closure |
| FR-14 | derived from BR-901 (backward moves) | Brainstorm loop closure |
| FR-15 | BR-301 | idea.txt |

---

**End of PRD.**