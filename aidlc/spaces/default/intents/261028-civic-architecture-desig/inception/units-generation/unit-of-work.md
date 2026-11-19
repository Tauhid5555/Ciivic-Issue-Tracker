# Units of Work — Civic Issue Tracker

Seven units. Your choices from `units-generation-questions.md`: grouped by trust boundary and surface [Q1-B], medium granularity [Q2-B], one backend deployed as a single service with the two web surfaces served separately [Q3-A], no unit made special [Q4-A], parallel work allowed [Q5-A], and extra `spec` and `packaging` units [Q6-A]. Q1, Q2, Q4, Q5 and Q6 were left to the architect by you; Q3 is your own pick.

Components come from `components.md`; decisions from `decisions.md` (ADR-001 to ADR-006).

## Unit table

| Unit ID | Directory | Name | Kind | Components | Complexity | Deployment |
|---|---|---|---|---|---|---|
| U1 | u1-contracts | Shared contracts | spec | none (describes the boundaries of all components) | S | embedded (consumed in place) |
| U2 | u2-platform-services | Platform services | service | StaffAccess, EvidenceRetention, Notifications | L | shared (modules of the one backend service) |
| U3 | u3-case-workflow | Case workflow | service | CaseWorkflow | L | shared (module of the one backend service) |
| U4 | u4-public-backend | Public-side backend | service | ReportIntake, CitizenAccess | M | shared (modules of the one backend service) |
| U5 | u5-citizen-portal | Citizen Portal | ui | CitizenPortal | M | standalone (served separately) |
| U6 | u6-authority-dashboard | Authority Dashboard | ui | AuthorityDashboard | M | standalone (served separately) |
| U7 | u7-infrastructure | Infrastructure and deployment | packaging | none (hosts every component) | M | standalone (deployment definitions) |

Every component in `components.md` is owned by exactly one unit.

## Unit definitions

### U1 — Shared contracts (`u1-contracts`, spec)

- **Boundaries:** the written agreements at each seam: the calls from each web surface to the backend, the calls between backend modules, and the status-changed event that carries what an email needs (ADR-006).
- **Owns and delivers:** request and response shapes, error behaviour, the event shape, and the rules for who owns each contract. Detail is written in Contract Design (stage 2.8).
- **Complexity:** S. No runtime of its own; every other unit reads it.
- **Implementation notes:** a spec unit owes no scalability or business-logic design in Construction. Contracts follow the ownership in `components.md`: for example CaseWorkflow owns the report shapes, EvidenceRetention owns the photo shapes.

### U2 — Platform services (`u2-platform-services`, service)

- **Boundaries:** staff accounts and sign-in (StaffAccess), private photo storage and checks (EvidenceRetention), and reliable citizen email (Notifications). None of the three calls another component, so this unit sits at the bottom of the dependency graph.
- **Owns and delivers:** invited staff accounts with second factor and active/deactivated state (FR16, NFR8); photo type, size, malware and location-metadata checks with staff-only access and expiry of unattached photos (FR1.4, FR3.4, NFR15); email templates, sending with retry, and delivery outcomes (FR2.3, FR5, NFR3, NFR4).
- **Complexity:** L. Three components and three external services (managed identity, malware scan, email delivery) plus a message queue.
- **Implementation notes:** keep the three modules separate inside the unit so a later split is cheap [ADR-001]. The recipient email is personal data and never goes to application logs [ADR-006]. An email outage must not stop a report from saving [ADR-006].

### U3 — Case workflow (`u3-case-workflow`, service)

