# NFR Requirements — Clarifying Questions (shared across all units)

Inputs: `requirements.md` (NFR1 to NFR16), `contract-summary.md` (C1 to C7). Targets for speed, email, privacy, accessibility, backup and scale are already set by NFR1 to NFR16, so they are not asked again. These answers cover the technology choices that no earlier stage made, and they apply to every unit. Each unit still gets its own requirement documents.

## Question 1 — Which language and framework should the backend use? (contract-summary C1 to C7; NFR2, NFR3)

The backend is one service with internal modules and a JSON-over-HTTPS interface written as OpenAPI.

A. Python with FastAPI (recommended: builds on OpenAPI so the spec and the running code stay in step; good fit for one small service)
B. TypeScript with Node.js (one language for backend and screens)
C. Java with Spring Boot (heavier, strong tooling)
X. Other (please specify)

[Answer]: A

## Question 2 — How should the two web screens be built? (NFR1, NFR9, NFR11)

A. React with TypeScript, built as two separate static apps (recommended: fast pages, wide skills, fits the prototype's screens and design tokens)
B. Plain HTML, CSS and JavaScript as in the prototype (fewest tools, hardest to keep consistent as it grows)
X. Other (please specify)

[Answer]: A

## Question 3 — Which database should hold reports and history? (NFR5, NFR12, NFR14)

A. PostgreSQL on Amazon RDS (recommended: relational, supports the same-step history saving and the daily purge, daily backups included)
B. Amazon DynamoDB (serverless, but harder for queue filters, sorting and same-step history)
X. Other (please specify)

[Answer]: A

## Question 4 — How should the backend run on AWS? (NFR12, NFR13)

A. As a container on a managed service such as ECS Fargate (recommended: one service, steady small load, simple to run)
B. As serverless functions (pay per use, but the cold start can slow the 2-second tracking page)
X. Other (please specify)

[Answer]: A

## Question 5 — How fast must the service be restored after a failure? (NFR12)

Today: best-effort availability, daily backups, up to one day of data loss accepted. How long may the platform be down before it is restored from a backup?

A. Within one working day (recommended: matches best-effort availability for a pilot)
B. Within 4 hours
C. Within 1 hour
X. Other (please specify)

[Answer]: A

## Consolidated Summary Confirmation

- Backend: Python with FastAPI, one service with internal modules
- Screens: React with TypeScript, two separate static apps
- Database: PostgreSQL on Amazon RDS
- Hosting: the backend runs as a container on ECS Fargate
- Recovery: restore from backup within one working day; up to one day of data loss accepted
- All other targets come from NFR1 to NFR16 in the requirements; these answers apply to every unit

- Looks correct
- Request changes

[Answer]: Looks correct
