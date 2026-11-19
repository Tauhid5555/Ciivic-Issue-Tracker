# Requirements — Civic Issue Tracker (architecture design run)

Depth: Standard. This run produces architecture and design only; no application code.

Source tags: `[desc]` the task description, `[PRD]` / `[BRD]` / `[Brief]` the three input documents, `[Q<n>]` your answers in `requirements-analysis-questions.md` (F1 and F2 are the two follow-ups), `[assumption]` not yet confirmed.

PRD requirement IDs are written here without the hyphen (PRD FR-1 is FR1, PRD NFR-3 is NFR3) so the rest of the workflow can trace them. BRD identifiers keep their own spelling (BR-001, BRD NFR-02).

## Intent analysis

- Design the architecture for a web platform where residents report local problems (streetlight, pothole, garbage, drainage, noise) and municipal staff triage and resolve them. [desc] [Brief]
- The product is authority-led and citizen-supported: staff adoption is the main risk, so the Authority Dashboard is the v1 priority. [PRD §1] [BRD §2]
- v1 success is the "24-hour promise": a citizen feels the report was received, is being looked at and will not be forgotten. [PRD §1]
- The design must cover domain design, contracts, quality requirements, buildable units and AWS infrastructure, with ADRs and traceability to these requirements. [desc]

## Functional requirements

### Citizen Portal

- **FR1 Submit a report (no account).** [PRD FR-1] [BRD BR-001]
  - FR1.1 A citizen submits a report with category, description, one photo and geolocation.
  - FR1.2 Categories are the fixed five in FR15.
  - FR1.3 Location comes from browser geolocation or a draggable pin; one of the two always works. A denied geolocation permission never blocks submission.
  - FR1.4 Photo upload accepts JPEG, PNG and HEIC up to 10 MB. [assumption: PRD §9]
  - FR1.5 An email address is optional on every report. [Q7]
- **FR2 Tracking ID and confirmation.** [PRD FR-2] [BRD BR-003, BR-201]
  - FR2.1 On success the portal shows a confirmation with the Tracking ID within 2 seconds.
  - FR2.2 The Tracking ID is at least 8 characters from an unambiguous alphabet. [assumption: PRD §9]
  - FR2.3 When the citizen gave an email, an acknowledgement email with Tracking ID, category, submission time and a link to the tracking page is sent within 60 seconds.
  - FR2.4 When no email was given, the confirmation screen says notifications will not be sent and that the Tracking ID is the only way back to the report. [Q7]
- **FR3 Public tracking page by Tracking ID.** [PRD FR-3] [BRD BR-004]
  - FR3.1 The page needs no sign-in and is reached by a URL containing the Tracking ID.
  - FR3.2 It shows category, submission date, current status, full status history with timestamps, the description and the location.
  - FR3.3 The exact pin is public. [Q8] [F1]
  - FR3.4 The citizen's original photo is shown to authority staff only, not on the public page. [F1] This changes PRD FR-3, which lists the photo on the public page.
  - FR3.5 The resolution note is public once present. The "after" photo's visibility is not yet decided (open question OQ-A1).
- **FR4 Personal history view.** [PRD FR-4] [BRD BR-005]
  - FR4.1 A citizen who gave an email can see all reports linked to it through a single-use, short-lived, rate-limited magic link; no password.
  - FR4.2 Reports submitted without an email have no personal history; they are reachable only by Tracking ID. [Q7]

### Notifications

- **FR5 Notify on status change.** [PRD FR-5] [BRD BR-006, BR-202]
  - FR5.1 Each status change queues an email to the citizen, only when an email exists. [Q7]
  - FR5.2 The email carries Tracking ID, new status, timestamp and link to the tracking page.
  - FR5.3 Email is the only v1 channel. [assumption: PRD §9]
- **FR6 Acknowledge within 24 hours.** [PRD FR-6] [BRD NFR-02]
  - FR6.1 At least 80% of reports submitted in business hours reach Acknowledged within 24 hours; later submissions get the next business day. The business-hours calendar is not defined (OQ-A4).
  - FR6.2 Staff reach Acknowledged in two dashboard actions or fewer from the queue (see FR9).

