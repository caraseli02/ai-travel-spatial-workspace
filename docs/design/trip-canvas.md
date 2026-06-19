# Trip Canvas — design reference

Main planning surface at route `/trips/:tripId`. Light-themed spatial workspace combining inbox capture, day-filtered canvas, floating toolbars, and AI prompt bar. Mirrors the Demo Trip ("7 Days in Kyoto") fixture.

## Design source

| Artifact | Location |
|----------|----------|
| Pencil design | `pencil-shadcn.pen` |
| Theme tokens | `src/index.css` — Stone base + Orange accent (light workspace); Pencil `wf-*` variables |
| shadcn config | `components.json` — style `radix-nova`, base color `stone`, icons `lucide` |
| Implementation | `src/components/TripWorkspace.tsx`, `src/components/TripWorkspaceViews.tsx`, `src/components/CanvasCards.tsx`, `src/components/InboxPanel.tsx`, `src/components/CardDetailPanel.tsx` |
| Fixture data | `src/data/tripData.ts` — `createDemoTrip()` |
| Layout patterns | **B** sidebar + canvas, **C** prompt bar, **E** modals ([patterns.md](patterns.md)) |

| Handoff | Desktop frame | Mobile frame |
|---------|---------------|--------------|
| **Done** (shipped in React) | `lngHk` — Trip Canvas — Done | `rsL1N` — Trip Canvas — Done |
| **Next** (partially in React) | `v3Oai` — Trip Canvas — Next | `GTWXC` — Trip Canvas — Next |
| **Exploration** | `kMh8w` — Dump (geo grounding) | — |

See [README.md](README.md). On the Pencil canvas, **Trip View Done** groups `lngHk` + `rsL1N`; **Trip View in Progress** groups `v3Oai` + `GTWXC` + `kMh8w`.

React ships **Canvas (Kanban)** + **Map** via `WorkspaceViewSwitcher`. The standalone **Days** schedule view from Pencil `v3Oai` was replaced by Kanban day columns on desktop/mobile.

Domain components: **Wayfarer / DS / 06 Components · Trip Canvas** (`g967C`) — **Chrome** | **Inbox** | **Canvas Cards** | **Schedule** | **Map** | **Panels & Modals**. Map Route catalog lives under **DS / 06** → `10 Catalog / Map Route`.

## Pencil screens

Trip Canvas is split across **separate page frames** on the Pencil canvas — not sections inside one frame.

**Handoff rules:**
- **Done** frames (`lngHk`, `rsL1N`) match the original spatial canvas — superseded in React by Kanban columns (`XFqhW` experiment).
- **Next** frames (`v3Oai`, `GTWXC`) — Map view shipped; Days schedule view replaced by Kanban.
- **Next** frames include `W5sjx` with the active tab set to **Canvas** or **Map** (Days tab removed from React switcher).

### Done — desktop `lngHk` → `Screens`

| Section | Frames | Node IDs |
|---------|--------|----------|
| **Canvas** | Default, Inbox Closed, Card Selected, Link Mode | `qjIgb`, `yPpUn`, `NZsxF`, `a3jhA` |
| **Modals** | Create Card Dialog, Add Day Dialog | `UVajj`, `xD6UP` |

| Frame | Node ID | Purpose |
|-------|---------|---------|
| **Trip Canvas — Default (1440px)** | `qjIgb` | Inbox open, Kyoto demo cards + connection lines |
| **Trip Canvas — Inbox Closed (1440px)** | `yPpUn` | Full-width canvas; inbox toggle inactive |
| **Trip Canvas — Card Selected (1440px)** | `NZsxF` | Hiiragiya Ryokan selected; detail panel open (280px) |
| **Trip Canvas — Link Mode (1440px)** | `a3jhA` | Link banner + detail panel in linking-active state |
| **Trip Canvas — Create Card Dialog (1440px)** | `UVajj` | Modal overlay with create-spatial-card form |
| **Trip Canvas — Add Day Dialog (1440px)** | `xD6UP` | Modal overlay with add-custom-day form |

### Next — desktop `v3Oai` → `Screens`

| Section | Frames | Node IDs |
|---------|--------|----------|
| **Days** | Default, Day 2 Focus, Card Selected | `ydtqA`, `e2aipc`, `EmA1x` |
| **Map** | Default, Card Selected | `H0PqZS`, `ypqiU` |

| Frame | Node ID | Purpose |
|-------|---------|---------|
| **TripCanvas/Desktop/Days/Default** | `ydtqA` | Inbox open; scrollable day schedule; view switcher on **Days** |
| **TripCanvas/Desktop/Days/Day2Focus** | `e2aipc` | Day 2 pill active; Day 2 section highlighted, other days dimmed |
| **TripCanvas/Desktop/Days/CardSelected** | `EmA1x` | Hiiragiya Ryokan row selected; `l5hjXc` detail panel open |
| **TripCanvas/Desktop/Map/Default** | `H0PqZS` | Inbox closed; Kyoto map route; view switcher on **Map** |
| **TripCanvas/Desktop/Map/CardSelected** | `ypqiU` | Fushimi pin selected + callout; detail panel open |

