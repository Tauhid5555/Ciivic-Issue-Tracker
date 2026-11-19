# Architecture Decisions — Domain Design

Each record states its Context, Decision, Consequences and Alternatives Rejected, with security and compliance implications and the requirements it traces to. Dates are 2026-10-28. The status is Proposed until you approve this stage.

| ADR | Title | Status |
|---|---|---|
| ADR-001 | Six domain components plus two presentation components | Proposed |
| ADR-002 | Status history lives inside each report | Proposed |
| ADR-003 | A citizen dispute is a flag, not a status | Proposed |
| ADR-004 | Case Workflow owns categories, zones and business hours | Proposed |
| ADR-005 | Personal data lives in the report; photos live apart, and each is purged by its owner | Proposed |
| ADR-006 | Notifications are requested by event and carry their own data | Proposed |

## ADR-001: Six domain components plus two presentation components

**Status:** Proposed

**Context.** One pilot team builds a platform for under 100 reports a day [requirements Q4]. The platform has two audiences with different threats: anonymous citizens and signed-in staff. Photos are untrusted files. Traces to FR1–FR18, NFR6, NFR8, NFR14, NFR15.

**Decision.** Split the domain into ReportIntake, CaseWorkflow, CitizenAccess, Notifications, StaffAccess and EvidenceRetention, and add CitizenPortal and AuthorityDashboard as presentation components [Q1-B]. The dependency graph has no cycle: surfaces call domain components, and nothing calls upward.

**Consequences.**
- Positive: each component has one reason to change; the public, unauthenticated surface (CitizenAccess, ReportIntake) is separated from staff actions, so a flaw on the public side cannot reach staff operations; malware risk is confined to EvidenceRetention.
- Negative: eight pieces to build and test for a pilot; some cross-component calls that a single module would not need.
- Neutral: whether these become one deployable or several is decided in Units Generation.

**Security and compliance.** The split follows the trust boundary: anonymous input is validated in ReportIntake and CitizenAccess before it reaches CaseWorkflow, and personal data is held in one place (CaseWorkflow), which keeps deletion and access requests tractable (NFR14).

**Alternatives Rejected.**
- Coarse, four components (Reporting, Notifications, Staff Access, Evidence and Retention) [Q1-A]: fewer pieces, but intake, tracking and workflow changes would all land in one component and public-facing code would sit beside staff operations.
- Fine, eight domain components with separate Reference Data and Audit Log [Q1-C]: cleanest boundaries, but two more components with almost no behaviour for a pilot of this size.

## ADR-002: Status history lives inside each report

**Status:** Proposed

**Context.** Every status change must be recorded with time and acting user (NFR5, FR11.2). Staff may be deactivated, so the record must still name them (FR16). Staff cannot change a status without it being recorded.

**Decision.** CaseWorkflow keeps an ordered list of StatusChange entries as part of the Report, saved in the same transaction as the status change [Q2-A]. Each entry carries from and to status, reason, time, and the acting staff identity or "system".

**Consequences.**
- Positive: a status can never change without its record; the history is read together with the report for the tracking page; no event can be lost between the change and its record.
- Negative: cross-report audit questions need a query over reports rather than a dedicated audit store; advanced audit reporting stays in spreadsheets (NFR10).
- Neutral: a separate audit export can be added later without changing the write path.

**Security and compliance.** History entries are append-only: no update or delete operation is exposed. Actor identity is a staff id, not a name, so deactivating or erasing an account does not rewrite history. Purged reports keep their status history with personal data removed (FR17.2).

**Alternatives Rejected.**
- Separate Audit component fed by events [Q2-B]: queryable across reports, but a change can be saved while its audit event is lost, and it adds a component and a delivery guarantee to build.
- Full event sourcing for reports: gives a natural history, but is heavy for a small team and makes deletion of personal data in past events harder (NFR14).

## ADR-003: A citizen dispute is a flag, not a status

**Status:** Proposed

**Context.** The PRD says a dispute does not change the status, yet disputed reports must be flagged in the queue and reopened (FR13, FR14). The status list is fixed (FR11.1) and the success metrics count terminal statuses (SM-3). This resolves gap G7.

**Decision.** The Report has a `disputed` flag set by the citizen action and cleared when staff reopen or re-resolve the report [Q3-A]. The status list stays Submitted, Acknowledged, In Progress, Resolved, Closed-Duplicate.

**Consequences.**
- Positive: the PRD status list and the metrics stay valid; the dispute is a recorded timestamped fact.
- Negative: the queue needs a filter on the flag; "Resolved" is not strictly terminal, which keeps gap G6 open for the retention clock (OQ-A5).
- Neutral: reopening is a normal backward move with a required reason.

**Security and compliance.** The dispute action is open to anyone holding the Tracking ID, so it can be abused. CitizenAccess rate-limits it and CaseWorkflow records time and client key hash only, never more personal data than the report already holds.

