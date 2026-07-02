import { describe, expect, it } from "vitest";
import { kanbanColumns } from "./landingPreviewData";
import { getFeatureKanbanColumns } from "./getFeatureKanbanColumns";

describe("getFeatureKanbanColumns", () => {
  it("returns the middle day columns used in the spatial canvas feature preview", () => {
    const columns = getFeatureKanbanColumns(kanbanColumns);

    expect(columns).toHaveLength(2);
    expect(columns.map((column) => column.label)).toEqual([
      "Day 2 — Fushimi Inari + Gion",
      "Day 3 — Arashiyama",
    ]);
  });
});
