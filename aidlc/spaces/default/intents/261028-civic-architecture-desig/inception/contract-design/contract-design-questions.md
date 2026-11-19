# Contract Design — Clarifying Questions

Inputs: `unit-of-work.md` (U1 to U7), `unit-of-work-dependency.md`, `components.md`, `requirements.md`. A contract is the written agreement at a seam between two units: what crosses it, in what shape, and what happens when it fails. Each question below states my recommendation, so a "Yes" is enough.

## Question 1 — Is the only outside consumer of the backend our own two web screens? (FR1 to FR14; requirements "Out of scope")

The requirements leave out back-office integration, helpline or WhatsApp intake, and any third-party use. So the only callers of the backend from outside it are the Citizen Portal (U5) and the Authority Dashboard (U6), both run by this project.

A. Yes, no public API for partners or other systems in v1 (recommended)
B. No, a partner or outside system must also call the backend
X. Other (please specify)

[Answer]: A

## Question 2 — Do these mechanisms fit each seam? (ADR-006; FR2.3, FR5)

- Web screens to backend (U5 to U4, U6 to U3 and U2): JSON over HTTPS, request and response.
- Between backend modules (U4 to U3 and U2, U3 to U2): direct calls inside the one backend service, written as typed interfaces.
- The one asynchronous seam: when a report's status changes, the backend publishes a "status changed" event through a queue; the email sender picks it up. The magic-link email is sent directly because the citizen is waiting.

A. Yes, use these mechanisms (recommended)
B. No, I want a different mechanism for one or more seams
X. Other (please specify)

[Answer]: A

## Question 3 — Is "add freely, never break quietly" the right change rule? (NFR13)

The two web screens and the backend ship together in the pilot, so there is no outside client to protect. Recommendation: backend addresses carry a version (`/v1`); adding a field or an option is always allowed and consumers ignore fields they do not know; removing or renaming something needs the owning unit and every consuming unit to agree first, and a new version.

A. Yes, use this rule (recommended)
B. No, I want stricter or looser rules
X. Other (please specify)

[Answer]: A

## Question 4 — Are these failure rules acceptable? (NFR3, NFR4, NFR12)

- Web screens to backend: a request that takes more than 10 seconds is treated as failed, and the screen shows a message and lets the person try again. Reads (looking up a report, loading the queue) are retried once automatically; actions that change data are not retried automatically.
- Submitting a report carries a one-time key so a double tap or a retry never creates two reports.
- Status-changed event: delivered at least once; a failed email send is retried with growing pauses, up to 5 attempts, then recorded as failed. An email outage never stops a report or a status change from saving.
- Photo upload that fails stops the submission with a clear message; no report is created without its photo being stored.

A. Yes, use these rules (recommended)
B. No, I want different numbers or behaviour
X. Other (please specify)

[Answer]: A

## Question 5 — Does each backend unit own its own contract, with the contracts unit holding them together? (ADR-001, ADR-004)

Recommendation: the unit that provides a service owns its contract (Case Workflow owns the report and status shapes; Platform services own the photo, email and staff-sign-in shapes; the public-side backend owns the submission and tracking shapes). U1 holds all the specs in one place so every consumer reads from one source, and a change is made by the owner and reviewed by its consumers.

A. Yes, use this ownership (recommended)
B. No, I want a single owner for all contracts
X. Other (please specify)

[Answer]: A

## Consolidated Summary Confirmation

- Only the Citizen Portal and the Authority Dashboard call the backend from outside; no partner or third-party API in v1
- JSON over HTTPS from the screens; direct calls between backend modules; one queued "status changed" event for emails; the magic-link email is sent directly
- Versioned addresses (/v1); adding fields is always allowed; removing or renaming needs agreement from the owner and every consumer, and a new version
- 10-second timeout; one automatic retry for reads only; a one-time key on submission; emails retried up to 5 times; no report is created without its photo stored
- Each providing unit owns its contract; U1 holds all the specs in one place

- Looks correct
- Request changes

[Answer]: Looks correct
