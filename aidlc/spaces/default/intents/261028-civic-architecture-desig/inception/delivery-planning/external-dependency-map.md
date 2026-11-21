# External Dependency Map — Civic Issue Tracker

This file lists things outside the build itself that could hold up a Bolt (one build pass over a piece of the work that ends in something that runs; see `bolt-plan.md`). You confirmed four of them [Q6]: the email service, the malware scanning service, the hosted map provider, and the AWS account and Region.

You did not give owners, lead times or fallbacks. The cells marked [assumption] are the delivery agent's proposals for you to correct at the gate; the cells marked "to be named" need a person and cannot be filled in by the plan.

| # | Dependency | Needed by | Owner | Lead time | Blocks | If it slips |
|---|---|---|---|---|---|---|
| D1 | AWS account, access and Region choice (NFR14) | Bolt 6 | To be named | To be named | Bolt 6, then Bolts 8, 12, 13 (the scheduler and static hosting come from Bolt 6) | [assumption] Build and test locally against PostgreSQL in a container; hold the AWS-only work (scheduler, storage, hosting) until the account exists |
| D2 | Email delivery service (acknowledgement, status emails, magic links; FR2.3, FR5, FR4.1) | Bolt 7 | To be named | To be named | Bolt 7, then Bolt 9 (magic links need real email) | [assumption] Keep the queue and the retry logic and use a sandbox or test mailbox until a provider is chosen; do not launch to real citizens without real email |
| D3 | Malware scanning service (NFR15) | Bolt 7 | To be named | To be named | Bolt 7 | [assumption] Keep today's hook that accepts everything only for non-public testing; photo upload stays disabled for real citizens until a scanner is connected (the README already says not to use real photos before then) |
| D4 | Hosted map tiles and place search under a data-processing agreement (risks R1, R2) | Bolt 11 (search through our backend is in Bolt 9) | To be named | To be named | Bolt 11 | [assumption] Keep the free OpenStreetMap services for development only; the privacy owner re-accepts R1 and R2 in writing before any pilot with real citizens |

Items not selected: the staff directory and zone list (open question OQ-A7 in `requirements.md`). They are not a hold-up for any Bolt, because zones and the first staff are configuration (ADR-004), but someone must supply them before the pilot. They are listed here so they are not lost.

## Which Bolt consumes which dependency

| Bolt | D1 AWS | D2 Email | D3 Malware scan | D4 Map provider |
|---|---|---|---|---|
| 6 U7 infrastructure | yes | | | |
| 7 U2 completion | yes (queue, storage) | yes | yes | |
| 8 U3 completion | yes (scheduler) | | | |
| 9 U4 completion | | yes | | |
| 10 U6 completion | | | | |
| 11 U5 completion | | | | yes |
| 12 U5 own app | yes (hosting) | | | |
| 13 U6 own app | yes (hosting) | | | |

## Sources

- [Q6] in `delivery-planning-questions.md`.
- `bolt-plan.md` (which Bolt does what).
- `README.md` (known gaps and accepted risks R1, R2).
- `requirements.md` (NFR14, NFR15; FR2.3, FR4.1, FR5; OQ-A7).
- `decisions.md` (ADR-004 configuration, ADR-006 email).

## Assumptions & Open Questions

- [assumption] The fallbacks in the "If it slips" column are the delivery agent's proposals.
- Open questions: who owns D1 to D4, and how long each takes. Both need your answer before Construction.
