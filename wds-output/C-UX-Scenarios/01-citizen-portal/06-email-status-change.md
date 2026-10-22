---
page: 06 Email — Status Change
scenario: 01 Citizen Portal
realizes: [FR-5]
created: 2026-09-06
status: draft
---

# Page 06 — Email: Status Change

## Purpose

Reinforce the *being looked at* and *not forgotten* legs of the 24-hour promise. Each status transition gets its own email — concise, never noisy. Keeps the citizen feeling momentum without inbox fatigue.

## When this email is sent

- Trigger: every status change on a report the citizen is subscribed to.
- Recipient: the email on the original submission. *Not sent* if the citizen was anonymous.
- Dispatch: ≥ 95% within 5 minutes of status change (NFR-4 / SM-7).
- **Cadence cap:** if multiple status changes happen within 30 minutes, batch into a single email with a timeline summary (avoid 3 emails in 15 minutes).

## Patterns used

See `D-Design-System/04-patterns.md` §13.

- **Frame:** `<CIVEmailFrame>`
- **Body block:** eyebrow + salutation + status pill (current state) + CTA + optional context paragraph

## Body composition

### Header / footer

Per `<CIVEmailFrame>`.

### Eyebrow (status-conditional)

| From → To | Eyebrow |
|-----------|---------|
| Submitted → Acknowledged | *Your report is being looked at* |
| Acknowledged → In Progress | *Work has started on your report* |
| In Progress → Resolved | *Your report has been resolved* |
| Resolved → Disputed (citizen action) | *You flagged your report* (only sent to actor — usually no email needed since it's their action) |
| Resolved → In Progress (reopen) | *Your report was reopened* |
| Any → Closed-Duplicate | *Your report was closed as a duplicate* |

### Status block

Inline card:
- Tracking ID (monospace, prominent)
- Status pill: `<CIVStatusPill variant size="md">` (the *new* state)
- Brief one-liner of what's expected next

### Primary CTA

`<CIVButton variant="primary">` → Page 03 Tracking Page.

Label varies by state:
- Acknowledged: *"View report"*
- In Progress: *"View progress"*
- Resolved: *"See resolution"*
- Reopen: *"View report"*
- Duplicate: *"See original report"* (if linkable)

### Context paragraph (status-conditional)

**Acknowledged:**
> *The team has started looking at your [Category] report near [Zone]. We'll email you when there's more to share.*

**In Progress:**
> *The team is working on this. We'll send another update when it's resolved or if anything changes.*

**Resolved:**
> *The team marked this as resolved. [Resolution note, if present, in a quote block.] Tap below to see the details.*

**Reopen:**
> *The team reopened this report: [reopen reason note]. We'll update you when there's more.*

**Duplicate:**
> *We linked this to an earlier report: [original Tracking ID]. You can follow that one instead.*

### Sign-off

*— The [City Name] team*

## Subject line (status-conditional)

| State | Subject |
|-------|---------|
| Acknowledged | *"Your report is being looked at — [XXX-XXXX]"* |
| In Progress | *"Work started on your report — [XXX-XXXX]"* |
| Resolved | *"Your report was resolved — [XXX-XXXX]"* |
| Reopen | *"Your report was reopened — [XXX-XXXX]"* |
| Duplicate | *"Your report was closed as a duplicate — [XXX-XXXX]"* |

(Subject includes the Tracking ID for inbox searchability.)

## Sender

Same as Page 05.

## Variants

| Variant | Trigger | Body adjustment |
|---------|---------|-----------------|
| Standard | All status changes | As above |
| Batched | Multiple transitions within 30 min | Single email with mini-timeline of transitions in the body; CTA links to Page 03 which has the full timeline |

## States

| State | Behavior |
|-------|----------|
| Successful dispatch | Status-conditional email rendered |
| Bounce | Logged; do not retry (citizen can check Page 03 directly); surface in admin |
| Citizen clicks CTA | Lands on Page 03 with email param (auto-authed Personal History) |
| Multiple changes within window | Batched into one email (see variants) |

## Accessibility

Same as Page 05 (semantic structure, AA contrast, button-shaped link, plain-text alternative).

**Preheader (status-conditional):**
- Acknowledged: *"The team has started looking at your report."*
- In Progress: *"The team is working on this — we'll update you when it's resolved."*
- Resolved: *"The team marked this as resolved. Tap to see the details."*
- Reopen: *"The team reopened this report."*
- Duplicate: *"We linked this to an earlier report."*

## What is intentionally NOT in this email

Aggressive urgency ("URGENT!"), re-engagement hooks, related-reports carousels, marketing.

## Implementation handoff notes

**Components used:** `<CIVEmailFrame>`, `<CIVStatusPill>` (md), `<CIVButton>` (primary, as link).

**Idempotency:** Email dispatch idempotent on (report_id, status, timestamp).

**Batching logic:** If multiple status changes queued for the same email within 30 min, collapse into one email with a transition list.

**Plain-text alternative:** Required.

**Suppression:** If the email bounces 3 times, suppress future emails for that report; mark report as `email-deliverability-failed`. The Tracking Page remains the source of truth (per R-7 mitigation).
