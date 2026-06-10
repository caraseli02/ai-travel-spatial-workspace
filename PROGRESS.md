# Progress

Last updated: 2026-06-10

This file is the durable handoff point for current project state. Update it when work changes the roadmap, verification baseline, or harness expectations.

## Current State

- Wayfarer is a local React/Vite prototype with localStorage-first Trip persistence.
- The main product surfaces are Landing Page, Trip List, and Trip Workspace.
- Domain vocabulary is tracked in `CONTEXT.md`.
- Architecture decisions are tracked in `docs/adr/`.
- Design migration guidance lives in `docs/design/`.

## Harness State

- `AGENTS.md` and `CLAUDE.md` are short routing entry files.
- `docs/agents/harness.md` records harness rules, fresh-session checks, and documentation placement.
- `Makefile` standardizes setup, development, test, build, and full verification commands.
- `src/AGENTS.md` gives source-area routing near implementation files.

## Verification Baseline

- Standard test command: `make test`
- Standard build command: `make build`
- Full consistency check: `make check`
- Last verified on 2026-06-10: `make check` passed (Trip Workspace shadcn migration + design parity fixes).

When verification cannot be run, record the reason in the final task handoff rather than editing this file for transient failures.

## Open Follow-Ups

- Add a lint/typecheck command only if the project adopts one in `package.json`.
- Keep `docs/architecture/codebase-map.md` updated when source organization changes.
- Convert recurring historical notes into tests or ADRs instead of adding more entry-file rules.
