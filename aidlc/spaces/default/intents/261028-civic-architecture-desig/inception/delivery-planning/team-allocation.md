# Team Allocation — Civic Issue Tracker

A **Bolt** is one build pass over a piece of the work that ends in something that runs (listed in `bolt-plan.md`). A **mob** is the group that owns a Bolt. Here, every mob is the developer agent, the AI that builds the code, working in one session with you approving at each stage.

The team-formation stage did not run in this workflow (the classic plan skips it), so no human teams or roles were defined. Per the stage rule, all Bolts default to the developer agent. Solo ownership is the recorded setting (`Unit Ownership: solo`).

## Allocation

| Bolt | Unit | Owner | Why |
|---|---|---|---|
| 1 to 5 | U1 to U6 (built before this plan) | Developer agent (built directly in the repo) | Recorded for traceability only; nothing to assign |
| 6 | U7 infrastructure | Developer agent | No team defined |
| 7 | U2 platform services | Developer agent | No team defined |
| 8 | U3 case workflow | Developer agent | No team defined |
| 9 | U4 public-side backend | Developer agent | No team defined |
| 10 | U6 Authority Dashboard | Developer agent | No team defined |
| 11 | U5 Citizen Portal | Developer agent | No team defined |
| 12 | U5 own app | Developer agent | No team defined |
| 13 | U6 own app | Developer agent | No team defined |

## Running Bolts at the same time

You allowed parallel work [Q5-C]. With one owner, "parallel" means the work in a wave can be built in the same session as separate pieces (see the waves in `bolt-plan.md`): Wave 1 has Bolts 6 and 7, Wave 3 has Bolts 9 and 10, and Wave 5 has Bolts 12 and 13. Bolts in the same wave touch different units, so they do not edit the same files.

## Where people are still needed

These are not mob assignments. They are decisions or approvals that only a person can give, taken from the external dependency map (`external-dependency-map.md`) and the open questions:

- Choosing and contracting the email service, the malware scanning service and the hosted map provider.
- Providing the AWS account and choosing the Region.
- Naming the first invited staff and the zone list (open question OQ-A7 in `requirements.md`).
- Approving each stage, and the privacy owner's sign-off on risks R1 to R3 before launch (see `README.md`).

## Sources

- `aidlc-state.md` (classic plan, team formation skipped, solo ownership).
- [Q5] in `delivery-planning-questions.md`.
- `bolt-plan.md` (Bolt numbers and waves).
- `README.md` (accepted risks).

## Assumptions & Open Questions

- [assumption] No human team exists for this build; if one does, say so and this file changes before Construction.
- Open questions: none beyond those listed under "Where people are still needed".
