# Trip Canvas — design reference

Main planning surface at route `/trips/:tripId`. Light-themed spatial workspace combining inbox capture, day-filtered canvas, floating toolbars, and AI prompt bar. Mirrors the Demo Trip ("7 Days in Kyoto") fixture.

## Design source

| Artifact | Location |
|----------|----------|
| Pencil design | `pencil-shadcn.pen` (local Pencil file; not committed) |
| Theme tokens | `src/index.css` — Stone base + Orange accent (light workspace); Pencil `wf-*` variables |
| shadcn config | `components.json` — style `radix-nova`, base color `stone`, icons `lucide` |
| Implementation | `src/components/TripWorkspace.tsx`, `src/components/CanvasCards.tsx`, `src/components/InboxPanel.tsx`, `src/components/CardDetailPanel.tsx` |
| Fixture data | `src/data/tripData.ts` — `createDemoTrip()` |
| Layout patterns | **B** sidebar + canvas, **C** prompt bar, **E** modals ([patterns.md](patterns.md)) |

Desktop: **Wayfarer / Desktop / Trip Canvas** (`lngHk`). Mobile: **Wayfarer / Mobile / Trip Canvas** (`rsL1N`). See [README.md](README.md).

Domain components: **Wayfarer / DS / 06 Components · Trip Canvas** (`g967C`) — **Chrome** | **Inbox** | **Canvas Cards** | **Panels & Modals**.

## Pencil screens

### Desktop — `lngHk`

| Frame | Node ID | Purpose |
|-------|---------|---------|
| **Trip Canvas — Default (1440px)** | `qjIgb` | Inbox open, Kyoto demo cards + connection lines |
| **Trip Canvas — Inbox Closed (1440px)** | `yPpUn` | Full-width canvas; inbox toggle inactive |
| **Trip Canvas — Card Selected (1440px)** | `NZsxF` | Hiiragiya Ryokan selected; detail panel open (280px) |
| **Trip Canvas — Link Mode (1440px)** | `a3jhA` | Link banner + detail panel in linking-active state |
| **Trip Canvas — Create Card Dialog (1440px)** | `UVajj` | Modal overlay with create-spatial-card form |
| **Trip Canvas — Add Day Dialog (1440px)** | `xD6UP` | Modal overlay with add-custom-day form |

### Mobile — `rsL1N`

| Frame | Node ID | Purpose |
|-------|---------|---------|
| **Trip Canvas — Default (390px)** | `m3QEJS` | Status bar + content wrapper; `YeJCA` header, stacked canvas cards, compact stats, inbox toggle active |
| **Trip Canvas — Inbox Closed (390px)** | `C9cHr` | Full-width canvas; inbox toggle inactive (`panel-left-open`), badge hidden |
| **Trip Canvas — Card Selected (390px)** | `kYixD` | Hiiragiya Ryokan selected; `l5hjXc` as full-width bottom sheet over dimmed canvas |

Desktop: **1440 × 1024**. Mobile: **390 × 844**. Theme: `Stone` + `Orange` + **Light**.

## Page sections (top to bottom)

| # | Section | Purpose | Key component ref |
|---|---------|---------|-------------------|
| 1 | **Workspace header** | Back to trips, trip identity, day pills, share/export, inbox toggle | `zVsPD` — **Wayfarer / Workspace Header** |
| 2 | **Inbox sidebar** | Paste/process inbox items (280px) | `tS1mE` — **Wayfarer / Inbox Panel** |
| 3 | **Canvas area** | Spatial moodboard with cards, labels, connections | Composed from card refs below |
| 4 | **Canvas toolbar** | Zoom, reset, day-label toggle | `iBYSG` — **Wayfarer / Canvas Toolbar** |
| 5 | **Trip stats pill** | Dates, destination, duration, budget, weather | `Hhcao` — **Wayfarer / Trip Stats Pill** |
| 6 | **AI prompt bar** | Suggestion chips + natural-language input | `m5ldW7` — **Wayfarer / AI Prompt Bar** |
| 7 | **Card detail panel** | Right drawer when a canvas card is selected | `l5hjXc` — **Wayfarer / Card Detail Panel** |

All section refs live under **Wayfarer / DS / 06 Components · Trip Canvas** (`g967C`).

## Reusable components

### Chrome

| Component | Node ID | Mirrors |
|-----------|---------|---------|
| **Wayfarer / Workspace Header** | `zVsPD` | `TripWorkspace.tsx` top nav (52px, desktop) |
| **Wayfarer / Workspace Header Mobile** | `YeJCA` | Mobile two-row header (trip row + day strip) |
| **Wayfarer / Inbox Panel** | `tS1mE` | `InboxPanel.tsx` |
| **Wayfarer / Inbox Item** | `c599T8` | Unprocessed inbox row |
| **Wayfarer / Inbox Item / Processed** | `nZNVW` | Organized inbox row |
| **Wayfarer / Canvas Toolbar** | `iBYSG` | Zoom / grid controls |
| **Wayfarer / Trip Stats Pill** | `Hhcao` | Top-right trip metadata |
| **Wayfarer / AI Prompt Bar** | `m5ldW7` | `AiPromptBar` in `TripWorkspace.tsx` |
| **Wayfarer / Day Label** | `T1dDGp` | Day cluster labels on canvas |
| **Wayfarer / Add Card Button** | `GekYw` | Dashed “Add card” affordance |
| **Wayfarer / Card Detail Panel** | `l5hjXc` | `CardDetailPanel.tsx` (view mode) |
| **Wayfarer / Link Mode Banner** | `AYtTV` | Linking-session active banner |
| **Wayfarer / Create Card Modal** | `iMiJf` | `CreateCardModal` in `TripWorkspace.tsx` |
| **Wayfarer / Add Day Modal** | `nn5gb` | `AddDayModal` in `TripWorkspace.tsx` |

