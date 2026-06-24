import { describe, expect, it, vi } from "vitest";
import { buildTripListPromptResult } from "./tripListIntent";

describe("buildTripListPromptResult", () => {
  it("creates a Trip and traveler-facing response from a prompt", () => {
    vi.spyOn(Date, "now").mockReturnValue(1_789_000_000_000);
    vi.spyOn(Math, "random").mockReturnValue(0.123456);

    const result = buildTripListPromptResult("Plan a 5-day trip to Paris for 2 people");

    expect(result.trip.destination).toBe("Paris, France");
    expect(result.trip.travelers).toBe(2);
    expect(result.aiResponse).toContain("I've created a trip to **Paris**");
    expect(result.aiResponse).toContain("**Travelers:** 2");
    expect(result.aiResponse).toContain("Your trip has been added to your list!");

    vi.restoreAllMocks();
  });
});
