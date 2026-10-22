---
title: Business Requirements Document (BRD) — Local Civic Issue Reporter & Tracker
status: draft
created: 2026-08-30
updated: 2026-08-30
project: Civic-Issue-Tracker
based_on:
  - _bmad-output/planning-artifacts/briefs/brief-Civic-Issue-Tracker-2026-08-30/brief.md
  - _bmad-output/brainstorming/brain-civic-issue-tracker-2026-08-30/.memlog.md
  - idea.txt
---

# Business Requirements Document
## Local Civic Issue Reporter & Tracker

---

## 1. Document Control

| Field | Value |
|---|---|
| Project | Civic-Issue-Tracker |
| Document type | Business Requirements Document (BRD) |
| Author | Tech Writer (BMad) |
| Status | Draft |
| Based on | Product Brief v0.4, Brainstorm Session 2026-08-30, idea.txt |
| Audience | Product team, architects, QA, pilot authority partner |
| Version | 0.1 |

---

## 2. Executive Summary

The Local Civic Issue Reporter & Tracker is a web-based, two-sided civic engagement platform that lets residents report neighborhood problems (potholes, broken streetlights, garbage, drainage, noise) and lets authority staff manage those reports through to resolution. The product closes the loop between citizen and city in a way today's helpline-and-spreadsheet workflow does not.

**v1 is authority-led, citizen-supported.** All product value depends on authority staff actively using the dashboard; therefore the Authority Dashboard is the v1 priority, and the Citizen Portal is built to be simple enough that submission and tracking require no friction.

**v1 is platform-only in scope.** The dashboard handles reports submitted through the platform. Helpline, WhatsApp, in-person, and other channels continue to use existing processes. Inbox unification is a v2 objective.

**v1 success = the 24-hour promise.** Within 24 hours of a citizen submitting a report, they must feel *"received, being looked at, will not be forgotten"* — operationalized as instant acknowledgement, status move to **Acknowledged**, and proactive notification when status later changes.

---

## 3. Business Objectives

| # | Objective | Why it matters |
|---|---|---|
| BO-1 | Replace basic complaint tracking currently done in spreadsheets and scattered messages | Authority pain is concrete and daily; replacing this is the wedge that earns staff trust |
| BO-2 | Give citizens a low-friction way to submit issues and see what happens next | Without visibility, residents disengage from civic reporting |
| BO-3 | Make the platform work for authority staff first — fast triage, filter/sort/status, no parallel spreadsheet | Authority adoption is the bottleneck; if staff use it, citizens get value |
| BO-4 | Establish a baseline for measuring authority responsiveness (Acknowledged-within-24h, Resolved-within-7d for top categories) | Measurement is what makes "track your complaint" real |
| BO-5 | Preserve advanced reporting, audit, and historical work in spreadsheets for v1 | Avoids overpromising and keeps spreadsheets from being a blocker to adoption |

---

## 4. Scope

### 4.1 In Scope (v1)

- Two web interfaces only — **Citizen Portal** and **Authority Dashboard**.
- Citizen submission flow: category, description, photo, geolocation.
- Unique tracking ID and a per-report public status page with status history.
- Citizen personal history view (list of own reports and their statuses).
- Authority Dashboard: triage queue, filters by category / location / date, priority field, status updates, resolution notes.
- Status workflow: **Submitted → Acknowledged → In Progress → Resolved** (plus **Closed-Duplicate** as terminal).
- Proactive notifications to citizens on status transitions.
- Issue categories (from `idea.txt`): streetlights, potholes, garbage, drainage, noise.

### 4.2 Out of Scope (v1)

- Native mobile apps (web only).
- Real-time integration with municipal / government back-office systems.
- Helpline, WhatsApp, or in-person channel ingestion into the dashboard.
- Payments, fines, ticketing, or enforcement workflows.
- Cross-municipality federation or multi-tenancy.
- Predictive analytics, AI categorization, or AI-generated summaries.
- Multi-language UI beyond English.
- Replacing the existing helpline — the platform runs alongside it.
- Advanced reporting, audit trails, and historical analysis (continue in spreadsheets).

---

