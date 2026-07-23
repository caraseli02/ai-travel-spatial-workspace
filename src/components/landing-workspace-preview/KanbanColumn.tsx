import { Plus } from "lucide-react";
import type { CanvasCard } from "@/models/trip";
import { cn } from "@/lib/utils";
import { PreviewCard } from "./PreviewCard";

export function KanbanColumn({
  label,
  dotClass,
  cardCount,
  cards,
  showAddCard = false,
  className,
}: {
  label: string;
  dotClass: string;
  cardCount: string;
  cards: CanvasCard[];
  showAddCard?: boolean;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "flex w-[255px] shrink-0 flex-col gap-2.5 overflow-hidden rounded-xl border border-[#e7e3dc] bg-[#fefcf8] p-2.5",
        className,
      )}
    >
      <div className="flex shrink-0 items-center gap-2 px-1">
        <span className={cn("size-2 rounded-full", dotClass)} />
        <p className="text-xs font-semibold text-stone-800">{label}</p>
      </div>
      <p className="shrink-0 px-1 text-[11px] font-medium text-stone-500">{cardCount}</p>
      <div className="scrollbar-thin flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto">
        {cards.map((card) => (
          <PreviewCard key={card.id} card={card} />
        ))}
        {showAddCard && (
          <div className="flex items-center gap-1.5 px-1 py-1 text-xs text-stone-400">
            <div className="flex size-9 items-center justify-center rounded-xl border-2 border-dashed border-stone-300">
              <Plus className="size-4" />
            </div>
            Add card
          </div>
        )}
      </div>
    </section>
  );
}
