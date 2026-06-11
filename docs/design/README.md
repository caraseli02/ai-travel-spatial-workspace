# Design documentation index

Wayfarer UI is designed in Pencil (`pencil-shadcn.pen`) and implemented with shadcn/ui (Radix Nova, Stone + Orange).

## Current baseline

Pencil is the versioned design source and shadcn/ui is the shared implementation foundation across the Landing Page, Trip List, and Trip Workspace. Landing v2 is the canonical Landing Page direction; legacy Landing v1 frames are archival and should not be extended.

## Start here

| Task | Read |
|------|------|
| Any Pencil or design work | `.agents/skills/pencil-wayfarer/SKILL.md` |
| File map (open in Pencil first) | **Wayfarer / Index** frame (`d3HbiR`) |
| Tokens, themes, crosswalk | [foundations.md](foundations.md) |
| Screen layout patterns (A–E) | [patterns.md](patterns.md) |
| Implement React from design | `.cursor/rules/shadcn-ui.mdc` + Pencil **Code** guide |

## Pencil file structure

The file uses **separate top-level frames** — like Figma pages. Desktop and mobile never share a parent.

```
Wayfarer / Index                    ← start here (file map)

── Design system (one frame per layer) ──
Wayfarer / DS / 01 Foundations
Wayfarer / DS / 02 Brand
Wayfarer / DS / 03 shadcn Primitives
Wayfarer / DS / 04 Patterns
Wayfarer / DS / 05 Components · Trip List    ← Chrome | Cards groups
Wayfarer / DS / 06 Components · Trip Canvas ← Chrome | Inbox | Canvas Cards | Panels

── Desktop screens (1440px) ──
Wayfarer / Desktop / Landing
Wayfarer / Desktop / Trip List
Wayfarer / Desktop / Trip Canvas

── Mobile screens (390px) ──
Wayfarer / Mobile / Landing
Wayfarer / Mobile / Trip List
Wayfarer / Mobile / Trip Canvas

Wayfarer / Archive                  ← scratch only, ignore
```

Each screen page has:

1. **Cover** — surface name, route, breakpoint, theme
2. **Screens** — vertical stack, 80px gap, state frames only

## Layer model

| Layer | Pencil frames | Docs |
|-------|---------------|------|
| L0 Foundations | `DS / 01` | [foundations.md](foundations.md) |
| L1 Brand + Primitives | `DS / 02–03` | [CROSSWALK.md](../../.agents/skills/pencil-wayfarer/CROSSWALK.md) |
| L1½ Patterns | `DS / 04` | [patterns.md](patterns.md) |
| L2 Domain components | `DS / 05–06` | Surface docs (component tables) |
| L3 Desktop screens | `Desktop / *` | Per-surface Pencil screen tables |
| L4 Mobile screens | `Mobile / *` | Per-surface mobile tables |

## Surface docs

| Doc | Route | Desktop frame | Mobile frame |
|-----|-------|---------------|--------------|
| [landing-page.md](landing-page.md) | `/` | `elmGx` | `LWbNo` |
| [trip-list.md](trip-list.md) | `/trips` | `i8BjSi` | `uqZ1a` |
| [trip-canvas.md](trip-canvas.md) | `/trips/:tripId` | `lngHk` | `rsL1N` |

## Mobile backlog

**Agent prompt:** [mobile-prompt.md](mobile-prompt.md) — copy into a new chat to draw all mobile screens.

| Surface | Mobile states (`Mobile / *`) |
|---------|---------------------------|
| Landing | Default `qJIYB` |
| Trip List | Default `CXcSq`, Chat `zjmBk`, New trip `SCroq`, Empty `YHSxu`, No matches `nhghj` |
| Trip Canvas | Default `m3QEJS`, Inbox closed `C9cHr`, Card selected `kYixD` |
