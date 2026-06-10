import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Users, Wallet, MapPin, Sparkles, Trash2 } from "lucide-react";
import type { Trip } from "../models/trip";
import {
  deriveTripStatus,
  deriveTripCountry,
  deriveTripImage,
  deriveTripTravelers,
  deriveTripBudget,
  deriveTripActivities,
  formatTripDates,
} from "../utils/tripCardHelpers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TripCardProps {
  trip: Trip;
  index: number;
  isNew?: boolean;
  onOpen: () => void;
  onDelete: () => void;
}

const statusConfig = {
  upcoming: { color: "text-[#34d399]", label: "Upcoming" },
  ongoing: { color: "text-amber-400", label: "Ongoing" },
  completed: { color: "text-[#a8a29e]", label: "Completed" },
  planning: { color: "text-[#38bdf8]", label: "Planning" },
} as const;

const tripCardClassName =
  "relative flex h-full min-h-[360px] flex-col justify-between gap-0 overflow-hidden rounded-2xl border border-white/10 bg-[#1c1917] py-0 shadow-sm ring-0 sm:min-h-[420px]";

const metaClassName = "text-[13px] font-medium text-[#a8a29e]";
const activityChipClassName =
  "max-w-[110px] truncate rounded-2xl border border-white/10 bg-transparent px-2 py-0.5 text-[10px] font-medium text-[#a8a29e]";

export default function TripCard({ trip, index, isNew, onOpen, onDelete }: TripCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const status = deriveTripStatus(trip);
  const config = statusConfig[status];

  const image = deriveTripImage(trip);
  const country = deriveTripCountry(trip);
  const travelers = deriveTripTravelers(trip);
  const budget = deriveTripBudget(trip);
  const activities = deriveTripActivities(trip);

  return (
    <motion.div
      initial={isNew ? { opacity: 0, y: 30, scale: 0.95 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: isNew ? 0 : index * 0.08,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="group relative h-full"
    >
      <Card className={tripCardClassName}>
        <AnimatePresence>
          {showConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-background/90 backdrop-blur-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="max-w-[80%] space-y-4 p-5 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full border border-destructive/20 bg-destructive/10 text-destructive">
                  <Trash2 className="size-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-foreground">Delete this trip?</h4>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    This will permanently delete your workspace for &ldquo;{trip.name}&rdquo;. This
                    action cannot be undone.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowConfirm(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                      setShowConfirm(false);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          onClick={onOpen}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onOpen();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label={`Open trip workspace for ${trip.name}`}
          className="flex flex-1 cursor-pointer flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          <div className="relative h-[164px] overflow-hidden rounded-t-2xl sm:h-[192px]">
            <img
              src={image}
              alt={trip.destination}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1c1917] from-0% via-transparent via-60% to-transparent" />

            <span
              className={cn(
                "absolute top-3 left-3 rounded-2xl bg-[#292524] px-2 py-0.5 text-xs font-semibold",
                config.color,
              )}
            >
              {config.label}
            </span>

            {isNew && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-3 right-3 z-10"
              >
                <Badge className="gap-1 bg-primary px-2.5 py-1 text-[11px] text-primary-foreground">
                  <Sparkles className="size-3" />
                  New
                </Badge>
              </motion.div>
            )}

            <div className="absolute right-4 bottom-3 left-4">
              <h3 className="flex items-center gap-2 truncate text-lg font-bold tracking-tight text-white">
                <span className="text-xl" role="img" aria-label="trip emoji">
                  {trip.emoji}
                </span>
                <span className="truncate">{trip.name}</span>
              </h3>
              <div className="mt-1 flex items-center gap-1 text-xs font-medium text-white/70">
                <MapPin className="size-3.5 shrink-0 text-white/70" />
                <span className="truncate">{country}</span>
              </div>
            </div>
          </div>

          <CardContent className="space-y-3 p-4 [--card-spacing:--spacing(4)]">
            <div className="grid grid-cols-2 gap-3">
              <div className={cn("flex min-w-0 items-center gap-2", metaClassName)}>
                <Calendar className="size-4 shrink-0" />
                <span className="truncate">{formatTripDates(trip.dates)}</span>
              </div>
              <div className={cn("flex min-w-0 items-center gap-2", metaClassName)}>
                <Users className="size-4 shrink-0" />
                <span className="truncate">
                  {travelers} {travelers === 1 ? "traveler" : "travelers"}
                </span>
              </div>
            </div>

            <div className={cn("flex min-w-0 items-center gap-2", metaClassName)}>
              <Wallet className="size-4 shrink-0" />
              <span className="truncate">Budget: {budget}</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {activities.length > 0 ? (
                <>
                  {activities.slice(0, 3).map((activity, i) => (
                    <span key={i} className={activityChipClassName}>
                      {activity}
                    </span>
                  ))}
                  {activities.length > 3 && (
                    <span className={cn(activityChipClassName, "max-w-none shrink-0")}>
                      +{activities.length - 3}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-[10px] font-medium text-[#a8a29e] italic">
                  Workspace is empty
                </span>
              )}
            </div>
          </CardContent>
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={(e) => {
            e.stopPropagation();
            setShowConfirm(true);
          }}
          className="absolute top-3 right-3 z-10 text-white/80 opacity-0 transition-opacity hover:bg-white/10 hover:text-white group-hover:opacity-100 group-focus-within:opacity-100"
          aria-label={`Delete trip ${trip.name}`}
          title="Delete Trip"
        >
          <Trash2 className="size-3.5" />
        </Button>

        <CardFooter className="border-0 bg-transparent p-4 pt-0 [--card-spacing:--spacing(4)]">
          <Button
            variant="ghost"
            className="h-9 w-full rounded-md border border-white/10 bg-[#0c0a09] text-sm font-medium text-zinc-50 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)] hover:bg-[#0c0a09]/90 hover:text-zinc-50"
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
          >
            View Details
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
