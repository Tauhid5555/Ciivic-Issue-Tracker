# Units Generation — Clarifying Questions

Inputs: `components.md` (6 domain components plus CitizenPortal and AuthorityDashboard), `decisions.md` (ADR-001 to ADR-006), `requirements.md` (FR1–FR18, NFR1–NFR16). No `stories.md` exists, so units are traced to FR IDs. This stage decides how the building blocks are grouped into units of work and what can depend on what. It does not choose the build order; Delivery Planning does that.

## Question 1 — How should the building blocks be grouped into units? (ADR-001; FR1–FR17)

A unit is a piece of work that can be designed, built and tested on its own.

Option A (by building block, 8 units): one unit per component in `components.md`.
Option B (by trust boundary and surface, 5 units, recommended): Case Workflow with Staff Access and Notifications as the staff-side backend; Report Intake with Evidence and Retention and Citizen Access as the public-side backend; Citizen Portal; Authority Dashboard; and a shared contract unit.
Option C (by feature slice): submit-and-track, triage-and-resolve, retention-and-privacy, each cutting through every layer.

A. Option A, one unit per building block (clearest ownership, most units and cross-unit contracts for a pilot team)
B. Option B, grouped by trust boundary and surface (recommended: keeps public and staff code apart, matches ADR-001, fewer contracts to maintain)
C. Option C, feature slices (each unit delivers something a user sees, but slices share the report data and would overlap in Case Workflow)
X. Other (please specify)

[Answer]: B
(Left to the assistant by the person: "you should be able to resolve this for yourself". Refined during planning: Case Workflow stands as its own unit because the other backend units depend on it.)

## Question 2 — How coarse or fine should the units be? (NFR13)

The pilot is one team, under 100 reports a day and up to 20 staff.

A. Coarse, 3 to 4 units (least overhead, but each unit is large and hard to review)
B. Medium, 5 to 6 units (recommended: each unit is a week or two of work, with a clear owner)
C. Fine, 8 or more units (smallest units, highest coordination cost)
X. Other (please specify)

[Answer]: B
(Left to the assistant by the person. Result: 7 units in total, 5 application units plus the contracts unit and the infrastructure unit from Question 6.)

## Question 3 — How are units deployed? (ADR-001, ADR-006; NFR12, NFR13)

ADR-001 left this decision to this stage.

A. One backend deployed as a single service with internal module boundaries, plus the two web surfaces served separately (recommended: simplest to run and debug for a pilot; modules can be split out later)
B. Each backend unit deployed as its own independent service (independent scaling and release, but more infrastructure and more failure points than a pilot needs)
C. Everything in one deployable, including the two web surfaces (lowest cost, but public and staff code ship and fail together)
X. Other (please specify)

[Answer]: A

## Question 4 — How should the first unit be shaped? (org rule on walking skeleton; this scope has it off)

The walking-skeleton ceremony is off for this scope, so this is only about unit order shape, not a checkpoint.

A. Make no unit special; Delivery Planning decides what goes first (recommended: keeps this stage to topology only)
B. Shape one unit as the smallest working slice (submit a report, see it in the queue, acknowledge it, see the status on the tracking page) so a first integrated check is possible early
X. Other (please specify)

[Answer]: A
(Left to the assistant by the person.)

## Question 5 — How much parallel work should the dependency graph allow? (ADR-001)

A. Allow parallelism wherever two units do not depend on each other, with contracts agreed first so units can be built side by side (recommended)
B. Keep the graph a strict chain so units are built one after another
X. Other (please specify)

[Answer]: A
(Left to the assistant by the person.)

## Question 6 — Which kinds of unit should exist beyond the application code?

A unit has a kind: `service`, `spec`, `ui`, `packaging` or `library`. The kind decides which design documents Construction writes for it.

A. Add a `spec` unit for the shared API and event contracts, and a `packaging` unit for the infrastructure and deployment definitions (recommended: the contracts and AWS setup are real deliverables with their own review)
B. Only application units; contracts and infrastructure are written inside the units that use them
X. Other (please specify)

[Answer]: A
(Left to the assistant by the person.)

## Consolidated Summary Confirmation

- Seven units: the shared contracts (kind `spec`), the supporting services (Staff Access, Evidence and Retention, Notifications), Case Workflow, the public-side backend (Report Intake and Citizen Access), the Citizen Portal (`ui`), the Authority Dashboard (`ui`), and the infrastructure definitions (`packaging`)
- One backend deployed as a single service with internal module boundaries; the two web surfaces are served separately
- Units that do not depend on each other can be built in parallel once the contracts exist
- No unit is made special; Delivery Planning decides the build order
- Every functional requirement (FR1 to FR18) is assigned to a unit; the quality requirements are traced where they bind a unit

- Looks correct
- Request changes

[Answer]: Looks correct
