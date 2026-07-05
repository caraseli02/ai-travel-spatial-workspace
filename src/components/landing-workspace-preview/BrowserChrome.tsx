import { Lock, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { LANDING_PREVIEW_TRIP_ROUTE } from "./landingPreviewDemoCues";

export function BrowserChrome({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 border-b border-[#e7e3dc] bg-background",
        compact ? "h-10 px-3" : "h-11 px-4",
      )}
    >
      <div className="flex gap-1.5">
        <div className="size-2.5 rounded-full bg-red-400" />
        <div className="size-2.5 rounded-full bg-amber-400" />
        <div className="size-2.5 rounded-full bg-emerald-400" />
      </div>
      <div
        className={cn(
          "flex items-center gap-1.5 rounded-full bg-muted",
          compact ? "h-[22px] flex-1 px-2.5" : "h-[26px] min-w-0 flex-1 px-3 md:w-[300px] md:flex-none",
        )}
      >
        <Lock className="size-2.5 shrink-0 text-muted-foreground" />
        <span className="truncate text-[11px] text-muted-foreground md:text-xs">
          {LANDING_PREVIEW_TRIP_ROUTE}
        </span>
      </div>
      {!compact && (
        <>
          <div className="hidden flex-1 md:block" />
          <Share2 className="hidden size-4 text-muted-foreground md:block" />
        </>
      )}
    </div>
  );
}
