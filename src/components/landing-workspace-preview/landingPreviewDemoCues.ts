import { canvasCards } from "@/data/tripData";
import { DEMO_TRIP_ID } from "@/models/trip";

export const LANDING_PREVIEW_TRIP_ROUTE = `wayfarer.app/trips/${DEMO_TRIP_ID}`;

export function getLandingPreviewHotelCardCues(): {
  subtitle: string;
  tag: string;
  tagColor: string;
} {
  const demoHotel = canvasCards.find(
    (card) => card.type === "hotel" && card.title === "Hiiragiya Ryokan",
  );

  if (!demoHotel?.subtitle || !demoHotel.tag || !demoHotel.tagColor) {
    throw new Error(
      "Demo Trip hotel card is missing subtitle, tag, or tagColor for the landing preview.",
    );
  }

  return {
    subtitle: demoHotel.subtitle,
    tag: demoHotel.tag,
    tagColor: demoHotel.tagColor,
  };
}
