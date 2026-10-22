# Business Goals & Objectives — ReportIt

> Strategic goals and measurable objectives for the Local Civic Issue Reporter & Tracker

**Document:** Trigger Map - Business Goals
**Created:** 2026-09-11 (backfilled from brief.md + prd.md)
**Status:** COMPLETE

---

## Vision

**ReportIt is a web-based, two-sided civic engagement platform that closes the loop between residents reporting neighborhood problems and municipal authorities resolving them — the accountability layer that turns invisible complaints into a visible, status-tracked pipeline from "I noticed a problem" to "It's fixed."**

The product does not replace how a municipality dispatches crews; it makes that work visible to the citizen who reported the problem. (Source: brief.md §Executive Summary)

---

## Business Objectives

### ⭐ PRIMARY GOAL: 24-Hour Acknowledgement (THE ENGINE)

- **Statement:** Within 24 hours of a citizen submitting a report, they feel "received, being looked at, will not be forgotten."
- **Metric:** SM-1 — % of reports reaching Acknowledged within 24 hours
- **Target:** ≥ 80% of reports acknowledged within 24h of submission (PRD §7, primary metric)
- **Timeline:** Pilot-then-scale; SM-1 tracked from v1 launch
- **Impact:** This drives ALL other objectives — without acknowledgment, the loop never closes and citizens disengage

**Operationalization:** "Received" = instant acknowledgement email + on-screen confirmation + tracking ID. "Being looked at" = status moves to Acknowledged by authority staff. "Will not be forgotten" = proactive notification when status later changes.

---

### 🚀 OPERATIONAL GOALS (Driven by 24h Acknowledgement)

**Objective 1: Fast Resolution**
- **Statement:** Top-3 categories resolve in ≤ 7 days median
- **Metric:** SM-2 — Median time Submitted → Resolved
- **Target:** ≤ 7 days for top-3 issue categories (PRD §7)
- **Timeline:** Measured continuously post-pilot

**Objective 2: Terminal State Coverage**
- **Statement:** ≥ 80% of reports reach a terminal status (Resolved or Closed-Duplicate) within 30 days
- **Metric:** SM-3 — % reports at terminal status ≤ 30 days
- **Target:** ≥ 80%
- **Timeline:** 30-day rolling window

**Objective 3: Citizen Feedback Loop**
- **Statement:** Citizens actively confirm or dispute resolutions
- **Metric:** SM-4 — % of resolved reports receiving confirmation/dispute action
- **Target:** ≥ 25%
- **Timeline:** Tracked from launch

---

### 🌟 TRUST GOALS (Real-World Benefits for Citizens and Authorities)

**Objective A: Citizen Return Behavior**
- **Statement:** Reporters come back to check status
- **Metric:** SM-6 — % reporters returning to view status at least once
- **Target:** ≥ 40%
- **Timeline:** Tracked from launch

**Objective B: Notification Reliability**
- **Statement:** Status-change notifications are delivered consistently
- **Metric:** SM-7 — Notification delivery rate
- **Target:** ≥ 95% within 5 minutes (PRD §7, NFR-4)
- **Timeline:** Tracked continuously

**Objective C: Authority Adoption**
- **Statement:** Authority staff actively use the dashboard rather than reverting to spreadsheets
- **Metric:** R-1 mitigation — qualitative; pilot retention; queue throughput
- **Target:** Pilot partner commits to dashboard as primary intake within 6 months
- **Timeline:** Pilot completion + 3 months

---

## The Flywheel: How Goals Connect

**THE ENGINE (Priority #1): 24-Hour Acknowledgement**
- First-time reporters (Aisha) submit, see Acknowledged within 24h, return, tell neighbors
- Repeat reporters (Marcus) become expected behavior, not effort
- Acknowledged reports get priority routing → resolved faster → more SM-2 wins

**Operational Goals (Priority #2):**
- Driven BY fast acknowledgement (reports acknowledged quickly are the ones that get resolved quickly)
- Authority dashboard efficiency (FR-9 two-click acknowledge) is the lever
- Without acknowledgment, the queue grows and staff revert to spreadsheets (R-2 risk)

**Trust Goals (Priority #3):**
- Real-world benefits FOR citizens (visible progress, return behavior) AND authorities (less spreadsheet overhead, demonstrable responsiveness)
- Trust compounds: more citizens report → more authority activity → more "fixed" stories → more trust → more reports

---

## Success Metrics Alignment

### How Trigger Map Connects to Objectives:

**⭐ PRIMARY: 24-Hour Acknowledgement → Achieves:**
- ✅ SM-1 ≥ 80% acknowledged in 24h (THE ENGINE — Carlos's morning batch makes this happen)
- ✅ FR-6 + FR-9 enforce SLA and enable it
- ✅ Authority adoption (R-1 mitigation)
- ✅ Citizen trust compounding (Aisha's "be heard" satisfied → she reports again)

**🚀 OPERATIONAL: Fast Resolution → Achieves:**
- ✅ SM-2 ≤ 7d median for top-3 categories
- ✅ SM-3 ≥ 80% terminal status within 30d
- ✅ Deepa's resolution workflow supports both
- ✅ R-2 (volume spike) mitigated by FR-7 + FR-8 sort/filter

**🌟 TRUST + ADOPTION: Real-World Benefits → Achieves:**
- ✅ SM-4 ≥ 25% citizen feedback (dispute or confirm)
- ✅ SM-6 ≥ 40% reporter return
- ✅ Marcus's passive return behavior validates the loop
- ✅ Authority staff stay because the dashboard is genuinely faster (R-1 mitigated)

---

## Counter-Metrics (Do Not Optimize)

These counter-metrics prevent gaming the primary metrics:

- **SM-C1:** Authority clicks per report handled — do not drive clicks artificially low at the cost of accuracy
- **SM-C2:** Total reports acknowledged — do not game by acknowledging without reviewing
- **SM-C3:** Total reports resolved — do not game by auto-resolving duplicates to inflate the count
- **SM-C4:** % of reports disputed — a *higher* number here is NOT a failure; it indicates the loop is working

---

## Related Documents

- **[00-trigger-map.md](00-trigger-map.md)** — Visual overview and navigation
- **[02-Target-Groups.md](02-Target-Groups.md)** — Personas + driving forces
- **[03-Feature-Impact-Analysis.md](03-Feature-Impact-Analysis.md)** — Features × forces scoring
- **[04-Aisha-the-Resident.md](04-Aisha-the-Resident.md)** — Primary persona
- **[05-Carlos-the-Operator.md](05-Carlos-the-Operator.md)** — Secondary persona
- **[06-Deepa-the-Department-Lead.md](06-Deepa-the-Department-Lead.md)** — Tertiary persona
- **[07-Marcus-the-Occasional-Checker.md](07-Marcus-the-Occasional-Checker.md)** — Quaternary persona
- **[08-Key-Insights.md](08-Key-Insights.md)** — Strategic implications

---

_Backfilled from brief.md and prd.md on 2026-09-11_