- **Boundaries:** the Report and everything the rules say about it: status workflow, status history, priority, internal notes, dispute flag, triage queue, categories, zones, business hours, and the retention purge.
- **Owns and delivers:** the system of record (FR6, FR7, FR8, FR10 to FR15, FR17); status history saved in the same transaction as the change (NFR5, ADR-002); the dispute flag (ADR-003); configuration data (ADR-004); the status-changed event (ADR-006).
- **Complexity:** L. It holds the most rules and the most data, and every other unit leans on it.
- **Implementation notes:** history entries are append-only [ADR-002]. The daily purge removes personal data, asks EvidenceRetention (U2) to delete photos, and keeps history without personal data (FR17, ADR-005). Zones and business hours are not yet defined (OQ-A4, OQ-A7); they are configuration values, so the unit is not blocked by them.

### U4 — Public-side backend (`u4-public-backend`, service)

- **Boundaries:** everything an anonymous citizen reaches: submitting a report (ReportIntake) and looking one up, receiving a magic link, listing personal history and disputing (CitizenAccess).
- **Owns and delivers:** submission validation, rate limiting and abuse screening (FR1, NFR15); Tracking ID and confirmation text (FR2); the public tracking view (FR3, NFR7, NFR16); magic links and personal history (FR4); the dispute action (FR13).
- **Complexity:** M. Little data of its own (a submission attempt log and magic links); its difficulty is the public threat surface.
- **Implementation notes:** this is the trust boundary from ADR-001: public input is validated here before it reaches U3. Tracking ID lookups and magic-link requests are rate-limited so IDs cannot be enumerated. Magic-link tokens are stored hashed, single-use and short-lived (FR4.1, ADR-006).

### U5 — Citizen Portal (`u5-citizen-portal`, ui)

- **Boundaries:** the public pages: report form, confirmation, tracking page, personal history, magic-link request, and the dispute screen. Holds no data.
- **Owns and delivers:** the mobile-first screens from `wds-output` (FR1.3, FR2.1, FR2.4, FR3, FR4, FR13), draggable pin when geolocation is denied, WCAG 2.2 AA (NFR11), page speed (NFR1), browser support (NFR9).
- **Complexity:** M.
- **Implementation notes:** a `ui` unit owes no database or business-logic design. The tracking page must show the exact pin but never the citizen photo (FR3.3, FR3.4).

### U6 — Authority Dashboard (`u6-authority-dashboard`, ui)

- **Boundaries:** the staff pages: sign-in, triage queue, filters, report detail, acknowledge, priority, status moves, resolution note, after photo, and reopen. Holds no data.
- **Owns and delivers:** the desktop-first screens (FR6.2, FR7 to FR12, FR14), two-action acknowledge (FR9), WCAG 2.2 AA (NFR11), queue speed (NFR2).
- **Complexity:** M. The v1 priority screen, because staff adoption is the main product risk.
- **Implementation notes:** acknowledge has no confirmation dialog (FR9.3). Staff sign-in and session come from U2; all report actions go to U3.

### U7 — Infrastructure and deployment (`u7-infrastructure`, packaging)

- **Boundaries:** the AWS definitions that host the backend service, the two web surfaces, the database, the queue, the cache, private object storage, the scheduler, backups and the deployment path. Configurable AWS Region (NFR14).
- **Owns and delivers:** environments, backup and restore with up to one day of data loss accepted (NFR12), secrets handling, and the reviewed deployment path that configuration changes use (ADR-004).
- **Complexity:** M.
- **Implementation notes:** a packaging unit owes no business-logic model. Detailed infrastructure design is its own later stage (3.4); this unit is the place its output lands.
- **Constraint:** it must not break an ADR boundary, for example it must not give anonymous callers any access to stored photos (ADR-005).

## Sources

- `components.md` (eight components, entity ownership) [components]
- `decisions.md` (ADR-001 to ADR-006) [decisions]
- `requirements.md` (FR1 to FR18, NFR1 to NFR16) [requirements]
- `units-generation-questions.md` (Q1 to Q6) [Q1]–[Q6]

## Assumptions & Open Questions

- None. Open questions OQ-A1 to OQ-A8 from `requirements.md` carry forward unchanged; none of them changes a unit boundary.
