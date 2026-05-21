# Context

This repo is a React/Vite prototype for Wayfarer, an AI-native travel workspace. The product helps a traveler collect messy trip inputs, organize them into a spatial planning canvas, and shape them into day-by-day itinerary structure.

## Glossary

### Wayfarer

The product represented by this app. Wayfarer turns loose travel research into a visual trip workspace.

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

### Trip Material

The loose travel research and planning inputs a traveler collects before Wayfarer organizes them.

Examples: flight links, booking confirmations, local tips, restaurant articles, personal reminders.

Avoid: data, content, assets when discussing the domain.

## Current Prototype Assumptions

- The seed trip is "7 Days in Kyoto".
- Trip data is local fixture state, not persisted.
- AI behavior is mocked inside the client.
- Canvas coordinates are fixed-size prototype coordinates.
- Trip Workspace state transitions are characterized by tests in `src/models/tripWorkspaceModel.test.ts`.
- Share, export, authentication, and collaboration are visual affordances only.
