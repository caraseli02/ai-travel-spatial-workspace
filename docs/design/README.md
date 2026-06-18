# Design documentation index

Wayfarer UI is designed in Pencil (`pencil-shadcn.pen`) and implemented with shadcn/ui (Radix Nova, Stone + Orange).

## Pencil skill

Load **`.agents/skills/pencil-design/SKILL.md`** for all Pencil MCP work (6 rules: DS refs, tokens, layout, screenshots, assets, `frontend-design`).

Wayfarer file structure, canvas grid, surfaces, and crosswalk live in **this index** + surface docs below — not separate skills.

## Current baseline

Pencil is the versioned design source. Landing v2 is canonical; legacy Landing v1 lives in **Archive**.

## Start here

| Task | Read |
|------|------|
| Pencil MCP workflow | `.agents/skills/pencil-design/SKILL.md` |
| File map (open in Pencil first) | **Wayfarer / Index** (`d3HbiR`) |
| Structure / grid / Dump | Canvas grid + file structure (below) |
| Surfaces + node IDs | Surface docs table (below) |
| Component ref IDs | [CROSSWALK.md](CROSSWALK.md) |
| Tokens, themes | [foundations.md](foundations.md) |
| Layout patterns A–E | [patterns.md](patterns.md) |
| Implement React | `.cursor/rules/shadcn-ui.mdc` |

## Canvas grid

Open **Wayfarer / Index** for the live map. Fixed layout:

```
Row A   Index                          (0, 0)
Row B   DS / 01–07                     (0, 529↓) vertical column
Row C   Screens / Desktop / *          (1320→4720, 0)
Row D   Screens / Mobile / *           (1320→4720, 12800)
Row E   Archive                        (-1700, 0)
Row E   Dump                           (-1700, 8000)
```

## Pencil file structure

```
Wayfarer / Index

── Design system ──
Wayfarer / DS / 01 Foundations
Wayfarer / DS / 02 Primitives
Wayfarer / DS / 03 Patterns
Wayfarer / DS / 04 Components / Shared
Wayfarer / DS / 05 Components / Trip List
Wayfarer / DS / 06 Components / Trip Canvas
Wayfarer / DS / 07 Components / Landing

── Handoff screens ──
Wayfarer / Screens / Desktop / Landing | Trip List | Trip Canvas — Done | Trip Canvas — Next
Wayfarer / Screens / Mobile / Landing | Trip List | Trip Canvas — Done | Trip Canvas — Next

Trip Canvas handoff: **Done** (`lngHk`, `rsL1N`) = shipped in React · **Next** (`v3Oai`, `GTWXC`) = Days + Map · **Dump** (`kMh8w`) = geo grounding (P4)

Wayfarer / Dump      ← experiments, never delete
Wayfarer / Archive   ← deprecated
```

### Screen page anatomy

**Cover + Screens** only. Optional **Section · *** groups inside Screens (e.g. Trip Canvas Done: Canvas | Modals; Trip Canvas Next: Days | Map).

### DS page anatomy

Cover/header + named component sections (Chrome, Cards, Map Route, etc.).

## Layer model

| Layer | Frames | Docs |
|-------|--------|------|
| L0 | `DS / 01` | [foundations.md](foundations.md) |
| L1 | `DS / 02` | [CROSSWALK.md](CROSSWALK.md) |
| L1½ | `DS / 03` | [patterns.md](patterns.md) |
| L2 | `DS / 04–07` | Surface docs |
| L3 | `Screens / Desktop / *` | Surface screen tables |
| L4 | `Screens / Mobile / *` | Surface mobile tables |

## Surface docs

| Doc | Route | Desktop | Mobile |
|-----|-------|---------|--------|
| [landing-page.md](landing-page.md) | `/` | `elmGx` | `LWbNo` |
| [trip-list.md](trip-list.md) | `/trips` | `i8BjSi` | `uqZ1a` |
| [trip-canvas.md](trip-canvas.md) | `/trips/:tripId` | Done `lngHk` · Next `v3Oai` | Done `rsL1N` · Next `GTWXC` |
