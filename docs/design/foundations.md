# Design foundations

Shared tokens, themes, and the Pencil ↔ code crosswalk for Wayfarer. Surface-specific anatomy lives in [landing-page.md](landing-page.md), [trip-list.md](trip-list.md), and [trip-canvas.md](trip-canvas.md).

## shadcn configuration

| Setting | Value |
|---------|-------|
| Style | `radix-nova` |
| Base color | `stone` |
| Accent | `orange` (via theme / primary) |
| Icons | `lucide-react` |
| CSS | `src/index.css` |
| Components | `src/components/ui/` |

## Semantic tokens (code)

Use in React for generic UI chrome — backgrounds, text, borders, primary actions:

| Token class | CSS variable | Usage |
|-------------|--------------|-------|
| `bg-background` | `--background` | Page |
| `text-foreground` | `--foreground` | Body text |
| `text-muted-foreground` | `--muted-foreground` | Secondary text |
| `bg-card` | `--card` | Surfaces |
| `border-border` | `--border` | Dividers |
| `bg-primary` | `--primary` | Brand actions |
| `text-primary` | `--primary` | Brand text accents |

Light tokens: `:root` in `src/index.css`. Dark tokens: `.dark` class (Trip List).

## Pencil token namespaces

| Namespace | Where used | Examples |
|-----------|------------|----------|
| `$5:--*` | shadcn import theme | `$5:--background`, `$5:--primary`, `$5:--border` |
| `$wf-*` | Pencil aliases for Wayfarer workspace light surfaces | `$wf-page`, `$wf-surface`, `$wf-canvas`, `$wf-border-warm` |
| `wf-dark-*` | Pencil aliases for Trip List dark surfaces | `wf-dark-bg`, `wf-dark-surface`, `wf-dark-border` |

### Workspace paper tokens (`wf-*` — Pencil aliases)

| Variable | Value | Usage |
|----------|-------|-------|
| `wf-page` | `#faf9f7` | Workspace page background |
| `wf-surface` | `#fefcf8` | Cards, header, inbox, toolbars |
| `wf-border-warm` | `#e7e3dc` | Warm borders on light workspace |
| `wf-muted-fill` | `#f5f3ef` | Inactive pills, processed inbox |
| `wf-brand-dark` | `#92400e` | Brand actions (canvas primary) |
| `wf-canvas` | `#f5f5f5` | Canvas dot-grid base |
| `wf-grid-dot` | `#d6d3d1` | Connection endpoint dots |

Pencil theme axes: `5:Base` (Stone), `5:Accent` (Orange), `5:Mode` (Light / Dark).

## Theme surfaces

The current prototype intentionally mixes surface modes: Landing and Trip Workspace use light Stone/Orange foundations, while Trip List uses a dark Stone/Orange hub. Treat this as the current design baseline and preserve it until full light/dark theme toggle support is designed.

| Surface | Pencil theme | Code approach |
|---------|--------------|---------------|
| Landing | Light | `:root` semantic tokens |
| Trip List | Dark | `.dark` semantic tokens |
| Trip Canvas | Light workspace | `:root` semantic tokens + canvas-specific utilities |

### Dark trip list (`wf-dark-*`)

| Token | Value | Usage |
|-------|-------|-------|
| `wf-dark-bg` | `#0c0a09` | Page |
| `wf-dark-surface` | `#1c1917` | Cards, bubbles |
| `wf-dark-border` | `#ffffff0f` | Borders |

## Domain accents (intentional non-token colors)

Day clusters, sticky notes, canvas tags — keep consistent across Landing, Canvas, and code:

| Semantic | Tailwind family | Used for |
|----------|-----------------|----------|
| Day 1 / tips | amber | Arrival, sticky highlights |
| Day 2 | orange | Mid-trip |
| Day 3 | emerald | Nature / Arashiyama |
| Day 4 / stay | rose | Gion, evening |

Do not use these for generic nav, buttons, or standard cards.

## Typography

| Role | Font | Code |
|------|------|------|
| UI / body | Inter | `font-sans`, body default |
| Headings (marketing) | Lora | `font-serif` on `h1`/`h2` |

## Primitive crosswalk (summary)

Full table: [CROSSWALK.md](CROSSWALK.md)

| Pencil | shadcn | Typical use |
|--------|--------|-------------|
| `5:VSnC2` Button/Default | `button` default | CTAs |
| `5:C10zH` Button/Outline | `button` outline | Secondary actions |
| `5:3f2VW` Button/Ghost | `button` ghost | Nav, toggles |
| `5:WuUMk` Badge/Secondary | `badge` secondary | Status pills |
| `5:3IiAS` Badge/Outline | `badge` outline | Suggestion chips |
| `5:pcGlv` Card | `card` | Content containers |
| `5:fEUdI` Input/Default | `input` | Forms, prompt bar |
| `5:X6bmd` Modal/Center | `dialog` | New trip, create card |

## Design System frames (Pencil)

Each layer is a **separate top-level frame** — not one scrolling page.

| Frame | ID | Layer | Contents |
|-------|-----|-------|----------|
| `Wayfarer / DS / 01 Foundations` | `wlrYF` | L0 | Token swatches |
| `Wayfarer / DS / 02 Primitives` | `T3K9M3` | L1 | shadcn Button, badge, card, tab catalog |
| `Wayfarer / DS / 03 Patterns` | `sin7M` | L1½ | Layout patterns A–E |
| `Wayfarer / DS / 04 Components / Shared` | `TDnCG` | L2 | Brand mark variants |
| `Wayfarer / DS / 05 Components / Trip List` | `x76EWb` | L2 | Chrome · Cards |
| `Wayfarer / DS / 06 Components / Trip Canvas` | `g967C` | L2 | Chrome · Inbox · Canvas Cards · Schedule · Map · Panels · Map Route catalog |
| `Wayfarer / DS / 07 Components / Landing` | `ApHdO` | L2 | Landing-specific reusables (populate as v2 stabilizes) |

Layout patterns: [patterns.md](patterns.md) · File map: [README.md](README.md)

## Custom CSS utilities

Landing and canvas-specific — `src/index.css`:

| Class | Role |
|-------|------|
| `canvas-bg` | Dot-grid canvas background |
| `polaroid-shadow` | Card elevation |
| `sticky-shadow` | Sticky notes |
| `ink-line` | Connection lines |
| `font-serif` | Lora headings |
