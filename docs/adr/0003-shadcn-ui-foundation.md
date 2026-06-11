# shadcn/ui as the UI component foundation

We adopted [shadcn/ui](https://ui.shadcn.com/) (Radix Nova style, Stone base + Orange accent) as the shared component layer for marketing and app surfaces, rather than continuing with one-off Tailwind markup for every interactive element.

The Landing Page was designed first in Pencil (`pencil-shadcn.pen`) and then implemented section-by-section using shadcn primitives (`Button`, `Card`, `Badge`, `Tabs`) backed by CSS variable tokens in `src/index.css`. This gives us accessible, consistent controls without a heavyweight component library, and keeps styling portable — components live in the repo and can be customized.

## Considered Options

- **Raw Tailwind only**: Zero dependency overhead, but every button, card, and tab reinvents focus rings, variants, and accessibility. The landing page alone had dozens of duplicated patterns.
- **Full component library (e.g. MUI, Chakra)**: Faster initial scaffolding, but opinionated styling that fights the warm paper/canvas aesthetic and adds bundle weight we do not need in a prototype.
- **shadcn/ui (chosen)**: Copy-paste components with Radix primitives underneath. Matches our Tailwind + Vite stack, aligns with the Pencil token set, and scales to Trip List / Trip Workspace without a separate design system fork.

## Consequences

- **Theme tokens are the source of truth.** Layout and typography use semantic classes (`bg-background`, `text-muted-foreground`, `border-border`, `text-primary`) defined in `src/index.css`. Hardcoded stone/amber classes are reserved for domain-specific accents (day colors, canvas cards) — not for generic UI chrome.
- **New interactive UI should compose shadcn primitives** from `src/components/ui/` before writing custom markup. Add components via the shadcn CLI (`npx shadcn@latest add <component>`) when a primitive is missing.
- **Landing Page is fully migrated; Trip Workspace is not.** `LandingPage.tsx` and `PricingSection.tsx` use shadcn. The Trip Workspace still uses legacy patterns — future workspace UI work should migrate incrementally, not introduce a third style.
- **Lock-in is moderate.** Components are owned source files, not an npm black box. Swapping away later means replacing `src/components/ui/` and token definitions, not rewriting every import site at once.
