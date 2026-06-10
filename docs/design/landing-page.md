# Landing Page — design reference

Marketing surface at route `/`. Introduces Wayfarer with a prompt-style hero, product window (Spatial Canvas preview), feature blocks for Trip List and AI Inbox, and routes travelers into the Demo Trip via **Start planning** / **Try the demo trip** CTAs.

## Design source

| Artifact | Location |
|----------|----------|
| Pencil design | `pencil-shadcn.pen` → **Desktop v2** `elmGx` · **Mobile** `LWbNo` ([README.md](README.md)) |
| Theme tokens | `src/index.css` — Stone base + Orange accent, aligned with the Pencil file |
| Layout patterns | **A** header + content, marketing sections ([patterns.md](patterns.md)) |
| shadcn config | `components.json` — style `radix-nova`, base color `stone`, icons `lucide` |
| Implementation | `src/components/LandingPage.tsx`, `src/components/PricingSection.tsx` |

**Canonical:** Desktop v2 (`elmGx` / `nNgwc`) and Mobile (`LWbNo` / `qJIYB`). Legacy v1 desktop frame `scbFm` is archived — do not extend.

## Pencil screens

### Desktop v2 — `Wayfarer / Desktop / Landing 2` (`elmGx`)

Layla-inspired redesign that leads with actual product surfaces (Trip Canvas + Trip List) instead of marketing illustration. Reuses domain components and shadcn primitives. Single state frame **Landing — Default** (`nNgwc`).

| Section | Node ID | Notes |
|---------|---------|-------|
| Nav | `B5yiQE` | Brand mark + links + Sign in / Start planning |
| Hero | `Q9LGRQ` | Serif headline, prompt-style CTA, framed Trip Canvas product window (`KpRBX`) |
| Trust strip | `XN5G4` | Destination chips |
| How it works | `dLWnk` | Capture → Organize → See it spatially (3 cards) |
| Feature · Spatial Canvas | `QXGGW` | Text + mini canvas cluster |
| Feature · Trip List hub | `uE5IT` | **Dark** band, 3 varied `GK0nB` trip cards + filter pills |
| Feature · AI Inbox | `YVHwW` | Inbox mock (prompt + auto-sorted items) + text |
| Pricing | `J5vsVD` | Explorer / Wanderer (popular) / Nomad |
| Testimonials | `ziFcR` | 3 quote cards |
| CTA | `h4buV` | Warm gradient panel (`nMtUb`) |
| Footer | `oAIjW` | Dark, brand + link columns |

### Mobile — `Wayfarer / Mobile / Landing` (`LWbNo`)

| Frame | Node ID | Size | Purpose |
|-------|---------|------|---------|
| **Landing — Default (390px)** | `qJIYB` | 390 × fit | v2 mobile layout — stacked hero, 2×3 trust chips, vertical canvas cards, 2×2 filter pills, AI Inbox copy before mock, stacked footer |

### Legacy (v1) — `Wayfarer / Desktop / Landing` (`scbFm`)

| Frame | Node ID | Notes |
|-------|---------|-------|
| **Landing — Default** | `s6fLZ` | v1 — live chat hero, photo strip, before/after, features grid. **Do not extend.** |

## Page sections (top to bottom)

| # | Section | Purpose | Key shadcn / tokens |
|---|---------|---------|---------------------|
| 1 | **Nav** | Logo, anchor links, Sign in, Start planning | `Button` (default, ghost) |
| 2 | **Hero** | Eyebrow, serif headline, prompt CTA, social proof, product window | `Badge`, `Button`, `Card` |
| 3 | **Trust strip** | Destination chips (2×3 wrap on mobile) | Plain markup + `rounded-full` borders |
| 4 | **How it works** | Capture → AI organize → See spatially | `Card`, `CardContent` |
| 5 | **Feature · Spatial Canvas** | Copy + bullets + mini canvas visual | `Button`, domain card mocks |
| 6 | **Feature · Trip List** | Dark band, filter pills, preview trip cards | `Card`, `Badge` |
| 7 | **Feature · AI Inbox** | Inbox mock + copy (mobile: text before mock) | `Card`, `Badge`, `Button` |
| 8 | **Pricing** | Explorer / Wanderer / Nomad tiers | `Card`, `Badge`, `Button` — see `PricingSection.tsx` |
| 9 | **Testimonials** | Mara L., Daniel & Priya, Tomás R. | `Card`, `CardContent` |
| 10 | **CTA** | Orange gradient panel, dual buttons | `Button` |
| 11 | **Footer** | Brand, link columns, copyright, social | Token-based text colors |

## Mobile-responsive patterns

| Pattern | Mobile treatment |
|---------|------------------|
| Prompt CTA | Stacked: input row + **full-width** primary button |
| Trust chips | 2×3 wrapped grid |
| Canvas previews | **Vertical stack** of domain cards — no absolute overlapping layout |
| Trip filters | 2×2 equal-width pill grid |
| Feature sections | Single column; copy before visual on AI Inbox |
| Footer | Stacked link groups |
| Section padding | ~`px-4` / `py-10` mobile; scale up at `md:` |
| Typography | Headlines ~26–32px mobile; body 15–16px |

## Custom CSS utilities (landing-specific)

Defined in `src/index.css` `@layer utilities`:

| Class | Role |
|-------|------|
| `canvas-bg` | Dot-grid background for canvas previews |
| `polaroid-shadow` / `polaroid-shadow-hover` | Card elevation on canvas items |
| `sticky-shadow` | Sticky-note cards |
| `ink-line` | Dashed SVG connection lines |
| `font-serif` | Lora — section headings |

## Domain color accents

Day and category colors mirror Trip Workspace semantics:

- **Day 1** — amber
- **Day 2** — orange
- **Day 3** — emerald
- **Stay / tips** — rose, amber sticky notes

## Assets

| Path | Used in |
|------|---------|
| `/images/ryokan.jpg` | Hero product window, spatial canvas feature |
| `/images/fushimi-inari.jpg` | Hero, spatial canvas, Kyoto trip card |
| `/images/arashiyama.jpg` | Hero, Iceland trip card preview |
| `/images/nishiki-market.jpg` | Hero product window article card |
| `/images/gion.jpg` | Lisbon trip card preview |

## shadcn components in use

| Component | File | Variants used on landing |
|-----------|------|--------------------------|
| `Button` | `src/components/ui/button.tsx` | `default`, `outline`, `ghost`; sizes `default`, `lg`, `icon` |
| `Card` | `src/components/ui/card.tsx` | Standard + feature / testimonial cards |
| `Badge` | `src/components/ui/badge.tsx` | `outline` (hero, inbox), `default`, `secondary` |

CTA target: `navigate(\`/trips/${DEMO_TRIP_ID}\`)` — opens the pre-loaded Demo Trip.

## Out of scope (current implementation)

- Nav anchor links scroll to section IDs but Sign in and pricing CTAs remain placeholder UI.
- Trip Workspace UI has not been migrated to shadcn — see ADR-0003.
