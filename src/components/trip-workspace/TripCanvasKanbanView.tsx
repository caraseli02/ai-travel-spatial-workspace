import { useEffect, useMemo, useRef } from "react";
import { Plus } from "lucide-react";
import { CanvasCardRenderer } from "@/components/CanvasCards";
import type { CanvasCard, DayGroup } from "@/models/trip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getKanbanCanvasColumns,
  getMappedCards,
  scrollKanbanToActiveDayColumn,
} from "@/utils/tripWorkspaceViewHelpers";
import { KanbanMiniMap } from "./KanbanMiniMap";

export function TripCanvasKanbanView({
  days,
  cards,
  activeDay,
  selectedCard,
  isLinkingActive,
  linkingOriginId,
  zoom,
  isMobile = false,
  onActiveDayChange,
  onSelectCard,
  onCreateCard,
  onOpenMap,
}: {
  days: DayGroup[];
  cards: CanvasCard[];
  activeDay: number | null;
  selectedCard: CanvasCard | null;
  isLinkingActive: boolean;
  linkingOriginId: string | null;
  zoom: number;
  isMobile?: boolean;
  onActiveDayChange: (day: number | null) => void;
  onSelectCard: (card: CanvasCard) => void;
  onCreateCard: () => void;
  onOpenMap: () => void;
}) {
  const columns = useMemo(() => getKanbanCanvasColumns(days, cards), [cards, days]);
  const locatedCardCount = useMemo(() => getMappedCards(cards).length, [cards]);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const columnRefs = useRef(new Map<number, HTMLElement>());
  const displayColumns = useMemo(() => {
    if (isMobile && activeDay !== null) {
      return columns.filter((column) => column.day === activeDay);
    }
    return columns;
  }, [activeDay, columns, isMobile]);

  useEffect(() => {
    if (activeDay === null) return;
    const scroller = scrollerRef.current;
    const column = columnRefs.current.get(activeDay) ?? null;
    scrollKanbanToActiveDayColumn(scroller, column, activeDay, isMobile);
  }, [activeDay, isMobile]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#f5f3ef]">
      <div
        ref={scrollerRef}
        className={cn(
          "absolute inset-x-0 bottom-[calc(7rem+env(safe-area-inset-bottom))] md:bottom-32 md:top-14",
          isMobile && activeDay !== null && "top-0 overflow-x-hidden overflow-y-auto",
          isMobile && activeDay === null && "top-0 snap-x snap-mandatory scroll-pl-4 overflow-x-auto overflow-y-hidden",
          !isMobile && "top-14 overflow-x-auto overflow-y-hidden",
        )}
      >
        <div
          className={cn(
            "flex h-full min-w-max origin-top-left gap-3 p-3 pb-6 transition-[zoom] md:py-4 md:pr-[18rem] md:pl-10",
            isMobile && activeDay === null && "[&>section]:snap-center",
            isMobile && activeDay !== null && "h-auto min-h-full w-full min-w-0 flex-col",
          )}
          style={{ zoom }}
        >
          {displayColumns.map((column) => {
            const isActive = activeDay === column.day;
            const isDimmed = activeDay !== null && !isActive;
            const cardLabel = column.cards.length === 1 ? "card" : "cards";

            return (
              <section
                key={column.day}
                ref={(element) => {
                  if (element) {
                    columnRefs.current.set(column.day, element);
                  } else {
                    columnRefs.current.delete(column.day);
                  }
                }}
                className={cn(
                  "flex shrink-0 flex-col gap-2.5 rounded-xl border border-[#e7e3dc] bg-[#fefcf8] p-2.5 transition",
                  isMobile && activeDay === null && "w-[calc(100vw-2rem)] snap-center sm:w-[255px]",
                  isMobile && activeDay !== null && "w-full max-w-none",
                  !isMobile && "w-[255px]",
                  isDimmed && "opacity-40",
                )}
                aria-label={column.label}
              >
                <button
                  type="button"
                  className="flex flex-col gap-2 text-left"
                  onClick={() => onActiveDayChange(isActive ? null : column.day)}
                >
                  <span className="flex items-start gap-1.5">
                    <span className="mt-1 size-2 shrink-0 rounded-full" style={{ backgroundColor: column.color }} />
                    <span className="line-clamp-2 text-xs leading-snug font-semibold text-stone-800">{column.label}</span>
                  </span>
                  <span className="text-[11px] font-medium text-stone-400">
                    {column.cards.length} {cardLabel}
                  </span>
                </button>

                <div
                  className={cn(
                    "flex flex-col gap-2.5",
                    isMobile && activeDay !== null
                      ? "overflow-visible"
                      : "scrollbar-thin max-h-[calc(100vh-260px)] overflow-y-auto md:max-h-[696px]",
                  )}
                >
                  {column.cards.map((card) => (
                    <div
                      key={card.id}
                      role="button"
                      tabIndex={0}
                      className={cn(
                        "rounded-xl transition",
                        selectedCard?.id === card.id && "ring-4 ring-primary/10",
                        isLinkingActive && linkingOriginId !== card.id && "hover:ring-4 hover:ring-amber-500/25",
                      )}
                      onClick={() => onSelectCard(card)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          onSelectCard(card);
                        }
                      }}
                    >
                      <CanvasCardRenderer card={card} embedded />
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onCreateCard}
                    className="h-auto w-full justify-center gap-2 rounded-xl border-2 border-dashed border-stone-300/70 bg-transparent py-3 text-xs text-muted-foreground hover:border-stone-400 hover:bg-transparent hover:text-foreground"
                  >
                    <Plus className="size-3.5" />
                    Add card
                  </Button>
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <div className="hidden md:block">
        <KanbanMiniMap locatedCardCount={locatedCardCount} onOpenMap={onOpenMap} />
      </div>
    </div>
  );
}
