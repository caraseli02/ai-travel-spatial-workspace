# Trip Canvas — design reference

Main planning surface at route `/trips/:tripId`. Light-themed spatial workspace combining inbox capture, day-filtered canvas, floating toolbars, and AI prompt bar. Mirrors the Demo Trip ("7 Days in Kyoto") fixture.

## Design source

| Artifact | Location |
|----------|----------|
| Pencil design | `pencil-shadcn.pen` |
| Theme tokens | `src/index.css` — Stone base + Orange accent (light workspace); Pencil `wf-*` variables |
| shadcn config | `components.json` — style `radix-nova`, base color `stone`, icons `lucide` |
| Implementation | `src/components/TripWorkspace.tsx`, `src/components/CanvasCards.tsx`, `src/components/InboxPanel.tsx`, `src/components/CardDetailPanel.tsx` |
| Fixture data | `src/data/tripData.ts` — `createDemoTrip()` |
| Layout patterns | **B** sidebar + canvas, **C** prompt bar, **E** modals ([patterns.md](patterns.md)) |

Desktop: **Wayfarer / Desktop / Trip Canvas** (`lngHk`). Mobile: **Wayfarer / Mobile / Trip Canvas** (`rsL1N`). See [README.md](README.md).

Domain components: **Wayfarer / DS / 06 Components · Trip Canvas** (`g967C`) — **Chrome** | **Inbox** | **Canvas Cards** | **Schedule** | **Map** | **Panels & Modals**.

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
| **Trip Canvas — Days View (1440px)** | `iBajd` | Inbox open; scrollable day schedule; view switcher on **Days** |
| **Trip Canvas — Days View · Day 2 Focus (1440px)** | `vDUDV` | Day 2 pill active; Day 2 section highlighted, other days dimmed |
| **Trip Canvas — Days View · Card Selected (1440px)** | `S2H68` | Hiiragiya Ryokan row selected; `l5hjXc` detail panel open |
| **Trip Canvas — Map View (1440px)** | `nBstu` | Inbox closed; OSM-style map mock; Kyoto pins; view switcher on **Map** |
| **Trip Canvas — Map View · Card Selected (1440px)** | `s68L4` | Fushimi pin selected + `Diz6L` callout; detail panel open |

### Exploration — Geographic grounding

**Trip Canvas — Geo Grounding (1440px)** (`hVPFh`, root-level frame) — Default canvas state extended with geographic grounding. Not yet part of the `lngHk` Screens stack:

| Element | Nodes | Purpose |
|---------|-------|---------|
| Geo chips | `Geo Chip · *` on canvas surface `g3P33` | Place name + distance pinned to each located card (stored lat/lng / placeId from link extraction) |
| Connection labels | `Connection Label · *` | Travel semantics on connections — "Haruka Exp · 75 min", "15 min walk", "pickup at KIX" — replacing generic labels |
| Route chips | `Route Chip · optimized · *` | Distance-optimized Day Group ordering next to day labels, with numbered stop badges on cards |
| Geo overlay toggle | `Geo Overlay Toggle` | Optional map overlay switch next to canvas toolbar |
| Mini map | `Mini Map` | Bottom-right overlay: simplified Kyoto base, day-colored dots, "8 places pinned · Open map →" |
| Inbox place extraction | overrides on `jwjtS` items | "2 places" detected on unprocessed link; lat/lng chip (`34.967, 135.772`) on processed item |

### Mobile — `rsL1N`

| Frame | Node ID | Purpose |
|-------|---------|---------|
| **Trip Canvas — Default (390px)** | `m3QEJS` | Status bar + content wrapper; `YeJCA` header, stacked canvas cards, compact stats, inbox toggle active |
| **Trip Canvas — Inbox Closed (390px)** | `C9cHr` | Full-width canvas; inbox toggle inactive (`panel-left-open`), badge hidden |
| **Trip Canvas — Card Selected (390px)** | `kYixD` | Hiiragiya Ryokan selected; `l5hjXc` as full-width bottom sheet over dimmed canvas |
| **Trip Canvas — Days View (390px)** | `AykFZ` | Single-column schedule; `YeJCA` header; view switcher on **Days** |
| **Trip Canvas — Map View (390px)** | `ZUOfl` | Full-width map mock; compact `Cc8SA` toolbar; view switcher on **Map** |

