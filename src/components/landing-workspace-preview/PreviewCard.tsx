import { CanvasCardRenderer } from "@/components/CanvasCards";
import type { CanvasCard } from "@/models/trip";

export function PreviewCard({ card }: { card: CanvasCard }) {
  return <CanvasCardRenderer card={card} embedded />;
}
