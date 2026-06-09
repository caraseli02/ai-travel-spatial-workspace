# Composition patterns (quick reference)

Full detail: [docs/design/patterns.md](../../../docs/design/patterns.md)

## Screen layouts

| Pattern | Surfaces | Key refs |
|---------|----------|----------|
| Header + content | Trip List, Landing | `l6uTL`, `zVsPD` |
| Sidebar + canvas | Trip Canvas | `tS1mE` + canvas frame |
| Fixed prompt bar | Trip List, Canvas | `YK92H`, `m5ldW7` |
| Card grid | Trip List | `ZQPee`, `GK0nB` |
| Modal overlay | All dialogs | `5:X6bmd`, `iMiJf`, `nn5gb` |

## Card slots (`5:pcGlv`)

| Slot | ID | Disable when |
|------|-----|--------------|
| Header | `5:CgJv7` | Empty-state helper cards |
| Content | `5:frWPV` | New trip dashed card |
| Actions | `5:bvhSM` | Content-only cards |

## Spacing

Sections 24–32 gap · card grid 16–24 · headers `[16,48]` padding · button groups gap 12.

## Button priority

`5:VSnC2` primary → `5:C10zH` outline → `5:3f2VW` ghost → `5:YKnjc` destructive. One primary per section.
