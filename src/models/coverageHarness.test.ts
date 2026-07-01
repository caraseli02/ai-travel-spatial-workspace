import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function readPackageJson() {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8")) as {
    scripts: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
}

describe("coverage harness", () => {
  it("exposes Vitest coverage through npm and make check", () => {
    const packageJson = readPackageJson();
    const makefile = fs.readFileSync(path.join(process.cwd(), "Makefile"), "utf8");

    expect(packageJson.devDependencies).toHaveProperty("@vitest/coverage-v8");
    expect(packageJson.scripts["test:coverage"]).toContain("--coverage");
    expect(makefile).toMatch(/^\.PHONY: .*test-coverage/m);
    expect(makefile).toMatch(/^test-coverage:\s*\n\s*\$\(NPM\)\s+run\s+test:coverage/m);
    expect(makefile).toMatch(/^check: .*test-coverage/m);
  });

  it("gates model and utility coverage at the documented threshold", () => {
    const viteConfig = fs.readFileSync(path.join(process.cwd(), "vite.config.ts"), "utf8");
    const qualityDoc = fs.readFileSync(path.join(process.cwd(), "docs/agents/quality.md"), "utf8");

    expect(viteConfig).toContain('provider: "v8"');
    expect(viteConfig).toContain('"src/models/**/*.ts"');
    expect(viteConfig).toContain('"src/utils/**/*.ts"');
    expect(viteConfig).toContain('"src/**/*.{test,spec}.{ts,tsx}"');
    expect(viteConfig).toMatch(/thresholds:\s*\{[\s\S]*lines:\s*80[\s\S]*functions:\s*80[\s\S]*statements:\s*80[\s\S]*branches:\s*80/);

    expect(qualityDoc).toContain("`make test-coverage`");
    expect(qualityDoc).toContain("`src/models/`");
    expect(qualityDoc).toContain("`src/utils/`");
    expect(qualityDoc).toContain("80%");
  });
});