### Authority Dashboard

- **FR7 Triage queue.** [PRD FR-7] [BRD BR-101]
  - FR7.1 Lists every platform-submitted report; sorts by submission date (oldest first for Submitted), priority, category and last update.
  - FR7.2 Paginated, responsive at 1,000 or more reports.
- **FR8 Filters.** [PRD FR-8] [BRD BR-102]
  - FR8.1 Filter by status, category, location (zone or text) and date range; combinable; "Today" and "This week" presets.
  - FR8.2 Saved filter views and radius filters are not in v1.
- **FR9 Acknowledge in two clicks.** [PRD FR-9] [BRD BR-106]
  - FR9.1 One Acknowledge button per row uses the default priority.
  - FR9.2 The detail view can set priority and add an internal note before acknowledging.
  - FR9.3 No confirmation dialog interrupts the move.
- **FR10 Priority.** [PRD FR-10] [BRD BR-103]
  - FR10.1 Priority is Low, Medium, High or Urgent; default Medium; visible in queue and detail.
- **FR11 Status workflow.** [PRD FR-11] [BRD BR-104, BR-901, BR-902]
  - FR11.1 Statuses: Submitted, Acknowledged, In Progress, Resolved, Closed-Duplicate.
  - FR11.2 Forward moves are one click; backward moves need a reason note and are recorded with the acting user.
  - FR11.3 Moving to Resolved needs a non-empty resolution note (see FR12).
  - FR11.4 Moving to Closed-Duplicate needs a link to the original report.
- **FR12 Resolution note and after-photo.** [PRD FR-12] [BRD BR-105]
  - FR12.1 A resolution note is required to resolve; an "after" photo is optional.
- **FR13 Citizen dispute.** [PRD FR-13]
  - FR13.1 A citizen can mark a Resolved report "Not Resolved" from the tracking page; the action records a timestamp and flags the report for staff; the status does not change by itself.
  - FR13.2 The dispute action is available only while status is Resolved.
- **FR14 Reopen disputed report.** [PRD FR-14]
  - FR14.1 Staff reopen a disputed report to In Progress or Acknowledged with a short reason; disputed reports are flagged in the queue.
- **FR15 Fixed categories.** [PRD FR-15] [BRD BR-301]
  - FR15.1 Streetlight, pothole, garbage, drainage, noise.
  - FR15.2 Adding a category is a configuration change, not a code change. [assumption: PRD §9]

### Requirements added by your answers

- **FR16 Staff accounts.** [Q2] Authority staff sign in with invited accounts (email, password and a second factor). Staff are invited by an administrator; there is no self-registration. All staff have one common role in v1. [PRD Glossary]
- **FR17 Retention and deletion.** [Q8] [F1]
  - FR17.1 Photos and locations are removed 24 months after a report closes.
  - FR17.2 Status history and audit records outlive that removal, with the personal data removed (what "closes" means for a Resolved report that can be reopened is open: OQ-A5).
- **FR18 Out of v1.** [Q9] No public map of open issues.

## Non-functional requirements

Targets taken from the documents keep their original numbers; additions from your answers continue the series.

