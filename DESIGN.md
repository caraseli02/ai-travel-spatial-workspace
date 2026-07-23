---
name: Wayfarer
description: Travel sketchbook UI — easy spatial planning with Warm Ember accents
colors:
  warm-ember: "oklch(0.553 0.145 55.5)"
  warm-ember-foreground: "oklch(0.985 0 0)"
  sketchbook-cream: "oklch(0.988 0.002 95)"
  card-paper: "oklch(0.991 0.003 95)"
  ink-stone: "oklch(0.216 0.006 56)"
  muted-stone: "oklch(0.553 0.013 58)"
  quiet-wash: "oklch(0.966 0.005 90)"
  hairline-border: "oklch(0.914 0.008 85)"
  destructive: "oklch(0.577 0.245 27.325)"
  canvas-dot-base: "#f5f3ef"
  canvas-dot: "#d6cfc3"
  workspace-paper: "#fefcf8"
  brand-dark: "#92400e"
  trip-list-bg: "#0c0a09"
  trip-list-surface: "#1c1917"
typography:
  display:
    fontFamily: "Lora, Georgia, serif"
    fontSize: "clamp(2rem, 5vw, 4rem)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "normal"
  headline:
    fontFamily: "Lora, Georgia, serif"
    fontSize: "clamp(1.625rem, 3vw, 2.625rem)"
    fontWeight: 600
    lineHeight: 1.15
  title:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.35
  body:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.03em"
rounded:
  sm: "calc(0.75rem * 0.6)"
  md: "calc(0.75rem * 0.8)"
  lg: "0.75rem"
  xl: "calc(0.75rem * 1.4)"
  full: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.warm-ember}"
    textColor: "{colors.warm-ember-foreground}"
    rounded: "{rounded.lg}"
    padding: "8px 14px"
    height: "36px"
  button-primary-hover:
    backgroundColor: "color-mix(in oklch, oklch(0.553 0.145 55.5) 80%, transparent)"
    textColor: "{colors.warm-ember-foreground}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.muted-stone}"
    rounded: "{rounded.lg}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.warm-ember}"
    rounded: "{rounded.lg}"
    padding: "8px 14px"
  input-default:
    backgroundColor: "transparent"
    textColor: "{colors.ink-stone}"
    rounded: "{rounded.lg}"
    padding: "4px 10px"
    height: "32px"
  card-default:
    backgroundColor: "{colors.card-paper}"
    textColor: "{colors.ink-stone}"
    rounded: "{rounded.xl}"
    padding: "16px"
  chip-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-stone}"
    rounded: "{rounded.full}"
    padding: "3px 10px"
  chip-ghost-active:
    backgroundColor: "transparent"
    textColor: "{colors.warm-ember}"
    rounded: "{rounded.full}"
    padding: "3px 10px"
---

# Design System: Wayfarer

## Overview

**Creative North Star: "The Travel Sketchbook"**

Wayfarer’s interface should feel like opening a well-made sketchbook: warm paper, clear ink, and trip cards you can rearrange — not a dense SaaS dashboard. The product promise is easy and simple; every screen should save time by making the next action obvious and the trip structure visible at a glance.

Personality is calm and tactile. Marketing headlines use Lora; tools and chrome stay in Inter. Warm Ember marks decisive actions and active filters, then gets out of the way. Depth is reserved for content that matters (trip cards, canvas objects); page chrome stays ghost-flat so nothing competes for attention.

Confirmed visual rejections: purple-gradient SaaS themes, heavy multi-layer shadows on filters/CTAs/toolbars, and cool “gallery stone” pages that mute the sketchbook metaphor.

**Key Characteristics:**
- Warm paper surfaces with Stone neutrals and a single Warm Ember accent
- Lora for marketing display; Inter for UI and body
- Soft lift on content cards only; ghost chrome for filters and secondary actions
- Light Landing + Trip Workspace; intentional dark Trip List hub
- Domain day accents (amber / orange / emerald / rose) only on canvas semantics — never on generic chrome

## Colors

A warm stone field with one ember accent — rare, decisive, never decorative wallpaper.

