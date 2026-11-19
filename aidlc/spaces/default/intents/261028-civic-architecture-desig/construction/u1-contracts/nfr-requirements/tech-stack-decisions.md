# Technology Stack Decisions — U1 Shared contracts (`u1-contracts`, spec)

The first table is the shared stack chosen for the whole platform; every unit's `tech-stack-decisions.md` repeats it and adds its own choices. The second table is specific to this unit. Every decision lists at least two rejected alternatives.

## Platform-wide choices [Q1]–[Q5]

| Area | Choice | Why | Alternatives rejected |
|---|---|---|---|
| Backend language and framework | Python with FastAPI, one service with internal modules | Builds on OpenAPI so the written contract and the running code can be compared; one small service matches the single-deployable decision in ADR-001 and Units Generation [Q1-A] | TypeScript with Node.js: one language across the stack, but no OpenAPI advantage. Java with Spring Boot: strong tooling, heavier than a pilot needs. Go: small and fast, but fewer people on the pilot team are likely to know it (assumption). |
| Web screens | React with TypeScript, two separate static apps | Fast pages for the 2-second tracking target; fits the prototype's screens and design tokens [Q2-A] | Plain HTML, CSS and JavaScript: fewest tools, harder to keep consistent as it grows. A server-rendered framework such as Next.js: good first-load speed, but adds a second server to run and the screens need no server-side rendering. |
| Database | PostgreSQL on Amazon RDS | Same-step status history, queue filters and sorting, the daily purge, and daily backups [Q3-A] | Amazon DynamoDB: harder for filters, sorting and same-step history. Amazon Aurora PostgreSQL: same engine with more scaling, but costs more than a pilot of under 100 reports a day needs. |
| Hosting | The backend as a container on a managed service (ECS Fargate) | One service with a steady small load; simple to run [Q4-A] | Serverless functions: cold starts could slow the tracking page. Virtual machines (EC2): full control, but patching and scaling are ours to run. |
| Recovery | Restore from backup within one working day; up to one day of data loss | Matches best-effort availability and NFR12 [Q5-A] | Within 4 hours: needs rehearsed restore steps beyond a pilot. Within 1 hour: needs standby infrastructure. |

The exact AWS services for queue, cache, object storage, malware scanning, email and identity are chosen in Infrastructure Design (stage 3.4); this stage fixes only the language, framework, database and hosting style.

## Choices specific to this unit

| Area | Choice | Why | Alternatives rejected |
|---|---|---|---|
| Which file is the source of truth for the screen-facing contract | The hand-written spec in U1 (contract first). The service's generated OpenAPI is checked against it and may not differ. | Screens and backend can be built side by side from one agreed file, which is the purpose of U1 (Q5-A) | Code first, with the generated spec as the contract: the spec follows whatever the code does, so a breaking change can slip in. Two independent specs kept by hand: they drift. |
| OpenAPI version | 3.0.3, as in `contract-summary.md`. The service is set to generate the same version; if the framework version in use cannot, U1 moves to 3.1 and `nullable` becomes a type list. | One version avoids false differences in the drift check | 3.1 straight away: matches the framework default, but needs the spec rewritten now. Swagger 2.0: obsolete. |
| Spec format for the event | AsyncAPI 2.6.0 | One standard description of the queued status-changed event | A prose description only: cannot be checked. A JSON Schema alone: describes the payload but not the channel and delivery rules. |
| Spec format for in-process interfaces | A shared-schema description kept in U1 | The backend modules are Python; a neutral schema is what both sides and the reviewers read | Python type stubs as the only source: hides the contract from the screens' builders. Protocol Buffers: stronger tooling, but heavier than modules in one process need. |
| Checks run in the build | Three separate checks: (1) a linter for the OpenAPI and AsyncAPI files, (2) the **forbidden-name check** for C1 responses (NFR7.1), (3) the **personal-data and token field-list check** (NFR14.1, NFR14.3), plus (4) a drift check of the generated spec against U1 | Each check maps to one requirement, so a failure names what broke | One combined script: hides which rule failed. Review by eye only: no protection when many people edit the specs. |

## Where the checks are owned

The four checks are build steps. No stage in this plan generates a pipeline, so their owner is decided when a build pipeline is defined (CI Pipeline, stage 3.7, which this plan skips). Until then they are requirements on whoever builds the project, and `security-requirements.md` is where they are stated.

## Sources

- `requirements.md` (NFR1, NFR7, NFR12, NFR13, NFR14) [requirements]
- `contract-summary.md` (mechanisms per contract, OpenAPI 3.0.3 blocks) [contract-summary]
- `nfr-requirements-questions.md` (Q1 to Q5) [Q1]–[Q5]
- `unit-of-work.md` (deployment model) [unit-of-work]

## Assumptions & Open Questions

- Assumption: the Go entry in the first table is rejected on a team-skills guess that no source document states. [assumption]
- Assumption: the tool for each build check is chosen when a pipeline is built, not here. [assumption]
- Open question: the project rules `## Tech Stack` section in `aidlc/spaces/default/memory/project.md` is empty. Recording these choices there is a decision for you, not for this stage.
- Open question: whether the OpenAPI version stays 3.0.3 or moves to 3.1 depends on what the chosen FastAPI version can generate.
