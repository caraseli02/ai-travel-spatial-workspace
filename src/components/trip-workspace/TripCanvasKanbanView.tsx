import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { CanvasCardRenderer } from "@/components/CanvasCards";
import type { CanvasCard, DayGroup } from "@/models/trip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getKanbanCanvasColumns,
  resetKanbanScrollerPosition,
  scrollKanbanToActiveDayColumn,
} from "@/utils/tripWorkspaceViewHelpers";

export function TripCanvasKanbanView({
  days,
  cards,
  activeDay,
  selectedCard,
  isLinkingActive,
  linkingOriginId,
  zoom,
  viewResetNonce = 0,
  isMobile = false,
  onActiveDayChange,
  onSelectCard,
  onCreateCard,
}: {
  days: DayGroup[];
  cards: CanvasCard[];
  activeDay: number | null;
  selectedCard: CanvasCard | null;
  isLinkingActive: boolean;
  linkingOriginId: string | null;
  zoom: number;
  viewResetNonce?: number;
  isMobile?: boolean;
  onActiveDayChange: (day: number | null) => void;
  onSelectCard: (card: CanvasCard) => void;
  onCreateCard: () => void;
}) {
  const columns = useMemo(() => getKanbanCanvasColumns(days, cards), [cards, days]);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const columnRefs = useRef(new Map<number, HTMLElement>());
  const [dayFilterHintDismissed, setDayFilterHintDismissed] = useState(false);
  const activeDayLabel = useMemo(
    () => columns.find((column) => column.day === activeDay)?.label ?? (activeDay !== null ? `Day ${activeDay}` : null),
    [activeDay, columns],
  );
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

  useEffect(() => {
    if (viewResetNonce === 0) return;
    resetKanbanScrollerPosition(scrollerRef.current);
  }, [viewResetNonce]);

  useEffect(() => {
    setDayFilterHintDismissed(false);
  }, [activeDay]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#f5f3ef]">
      {!isMobile && activeDay !== null && !dayFilterHintDismissed && activeDayLabel ? (
        <div className="pointer-events-none absolute inset-x-0 top-14 z-30 flex justify-center px-3">
          <div
            role="status"
            className="pointer-events-auto flex w-full max-w-xl items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-md"
          >
            <p className="min-w-0 flex-1 text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">{activeDayLabel}</span>
              {" — "}
              click{" "}
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={() => onActiveDayChange(null)}
                className="h-auto px-0 py-0 text-xs font-semibold"
              >
                All days
              </Button>{" "}
              to edit other cards
            </p>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => setDayFilterHintDismissed(true)}
              aria-label="Dismiss day filter hint"
              className="size-6 shrink-0 text-muted-foreground hover:bg-muted"
            >
              <X className="size-3" />
            </Button>
          </div>
        </div>
      ) : null}
      <div
        ref={scrollerRef}
        className={cn(
          "absolute inset-x-0 bottom-0",
          isMobile ? "top-0" : "top-14",
          isMobile && activeDay !== null && "overflow-x-hidden overflow-y-auto",
          isMobile && activeDay === null && "snap-x snap-mandatory scroll-pl-4 overflow-x-auto overflow-y-hidden",
          !isMobile && "overflow-x-auto overflow-y-hidden",
        )}
      >
        <div
          className={cn(
            "flex h-full origin-top-left gap-3 p-3 transition-[zoom] md:py-4 md:pl-44",
            "pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-28",
            isMobile ? "min-w-max" : "w-max min-w-full",
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
                  "flex flex-col gap-2.5 rounded-xl border border-[#e7e3dc] bg-[#fefcf8] p-2.5 transition",
                  isMobile && "shrink-0",
                  isMobile && activeDay === null && "h-full w-[calc(100vw-2rem)] snap-center sm:w-[255px]",
                  isMobile && activeDay !== null && "w-full max-w-none",
                  !isMobile && "h-full min-w-[280px] max-w-[360px] flex-1 basis-[280px]",
                  isDimmed && "pointer-events-none opacity-40",
                  isActive && activeDay !== null && "relative z-10",
                )}
                aria-label={column.label}
              >
                <button
                  type="button"
                  className={cn(
                    "flex flex-col gap-2 text-left",
                    isDimmed && "pointer-events-auto",
                  )}
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
                    "flex flex-col gap-2 md:gap-2.5",
                    isMobile && activeDay !== null
                      ? "overflow-visible"
                      : "scrollbar-thin min-h-0 flex-1 overflow-y-auto",
                  )}
                >
                  {column.cards.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-stone-300/80 bg-stone-50/80 px-3 py-4 text-center text-xs leading-relaxed text-muted-foreground">
                      No plans yet — add an activity, note, or booking for this day.
                    </p>
                  ) : null}

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
                    className="h-auto w-full shrink-0 justify-center gap-2 rounded-xl border-2 border-dashed border-stone-300/70 bg-transparent py-3 text-xs text-muted-foreground hover:border-stone-400 hover:bg-transparent hover:text-foreground"
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
    </div>
  );
}
