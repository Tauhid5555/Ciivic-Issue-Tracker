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

## Not built

Magic-link history (FR4), retention purge (FR17), staff invitation screen, category and zone administration, a malware scanner, real email sending, a draggable map pin, two separate screen apps, and AWS infrastructure (unit U7).
