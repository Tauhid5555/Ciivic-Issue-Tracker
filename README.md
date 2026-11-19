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

    cd backend && .venv\Scripts\python -m pytest -q       # 49 tests
    cd frontend && npm run build                          # typecheck and build

## What is in this slice

Requirements FR1 to FR3 (submit, Tracking ID, public tracking), FR7 and FR9 (queue, acknowledge), FR10 to FR13 (priority, status rules, resolution note, dispute), FR16 (staff accounts with a second factor), and the privacy and abuse rules in NFR6, NFR7, NFR15 and NFR16.

## Look and feel (citizen screens)

- **Landing showcase:** a looping phone animation beside the report form (photo, map pin, Tracking ID, progress to resolved), built with the `motion` library in `frontend/src/HeroShowcase.tsx`. On small screens it shrinks above the form. It is hidden from screen readers, pauses when the tab is hidden, and shows one still frame when the device asks for reduced motion.
- **Progress tracker:** the report page shows four steps (Submitted, Acknowledged, In Progress, Resolved) that fill in when the page opens. Closed-Duplicate reports show only the status badge.
- **Place search:** a search box above the map finds streets and areas inside Dhaka (OpenStreetMap's Nominatim service, `VITE_GEOCODER_URL` to change it). Results appear as the person types: it waits 600 ms after the last keystroke, needs 3 characters, never sends requests less than 1.1 s apart, and cancels an older search when the text changes. The old results are cleared as soon as the text changes, so an earlier search is never shown for a new one. Enter and the Search button search at once; Escape clears the list. Up to five results are shown, and results outside the Dhaka area are dropped. Typed search text is sent to the search provider: see risks R1 and R2 under "Accepted risks for the pilot". Search text is never logged by us.
- **Map pin:** the report form has a map (Leaflet, `frontend/src/LocationPicker.tsx`). Tap the map or drag the pin; with the keyboard, press Enter to place the pin at the centre and use the arrow keys to move it. The latitude and longitude fields stay and stay in sync, so typing a position, or "Use my current location", still works, and the form works if the map does not load.
- **Other motion:** page entrance, loading placeholders, and a drawn check mark on the confirmation page.
- **Colour:** green stays the brand colour and carries actions; accent colours (teal, sky, sun, coral) and gradients are for status, priority and small highlights. They are in `frontend/src/tokens.css` and documented in `wds-output/D-Design-System/02-tokens.md` section 1.2b. Status colours keep their meaning and are unchanged.
- **Typeface:** Plus Jakarta Sans, with Noto Sans Bengali for Bangla text. Both are self-hosted (npm packages `@fontsource-variable/...`), so no font provider sees the visitor. The service has no Bangla text yet.
- **Report form:** categories are tappable tiles with icons (`CategoryPicker.tsx`); the photo field is a drop area with a preview (`PhotoPicker.tsx`); the location search and "Use my location" share one row.
- **Around the form:** a "What happens after you send a report" bar with three steps (it stays at the bottom of the window on wide screens, about 150px tall, and rests above the footer), a footer (which names the map provider), an empty-state drawing on the staff queue, and a logo (pin with a check mark) in the header and as the browser icon.
- **What people read:** categories show their labels, not codes. Dates are in Dhaka time (`19 Nov 2026, 10:03 PM`), the staff queue shows relative time, and tracking and staff pages have a "View on map" link (it opens OpenStreetMap: risk R1).
- **Staff screens:** a narrow centred sign-in, compact filters, coloured priority pills, row highlight, and a "Move to" list that offers only the moves the server accepts.
- Design documents were updated to match: `wds-output/D-Design-System/` (`02-tokens.md`, `03-components.md` section 18, `04-patterns.md` section 26) and `wds-output/_progress/00-design-log.md`.
- The animation is decorative. The illustrations are simple drawings in code, not final artwork. The page's JavaScript grew by about 135 kB because of `motion`; lazy loading it would cut that.

## Photo privacy

Every uploaded photo is decoded and saved again, so nothing from its embedded metadata survives: no GPS position, camera details, timestamps, thumbnails, XMP or IPTC. The rotation a phone records in the metadata is applied to the picture first. HEIC photos are stored as JPEG. Files over 50 million pixels are refused. Only the cleaned copy is stored; the original upload is never written to disk.

## Accepted risks for the pilot

These are known weaknesses the team has decided to live with for the pilot release only. Each one must be fixed or formally accepted again before real citizens' data is at stake.

| # | Risk | Why it matters | Fix before launch |
|---|------|----------------|-------------------|
| R1 | **Map and search privacy.** The map tiles and the street search are served by OpenStreetMap's public services. Every map view sends the visitor's IP address and the map area they are looking at to OpenStreetMap. Every search sends the text the person types, plus their IP address. | A citizen reporting a problem near their home reveals their approximate location and their search text to a third party outside our control. There is no agreement with that third party about what it keeps. | Use a hosted tile and search provider under a data-processing agreement (or self-host tiles), route search through our own backend so the browser's IP is not exposed, name the provider in the privacy notice, and get the privacy owner's sign-off. |
| R2 | **Public-service terms.** OpenStreetMap's tile and Nominatim policies do not allow heavy or production use, and Nominatim's policy specifically forbids search-as-you-type on the public service, which the search box does (slowed to one request per 1.1 s). They may block traffic without notice. | The map or search could stop working under load or if the service blocks us. | Move to a hosted provider with a service agreement. |
| R3 | **Exact public pin.** The tracking page shows the exact position of every report (FR3.3), and the map makes exact positions easy to place. | An exact position can identify a home or a person (requirements OQ-A2). | Decide whether to round or offset the public pin. |
| R4 | **Dhaka-only limit.** Closed: the backend now refuses a report whose position is outside the Dhaka box (`SERVICE_AREA` in `backend/app/config.py`), with error code `outside_service_area`, before any photo is stored. The box is a rough rectangle and must be kept in step with the one in the frontend. | A direct request can no longer file a report outside the service area. | None. Replace the box with the real city boundaries if they are wanted. |

R1 and R2 come from the choice to use free public map services for the pilot; R3 comes from the approved requirements. R4 was a gap in the build and is now closed.

## Known gaps (not yet built or not yet production-grade)

- **Dhaka only (screen side):** the map is limited to a box around Dhaka (`SERVICE_BOUNDS` in `frontend/src/LocationPicker.tsx`, roughly 23.62 to 23.95 N and 90.28 to 90.55 E), and the form refuses positions outside it. The backend enforces the same box (`SERVICE_AREA`).
- **Map tiles:** the location map (draggable pin, FR1.3) uses OpenStreetMap's public tiles, which is fine for development only. Before real citizens use it, set `VITE_TILE_URL` and `VITE_TILE_ATTRIBUTION` to a hosted tile provider, and mention the map provider in the privacy notice (tile requests reveal the visitor's IP address and map area). See "Accepted risks for the pilot" (R1, R2) for the privacy and terms-of-use consequences.
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
