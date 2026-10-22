# Target Groups — ReportIt

> All personas with complete driving forces, ranked by strategic priority

**Document:** Trigger Map - Target Groups
**Created:** 2026-09-11 (backfilled from brief.md + prd.md §2.3)
**Status:** COMPLETE

---

## Prioritized Personas

### 1. Aisha the Active Reporter — PRIMARY 🎯

**Priority:** PRIMARY — the trigger source
**Role in Flywheel:** Her report, acknowledged in time, creates the visible momentum that drives every other metric

**Profile:** Aisha is a neighborhood resident who walks her dog past the same dark stretch every evening. She noticed a broken streetlight and wants it fixed. Mobile browser, time-poor, low technical tolerance. No account. Submits a one-sentence description with a photo.

**Key Positive Drivers (Wants):**
- ✅ **Be heard / feel acknowledged** — Someone at the city saw her report and is doing something about it
- ✅ **See progress** — A status that moves from Submitted to Acknowledged to Resolved without her chasing
- ✅ **Low friction** — Submit a report on her phone in under 90 seconds, no account, no app install

**Key Negative Drivers (Fears):**
- ❌ **Ignored** — Reporting into a void; helpline wait time, no ticket number, no follow-up
- ❌ **Forgetfulness** — The city forgot about her report; she gives up
- ❌ **Public exposure** — Photo and location reveal her identity or her home; she self-censors

**Product Promise:** UJ-1 — she gets a tracking ID within 60 seconds, an email confirmation, and a notification the next morning that her report is being looked at.

**Full profile:** [04-Aisha-the-Resident.md](04-Aisha-the-Resident.md)

---

### 2. Carlos the Queue Operator — SECONDARY 💼

**Priority:** SECONDARY — the fulfillment engine
**Role in Flywheel:** Without Carlos acknowledging quickly, SM-1 (the primary goal) fails. Authority adoption is won or lost on his daily experience.

**Profile:** Carlos is a municipal helpdesk operator who starts each day with 30–80 new reports to triage on desktop. Authenticated into the Admin Portal. He is fast, accurate, and spreadsheet-fluent — but he has no patience for clunky tools. His morning routine IS the 24-hour promise.

**Key Positive Drivers (Wants):**
- ✅ **Speed through the queue** — Acknowledge 30+ reports in under 5 minutes total
- ✅ **Clean handoff** — A clear priority and category so the right team gets dispatched
- ✅ **Defensible decisions** — Every action is auditable; no citizen disputes or supervisor pushback

**Key Negative Drivers (Fears):**
- ❌ **Queue overwhelm** — Reports pile up faster than he can clear them; he falls back to the spreadsheet (R-2)
- ❌ **Click cost** — Every acknowledge takes 6 clicks; he cannot scale
- ❌ **Citizen blowback** — Without status updates, citizens call him directly and he becomes the complaint desk

**Product Promise:** UJ-2 — two-click acknowledge, status-conditional quick actions, bulk acknowledge bar for batch operations.

**Full profile:** [05-Carlos-the-Operator.md](05-Carlos-the-Operator.md)

---

### 3. Deepa the Department Lead — TERTIARY 🗂️

**Priority:** TERTIARY — the closer
**Role in Flywheel:** Without her resolution notes, the citizen loop never reaches "Resolved" with evidence. She is the audit trail.

**Profile:** Deepa is a senior authority user reviewing resolved cases at end of week. Spreadsheet-fluent. Treats the dashboard as a faster replacement, not a new system. She demonstrates what was done and why.

**Key Positive Drivers (Wants):**
- ✅ **Showcase resolution** — Before/after notes + photo she can refer back to
- ✅ **Audit trail** — Every status change attributed to her is her professional record
- ✅ **Filter to her week** — Quickly see what she and her team closed

**Key Negative Drivers (Fears):**
- ❌ **Disputes surface as failure** — Citizens disputing her resolutions feel like personal criticism
- ❌ **Lost work** — Re-entering resolution notes into spreadsheets after closing them in the dashboard
- ❌ **Auto-resolution gaming** — System makes it tempting to mark duplicates or auto-close, eroding the data quality she depends on (SM-C3)

