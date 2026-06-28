import { Check, Plane, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TripMaterialMemoryBlock } from "./TripMaterialMemoryBlock";
import type { CardDetailViewProps } from "./types";

export function CardDetailCommonViewFields({
  card,
  displayDetails,
  sourceMemory,
}: CardDetailViewProps) {
  return (
    <>
      <div>
        <h2 className="mb-1 text-base leading-tight font-bold text-foreground">{card.title}</h2>
        {card.subtitle && (
          <p className="text-xs leading-relaxed text-muted-foreground">{card.subtitle}</p>
        )}
      </div>

      {card.tag && (
        <Badge
          variant="secondary"
          className="border-amber-200 bg-amber-50 text-[10px] font-bold tracking-wider text-amber-900 uppercase"
        >
          {card.tag}
        </Badge>
      )}

      {card.rating && (
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={11}
              className={
                i < Math.floor(card.rating!)
                  ? "fill-amber-400 text-amber-400"
                  : "fill-muted text-muted"
              }
            />
          ))}
          <span className="ml-1 text-xs font-semibold text-muted-foreground">
            {card.rating} · Recommended
          </span>
        </div>
      )}

      {displayDetails.length > 0 && (
        <div>
          <p className="mb-1.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            Details
          </p>
          <ul className="space-y-1.5">
            {displayDetails.map((d, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <Check size={12} className="mt-0.5 shrink-0 text-primary" />
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {card.price && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 py-2.5 text-center">
          <p className="text-xl font-extrabold text-foreground">{card.price}</p>
          <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
            Estimated Total
          </p>
        </div>
      )}

      {sourceMemory && <TripMaterialMemoryBlock sourceMemory={sourceMemory} />}
    </>
  );
}

export function CardDetailFlightRouteView() {
  return (
    <div className="rounded-xl border border-border bg-muted/50 p-3">
      <div className="flex items-center justify-between text-foreground">
        <div className="text-center">
          <p className="text-sm font-bold">SFO</p>
          <p className="text-[10px] text-muted-foreground">11:05am</p>
        </div>
        <div className="flex flex-1 flex-col items-center px-1">
          <p className="text-[9px] text-muted-foreground">12h 40m nonstop</p>
          <div className="mt-0.5 flex w-full items-center gap-1">
            <div className="h-px flex-1 bg-border" />
            <Plane size={10} className="text-muted-foreground" />
            <div className="h-px flex-1 bg-border" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold">KIX</p>
          <p className="text-[10px] text-muted-foreground">+1 3:45pm</p>
        </div>
      </div>
    </div>
  );
}
