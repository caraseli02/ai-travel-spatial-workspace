# Session Handoffs (optional local scratch)

This directory is **not** the default output of `/handoff`. The Matt Pocock `handoff` skill writes to the OS temporary directory on purpose — handoffs are session bridges, not durable documentation.

## Default: `/handoff` → OS temp

Handoffs compress chat context for the **next** session only. They should not be committed. Before clock-out, absorb anything that must survive into durable repo artifacts:

| What to preserve | Where |
| --- | --- |
| Task contract, scope, acceptance criteria | GitHub issue + agent brief |
| Verification commands and results | PR description |
| Project pulse (WIP, next steps, blockers) | `PROGRESS.md` Operational Snapshot |
| Architecture decisions | `docs/adr/` |
| Domain language | `CONTEXT.md` |

After absorption, discard the temp handoff. Do not copy it into this folder unless you have a specific reason.

## Optional: local files here (gitignored)

`docs/agents/handoffs/*.md` is gitignored. You may write a **local-only** scratch note during a long epic when neither an issue nor `PROGRESS.md` is enough — for example, mid-exploration before triage creates issues.

Lifecycle:

1. Create only when needed; reference issues/ADRs instead of duplicating them.
2. Delete when the work moves to an issue, PR, or `PROGRESS.md` update.
3. Never commit handoff files — stale handoffs mislead agents (knowledge decay).

See `docs/agents/harness.md` → **Session handoff lifecycle**.