## 5. Stakeholders

The product has **two primary user groups**. All other parties (department leads, field crews, pilot partners, internal product / architecture teams) are out of scope as stakeholders in v1 and v2.

| Stakeholder | Role | Interest |
|---|---|---|
| Citizens / Residents | Primary user | Submit issues, see status, feel heard |
| Municipal Authorities | Primary user | Triage, update, and resolve reports received from citizens |

---

## 6. Functional Requirements

Each requirement is given a stable ID (BR-xxx) for traceability. All FRs derive from the Product Brief and brainstorm decisions unless otherwise marked.

### 6.1 Citizen Portal

| ID | Requirement | Source |
|---|---|---|
| BR-001 | The portal shall allow a citizen to submit a report with category, description, photo, and geolocation. | Brief — Key Features |
| BR-002 | The portal shall be reachable as a responsive web page from any modern browser. | Brief — web-only v1 |
| BR-003 | On submission, the system shall display an instant on-screen confirmation including a unique tracking ID the citizen can save or bookmark. | Brainstorm — 24h promise ("received") |
| BR-004 | The portal shall provide a per-report status page accessible by tracking ID, showing current status and full status history. | Brief — Key Features |
| BR-005 | The portal shall provide a personal history view listing reports the citizen has submitted. | Brief — Key Features |
| BR-006 | The portal shall notify the citizen proactively (e.g. email) when a report's status changes after submission. | Brainstorm — 24h promise ("will not be forgotten") |

### 6.2 Authority Dashboard

| ID | Requirement | Source |
|---|---|---|
| BR-101 | The dashboard shall present a triage queue of all reports submitted through the platform, sorted by configurable criteria. | Brief — Admin Dashboard |
| BR-102 | The dashboard shall allow filtering the queue by category, location, and date. | Brief — Admin Dashboard |
| BR-103 | The dashboard shall allow staff to set a priority on each report. | Brief — Admin Dashboard |
| BR-104 | The dashboard shall allow staff to update a report's status through the canonical workflow: Submitted → Acknowledged → In Progress → Resolved (plus Closed-Duplicate). | Brief — status updates |
| BR-105 | The dashboard shall allow staff to attach resolution notes to a report at the point of status change. | Brief — resolution notes |
| BR-106 | A status move to **Acknowledged** shall be completable in no more than two dashboard actions from the queue view. | Brainstorm — authority walk-away ("if updating takes too much time") |
| BR-107 | The dashboard shall require no parallel spreadsheet for tracking platform-submitted reports in v1; basic complaint tracking shall live in the dashboard only. | Brainstorm — user direction |

### 6.3 Notifications

| ID | Requirement | Source |
|---|---|---|
| BR-201 | The system shall send an automatic acknowledgement email (or equivalent channel) to the citizen immediately on submission. | Brainstorm — 24h promise ("received") |
| BR-202 | The system shall send a notification to the citizen each time their report's status changes after submission. | Brainstorm — 24h promise ("will not be forgotten") |

### 6.4 Categories (v1)

| ID | Requirement | Source |
|---|---|---|
| BR-301 | The system shall support the following issue categories: streetlights, potholes, garbage, drainage, noise. | idea.txt |

---

## 7. Non-Functional Requirements

| ID | Area | Requirement | Source |
|---|---|---|---|
| NFR-01 | Performance | Report submission (form open → confirmation) shall complete in ≤ 90 seconds median. | Brief — Success Criteria |
| NFR-02 | Performance | Status acknowledgement shall appear to the citizen within 24 hours of submission in ≥ 80% of cases. | Brief — Success Criteria (1 business day) + Brainstorm (24h promise) |
| NFR-03 | Performance | Median time from Submitted → Resolved shall be ≤ 7 days for the top-3 categories. | Brief — Success Criteria |
| NFR-04 | Usability | A returning reporter shall be able to submit a new report in ≤ 60 seconds median. | Brief — Success Criteria |
| NFR-05 | Usability | The dashboard shall be operable by helpdesk staff without a manual beyond an onboarding session. | Brainstorm — authority walk-away |
| NFR-06 | Accessibility | The portal and dashboard shall be usable on a modern desktop browser and a modern mobile browser at typical responsive breakpoints. | Brief — web-only v1 |
| NFR-07 | Security | The portal shall not require citizen account creation for v1 submission (anonymous-by-default option to be evaluated per category; see Open Question OQ-3). | Brief — implicit |
| NFR-08 | Auditability | Every status change on a report shall be recorded with timestamp and acting staff identity (or system actor). | Brief — audit trail |
| NFR-09 | Data retention | Photo and geo-data retention policy shall be defined (see Open Question OQ-4). | Brief — privacy |

