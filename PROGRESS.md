# Progress

Last updated: 2026-06-24

This file is the durable handoff point for current project state. Update it when work changes the roadmap, verification baseline, or harness expectations.

## Operational Snapshot

Update this section at clock-out for multi-session or non-issue work. For a single `ready-for-agent` issue, the GitHub issue and PR are enough.

- Latest commit: `6cc2d2d` (Unify trip date formatting across Trip List and Trip Workspace, #74) on `main`
- Test status: 99/99 passing (`make test`, 2026-06-24)
- E2E status: 3/3 passing (`make e2e`, 2026-06-24)
- Full check: pass on 2026-06-24 (`make check` — test, build, strict lint, typecheck, E2E, fresh-session test)
- Active WIP: harness lecture alignment (dedupe entry files, refresh this snapshot, agent-oriented error guidance) — tracks issue #66.
- In progress: harness alignment edits; no feature implementation slice active.
- Known issues: local shell may run Node `>=25`, while the repo baseline is Node 22 LTS; `npm ci` passes but reports an engine warning until the local runtime is switched. npm audit reports dependency findings from Playwright; deferred to a scoped dependency-maintenance issue.
- Next steps:
  1. Land harness alignment work and close #66.
  2. Pick the next `ready-for-agent` tech-debt slice from the open backlog (e.g. #56 typecheck test files, #67 normalize import paths, #65 coverage gate).

## Current State

- Wayfarer is a local React/Vite prototype with localStorage-first Trip persistence.
- The main product surfaces are Landing Page, Trip List, and Trip Workspace.
- Domain vocabulary is tracked in `CONTEXT.md`.
- Architecture decisions are tracked in `docs/adr/`.
- Design implementation guidance lives in `docs/design/`.
- Pencil (`pencil-shadcn.pen`) is the versioned design source.
- shadcn/ui is the shared implementation foundation across Landing Page, Trip List, and Trip Workspace.
- Landing v2 is the canonical Landing Page direction; legacy Landing v1 frames are archival.

## Harness State

The harness design and rules live in `docs/agents/harness.md` (do not restate them here). This section records only the current snapshot facts:

- `AGENTS.md` is the canonical routing entry file; `CLAUDE.md` is a thin pointer to it (single source of truth).
- Runtime baseline: Node 22 LTS via `.nvmrc` and `package.json` `engines`.
- CI: GitHub Actions `Check` workflow runs `npm ci`, installs Chromium, and runs `make check`.
- Last harness audit: 2026-06-24 (L01–L12 lecture-alignment pass: entry-file dedupe, snapshot refresh, agent-oriented error guidance).

## Verification Baseline

- Standard test command: `make test`
- Standard build command: `make build`
- Lint: `make lint` (strict, warnings fail)
- Typecheck: `make typecheck` (`tsconfig.check.json` excludes `*.test.ts`)
- E2E smoke: `make e2e`
- Fresh-session check: `make fresh-session-test`
- Full consistency check: `make check` (test, build, strict lint, typecheck, E2E, fresh-session test)
- UI/runtime flow evidence: for visible UI, routing, localStorage persistence, or cross-component changes beyond smoke coverage, record a browser/full-flow check in addition to `make check`.
- Last verified on 2026-06-24: `make check` passed with 99 unit tests, build, strict lint, typecheck, 3 E2E tests, and fresh-session test.

When verification cannot be run, record the reason in the final task handoff rather than editing this file for transient failures.

## Open Follow-Ups

- Keep `docs/architecture/codebase-map.md` updated when source organization changes.
- Convert recurring historical notes into tests or ADRs instead of adding more entry-file rules.
- Optionally tighten test-file types so `tsconfig.json` can typecheck tests without exclusion.
- Resolve npm audit findings with a focused dependency-maintenance pass.
- Work the open tech-debt backlog (issues #53–#73), prioritizing `ready-for-agent` slices such as #56 (typecheck test files), #65 (coverage gate), and #67 (normalize import paths).
