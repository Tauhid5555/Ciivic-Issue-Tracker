---
page: 01 Submit a Report
viewport: mobile 375px
realizes: FR-1, UJ-1
---

# Mockup — Submit a Report (mobile)

The citizen's first touchpoint. Mobile-first, single screen, vertical scroll.

```
┌─────────────────────────────────────────────┐
│ ReportIt                  │  ← header strip, no nav
├─────────────────────────────────────────────┤
│                                             │
│  Report a problem                           │  ← h1
│  It takes about a minute.                   │  ← sub, muted
│                                             │
│  ─────────────────────────────              │  ← space-8 gap
│                                             │
│  Step 1 of 4                                │  ← step indicator (mobile only)
│  ████████░░░░░░░░░░░░                       │
│                                             │
│  What's the problem? *                      │  ← form section label, required
│                                             │
│  ┌─────────────┐ ┌─────────────┐             │
│  │ 🪧          │ │ 🚧          │             │
│  │ Streetlight │ │ Pothole     │             │  ← 2-col grid
│  └─────────────┘ └─────────────┘             │
│  ┌─────────────┐ ┌─────────────┐             │
│  │ 🗑           │ │ 💧          │             │
│  │ Garbage     │ │ Drainage    │             │
│  └─────────────┘ └─────────────┘             │
│  ┌─────────────┐                             │
│  │ 🔊          │                             │
│  │ Noise       │                             │
│  └─────────────┘                             │
│                                             │
│  ─────────────────────────────              │  ← space-6
│                                             │
│  Where is it? *                             │
│  We'll show the neighborhood, not your      │  ← helper
│  exact address.                             │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │      📍  Use my location             │    │  ← secondary button
│  └─────────────────────────────────────┘    │
│                                             │
│  ─────────────────────────────              │  ← space-6
│                                             │
│  Add a photo *                              │
│  Helps the city team understand the         │
│  problem. JPEG, PNG, or HEIC up to 10MB.    │
│                                             │
│  ┌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┐    │  ← dashed drop zone
│  ╎                                     ╎    │
│  ╎            📷                        ╎    │
│  ╎      Tap to add a photo.             ╎    │
│  ╎                                     ╎    │
│  └╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┘    │
│                                             │
│  ─────────────────────────────              │
│                                             │
│  Anything else to add?                      │  ← optional
│  A sentence is fine.                        │
│  ┌─────────────────────────────────────┐    │
│  │                                     │    │
│  │  What did you see?                  │    │  ← textarea
│  │                                     │    │
│  │                                     │    │
│  └─────────────────────────────────────┘    │
│                                       0/500 │  ← char counter
│                                             │
│  ─────────────────────────────              │
│                                             │
│  Get notified the moment we look at this?   │
│  We'll email you when your report is        │
│  reviewed and again when it's resolved.     │
│  Leave blank to stay anonymous.             │
│  ┌─────────────────────────────────────┐    │
│  │  you@example.com                     │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ─────────────────────────────              │
│  ─────────────────────────────              │
│                                             │
│  By submitting, you agree to our            │
│  [privacy policy].                          │  ← microcopy, inline link
│                                             │
│ ╔═════════════════════════════════════════╗ │
│ ║         Submit Report                   ║ │  ← sticky primary button
│ ╚═════════════════════════════════════════╝ │
│                                             │
└─────────────────────────────────────────────┘
```

## Selected Category state

```
│  ┌╌╌╌╌╌╌╌╌╌╌╌┐ ┌╌╌╌╌╌╌╌╌╌╌╌┐               │
│  ╎ 🪧         ╎ ╎ 🚧         ╎               │
│  ╎ Streetlight╎ ╎ Pothole    ╎               │
│  ╎         ✓  ╎ ╎            ╎               │  ← selected card has
│  └╌╌╌╌╌╌╌╌╌╌╌┘ └╌╌╌╌╌╌╌╌╌╌╌┘               │     brand-soft bg + checkmark
```

## Location granted state

```
│  Where is it? *                             │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │    │
│  │  ▓▓▓▓▓▓▓📍▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │    │  ← small map preview
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │    │
│  └─────────────────────────────────────┘    │
│  Pin placed — drag to adjust.              │
```

## Photo filled state

```
│  ┌─────────────────────────────────────┐    │
│  │  ▓▓▓▓  IMG_4829.jpg · 2.3MB          │    │  ← thumbnail + meta + Remove link
│  │  ▓▓▓▓                          Remove│    │
│  └─────────────────────────────────────┘    │
```

## Submitting state (button area)

```
│ ╔═════════════════════════════════════════╗ │
│ ║         ◐  Submitting…                  ║ │  ← button disabled, spinner
│ ╚═════════════════════════════════════════╝ │
```

## Notes on feel

- Background: warm off-white (`--color-bg`).
- Form is "transparent" — no card around the whole form. Cards are reserved for the photo, the map, the button.
- Tap targets generous (52px button, 96px category cards).
- Category icons in brand color (`--color-brand`).
- Helper text in subtle gray, never as legalese walls.
- One form, no wizard steps. The "Step 1 of 4" indicator is a quiet progress hint, not a navigation lock.