### Map Route component library

Map Route components live in **Wayfarer / DS / 06 Components · Trip Canvas** (`g967C`) → **10 Catalog / Map Route** (`l3EuyS`), organized as Atoms → Molecules → Organisms.

### Exploration — Geographic grounding (post-Map backlog)

Geo grounding experiments live in **Wayfarer / Dump** (`kMh8w`) under **Section · Exploration · Geo Grounding** — not scheduled until Map view ships (P4):

| Frame | Node ID | Purpose |
|-------|---------|---------|
| **TripCanvas/Desktop/Canvas/GeoGrounding** | `hVPFh` | Default canvas + geographic grounding overlay |
| **TripCanvas/Desktop/Canvas/GeoGroundingTest1** | `XFqhW` | Improvement test variant 1 |
| **TripCanvas/Desktop/Canvas/GeoGroundingTest2** | `a04cnQ` | Improvement test variant 2 |

| Element | Nodes | Purpose |
|---------|-------|---------|
| Geo chips | `Geo Chip · *` on canvas surface `g3P33` | Place name + distance pinned to each located card (stored lat/lng / placeId from link extraction) |
| Connection labels | `Connection Label · *` | Travel semantics on connections — "Haruka Exp · 75 min", "15 min walk", "pickup at KIX" — replacing generic labels |
| Route chips | `Route Chip · optimized · *` | Distance-optimized Day Group ordering next to day labels, with numbered stop badges on cards |
| Geo overlay toggle | `Geo Overlay Toggle` | Optional map overlay switch next to canvas toolbar |
| Mini map | `Mini Map` | Bottom-right overlay: simplified Kyoto base, day-colored dots, "8 places pinned · Open map →" |
| Inbox place extraction | overrides on `jwjtS` items | "2 places" detected on unprocessed link; lat/lng chip (`34.967, 135.772`) on processed item |

### Done — mobile `rsL1N` → `Screens`

| Frame | Node ID | Purpose |
|-------|---------|---------|
| **Trip Canvas — Default (390px)** | `m3QEJS` | Status bar + content wrapper; `YeJCA` header, stacked canvas cards, compact stats, inbox toggle active |
| **Trip Canvas — Inbox Closed (390px)** | `C9cHr` | Full-width canvas; inbox toggle inactive (`panel-left-open`), badge hidden |
| **Trip Canvas — Card Selected (390px)** | `kYixD` | Hiiragiya Ryokan selected; `l5hjXc` as full-width bottom sheet over dimmed canvas |

### Next — mobile `GTWXC` → `Screens`

| Frame | Node ID | Purpose |
|-------|---------|---------|
| **Trip Canvas — Days View (390px)** | `HN9BE` | Single-column schedule; `YeJCA` header; view switcher on **Days** |
| **Trip Canvas — Map View (390px)** | `FgqNZ` | Map Route mobile compose (`Nbc1U`); zoom on map; `q8saP` bottom sheet with activity carousel; view switcher on **Map** (day pills in header only) |
| **TripCanvas/Mobile/Canvas/KanbanExp1** | `RkX2Z` | Kanban layout experiment 1 |
| **TripCanvas/Mobile/Canvas/KanbanExp2** | `vLeqT` | Kanban layout experiment 2 |

Desktop: **1440 × 1024**. Mobile: **390 × 844**. Theme: `Stone` + `Orange` + **Light**.

## Workspace views

Two workspace views share the same header, inbox, day pills, stats pill, and AI prompt bar. A centered **Workspace View Switcher** (`W5sjx`) toggles the main content area.

| View | Purpose | Toolbar | Day pills behavior |
|------|---------|---------|-------------------|
| **Canvas** | Kanban day columns with embedded cards (desktop + mobile) | `iBYSG` — zoom, reset | Dim non-active columns |
| **Map** | Geographic spread of place cards + route panel | `Cc8SA` — zoom, fit bounds, recenter | Filter/dim pins by day |

Icons: `layout-grid` (Canvas), `map` (Map).

**Canvas layout:** React uses horizontal Kanban columns (`TripCanvasKanbanView`) aligned to `XFqhW` — four day columns for the Demo Trip, with logistics cards in the last column. Cards tagged to a future day (e.g. Day 5) stay in logistics until that day is added.

**Map layout:** Stop markers use horizontal thumbnail chips (`v6iKM`). Desktop route panel (`I4gQFw`) stacks activities under Morning / Afternoon / Evening headers (`hIJ3Y`). Mobile uses a bottom sheet (`q8saP`) with snap-scrolling activity carousel tiles (`kuOO5`).

