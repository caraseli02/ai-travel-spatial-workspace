NPM ?= npm

.PHONY: setup dev test build check status

setup:
	$(NPM) ci

dev:
	$(NPM) run dev

test:
	$(NPM) test

build:
	$(NPM) run build

check: test build

status:
	git status --short
