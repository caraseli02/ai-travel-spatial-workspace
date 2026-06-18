---
name: pencil-design
description: Design UIs in Pencil (.pen) + generate production code. Use for .pen files, Pencil MCP, design-to-code, UI design in Pencil.
metadata:
  author: Nyasha Chiroro
  version: "1.0"
---

# Pencil Design Skill

Design production UIs in Pencil. Generate clean code. Enforce DS reuse, tokens, layout, visual verify, design-to-code.

## When to Use This Skill

- Screens, pages, components in `.pen` file
- Code from Pencil (React, Next.js, Vue, Svelte, HTML/CSS)
- Build/extend design system in Pencil
- Sync tokens Pencil ↔ code (Tailwind v4 `@theme`, shadcn/ui)
- Import code into Pencil
- Any Pencil MCP (`pencil_batch_design`, `pencil_batch_get`, etc.)

## Critical Rules

Common agent mistakes. Break rules → inconsistent design, bad code.

### Rule 1: Always Reuse Design System Components

**NEVER recreate component when one exists.**

Before insert:
1. `pencil_batch_get` with `patterns: [{ reusable: true }]` — list reusables
2. Find match (button, card, input, nav, etc.)
3. Insert as `ref`: `I(parent, { type: "ref", ref: "<componentId>" })`
4. Customize descendants: `U(instanceId + "/childId", { ... })`
5. New component only if no match

See [references/design-system-components.md](references/design-system-components.md).

### Rule 2: Always Use Variables Instead of Hardcoded Values

**NEVER hardcode color, radius, spacing, typography when variables exist.**

Before style:
1. `pencil_get_variables` — read tokens
2. Map to variables (`primary` not `#3b82f6`, `radius-md` not `6`)
3. Apply variable refs, not raw values
4. Code: Tailwind v4 semantic classes (`bg-primary`, `text-foreground`, `rounded-md`). NEVER arbitrary (`bg-[#3b82f6]`, `text-[var(--primary)]`, `rounded-[6px]`)

See [references/variables-and-tokens.md](references/variables-and-tokens.md).

### Rule 3: Prevent Text and Content Overflow

**NEVER let text/children overflow parent or artboard.**

Every text + container:
1. Wrap + truncate text
2. Constrain width to parent — mobile ~375px
3. `"fill_container"` width on text in auto-layout frames
4. After insert: `pencil_snapshot_layout` with `problemsOnly: true`
5. Fix issues before continue

See [references/layout-and-text-overflow.md](references/layout-and-text-overflow.md).

### Rule 4: Visually Verify Every Section

**NEVER skip visual verify after section/screen.**

After each section (header, hero, sidebar, form, card grid, etc.):
1. `pencil_get_screenshot` on section or full screen
2. Check screenshot: alignment, spacing, overflow, glitches, missing content
3. `pencil_snapshot_layout(problemsOnly: true)` — clip/overlap
4. Fix before next section
5. Final full-screen screenshot when done

See [references/visual-verification.md](references/visual-verification.md).

### Rule 5: Reuse Existing Assets (Logos, Icons, Images)

**NEVER generate new logo or duplicate asset in document.**

Before generate image/logo:
1. `pencil_batch_get` — search `patterns: [{ name: "logo|brand|icon" }]`
2. Match elsewhere → copy with `C()` (Copy)
3. `G()` (Generate) only for genuinely new images
4. Logos: always copy existing instance, never regenerate

See [references/asset-reuse.md](references/asset-reuse.md).

### Rule 6: Always Load the `frontend-design` Skill

**NEVER design in Pencil or codegen without `frontend-design` skill first.**

`frontend-design` = aesthetic direction, anti-generic UI. MUST:
1. Load at start of any Pencil design or codegen task
2. Design thinking: purpose, bold aesthetic, differentiation
3. Apply typography, color, motion, spatial composition, visual detail — Pencil + codegen
4. No generic AI aesthetics (overused fonts, cliché palettes, predictable layouts)

Both directions:
- **Pencil design**: skill guides layout, type, color, composition in `.pen`
- **Codegen from Pencil**: distinctive type, intentional color, motion, polish — not mechanical tree dump

## Design Workflow

### Starting a New Design

```
0. Load `frontend-design` skill   -> Get aesthetic direction and design quality standards
1. pencil_get_editor_state        -> Understand file state, get schema
2. pencil_batch_get (reusable)    -> Discover design system components
3. pencil_get_variables           -> Read design tokens
4. pencil_get_guidelines          -> Get relevant design rules
5. pencil_get_style_guide_tags    -> (optional) Get style inspiration
6. pencil_get_style_guide         -> (optional) Apply style direction
7. pencil_find_empty_space_on_canvas -> Find space for new screen
8. pencil_batch_design            -> Build the design (section by section)
9. pencil_get_screenshot          -> Verify each section visually
10. pencil_snapshot_layout        -> Check for layout problems
```

