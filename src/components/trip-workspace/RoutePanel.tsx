import { useEffect, useMemo, useState } from "react";
import { Route } from "lucide-react";
import type { CanvasCard, DayGroup } from "@/models/trip";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { groupRouteCardsByTimeOfDay } from "@/utils/tripWorkspaceViewHelpers";
import { RouteActivityCard } from "./RouteActivityCard";

/** Peek height on mobile: drag handle + day title + one next-stop preview — map stays mostly visible at rest. */
const COLLAPSED_SHEET_CLASS = "max-h-[176px]";
const EXPANDED_SHEET_CLASS = "max-h-[42vh]";

function RoutePanelShell({
  children,
  expanded,
  onToggleExpanded,
}: {
  children: React.ReactNode;
  expanded: boolean;
  onToggleExpanded: () => void;
}) {
  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[500] h-36 bg-gradient-to-t from-black/10 to-transparent md:hidden" />
      <Card
        className={cn(
          "absolute bottom-0 left-0 right-0 z-[500] flex flex-col overflow-hidden rounded-t-[28px] border-border bg-card p-0 shadow-2xl transition-[max-height] duration-200 md:bottom-8 md:left-auto md:right-8 md:max-h-[512px] md:w-[min(480px,calc(100vw-4rem))] md:rounded-[24px] md:p-6",
          expanded ? EXPANDED_SHEET_CLASS : COLLAPSED_SHEET_CLASS,
        )}
      >
        <button
          type="button"
          onClick={onToggleExpanded}
          aria-expanded={expanded}
          aria-label={expanded ? "Collapse route sheet" : "Expand route sheet"}
          className="flex shrink-0 items-center justify-center py-3 md:hidden"
        >
          <span className="h-1 w-10 rounded-full bg-border" />
        </button>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-4 md:p-0">{children}</div>
      </Card>
    </>
  );
}

function RoutePanel({
  activeDay,
  day,
  cards,
  selectedCard,
  onSelectCard,
  expanded,
}: {
  activeDay: number | null;
  day?: DayGroup;
  cards: CanvasCard[];
  selectedCard: CanvasCard | null;
  onSelectCard: (card: CanvasCard) => void;
  expanded: boolean;
}) {
  const sections = useMemo(() => groupRouteCardsByTimeOfDay(cards), [cards]);
  const cardIndexById = useMemo(
    () => new Map(cards.map((card, index) => [card.id, index])),
    [cards],
  );
  const isOverview = activeDay === null;
  const nextStop = cards[0];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 md:gap-4">
      <div className="flex shrink-0 flex-col gap-3">
        <div className="min-w-0 flex-1 pr-2">
          <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
            {isOverview ? "All days" : `Day ${day?.day ?? activeDay}`}
          </p>
          <h2 className="mt-1 text-lg font-semibold leading-tight text-foreground md:text-2xl">
            {isOverview ? "Map overview" : (day?.label ?? "Kyoto route")}
          </h2>
          <p className="mt-2 hidden text-sm text-muted-foreground md:block">
            {isOverview
              ? "Browse every pinned place. Select a day above to focus its route."
              : "Optimized sequence across nearby places, with the active day pinned on the map."}
          </p>
        </div>
        <Button
          className="hidden h-10 w-full rounded-xl bg-black px-4 text-white hover:bg-black/90 md:flex"
          aria-label="Open route in maps"
        >
          <Route className="size-4" />
          Open route
        </Button>
      </div>

      {!expanded && nextStop && (
        <div className="min-h-0 flex-1 overflow-hidden md:hidden" data-testid="route-sheet-peek">
          <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">Next stop</p>
          <RouteActivityCard
            card={nextStop}
            index={0}
            selected={selectedCard?.id === nextStop.id}
            onSelect={() => onSelectCard(nextStop)}
          />
        </div>
      )}

      <div className="hidden min-h-0 flex-1 flex-col gap-4 overflow-y-auto md:flex">
        {sections.map((section) => (
          <section key={section.label} className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold text-muted-foreground">{section.label}</h3>
            <div className="flex flex-col gap-2">
              {section.cards.map((card) => (
                <RouteActivityCard
                  key={card.id}
                  card={card}
                  index={cardIndexById.get(card.id) ?? 0}
                  selected={selectedCard?.id === card.id}
                  onSelect={() => onSelectCard(card)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {expanded && (
        <div
          className="flex min-h-0 flex-1 snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden"
          data-testid="route-sheet-carousel"
        >
          {cards.map((card, index) => (
            <RouteActivityCard
              key={card.id}
              card={card}
              index={index}
              selected={selectedCard?.id === card.id}
              onSelect={() => onSelectCard(card)}
              compact
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function RoutePanelOverlay({
  activeDay,
  day,
  cards,
  selectedCard,
  onSelectCard,
  onExpandedChange,
}: {
  activeDay: number | null;
  day?: DayGroup;
  cards: CanvasCard[];
  selectedCard: CanvasCard | null;
  onSelectCard: (card: CanvasCard) => void;
  onExpandedChange?: (expanded: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    onExpandedChange?.(expanded);
  }, [expanded, onExpandedChange]);

  return (
    <RoutePanelShell expanded={expanded} onToggleExpanded={() => setExpanded((value) => !value)}>
      <RoutePanel
        activeDay={activeDay}
        day={day}
        cards={cards}
        selectedCard={selectedCard}
        onSelectCard={onSelectCard}
        expanded={expanded}
      />
    </RoutePanelShell>
  );
}