- **NFR1 Tracking page speed.** Renders in 2 seconds or less at the median on a modern phone over a typical 4G connection. [PRD NFR-1]
- **NFR2 Queue speed.** Renders in 1 second or less at the median with up to 1,000 reports. [PRD NFR-2]
- **NFR3 Acknowledgement email reliability.** At least 99% sent within 60 seconds of submission, measured while the platform is up. [PRD NFR-3] [F2]
- **NFR4 Notification reliability.** At least 95% delivered within 5 minutes of a status change, measured while the platform is up. [PRD NFR-4] [F2]
- **NFR5 Auditability.** Every status change is recorded with timestamp and acting user or system. [PRD NFR-5] [BRD NFR-08]
- **NFR6 Privacy: anonymous by default.** No citizen account; an email is optional. [PRD NFR-6] [Q7]
- **NFR7 Privacy: public location.** The PRD default (neighbourhood zone only on public pages) is replaced by your decision that the exact pin is public and the photo is staff-only. [PRD NFR-7] [Q8] [F1]
- **NFR8 Staff authentication.** Dashboard access needs sign-in with a second factor. [PRD NFR-8] [Q2]
- **NFR9 Browser support.** Latest two stable versions of Chrome, Firefox, Safari, Edge, plus mobile Safari and Chrome on Android. [PRD NFR-9] [BRD NFR-06]
- **NFR10 Spreadsheets stay.** The platform does not take over advanced reporting, audit or history from spreadsheets in v1. [PRD NFR-10] [BRD BR-904]
- **NFR11 Accessibility.** Both web surfaces meet WCAG 2.2 level AA. [Q6]
- **NFR12 Availability and backup.** Best-effort availability, no uptime commitment; daily backups; up to one day of data loss accepted. [Q5] [F2]
- **NFR13 Scale.** Designed for a small pilot: under 100 new reports a day and up to 20 staff, with 1,000 or more reports stored (NFR2). Storm-time spikes are not quantified. [Q4]
- **NFR14 Data protection baseline.** Design to a GDPR-grade baseline (lawful basis, retention limits, deletion on request, breach handling) while the governing country is unknown; the AWS Region stays configurable. [Q3]
- **NFR15 Submission abuse protection.** Anonymous submission is rate-limited and screened for automated abuse, and uploaded photos are checked for malware and stripped of embedded location metadata. [assumption: needed because FR1 has no account; not stated in any source]
- **NFR16 Tracking ID secrecy.** Tracking IDs cannot be guessed or enumerated (length, alphabet and rate limiting). [PRD R-6 extended] [assumption]

## Constraints

- Web only; two interfaces (Citizen Portal and Authority Dashboard). [BRD §10.1]
- Platform-submitted reports only; helpline, WhatsApp and in-person channels are untouched. [BRD BR-903]
- No AI features (no auto-categorisation, summaries or predictions). [BRD §10.1]
- English only. [BRD §10.1]
- AWS-based infrastructure. [desc]
- One municipality customer in v1; no multi-tenancy. [Q1] [PRD §5]
- Hosting and governance model is not decided beyond the single pilot (PRD OQ-1 stays open). [Q1]

## Assumptions

- A pilot municipal partner is available to validate targets. [BRD §10.2]
- Basic filter, sort and status handling is enough at pilot volume. [BRD BR-905]
- The photo cap, Tracking ID alphabet, email-only notifications, zone/text location filter and config-table categories listed in the PRD §9 stand. [PRD §9]
- NFR15 and NFR16 are added by this analysis and need your confirmation at the gate. [assumption]

## Out of scope

- Native mobile apps, back-office integration, helpline/WhatsApp ingestion, payments or fines, federation or multi-tenancy, AI features, languages other than English. [PRD §5] [BRD §4.2]
- Citizen comment threads, saved filter views, radius filters, SMS and push notifications, auto-priority rules, citizen accounts. [PRD §6.2]
- A public map of open issues. [Q9]
- Application code in this run. [desc]

## Gaps and contradictions found in the source documents

Listed rather than guessed. Items marked "resolved" were settled by your answers; the rest carry forward.

