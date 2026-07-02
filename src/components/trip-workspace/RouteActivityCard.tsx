import { Star } from "lucide-react";
import type { CanvasCard } from "@/models/trip";
import { cn } from "@/lib/utils";
import { getRouteTimeSlot } from "@/utils/tripWorkspaceViewHelpers";

function getRouteCardRating(card: CanvasCard) {
  return card.rating ? card.rating.toFixed(1) : null;
}

export function RouteActivityCard({
  card,
  index,
  selected,
  onSelect,
  compact = false,
}: {
  card: CanvasCard;
  index: number;
  selected: boolean;
  onSelect: () => void;
  compact?: boolean;
}) {
  const ratingLabel = getRouteCardRating(card);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex items-center gap-3 rounded-2xl bg-[#f5f5f5] p-2 text-left transition",
        compact ? "w-[220px] shrink-0 snap-center" : "w-full",
        selected && "ring-2 ring-primary",
      )}
    >
      <div className="relative size-[52px] shrink-0 overflow-hidden rounded-2xl bg-background md:size-[60px]">
        {card.image ? (
          <img src={card.image} alt="" className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center text-lg text-muted-foreground">
            {card.type === "flight" ? "✈️" : "📍"}
          </div>
        )}
        <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-black text-[10px] font-semibold text-white">
          {index + 1}
        </span>
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-normal text-muted-foreground">
          {getRouteTimeSlot(index)}
        </p>
        <p className="mt-1 line-clamp-2 text-sm font-semibold text-foreground">{card.title}</p>
        {!compact && ratingLabel && (
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="size-3 fill-amber-400 text-amber-400" />
            {ratingLabel}
          </p>
        )}
        {card.subtitle && (
          <p className={cn("line-clamp-1 text-xs text-muted-foreground", compact ? "mt-1" : "mt-1")}>
            {card.subtitle}
          </p>
        )}
      </div>
    </button>
  );
}
