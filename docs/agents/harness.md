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

## Maintenance

- When code moves, update `docs/architecture/codebase-map.md` in the same task.
- When domain language changes, update `CONTEXT.md`.
- When a decision becomes durable, add or update an ADR instead of adding a loose instruction.
- When a repeated mistake is found, prefer a test, code check, or focused topic doc over a new entry-file rule.
