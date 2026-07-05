import { describe, expect, it } from "vitest";
import { getLandingPreviewHotelCardCues } from "./landingPreviewDemoCues";
import { kanbanColumns } from "./landingPreviewData";

describe("landingPreviewData", () => {
  it("aligns the Hiiragiya Ryokan preview card with Demo Trip stay copy", () => {
    const hotelCard = kanbanColumns
      .flatMap((column) => column.cards)
      .find((card) => card.title === "Hiiragiya Ryokan");

    expect(hotelCard).toMatchObject(getLandingPreviewHotelCardCues());
  });
});
