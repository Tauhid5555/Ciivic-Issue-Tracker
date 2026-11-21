# Risk and Sequencing Rationale — Civic Issue Tracker

This file explains why the Bolts in `bolt-plan.md` are in the order they are. A **Bolt** is one build pass over a piece of the work that ends in something that runs. **WSJF** (Weighted Shortest Job First, from Reinertsen's *Principles of Product Development Flow* and the SAFe method) scores each Bolt as (value + time criticality + risk reduction) divided by job size; a higher score ships earlier. A **unit** is a self-contained piece of the system listed in `unit-of-work.md`.

## The choices behind the order

- **Mix of approaches [Q2-D]:** risk-first for safety and launch blockers (malware scan, real email, infrastructure); value-first for the citizen and staff features (magic-link history, then staff screens, retention purge); the two-app split last.
- **Formal score [Q3-A]:** WSJF with equal weight on value, time criticality and risk reduction.
- **Biggest worry [Q7-A]:** real citizens' data on a system that still carries accepted pilot risks (map privacy R1, public-service terms R2, exact public pin R3, no malware scan). This is why safety work leads.
- **Bolt size [Q4-A]:** one unit per Bolt.
- **Parallel work [Q5-C]:** allowed wherever the dependency graph in `unit-of-work-dependency.md` allows it.

## WSJF scores

Scores use 1 to 10 for value, time criticality and risk reduction, and the size scale 1, 2, 3, 5, 8 (size 3 is a medium unit, 5 a large one). These numbers are proposals for you to adjust at the gate; they are judgement, not measurement [assumption].

| Bolt | Work | Value | Time criticality | Risk reduction | Sum | Size | Score |
|---|---|---|---|---|---|---|---|
| 6 | U7 infrastructure | 5 | 8 | 9 | 22 | 5 | 4.4 |
| 7 | U2 completion (email, malware scan, invitations) | 6 | 8 | 9 | 23 | 5 | 4.6 |
| 8 | U3 completion (purge, configuration) | 5 | 3 | 5 | 13 | 5 | 2.6 |
| 9 | U4 completion (magic link, search through our backend) | 7 | 6 | 7 | 20 | 3 | 6.7 |
| 10 | U6 completion (staff screens) | 6 | 5 | 4 | 15 | 3 | 5.0 |
| 11 | U5 completion (history screen, map provider) | 7 | 5 | 6 | 18 | 3 | 6.0 |
| 12 | U5 as its own app | 2 | 2 | 2 | 6 | 3 | 2.0 |
| 13 | U6 as its own app | 2 | 2 | 2 | 6 | 3 | 2.0 |

Why the scores are what they are, in short:

- Bolts 6 and 7 carry the highest risk reduction: they remove the launch blockers (no real hosting, no real email, no malware scan).
- Bolt 9 scores highest overall: moderate size, and it both delivers a citizen feature and removes risk R1 (map search sending typed text to a third party).
- Bolt 8 scores lowest of the real features: nothing blocks launch on it, and the retention period is 24 months after closing a report (FR17.1), so the purge is not urgent on day one.
- Bolts 12 and 13 deliver no new behaviour; they only change how the screens are served.

## Where the order departs from the scores

1. **Dependencies move Bolt 9 later than its score suggests.** Bolt 9 (U4) depends on U3 (Bolt 8) and U2 (Bolt 7) in `unit-of-work-dependency.md`, so it cannot start until Bolt 8 is done, even though Bolt 8 has the lowest score of the real features. Bolt 8 is therefore pulled earlier than its score alone would place it. This follows the dependency order as the guide requires; it does not change any Bolt's score.
2. **Safety first overrides raw score in wave 1.** Bolts 6 and 7 (scores 4.4 and 4.6) start before Bolt 9 (6.7) because your mix puts safety and launch blockers first [Q2-D]. This is the one place your chosen rule and your chosen score point in different directions.
3. **If you want the map-search fix earlier**, the search-through-our-backend item (risk R1) can be split out of Bolt 9 into a small Bolt in wave 1 or 2, because it needs no magic-link work. It stays inside Bolt 9 for now to keep one unit per Bolt [Q4-A]. Say if you want it split out.

## Walking skeleton argument

The thin slice already built is the walking skeleton: it submits a report with a photo and a location, shows a Tracking ID, lets staff sign in with a second factor, and acknowledges the report. It is recorded as Bolts 1 to 5. The skeleton ceremony (a separate checkpoint approval) is off for the classic plan, so nothing further is needed. What the slice has not yet proved is the move to real hosting (Bolt 6), real email and photo scanning (Bolt 7), which is why they lead.

## Main risks to the sequence

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Moving from SQLite and a single process to PostgreSQL, a queue and a shared rate-limit store forces changes to code already built | Medium | High | Bolt 6 runs first and checks the existing tests against PostgreSQL |
| The email, malware or map provider is not chosen in time | High | High | Choose providers before wave 1 ends; see `external-dependency-map.md` |
| The README-based list of what is built is wrong or out of date | Medium | Medium | Bolt 8 starts by checking FR6, FR8, FR14 and FR15 against the code |
| Two Bolts in one wave edit shared files | Low | Medium | Waves group Bolts on different units; shared backend modules are changed in order |
| A pilot launches before risks R1 to R3 are closed or re-accepted | Medium | High | Bolt 9 and Bolt 11 close R1 and R2; R3 needs a decision (OQ-A2) |

## Sources

- [Q2], [Q3], [Q4], [Q5], [Q7] in `delivery-planning-questions.md`.
- `unit-of-work-dependency.md` (edges and parallel options).
- `unit-of-work.md` (complexity of each unit).
- `requirements.md` (FR17.1 retention period; open questions OQ-A2, OQ-A7).
- `README.md` (accepted risks R1 to R4, known gaps).
- Heuristic references: Reinertsen (WSJF, CD3), Boehm (risk-first), Cockburn (walking skeleton), as named in the delivery agent's guide.

## Assumptions & Open Questions

- [assumption] All value, time criticality, risk reduction and size scores are the delivery agent's proposals.
- Open question: should the search-through-our-backend item (R1) be split out of Bolt 9 and built in wave 1 or 2?
