# shadcn/ui as the UI component foundation

We adopted [shadcn/ui](https://ui.shadcn.com/) (Radix Nova style, Stone base + Orange accent) as the shared component layer for marketing and app surfaces, rather than continuing with one-off Tailwind markup for every interactive element.

The Landing Page was designed first in Pencil (`pencil-shadcn.pen`) and then implemented section-by-section using shadcn primitives (`Button`, `Card`, `Badge`, `Tabs`) backed by CSS variable tokens in `src/index.css`. The same foundation covers the Trip List and Trip Workspace, so Pencil is the versioned design source and shadcn/ui is the shared implementation baseline for Wayfarer surfaces.

## Considered Options

- **Raw Tailwind only**: Zero dependency overhead, but every button, card, and tab reinvents focus rings, variants, and accessibility. The landing page alone had dozens of duplicated patterns.
- **Full component library (e.g. MUI, Chakra)**: Faster initial scaffolding, but opinionated styling that fights the warm paper/canvas aesthetic and adds bundle weight we do not need in a prototype.
- **shadcn/ui (chosen)**: Copy-paste components with Radix primitives underneath. Matches our Tailwind + Vite stack, aligns with the Pencil token set, and scales to Trip List / Trip Workspace without a separate design system fork.

## Consequences

- **Theme tokens are the source of truth.** Layout and typography use semantic classes (`bg-background`, `text-muted-foreground`, `border-border`, `text-primary`) defined in `src/index.css`. Hardcoded stone/amber classes are reserved for domain-specific accents (day colors, canvas cards) — not for generic UI chrome.
- **New interactive UI should compose shadcn primitives** from `src/components/ui/` before writing custom markup. Add components via the shadcn CLI (`npx shadcn@latest add <component>`) when a primitive is missing.
- **Landing Page, Trip List, and Trip Workspace share the same foundation.** `LandingPage.tsx`, `PricingSection.tsx`, `TripListPage.tsx`, `TripCard.tsx`, `TripWorkspace.tsx`, `InboxPanel.tsx`, `CanvasCards.tsx`, and `CardDetailPanel.tsx` should continue using the shared token and primitive layer rather than reintroducing one-off UI chrome.
- **Lock-in is moderate.** Components are owned source files, not an npm black box. Swapping away later means replacing `src/components/ui/` and token definitions, not rewriting every import site at once.
