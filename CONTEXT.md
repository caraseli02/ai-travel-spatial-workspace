# Context

This repo is a React/Vite prototype for Wayfarer, an AI-native travel workspace. The product helps a traveler collect messy trip inputs, organize them into a spatial planning canvas, and shape them into day-by-day itinerary structure.

## Glossary

### Wayfarer

The product represented by this app. Wayfarer turns loose travel research into a visual trip workspace.

### Trip

A single travel plan scoped to one destination. A Trip owns a Trip Workspace and all its contents (Inbox Items, Canvas Cards, Connections, Day Groups). A traveler can have many Trips.
_Avoid_: project, itinerary (when referring to the container).

### Trip List

The intermediate page a traveler sees after the Landing Page. It displays all their Trips and lets them create, open, or manage them.
_Avoid_: dashboard, home screen.

### Trip Repository

The persistence interface that saves, loads, lists, and deletes Trips. The current implementation uses localStorage. The interface is designed so a backend implementation (e.g., Supabase) can be swapped in without changing domain logic.
_Avoid_: store, database, API when discussing the abstraction.

### Demo Trip

The pre-loaded "7 Days in Kyoto" Trip that ships with a fresh install. It demonstrates the product's value on first visit and can be deleted by the traveler.
_Avoid_: seed data, fixture, sample trip.

### Trip Workspace

The main planning surface for a trip. The Trip Workspace combines the inbox, spatial canvas, day filters, card detail panel, AI prompt bar, and creation dialogs.

Avoid: dashboard, board, generic app screen.

### Trip Workspace Model

The behavior module that owns Trip Workspace state transitions which do not require React rendering. The Trip Workspace Model classifies Trip Material, promotes Inbox Items into Canvas Cards, computes Connection endpoints, creates Day Groups and Day Labels, and applies mocked AI Prompt effects.

Avoid: store, service, reducer unless referring to implementation mechanics only.

### Inbox Item

A raw piece of trip material before it has been organized on the canvas. Inbox Items can come from WhatsApp-style tips, links, notes, flights, or hotel reservations.

Avoid: task, message, source row.

### Canvas Card

An organized travel object placed on the spatial canvas. Canvas Cards can represent places, notes, articles, flights, hotels, or logistics.

Avoid: tile, widget, generic card when discussing domain behavior.

### Spatial Canvas

The pannable and zoomable planning surface where Canvas Cards are positioned, grouped, dragged, filtered, and connected.

Avoid: page, list, grid.

### Day Group

A day-level itinerary grouping, such as "Day 2 — Fushimi Inari + Gion". Day Groups drive day filters and day labels on the Spatial Canvas.

Avoid: tab, category, section.

### Day Label

The visual marker for a Day Group on the Spatial Canvas. A Day Label has coordinates and color metadata used to place and style the group label.

Avoid: badge, pill, header when discussing domain behavior.

### Connection

A relationship between two Canvas Cards. Connections are rendered as lines on the Spatial Canvas and can be seeded, AI-created, or manually created through linking mode.

Avoid: edge unless describing graph mechanics only.

### Linking Session

The transient, active state of manual connection creation. A traveler initiates a Linking Session from an origin Canvas Card and completes it by selecting a destination Canvas Card, creating a Connection.

Avoid: link state, connecting mode.

### Optimized Sequence

A sequentially ordered, directed path of Canvas Cards on a specific Day Group. In the current prototype, it is generated using a metadata-aware sorting algorithm (ordering by card type and time-of-day tags). In future versions, this will be powered by real-time agent context (crowdedness, opening hours, local transit data).

Avoid: route, itinerary path.



### Card Detail Panel

The editing and inspection surface for the selected Canvas Card. It owns local edit controls but pushes Canvas Card updates back to the Trip Workspace.

Avoid: sidebar when discussing domain behavior.

### AI Prompt

A natural-language request entered by the traveler to add or reshape trip structure. In the current prototype, AI Prompt handling is mocked with deterministic string matching.

Avoid: chat message unless specifically discussing the input UI.

### AI Chat Sidebar

The side panel on the Trip List that preserves and displays the conversational history of AI-assisted trip creation and general planning inquiries. In the UI, it is positioned on the left side of the screen for familiar sidebar navigation.

Avoid: chat panel, dashboard sidebar.

### Procedural Trip Generator

The background parser and generator that translates raw, conversational prompts into a structured Trip model, complete with appropriate dates, travelers, budgets, and pre-populated Canvas Cards.

Avoid: AI compiler, trip factory.


### Trip Material

The loose travel research and planning inputs a traveler collects before Wayfarer organizes them.

Examples: flight links, booking confirmations, local tips, restaurant articles, personal reminders.

Avoid: data, content, assets when discussing the domain.

## Current Prototype Assumptions

- A traveler can have multiple Trips, each scoped to one destination.
- Trip data is persisted to localStorage via the Trip Repository interface.
- The "7 Days in Kyoto" Demo Trip is pre-loaded on first visit and seeded only once ever; once deleted, it is never automatically re-seeded.
- New Trips start with an empty workspace (blank canvas, empty inbox).
- AI behavior is mocked inside the client (deterministic string matching).
- The Trip List has both a "+ New Trip" button and a prompt bar for chat-driven creation.
- The Trip List prompt bar and the Workspace AI Prompt are separate components with different scopes.
- Routing uses react-router: `/` (landing), `/trips` (trip list), `/trips/:id` (workspace).
- Landing Page "Enter Demo" navigates directly to the Demo Trip workspace; Trip List is discovered via back navigation.
- Canvas coordinates are fixed-size prototype coordinates.
- Trip Workspace state transitions are characterized by tests in `src/models/tripWorkspaceModel.test.ts`.
- Share, export, authentication, and collaboration are visual affordances only.
- The coexistence of a dark-themed Trip List and light-themed Trip Workspace serves as a theme exploration, with full light/dark theme toggle support planned for a future release.


## Example Dialogue

> **Dev:** The user pastes a Booking.com link on the Trip List. What happens?
>
> **Domain expert:** The Trip List prompt bar parses it as Trip Material — specifically a hotel reservation. If no Trip exists for that destination, it creates a new Trip and drops the link into the Trip's inbox as an Inbox Item. If a matching Trip exists, it adds it to that Trip's inbox.
>
> **Dev:** And if the user opens that Trip, the Inbox Item is just sitting there unprocessed?
>
> **Domain expert:** Exactly. The traveler decides when to promote it to a Canvas Card. Wayfarer captures, the traveler organizes.
>
> **Dev:** What if the AI can't figure out the destination from the link?
>
> **Domain expert:** Then the prompt bar asks a clarifying question — "Which trip does this belong to?" It doesn't guess.
