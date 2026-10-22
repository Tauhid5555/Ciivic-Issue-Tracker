---
page: 03 Tracking Page — Resolved state
viewport: mobile 375px
realizes: FR-3, FR-12, FR-13, UJ-4
---

# Mockup — Tracking Page, Resolved (mobile)

The most-touched status. Citizen returns to see what happened.

```
┌─────────────────────────────────────────────┐
│ ReportIt                  │
├─────────────────────────────────────────────┤
│                                             │
│ Tracking ID: ABC-9XK2-PQ7M      Copy         │  ← eyebrow + copy link
│                                             │
│ ╔═════════════════════════════════════════╗ │
│ ║                                         ║ │  ← hero card, surface bg
│ ║         ┌───────────────────┐          ║ │     shadow-md
│ ║         │   ●  Resolved      │          ║ │  ← status pill, deep green
│ ║         └───────────────────┘          ║ │
│ ║                                         ║ │
│ ║      This has been resolved.            ║ │  ← headline, h1
│ ║                                         ║ │
│ ║      Bulb replaced; tested on            ║ │  ← resolution note attribution
│ ║      2026-08-29.                        ║ │     (one line)
│ ║                                         ║ │
│ ║      Updated 4 days ago                 ║ │  ← relative time
│ ║                                         ║ │
│ ╚═════════════════════════════════════════╝ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ 🪧  Streetlight                          │ │  ← report summary card
│ │                                         │ │
│ │ SUBMITTED                               │ │  ← field labels, uppercase
│ │ Aug 24, around 8:42 PM                  │ │
│ │                                         │ │
│ │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓                          │ │  ← photo thumbnail
│ │                                         │ │
│ │ LOCATION                                │ │
│ │ Near [Your City] Park                   │ │  ← zone only, never address
│ │ Why am I seeing a general location?     │ │  ← inline expand link
│ │                                         │ │
│ │ WHAT YOU TOLD US                        │ │
│ │ ┌─────────────────────────────────┐     │ │
│ │ ││ Light has been out for a week  │     │ │  ← blockquote
│ │ ││ on the corner of 5th & Main.   │     │     brand left border
│ │ └─────────────────────────────────┘     │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ What's happened so far                     │  ← h3
│                                             │
│ ┃ ●  Resolved                              │  ← timeline, most recent first
│ ┃ │  The team marked this as resolved.    │     current row has ring
│ ┃ │  4 days ago                            │
┃ ┃                                         │
│ ┃ ●  Work started                          │
│ ┃ │  The team started working on this.    │
│ ┃ │  5 days ago                            │
│ ┃                                         │
│ ┃ ●  Being looked at                       │
│ ┃ │  The team acknowledged your report.   │
│ ┃ │  Aug 25, 9:14 AM                       │
│ ┃                                         │
│ ┃ ●  Received                              │
│ ┃ │  You submitted this on Aug 24.        │
│ ┃ │  Aug 24, 8:42 PM                       │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ ░░░░░  What the team did ░░░░░░░░       │ │  ← resolution block
│ │                                         │ │     resolved-bg
│ │ Bulb replaced; tested on 2026-08-29.     │ │
│ │                                         │ │
│ │ ▓▓▓▓▓▓  Photo from the team.            │ │  ← after-photo thumbnail
│ └─────────────────────────────────────────┘ │
│                                             │
│ ╔═════════════════════════════════════════╗ │
│ ║       This isn't fixed                  ║ │  ← dispute button (danger variant)
│ ╚═════════════════════════════════════════╝ │
│                                             │
│           ✓ It was fixed — close this out    │  ← positive confirmation, ghost link
│                                             │
└─────────────────────────────────────────────┘
```

## Acknowledged state (alternative hero)

```
│ ╔═════════════════════════════════════════╗ │
│ ║                                         ║ │
│ ║       ┌─────────────────────┐          ║ │
│ ║       │  ● Being looked at  │          ║ │  ← different pill color
│ ║       └─────────────────────┘          ║ │     brand green
│ ║                                         ║ │
│ ║     The team is looking at this.        ║ │
│ ║                                         ║ │
│ ║     Updated 2 hours ago                  ║ │
│ ║                                         ║ │
│ ║     We'll be in touch within 24 hours.  ║ │  ← SLA reassurance
│ ║                                         ║ │
│ ╚═════════════════════════════════════════╝ │
```

## Notes on feel

- **Status is the hero.** Largest visual element after the page title.
- Resolution block uses status-resolved-bg (soft green) — visual confirmation of "done."
- Timeline reads top-to-bottom (most recent first) — Aisha sees what happened most recently at the top.
- Dispute button is danger-styled but secondary in placement — it shouldn't feel like the *expected* action. Most resolved reports are actually resolved.
- The "It was fixed" link is subtle — it's there for the 25% who'll use it (SM-4 metric), not shouted.
- No authority name on citizen view (vs. dashboard where it's shown) — citizens shouldn't feel surveilled.
