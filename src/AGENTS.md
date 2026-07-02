# Source Area Guide

Read this when editing files under `src/`.

## Map

- `App.tsx`: route composition for Landing Page, Trip List, and Trip Workspace.
- `components/`: user-facing React surfaces and UI composition.
- `components/ui/`: owned shadcn primitives.
- `models/`: domain schemas, Trip Repository interface, repository implementation, and pure Trip Workspace behavior.
- `hooks/`: React coordination for Trip Workspace state, Spatial Canvas viewport behavior, and Linking Session state.
- `data/`: Demo Trip fixtures and factories.
- `utils/`: small helpers with focused tests.

## Local Rules

- Keep Trip Workspace state transitions in `models/tripWorkspaceModel.ts` when behavior does not require React rendering.
- Keep localStorage access behind `models/tripRepository.ts`.
- Prefer testing pure behavior in `models/`, `hooks/`, or `utils/` before testing through component rendering.
- Use shadcn primitives from `components/ui/` for new interactive controls when a primitive exists.
- Update `docs/architecture/codebase-map.md` if a source-area responsibility moves.
- New or growing files must pass `make file-size-check`. Extract feature subfolders (`trip-list/`, `trip-workspace/`, etc.) before a coordinator reaches ~500 lines. See `docs/agents/file-size-limits.json`.