### Primary
- **Warm Ember** (`oklch(0.553 0.145 55.5)` / `--primary`): Primary actions, active ghost-filter outlines, focus rings, and brand emphasis. Keep coverage low so it reads as “do this.”

### Neutral
- **Sketchbook Cream** (`oklch(0.988 0.002 95)` / `--background`): Default light page field for Landing and Trip Workspace.
- **Card Paper** (`oklch(0.991 0.003 95)` / `--card`): Elevated content surfaces and cards.
- **Workspace Paper** (`#fefcf8`): Fine paper utility on workspace sheets (`paper-texture`).
- **Ink Stone** (`oklch(0.216 0.006 56)` / `--foreground`): Primary text and icon ink.
- **Muted Stone** (`oklch(0.553 0.013 58)` / `--muted-foreground`): Secondary copy and quiet labels.
- **Quiet Wash** (`oklch(0.966 0.005 90)` / `--muted` / `--secondary`): Soft fills for tonal chrome, not shadows.
- **Hairline Border** (`oklch(0.914 0.008 85)` / `--border`): Default dividers and outline controls.
- **Canvas Dot Base / Dot** (`#f5f3ef` / `#d6cfc3`): Spatial Canvas grid (`canvas-bg`).
- **Trip List Night** (`#0c0a09` / `#1c1917`): Dark hub page and surfaces (`.dark` Trip List).

### Named Rules
**The Warm Ember Rarity Rule.** Warm Ember appears on primary actions and active states only — roughly ≤10% of any screen. If the page feels orange, remove accent until the content is quiet again.

**The Domain Accent Fence.** Amber / orange / emerald / rose day-cluster colors belong on Spatial Canvas semantics (days, tips, sticky notes). Never use them for nav, generic buttons, or standard cards.

## Typography

**Display Font:** Lora (with Georgia)
**Body Font:** Inter (with system sans)
**Label/Mono Font:** Inter (no separate mono requirement)

**Character:** Editorial serif for the promise; utilitarian sans for the work. The pairing should feel easy and human, never loud.

### Hierarchy
- **Display** (600, clamp ~32–64px, ~1.05): Landing and major marketing headlines only (`font-serif`).
- **Headline** (600, clamp ~26–42px, tight): Section titles on marketing surfaces.
- **Title** (500, ~16px): Card titles, panel headers, dense UI headings (`font-heading` / Inter medium).
- **Body** (400, ~15px, ~1.6): Supporting copy; keep lines readable (~65ch where prose runs long).
- **Label** (500, ~11–12px, slight tracking): Chips, meta rows, filter pills, tags.

### Named Rules
**The Serif Spotlight Rule.** Lora is for persuasion and section titles. Do not set dense Operate UI (inbox lists, forms, toolbars) in serif.

## Layout

Light marketing pages use a centered max-width composition (~7xl) with generous vertical rhythm and a product window in the hero. Operate surfaces (Trip List, Trip Workspace) prioritize scanability: sticky/top chrome, filter rows, then a content grid or spatial field.

Spacing follows a tight UI scale (4 / 8 / 16 / 24) with larger marketing gaps (32–56). Mobile stacks sections; filter chips wrap; canvas chrome compresses. Breakpoint practice in code centers on `md` (~768px).

Density goal: simple and time-saving — fewer competing bands, one clear primary action per region.

## Elevation & Depth

Hybrid: **tonal layering for chrome**, **soft lift for content cards**. Filters, toolbars, and buttons stay flat (border / ghost / solid fill only). Trip cards and polaroid-like objects use soft dual-layer shadows so the sketchbook contents feel graspable without floating the whole UI.

### Shadow Vocabulary
- **Card lift** (`0 2px 4px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08)` / `polaroid-shadow`): Default elevation for trip cards and signature content cards.
- **Card lift hover** (`0 4px 8px rgba(0,0,0,0.08), 0 16px 40px rgba(0,0,0,0.14)` / `polaroid-shadow-hover`): Response on interactive cards only.
- **Sticky note** (`2px 3px 8px rgba(0,0,0,0.1)` / `sticky-shadow`): Canvas sticky affordances.
- **Chrome:** none — no drop shadows on filter bars, ghost pills, outline buttons, or primary solid CTAs.

