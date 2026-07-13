# Wayfarer Agent Entry

Wayfarer is a React/Vite prototype for an AI-native travel workspace. It helps a traveler collect loose Trip Material, organize it on a Spatial Canvas, and shape it into Trip Workspace structure.

## Quick Start

- Install dependencies: `make setup`
- Run locally: `make dev`
- Run tests: `make test`
- Lint: `make lint`
- Typecheck: `make typecheck`
- E2E smoke: `make e2e`
- Full verification: `make check` (test, build, strict lint, typecheck, E2E)

## Work Rules

- WIP=1: one active issue per session; finish verification before picking the next.
- Do not refactor outside issue scope (see agent brief **Out of scope**).
- Done means every acceptance criterion has a recorded verification command and result.

## Hard Constraints

- Treat the repository as the system of record. Do not rely on chat history for durable project decisions.
- Use domain vocabulary from `CONTEXT.md`; do not drift to avoided synonyms listed there.
- Follow ADRs in `docs/adr/` unless the user explicitly asks to revisit a decision.
- Keep this file short and routing-oriented. Put topic-specific instructions in focused docs.
- Preserve localStorage-first persistence behind the Trip Repository interface.
- Preserve `react-router-dom` routes: `/`, `/trips`, and `/trips/:tripId`.
- New interactive UI should compose shadcn primitives from `src/components/ui/` before custom markup (source: `docs/adr/0003-shadcn-ui-foundation.md`).
- Keep new source files under the line limits enforced by `make file-size-check` (`docs/agents/file-size-limits.json`). Do not grow allowlisted legacy files; extract submodules instead.

## Fresh Session Map

- What this system is: `CONTEXT.md`
- How it is organized: `docs/architecture/codebase-map.md` and `src/AGENTS.md`
- How to run and verify it: `Makefile` and `package.json`
- Current progress and open harness state: `PROGRESS.md`
- Harness maintenance rules: `docs/agents/harness.md`
- Codebase quality health: `docs/agents/quality.md`
- Startup readiness: `docs/agents/startup-readiness.md`
- Session handoff lifecycle: `docs/agents/harness.md` (`/handoff` → OS temp; absorb into issue or `PROGRESS.md`)
- How to work ready issues: `docs/agents/implementation-workflow.md`

## Topic Docs

- Issue tracker: GitHub Issues for `caraseli02/ai-travel-spatial-workspace`; see `docs/agents/issue-tracker.md`.
- Implementation workflow: use `docs/agents/implementation-workflow.md` for issues labeled `ready-for-agent`.
- Autonomous loop: `docs/agents/automation-queue.md` and `docs/agents/autonomous-workflow.md` (cron controller + PR evaluator; no manual issue picking).
- Triage labels: canonical mattpocock/skills labels; see `docs/agents/triage-labels.md`.
- Domain docs: single-context layout; see `docs/agents/domain.md`.
- Product design: for Pencil designs and shadcn/ui implementation, load `.agents/skills/pencil-design/SKILL.md`, then `docs/design/README.md`, surface docs (`landing-page.md`, `trip-list.md`, `trip-canvas.md`), and `docs/adr/0003-shadcn-ui-foundation.md`.