---

## 8. Business Rules

| ID | Rule |
|---|---|
| BR-901 | Each report moves through the canonical workflow Submitted → Acknowledged → In Progress → Resolved. Backwards moves (e.g. In Progress → Acknowledged) are permitted only by explicit staff action and shall be audit-logged. |
| BR-902 | A report cannot transition to **Resolved** without a resolution note. |
| BR-903 | The dashboard's queue contains only reports submitted through the platform; helpline / WhatsApp / in-person channels remain on existing processes in v1. |
| BR-904 | Spreadsheets remain the system of record for advanced reports, audit, and historical work in v1. |
| BR-905 | Volume scaling in v1 is solved by dashboard filters / sort / status management; not by duplicate detection, auto-routing, or AI triage. |

---

## 9. Success Criteria (v1)

These are the measurable signals that v1 is working. Targets are placeholders to validate with a pilot authority partner.

### 9.1 Resident-side

| Metric | Target |
|---|---|
| Report-to-submit time (median) | ≤ 90 seconds |
| Repeat reporter report-to-submit time (median) | ≤ 60 seconds |
| Reporters who return to check status at least once | ≥ 40% |
| Resolved reports that receive resident confirmation or dispute action | ≥ 25% |

### 9.2 Authority-side

| Metric | Target |
|---|---|
| Median Submitted → Acknowledged | ≤ 1 business day |
| Median Submitted → Resolved (top-3 categories) | ≤ 7 days |
| Reports reaching terminal status within 30 days | ≥ 80% |
| Proactive notification delivery rate (status change → citizen sees it) | ≥ 95% |

### 9.3 Adoption target (not a hard v1 criterion)

At least one municipal partner running the platform within 6 months of launch — to be re-evaluated against chosen go-to-market.

---

## 10. Constraints & Assumptions

### 10.1 Constraints

- **Web only** in v1. No native mobile apps.
- **Platform-submitted complaints only** in v1. Other channels keep existing processes.
- **No AI** in v1. No auto-categorization, no summary generation, no predictive analytics.
- **English only** in v1.
- **Spreadsheets stay** for advanced reports, audit, and historical work.

### 10.2 Assumptions

- A pilot municipal partner will be available before launch to validate targets and workflows.
- Volume scaling can be handled by basic filter / sort / status management.
- Proactive notifications will use email as the primary channel for v1; SMS is a candidate for v2 (see Open Questions).
- Authority staff have basic web-browser proficiency and access to a modern desktop or laptop at work.

---

## 11. Risks

| ID | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R-1 | Authority staff don't adopt the dashboard, so citizen value never materializes. | High | High | Authority UX is v1 priority; pilot with a willing partner before scaling; minimize time-per-action (BR-106). |
| R-2 | Volume spikes (e.g. post-storm) overwhelm the queue and staff revert to spreadsheets. | Medium | Medium | Basic filter / sort / status is in scope; SLA on Acknowledged (NFR-02) keeps queue movement visible. |
| R-3 | Citizens lose trust when "Submitted" never moves; engagement collapses. | High | High | 24-hour Acknowledgement SLA (NFR-02); proactive notifications (BR-202) signal momentum. |
| R-4 | Photo and geo-data expose residents or sensitive locations. | Medium | High | Geo-precision policy (OQ-4); retention policy (NFR-09); per-category anonymity review (OQ-3). |
| R-5 | Sustainability of the platform after pilot ends (funding, ownership). | Medium | High | Resolve governance / business model before launch (OQ-1). |

---

## 12. Open Questions (Carry Forward from Brief)

