import { CheckCircle2, Clock3, Compass, Filter, Globe, Plane } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    <div className="shrink-0 border-b border-border bg-background">
      <div className="mx-auto flex w-full max-w-[1344px] items-center gap-2.5 overflow-x-auto px-4 py-4 sm:px-12">
        <Button variant="outline" size="icon" className="shrink-0" aria-hidden>
          <Filter className="size-4 text-muted-foreground" />
        </Button>

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
    </div>
  );
}
