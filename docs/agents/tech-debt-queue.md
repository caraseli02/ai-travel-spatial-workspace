# Tech debt queue (local automation)

Automate picking the next `ready-for-agent` tech-debt issue on your Mac. You review PRs; the harness picks the issue and drives implementation.

Parent epics: #69–#73. Issue picker skips blockers, open PRs, and `ready-for-human` (#63).

## Prerequisites

- Repo cloned and on `main` (or your integration branch)
- `gh auth login` with access to `caraseli02/ai-travel-spatial-workspace`
- `jq` (macOS: pre-installed or `brew install jq`)
- Node 22 LTS (`.nvmrc`)
- For SDK runner: `CURSOR_API_KEY` from [Cursor dashboard](https://cursor.com/dashboard)

## Phase 1 — Cursor IDE (semi-auto)

1. Open this repo folder in Cursor (local Agent, not Cloud-only).
2. Run the picker:

   ```bash
   make debt-next
   ```

3. Start a **new Agent chat** and paste:

   ```bash
   make debt-prompt
   ```

   Or say: **Implement the next tech-debt issue** (the `.cursor/rules/tech-debt-agent.mdc` rule applies).

4. Review the PR when the agent finishes. Merge. Repeat.

## Phase 2 — SDK local agent (hands-off on your Mac)

Install dependencies (includes `@cursor/sdk`):

```bash
make setup
```

Export your API key:

```bash
export CURSOR_API_KEY="your-key"
```

Run the next issue on your machine (files + shell local; model via Cursor API):

```bash
make debt-agent
```

Optional model override:

```bash
CURSOR_AGENT_MODEL=composer-2.5 make debt-agent
```

The agent should open a PR with `Closes #N`. You review and merge.

## Picker logic

`scripts/next-tech-debt-issue.sh`:

1. Lists open issues with `ready-for-agent` + `tech-debt`
2. Sorts by issue number (lowest first)
3. Skips if an **open PR** references `#N`
4. Skips if **Blocked by** lists an open issue
5. Returns the first eligible issue

Modes:

| Flag | Output |
| --- | --- |
| (default) | `#N title` + URL |
| `--json` | `{ number, title, url, body }` |
| `--prompt` | Full agent prompt for IDE or SDK |

## Optional — run after merge (macOS launchd)

Example plist: `scripts/com.wayfarer.debt-next.plist.example`

1. Copy to `~/Library/LaunchAgents/com.wayfarer.debt-next.plist`
2. Edit paths and `CURSOR_API_KEY` (or use Keychain / env file)
3. Load: `launchctl load ~/Library/LaunchAgents/com.wayfarer.debt-next.plist`

This runs `make debt-agent` when you log in or on a schedule. Your Mac must be awake; prefer running manually after you merge a PR until the queue is stable.

## Guardrails

- **WIP=1** — one issue per agent run
- **Do not auto-merge** — maintainer reviews every PR
- **#63** is `ready-for-human` — never picked (no `ready-for-agent` label)
- Respect issue **Blocked by** — picker enforces; do not start blocked issues manually

## Related docs

- `docs/agents/implementation-workflow.md` — branch, verify, PR format
- `.agents/skills/tdd/SKILL.md` — vertical test slices
- Epics #69–#73 on GitHub
