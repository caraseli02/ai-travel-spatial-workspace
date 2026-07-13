import { describe, expect, it } from "vitest";
import { classifyTripMaterial } from "@/models/tripMaterialIntake";

describe("classifyTripMaterial", () => {
  it("classifies URL-only Trip Material with domain fallback label", () => {
    const url = "https://example.com/opaque-path-xyz123";
    expect(classifyTripMaterial(url)).toEqual({
      kind: "link",
      destinationHint: undefined,
      inboxDraft: {
        type: "link",
        source: "example.com",
        content: url,
        rawContent: url,
        sourceUrl: url,
      },
    });
  });

  it("classifies URL plus traveler note Trip Material", () => {
    const content = "https://example.com/ryokan Hidden ryokan near Gion";
    expect(classifyTripMaterial(content)).toEqual({
      kind: "link",
      destinationHint: undefined,
      inboxDraft: {
        type: "link",
        source: "Hidden ryokan near Gion",
        content,
        rawContent: content,
        sourceUrl: "https://example.com/ryokan",
      },
    });
  });

  it("classifies text-only Trip Material without a sourceUrl", () => {
    const content = "Try Junsei near Nanzenji! — Yuki";
    expect(classifyTripMaterial(content)).toEqual({
      kind: "note",
      destinationHint: undefined,
      inboxDraft: {
        type: "note",
        source: content,
        content,
        rawContent: content,
        sourceUrl: undefined,
      },
    });
  });

  it("trims surrounding whitespace before classification", () => {
    const content = "  https://example.com/guide  ";
    expect(classifyTripMaterial(content).inboxDraft).toMatchObject({
      type: "link",
      source: "example.com",
      content: "https://example.com/guide",
      sourceUrl: "https://example.com/guide",
    });
  });
});
