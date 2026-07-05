import { describe, expect, it } from "vitest";
import { canvasCards } from "@/data/tripData";
import { DEMO_TRIP_ID } from "@/models/trip";
import {
  LANDING_PREVIEW_TRIP_ROUTE,
  getLandingPreviewHotelCardCues,
} from "./landingPreviewDemoCues";

describe("landingPreviewDemoCues", () => {
  it("uses the Demo Trip route identity in the landing preview URL", () => {
    expect(LANDING_PREVIEW_TRIP_ROUTE).toBe(`wayfarer.app/trips/${DEMO_TRIP_ID}`);
  });

  it("derives hotel stay copy from the Demo Trip hotel card", () => {
    const demoHotel = canvasCards.find(
      (card) => card.type === "hotel" && card.title === "Hiiragiya Ryokan",
    );

    expect(demoHotel).toBeDefined();
    expect(getLandingPreviewHotelCardCues()).toEqual({
      subtitle: demoHotel!.subtitle,
      tag: demoHotel!.tag,
      tagColor: demoHotel!.tagColor,
    });
  });
});
