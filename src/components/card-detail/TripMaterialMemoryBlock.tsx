import { ExternalLink } from "lucide-react";
import type { CardSourceMemory } from "../../models/tripMaterialMemory";
import { Badge } from "@/components/ui/badge";

export function TripMaterialMemoryBlock({ sourceMemory }: { sourceMemory: CardSourceMemory }) {
  if (sourceMemory.kind === "manual") {
    return (
      <div className="rounded-lg border border-border bg-muted/40 p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            Trip Material Memory
          </p>
          <Badge variant="secondary" className="text-[10px]">
            Manual
          </Badge>
        </div>
        <p className="text-xs font-semibold text-foreground">{sourceMemory.title}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {sourceMemory.description}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold tracking-wider text-emerald-900 uppercase">
          Trip Material Memory
        </p>
        <Badge className="border-emerald-200 bg-white text-[10px] text-emerald-800">
          Source-backed
        </Badge>
      </div>
      <p className="text-xs font-semibold text-foreground">{sourceMemory.sourceLabel}</p>
      <p className="mt-1 line-clamp-4 text-xs leading-relaxed text-muted-foreground">
        {sourceMemory.rawContent}
      </p>
      {sourceMemory.sourceUrl && (
        <a
          href={sourceMemory.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex max-w-full items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          <ExternalLink className="size-3 shrink-0" />
          <span className="truncate">{sourceMemory.sourceUrl}</span>
        </a>
      )}
    </div>
  );
}
