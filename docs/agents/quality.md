# Quality Health

This document tracks codebase health signals that should survive session boundaries. Update it when a module's risk changes, a recurring issue appears, or a cleanup candidate is created.

## Current Ratings

| Area | Rating | Evidence | Next action |
| --- | --- | --- | --- |
| Harness | Strong | Split routing docs, `make check`, CI, E2E smoke, startup checks. | Keep entry files short and maintain `PROGRESS.md`. |
| Domain model | Strong | 99 unit tests cover Trip Repository, Trip Workspace Model, Trip Material memory, Linking Session, agent context, and the planner (wired via #49). | Add focused tests alongside the tech-debt module splits (#59, #60). |
| UI runtime flows | Improving | Playwright smoke covers Landing Page, Trip List, Trip Workspace routing, and localStorage persistence. | Add focused E2E flows for new UI behavior beyond smoke coverage. |
| Environment | Improving | `.nvmrc`, `package.json` engines, `npm ci`, and CI are in place. | Use Node 22 LTS locally before release verification. |
| Dependency health | Needs follow-up | `npm install --save-dev @playwright/test` reports 4 audit findings. | Run a scoped dependency-maintenance issue; avoid broad force updates during feature work. |

## Coverage Expectations

`make test-coverage` runs Vitest with V8 coverage over `src/models/` and
`src/utils/`. The gate is 80% for lines, functions, statements, and branches so
changes to Trip Workspace Model and helper behavior keep meaningful test
coverage. Current model/utils baseline from the 2026-07-01 run: 92.15%
statements, 80.68% branches, 97.97% functions, and 92.47% lines.

## Recurring Issues

- Stale session state: `PROGRESS.md` can drift from GitHub issue state. Mitigation: update Operational Snapshot during non-issue or multi-session work.
- Temporary visual artifacts: screenshots and `.pen.bak` files can pollute the worktree. Mitigation: `.gitignore` covers root screenshots and Pencil backups; referenced generated images stay tracked.
- UI verification gaps: unit tests do not prove route, browser, or localStorage flows. Mitigation: `make e2e` is part of `make check`.

## Cleanup Candidates

- Tighten test typechecking so test files can move into the default typecheck path (#56).
- Convert repeated browser bugs into focused Playwright/E2E tests (#58, #61).
- Audit dependency vulnerabilities in a separate maintenance issue.

## Harness Simplification Notes

- Keep GitHub Issues as the feature-list primitive; do not add `feature_list.json` unless issue-state drift becomes unmanageable.
- Prefer adding a command, test, or template before adding another prose rule.
- Keep-or-fold review (2026-06-24): this file is retained — its module ratings and dependency-health signals are not duplicated in `PROGRESS.md`. Fold it into `PROGRESS.md` only if these ratings stop changing between audits.
