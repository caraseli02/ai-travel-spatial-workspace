import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { filterPreviewTrips } from "./filterPreviewTrips";
import { previewTrips, tripFilters } from "./landingData";
import { PreviewTripCard } from "./PreviewTripCard";

export function TripListFeature({ onEnterDemo }: { onEnterDemo: () => void }) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const filteredTrips = filterPreviewTrips(previewTrips, activeFilter);

  return (
    <section className="bg-stone-950 px-4 py-16 text-stone-50 md:px-12 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-10 max-w-3xl text-center md:mb-11">
          <p className="mb-3 text-xs font-semibold tracking-widest text-orange-400 uppercase">
            Your trip hub
          </p>
          <h2 className="mb-3 font-serif text-[26px] leading-tight md:text-[42px]">
            One calm home for every journey
          </h2>
          <p className="text-[15px] text-stone-400 md:text-[17px]">
            Past, present, and someday — every trip lives in one quiet dashboard. Filter by status,
            or just start a new one with a sentence.
          </p>
        </div>

        <div className="mb-10 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2 md:flex md:flex-wrap md:justify-center">
          {tripFilters.map((filter) => (
            <Button
              key={filter.label}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setActiveFilter(filter.status)}
              className={cn(
                "h-auto min-w-[7rem] justify-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-medium",
                activeFilter === filter.status
                  ? "border-white/15 bg-white/10 text-stone-50 hover:bg-white/10 hover:text-stone-50"
                  : "border-white/5 bg-white/5 text-stone-400 hover:bg-white/10 hover:text-stone-50",
              )}
            >
              <filter.icon className="size-3.5" />
              {filter.label}
            </Button>
          ))}
        </div>

        {filteredTrips.length === 0 ? (
          <p className="text-center text-sm text-stone-400">No trips in this view yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-3 md:gap-6">
            {filteredTrips.map((trip, index) => (
              <div key={trip.title} className={cn(index === 2 && "hidden md:block")}>
                <PreviewTripCard trip={trip} onOpen={onEnterDemo} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
