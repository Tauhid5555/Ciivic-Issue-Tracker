---
page: 02 Confirmation
viewport: mobile 375px
realizes: FR-2, UJ-1
---

# Mockup — Confirmation (mobile)

The "received" moment. Hero with checkmark + Tracking ID card. Single screen.

```
┌─────────────────────────────────────────────┐
│ ReportIt                  │
├─────────────────────────────────────────────┤
│                                             │
│                                             │
│              ░░░░░░░░░░░░░░░                │  ← warm off-white bg
│           ░░░░░░░░░░░░░░░░░░░░░              │
│          ░░░░░   ✓   ░░░░░░                 │  ← 96px circle, brand-soft bg
│           ░░░░░░░░░░░░░░░░░░░░░              │     64px checkmark, brand color
│              ░░░░░░░░░░░░░░░                │
│                                             │
│                                             │
│      We've received your report.            │  ← display headline, centered
│                                             │
│      Here's your tracking ID —              │
│      save it to check what happens next.    │  ← sub, muted, centered
│                                             │
│                                             │
│      ┌─────────────────────────────────┐    │
│      │                                 │    │
│      │       YOUR TRACKING ID          │    │  ← tracking ID card
│      │                                 │    │     surface-muted bg
│      │       ABC-9XK2-PQ7M             │    │     monospace, display size
│      │                                 │    │
│      │           Copy ID               │    │  ← ghost button
│      │                                 │    │
│      └─────────────────────────────────┘    │
│                                             │
│      We've also sent this to                │  ← conditional caption
│      you@example.com.                       │     (email provided variant)
│                                             │
│                                             │
│      ───────────────────────────            │  ← space-8
│                                             │
│      What happens next                      │  ← h3
│                                             │
│      ┌─────────────────────────────────┐    │
│      │ ① The city team will look at    │    │  ← numbered steps
│      │   this within 24 hours.         │    │     surface-muted bg
│      └─────────────────────────────────┘    │
│      ┌─────────────────────────────────┐    │
│      │ ② We'll email you when they do. │    │  ← email-conditional
│      └─────────────────────────────────┘    │
│      ┌─────────────────────────────────┐    │
│      │ ③ You can check anytime using   │    │
│      │   the link in your email.       │    │
│      └─────────────────────────────────┘    │
│                                             │
│      ───────────────────────────            │
│                                             │
│      ╔═════════════════════════════════╗    │
│      ║      Check status now           ║    │  ← primary button
│      ╚═════════════════════════════════╝    │
│                                             │
│              Report another problem         │  ← ghost link, secondary
│                                             │
│                                             │
└─────────────────────────────────────────────┘
```

## Anonymous variant (no email provided)

Differences:
- Caption reads: *"You didn't leave an email — bookmark this page or save your tracking ID. It's the only way to check on this report."*
- Step ② becomes: *"Bookmark this page — we'll update it here."*
- Step ③ becomes: *"You can check anytime by returning to this page."*

## "Copied!" transient state

```
│      ┌─────────────────────────────────┐    │
│      │       YOUR TRACKING ID          │    │
│      │       ABC-9XK2-PQ7M             │    │
│      │           ✓ Copied!              │    │  ← 2-second success state
│      └─────────────────────────────────┘    │
```

## Notes on feel

- Centered hero, vertical stack. Page feels like a receipt.
- The Tracking ID is the most visually prominent element after the checkmark.
- "Check status now" gets default focus — most useful next action.
- No marketing, no related suggestions, no cross-sell.
- Warm bg + soft checkmark circle: reassuring without being childish.