| # | Finding | Where | Status |
|---|---|---|---|
| G1 | Hosting/governance model (PRD OQ-1) and authority login (OQ-2) are labelled "must be resolved before architecture" but were open. | PRD §8 | Resolved for v1: single pilot [Q1], invited accounts [Q2]. Governance after the pilot is still open. |
| G2 | Anonymous submission versus an acknowledgement email and a personal history view that both need an email. | PRD NFR-6 vs FR-2, FR-4 | Resolved [Q7]: email optional, FR2.4 and FR4.2 added. |
| G3 | Public exact pin and photo versus the zone-only default and the privacy risk R-4. | PRD NFR-7, R-4 vs Q8 | Resolved [F1]: exact pin public, photo staff-only. Residual risk: an exact public pin can identify a home (see OQ-A2). |
| G4 | Best-effort availability versus the 99% email and 24-hour promises. | NFR3, FR6 vs Q5 | Resolved [F2]: targets measured while the platform is up. The citizen-facing 24-hour promise can still break during an outage. |
| G5 | The BRD puts audit trails out of scope (spreadsheets keep them) but also requires every status change to be audit-logged (BRD NFR-08, BR-901). | BRD §4.2 vs §7 | Carried forward; this design logs status changes only (NFR5) and leaves advanced audit reporting to spreadsheets (NFR10). Needs your confirmation. |
| G6 | "Resolved" is called terminal in success metrics (SM-3) but can be reopened by a dispute (FR14). The word "Closed" is also used for retention. | PRD SM-3 vs FR14 | Open (OQ-A5). |
| G7 | "Disputed" is a flag in the queue but is not in the list of statuses. | PRD FR-13 vs Glossary | Open: this design treats it as a flag on a report, not a status. |
| G8 | The 24-hour rule is stated three ways: 80% within 24 hours, median within one business day, and next business day after hours. | PRD FR-6, BRD NFR-02, BRD §9.2 | Open (OQ-A4). |
| G9 | The brief describes helpdesk operators, department leads and field coordinators, and wants "clear ownership" and dispatch; the PRD says roles are not subdivided and has no assignment requirement. | Brief vs PRD Glossary | Open: v1 has one staff role and no assignment (OQ-A3). |
| G10 | Both PRD and BRD use "NFR-n" and BRD uses "BR-" for both requirements and rules; the PRD marks itself final while the BRD is a draft. | PRD, BRD | Handled by the ID mapping in the preface. |
| G11 | Nothing in the documents covers spam, photo malware, retention purge mechanics, data export to spreadsheets, backup and restore, or how success metrics are measured. | All three | NFR15, FR17 added; export and metrics reporting are open (OQ-A6). |
| G12 | "Zone" is used for location filters and privacy but never defined. | PRD FR-8, NFR-7 | Open (OQ-A7). |
| G13 | An "internal note" appears on acknowledgement (FR9.2) but there is no rule about who sees it or whether it is kept in history. | PRD FR-9 | Open: this design keeps it staff-only. |

## Open questions

- OQ-A1 Is the "after" photo public on the tracking page? (FR3.5)
- OQ-A2 Should the public pin be rounded or offset to reduce the home-identification risk from G3?
- OQ-A3 Is a single staff role with no assignment enough for the pilot? (G9)
- OQ-A4 What are business hours, and is the target measured as 80% within 24 hours or a median of one business day? (G8)
- OQ-A5 When does a Resolved report count as closed for the 24-month retention clock? (G6, FR17)
- OQ-A6 How do pilot staff get data out for their spreadsheets, and who reports the success metrics? (G11, NFR10)
- OQ-A7 What are the zones used for filtering and public display? (G12)
- OQ-A8 Which country's law applies and where must data live? Still unknown (NFR14).
- Governance and funding model after the pilot (PRD OQ-1, BRD R-5).

## Sources

- [desc] Initial description: "Design the architecture for the Civic Issue Tracker."
- [PRD] `_bmad-output/planning-artifacts/prds/prd-Civic-Issue-Tracker-2026-08-30/prd.md`
- [BRD] `_bmad-output/planning-artifacts/brd.md`
- [Brief] `_bmad-output/planning-artifacts/briefs/brief-Civic-Issue-Tracker-2026-08-30/brief.md`
- [Q1]–[Q9], [F1], [F2] `aidlc/spaces/default/intents/261028-civic-architecture-desig/inception/requirements-analysis/requirements-analysis-questions.md`

## Assumptions & Open Questions

- Assumptions: see "Assumptions" above; the PRD §9 assumptions stand and NFR15 and NFR16 need your confirmation.
- Open questions: OQ-A1 to OQ-A8 and the governance question above.
