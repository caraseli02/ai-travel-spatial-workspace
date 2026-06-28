import { describe, expect, it } from "vitest";
import type { CanvasCard } from "../../models/trip";
import { CANVAS_CARD_TYPES, getCardDetailComponents } from "./cardDetailRegistry";

describe("cardDetailRegistry", () => {
  it("registers edit and view subcomponents for every Canvas Card type", () => {
    for (const type of CANVAS_CARD_TYPES) {
      const { Edit, View } = getCardDetailComponents(type);

      expect(Edit, `${type} edit component`).toBeTypeOf("function");
      expect(View, `${type} view component`).toBeTypeOf("function");
    }
  });

  it("covers all CanvasCard type union members", () => {
    const expected: CanvasCard["type"][] = [
      "sticky",
      "polaroid",
      "flight",
      "hotel",
      "article",
      "note",
    ];
    expect([...CANVAS_CARD_TYPES].sort()).toEqual([...expected].sort());
  });
});
