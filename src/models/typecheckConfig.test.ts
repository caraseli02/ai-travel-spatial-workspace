import path from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

function parseTypecheckProject() {
  const configPath = path.join(process.cwd(), "tsconfig.check.json");
  const configFile = ts.readConfigFile(configPath, ts.sys.readFile);

  if (configFile.error) {
    throw new Error(ts.flattenDiagnosticMessageText(configFile.error.messageText, "\n"));
  }

  const parsedConfig = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    process.cwd(),
    undefined,
    configPath,
  );

  if (parsedConfig.errors.length > 0) {
    throw new Error(
      parsedConfig.errors
        .map((error) => ts.flattenDiagnosticMessageText(error.messageText, "\n"))
        .join("\n"),
    );
  }

  return parsedConfig;
}

describe("typecheck configuration", () => {
  it("includes test files in the make typecheck project", () => {
    const checkedFiles = parseTypecheckProject().fileNames.map((fileName) =>
      path.relative(process.cwd(), fileName),
    );

    expect(checkedFiles).toContain("src/models/tripWorkspaceModel.test.ts");
    expect(checkedFiles).toContain("src/hooks/useSpatialViewport.test.ts");
  });
});
