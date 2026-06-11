NPM ?= npm

.PHONY: setup dev test build lint typecheck check status

setup:
	$(NPM) ci

dev:
	$(NPM) run dev

test:
	$(NPM) test

build:
	$(NPM) run build

lint:
	$(NPM) run lint

typecheck:
	$(NPM) run typecheck

check: test build lint typecheck

status:
	git status --short
