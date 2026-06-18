# Trip List — design reference

Primary app surface at route `/trips`. Dark-themed hub for browsing, filtering, and creating trips. AI prompt bar at the bottom creates trips from natural language; header actions open chat history or the manual New Trip dialog.

## Design source

| Artifact | Location |
|----------|----------|
| Pencil design | `pencil-shadcn.pen` |
| Theme tokens | `src/index.css` — Stone base + Orange accent (`.dark`); Pencil also defines `wf-dark-*` variables |
| shadcn config | `components.json` — style `radix-nova`, base color `stone`, icons `lucide` |
| Implementation | `src/components/TripListPage.tsx`, `src/components/TripCard.tsx` |
| Layout pattern | **C** — fixed prompt bar + **A** — header + content ([patterns.md](patterns.md)) |
| Nav pattern | **Wayfarer / Trip List Header** (`l6uTL`) — composes Brand Mark + `Button/Ghost` + `Button/Default` |
| Filter pattern | **Wayfarer / Trip List Filter Bar** (`ZPaim`) — `Icon Button/Outline` + `Tab Item` + `Badge/Secondary` |
| Prompt pattern (desktop) | **Wayfarer / Trip List Prompt Bar** (`YK92H`) — horizontal `Badge/Outline` chips + `Input/Default` + `Icon Button` |
| Prompt pattern (mobile) | **Wayfarer / Trip List Prompt Bar / Mobile** (`p4INn`) — vertical chips (2) + input row |
| Card pattern | **Wayfarer / Trip Card** (`GK0nB`) — `Card` + `Badge` + `Button/Outline` |

Desktop: **Wayfarer / Screens / Desktop / Trip List** (`i8BjSi`). Mobile: **Wayfarer / Screens / Mobile / Trip List** (`uqZ1a`). See [README.md](README.md).

Domain components: **Wayfarer / DS / 05 Components · Trip List** (`x76EWb`) — groups **Chrome** | **Cards**.

## Pencil screens

### Desktop — `i8BjSi`

| Frame | Node ID | Purpose |
|-------|---------|---------|
| **Trip List — Default (1440px)** | `WApFW` | Default populated state — 3-column grid with New Trip card + 2 sample trips |
| **Trip List — Chat Open (1440px)** | `rkU8h` | Left chat sidebar (380px) with sample user/AI exchange |
| **Trip List — New Trip Dialog (1440px)** | `rVIzu` | Modal overlay with **Modal/Center** (`5:X6bmd`) form |
| **Trip List — Empty (1440px)** | `IV3cl` | Zero trips — New Trip card + **Plan with AI** helper card |
| **Trip List — No Matches (1440px)** | `N5RjEK` | Filtered empty — New Trip card + **No matching trips** helper card |

### Mobile — `uqZ1a`

| Frame | Node ID | Purpose |
|-------|---------|---------|
| **Trip List — Default (390px)** | `CXcSq` | Status bar + 1-col card stack, `ZPaim` filter bar, `p4INn` mobile prompt bar pinned bottom |
| **Trip List — Chat Open (390px)** | `zjmBk` | Default + dim overlay; chat history as bottom sheet (~54% height) |
| **Trip List — New Trip Dialog (390px)** | `SCroq` | Default + centered `5:X6bmd` modal (358px wide) |
| **Trip List — Empty (390px)** | `YHSxu` | `ZQPee` + `vCVf6` Plan with AI card |
| **Trip List — No Matches (390px)** | `nhghj` | `ZQPee` + `McIXx` No matching trips card |

All desktop screens: **1440 × 1024**, theme `Stone` + `Orange` + `Dark`.

## Page sections (top to bottom)

| # | Section | Purpose | Key shadcn / tokens |
|---|---------|---------|---------------------|
| 1 | **Header** | Brand mark (back to `/`), Chat toggle, New trip CTA | Ref `l6uTL` → `juOuS`, `5:3f2VW`, `5:VSnC2` |
| 2 | **Filter bar** | Status tabs with counts: All, Upcoming, Ongoing, Planning, Completed | Ref `ZPaim` → `5:hXOUF`, `5:coMmv`, `5:QY0Ka`, `5:WuUMk` |
| 3 | **Trip grid** | 3 columns @ 1440px: dashed New Trip card, two trip samples | Ref `ZQPee` (new trip), `GK0nB` (trip card); status badge via `5:WuUMk` |
| 4 | **Prompt bar** | Suggestion chips + AI input + send | Ref `YK92H` → `5:3IiAS`, `5:fEUdI`, `5:urnwK` |

All section refs live under **Wayfarer / DS / 05 Components · Trip List** (`x76EWb`).

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

Defined in `pencil-shadcn.pen` variables as dark-surface aliases. Code uses `.dark` shadcn semantic tokens for generic UI chrome:

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
| `Badge` | `src/components/ui/badge.tsx` | Status and count badges |
| `Card` | `src/components/ui/card.tsx` | Trip cards, empty states, New Trip dashed card |
| `Dialog` | `src/components/ui/dialog.tsx` | New Trip modal |
| `Input` | `src/components/ui/input.tsx` | Prompt bar, modal fields |
| `Tabs` | `src/components/ui/tabs.tsx` | Status filter bar |

## Out of scope (current implementation)

- Delete confirmation overlay on `TripCard` not drawn in Pencil (interaction state).
- Chat sidebar uses simulated AI delay; no real backend.
- Responsive breakpoints (`@container` grid) simplified to 3-column desktop in Pencil.

## shadcn baseline

Trip List and `TripCard` use semantic dark-theme tokens (`bg-card`, `text-muted-foreground`, `bg-background`) via the page-level `.dark` wrapper, aligned to Pencil ref `GK0nB`.