### Building Section by Section

Each screen section (header, content, footer, sidebar, etc.):

1. **Plan** — which DS components to reuse
2. **Build** — `ref` instances + variables
3. **Verify** — screenshot + layout problems
4. **Fix** — overflow, alignment, spacing
5. **Proceed** — next section only after verify passes

### Design-to-Code Workflow

[references/design-to-code-workflow.md](references/design-to-code-workflow.md) — full workflow.
[references/tailwind-shadcn-mapping.md](references/tailwind-shadcn-mapping.md) — Pencil→Tailwind table.
[references/responsive-breakpoints.md](references/responsive-breakpoints.md) — multi-artboard codegen.

Summary:
1. Load `frontend-design`
2. `pencil_get_guidelines` topics `"code"` + `"tailwind"`
3. `pencil_get_variables` → Tailwind `@theme`
4. `pencil_batch_get` — design tree
5. Map Pencil reusables → shadcn/ui (Button, Card, Input, etc.)
6. Semantic Tailwind (`bg-primary`, `rounded-md`) — no arbitrary values
7. `frontend-design`: distinctive type, color, motion, composition
8. CVA variants, `cn()` merge, Lucide icons

## MCP Tool Quick Reference

| Tool | When to Use |
|------|-------------|
| `pencil_get_editor_state` | First call - understand file state and get .pen schema |
| `pencil_batch_get` | Read nodes, search for components (`reusable: true`), inspect structure |
| `pencil_batch_design` | Insert, copy, update, replace, move, delete elements; generate images |
| `pencil_get_variables` | Read design tokens (colors, radius, spacing, fonts) |
| `pencil_set_variables` | Create or update design tokens |
| `pencil_get_screenshot` | Visual verification of any node |
| `pencil_snapshot_layout` | Detect clipping, overflow, overlapping elements |
| `pencil_get_guidelines` | Get design rules for: `code`, `table`, `tailwind`, `landing-page`, `design-system` |
| `pencil_find_empty_space_on_canvas` | Find space for new screens/frames |
| `pencil_get_style_guide_tags` | Browse available style directions |
| `pencil_get_style_guide` | Get specific style inspiration |
| `pencil_search_all_unique_properties` | Audit property values across the document |
| `pencil_replace_all_matching_properties` | Bulk update properties (e.g., swap colors) |
| `pencil_open_document` | Open a .pen file or create a new document |

## Common Mistakes to Avoid

| Mistake | Correct Approach |
|---------|-----------------|
| Creating a button from scratch | Search for existing button component, insert as `ref` |
| Using `fill: "#3b82f6"` | Use the variable: reference `primary` or the corresponding variable |
| Using `cornerRadius: 8` | Use the variable: reference `radius-md` or the corresponding variable |
| Generating `bg-[#3b82f6]` in code | Use semantic Tailwind class: `bg-primary` |
| Generating `text-[var(--primary)]` in code | Use semantic Tailwind class: `text-primary` |
| Generating `rounded-[6px]` in code | Use semantic Tailwind class: `rounded-md` |
| Using `var(--primary)` in className | Use semantic Tailwind class: `bg-primary` or `text-primary` |
| Not checking for overflow | Call `pencil_snapshot_layout(problemsOnly: true)` after every section |
| Skipping screenshots | Call `pencil_get_screenshot` after every section |
| Generating a new logo | Copy existing logo from another artboard with `C()` |
| Building entire screen, then checking | Build and verify section by section |
| Ignoring `pencil_get_guidelines` | Always call it for the relevant topic before starting |
| Using `tailwind.config.ts` | Use CSS `@theme` block (Tailwind v4) |
| Using Material Icons in code | Map to Lucide icons (`<Search />`, `<ArrowRight />`, etc.) |
| Skipping `frontend-design` skill | Always load it before designing in Pencil or generating code |
| Generic AI aesthetics (Inter font, purple gradients) | Follow `frontend-design` guidelines for distinctive, intentional design |

## Resources

- [Pencil Docs](https://docs.pencil.dev)
- [Pencil Prompt Gallery](https://www.pencil.dev/prompts)
- [Design as Code](https://docs.pencil.dev/core-concepts/design-as-code)
- [Variables](https://docs.pencil.dev/core-concepts/variables)
- [Components](https://docs.pencil.dev/core-concepts/components)
- [Design to Code](https://docs.pencil.dev/design-and-code/design-to-code)
- [Styles and UI Kits](https://docs.pencil.dev/design-and-code/styles-and-ui-kits)
