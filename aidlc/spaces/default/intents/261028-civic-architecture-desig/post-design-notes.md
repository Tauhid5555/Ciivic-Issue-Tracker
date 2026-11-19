# Notes after the design closed

The design workflow for this intent is complete (8 of 8 stages done or skipped). This file records what happened after, so the design record matches the code.

## Stages skipped by decision

NFR Requirements was finished for U1 only. NFR Design and Infrastructure Design were skipped, and the remaining per-unit design stages were not run, because the work had to finish within an hour. The design held in this record stops at Units, Contracts, and the U1 security and tech-stack decisions.

## What was built (thin slice, directly in the repo)

- Backend (FastAPI, SQLite locally) and frontend (React, TypeScript). See `README.md` for what is in the slice and the known gaps.
- Photo metadata stripping (decode and re-save, GPS and camera data removed).
- Contract changes CC-1 to CC-5 are now written into `inception/contract-design/contract-summary.md`. They were agreed in practice by building them, not by reopening Contract Design.

## Changes after the design

- Citizen screens got a looping phone animation beside the report form, a progress tracker on the report page, and a wider colour palette. These were not in the requirements; they are presentation only. The colours are in `wds-output/D-Design-System/02-tokens.md` section 1.2b.
- Later UI work (Nov 2026): category tiles, photo drop area, a map with place search, a footer, a "what happens next" strip, a logo, a new typeface (self-hosted), Dhaka-time dates and category labels, and staff screen polish. The design documents in `wds-output/D-Design-System/` record each one and where it differs from the design (`03-components.md` section 18; `_progress/00-design-log.md`).
- The design uses the product name *ReportIt* with a `[Your City]` placeholder; the built slice uses the working title *Civic Issue Tracker* and names Dhaka. This is not decided; it is recorded as a difference.

## Accepted risks for the pilot (decided by the person, Nov 2026)

The full table is in `README.md` under "Accepted risks for the pilot". In short:

- **Map and search privacy (R1):** the location map and the street search use OpenStreetMap's public services. Each map view sends the visitor's IP address and viewed area, and each search sends the typed text, to OpenStreetMap. The person decided to ignore this for the pilot and asked for it to be documented. It conflicts with the intent of NFR7 (privacy of location) and must be fixed or formally accepted again before launch.
- **Public-service terms (R2):** the free tile and search services forbid heavy production use.
- **Exact public pin (R3):** already open as OQ-A2 in the requirements.
- **Area limit (R4):** closed. The backend refuses positions outside the Dhaka box, with tests.

## Not built

Magic-link history (FR4), retention purge (FR17), staff invitation screen, category and zone administration, a malware scanner, real email sending, two separate screen apps, and AWS infrastructure (unit U7).
