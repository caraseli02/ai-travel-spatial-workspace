# Progress

Last updated: 2026-07-23

This file is the durable handoff point for current project state. Update it when work changes the roadmap, verification baseline, or harness expectations.

## Operational Snapshot

Update this section at clock-out for multi-session or non-issue work. For a single `ready-for-agent` issue, the GitHub issue and PR are enough.

- Latest commit: `c2e30c5` (cover oldest in-progress continue routing, #189) on `main`
- Test status: tracked by CI `check` on `main`; loop-state contract tests cover WIP routing and SHA-bound evaluator markers
- E2E status: Playwright smoke is part of `make check`
- Full check: use `make check` before merge/release verification
- Active WIP: none
- In progress: none
- Known issues: local shell may run Node `>=25`, while the repo baseline is Node 22 LTS; `npm ci` passes but reports an engine warning until the local runtime is switched. npm audit reports dependency findings from Playwright; deferred to a scoped dependency-maintenance issue.
- Next steps:
  1. Pick the next `ready-for-agent` product or tech-debt slice from the open backlog.

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
- Autonomous controller/evaluator loop: `docs/agents/autonomous-workflow.md`, `docs/agents/automation-queue.md`, `scripts/loop-state.sh`, `make loop-state` / `make loop-prompt` / `make loop-run`.
- Runtime baseline: Node 22 LTS via `.nvmrc` and `package.json` `engines`.
- CI: GitHub Actions `Check` workflow runs `npm ci`, installs Chromium, and runs `make check`.
- Last harness audit: 2026-07-23 (loop-state repair payload + multi-PR openPrCount + PROGRESS refresh).

## Verification Baseline

- Standard test command: `make test`
- Standard build command: `make build`
- Lint: `make lint` (strict, warnings fail)
- Typecheck: `make typecheck` (`tsconfig.check.json` excludes `*.test.ts`)
- E2E smoke: `make e2e`
- Fresh-session check: `make fresh-session-test`
- Full consistency check: `make check` (test, build, strict lint, typecheck, E2E, fresh-session test)
- Loop-state contract: `npm test -- scripts/loop-state.test.mjs`
- UI/runtime flow evidence: for visible UI, routing, localStorage persistence, or cross-component changes beyond smoke coverage, record a browser/full-flow check in addition to `make check`.
- Last verified on 2026-07-23: focused `scripts/loop-state.test.mjs` updates for repair-without-issue, openPrCount, and evaluatorComment; full `make test` before merge.

When verification cannot be run, record the reason in the final task handoff rather than editing this file for transient failures.

## Open Follow-Ups

- Keep `docs/architecture/codebase-map.md` updated when source organization changes.
- Convert recurring historical notes into tests or ADRs instead of adding more entry-file rules.
- Optionally tighten test-file types so `tsconfig.json` can typecheck tests without exclusion.
- Resolve npm audit findings with a focused dependency-maintenance pass.
- Work the open tech-debt and product backlog, prioritizing `ready-for-agent` slices.