## Page sections (top to bottom)

| # | Section | Purpose | Key component ref |
|---|---------|---------|-------------------|
| 1 | **Workspace header** | Back to trips, trip identity, day pills, share/export, inbox toggle | `zVsPD` — **Wayfarer / Workspace Header** |
| 2 | **Inbox sidebar** | Paste/process inbox items (280px) | `tS1mE` — **Wayfarer / Inbox Panel** |
| 3 | **View switcher** | Canvas / Map segmented control | `W5sjx` — **Wayfarer / Workspace View Switcher** |
| 4 | **Main content** | Kanban day columns or map surface | View-dependent (see below) |
| 5 | **Canvas toolbar** | Zoom, reset (Canvas view only; scales Kanban board) | `iBYSG` — **Wayfarer / Canvas Toolbar** |
| 6 | **Trip stats pill** | Dates, destination, duration, budget, weather | `Hhcao` — **Wayfarer / Trip Stats Pill** |
| 7 | **AI prompt bar** | Suggestion chips + natural-language input | `m5ldW7` — **Wayfarer / AI Prompt Bar** (`5:3IiAS` chips, `5:urnwK` send) |
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
| **Wayfarer / AI Prompt Bar** | `m5ldW7` | `AiPromptBar` in `TripWorkspace.tsx` — composes `5:3IiAS` Badge/Outline chips + `5:urnwK` send |
| **Wayfarer / Day Label** | `T1dDGp` | Day cluster labels on canvas |
| **Wayfarer / Add Card Button** | `GekYw` | Dashed “Add card” affordance |
| **Wayfarer / Card Detail Panel** | `l5hjXc` | `CardDetailPanel.tsx` (view mode) |
| **Wayfarer / Link Mode Banner** | `AYtTV` | Linking-session active banner |
| **Wayfarer / Create Card Modal** | `iMiJf` | `CreateCardModal` in `TripWorkspace.tsx` |
| **Wayfarer / Add Day Modal** | `nn5gb` | `AddDayModal` in `TripWorkspace.tsx` |
| **Wayfarer / Workspace View Switcher** | `W5sjx` | Canvas / Map tabs (centered in main chrome) |

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

### Map Route

Immersive day itinerary on map — thumbnail stop markers, route polyline, time-of-day sections. **Frame:** `Wayfarer / DS / 06 Components · Trip Canvas` (`g967C`) → **10 Catalog / Map Route** (`l3EuyS`). Composes from shadcn primitives; active day pill uses high-contrast **pure black** `#000000` (not brand orange or stone `#292524`) for map overlay legibility.

**Reference screenshots** (8 PNGs beside the catalog — do not delete): Venice desktop/mobile, Barcelona desktop Days 1–3, Milan desktop Day 3. Use these for pixel-perfect alignment when tuning Map Route atoms/molecules/organisms.

**Alignment notes (vs references):**
- Stop markers: horizontal white chip — 32px thumbnail + sequence badge overlay + inline label
- Open route CTA: `rounded-xl` (12px), black fill, left-aligned icon + label
- Mobile nav button: 44×44 `rounded-xl` square (not circular)
- Activity cards: `#f5f5f5` fill, 16px radius, 60px desktop / 52px mobile thumbnails
- Day Route Panel: 24px radius; mobile sheet: 28px top radius

#### Atoms

| Component | Node ID | Purpose |
|-----------|---------|---------|
| **Wayfarer / Day Overline** | `beNP1` | `DAY 1` uppercase muted label |
| **Wayfarer / Time of Day Label** | `F1SjK` | `Morning` / `Afternoon` / `Evening` section heading |
| **Wayfarer / Route Sequence Badge** | `f7rpbv` | Black circle + white stop number |
| **Wayfarer / Place Thumbnail** | `BVT1S` | 48px rounded square image placeholder |
| **Wayfarer / Activity Time** | `NbjBT` | `11:00 AM` caption |
| **Wayfarer / Route Line** | `gGb2M` | Blue route polyline stroke |

#### Molecules

| Component | Node ID | Purpose |
|-----------|---------|---------|
| **Wayfarer / Map Day Pill** | `xX1qM` | Active day pill (black fill) |
| **Wayfarer / Map Day Pill / Inactive** | `VHllc` | Inactive day pill (white + border) |
| **Wayfarer / Map Day Selector** | `g5r2f` | Horizontal day pill row on map |
| **Wayfarer / Place Rating Row** | `w5RSc` | Score + star + reviews + category |
| **Wayfarer / Map Zoom Control** | `xvjBp` | Compact `+` / `−` stack (route overlay) |
| **Wayfarer / Open Route Button** | `upK7h` | Full-width desktop CTA |
| **Wayfarer / Route Nav Button** | `SY2XW` | Circular mobile nav icon button |
| **Wayfarer / Route Stop Marker** | `v6iKM` | Thumbnail + sequence badge + label |
| **Wayfarer / Route Activity Card** | `PWtEh` | Desktop activity row (thumb, time, title, rating, snippet) |
| **Wayfarer / Route Activity Card / Compact** | `kuOO5` | Mobile carousel tile (thumb, time, title) |