**Alternatives Rejected.**
- A sixth status "Disputed" [Q3-B]: visible in the workflow, but changes the PRD status list and muddies the resolution metrics.
- A separate Dispute entity with its own lifecycle: more flexible, but the PRD allows only a single dispute action with no messaging (FR13 out of scope), so it adds structure nobody asked for.

## ADR-004: Case Workflow owns categories, zones and business hours

**Status:** Proposed

**Context.** Categories must change by configuration, not code (FR15.2). Zones and business hours are used by filters, public display and the 24-hour measure but are not yet defined (gaps G8, G12; OQ-A4, OQ-A7).

**Decision.** CaseWorkflow owns Category, Zone and BusinessCalendar as configuration data [Q4-A]. Other components read them through CaseWorkflow.

**Consequences.**
- Positive: no extra component; the entities that define the 24-hour measure sit beside the reports it is measured on.
- Negative: configuration changes need CaseWorkflow to be available; moving to several authorities would mean splitting this out.
- Neutral: an administrator interface for these values is not in the requirements; they are changed by deployment configuration in v1.

**Security and compliance.** Configuration changes alter what staff and the public see (zones appear in filters), so changes go through the same reviewed deployment path as code and are not editable by anonymous callers.

**Alternatives Rejected.**
- Separate Reference Data component [Q4-B]: cleaner if more authorities arrive, but one more moving part for a single-customer pilot [requirements Q1-A].
- Hard-coded values: simplest, but contradicts FR15.2 and the unresolved zones and hours would force code changes.

## ADR-005: Personal data lives in the report; photos live apart, and each is purged by its owner

**Status:** Proposed

**Context.** Photos and locations are removed 24 months after a report closes (FR17.1); the exact pin is public and the citizen photo is staff-only (FR3.3, FR3.4); email is optional (FR1.5). The governing law is unknown, so a GDPR-grade baseline applies (NFR14). Photos are untrusted files that may contain faces, number plates and location metadata.

**Decision.** CaseWorkflow owns every personal field of a report (location, description, contact email) and runs the daily retention purge on its own data. EvidenceRetention owns photo files; CaseWorkflow tells it to delete a photo when the retention period ends, and EvidenceRetention also expires any photo never attached to a report after 24 hours. EvidenceRetention never calls back into CaseWorkflow, so there is no cycle.

**Consequences.**
- Positive: one owner per kind of personal data; a deletion request or purge touches two well-defined places; the orphan expiry cleans up failed submissions without any call back.
- Negative: the retention rule is split between the two components, so both must be tested together for a full purge; if the purge call fails, the photo outlives the period until the next run.
- Neutral: a purge that keeps the status history but removes personal fields needs a defined public view for purged reports (OQ-A5 and the open post-purge page question from the requirements review).

**Security and compliance.** Photos are stored privately, served only to staff through short-lived links, scanned for malware, and stripped of location metadata (NFR15). Retention is enforced by code, not by policy text. Deletion on request (NFR14) uses the same two operations. Logs must not carry email addresses or descriptions.

**Alternatives Rejected.**
- A central Retention component that reaches into every other component: gives one place for the rule, but needs read and delete access to others' data and creates a cycle with CaseWorkflow.
- EvidenceRetention owning the closed date and driving deletion: needs a dependency back to CaseWorkflow, which already depends on it.

## ADR-006: Notifications are requested by event and carry their own data

**Status:** Proposed

**Context.** Acknowledgement emails must be sent within 60 seconds (NFR3) and status emails within 5 minutes (NFR4), measured while the platform is up [F2]. Availability is best effort. Notifications go only to citizens who gave an email (FR5.1). A report must never fail to save because email is down.

**Decision.** CaseWorkflow publishes a status-changed event that carries everything the email needs; Notifications builds and sends it, retries failures with capped backoff and records the outcome. CitizenAccess calls Notifications directly for the magic-link email because the citizen is waiting for it.

**Consequences.**
- Positive: saving a report does not depend on the email service; Notifications has no dependency on any other component; bounces are recorded in one place.
- Negative: the email can arrive later than the change, and an event lost between save and publish would lose a notification unless the event is written in the same transaction as the change.
- Neutral: delivery rate reporting (SM-7) needs the outcome records Notifications keeps.

**Security and compliance.** The email address travels in the event and is held in NotificationRequest, so it is personal data: it is removed with the rest of a closed report's personal data and never written to application logs. Magic-link tokens are stored hashed, single-use and short-lived (FR4.1).

**Alternatives Rejected.**
- CaseWorkflow calls the email service synchronously: simplest, but an email outage would block staff status changes and break the 24-hour flow.
- Notifications polls CaseWorkflow for changes: avoids events, but adds latency against the 60-second target and a read dependency from Notifications back to CaseWorkflow.
