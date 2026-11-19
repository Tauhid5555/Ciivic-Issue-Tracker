# Requirement-to-Unit Map — Civic Issue Tracker

No `stories.md` was produced in this run, so each row is keyed by functional requirement (`FR`). The primary unit is the one that owns the rule; other units that take part are listed under "Also involves".

## Map

| ID | Primary unit | Directory | Also involves | Note |
|---|---|---|---|---|
| FR1 | U4 | u4-public-backend | U5, U2, U3 | Submit a report without an account |
| FR1.1 | U4 | u4-public-backend | U5 | Submission with category, description, photo and location |
| FR1.2 | U3 | u3-case-workflow | U4 | Fixed five categories live in CaseWorkflow configuration |
| FR1.3 | U5 | u5-citizen-portal | | Geolocation or draggable pin; denial never blocks |
| FR1.4 | U2 | u2-platform-services | U4 | Photo type and size checks |
| FR1.5 | U4 | u4-public-backend | U3 | Email optional on every report |
| FR2 | U4 | u4-public-backend | U5, U3, U2 | Tracking ID and confirmation |
| FR2.1 | U5 | u5-citizen-portal | U4 | Confirmation within 2 seconds |
| FR2.2 | U3 | u3-case-workflow | | Tracking ID length and alphabet |
| FR2.3 | U2 | u2-platform-services | U3 | Acknowledgement email within 60 seconds |
| FR2.4 | U4 | u4-public-backend | U5 | No-email warning text, shown by the portal |
| FR3 | U4 | u4-public-backend | U5, U3, U2 | Public tracking page |
| FR3.1 | U4 | u4-public-backend | U5 | No sign-in, reached by Tracking ID URL |
| FR3.2 | U4 | u4-public-backend | U3, U5 | Fields and full status history |
| FR3.3 | U4 | u4-public-backend | U5 | Exact pin public |
| FR3.4 | U2 | u2-platform-services | U4 | Citizen photo staff-only |
| FR3.5 | U4 | u4-public-backend | U3 | Resolution note public; after photo visibility open (OQ-A1) |
| FR4 | U4 | u4-public-backend | U5, U2 | Personal history by magic link |
| FR4.1 | U4 | u4-public-backend | U2, U5 | Single-use, short-lived, rate-limited link |
| FR4.2 | U4 | u4-public-backend | | No history without an email |
| FR5 | U2 | u2-platform-services | U3 | Notify on status change |
| FR5.1 | U2 | u2-platform-services | U3 | Only when an email exists |
| FR5.2 | U2 | u2-platform-services | | Email contents |
| FR5.3 | U2 | u2-platform-services | | Email is the only channel |
| FR6 | U3 | u3-case-workflow | U6 | Acknowledge within 24 hours |
| FR6.1 | U3 | u3-case-workflow | U7 | Business hours and the 80% measure; calendar is configuration |
| FR6.2 | U6 | u6-authority-dashboard | U3 | Two actions or fewer to acknowledge |
| FR7 | U3 | u3-case-workflow | U6 | Triage queue |
| FR7.1 | U3 | u3-case-workflow | U6 | List and sort |
| FR7.2 | U3 | u3-case-workflow | U6 | Paging at 1,000 or more reports |
| FR8 | U3 | u3-case-workflow | U6 | Filters |
| FR8.1 | U3 | u3-case-workflow | U6 | Combinable filters and presets |
| FR8.2 | none | none | none | Saved views and radius filters are not in v1 |
| FR9 | U6 | u6-authority-dashboard | U3 | Acknowledge in two clicks |
| FR9.1 | U6 | u6-authority-dashboard | U3 | One Acknowledge button per row |
| FR9.2 | U6 | u6-authority-dashboard | U3 | Priority and internal note in detail view |
| FR9.3 | U6 | u6-authority-dashboard | | No confirmation dialog |
| FR10 | U3 | u3-case-workflow | U6 | Priority |
| FR10.1 | U3 | u3-case-workflow | U6 | Low, Medium, High, Urgent; default Medium |
| FR11 | U3 | u3-case-workflow | U6, U2 | Status workflow |
| FR11.1 | U3 | u3-case-workflow | | Five statuses |
| FR11.2 | U3 | u3-case-workflow | U6, U2 | Forward one step; backward needs a reason and the acting user |
| FR11.3 | U3 | u3-case-workflow | U6 | Resolved needs a resolution note |
| FR11.4 | U3 | u3-case-workflow | U6 | Closed-Duplicate needs a link to the original |
| FR12 | U3 | u3-case-workflow | U6, U2 | Resolution note and after photo |
| FR12.1 | U3 | u3-case-workflow | U6, U2 | Note required; after photo optional |
| FR13 | U4 | u4-public-backend | U3, U5 | Citizen dispute |
| FR13.1 | U4 | u4-public-backend | U3, U5 | Records a timestamp and flags the report; status unchanged |
| FR13.2 | U4 | u4-public-backend | U3 | Only while Resolved |
| FR14 | U3 | u3-case-workflow | U6 | Reopen a disputed report |
| FR14.1 | U3 | u3-case-workflow | U6 | Reopen with a reason; disputed reports flagged in the queue |
| FR15 | U3 | u3-case-workflow | U7 | Fixed categories |
| FR15.1 | U3 | u3-case-workflow | | Streetlight, pothole, garbage, drainage, noise |
| FR15.2 | U3 | u3-case-workflow | U7 | Adding a category is a configuration change |
| FR16 | U2 | u2-platform-services | U6 | Invited staff accounts with second factor |
| FR17 | U3 | u3-case-workflow | U2, U7 | Retention and deletion |
| FR17.1 | U3 | u3-case-workflow | U2, U7 | Photos and locations removed 24 months after close; scheduler from U7 |
| FR17.2 | U3 | u3-case-workflow | | Status history outlives removal without personal data |
| FR18 | none | none | none | No public map in v1 |

