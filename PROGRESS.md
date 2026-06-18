# Progress

Last updated: 2026-06-18

This file is the durable handoff point for current project state. Update it when work changes the roadmap, verification baseline, or harness expectations.

## Operational Snapshot

Update this section at clock-out for multi-session or non-issue work. For a single `ready-for-agent` issue, the GitHub issue and PR are enough.

- Latest commit: `479aee0` (PROGRESS snapshot after PR #35 merge)
- Test status: 85/85 passing (`make test`, 2026-06-18)
- E2E status: 3/3 passing (`make e2e`, 2026-06-18)
- Full check: pass on 2026-06-18 after merging `origin/main` (`make check` — test, build, strict lint, typecheck, E2E, fresh-session test)
- Active WIP: harness-readiness closure on `codex/update-harness-trip-canvas-design`
- In progress: none; harness-readiness closure implementation is verified and ready for review.
- Known issues: local shell is currently Node `v25.8.1`, while the repo baseline is Node 22 LTS; `npm ci` passes but reports an engine warning until the local runtime is switched. npm audit reports 4 dependency findings after adding Playwright (2 low, 2 high); no fix applied yet because it may require broader dependency changes.
- Next steps:
  1. Finish harness-readiness verification and clean temporary artifacts.
  2. Use #29, "Route Workspace AI Prompt through the agent planner," as the next implementation slice after this harness work lands.

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

- `AGENTS.md` and `CLAUDE.md` are short routing entry files with Work Rules (WIP=1).
- `docs/agents/harness.md` records harness rules, fresh-session checks, L1–L12 references, GitHub Issues as the scope surface, completion validation, observability, clean-state rules, and Matt Pocock skill integration.
- `docs/agents/startup-readiness.md` defines initialization acceptance.
- `docs/agents/quality.md` tracks module health, recurring issues, cleanup candidates, and harness simplification.
- `Makefile` standardizes setup, development, test, build, E2E, doctor, fresh-session, and full verification commands.
- Runtime baseline: Node 22 LTS via `.nvmrc` and `package.json` `engines`.
- CI: GitHub Actions `Check` workflow runs `npm ci`, installs Chromium, and runs `make check`.
- `src/AGENTS.md` gives source-area routing near implementation files.
- Session handoffs: `/handoff` → OS temp (Matt Pocock default); durable state in issues and `PROGRESS.md`.
- Last harness audit: 2026-06-15 (Lectures 8–10 gap closure).

## Verification Baseline

- Standard test command: `make test`
- Standard build command: `make build`
- Lint: `make lint` (strict, warnings fail)
- Typecheck: `make typecheck` (`tsconfig.check.json` excludes `*.test.ts`)
- E2E smoke: `make e2e`
- Fresh-session check: `make fresh-session-test`
- Full consistency check: `make check` (test, build, strict lint, typecheck, E2E, fresh-session test)
- UI/runtime flow evidence: for visible UI, routing, localStorage persistence, or cross-component changes beyond smoke coverage, record a browser/full-flow check in addition to `make check`.
- Last verified on 2026-06-18 after merging `origin/main`: `make check` passed with 85 unit tests, build, strict lint, typecheck, 3 E2E tests, and fresh-session test.

When verification cannot be run, record the reason in the final task handoff rather than editing this file for transient failures.

## Open Follow-Ups

- Keep `docs/architecture/codebase-map.md` updated when source organization changes.
- Convert recurring historical notes into tests or ADRs instead of adding more entry-file rules.
- Optionally tighten test-file types so `tsconfig.json` can typecheck tests without exclusion.
- Resolve npm audit findings with a focused dependency-maintenance pass.
- Continue the GitHub roadmap around Trip Material memory and agent planning: #23 and #24 are PRDs; #28 and #30 are closed; #29 is the next open implementation issue now that #28 is closed.
