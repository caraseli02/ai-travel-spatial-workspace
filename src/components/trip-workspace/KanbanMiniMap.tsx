import { Route } from "lucide-react";
import { Card } from "@/components/ui/card";

const miniMapPins = [
  { x: 96, y: 56, color: "#f59e0b" },
  { x: 150, y: 98, color: "#f97316" },
  { x: 128, y: 80, color: "#f97316" },
  { x: 20, y: 66, color: "#10b981" },
  { x: 34, y: 84, color: "#10b981" },
  { x: 168, y: 64, color: "#f43f5e" },
];

export function KanbanMiniMap({
  locatedCardCount,
  onOpenMap,
}: {
  locatedCardCount: number;
  onOpenMap: () => void;
}) {
  return (
    <Card className="absolute bottom-24 right-5 z-20 h-[152px] w-[224px] overflow-hidden rounded-[14px] border-[#e7e3dc] bg-[#f2efe9] p-0 shadow-xl md:bottom-5">
      <div className="absolute -left-6 top-[84px] h-[72px] w-24 rounded-full bg-emerald-200/70" />
      <div className="absolute -top-5 right-[-26px] h-16 w-24 rounded-full bg-emerald-200/70" />
      <div className="absolute left-[118px] top-[-22px] h-[210px] w-3 rotate-12 rounded-full bg-sky-200/90" />
      <div className="absolute left-[-4px] top-[54px] h-1 w-[232px] -rotate-3 rounded-full bg-background" />
      <div className="absolute left-[70px] top-[-4px] h-40 w-0.5 bg-background" />

      {miniMapPins.map((pin) => (
        <span
          key={`${pin.x}-${pin.y}-${pin.color}`}
          className="absolute size-2.5 rounded-full border-2 border-background shadow-sm"
          style={{ left: pin.x, top: pin.y, backgroundColor: pin.color }}
        />
      ))}

      <div className="absolute inset-x-0 bottom-0 flex h-[30px] items-center justify-between border-t border-border bg-card/90 px-2.5 text-[11px]">
        <span className="truncate text-muted-foreground">{locatedCardCount} places pinned</span>
        <button type="button" className="flex items-center gap-1 font-medium text-foreground" onClick={onOpenMap}>
          <Route className="size-3" />
          Open map
        </button>
      </div>
    </Card>
  );
}