**Product Promise:** UJ-3 — one-click Mark Resolved with required note and optional after-photo; reopen from disputed state with reason note.

**Full profile:** [06-Deepa-the-Department-Lead.md](06-Deepa-the-Department-Lead.md)

---

### 4. Marcus the Occasional Checker — QUATERNARY 👀

**Priority:** QUATERNARY — the passive retention signal
**Role in Flywheel:** His return behavior validates that the loop is visible and worth trusting. SM-6 return rate is the leading indicator of long-term trust.

**Profile:** Marcus submitted a pothole report three weeks ago and forgot about it. Returns via the bookmarked tracking link or the email deep link. Sees status. Exits satisfied — or dissatisfied. Does not need an account.

**Key Positive Drivers (Wants):**
- ✅ **No login** — Bookmark + tracking ID is enough
- ✅ **Clear status** — One glance tells him "fixed" or "still in progress"
- ✅ **Historical memory** — Sees his past reports when he returns (via magic link)

**Key Negative Drivers (Fears):**
- ❌ **Still broken** — Report shows "In Progress" indefinitely with no updates
- ❌ **Forgotten** — No notification when status changes
- ❌ **Bureaucratic noise** — Government form-heavy UI that buries the status

**Product Promise:** UJ-4 — public tracking page with full status history, resolution note, and after-photo (if any). No login required.

**Full profile:** [07-Marcus-the-Occasional-Checker.md](07-Marcus-the-Occasional-Checker.md)

---

## Strategic Triangle

```
Aisha the Resident (PRIMARY)
Submits civic issues quickly
      │
      │ Acknowledged + resolved by authority
      ▼
Carlos the Operator (SECONDARY)
Triages & acknowledges fast
Deepa the Lead (TERTIARY)
Closes with resolution evidence
      │
      │ Status visible to citizen
      ▼
Marcus the Checker (QUATERNARY)
Returns to see status
      │
      │ Loop closes; trust compounds
      ▼
Aisha reports again
```

**Loop mechanics:**
- Aisha's submission triggers Carlos's queue
- Carlos's two-click acknowledge delivers the 24-hour promise
- Deepa's resolution note + photo provide the closure evidence
- Marcus's return visit validates the loop and re-activates Aisha

---

## Cross-Group Patterns

### Shared Drivers (everyone wants)

- **Visibility of progress** — Aisha (active), Marcus (passive), Carlos (status history), Deepa (audit trail)
- **Auditability** — Carlos (every action logged), Deepa (her professional record)
- **Friction reduction** — Aisha (submit), Carlos (acknowledge), Marcus (return)

### Unique Drivers

| Persona | Unique Driver |
|---------|---------------|
| Aisha | Privacy / anonymity (photo + location exposure) |
| Carlos | Queue overwhelm (fallback to spreadsheets) |
| Deepa | Auto-resolution gaming (data quality) |
| Marcus | Passive return (no active engagement needed) |

### Potential Tensions

- **Speed vs. accuracy (Carlos):** Two-click acknowledge is fast but must require enough context to prevent auto-resolve gaming. Resolved by requiring a note only at the Resolved transition (FR-12), not at Acknowledge.
- **Citizen visibility vs. authority workload (Aisha vs. Carlos):** More notifications = more visible progress, but more emails to manage. Resolved by batching (≥30-min windows) and only notifying on substantive transitions.
- **Anonymity vs. accountability per category (PRD OQ-3):** Noise complaints benefit from anonymity; infrastructure reports benefit from accountability. **Deferred to OQ-3.**

---

## Related Documents

- **[00-trigger-map.md](00-trigger-map.md)** — Visual overview
- **[01-Business-Goals.md](01-Business-Goals.md)** — Vision, objectives, metrics
- **[03-Feature-Impact-Analysis.md](03-Feature-Impact-Analysis.md)** — Features × forces scoring
- **[08-Key-Insights.md](08-Key-Insights.md)** — Strategic implications

---

_Backfilled from brief.md + prd.md on 2026-09-11_
