import { CheckCircle2, Clock3, Compass, Globe, Plane } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { TripStatusFilter } from "./types";

interface TripListFiltersProps {
  counts: Record<TripStatusFilter, number>;
  selectedFilter: TripStatusFilter;
  onSelectedFilterChange: (filter: TripStatusFilter) => void;
}

const tabConfig = [
  { key: "all", label: "All", icon: Globe },
  { key: "upcoming", label: "Upcoming", icon: Plane },
  { key: "ongoing", label: "Ongoing", icon: Compass },
  { key: "planning", label: "Planning", icon: Clock3 },
  { key: "completed", label: "Completed", icon: CheckCircle2 },
] as const;

export function TripListFilters({
  counts,
  selectedFilter,
  onSelectedFilterChange,
}: TripListFiltersProps) {
  return (
    <section aria-label="Trip status filters" className="shrink-0 border-b border-border bg-background">
      <div className="relative mx-auto w-full max-w-[1344px]">
        <div className="flex w-full items-center gap-2.5 overflow-x-auto px-4 py-4 pr-12 sm:px-12">
          <Tabs value={selectedFilter} onValueChange={(value) => onSelectedFilterChange(value as TripStatusFilter)}>
            <TabsList className="gap-2 bg-transparent p-0">
              {tabConfig.map((tab) => {
                const active = selectedFilter === tab.key;
                const TabIcon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.key}
                    value={tab.key}
                    className="group h-8 flex-none gap-2 rounded-full border border-transparent bg-transparent py-1 pr-1 pl-2 text-xs data-[state=active]:border-border data-[state=active]:bg-accent data-[state=active]:text-foreground data-[state=active]:shadow-none"
                  >
                    <TabIcon
                      className={cn(
                        "size-3.5",
                        active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                      )}
                    />
                    <span>{tab.label}</span>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "h-5 min-w-5 justify-center px-1.5 text-[10px]",
                        !active && "bg-transparent text-muted-foreground",
                      )}
                    >
                      {counts[tab.key]}
                    </Badge>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>
        <div
          data-testid="trip-list-filter-scroll-hint"
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 flex w-12 items-center justify-end bg-gradient-to-l from-background via-background/85 to-transparent pr-3 sm:hidden"
        >
          <span className="h-6 w-px rounded-full bg-border" />
        </div>
      </div>
    </section>
  );
}