Desktop: **1440 × 1024**. Mobile: **390 × 844**. Theme: `Stone` + `Orange` + **Light**.

## Workspace views

Three workspace views share the same header, inbox, day pills, stats pill, and AI prompt bar. A centered **Workspace View Switcher** (`W5sjx`) toggles the main content area.

| View | Purpose | Toolbar | Day pills behavior |
|------|---------|---------|-------------------|
| **Canvas** | Spatial moodboard, connections, drag | `iBYSG` — zoom, reset, day labels | Dim non-active cards |
| **Days** | Scan daily activities in **Optimized Sequence** order | None (schedule scroll) | Filter/highlight active day section |
| **Map** | Geographic spread of place cards | `Cc8SA` — zoom, fit bounds, recenter | Filter/dim pins by day |

Icons: `layout-grid` (Canvas), `list-ordered` (Days), `map` (Map).

## Page sections (top to bottom)

| # | Section | Purpose | Key component ref |
|---|---------|---------|-------------------|
| 1 | **Workspace header** | Back to trips, trip identity, day pills, share/export, inbox toggle | `zVsPD` — **Wayfarer / Workspace Header** |
| 2 | **Inbox sidebar** | Paste/process inbox items (280px) | `tS1mE` — **Wayfarer / Inbox Panel** |
| 3 | **View switcher** | Canvas / Days / Map segmented control | `W5sjx` — **Wayfarer / Workspace View Switcher** |
| 4 | **Main content** | Spatial canvas, day schedule, or map surface | View-dependent (see below) |
| 5 | **Canvas toolbar** | Zoom, reset, day-label toggle (Canvas view only) | `iBYSG` — **Wayfarer / Canvas Toolbar** |
| 6 | **Trip stats pill** | Dates, destination, duration, budget, weather | `Hhcao` — **Wayfarer / Trip Stats Pill** |
| 7 | **AI prompt bar** | Suggestion chips + natural-language input | `m5ldW7` — **Wayfarer / AI Prompt Bar** |
| 8 | **Card detail panel** | Right drawer when a canvas card is selected | `l5hjXc` — **Wayfarer / Card Detail Panel** |

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
| **Wayfarer / Workspace View Switcher** | `W5sjx` | Canvas / Days / Map tabs (centered in main chrome) |

### Schedule

| Component | Node ID | Mirrors |
|-----------|---------|---------|
| **Wayfarer / Day Schedule Section** | `O2HBk` | Day header + vertical timeline rows |
| **Wayfarer / Activity Timeline Row** | `UmcVd` | One Canvas Card as a schedule row (thumb, title, tag, time slot) |

### Map

| Component | Node ID | Mirrors |
|-----------|---------|---------|
| **Wayfarer / Map Toolbar** | `Cc8SA` | Zoom, fit bounds, recenter controls |
| **Wayfarer / Map Pin** | `VgFEK` | Day-colored location marker |
| **Wayfarer / Map Pin / Selected** | `ExV1U` | Selected pin with focus ring |
| **Wayfarer / Map Card Callout** | `Diz6L` | Floating preview on pin select |
| **Wayfarer / Kyoto OSM Map Base** | `eSHrB` | Carto-light vector map of central Kyoto (land, river, parks, arterials, labels) |

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

The default spatial frame (`qjIgb`) includes subtle **day swimlane** background bands (low-opacity amber, orange, emerald, rose rectangles behind each cluster) so spatial view also reads as day zones.

## Days view fixture (Demo Trip)

Per-day rows on `iBajd` mirror `canvasCards` in **Optimized Sequence** order:

