#!/usr/bin/env node
/**
 * Technical preflight for issue #139 usability study.
 * Runs vitest checks that study stimuli survive Trip Repository save/load.
 *
 * Usage: node scripts/usability-study-preflight.mjs
 */

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const inboxModule = join(root, "src/models/tripWorkspaceInbox.ts");

if (!existsSync(inboxModule)) {
  console.error("FAIL: tripWorkspaceInbox.ts not found.");
  process.exit(1);
}

const inboxSource = readFileSync(inboxModule, "utf8");

if (!inboxSource.includes("extractSourceUrl")) {
  console.error(
    "FAIL: PR #140 capture-and-return code is not present on this checkout.\n" +
      "       Merge origin/main before running usability sessions.",
  );
  process.exit(1);
}

const result = spawnSync(
  "npx",
  ["vitest", "run", "src/models/usabilityStudyPreflight.test.ts"],
  { cwd: root, stdio: "inherit", shell: false },
);

if (result.status === 0) {
  console.log("");
  console.log("Preflight passed. Next: make dev, then");
  console.log("docs/product/trip-material-capture-return-usability-study.md");
}

process.exit(result.status ?? 1);
