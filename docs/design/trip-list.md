# Trip List — design reference

Primary app surface at route `/trips`. Dark-themed hub for browsing, filtering, and creating trips. AI prompt bar at the bottom creates trips from natural language; header actions open chat history or the manual New Trip dialog.

## Design source

| Artifact | Location |
|----------|----------|
| Pencil design | `pencil-shadcn.pen` (local Pencil file; not committed) |
| Theme tokens | `src/index.css` — Stone base + Orange accent (`.dark`); Pencil also defines `wf-dark-*` variables |
| shadcn config | `components.json` — style `radix-nova`, base color `stone`, icons `lucide` |
| Implementation | `src/components/TripListPage.tsx`, `src/components/TripCard.tsx` |
| Nav pattern | **Wayfarer / Trip List Header** (`l6uTL`) — composes Brand Mark + `Button/Ghost` + `Button/Default` |
| Filter pattern | **Wayfarer / Trip List Filter Bar** (`ZPaim`) — `Icon Button/Outline` + `Tab Item` + `Badge/Secondary` |
| Prompt pattern | **Wayfarer / Trip List Prompt Bar** (`YK92H`) — `Badge/Outline` chips + `Input/Default` + `Icon Button` |
| Card pattern | **Wayfarer / Trip Card** (`GK0nB`) — `Card` + `Badge` + `Button/Outline` |

Screens live in a dedicated top-level frame **Wayfarer / Trip List** (sibling to **Wayfarer / Screens** / **Wayfarer / Design System**). Landing Page remains under **Wayfarer / Screens** (`s6fLZ`).

## Pencil screens

| Frame | Node ID | Purpose |
|-------|---------|---------|
| **Trip List (1440px)** | `WApFW` | Default populated state — 3-column grid with New Trip card + 2 sample trips |
| **Trip List — Chat Open** | `rkU8h` | Left chat sidebar (380px) with sample user/AI exchange |
| **Trip List — New Trip Dialog** | `rVIzu` | Modal overlay with **Dialog / Modal/Center** (`5:X6bmd`) form |
| **Trip List — Empty** | `IV3cl` | Zero trips — New Trip card + **Plan with AI** helper card |
| **Trip List — No Matches** | `N5RjEK` | Filtered empty — New Trip card + **No matching trips** helper card |

Container: **Wayfarer / Trip List** (`r1rP9w`) → **Screens Container** (`gZ1Fa`, vertical stack, 80px gap). Positioned to the right of **Wayfarer / Screens** (`YdtCx`).

All screens: **1440 × 1024**, theme `Stone` base + `Orange` accent + `Dark` mode.

## Page sections (top to bottom)

| # | Section | Purpose | Key shadcn / tokens |
|---|---------|---------|---------------------|
| 1 | **Header** | Brand mark (back to `/`), Chat toggle, New trip CTA | Ref `l6uTL` → `juOuS`, `5:3f2VW`, `5:VSnC2` |
| 2 | **Filter bar** | Status tabs with counts: All, Upcoming, Ongoing, Planning, Completed | Ref `ZPaim` → `5:hXOUF`, `5:coMmv`, `5:QY0Ka`, `5:WuUMk` |
| 3 | **Trip grid** | 3 columns @ 1440px: dashed New Trip card, two trip samples | Ref `ZQPee` (new trip), `GK0nB` (trip card); status badge via `5:WuUMk` |
| 4 | **Prompt bar** | Suggestion chips + AI input + send | Ref `YK92H` → `5:3IiAS`, `5:fEUdI`, `5:urnwK` |

All section refs live under **Wayfarer / Design System → 04 Trip List** (`Tazid`).

## Trip card anatomy

Mirrors `TripCard.tsx` structure:

| Zone | Content |
|------|---------|
| **Image header** (192px) | Destination photo, gradient overlay, status badge (icon + label), emoji + trip name, country |
| **Meta** | Dates · travelers (2-col), budget row |
| **Activity chips** | Up to 3 tags + overflow; italic “Workspace is empty” when none |
| **Footer** | Full-width `Button/Outline` (`5:C10zH`) — “View Details” |

### Sample trips (design fixtures)

| Trip | Status | Dates | Budget | Activities |
|------|--------|-------|--------|------------|
| 🇯🇵 7 Days in Kyoto | Upcoming | Dec 14–21, 2025 | $3,200 | Fushimi Inari, Arashiyama, Nishiki Market |
| 🇫🇷 Paris Romance | Planning | Flexible | $2,500 | Eiffel Tower, Louvre, Seine cruise |