### Named Rules
**The Cards Own the Lift Rule.** Soft shadows are reserved for content cards (and canvas stickies). If a filter, tab, toolbar, or button casts a shadow, remove it — chrome must not compete with cards for attention.

**The Ghost Chrome Rule.** Filters and secondary actions default to ghost/outline: transparent fill, hairline or Warm Ember stroke when active, zero elevation.

## Shapes

Base radius token `--radius: 0.75rem` with scaled steps (`sm`–`4xl`). Buttons and inputs use gently curved `rounded-lg`; cards use `rounded-xl`; chips/filters use full pills (`999px`). Corners should feel approachable soft — not sharp tooling, not blob-soft.

Borders are hairline Stone; dark Trip List uses translucent white hairlines. Canvas connections use dashed ink lines (`#c4b5a0`), not heavy rules.

## Components

Controls should feel soft and approachable in shape, but quiet in elevation — friendly geometry, ghost chrome, Warm Ember only when decisive.

### Buttons
- **Shape:** Gently curved (`rounded-lg`, ~12px from base radius)
- **Primary:** Warm Ember fill, light foreground text, compact height (~32–36px). Flat — no drop shadow.
- **Outline / Ghost (preferred secondary):** Transparent with hairline or Warm Ember stroke; used for “+ New Trip”-style actions and quiet nav.
- **Hover / Focus:** Opacity/wash shifts; focus-visible uses Warm Ember ring (`ring` / `--ring`). Active may nudge 1px down — never a new shadow stack.

### Chips
- **Style:** Ghost pills by default — transparent, label-sized Inter, hairline when needed.
- **Active:** Warm Ember text + Warm Ember outline (no fill shadow). Unselected stays Ink Stone / muted border.
- **Fence:** Do not elevate filter chips.

### Cards / Containers
- **Corner Style:** Soft XL radius (`rounded-xl`)
- **Background:** Card Paper / workspace paper
- **Shadow Strategy:** Card lift only (see Elevation)
- **Border:** Optional hairline / subtle ring (`ring-foreground/10` on shadcn Card)
- **Internal Padding:** ~12–16px (`--card-spacing`)

### Inputs / Fields
- **Style:** Transparent or quiet wash, hairline border, `rounded-lg`, compact (~32px)
- **Focus:** Warm Ember border + soft ring
- **Prompt CTAs (Landing):** May use fuller pill geometry for the marketing prompt shell; still avoid chrome drop shadows

### Navigation
- Light Landing nav: translucent Sketchbook Cream, bottom hairline, backdrop blur; ghost text links; primary CTA may be Warm Ember or ghost demo entry.
- Dark Trip List hub: Night surfaces, muted labels, Warm Ember for primary create actions — still flat chrome.

### Signature — Trip Card
Content-first list/card object with thumbnail, serif or strong title, meta row, optional favorite. Owns soft polaroid lift. This is the primary attention object on Trip List; surrounding chrome stays ghost-flat.

### Signature — Spatial Canvas
Dot-grid field (`canvas-bg`), polaroid/sticky elevations for objects, dashed ink connections. Day accents only inside canvas semantics.

## Do's and Don'ts

### Do:
- **Do** use Sketchbook Cream pages with Warm Ember for the single clearest action.
- **Do** elevate trip cards (and canvas stickies) with `polaroid-shadow`; keep filters and buttons flat.
- **Do** prefer ghost/outline chrome for filters and secondary CTAs.
- **Do** set marketing headlines in Lora and Operate UI in Inter.
- **Do** preserve light workspace + dark Trip List as the current dual-surface baseline.

### Don't:
- **Don't** put drop shadows on filter bars, pills, toolbars, or buttons — chrome must not compete with cards.
- **Don't** flood screens with Warm Ember or treat day-cluster colors as generic brand chrome.
- **Don't** restyle the system toward purple gradients, cool gallery stone as the default paper, or heavy Material elevation on every surface.
- **Don't** invent testimonials, pricing proof, or live-AI capability in visuals that PRODUCT.md does not support.
- **Don't** set dense tool UI in Lora.
