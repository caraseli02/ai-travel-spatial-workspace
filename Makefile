NPM ?= npm

.PHONY: setup dev test test-coverage build lint typecheck e2e doctor fresh-session-test file-size-check check status debt-next debt-prompt debt-agent triage-multitask triage-prompt

setup:
	$(NPM) ci

dev:
	$(NPM) run dev

test:
	$(NPM) test

test-coverage:
	$(NPM) run test:coverage

build:
	$(NPM) run build

lint:
	$(NPM) run lint

typecheck:
	$(NPM) run typecheck

e2e:
	$(NPM) run e2e

doctor:
	@echo "node: $$(node -v)"
	@echo "npm:  $$(npm -v)"
	@$(NPM) ls --depth=0 >/dev/null
	@test -s package-lock.json
	@test -s AGENTS.md
	@test -s PROGRESS.md
	@test -s CONTEXT.md
	@echo "doctor: ok"

fresh-session-test:
	@test -s AGENTS.md
	@test -s PROGRESS.md
	@test -s CONTEXT.md
	@test -s docs/agents/harness.md
	@test -s docs/agents/startup-readiness.md
	@test -s docs/agents/file-size-limits.json
	@test -s docs/architecture/codebase-map.md
	@grep -q "make check" AGENTS.md
	@grep -q "make check" docs/agents/startup-readiness.md
	@grep -q "Operational Snapshot" PROGRESS.md
	@grep -q "ready-for-agent" docs/agents/implementation-workflow.md
	@echo "fresh-session-test: ok"

file-size-check:
	node scripts/check-file-sizes.mjs

check: test-coverage build lint typecheck file-size-check e2e fresh-session-test

status:
	git status --short

debt-next:
	@bash scripts/next-tech-debt-issue.sh

debt-prompt:
	@bash scripts/next-tech-debt-issue.sh --prompt

debt-agent:
	@node scripts/run-next-tech-debt-agent.mjs

triage-multitask:
	@bash scripts/triage-bug-prompt.sh --multitask

triage-prompt:
	@bash scripts/triage-bug-prompt.sh --issue $(ISSUE)
