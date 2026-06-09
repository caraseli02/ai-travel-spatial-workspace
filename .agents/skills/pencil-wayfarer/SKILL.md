---
name: pencil-wayfarer
description: Wayfarer Pencil (.pen) design workflow — layered design system, separate desktop/mobile pages, shadcn crosswalk, and code sync. Use when updating pencil-shadcn.pen, adding screens or mobile variants, composing Wayfarer components, or implementing designs to React.
---

# Pencil Wayfarer

## Before any Pencil work

1. `get_editor_state({ include_schema: true })` on `pencil-shadcn.pen`
2. Open **Wayfarer / Index** (`d3HbiR`) for the file map
3. Load guides as needed (Design System, Web App, Mobile App, Code)
4. Read `docs/design/README.md`, [patterns.md](../../docs/design/patterns.md), and the surface doc

Never use Read/Grep on `.pen` files — Pencil MCP only.

## File structure (strict)

**14 top-level frames.** Never merge desktop + mobile in one parent.

| Group | Frames |
|-------|--------|
| Index | `Wayfarer / Index` |
| Design system | `DS / 01` … `DS / 06` (one layer per frame) |
| Desktop | `Desktop / Landing`, `Desktop / Trip List`, `Desktop / Trip Canvas` |
| Mobile | `Mobile / Landing`, `Mobile / Trip List`, `Mobile / Trip Canvas` |
| Archive | `Wayfarer / Archive` — ignore |

Each screen page: **Cover** (route, breakpoint, theme) + **Screens** (state frames, 80px gap).

Domain components in `DS / 05–06` are grouped: **Chrome** | **Cards** (trip list) or **Chrome** | **Inbox** | **Canvas Cards** | **Panels & Modals** (canvas).

## Layer rules

| Layer | Location | Rule |
|-------|----------|------|
| L0 | `DS / 01` | Tokens only |
| L1 | `DS / 02–03` | shadcn `5:*` refs |
| L1½ | `DS / 04` | Layout patterns A–E |
| L2 | `DS / 05–06` | `Wayfarer / {Name}` — compose L1 only |
| L3 | `Desktop / *` | Domain refs + layout |
| L4 | `Mobile / *` | Separate frames — never under Desktop |

**Never** put screens inside Design System. **Never** mix breakpoints in one top-level frame.

## Workflows

### Add or update a desktop screen state

1. Read surface doc + pick pattern A–E from [PATTERNS.md](PATTERNS.md)
2. Edit the correct `Desktop / {Surface}` frame only
3. Insert state into **Screens** stack; `get_screenshot` after each state
4. Update surface doc with node ID

### Add or update a mobile screen state

1. Edit `Mobile / {Surface}` only — not the desktop frame
2. Load Mobile App guide (390×844, wrapper padding 16–20px)
3. Reuse mobile domain refs (`YeJCA` etc.) where applicable

### Add a domain component

1. Add to `DS / 05` or `DS / 06` in the correct **group** frame
2. Compose from L1 refs ([CROSSWALK.md](CROSSWALK.md))
3. Document in surface doc

### Implement design → code

Pencil **Code** guide + `.cursor/rules/shadcn-ui.mdc`. One component at a time.

## Naming

```
Wayfarer / DS / {NN} {Layer}
Wayfarer / Desktop / {Surface}     → Cover + Screens
Wayfarer / Mobile / {Surface}      → Cover + Screens
{Surface} — {State}                → screen frame (breakpoint in parent Cover)
[TBD] {description}                → mobile placeholder
Wayfarer / {Component}             → domain reusable
```

## References

- Index: `docs/design/README.md`
- Tokens: `docs/design/foundations.md`
- Patterns: [PATTERNS.md](PATTERNS.md)
- Crosswalk: [CROSSWALK.md](CROSSWALK.md)
- ADR: `docs/adr/0003-shadcn-ui-foundation.md`
