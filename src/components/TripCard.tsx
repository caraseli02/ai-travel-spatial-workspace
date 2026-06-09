import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Users,
  Wallet,
  MapPin,
  CheckCircle2,
  Clock,
  Plane,
  Compass,
  Sparkles,
  Trash2,
} from "lucide-react";
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
  upcoming: {
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    icon: Plane,
    label: "Upcoming",
  },
  ongoing: {
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    icon: Compass,
    label: "Ongoing",
  },
  completed: {
    color: "text-muted-foreground",
    bg: "bg-muted",
    border: "border-border",
    icon: CheckCircle2,
    label: "Completed",
  },
  planning: {
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
    icon: Clock,
    label: "Planning",
  },
};

export default function TripCard({ trip, index, isNew, onOpen, onDelete }: TripCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const status = deriveTripStatus(trip);
  const config = statusConfig[status];
  const StatusIcon = config.icon;

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
      <Card className="relative flex h-full min-h-[420px] flex-col justify-between gap-0 overflow-hidden rounded-2xl py-0 ring-border transition-all duration-300 hover:ring-foreground/20">
        <AnimatePresence>
          {showConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-background/90 backdrop-blur-md"
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
          <div className="relative h-[192px] overflow-hidden">
            <img
              src={image}
              alt={trip.destination}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />

            <Badge
              className={cn(
                "absolute top-3 left-3 gap-1.5 border-0 px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md",
                config.bg,
                config.color,
              )}
              variant="secondary"
            >
              <StatusIcon className="size-3" />
              {config.label}
            </Badge>

            {isNew && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-3 right-16 z-10 transition-all duration-300 lg:right-3 lg:group-hover:right-12 lg:group-focus-within:right-12"
              >
                <Badge className="gap-1 bg-primary/90 px-2.5 py-1.5 text-[11px] text-primary-foreground shadow-lg">
                  <Sparkles className="size-3" />
                  New
                </Badge>
              </motion.div>
            )}

            <div className="absolute right-4 bottom-3 left-4">
              <h3 className="flex items-center gap-2 truncate text-lg font-bold tracking-tight text-white drop-shadow-md">
                <span className="text-xl" role="img" aria-label="trip emoji">
                  {trip.emoji}
                </span>
                <span className="truncate">{trip.name}</span>
              </h3>
              <div className="mt-1 flex items-center gap-1 text-xs font-medium text-white/70">
                <MapPin className="size-3.5 shrink-0" />
                <span className="truncate">{country}</span>
              </div>
            </div>
          </div>

          <CardContent className="space-y-3 p-4">
            <div className="grid grid-cols-2 gap-3 text-[13px] text-muted-foreground">
              <div className="flex min-w-0 items-center gap-2">
                <Calendar className="size-4 shrink-0 text-muted-foreground/70" />
                <span className="truncate font-medium">{formatTripDates(trip.dates)}</span>
              </div>
              <div className="flex min-w-0 items-center gap-2">
                <Users className="size-4 shrink-0 text-muted-foreground/70" />
                <span className="truncate font-medium">
                  {travelers} {travelers === 1 ? "traveler" : "travelers"}
                </span>
              </div>
            </div>

            <div className="flex min-w-0 items-center gap-2 text-[13px] text-muted-foreground">
              <Wallet className="size-4 shrink-0 text-muted-foreground/70" />
              <span className="truncate font-medium">
                Budget: <span className="font-semibold text-foreground">{budget}</span>
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {activities.length > 0 ? (
                <>
                  {activities.slice(0, 3).map((activity, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="max-w-[110px] truncate px-2 py-1 text-[10px] font-medium text-muted-foreground"
                    >
                      {activity}
                    </Badge>
                  ))}
                  {activities.length > 3 && (
                    <Badge
                      variant="outline"
                      className="shrink-0 px-2 py-1 text-[10px] font-medium text-muted-foreground"
                    >
                      +{activities.length - 3}
                    </Badge>
                  )}
                </>
              ) : (
                <span className="text-[10px] font-medium text-muted-foreground italic">
                  Workspace is empty
                </span>
              )}
            </div>
          </CardContent>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            setShowConfirm(true);
          }}
          className="absolute top-3 right-3 z-10 size-11 bg-background/60 opacity-100 backdrop-blur-md hover:bg-destructive hover:text-destructive-foreground lg:size-8 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100 lg:focus:opacity-100"
          aria-label={`Delete trip ${trip.name}`}
          title="Delete Trip"
        >
          <Trash2 className="size-4 lg:size-3.5" />
        </Button>

        <CardFooter className="border-0 bg-transparent p-4 pt-0">
          <Button
            variant="outline"
            className="w-full"
            size="sm"
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
