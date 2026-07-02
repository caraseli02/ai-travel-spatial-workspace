import { describe, expect, it } from "vitest";
import { escapeHtml } from "./mapMarkerHtml";

describe("escapeHtml", () => {
  it("escapes characters that would break marker label HTML", () => {
    expect(escapeHtml(`Fushimi "Inari" & <torii>`)).toBe(
      "Fushimi &quot;Inari&quot; &amp; &lt;torii&gt;",
    );
  });
});
