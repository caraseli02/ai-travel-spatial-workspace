# Triage bug queue (multitask TDD)

Open `ready-for-agent` bugs from triage. Use TDD vertical slices; one issue per agent session.

## Current queue

```bash
make triage-multitask   # up to 3 parallel prompts
make triage-prompt ISSUE=104   # single issue
bash scripts/triage-bug-prompt.sh --list
```

As of 2026-07-05: workspace bugs #105–#108 are closed. **#104** (Landing preview fixture) is the remaining open bug.

## Multitask (2+ parallel agents)

When two or more bugs are open:

1. Enable **Multitask Mode** in Cursor.
2. Open one Agent chat per issue (up to 3).
3. Run `make triage-multitask` and paste one `AGENT PROMPT` block into each chat.
4. Review and merge PRs one at a time; rebase remaining branches onto `main` after each merge.

## Single issue

```bash
make triage-prompt ISSUE=104
```

## Guardrails

- **WIP=1** — one issue per agent run
- Load `.agents/skills/tdd/SKILL.md` — vertical RED→GREEN only
- Follow `docs/agents/implementation-workflow.md`
- UI/layout changes: `make check` (not only `make test`)
- Do not auto-merge — maintainer reviews every PR

## Related docs

- `docs/agents/implementation-workflow.md` — branch, verify, PR format
- `.agents/skills/tdd/SKILL.md` — test-first vertical slices
- `docs/agents/tech-debt-queue.md` — tech-debt automation
