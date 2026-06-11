# Mobile screens — agent prompt

Copy everything below the line into a new chat when ready to draw mobile screens in Pencil.

---

## Task

Design **all Wayfarer mobile screens (390 × 844)** in `pencil-shadcn.pen`. Desktop is done — mobile lives in **separate top-level frames only**. Do not modify `Wayfarer / Desktop / *` frames except as visual reference.

## Mandatory setup (do first)

1. Load `.agents/skills/pencil-wayfarer/SKILL.md`
2. Read `docs/design/README.md`, `docs/design/patterns.md`, `docs/design/foundations.md`
3. Pencil MCP:
   - `get_editor_state({ include_schema: true })`
   - `get_guidelines({ category: "guide", name: "Mobile App" })`
   - `get_guidelines({ category: "guide", name: "Design System" })`
   - `get_guidelines({ category: "guide", name: "Web App" })`
4. Open **Wayfarer / Index** (`d3HbiR`) to confirm file map

## File rules (non-negotiable)

- **Only** edit frames under `Wayfarer / Mobile / *`
- Each mobile page: **Cover** (already exists) + **Screens** stack (80px gap)
- Screen frames: **390px wide**, `fit_content(844)` height unless content is shorter
- Compose from **L2 domain refs** in `DS / 05–06` — never raw shadcn in screens
- Use tokens: `$5:--*` (shadcn), `$wf-*` / `$wf-dark-*` (Wayfarer) — no hardcoded hex on chrome
- `get_screenshot` after every finished state; update surface doc with final node IDs

## Mobile layout shell (every screen)

```
┌─────────────────────────────┐
│ Status bar (62px, Inter)    │
├─────────────────────────────┤
│ Content wrapper             │
│ padding: 16–20px horizontal │
│ gap: 24–32 between sections │
│ (all app UI inside here)    │
├─────────────────────────────┤
│ [optional bottom chrome]    │
│ prompt bar / tab bar        │
└─────────────────────────────┘
```

- Status bar first, then content wrapper, then bottom chrome if needed
- No spacer frames — use wrapper `gap` and bottom padding
- Touch targets ≥ 44px; primary actions in lower half where possible
- One primary action per screen section

## Work order

Complete one surface fully (all states + doc update) before starting the next.

### Phase 1 — Trip Canvas (`Wayfarer / Mobile / Trip Canvas` · `rsL1N`)

**Reference desktop:** `lngHk` · **Domain components:** `g967C` · **Doc:** `docs/design/trip-canvas.md`

| State | Placeholder ID | Action |
|-------|----------------|--------|
| Default | `m3QEJS` | **Polish existing** — align with Mobile App guide shell; reuse `YeJCA`, stacked cards, compact stats |
| Inbox closed | `CJK2w` | Replace TBD — full-width canvas, no inbox; mirror desktop `yPpUn` |
| Card selected | `ityzB` | Replace TBD — detail as **bottom sheet** (not right drawer); hotel fixture from `NZsxF` |

**Mobile adaptations:**
- Pattern B collapses: no side inbox — inbox becomes sheet or hidden (inbox closed state)
- `l5hjXc` detail → full-width sheet over canvas, not 280px right column
- `m5ldW7` prompt bar → full width minus wrapper padding, pinned above safe area
- Header: `YeJCA` (two-row: trip row + day strip)
- Keep Kyoto demo fixture from `tripData.ts` / desktop `qjIgb`

### Phase 2 — Trip List (`Wayfarer / Mobile / Trip List` · `uqZ1a`)

**Reference desktop:** `i8BjSi` · **Domain components:** `x76EWb` · **Doc:** `docs/design/trip-list.md`

| State | Placeholder ID | Action |
|-------|----------------|--------|
| Default | `CXcSq` | Replace TBD — 1-col card stack, filter bar, bottom prompt bar |
| Chat open | `F4YBRc` | Replace TBD — chat as **bottom sheet** (not 380px left sidebar) |
| New trip dialog | *(add frame)* | Full-width modal; mirror `rVIzu` |
| Empty | *(add frame)* | Mirror `IV3cl` — new trip + Plan with AI card |
| No matches | *(add frame)* | Mirror `N5RjEK` |

**Mobile adaptations:**
- Pattern D: 1 column @ 390px (not 3-col grid)
- Pattern C: `YK92H` pinned to bottom inside screen frame
- Filter bar `ZPaim`: horizontal scroll for status tabs
- Theme: Stone + Orange + **Dark** (`$wf-dark-bg`, `$wf-dark-surface`)

### Phase 3 — Landing (`Wayfarer / Mobile / Landing` · `LWbNo`)

**Reference desktop:** `elmGx` (`nNgwc`) · **Doc:** `docs/design/landing-page.md`

| State | Placeholder ID | Action |
|-------|----------------|--------|
| Default | `T6zvU` | Replace TBD — full mobile marketing page |

**Mobile adaptations:**
- Nav: logo + hamburger (`menu` icon); hide inline anchor links
- Hero: single column, smaller headline, stacked CTAs
- Canvas showcase: single column tabs, smaller preview
- Pricing: single column tiers (not 3-col)
- Photo strip: 2 visible images or horizontal scroll
- Theme: Stone + Orange + **Light**
- Sections mirror desktop order in `landing-page.md`

## Per-state checklist

Before marking a state done:

- [ ] 390px wide, named `{Surface} — {State}` (no `[TBD]` prefix)
- [ ] Status bar + content wrapper with 16–20px horizontal padding
- [ ] Composed from domain refs (`Wayfarer / *`) only
- [ ] Theme axes set on screen frame (Light or Dark)
- [ ] Matches desktop fixture copy and hierarchy
- [ ] `get_screenshot` looks correct
- [ ] `docs/design/{surface}.md` mobile table updated with node ID

## Do not

- Edit `Wayfarer / Desktop / *` or `Wayfarer / DS / *` (unless adding a mobile-only domain variant — then document it)
- Put mobile frames inside desktop parents
- Invent new layout patterns — use A–E from `patterns.md` with mobile adaptations noted above
- Implement React code in this task — Pencil only
- Skip doc updates

## Deliverables

1. All mobile states drawn in `Mobile / Landing`, `Mobile / Trip List`, `Mobile / Trip Canvas`
2. Updated `docs/design/landing-page.md`, `trip-list.md`, `trip-canvas.md` mobile tables
3. Brief summary: states completed, any new mobile-only components created, screenshots verified
