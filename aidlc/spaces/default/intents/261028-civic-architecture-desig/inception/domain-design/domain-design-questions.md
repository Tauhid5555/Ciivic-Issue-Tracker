# Domain Design — Clarifying Questions

Inputs: `requirements.md` (FR1–FR18, NFR1–NFR16). Components are the code we write; databases, queues and email services are dependencies of components, not components.

## Question 1 — How finely should we split the building blocks? (FR1–FR5, FR7–FR14, FR16, FR17; NFR5, NFR6, NFR14)

Option A (coarse, 4 components): Reporting (intake, workflow, history, tracking pages, magic links), Notifications, Staff Access, Evidence and Retention (photos, purge).
Option B (balanced, 6 components, recommended): Report Intake, Case Workflow (status, priority, dispute, history), Citizen Access (Tracking ID lookup, magic links), Notifications, Staff Access, Evidence and Retention.
Option C (fine, 8 components): Option B plus separate Reference Data (categories, zones, business hours) and Audit Log components.

A. Option A, coarse (fewer pieces, but intake, workflow and tracking changes all touch one component)
B. Option B, balanced (recommended: each piece has its own reason to change; small enough for a pilot team)
C. Option C, fine (cleanest boundaries, most pieces to build and test for a pilot of under 100 reports a day)
X. Other (please specify)

[Answer]: B

## Question 2 — Where does the status history live? (NFR5, FR11)

Every status change must be recorded with time and acting user. The question is whether history is part of the report itself or a separate audit component.

A. Part of the report: each report keeps its own ordered history of changes, written in the same transaction as the status change (recommended: no way to change status without recording it)
B. Separate Audit component that receives an event after each change (can be queried across reports, but a change can be saved without its record if the event is lost)
X. Other (please specify)

[Answer]: A

## Question 3 — How is a citizen dispute modelled? (FR13, FR14; gap G7)

The PRD says disputing does not change the status, yet disputed reports must be flagged and reopened.

A. A flag on the report (recommended: statuses stay as the PRD lists them; the flag clears when staff reopen or re-resolve)
B. A sixth status, "Disputed" (visible in the workflow, but changes the PRD status list and the success metrics)
X. Other (please specify)

[Answer]: A

## Question 4 — Who owns categories, zones and business hours? (FR15, FR8, FR6; gaps G8, G12)

Categories are meant to change by configuration, and zones and business hours are not defined yet.

A. Case Workflow owns them as configuration data, no separate component (recommended for a pilot: simple, easy to split out later)
B. A separate Reference Data component that both intake and workflow read (cleaner if more authorities arrive, but extra moving part now)
X. Other (please specify)

[Answer]: A

## Consolidated Summary Confirmation

- Six building blocks: Report Intake, Case Workflow, Citizen Access, Notifications, Staff Access, Evidence and Retention
- Status history is part of each report and is saved in the same step as the status change
- A citizen dispute is a flag on the report, not a sixth status
- Case Workflow owns categories, zones and business hours as configuration data

Does this all look correct before I generate the domain design artifact?

- Looks correct
- Request changes

[Answer]: Looks correct
