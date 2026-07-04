import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AiPromptBarStatic } from "./AiPromptBarStatic";

describe("AiPromptBarStatic", () => {
  it("renders a non-interactive prompt shell for marketing previews", () => {
    const markup = renderToStaticMarkup(<AiPromptBarStatic />);

    expect(markup).toContain("Ask AI about this trip");
    expect(markup).toContain("disabled");
  });
});
