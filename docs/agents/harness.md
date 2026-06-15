# Harness

This repo follows two harness principles:

- The repository is the system of record. Knowledge that must survive a session belongs in tracked files.
- Entry instructions are routers, not encyclopedias. Topic-specific details belong in focused docs or next to code.

Source lectures ([Learn Harness Engineering](https://walkinglabs.github.io/learn-harness-engineering/en/)):

- [L01 — Strong models don't mean reliable execution](https://walkinglabs.github.io/learn-harness-engineering/en/lectures/lecture-01-why-capable-agents-still-fail/)
- [L02 — What a harness actually is](https://walkinglabs.github.io/learn-harness-engineering/en/lectures/lecture-02-what-a-harness-actually-is/)
- [L03 — Repository as system of record](https://walkinglabs.github.io/learn-harness-engineering/en/lectures/lecture-03-why-the-repository-must-become-the-system-of-record/)
- [L04 — Split instructions across files](https://walkinglabs.github.io/learn-harness-engineering/en/lectures/lecture-04-why-one-giant-instruction-file-fails/)
- [L05 — Long-running task continuity](https://walkinglabs.github.io/learn-harness-engineering/en/lectures/lecture-05-why-long-running-tasks-lose-continuity/)
- [L06 — Initialization as its own phase](https://walkinglabs.github.io/learn-harness-engineering/en/lectures/lecture-06-why-initialization-needs-its-own-phase/)
- [L07 — Overreach and under-finish](https://walkinglabs.github.io/learn-harness-engineering/en/lectures/lecture-07-why-agents-overreach-and-under-finish/)
- [L08 — Feature lists as harness primitives](https://walkinglabs.github.io/learn-harness-engineering/en/lectures/lecture-08-why-feature-lists-are-harness-primitives/)
- [L09 — Prevent premature completion declarations](https://walkinglabs.github.io/learn-harness-engineering/en/lectures/lecture-09-why-agents-declare-victory-too-early/)
- [L10 — Full pipeline verification](https://walkinglabs.github.io/learn-harness-engineering/en/lectures/lecture-10-why-end-to-end-testing-changes-results/)

## Two-Layer Harness

| Layer | Role | Key locations |
| --- | --- | --- |
| Static harness | Always-on routing, verification, project state | `AGENTS.md`, `harness.md`, `PROGRESS.md`, `Makefile` |
| Matt Pocock skills | Issue workflow and execution on demand | `triage`, `to-issues`, `implementation-workflow`, `tdd`, `diagnose` |

Skill configuration: `docs/agents/issue-tracker.md`, `triage-labels.md`, `domain.md`.

Epics decompose via `/to-issues` into GitHub Issues — issues are the scope surface, not `feature_list.json`.

## Scope Surface

GitHub Issues are this repo's feature-list primitive. A `ready-for-agent` issue should provide the same triple a feature list would:

- Behavior: the "What to build" section describes observable user or system behavior.
- Verification: acceptance criteria and agent brief checks describe what evidence counts.
- State: labels, blockers, linked PRs, and issue/PR comments record whether the work is ready, active, blocked, or complete.

Pass-state gating is manual for now: do not treat an issue or acceptance criterion as complete until the PR records exact verification commands and results. If this becomes unreliable, add a script or CI check before adding more prose rules.

## Fresh Session Test

A fresh agent session should answer these questions using only repo files:

| Question | Source of record |
| --- | --- |
| What is this system? | `CONTEXT.md` |
| How is it organized? | `docs/architecture/codebase-map.md`, `src/AGENTS.md` |
| How do I run it? | `Makefile`, `package.json`, `docs/agents/startup-readiness.md` |
| How do I verify it? | `make check` (test, build, lint, typecheck) |
| What's the current progress? | `PROGRESS.md` Operational Snapshot + linked issue |

If an answer requires chat history or memory, add the missing knowledge to the smallest relevant file.

Target rebuild cost: under three minutes from clock-in to verified executable state.

## Instruction Placement

- Root `AGENTS.md` and `CLAUDE.md`: project overview, commands, hard constraints, work rules, and routing links only.
- `CONTEXT.md`: domain vocabulary, prototype assumptions, and examples that shape product behavior.
- `docs/adr/`: durable architecture decisions with considered options and consequences.
- `docs/architecture/`: current structural maps and cross-module explanations.
- `docs/agents/`: agent process, issue tracker, triage, harness, startup readiness.
- `docs/design/`: product design system and surface-specific design guidance.
- Nested `AGENTS.md`: local instructions that should be read only when working in that subtree.

## Hard Constraint Format

Only put a rule in the entry file when it is global, non-negotiable, and frequently relevant. Topic rules should include:

- Source: why the rule exists.
- Applies when: what work should load it.
- Expires when: what change would let us delete it.

## Failure Attribution

When an agent fails, classify the failure before adding new rules:

1. **Task specification** — vague requirements, missing acceptance criteria, no out-of-scope boundary.
2. **Context** — implicit conventions, missing ADR, wrong domain vocabulary.
3. **Environment** — setup broken, wrong toolchain, unreproducible commands.
4. **Verification** — no `make check`, agent declared done without recorded commands.
5. **State** — cross-session drift, missing handoff, stale `PROGRESS.md`.

Fix the harness layer that failed. Do not upgrade the model first.

## Completion Validation

Completion is external evidence, not agent confidence. Use this hierarchy:

1. Static layer: `make lint`, `make typecheck`, and `make build` where relevant.
2. Runtime behavior layer: `make test`, focused tests, and application startup checks.
3. Full-flow layer: browser or end-to-end verification for cross-component UI, routing, persistence, or interaction changes.

`make check` is the standard consistency command, but it is not enough by itself for visible UI or runtime workflow changes. Until a dedicated E2E harness exists, record a browser verification note with the route, flow exercised, and result. Example: `make dev` + browser check of `/trips/:tripId` card edit persistence — pass.

Do not refactor or polish adjacent code until the core behavior has passed the required validation layer. When a repeated review comment exposes a defect class, promote it into a test, lint rule, or focused check with an error message that says what failed and how to fix it.

## State Management

- Atomicity: keep each task scoped to a logical operation and avoid mixing unrelated changes.
- Consistency: run `make check` when the change can affect runtime behavior.
- Isolation: use branches and avoid rewriting unrelated dirty files.
- Durability: persist cross-session knowledge in repo files, not chat.

## Session Continuity

Use this routine for long-running work, interrupted work, or work that another agent may need to resume.

### Session Handoff Lifecycle

The Matt Pocock `/handoff` skill writes to the **OS temp directory**, not the repo. That is intentional: handoffs are ephemeral session bridges, not system-of-record docs. Committing them causes knowledge decay — old pickup notes look authoritative but go stale.

Before clock-out:

1. Run `/handoff` if the next session needs a chat compaction (user pastes or re-attaches the file).
2. **Absorb** durable facts into the right layer: issue/agent brief, PR, `PROGRESS.md` Operational Snapshot, ADR, or `CONTEXT.md`.
3. **Discard** the temp handoff after the next session starts — do not leave handoff content as the only record.

Optional local scratch: `docs/agents/handoffs/*.md` is gitignored for rare mid-epic notes. Delete when work moves to an issue or `PROGRESS.md`. See `docs/agents/handoffs/README.md`.

### Mixed Strategy

- **Single `ready-for-agent` issue**: one session or multiple sessions tied to the issue/PR; issue + agent brief are the handoff.
- **Epic or exploratory work**: update `PROGRESS.md` Operational Snapshot every clock-out; create GitHub issues via `/to-issues` when scope stabilizes.
- **Context pressure**: if a session is approaching context limits, clock out early with verification recorded rather than rushing an unverified finish.

### Clock In

1. Read `AGENTS.md`.
2. Read `PROGRESS.md` Operational Snapshot, baseline, open follow-ups, and verification state.
3. Read `CONTEXT.md` and relevant ADRs before making product, domain, or architecture choices. For skill-driven work, also follow `docs/agents/domain.md`.
4. For issue work, read the issue body, agent brief, parent PRD or parent issue, blockers, and `docs/agents/implementation-workflow.md`.
5. Run the smallest command that confirms the repo is usable before changing code. Prefer `make test` for behavior-only work and `make check` for runtime, build, or UI work.

### Clock Out

Before ending a long task or handing it to another session:

1. Record completed work, remaining work, and blockers in the issue, PR, or `PROGRESS.md` Operational Snapshot.
2. Record verification with exact commands and results. If verification was not run, record why.
3. Update `PROGRESS.md` Operational Snapshot for multi-session or non-issue work; update harness baseline sections when roadmap or verification expectations change.
4. Update `CONTEXT.md` when durable domain language changes.
5. Add or update an ADR when a durable architecture decision is made, including rejected alternatives when they matter.

### State Placement

- Task-local state belongs in GitHub issues, PR descriptions, PR comments, and commits.
- Ephemeral session bridges belong in `/handoff` temp files or gitignored `docs/agents/handoffs/*.md` — absorb and delete, do not commit.
- Durable project state belongs in tracked repo docs such as `PROGRESS.md`, `CONTEXT.md`, `docs/adr/`, `docs/architecture/`, and `docs/design/`.
- Do not use chat history as the only source for decisions, verification results, accepted tradeoffs, or next actions.
- Keep rebuild cost low: a fresh agent should be able to reach an executable state from repo files in a few minutes.

## Maintenance

- When code moves, update `docs/architecture/codebase-map.md` in the same task.
- When domain language changes, update `CONTEXT.md`.
- When a decision becomes durable, add or update an ADR instead of adding a loose instruction.
- When a repeated mistake is found, prefer a test, code check, or focused topic doc over a new entry-file rule.
- Run the Fresh Session Test after harness changes.
