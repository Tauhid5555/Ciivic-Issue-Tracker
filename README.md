# Civic Issue Tracker — thin slice

A citizen reports a problem with a photo and a location, and gets a Tracking ID. Staff sign in with a password and a second factor, see the report in a queue, and acknowledge it. The citizen's tracking page then shows the new status.

Built from the design in `aidlc/spaces/default/intents/261028-civic-architecture-desig/` (requirements, components, units, `contract-summary.md`). Backend: Python 3.12 with FastAPI. Screens: React with TypeScript.

## Run it

Backend (one terminal):

    cd backend
    python -m venv .venv
    .venv\Scripts\python -m pip install -r requirements.txt
    .venv\Scripts\python seed.py you@example.org "Your Name" "a-long-password"
    .venv\Scripts\python -m uvicorn app.main:app --port 8000

`seed.py` prints a second-factor secret once. Add it to an authenticator app (manual entry, time-based). For quick local testing, `python seed.py --code <secret>` prints the current code.

Screens (another terminal):

    cd frontend
    npm install
    npm run dev

Open http://localhost:5173. Citizens use `/`; staff use `/staff`.

## Test

    cd backend && .venv\Scripts\python -m pytest -q       # 42 tests
    cd frontend && npm run build                          # typecheck and build

## What is in this slice

Requirements FR1 to FR3 (submit, Tracking ID, public tracking), FR7 and FR9 (queue, acknowledge), FR10 to FR13 (priority, status rules, resolution note, dispute), FR16 (staff accounts with a second factor), and the privacy and abuse rules in NFR6, NFR7, NFR15 and NFR16.

## Look and feel (citizen screens)

- **Landing showcase:** a looping phone animation beside the report form (photo, map pin, Tracking ID, progress to resolved), built with the `motion` library in `frontend/src/HeroShowcase.tsx`. On small screens it shrinks above the form. It is hidden from screen readers, pauses when the tab is hidden, and shows one still frame when the device asks for reduced motion.
- **Progress tracker:** the report page shows four steps (Submitted, Acknowledged, In Progress, Resolved) that fill in when the page opens. Closed-Duplicate reports show only the status badge.
- **Other motion:** page entrance, loading placeholders, and a drawn check mark on the confirmation page.
- **Colour:** green stays the brand colour; accent colours (teal, sky, sun, coral, violet) and gradients are in `frontend/src/tokens.css` and documented in `wds-output/D-Design-System/02-tokens.md` section 1.2b. Status colours keep their meaning and are unchanged.
- The animation is decorative. The illustrations are simple drawings in code, not final artwork. The page's JavaScript grew by about 135 kB because of `motion`; lazy loading it would cut that.

## Photo privacy

Every uploaded photo is decoded and saved again, so nothing from its embedded metadata survives: no GPS position, camera details, timestamps, thumbnails, XMP or IPTC. The rotation a phone records in the metadata is applied to the picture first. HEIC photos are stored as JPEG. Files over 50 million pixels are refused. Only the cleaned copy is stored; the original upload is never written to disk.

## Known gaps (not yet built or not yet production-grade)

- **Location pin:** latitude and longitude are typed or taken from the browser. There is no draggable map pin yet (FR1.3).
- **Malware scan:** the scan is a hook that accepts everything (NFR15). Photos are decoded and re-saved, which rejects files that are not real pictures, but that is not a malware scan. Do not use with real citizen photos until a scanner is connected.
- **Magic-link history (FR4):** not built. Citizens use the Tracking ID only.
- **Email:** notifications are queued in the same transaction as the change and marked sent, but nothing is actually emailed; the address is never logged.
- **Retention purge (FR17) and category/zone administration:** not built.
- **Staff invitations:** accounts are created with `seed.py`; there is no invitation screen.
- **Rate limits and sessions:** held in the process and the database. A second backend instance needs a shared counter store.
- **Database:** SQLite locally. PostgreSQL on Amazon RDS is the design target; set `DATABASE_URL` to use it.
- **One screens app:** the Citizen Portal and the Authority Dashboard are two sections of one app here. The design calls for two separate apps.
- **Contract changes:** CC-1 to CC-5 from the contract review are now written into `contract-summary.md`. CC-2, CC-3 and CC-4 are built; CC-5 is a schema rule; CC-1 (magic-link token in a body) is specified but FR4 is not built.
- **Infrastructure:** no AWS definitions yet (unit U7).
