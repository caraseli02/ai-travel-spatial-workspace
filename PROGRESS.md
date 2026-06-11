# Progress

Last updated: 2026-06-11

This file is the durable handoff point for current project state. Update it when work changes the roadmap, verification baseline, or harness expectations.

## Operational Snapshot

Update this section at clock-out for multi-session or non-issue work. For a single `ready-for-agent` issue, the GitHub issue and PR are enough.

- Latest commit: `479aee0` (PROGRESS snapshot after PR #35 merge)
- Test status: 69/69 passing (`make test`)
- Full check: pass on 2026-06-11 (`make check` — test, build, lint, typecheck)
- Active WIP: NONE
- In progress: none
- Known issues: oxlint warnings remain in test files only (non-blocking)
- Next steps:
  1. Resume feature work from GitHub Issues (`ready-for-agent`)

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
- `docs/agents/harness.md` records harness rules, fresh-session checks, L1–L7 references, and Matt Pocock skill integration.
- `docs/agents/startup-readiness.md` defines initialization acceptance.
- `Makefile` standardizes setup, development, test, build, and full verification commands.
- `src/AGENTS.md` gives source-area routing near implementation files.
- Session handoffs: `/handoff` → OS temp (Matt Pocock default); durable state in issues and `PROGRESS.md`.
- Last harness audit: 2026-06-11 (Lectures 1–7 gap closure).

## Verification Baseline

- Standard test command: `make test`
- Standard build command: `make build`
- Lint: `make lint`
- Typecheck: `make typecheck` (`tsconfig.check.json` excludes `*.test.ts`)
- Full consistency check: `make check` (test, build, lint, typecheck)
- Last verified on 2026-06-11: `make check` passed.

When verification cannot be run, record the reason in the final task handoff rather than editing this file for transient failures.

## Open Follow-Ups

- Keep `docs/architecture/codebase-map.md` updated when source organization changes.
- Convert recurring historical notes into tests or ADRs instead of adding more entry-file rules.
- Optionally tighten test-file types so `tsconfig.json` can typecheck tests without exclusion.
- Continue the GitHub roadmap around Trip Material memory and agent planning: #23 and #24 are PRDs; #26-#30 remain ready-for-agent follow-up issues after #25 was completed.