| Day | Rows (in order) |
|-----|-----------------|
| **Day 1 — Arrival** | Flight → Hotel → “Pack light!” sticky |
| **Day 2** | Fushimi polaroid → Yuki sticky → Nishiki article |
| **Day 3 — Arashiyama** | Bamboo polaroid → JR Pass sticky → Tenryu-ji article |
| **Day 4 / Logistics** | Gion polaroid → Junsei dinner sticky → Pocket WiFi note |

## Map view fixture (Demo Trip)

Map frames (`nBstu`, `s68L4`, `ZUOfl`) compose **`eSHrB` — Wayfarer / Kyoto OSM Map Base** (`PffBP` on screen instances): a Carto-light vector map with organic park shapes, a curved Kamo River path, trunk roads (Shijo, Kawaramachi, Route 9), neighborhood quarters, and district labels (Arashiyama, Imperial Palace, Gion, Nishiki Market, Fushimi Inari). OSM attribution appears bottom-left.

| Element | Color | Usage |
|---------|-------|-------|
| Land | `#f2efe9` | OSM Carto land |
| Parks | `#add19e` / `#a8d5a2` | Arashiyama, Kyoto Gyoen, Maruyama |
| River Kamo | `#aad3df` | Curved path through center |
| Trunk roads | `#feffff` + `#e9ac77` stroke | Shijo Dori, Kawaramachi |
| Secondary roads | `#ffffff` | Sanjo, Oike, Higashioji |

Pins approximate real Kyoto geography. Code implementation should use Leaflet + OSM tiles; the Pencil asset is a high-fidelity vector stand-in when live tiles are unavailable.

## Future implementation (code handoff)

Design-only in Pencil; React implementation is a follow-up:

- `workspaceView: 'canvas' | 'days' | 'map'` in Trip Workspace state
- Optional `location?: { lat: number; lng: number }` on `CanvasCard` in `src/models/trip.ts`
- Kyoto fixture coordinates in `src/data/tripData.ts`
- `react-leaflet` + `leaflet` for OpenStreetMap tiles
- Pure `buildOptimizedSequence(cards, day)` in `tripWorkspaceModel.ts`
- Route stays `/trips/:tripId` — views toggle in-place, no new routes

## Light workspace tokens

Pencil uses `$wf-*` variables (see [foundations.md](foundations.md)). Code uses shadcn semantic tokens for generic chrome and canvas-specific utility colors for the spatial surface:

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

## shadcn baseline

Trip Workspace is part of the shared shadcn/ui foundation established in ADR-0003. The main workspace shell, inbox, canvas cards, dialogs, and Card Detail Panel compose shadcn primitives and shared tokens, while domain-specific canvas accents remain intentionally tied to day colors, card types, and travel material semantics.

## shadcn components in use

| Component | File | Workspace use |
|-----------|------|-------------------------------------|
| `Button` | `src/components/ui/button.tsx` | Header actions, toolbar controls, prompt actions, dialog actions |
| `Badge` | `src/components/ui/badge.tsx` | Status, day tags, inbox counts, card metadata |
| `Card` | `src/components/ui/card.tsx` | Inbox items, canvas cards, prompt surfaces |
| `Dialog` | `src/components/ui/dialog.tsx` | Create card and add day modals |
| `Input` / `Textarea` | `src/components/ui/input.tsx`, `src/components/ui/textarea.tsx` | Inbox capture, AI prompt, detail edit mode |
| `Select` | `src/components/ui/select.tsx` | Card type and day association controls |
| `Sheet` | `src/components/ui/sheet.tsx` | Card Detail Panel drawer behavior |

## Out of scope (current Pencil / code)

- Leaflet map embed and live pan/zoom in Pencil (map frames use static vector mock).
- Card detail **edit mode** and delete-confirm pulse not drawn as separate Pencil states.
- Mobile overflow popover (share/export/travelers) not drawn — header shows ··· only.
- Canvas pan/zoom physics and drag interactions are code-only (`useSpatialViewport`).
- Onboarding toast not drawn in Pencil.
