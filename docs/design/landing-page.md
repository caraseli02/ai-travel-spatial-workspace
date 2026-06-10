# Landing Page — design reference

Marketing surface at route `/`. Introduces Wayfarer, demonstrates the inbox → canvas flow with a live typing animation, and routes travelers into the Demo Trip via **Try demo** / **Start planning free** CTAs.

## Design source

| Artifact | Location |
|----------|----------|
| Pencil design | `pencil-shadcn.pen` → **Desktop** `scbFm` · **Mobile** `LWbNo` ([README.md](README.md)) |
| Theme tokens | `src/index.css` — Stone base + Orange accent, aligned with the Pencil file |
| Layout patterns | **A** header + content, marketing sections ([patterns.md](patterns.md)) |
| shadcn config | `components.json` — style `radix-nova`, base color `stone`, icons `lucide` |
| Implementation | `src/components/LandingPage.tsx`, `src/components/PricingSection.tsx` |

Migration was done in vertical slices (PRs #10–#18): bootstrap shadcn → pricing → nav/hero → canvas tabs → testimonials/before-after → how-it-works/features → live chat preview.

## Pencil screens

### Desktop — `Wayfarer / Desktop / Landing` (`scbFm`)

| Frame | Node ID | Size | Purpose |
|-------|---------|------|---------|
| **Landing — Default** | `s6fLZ` | 1440 × fit | Full marketing page — all sections |

### Mobile — `Wayfarer / Mobile / Landing` (`LWbNo`)

| Frame | Node ID | Size | Purpose |
|-------|---------|------|---------|
| **Landing — Default (390px)** | `qJIYB` | 390 × fit | Status bar; hamburger nav; stacked hero + live chat preview; single-column sections (canvas, pricing, testimonials, CTA) |

## Page sections (top to bottom)

| # | Section | Purpose | Key shadcn / tokens |
|---|---------|---------|---------------------|
| 1 | **Nav** | Logo, anchor links, Sign in, Try demo | `Button` (default, ghost) |
| 2 | **Hero** | Headline, CTAs, live inbox → canvas animation | `Badge`, `Button`, `Card` (chat panel) |
| 3 | **Canvas showcase** | Full-width spatial moodboard preview | `Tabs`, `TabsList`, `TabsTrigger`, `Button` |
| 4 | **Photo strip** | Kyoto destination imagery | Plain markup + `rounded-2xl` |
| 5 | **How it works** | Three-step capture → organize → canvas flow | `Card`, `CardContent` (borderless) |
| 6 | **Before / after** | Pain vs. solution comparison | `Card`, `CardHeader`, `CardTitle`, `CardContent` |
| 7 | **Features** | Copy + 2×3 capability grid | `Card`, `CardContent` |
| 8 | **Pricing** | Explorer / Wanderer / Nomad tiers | `Card`, `Badge`, `Button` — see `PricingSection.tsx` |
| 9 | **Testimonials** | Three social-proof quotes | `Card`, `CardContent` |
| 10 | **CTA** | Final conversion block | `Button` — section uses `dark` class for inverted surface |
| 11 | **Footer** | Legal / social links | Token-based text colors |

## Hero animation (`LiveChatPreview`)

Sub-component at the bottom of `LandingPage.tsx`. State machine driven by `msgIdx`, `charIdx`, `typedText`, `showCanvas`:

1. Types through four `chatMessages` (three user pastes + one AI reply).
2. On completion, fades out the chat panel and reveals a mini canvas with polaroid cards.
3. Uses `messageBubbleClass()` for user (`bg-muted`) vs AI (`bg-amber-100`) bubbles.
4. Mini canvas reuses domain visuals: `MiniCard`, `StickyMini`, `canvas-bg`, `ink-line` SVG connections.

CTA target: `navigate(\`/trips/${DEMO_TRIP_ID}\`)` — opens the pre-loaded Demo Trip.

## Custom CSS utilities (landing-specific)

Defined in `src/index.css` `@layer utilities` and below:

| Class | Role |
|-------|------|
| `canvas-bg` | Dot-grid background for canvas previews |
| `polaroid-shadow` / `polaroid-shadow-hover` | Card elevation on canvas items |
| `sticky-shadow` | Sticky-note cards |
| `ink-line` | Dashed SVG connection lines |
| `cursor-blink` | Typing indicator in hero chat |
| `canvas-item` | Hover lift on showcase cards |
| `font-serif` | Lora — section headings (`font-serif` on `h1`/`h2`) |

## Domain color accents

Day and category colors are intentional departures from the neutral token palette:

- **Day 1** — amber (`border-amber-200`, `bg-amber-100`, `text-primary`)
- **Day 2** — orange
- **Day 3** — emerald
- **Stay / tips** — rose, amber sticky notes

These mirror Trip Workspace day semantics and should stay consistent when the workspace UI migrates to shadcn.

## Assets

| Path | Used in |
|------|---------|
| `/images/ryokan.jpg` | Hero mini canvas, showcase, photo strip |
| `/images/fushimi-inari.jpg` | Showcase, photo strip, hero |
| `/images/arashiyama.jpg` | Showcase, photo strip, hero |
| `/images/nishiki-market.jpg` | Photo strip |
| `/images/gion.jpg` | Photo strip |
| `/images/kinkakuji.jpg` | Photo strip |

## shadcn components in use

| Component | File | Variants used on landing |
|-----------|------|--------------------------|
| `Button` | `src/components/ui/button.tsx` | `default`, `outline`, `ghost`, `secondary`; sizes `default`, `lg`, `icon-sm` |
| `Card` | `src/components/ui/card.tsx` | Standard + borderless (`border-none shadow-none`) for how-it-works |
| `Badge` | `src/components/ui/badge.tsx` | `outline` (hero badge), `default` (pricing highlight) |
| `Tabs` | `src/components/ui/tabs.tsx` | Canvas day filter pills with per-day `className` overrides |

## Out of scope (current implementation)

- Nav anchor links (`#`) are placeholders — no scroll-to-section behavior yet.
- Sign in, walkthrough video, early access, and pricing CTAs are non-functional UI.
- Photo strip is static (no marquee animation despite CSS keyframes existing).
- Trip Workspace UI has not been migrated to shadcn — see ADR-0003.
