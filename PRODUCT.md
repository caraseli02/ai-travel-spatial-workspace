# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Leisure travelers mid-planning a trip who have Trip Material scattered across chats, links, screenshots, and bookings. They need one place to capture that mess and turn it into a plan they can see and rearrange.

## Product Purpose

Wayfarer is an AI-native travel workspace. It helps a traveler collect loose Trip Material, organize it on a Spatial Canvas, and shape it into day-by-day Trip Workspace structure.

Success for this prototype matches the current demo default: from the Landing Page, primary actions open the pre-loaded **7 Days in Kyoto** Demo Trip workspace (`/trips/demo-kyoto`) in one click; Trip List is reached by navigating back from the workspace. A traveler can then capture material, promote Inbox Items to Canvas Cards, arrange and connect them, and work with Day Groups on the Spatial Canvas.

## Positioning

A spatial trip workspace — capture loose Trip Material, let AI help classify and place it, and plan on a pannable canvas by day — not a booking engine and not a linear itinerary checklist.

## Operating Context

- Routes: `/` (Landing Page), `/trips` (Trip List), `/trips/:tripId` (Trip Workspace).
- Surfaces: Landing Page marketing entry; Trip List hub (create/open Trips, AI chat affordance); Trip Workspace (inbox, Spatial Canvas, day filters, Card Detail Panel, AI Prompt).
- Persistence: Trip Repository over localStorage (swap-ready interface; no backend required for the prototype).
- First visit seeds the Kyoto Demo Trip once; after deletion it is not auto-reseeded.
- Domain vocabulary is canonical in `CONTEXT.md` (Trip, Trip Material, Inbox Item, Canvas Card, Spatial Canvas, Day Group, Connection, AI Prompt, etc.).

## Capabilities and Constraints

- Multiple Trips per traveler; each Trip scoped to one destination.
- AI Prompt handling is mocked in-client (deterministic matching), not a live model.
- Share, export, authentication, and collaboration are visual affordances only in the current prototype.
- Canvas coordinates are fixed-size prototype coordinates.
- Landing and Trip Workspace use light theme foundations; Trip List uses a dark hub (intentional exploration until a full theme toggle exists).
- Undecided: real backend, live AI, auth, multiplayer, and commercial packaging.

## Brand Commitments

Product name: **Wayfarer**. No separate brand book or additional binding voice/legal commitments were established beyond existing in-product copy and domain vocabulary.

## Evidence on Hand

- Demo Trip fixture and factories under `src/data/` (`demo-kyoto` / “7 Days in Kyoto”).
- Runnable product UI for Landing, Trip List, and Trip Workspace.
- Design references in `docs/design/` and Pencil sources referenced there.
- Usability/PRD notes under `docs/product/` where present.

Do not fabricate real customers, testimonials, press, benchmarks, or pricing claims.

## Product Principles

1. **Capture before organize** — Wayfarer holds loose Trip Material; the traveler decides when to promote and arrange.
2. **Spatial over linear** — the Spatial Canvas is the planning surface, not a checklist or calendar grid alone.
3. **Demo proves the product** — first success is opening and exploring the Kyoto Demo Trip, not empty-state onboarding theater.
4. **Domain language stays precise** — use Wayfarer vocabulary from `CONTEXT.md`; do not drift to avoided synonyms.
5. **Prototype honesty** — mocked AI and local persistence are product facts; do not imply live backend capabilities that are not built.
