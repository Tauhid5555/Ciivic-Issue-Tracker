---
page: 02-D03 Report Detail (right drawer)
viewport: desktop 1280px (queue behind, 480px drawer)
realizes: FR-10, FR-11, FR-12, FR-14
---

# Mockup — Report Detail (right drawer over Queue)

Carlos clicks a row → drawer slides in from right at 480px wide. Queue behind dimmed at 30% overlay.

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Queue  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│ ░░░☐│ Status          │ Pri│ Category      │ Location     │ Submitted │ Photo │ Track ID  │ Re │Action░░░░░│
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│ ░░░☐│ ● Received      │  — │ 🪧 Streetlight │ Maple Hts    │ 8h ago    │ ▓▓▓▓ │ ABC-9XK2  │ —  │[Acknowle░░│
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│                                  ┌──────────────────────────────────────────────────────────────┐  │
│                                  │ ●  Being looked at    ABC-9XK2-PQ7M              [×]       │  │  ← drawer header (sticky)
│                                  │ ──────────────────────────────────────────────────────── │
│                                  │                                                            │  │
│                                  │   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  │
│                                  │   ▓▓▓▓▓▓▓▓▓  citizen's photo  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  │  ← photo, tap to enlarge
│                                  │   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  │
│                                  │                                                            │  │
│                                  │   🪧  Streetlight                                           │  │
│                                  │   Submitted 8h ago by anonymous                            │  │
│                                  │                                                            │  │
│                                  │   LOCATION                                                  │  │
│                                  │   Near [Your City] Park                                     │  │
│                                  │   ┌──────────────────────────────────────┐                  │  │
│                                  │   │  ▓▓▓▓▓▓▓📍▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │                  │  │  ← small map preview
│                                  │   └──────────────────────────────────────┘                  │  │
│                                  │                                                            │  │
│                                  │   DESCRIPTION                                               │  │
│                                  │   ┌──────────────────────────────────────┐                  │  │
│                                  │   ││ Light has been out for a week     │                  │  │  ← blockquote
│                                  │   ││ on the corner of 5th & Main.       │                  │  │
│                                  │   └──────────────────────────────────────┘                  │  │
│                                  │                                                            │  │
│                                  │   REPORTER                                                  │  │
│                                  │   Anonymous submission.                                     │  │
│                                  │                                                            │  │
│                                  │   ──────────────────────────────────────────                │  │
│                                  │                                                            │  │
│                                  │   What's happened so far                                    │  │
│                                  │                                                            │  │
│                                  │   ┃ ●  Being looked at                                      │  │
│                                  │   ┃ │  The team acknowledged your report.   │              │  │
│                                  │   ┃ │  Carlos M. · 7h ago                     │              │  │  ← admin attribution visible
│                                  │   ┃                                                         │  │
│                                  │   ┃ ●  Received                                              │  │
│                                  │   ┃ │  You submitted this.                    │              │  │
│                                  │   ┃ │  System · 8h ago                        │              │  │
│                                  │                                                            │  │
│                                  │   ──────────────────────────────────────────                │  │
│                                  │                                                            │  │
│                                  │   PRIORITY                                                  │  │
│                                  │   ┌────────┬────────┬────────┬────────┐                     │  │
│                                  │   │   Low  │ Medium │  High  │Urgent  │                     │  │  ← priority segmented control
│                                  │   │   ·    │   ●    │   ▲    │   ▼    │                     │  │     brand-soft selected
│                                  │   └────────┴────────┴────────┴────────┘                     │  │
│                                  │                                                            │  │
│                                  │   ──────────────────────────────────────────                │  │
│                                  │                                                            │  │
│                                  │   INTERNAL NOTES                                            │  │
│                                  │   ┌──────────────────────────────────────┐                  │  │
│                                  │   │  ░░ Spoke to Juan from Public Works  │                  │  │  ← admin-only notes
│                                  │   │  ░░  — bulb ordered, ETA Friday.     │                  │  │
│                                  │   │  ░░ Carlos M. · 5h ago                │                  │  │
│                                  │   └──────────────────────────────────────┘                  │  │
│                                  │   ┌──────────────────────────────────────┐                  │  │
│                                  │   │  Add a note for the team (internal)  │                  │  │
│                                  │   │                                       │                  │  │
│                                  │   └──────────────────────────────────────┘                  │  │
│                                  │                                                    [Add note]   │  │
│                                  │                                                            │  │
│                                  │   ──────────────────────────────────────────                │  │
│                                  │                                                            │  │
│                                  │   ACTIONS                                                    │  │  ← action panel
│                                  │   ╔════════════════════════════════════════════╗            │  │
│                                  │   ║          Start work                        ║            │  │  ← primary (status-conditional)
│                                  │   ╚════════════════════════════════════════════╝            │  │
│                                  │              Mark as duplicate                             │  │  ← ghost secondary
│                                  │                                                            │  │
│                                  ├────────────────────────────────────────────────────────────┤  │
│                                  │ Last updated 5h ago by Carlos M.                            │  │  ← footer (sticky)
│                                  └────────────────────────────────────────────────────────────┘  │
│                                                                                                   │
└───────────────────────────────────────────────────────────────────────────────────────────────────┘
                                            ↑ ESC or backdrop click closes
```

## In Progress variant (action panel only)

```
│   ACTIONS                                                    │
│   ╔════════════════════════════════════════════╗            │
│   ║          Mark resolved                     ║            │  ← primary
│   ╚════════════════════════════════════════════╝            │
│              Revert to Acknowledged                         │  ← ghost (requires reason note)
```

## Disputed variant

```
│   ┌────────────────────────────────────────────┐            │
│   │ ⚠ Disputed by citizen on Aug 29.           │            │  ← warning banner
│   │   Status remains Resolved until reopened.  │            │
│   └────────────────────────────────────────────┘            │
│                                                            │
│   ACTIONS                                                    │
│   ╔════════════════════════════════════════════╗            │
│   ║          Reopen                            ║            │
│   ╚════════════════════════════════════════════╝            │
│              Keep resolved                                 │  ← closes dispute
```

## Resolution form modal (slides up from "Mark resolved")

```
                    ┌──────────────────────────────────┐
                    │  Mark resolved              [×]  │
                    │ ─────────────────────────────── │
                    │                                  │
                    │  WHAT DID THE TEAM DO? *         │
                    │  ┌────────────────────────────┐  │
                    │  │ Bulb replaced; tested on   │  │
                    │  │ 2026-08-29.                 │  │
                    │  │                            │  │
                    │  └────────────────────────────┘  │
                    │                            42/1000│
                    │                                  │
                    │  AFTER PHOTO (OPTIONAL)         │
                    │  ┌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┐  │
                    │  ╎   📷  Tap to add photo.   ║  │
                    │  └╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┘  │
                    │                                  │
                    │ ─────────────────────────────── │
                    │              [Cancel]  [Save]   │
                    └──────────────────────────────────┘
```

## Notes on feel

- **Drawer doesn't replace the queue** — Carlos clicks row, drawer slides in, queue is dimmed behind. Close returns to same scroll position.
- **Everything is one drawer.** No nested pages, no tab switches. Photo, location, description, timeline, priority, notes, actions — all stacked vertically, scrollable.
- **Priority is one-click.** No save button. Click "High" → instantly saved, toast confirms.
- **Internal notes are first-class** but visually muted (`--color-surface-muted` bg). They fill the coordination gap that would push staff to Slack.
- **Action panel at the bottom is sticky** in the drawer footer — primary action always visible without scroll.
- **Admin attribution shown in timeline** — staff trust comes from seeing who did what. Different from citizen view (which hides names).
- **Sticky footer shows "last updated"** for terminal states (Resolved, Closed-Duplicate) — keeps context.
