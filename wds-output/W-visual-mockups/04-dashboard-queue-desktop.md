---
page: 02-D02 Dashboard / Queue
viewport: desktop 1280px
realizes: FR-7, FR-8, FR-9
---

# Mockup — Dashboard / Queue (desktop)

Carlos's daily surface. Dense, scannable, fast. Right drawer for Report Detail (mockup 05).

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ReportIt                                              ┌──┐  Carlos M.        │
│ Dashboard                                                                │CM│                    │
│                                                                          └──┘                    │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                    │
│  Queue                                                       247 reports         [Filters ▼]    │
│                                                                                                    │
│  [All] [Submitted (47)] [Acknowledged (12)] [In Progress (8)] [Resolved (178)] [Disputed (2)]    │  ← quick chips
│                                                                                                    │
│  Active: × Today            × Drainage                              Clear all                       │  ← removable active chips
│                                                                                                    │
│  5 need acknowledgment · 12 in progress · 3 disputed                                              │  ← subtle stats strip
│                                                                                                    │
│ ─────────────────────────────────────────────────────────────────────────────────────────────────│
│ ☐ │ Status           │ Pri │ Category      │ Location     │ Submitted │ Photo │ Track ID  │ Rep │ Action     │
│ ─────────────────────────────────────────────────────────────────────────────────────────────────│
│ ☐ │ ● Received       │  —  │ 🪧 Streetlight │ Maple Hts    │ 8h ago    │ ▓▓▓▓ │ ABC-9XK2  │ —   │[Acknowledge]│
│ ☐ │ ● Received       │  ▲  │ 🚧 Pothole     │ Oakridge     │ 9h ago    │ ▓▓▓▓ │ BCD-7YT3  │ j..  │[Acknowledge]│
│ ☐ │ ● Received       │  —  │ 🗑 Garbage    │ Downtown     │ 10h ago   │ ▓▓▓▓ │ CDE-4WR1  │ —   │[Acknowledge]│
│ ☐ │ ● Being looked  │  —  │ 💧 Drainage    │ Westside     │ 1d ago    │ ▓▓▓▓ │ DEF-2QP9  │ a..  │[Start work] │
│ ☑ │ ● Being looked  │  —  │ 🪧 Streetlight │ Maple Hts    │ 1d ago    │ ▓▓▓▓ │ EFG-8LM4  │ —   │[Start work] │  ← selected, brand-soft bg
│ ☑ │ ● Being looked  │  —  │ 🔊 Noise       │ Riverside    │ 2d ago    │ ▓▓▓▓ │ FGH-5NK7  │ s..  │[Start work] │  ← selected
│ ☐ │ ● Work in prog. │  ▲  │ 🚧 Pothole     │ Oakridge     │ 3d ago    │ ▓▓▓▓ │ GHI-3JH6  │ —   │[Mark resolv]│
│ ☐ │ ● Work in prog. │  —  │ 🪧 Streetlight │ Downtown     │ 4d ago    │ ▓▓▓▓ │ HJK-9FG2  │ m..  │[Mark resolv]│
│ ☐ │ ● Resolved      │  —  │ 🗑 Garbage    │ Westside     │ 5d ago    │ ▓▓▓▓ │ JKL-6WT8  │ —   │   —         │
│ ☐ │ ● Resolved      │  —  │ 💧 Drainage    │ Riverside    │ 6d ago    │ ▓▓▓▓ │ KLM-4QR3  │ r..  │   —         │
│ ☐ │ ● You flagged   │  ▼  │ 🚧 Pothole     │ Maple Hts    │ 6d ago    │ ▓▓▓▓ │ MNO-2XV1  │ —   │[Review]     │  ← warning color
│   │                │     │               │              │           │      │           │     │             │
│   │  ...           │     │               │              │           │      │           │     │             │  ← scrollable
│ ─────────────────────────────────────────────────────────────────────────────────────────────────│
│  25 ▼ per page                                              Showing 1–11 of 247  ‹ Prev  [1]  2  3  Next ›│
│                                                                                                    │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════════════════════════════════
  3 selected · 3 Submitted · 0 Acknowledged · 0 In Progress         [Acknowledge 3]  [Set priority]  [Clear]
═══════════════════════════════════════════════════════════════════════════════════════════════════════
   ↑ sticky bulk action bar, appears on selection
```

## Status pill legend

```
│ ●  Received        — warm gray
│ ●  Being looked at — brand green
│ ●  Work in progress — warm amber
│ ●  Resolved        — deep green
│ ●  You flagged     — warm red
│ ●  Duplicate       — neutral gray
```

## Priority indicator legend

```
│ —  Medium (default, subtle)
│ ▲  High (warm amber)
│ ▼  Urgent (warm red)
│ ▼  Low (rare, gray)
```

## Notes on feel

- **Density is the design.** 11 rows visible without scroll on a typical laptop. Each row is a complete unit of work.
- **Status pill is the row's identifier.** Carlos spots outliers in <1s by status color.
- **Quick-action button is status-conditional.** He never has to think "what next" — the button says it.
- **Selected rows highlight in brand-soft.** Bulk bar appears at bottom; count is live.
- **No big numbers, no charts.** Subtle stats strip tells him the shape of the day.
- **Right drawer** (mockup 05) opens on row click — Carlos stays in queue context.