These were surfaced in the Product Brief and are not resolved by this BRD. They are recorded here so they don't get lost between artifacts.

| ID | Question | Why it matters now |
|---|---|---|
| OQ-1 | Hosting / governance model — civic-tech nonprofit, municipal SaaS, community open-source, or commercial venture? | Determines licensing, data ownership, pricing. |
| OQ-2 | Authority onboarding reality — SSO with city credentials vs invited admins? | Shapes authentication and access model. |
| OQ-3 | Anonymity vs accountability per category — noise complaints may need anonymity, infrastructure reports benefit from accountability. | Affects submission flow and NFR-07. |
| OQ-4 | Privacy of geo-data — what is the public-map precision policy and retention policy for photos and locations? | Drives NFR-09 and map display design. |
| OQ-5 | Notification channels for v1 — email-only or also SMS / in-app? | Drives NFR coverage and integration scope. |
| OQ-6 | Is a public, read-only map of open issues in or out of v1? | Was in the brief originally, removed in later drafts; needs a clean decision. |

---

## 13. Acceptance Criteria (v1)

v1 is accepted when **all** of the following are true, validated against a real pilot:

1. A citizen can submit a report through the portal and receive a tracking ID and instant confirmation.
2. An authority staff member can move the report to **Acknowledged** within 24 hours of submission in ≥ 80% of cases.
3. The citizen receives a proactive notification when the report's status changes.
4. The dashboard supports filtering by category, location, and date, and supports priority / status update / resolution notes.
5. No parallel spreadsheet is required to track platform-submitted reports in v1.
6. Spreadsheets remain the system of record for advanced reports and historical work.
7. The dashboard handles the issue categories: streetlights, potholes, garbage, drainage, noise.
8. Targets in Section 9 are measured and reported back after pilot.

---

## 14. Traceability Matrix

| Brief / Brainstorm item | BRD coverage |
|---|---|
| Brief — Key Features: Citizen Portal (submit, photo/desc/location, view status/history) | BR-001, BR-002, BR-004, BR-005 |
| Brief — Key Features: Admin Dashboard (review, filter by category/location/date, priority, status, resolution notes) | BR-101, BR-102, BR-103, BR-104, BR-105 |
| Brief — Main Workflow (Report → Authority Review → Status Updates → Resolution) | BR-001 → BR-104 → BR-202 → BR-105 |
| Brief — Categories (streetlights, potholes, garbage, drainage, noise) | BR-301 |
| Brief — Success Criteria (resident & authority metrics) | Section 9 |
| Brief — Out of scope items | Section 4.2 |
| Brainstorm — Authority UX leads v1 | BR-106, BR-107, R-1 mitigation |
| Brainstorm — Platform-only in v1 | BR-107, BR-903 |
| Brainstorm — Spreadsheets stay for advanced work | BR-904 |
| Brainstorm — 24h promise ("received, being looked at, will not be forgotten") | BR-201, NFR-02, BR-202 |
| Brainstorm — Volume scaling via basic filter/sort/status | BR-101, BR-102, BR-104, BR-903, R-2 mitigation |
| Brainstorm — Walk-away risks (slow, parallel spreadsheets) | BR-106, BR-107 |
| idea.txt — issue categories | BR-301 |

---

## 15. Glossary

| Term | Meaning |
|---|---|
| Citizen Portal | The public-facing web interface for residents to submit and track reports. |
| Authority Dashboard | The internal web interface for municipal staff to triage and resolve reports. |
| Report | A single citizen-submitted issue record, with status, history, photo, and geo. |
| Status | One of: Submitted, Acknowledged, In Progress, Resolved, Closed-Duplicate. |
| Tracking ID | A unique identifier issued on submission; lets a citizen revisit their report. |
| 24-hour promise | The user's framing: within 24h of submission, the citizen feels received, looked at, and not forgotten. |
| v1 / MVP | The initial release: web-only, platform-submitted complaints only, two interfaces. |

---

## 16. Approval

| Role | Name | Decision | Date |
|---|---|---|---|
| Product Owner | (Tauhid) | _pending_ | — |