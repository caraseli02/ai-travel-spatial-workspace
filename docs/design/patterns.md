# Wayfarer composition patterns

Shared layout and component patterns for Pencil screens and React implementation. Derived from Pencil **Design System** guide + Wayfarer surfaces. See [foundations.md](foundations.md) for tokens and [CROSSWALK.md](../../.agents/skills/pencil-wayfarer/CROSSWALK.md) for ref IDs.

## Screen layout patterns

### Pattern A — Header + content (Trip List, Landing nav)

```
┌────────────────────────────────────────────┐
│  Header bar (52–64px)                      │
├────────────────────────────────────────────┤
│  Scrollable content                        │
└────────────────────────────────────────────┘
```

| Surface | Header ref | Height | Theme |
|---------|------------|--------|-------|
| Trip List | `l6uTL` | 64px | Dark |
| Trip Canvas | `zVsPD` | 52px | Light |
| Landing | inline Nav | 64px | Light |

Pencil: vertical frame, header `strokeWidth: { bottom: 1 }`, content `fill_container`.

### Pattern B — Sidebar + canvas (Trip Canvas default)

```
┌──────────┬────────────────────────────────┐
│ Inbox    │  Canvas + floating overlays      │
│  280px   │  fill_container                │
└──────────┴────────────────────────────────┘
```

| Zone | Ref | Width |
|------|-----|-------|
| Inbox | `tS1mE` | 280px |
| Canvas | layout frame | fill |
| Detail panel (state) | `l5hjXc` | 280px right |

Closed inbox: canvas spans full width (`yPpUn`).

### Pattern C — Fixed prompt bar (Trip List, Trip Canvas)

```
┌────────────────────────────────────────────┐
│  Main content (scrollable)                 │
│                                            │
├────────────────────────────────────────────┤
│  Suggestion chips + input row              │
│  Disclaimer (trip list only)               │
└────────────────────────────────────────────┘
```

| Surface | Ref | Max width |
|---------|-----|-----------|
| Trip List | `YK92H` | ~672px centered |
| Trip Canvas | `m5ldW7` | 512px floating |

Compose: `Badge/Outline` chips → `Input/Default` + `Icon Button/Default`.

### Pattern D — Card grid (Trip List)

```
┌──────────┐ ┌──────────┐ ┌──────────┐
│ New Trip │ │ Trip 1   │ │ Trip 2   │
│ (dashed) │ │ GK0nB    │ │ GK0nB    │
└──────────┘ └──────────┘ └──────────┘
```

3 columns @ 1440px, gap 16–24. Empty states swap grid cell 2 for `vCVf6` or `McIXx`.

### Pattern E — Modal overlay (dialogs)

Centered `Modal/Center` (`5:X6bmd`) on dimmed backdrop. Used in:

| State | Screen | Domain ref |
|-------|--------|------------|
| New trip | `rVIzu` | shadcn modal |
| Create card | `UVajj` | `iMiJf` |
| Add day | `xD6UP` | `nn5gb` |

Modal actions: Cancel `Button/Outline` left, primary `Button/Default` right.

## shadcn Card slots

`5:pcGlv` Card exposes three slots — use `descendants` or insert into slot paths:

| Slot ID | Name | Use |
|---------|------|-----|
| `5:CgJv7` | Header | Image banner, title zone |
| `5:frWPV` | Content | Meta, chips, body |
| `5:bvhSM` | Actions | Footer buttons |

Disable unused slots: `Update(ref+"/5:CgJv7", { enabled: false })` (empty-state cards).

## Button hierarchy (per section)

| Priority | Pencil ref | Use |
|----------|------------|-----|
| 1 Primary | `5:VSnC2` | Create trip, create card, main CTA |
| 2 Outline | `5:C10zH` | View details, cancel |
| 3 Ghost | `5:3f2VW` | Nav, chat toggle, inbox toggle |
| 4 Destructive | `5:YKnjc` | Delete card |

One primary per section. Card/modal footers: `justifyContent: "end"`, gap 12.

## Spacing scale

| Context | Gap | Padding |
|---------|-----|---------|
| Screen sections | 24–32 | — |
| Card grid | 16–24 | — |
| Domain component catalog | 24 | — |
| Inside cards | — | 16–24 |
| Header horizontal | — | [16, 48] |
| Prompt bar | 12 | [0, 48, 24, 48] |
| Button groups | 12 | — |
| Form fields | 16 | — |

## Icons

Library: `lucide` (matches `components.json`). Override in component instances via `descendants`:

```javascript
Insert(parent, { type: "ref", ref: "5:hXOUF", descendants: { "iconId": { icon: "globe" } } })
```

Common: `globe`, `plane`, `compass`, `clock`, `circle-check`, `chevron-left`, `sparkles`, `plus`, `x`, `menu`.

## Theme per surface

The mixed visual direction is intentional for the current prototype: Trip List is the dark planning hub, while Trip Canvas stays light for map-like spatial work. Do not normalize these surfaces to one mode unless a dedicated theme-toggle pass changes the design baseline.

| Surface | Pencil theme axes | Page fill |
|---------|-------------------|-----------|
| Landing | Stone + Orange + Light | `$5:--background` |
| Trip List | Stone + Orange + Dark | `$wf-dark-bg` |
| Trip Canvas | Stone + Orange + Light | `$wf-page` |

Set `theme` on screen frames and domain refs — never mix Dark/Light chrome on one screen.

## Floating overlays (Trip Canvas)

Positioned on canvas layer (not in flex flow):

| Overlay | Ref | Position |
|---------|-----|----------|
| Canvas toolbar | `iBYSG` | bottom-left |
| Trip stats | `Hhcao` | top-right |
| AI prompt bar | `m5ldW7` | bottom-center |
| Link banner | `AYtTV` | top-center |
| Day labels | `T1dDGp` | on canvas clusters |

## Pencil assembly checklist

Before marking a desktop screen done:

- [ ] Composed from L2 domain refs (not raw primitives in screens)
- [ ] Theme axes set on screen frame
- [ ] Token variables used — no stray hex on chrome
- [ ] All interactive states documented in surface doc
- [x] `get_screenshot` verified against the shadcn workspace baseline
- [ ] Node ID + name updated in surface doc
