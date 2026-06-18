# Implementation Workflow

Use this workflow when an agent is asked to implement a GitHub issue labeled
`ready-for-agent`.

## Goal

A fresh implementation agent should be able to pick one issue, complete it in a
branch, verify it, and open a PR without relying on chat history.

This workflow is the Wayfarer glue between the static harness (`AGENTS.md`,
`docs/agents/harness.md`) and Matt Pocock skills (`triage`, `to-issues`, `tdd`,
`diagnose`). Epics decompose via `/to-issues`; each child issue is one scope
unit.

## Issue Readiness

An issue is ready for agent work when it has:

- A parent PRD or parent issue link when the work belongs to a larger feature.
- A concise "What to build" section describing end-to-end behavior.
- Acceptance criteria written as observable outcomes.
- A "Blocked by" section.
- The `ready-for-agent` label.

Do not start a blocked issue until every blocker is merged, not merely opened.

## Session Rules

- WIP=1: one active `ready-for-agent` issue per session.
- Finish verification for the current issue before starting another.
- Do not refactor outside the agent brief **Out of scope** section.
- Done means every acceptance criterion has a recorded verification command and
  pass/fail result in the PR.
- UI, routing, persistence, and other cross-component changes require `make e2e`
  or focused browser evidence, not only unit/model tests.

## Working an Issue

1. Read the issue body, agent brief, parent PRD, and blocking issues.
2. Read `CONTEXT.md`, `docs/agents/domain.md`, relevant ADRs, and
   `docs/architecture/codebase-map.md`.
3. Create a branch named `codex/issue-<number>-short-title`.
4. Implement only the issue scope.
5. Add or update tests for the acceptance criteria.
6. Run verification:
   - `make test` for behavior-only changes.
   - `make check` for runtime, build, or UI changes.
   - Focused browser/full-flow verification for visible UI, routing, localStorage
     persistence, or multi-component interactions.
7. Open a PR that links the issue, lists acceptance criteria status, and records
   the exact verification commands run.

## Branches

Use the default branch prefix `codex/`.

Examples:

- `codex/issue-25-trip-material-provenance`
- `codex/issue-28-agent-planner-outcomes`

## PR Format

Use this structure:

```md
## Summary

- What changed
- What user-visible behavior now works

## Acceptance Criteria

- [x] Criterion copied from issue
- [x] Criterion copied from issue
- [ ] Criterion not completed, with reason

## Verification

Record exact commands and results, for example:

- `make test` — pass
- `make check` — pass (test, build, strict lint, typecheck, E2E, fresh-session test)
- Browser check: `/trips/:tripId` card edit persists after reload — pass

Per-criterion checks from the agent brief should appear here when provided.

## Linked Issue

Closes #<issue-number>
```

Only mark an acceptance criterion complete when the implementation and
verification support it.

## When To Ask A Human

Ask before continuing when:

- Acceptance criteria conflict with the parent PRD or an ADR.
- The issue requires product judgment not present in the issue or parent PRD.
- The implementation requires changing scope beyond the issue.
- A blocker is not merged.
- Verification exposes an unrelated failing test and the fix is not obvious.

Do not ask for routine implementation choices when the codebase already shows a
clear pattern.

## Label Use

- `ready-for-agent`: issue can be picked up by an implementation agent.
- `needs-info`: issue cannot proceed without user or maintainer input.
- `ready-for-human`: issue needs human product, design, or architecture work.
- `needs-triage`: issue has not been evaluated.
- `wontfix`: issue will not be actioned.

See `docs/agents/triage-labels.md` for the canonical label mapping.

## Closing The Loop

When a PR is merged:

- Close the issue through the PR with `Closes #<issue-number>`.
- If child issues become unblocked, leave them labeled `ready-for-agent`.
- If implementation discovers durable domain language, update `CONTEXT.md`.
- If implementation creates or changes durable architecture decisions, add or
  update an ADR.
