# Harness

This repo follows two harness principles:

- The repository is the system of record. Knowledge that must survive a session belongs in tracked files.
- Entry instructions are routers, not encyclopedias. Topic-specific details belong in focused docs or next to code.

Source lectures:

- https://walkinglabs.github.io/learn-harness-engineering/en/lectures/lecture-03-why-the-repository-must-become-the-system-of-record/
- https://walkinglabs.github.io/learn-harness-engineering/en/lectures/lecture-04-why-one-giant-instruction-file-fails/

## Fresh Session Test

A fresh agent session should answer these questions using only repo files:

| Question | Source of record |
| --- | --- |
| What is this system? | `CONTEXT.md` |
| How is it organized? | `docs/architecture/codebase-map.md`, `src/AGENTS.md` |
| How do I run it? | `Makefile`, `package.json` |
| How do I verify it? | `Makefile`, tests beside source |
| What's the current progress? | `PROGRESS.md` |

If an answer requires chat history or memory, add the missing knowledge to the smallest relevant file.

## Instruction Placement

- Root `AGENTS.md` and `CLAUDE.md`: project overview, commands, hard constraints, and routing links only.
- `CONTEXT.md`: domain vocabulary, prototype assumptions, and examples that shape product behavior.
- `docs/adr/`: durable architecture decisions with considered options and consequences.
- `docs/architecture/`: current structural maps and cross-module explanations.
- `docs/agents/`: agent process, issue tracker, triage, and harness instructions.
- `docs/design/`: product design system and surface-specific design guidance.
- Nested `AGENTS.md`: local instructions that should be read only when working in that subtree.

## Hard Constraint Format

Only put a rule in the entry file when it is global, non-negotiable, and frequently relevant. Topic rules should include:

- Source: why the rule exists.
- Applies when: what work should load it.
- Expires when: what change would let us delete it.

## State Management

- Atomicity: keep each task scoped to a logical operation and avoid mixing unrelated changes.
- Consistency: run `make check` when the change can affect runtime behavior.
- Isolation: use branches and avoid rewriting unrelated dirty files.
- Durability: persist cross-session knowledge in repo files, not chat.

## Session Continuity

Use this routine for long-running work, interrupted work, or work that another
agent may need to resume.

### Clock In

1. Read `AGENTS.md`.
2. Read `PROGRESS.md` for current baseline, open follow-ups, and verification
   state.
3. Read `CONTEXT.md` and relevant ADRs before making product, domain, or
   architecture choices.
4. For issue work, read the issue body, parent PRD or parent issue, blockers,
   and `docs/agents/implementation-workflow.md`.
5. Run the smallest command that confirms the repo is usable before changing
   code. Prefer `make test` for behavior-only work and `make check` for runtime,
   build, or UI work.

### Clock Out

Before ending a long task or handing it to another session:

1. Record completed work, remaining work, and blockers in the issue, PR, or a
   handoff document.
2. Record verification with exact commands and results. If verification was not
   run, record why.
3. Update `PROGRESS.md` only when the project baseline, roadmap, verification
   baseline, or harness expectations changed.
4. Update `CONTEXT.md` when durable domain language changes.
5. Add or update an ADR when a durable architecture decision is made, including
   rejected alternatives when they matter.

### State Placement

- Task-local state belongs in GitHub issues, PR descriptions, PR comments,
  commits, or temporary handoff files.
- Durable project state belongs in tracked repo docs such as `PROGRESS.md`,
  `CONTEXT.md`, `docs/adr/`, `docs/architecture/`, and `docs/design/`.
- Do not use chat history as the only source for decisions, verification
  results, accepted tradeoffs, or next actions.
- Keep rebuild cost low: a fresh agent should be able to reach an executable
  state from repo files in a few minutes.

## Maintenance

- When code moves, update `docs/architecture/codebase-map.md` in the same task.
- When domain language changes, update `CONTEXT.md`.
- When a decision becomes durable, add or update an ADR instead of adding a loose instruction.
- When a repeated mistake is found, prefer a test, code check, or focused topic doc over a new entry-file rule.
