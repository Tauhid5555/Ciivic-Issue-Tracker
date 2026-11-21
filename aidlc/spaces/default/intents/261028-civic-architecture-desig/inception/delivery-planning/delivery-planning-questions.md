# Delivery Planning Questions — Civic Issue Tracker

This plan covers work that is partly done. A **Bolt** is one build pass over a piece of the work that ends in something that runs. The thin slice already in `backend/` and `frontend/` (commits 860ccc2 to 9afa125) covers most of U2, U3 and U4 and a combined version of U5 and U6, so the plan records that as finished Bolts and sequences only what is left.

What the repo holds today, by unit (from `README.md`):

- U1 contracts: written in `contract-summary.md`; CC-1 to CC-5 folded in; no separate spec files yet.
- U2 platform services: staff accounts with a second factor, photo checks and metadata stripping built. The malware scan accepts everything and no email is actually sent.
- U3 case workflow: queue, acknowledge, priority, status rules, resolution note, dispute built. Retention purge (FR17), category and zone administration not built.
- U4 public backend: submit, Tracking ID, tracking view, dispute built. Magic-link history (FR4) not built.
- U5 and U6: built as two sections of one app; the design calls for two separate apps. Staff invitation screen and personal history screen not built.
- U7 infrastructure: nothing built (no AWS definitions).

## Strategic questions

### Q1. How should the already-built slice appear in the plan?

The slice was built directly from the design, not through planned Bolts. Showing it honestly keeps the plan traceable.

- A. One retroactive Bolt, "Bolt 1: thin slice", marked as the walking skeleton and as done, listing which requirements it covers and which parts of U2 to U6 it only partly delivers
- B. One retroactive Bolt per unit (U2, U3, U4, U5/U6), each marked done or partly done
- C. Do not list built work as Bolts; list only what is left, with a short "already built" table at the top
- X. Other (please specify)

[Answer]: B

### Q2. What should we build next: the order for the remaining work?

The remaining work is: magic-link history (FR4), real email sending (FR2.3, FR5), a real malware scan (NFR15), retention purge (FR17), staff invitations and category/zone administration (FR16, FR15.2), splitting the screens into two apps, and AWS infrastructure (U7). The README lists two accepted pilot risks (map privacy R1, public map service terms R2) that must be fixed before launch.

- A. Risk-first: close the launch blockers first (malware scan, real email, map provider, infrastructure), then the missing features
- B. Value-first: finish the citizen features first (magic-link history, email), then staff administration, then infrastructure last
- C. Pilot-first: do the smallest set that lets a real pilot run safely (infrastructure, email, malware scan, staff invitations), and leave retention purge, magic-link history and the app split for after the pilot
- D. A mix (say which approach applies to which items)
- X. Other (please specify)

[Answer]: D. Follow-up: risk-first for safety and launch blockers (malware scan, real email, infrastructure), value-first for features (magic-link history, then staff administration and retention purge), app split last.

### Q3. Should we rank the Bolts with a formal score?

WSJF (Weighted Shortest Job First) scores each Bolt as (user-business value + time criticality + risk reduction) divided by job size, and ships the highest score first. It adds a table to the rationale file.

- A. Yes, use WSJF with equal weight on value, time criticality and risk reduction
- B. Yes, use WSJF but weight risk reduction double, because of the launch blockers
- C. No formal score; give a plain written argument for the order
- X. Other (please specify)

[Answer]: A

### Q4. How big should one remaining Bolt be?

- A. One unit of work per Bolt (the units are already medium-sized)
- B. Several related units bundled together where they ship one result (for example email plus malware scan plus object storage as one "launch safety" Bolt)
- C. Thin slices that cut across units, each ending in a demo someone can try (for example "a citizen can ask for a magic link and see their history", across U4 and U5)
- X. Other (please specify)

[Answer]: A

### Q5. Can several Bolts be built at the same time?

All Bolts are executed by the AI developer in this session (the team-formation stage was skipped), so the question is about order, not people. The dependency file shows U7 can run alongside U2 to U6 once the contracts exist.

- A. One after another, in one session
- B. Serial for application code, but infrastructure (U7) may run alongside because it touches different files
- C. As many in parallel as the dependencies allow
- X. Other (please specify)

[Answer]: C

### Q6. Is anything outside this team going to hold us up?

Candidates found in the design and README. For each one you confirm, tell us who owns it, how long it takes, and what we do if it slips.

- A. Email delivery service (needed for acknowledgement and magic links; no provider chosen yet)
- B. Malware scanning service (a hook that accepts everything today)
- C. Hosted map tiles and search provider under a data-processing agreement (risks R1 and R2)
- D. AWS account, Region choice and access (NFR14)
- E. Staff directory: who the first invited staff are, and the zone list (open question OQ-A7)
- X. Other (please specify). Several letters may apply (select all that apply)

[Answer]: A, B, C, D (owner, lead time and fallback for each to be proposed in the plan and confirmed at the gate; E, the staff directory and zone list, was not selected and stays open question OQ-A7)

### Q7. What worries you most about this build, so we tackle it early?

- A. Real citizens' data on a system with accepted pilot risks (R1, R2, R3, no malware scan)
- B. Staff not adopting the dashboard (the product's main risk, from `unit-of-work.md`)
- C. Email not arriving, so citizens never learn about status changes
- D. Moving from SQLite and one process to PostgreSQL, a queue and two app deployments
- X. Other (please specify)

[Answer]: A

### Q8. Which check proves each Bolt works, and which should count as the walking skeleton?

The skeleton stance for this work is "scope-dependent" and the classic plan is not skeleton-on, so no extra approval ceremony applies. The test commands that exist today are the backend tests (49 tests) and the frontend build.

- A. Keep both existing commands as the check for every Bolt (`cd backend && .venv\Scripts\python -m pytest -q` and `cd frontend && npm run build`), and mark Bolt 1 as the skeleton
- B. Same as A, plus add an end-to-end run that submits a report and acknowledges it as a staff user, once someone writes it
- X. Other (please specify)

[Answer]: A

## Per-Bolt questions

For each Bolt in the plan I will draft: the units it bundles, whether it is the walking skeleton, what "done" means, what shipping it teaches us, and which mob owns it (all Bolts default to the developer agent, since team-formation was skipped). You confirm or change these when you read `bolt-plan.md` at the gate; no separate answers are needed here.