### Canvas cards

| Component | Node ID | Type key | Mirrors |
|-----------|---------|----------|---------|
| **Wayfarer / Polaroid Card** | `y29TzH` | `polaroid` | `PolaroidCard` |
| **Wayfarer / Sticky Card** | `fw8vn` | `sticky` | `StickyCard` |
| **Wayfarer / Flight Card** | `w6IId8` | `flight` | `FlightCard` |
| **Wayfarer / Hotel Card** | `kP3m3` | `hotel` | `HotelCard` |
| **Wayfarer / Article Card** | `kdPEZ` | `article` | `ArticleCard` |
| **Wayfarer / Note Card** | `urxZM` | `note` | `NoteCard` |

## Card detail panel anatomy

Mirrors `CardDetailPanel.tsx` view mode (hotel fixture):

| Zone | Content |
|------|---------|
| **Header** | Type icon + label (“Hotel / Ryokan”), edit + close |
| **Image banner** | 140px destination photo |
| **Body** | Title, subtitle, tag pill, star rating, details checklist |
| **Footer** | Link with another card, Delete + Itinerary row, Open original link CTA |

Link-mode variant (`a3jhA`): link button uses amber active styling and “Select target card on canvas…” copy.

## Create card modal

| Field | Content |
|-------|---------|
| Card Type | Select — default “📌 Sticky Note” |
| Title | Required text |
| Subtitle / Description | Optional text |
| Associate Day | Day select — default “Unassigned (Logistics)” |
| Details | Multiline bullets |
| Price / Rating | Type-specific grid (hotel, flight, polaroid) |
| Actions | Cancel (`outline`) + Create Card (`#92400e`) |

## Add day modal

| Field | Content |
|-------|---------|
| Day Index | Number input — default next day (5) |
| Day Label / Activity | Text — e.g. “Nanzenji Temple & Tofu dinner” |
| Actions | Cancel + Add Day |

## Workspace header anatomy

| Zone | Content |
|------|---------|
| **Back** | Chevron + **Wayfarer / Brand Mark** (`juOuS`) |
| **Trip identity** | Emoji, trip name, status badge (Upcoming / Planning / …) |
| **Day pills** | “All days” + per-day colored dots + add-day control |
| **Actions** | Traveler avatars, Share, Export, Inbox toggle with unprocessed count |

**Mobile** (`YeJCA`): row 1 hides desktop day pills and share/export (overflow ··· instead); row 2 is a horizontal day strip.

Status colors match `workspaceStatusConfig` in `TripWorkspace.tsx`.

## Canvas connections

`qjIgb` includes ink-line connections between demo-trip card clusters (mirrors `connections` in `tripData.ts`):

| From | To | Label |
|------|-----|-------|
| Flight | Hotel | same day |
| Fushimi polaroid | Yuki sticky | tip |
| Nishiki article | Gion polaroid | nearby |
| Pocket WiFi note | Flight | logistics |

## Canvas fixture (Demo Trip)

Cards on `qjIgb` mirror `canvasCards` in `tripData.ts`:

| Cluster | Cards |
|---------|-------|
| **Day 1 — Arrival** | Flight SFO→KIX, Hiiragiya Ryokan, “Pack light!” sticky |
| **Day 2** | Fushimi Inari polaroid, Yuki sticky, Nishiki Market article |
| **Day 3 — Arashiyama** | Bamboo polaroid, JR Pass sticky, Tenryu-ji article |
| **Day 4 / Logistics** | Gion polaroid, Junsei dinner sticky, Pocket WiFi note |

Day label pills use domain colors from `dayGroups` (amber, orange, emerald, rose).

## Light workspace tokens

Pencil uses `$wf-*` variables (see [foundations.md](foundations.md)). Code still has hardcoded hex — migrate to semantic tokens:

| Pencil variable | Value | Usage |
|-----------------|-------|-------|
| `$wf-page` | `#faf9f7` | Page background |
| `$wf-surface` | `#fefcf8` | Header, inbox, cards, toolbars |
| `$wf-border-warm` | `#e7e3dc` | Borders |
| `$wf-muted-fill` | `#f5f3ef` | Muted fills, processed inbox |
| `$wf-brand-dark` | `#92400e` | Brand / primary actions |
| `$wf-canvas` | — | Canvas background |
| `$wf-grid-dot` | — | Connection endpoint dots |

Domain day/tag accents (amber, orange, emerald, rose) match `CanvasCards.tsx` `tagColorMap` and sticky palettes.

## shadcn components in scope (future migration)

| Component | File | Variants likely needed on workspace |
|-----------|------|-------------------------------------|
| `Button` | `src/components/ui/button.tsx` | `default`, `ghost`, `outline` |
| `Badge` | `src/components/ui/badge.tsx` | Status, day tags, inbox counts |
| `Card` | `src/components/ui/card.tsx` | Inbox items, canvas cards |
| `Dialog` | `src/components/ui/dialog.tsx` | Create card, add day modals |
| `Input` / `Textarea` | `src/components/ui/input.tsx` | Inbox, AI prompt, detail edit mode |
| `Tabs` | `src/components/ui/tabs.tsx` | Day filter pills (candidate) |
| `Sheet` | *(to add)* | Card detail panel drawer |

## Out of scope (current implementation)

- Trip Workspace UI still uses hardcoded light colors — not yet on shadcn semantic tokens; see ADR-0003.
- Card detail **edit mode** and delete-confirm pulse not drawn as separate Pencil states.
- Mobile overflow popover (share/export/travelers) not drawn — header shows ··· only.
- Canvas pan/zoom physics and drag interactions are code-only (`useSpatialViewport`).
- Onboarding toast not drawn in Pencil.
