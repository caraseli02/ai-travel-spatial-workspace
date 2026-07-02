import { describe, expect, it } from "vitest";
import { filterPreviewTrips } from "./filterPreviewTrips";
import { previewTrips } from "./landingData";

describe("filterPreviewTrips", () => {
  it("returns all trips when no status filter is active", () => {
    expect(filterPreviewTrips(previewTrips, null)).toHaveLength(previewTrips.length);
  });

  it("returns only trips matching the selected status", () => {
    const planningTrips = filterPreviewTrips(previewTrips, "Planning");

    expect(planningTrips).toHaveLength(1);
    expect(planningTrips[0]?.title).toBe("Lisbon & the Coast");
  });

  it("returns an empty list when no trips match the filter", () => {
    expect(filterPreviewTrips(previewTrips, "Completed")).toHaveLength(0);
  });
});
