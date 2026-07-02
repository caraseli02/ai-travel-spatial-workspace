import {
  ArticleCard,
  CanvasCardRenderer,
  FlightCard,
  HotelCard,
  PolaroidCard,
  StickyCard,
} from "@/components/CanvasCards";
import type { CanvasCard } from "@/models/trip";

export function PreviewCard({ card }: { card: CanvasCard }) {
  switch (card.type) {
    case "flight":
      return <FlightCard card={card} embedded />;
    case "hotel":
      return <HotelCard card={card} embedded />;
    case "sticky":
      return <StickyCard card={card} embedded />;
    case "polaroid":
      return <PolaroidCard card={card} embedded />;
    case "article":
      return <ArticleCard card={card} embedded />;
    default:
      return <CanvasCardRenderer card={card} embedded />;
  }
}
