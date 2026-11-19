# Requirements Analysis — Clarifying Questions

Source documents: PRD (`prd.md`), brief (`brief.md`), BRD (`brd.md`). The PRD marks hosting model and authority login as "must be resolved before architecture"; both are still open, so they come first.

## Question 1 — Who runs the platform? (PRD OQ-1, BRD OQ-1)

This decides whether the design is single-customer or built with seams for several authorities. The PRD lists multi-tenancy as a v1 non-goal.

A. One municipality pilot, hosted for that authority (single customer)
B. Municipal SaaS: single customer in v1, but design clean seams so more authorities can be added later
C. Open-source, each authority self-hosts its own copy
D. Not decided yet: design for one customer with seams, and record this as an assumption to confirm
X. Other (please specify)

[Answer]: A

## Question 2 — How do authority staff sign in? (PRD OQ-2, NFR-8)

This decides the login design for the Authority Dashboard.

A. Invited accounts with email, password and a second factor, managed by us
B. Single sign-on with the city's own identity system
C. Both: invited accounts now, city single sign-on added later
D. Not decided yet: design login so either can be plugged in, and record it as an assumption
X. Other (please specify)

[Answer]: A

## Question 3 — Which country's data rules apply, and where must data live?

The documents handle citizen emails, photos and exact locations but name no law, country or data-residency rule. This decides the AWS Region and the privacy controls.

A. EU or UK (GDPR), data must stay in the EU or UK
B. United States (state privacy and public-records rules)
C. South Asia (national data-protection law, data may need to stay in-country)
D. Not known yet: design to a GDPR-grade baseline and keep the AWS Region configurable
X. Other (please specify)

[Answer]: D

## Question 4 — How many reports and staff should v1 handle? (PRD NFR-2, R-2)

The PRD only says the queue must stay fast at 1,000 reports in the system. Daily volume and storm-time spikes are not stated.

A. Small pilot: under 100 new reports a day, up to 20 staff
B. Medium: 100 to 1,000 new reports a day, 20 to 100 staff
C. Large: over 1,000 new reports a day, or several cities
D. Not known: design for the medium case with a clear path to scale up
X. Other (please specify)

[Answer]: A

## Question 5 — How available must the platform be, and how much data loss is acceptable?

No uptime or recovery target exists in the documents. It shapes cost and AWS design (single versus multiple zones, backups).

A. Best effort during business hours; losing up to a day of data is acceptable
B. 99.9% a month; lose at most 15 minutes of data; back up within 4 hours of an outage
C. 99.95% or higher with failover across Regions
D. Not decided: use the 99.9% target as a working assumption
X. Other (please specify)

[Answer]: A

## Question 6 — What accessibility standard must both web surfaces meet?

The BRD (NFR-06) only requires working on desktop and mobile browsers. Public-sector sites are often legally required to meet a standard.

A. WCAG 2.2 level AA on the Citizen Portal and the Authority Dashboard
B. WCAG 2.1 level AA on both
C. Level AA on the Citizen Portal only; best effort on the dashboard
D. A specific legal standard applies (describe it)
X. Other (please specify)

[Answer]: A

## Question 7 — Is an email address required to report? (PRD OQ-3, NFR-6, FR-2)

The PRD says submission is anonymous by default, yet FR-2 promises an acknowledgement email and FR-4 needs an email for the personal history view. Without an email there is no notification at all.

A. Email is required on every report
B. Email is optional; reports without one get no notifications and are tracked only by Tracking ID
C. Email is optional for noise reports only; required for every other category
D. Email is optional for all categories, and the on-screen confirmation warns that notifications need an email
X. Other (please specify)

[Answer]: B

## Question 8 — How precise are locations and photos in public, and how long do we keep them? (PRD OQ-4, BRD NFR-09)

The public Tracking Page (FR-3) is open to anyone with a Tracking ID and shows the description, photo and location. The PRD defaults to zone-level precision until you decide.

A. Public sees neighbourhood zone only; staff see the exact pin; photos shown to staff only until resolved. Keep photos and locations 12 months after the report closes, then remove them
B. Public sees neighbourhood zone only; staff see the exact pin; photo is public. Keep 24 months after closing
C. Public sees the exact pin and the photo. Keep indefinitely
D. Not decided: use option A as a working assumption
X. Other (please specify)

[Answer]: C

## Question 9 — Is a public map of open issues part of v1? (PRD OQ-6)

The earlier brief had a public map and later drafts removed it. A public map changes privacy and read-load design.

A. Out of v1
B. In v1: public read-only map showing zone-level pins
C. Not decided: treat as out of v1 and record it as an assumption
X. Other (please specify)

[Answer]: A

## Follow-up F1 — Public location and photo versus the privacy baseline

Your Question 8 answer (public exact pin and photo, kept indefinitely) conflicts with the PRD's zone-only default for public pages (NFR-7, risk R-4) and with the GDPR-grade baseline from Question 3.

A. Public sees zone only; staff see exact pin and photo; delete photos and locations 12 months after close
B. Exact pin stays public, photo is shown to staff only; keep 24 months after close
C. Keep public exact pin and photo, but delete photos and locations 24 months after close
D. Keep Question 8 as answered (public exact pin and photo, kept indefinitely), recorded as an accepted risk
X. Other (please specify)

[Answer]: B

## Follow-up F2 — Best-effort availability versus reliability targets

Your Question 5 answer (best effort, up to a day of data loss) sits awkwardly with the 99% acknowledgement email within 60 seconds (NFR-3), the 24-hour promise and the audit trail (NFR-5).

A. Keep best effort: email and notification targets apply only while the platform is up; daily backups; no uptime commitment
B. Raise to 99.9% a month, lose at most 15 minutes of data, restore within 4 hours
C. Best-effort uptime but continuous backups so at most 15 minutes of data is lost
X. Other (please specify)

[Answer]: A

## Consolidated Summary Confirmation

- Platform is run for one municipality pilot (single customer, no multi-tenancy in v1)
- Authority staff sign in with invited accounts (email, password and a second factor, managed by us)
- Data-protection country is not known: design to a GDPR-grade baseline and keep the AWS Region configurable
- Small pilot scale: under 100 new reports a day, up to 20 staff
- Best-effort availability with daily backups; email and notification targets apply while the platform is up
- WCAG 2.2 level AA on the Citizen Portal and the Authority Dashboard
- Email is optional on every report; reports without one get no notifications and are tracked by Tracking ID only
- The exact pin is public; the photo is shown to staff only; photos and locations are kept 24 months after a report closes
- Public map of open issues is out of v1

Does this all look correct before I generate the requirements artifact?

- Looks correct
- Request changes

[Answer]: Looks correct