## Empty states

| State | When | Card content |
|-------|------|--------------|
| **Plan with AI** | `trips.length === 0` | Ref `vCVf6` — `Card` + `Icon Button` + `Badge/Outline` tagline |
| **No matching trips** | Filter active, zero matches, trips exist | Ref `McIXx` — `Card` + `Icon Button/Outline` + `Button/Outline` |

## Chat sidebar (optional frame)

Left panel 380px, `wf-dark-surface` (`#111114`):

- Header: “Chat History”, clear/close actions
- Message list: user bubble (right, muted surface) + AI bubble (left, orange avatar, bordered surface)
- Empty state: MessageSquare icon + “Start a conversation to plan your trips”

## New Trip dialog (optional frame)

Centered **Modal/Center** with dark Stone theme:

| Field | Component |
|-------|-----------|
| Icon | Emoji picker grid (✈️ default selected) |
| Trip Name | `Input Group/Default` |
| Destination | `Input Group/Default` |
| Dates (optional) | Two `Input/Default` fields |
| Submit | `Button/Default` — “Create Trip” |

## Prompt bar

Fixed to bottom of viewport (max-width ~672px centered):

1. **Suggestion chips** — horizontal scroll; four defaults from `TripListPage.tsx`:
   - Plan a 5-day trip to Paris for 2 people
   - Create a beach vacation to Bali
   - Weekend getaway to Tokyo
   - Adventure trip to Iceland
2. **Input row** — orange gradient Sparkles badge, placeholder “Describe your dream trip…”, send icon button
3. **Disclaimer** — “AI can make mistakes. Double-check important details.”

## Dark theme tokens (`wf-dark-*`)

Defined in `pencil-shadcn.pen` variables; align with implementation hardcodes during shadcn migration:

| Token | Value | Usage |
|-------|-------|-------|
| `wf-dark-bg` | `#0c0a09` | Page background |
| `wf-dark-surface` | `#1c1917` | Cards, AI bubbles |
| `wf-dark-border` | `#ffffff0f` | Borders, dividers |
| `wf-dark-surface-hover` | `#ffffff0a` | Hover / inactive chips |
| `wf-dark-filter-active-bg` | `#ffffff0f` | Active filter pill |
| `wf-dark-filter-active-border` | `#ffffff14` | Active filter stroke |
| `wf-dark-ghost-active` | `#ffffff14` | Active ghost button, count badge |

Accent actions use shadcn `5:--primary` (Orange / `#f97316` in dark).

## Status filter semantics

| Tab | Icon | `deriveTripStatus` key |
|-----|------|------------------------|
| All | globe | — (no filter) |
| Upcoming | plane | `upcoming` |
| Ongoing | compass | `ongoing` |
| Planning | clock | `planning` |
| Completed | circle-check | `completed` |

Counts come from `computeStatusCounts()` in `src/utils/tripListHelpers.ts`.

## Assets

| Path | Used in |
|------|---------|
| `/images/kyoto-hero.jpg` | Kyoto trip card (demo trip default) |
| Stock: Kyoto temple | Pencil Kyoto card image fill |
| Stock: Paris Eiffel Tower | Pencil Paris card image fill |

## shadcn components in scope

| Component | File | Variants used on trip list |
|-----------|------|---------------------------|
| `Button` | `src/components/ui/button.tsx` | `default`, `ghost`, `outline` |
| `Badge` | `src/components/ui/badge.tsx` | `outline` (suggestion chips, status could migrate) |
| `Card` | `src/components/ui/card.tsx` | Trip cards, empty states, New Trip dashed card |
| `Dialog` | `src/components/ui/dialog.tsx` | New Trip modal |
| `Input` | `src/components/ui/input.tsx` | Prompt bar, modal fields |

## Out of scope (current implementation)

- Trip list UI still uses hardcoded dark colors (`#0d0d0f`, violet accents) — not yet on shadcn semantic tokens; see ADR-0003.
- Delete confirmation overlay on `TripCard` not drawn in Pencil (interaction state).
- Chat sidebar uses simulated AI delay; no real backend.
- Filter bar icons/counts are not yet shadcn `Tabs` — custom pills in code and design.
- Responsive breakpoints (`@container` grid) simplified to 3-column desktop in Pencil.
