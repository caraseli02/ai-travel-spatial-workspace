# Startup Readiness

A fresh agent session should reach an executable state from repo files alone in under three minutes. Use this checklist after clone or when onboarding a new harness.

## Four Conditions

1. **Can start** — dependencies install and the dev server runs.
2. **Can test** — the test runner passes at least one test.
3. **Can see progress** — current work is visible in `PROGRESS.md` Operational Snapshot or a linked GitHub issue.
4. **Can pick up next steps** — next actions are explicit, not only in chat history.

## Commands

| Action | Command |
| --- | --- |
| Install | `make setup` |
| Dev server | `make dev` |
| Tests | `make test` |
| Lint | `make lint` |
| Typecheck | `make typecheck` |
| Full verification | `make check` |

## Initialization Acceptance Checklist

Run on a clean clone with no chat context:

- [ ] `make setup` succeeds
- [ ] `make test` passes
- [ ] `make check` passes (test, build, lint, typecheck)
- [ ] A fresh session can answer run, verify, and progress questions from repo files alone
- [ ] Active work is visible in `PROGRESS.md` Operational Snapshot or a `ready-for-agent` issue

## Matt Pocock Skills Setup

Skill configuration for this repo lives in:

- `docs/agents/issue-tracker.md`
- `docs/agents/triage-labels.md`
- `docs/agents/domain.md`

Re-run `/setup-matt-pocock-skills` only when switching issue trackers or restarting skill configuration from scratch.

## Scope Surface

Epics decompose via `/to-issues` into GitHub Issues with `Blocked by` links. Do not maintain a separate `feature_list.json` — issues are the scope surface.