#### Organisms

| Component | Node ID | Purpose |
|-----------|---------|---------|
| **Wayfarer / Day Route Header** | `GGKq0` | Overline + title + description + Open Route Button |
| **Wayfarer / Day Route Header / Mobile** | `qtnGB` | Overline + title + Route Nav Button + description |
| **Wayfarer / Day Route Section** | `hIJ3Y` | Time-of-day label + activity card stack |
| **Wayfarer / Day Route Panel** | `I4gQFw` | Desktop right-docked itinerary card |
| **Wayfarer / Day Route Sheet** | `q8saP` | Mobile bottom sheet + horizontal activity carousel |
| **Wayfarer / Map Route Base** | `vKSBd` | AI-generated stylized city map image (`jOwUU`) — light-mode travel-app aesthetic; no labels |
| **Wayfarer / Map Route Surface** | `pB5Rz` | Map Route Base + route line + stop markers + day selector + zoom |
| **Wayfarer / Map Route Desktop Compose** | `d78wmq` | Full-bleed map surface + right-docked Day Route Panel (reference layout) |
| **Wayfarer / Map Route Mobile Compose** | `Nbc1U` | Full-bleed map surface + bottom-docked Day Route Sheet (reference layout) |

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

Per-day rows on `ydtqA` mirror `canvasCards` in **Optimized Sequence** order:

| Day | Rows (in order) |
|-----|-----------------|
| **Day 1 — Arrival** | Flight → Hotel → “Pack light!” sticky |
| **Day 2** | Fushimi polaroid → Yuki sticky → Nishiki article |
| **Day 3 — Arashiyama** | Bamboo polaroid → JR Pass sticky → Tenryu-ji article |
| **Day 4 / Logistics** | Gion polaroid → Junsei dinner sticky → Pocket WiFi note |

## Map view fixture (Demo Trip)

Map frames (`H0PqZS`, `ypqiU`, `FgqNZ`) compose **`vKSBd` — Wayfarer / Map Route Base** via `d78wmq` (desktop) or `Nbc1U` (mobile): AI-generated stylized city map (`images/generated-1781607294883.png` for Kyoto), blue route polyline, thumbnail stop markers (`v6iKM`), and zoom control (`xvjBp`). Day pills live in the workspace header only — map overlay day selector (`g5r2f`) is disabled on screen instances. Desktop adds right-docked `I4gQFw`; mobile adds bottom `q8saP` sheet with horizontal `kuOO5` carousel.

| Element | Color | Usage |
|---------|-------|-------|
| Land | `#f2efe9` | OSM Carto land |
| Parks | `#add19e` / `#a8d5a2` | Arashiyama, Kyoto Gyoen, Maruyama |
| River Kamo | `#aad3df` | Curved path through center |
| Trunk roads | `#feffff` + `#e9ac77` stroke | Shijo Dori, Kawaramachi |
| Secondary roads | `#ffffff` | Sanjo, Oike, Higashioji |

Pins approximate real Kyoto geography. Code implementation should use Leaflet + OSM tiles; the Pencil asset is a high-fidelity vector stand-in when live tiles are unavailable.

## Implementation roadmap

| Priority | Work | Pencil section | React target |
|----------|------|----------------|--------------|
| **P0** | Done design/code sync | `lngHk` + `rsL1N` | Align `AiPromptBar` to `m5ldW7` |
| **P1** | Kanban canvas + view switcher | `XFqhW`, `GTWXC` | `TripCanvasKanbanView`, `WorkspaceViewSwitcher` |
| **P2** | Map view | `v3Oai` + `GTWXC` | `TripMapView`, `react-leaflet`, route panel + chips |
| **P3** | Geo grounding | `kMh8w` Dump | Card `location`, geo chips, mini map |
| **P4** | Mobile modals | Add to Next if missing | Full-width dialog states |

**Map** code handoff details:

- `workspaceView: 'canvas' | 'map'` in Trip Workspace state
- Optional `location?: { lat: number; lng: number }` on `CanvasCard` in `src/models/trip.ts`
- Kyoto fixture coordinates in `src/data/tripData.ts`
- `react-leaflet` + `leaflet` for OpenStreetMap tiles
- Route stays `/trips/:tripId` — views toggle in-place, no new routes

**Retired:** standalone Days schedule view (`ydtqA`) — replaced by Kanban columns. Pencil `Days` frames remain as reference for activity row styling (`UmcVd`).

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
