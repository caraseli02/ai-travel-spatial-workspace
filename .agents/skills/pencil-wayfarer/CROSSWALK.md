# Pencil → shadcn → React crosswalk

Maps imported Pencil shadcn refs (`5:*`) to code. Domain components compose these — screens should not reference raw frames.

## Buttons

| Pencil ref | Pencil name | shadcn | Code |
|------------|-------------|--------|------|
| `5:VSnC2` | Button/Default | `button` `default` | `@/components/ui/button` |
| `5:C3KOZ` | Button/Large/Default | `button` `default` `lg` | same |
| `5:e8v1X` | Button/Secondary | `button` `secondary` | same |
| `5:C10zH` | Button/Outline | `button` `outline` | same |
| `5:ghKmL` | Button/Large/Outline | `button` `outline` `lg` | same |
| `5:3f2VW` | Button/Ghost | `button` `ghost` | same |
| `5:l7zpS` | Button/Large/Ghost | `button` `ghost` `lg` | same |
| `5:YKnjc` | Button/Destructive | `button` `destructive` | same |

## Icon buttons

| Pencil ref | Pencil name | shadcn | Code |
|------------|-------------|--------|------|
| `5:urnwK` | Icon Button/Default | `button` `icon` | `@/components/ui/button` |
| `5:hXOUF` | Icon Button/Outline | `button` `outline` `icon` | same |
| `5:ZIV1t` | Icon Button/Large/Default | `button` `icon` `lg` | same |

## Badge, Card, Tabs

| Pencil ref | Pencil name | shadcn | Code |
|------------|-------------|--------|------|
| `5:UjXug` | Badge/Default | `badge` `default` | `@/components/ui/badge` |
| `5:WuUMk` | Badge/Secondary | `badge` `secondary` | same |
| `5:3IiAS` | Badge/Outline | `badge` `outline` | same |
| `5:pcGlv` | Card | `card` | `@/components/ui/card` |

### Card slots (`5:pcGlv`)

| Slot ID | Name | React mapping |
|---------|------|---------------|
| `5:CgJv7` | Header | `CardHeader` / image banner |
| `5:frWPV` | Content | `CardContent` |
| `5:bvhSM` | Actions | `CardFooter` |

Disable unused slots on instances: `Update(instance+"/5:CgJv7", { enabled: false })`.
| `5:PbofX` | Tabs | `tabs` | `@/components/ui/tabs` |
| `5:coMmv` | Tab Item/Active | `TabsTrigger` (active) | same |
| `5:QY0Ka` | Tab Item/Inactive | `TabsTrigger` | same |

## Forms & dialogs

| Pencil ref | Pencil name | shadcn | Code |
|------------|-------------|--------|------|
| `5:fEUdI` | Input/Default | `input` | `@/components/ui/input` |
| `5:1415a` | Input Group/Default | `input` + `label` | `input`, `label` |
| `5:BjRan` | Textarea Group/Default | `textarea` + `label` | *(add via CLI if missing)* |
| `5:w5c1O` | Select Group/Default | `select` | *(add via CLI if missing)* |
| `5:X6bmd` | Modal/Center | `dialog` | `@/components/ui/dialog` |
| `5:OtykB` | Dialog | `dialog` | same |

## Wayfarer domain → React

| Pencil ref | Component | React file |
|------------|-----------|------------|
| `juOuS` | Wayfarer / Brand Mark | inline in pages |
| `GK0nB` | Wayfarer / Trip Card | `TripCard.tsx` |
| `ZQPee` | Wayfarer / New Trip Card | `TripListPage.tsx` |
| `l6uTL` | Wayfarer / Trip List Header | `TripListPage.tsx` |
| `ZPaim` | Wayfarer / Trip List Filter Bar | `TripListPage.tsx` |
| `YK92H` | Wayfarer / Trip List Prompt Bar | `TripListPage.tsx` |
| `zVsPD` | Wayfarer / Workspace Header | `TripWorkspace.tsx` |
| `YeJCA` | Wayfarer / Workspace Header Mobile | `TripWorkspace.tsx` |
| `tS1mE` | Wayfarer / Inbox Panel | `InboxPanel.tsx` |
| `l5hjXc` | Wayfarer / Card Detail Panel | `CardDetailPanel.tsx` |
| `m5ldW7` | Wayfarer / AI Prompt Bar | `TripWorkspace.tsx` |
| `iMiJf` | Wayfarer / Create Card Modal | `TripWorkspace.tsx` |
| `nn5gb` | Wayfarer / Add Day Modal | `TripWorkspace.tsx` |
| `y29TzH`…`urxZM` | Canvas card types | `CanvasCards.tsx` |

Add new rows when creating domain components.