FR8.2 and FR18 are statements of what v1 leaves out, so no unit builds them. They are recorded as not applicable in `traceability.json`.

## Implementation order within each unit

Topology only; the order between units is Delivery Planning's decision.

- **U1:** contracts for the seams that U2 and U3 need first, then those for U4, U5 and U6.
- **U2:** StaffAccess, EvidenceRetention, Notifications (independent modules).
- **U3:** report and status rules with history, then queue and filters, then dispute flag and reopen, then configuration, then retention purge.
- **U4:** ReportIntake, then CitizenAccess tracking view, then magic links, then dispute.
- **U5:** report form and confirmation, then tracking page, then personal history and dispute.
- **U6:** sign-in and queue, then report detail and acknowledge, then filters, then resolve, reopen and bulk actions.
- **U7:** environments and data stores, then deployment path, then backup and restore.

## Cross-cutting concerns

Quality requirements that bind more than one unit. They are not mapped one by one in `traceability.json`; each is traced in the later quality-requirements stage.

- NFR1 and NFR2 (page and queue speed): U5, U6, with U3 and U4 serving the data.
- NFR3 and NFR4 (email reliability): U2, with U3 publishing the event.
- NFR5 (auditability): U3 holds the history; U2 supplies the acting identity.
- NFR6, NFR7, NFR14 (privacy, public pin, data protection): U3, U4, U2 and U7.
- NFR8 (staff second factor): U2, U6.
- NFR9, NFR11 (browsers, accessibility): U5, U6.
- NFR12, NFR13 (backup, pilot scale): U7.
- NFR15, NFR16 (abuse protection, Tracking ID secrecy): U4, U2.
- Contracts between units are owned by U1; U7 hosts every unit.

## Coverage check

- Every functional requirement ID is on a row: FR1 to FR18 and all their sub-requirements (59 IDs). 57 have a primary unit; FR8.2 and FR18 are out of v1.
- Every unit appears: U2, U3, U4, U5 and U6 are primary for at least one row. U7 appears in the "Also involves" column of FR6.1, FR15, FR15.2, FR17 and FR17.1. U1 owns no requirement of its own: it is the contract for every seam, so it appears in the cross-cutting concerns above rather than as a row.

## Sources

- `requirements.md` (FR1 to FR18) [requirements]
- `unit-of-work.md` (units and directories) [unit-of-work]
- `components.md` (component ownership) [components]

## Assumptions & Open Questions

- None.
