import { Calendar, Users, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { PreviewTrip } from "./landingData";

export function PreviewTripCard({
  trip,
  onOpen,
}: {
  trip: PreviewTrip;
  onOpen: () => void;
}) {
  return (
    <Card
      className="overflow-hidden rounded-2xl border-white/10 bg-stone-900 py-0 text-stone-50 ring-0"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
    >
      <div className="relative h-44 overflow-hidden">
        <img src={trip.image} alt={trip.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent" />
        <Badge
          variant="secondary"
          className={cn(
            "absolute top-3 left-3 rounded-2xl bg-stone-900/80 text-xs font-semibold",
            trip.statusColor,
          )}
        >
          {trip.status}
        </Badge>
        <div className="absolute right-3 bottom-3 left-3">
          <p className="text-lg font-semibold">{trip.title}</p>
          <p className="flex items-center gap-1 text-sm text-stone-400">
            <span>{trip.flag}</span>
            {trip.country}
          </p>
        </div>
      </div>
      <CardContent className="space-y-3 px-4 py-4">
        <div className="space-y-2 text-[13px] text-stone-400">
          <p className="flex items-center gap-2">
            <Calendar className="size-3.5 shrink-0" />
            {trip.dates}
          </p>
          <p className="flex items-center gap-2">
            <Users className="size-3.5 shrink-0" />
            {trip.travelers}
          </p>
          <p className="flex items-center gap-2">
            <Wallet className="size-3.5 shrink-0" />
            {trip.budget}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {trip.tags.map((tag) => (
            <span
              key={tag}
              className="max-w-[110px] truncate rounded-2xl border border-white/10 px-2 py-0.5 text-[10px] font-medium text-stone-400"
            >
              {tag}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
