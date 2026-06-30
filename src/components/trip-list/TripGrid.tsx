import { AnimatePresence, motion } from "framer-motion";
import { Compass, Plus, Sparkles } from "lucide-react";
import TripCard from "@/components/TripCard";
import type { Trip } from "@/models/trip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { TripStatusFilter } from "./types";

interface TripGridProps {
  trips: Trip[];
  filteredTrips: Trip[];
  selectedFilter: TripStatusFilter;
  onCreateTrip: () => void;
  onShowAllTrips: () => void;
  onOpenTrip: (trip: Trip) => void;
  onDeleteTrip: (trip: Trip) => void;
}

export function TripGrid({
  trips,
  filteredTrips,
  selectedFilter,
  onCreateTrip,
  onShowAllTrips,
  onOpenTrip,
  onDeleteTrip,
}: TripGridProps) {
  return (
    <div className="flex-1 overflow-y-auto bg-background pt-4 sm:pt-8">
      <div className="mx-auto w-full max-w-[1344px] px-4 sm:px-12">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <motion.div layout onClick={onCreateTrip}>
            <Card
              className="group h-full min-h-[154px] cursor-pointer rounded-2xl border-2 border-dashed border-border/60 bg-white/[0.01] py-0 shadow-none ring-0 transition-all duration-300 hover:border-primary/40 hover:bg-muted/30 sm:min-h-[420px]"
              role="button"
              tabIndex={0}
              aria-label="Create a new trip"
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onCreateTrip();
                }
              }}
            >
              <CardContent className="flex h-full min-h-[154px] flex-col items-center justify-center gap-4 p-6 text-center [--card-spacing:--spacing(4)] sm:min-h-[420px]">
                <Button variant="outline" size="icon" className="pointer-events-none shrink-0" tabIndex={-1} aria-hidden>
                  <Plus className="size-4" />
                </Button>
                <div className="space-y-1.5">
                  <span className="block text-sm font-semibold text-foreground">New Trip</span>
                  <p className="mx-auto max-w-[170px] text-xs leading-relaxed text-muted-foreground">
                    Start planning your next destination
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {trips.length === 0 && (
            <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="h-full min-h-[420px] rounded-2xl border border-border bg-card py-0 shadow-sm ring-0">
                <CardContent className="flex h-full min-h-[420px] flex-col justify-between p-8 [--card-spacing:--spacing(4)]">
                  <div className="space-y-6">
                    <Button size="icon" className="pointer-events-none shrink-0" tabIndex={-1} aria-hidden>
                      <Sparkles className="size-4" />
                    </Button>
                    <div className="space-y-2">
                      <h3 className="text-base font-bold text-foreground">Plan with AI</h3>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        Describe your dream journey in the search bar below. Tell Wayfarer where you
                        want to go, who you are traveling with, and what you&apos;d love to see.
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="w-fit border-primary/30 text-[10px] font-semibold tracking-widest text-primary uppercase"
                  >
                    AI-Powered Planning
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {filteredTrips.length === 0 && selectedFilter !== "all" && trips.length > 0 && (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              data-testid="trip-list-filter-empty-state"
              className="lg:col-span-2"
            >
              <Card className="h-full min-h-[420px] rounded-2xl border border-border bg-card py-0 shadow-sm ring-0">
                <CardContent className="flex h-full min-h-[420px] flex-col justify-between p-8 [--card-spacing:--spacing(4)]">
                  <div className="space-y-6">
                    <Button variant="outline" size="icon" className="pointer-events-none shrink-0" tabIndex={-1} aria-hidden>
                      <Compass className="size-4 text-muted-foreground" />
                    </Button>
                    <div className="space-y-2">
                      <h3 className="text-base font-bold text-muted-foreground">
                        No {selectedFilter} trips
                      </h3>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        There are currently no travel plans matching the &ldquo;{selectedFilter}
                        &rdquo; status filter. Select another filter tab above to view other trips.
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={onShowAllTrips} className="w-fit">
                    Show all trips
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <AnimatePresence mode="popLayout">
            {filteredTrips.map((trip, index) => {
              const isNew = Date.now() - new Date(trip.createdAt).getTime() < 15000;
              return (
                <motion.div
                  key={trip.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  className="h-full"
                >
                  <TripCard
                    trip={trip}
                    index={index}
                    isNew={isNew}
                    onOpen={() => onOpenTrip(trip)}
                    onDelete={() => onDeleteTrip(trip)}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
