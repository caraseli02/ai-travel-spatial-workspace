import { ChevronRight, CircleCheck, Plus, Send, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function InboxPreview() {
  return (
    <aside className="hidden w-[280px] shrink-0 flex-col border-r border-[#e7e3dc] bg-[#fefcf8] md:flex">
      <div className="space-y-1 border-b border-[#e7e3dc] px-4 pb-3 pt-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-stone-800">Inbox</p>
          <Badge
            variant="outline"
            className="gap-1 rounded-full border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-normal text-amber-800"
          >
            <Sparkles className="size-2.5" />
            AI active
          </Badge>
        </div>
        <p className="text-xs leading-snug text-stone-500">
          Paste links, messages, or notes — Wayfarer will organize them on the canvas.
        </p>
      </div>

      <div className="border-b border-[#f5f3ef] p-3">
        <div className="relative min-h-[76px] rounded-xl border-[1.5px] border-[#e7e3dc] bg-[#f5f3ef] p-3">
          <p className="text-xs text-stone-400">Try: &quot;Top 7 hidden Kyoto temples...&quot;</p>
          <div className="absolute bottom-2 right-2 flex size-7 items-center justify-center rounded-lg bg-[#e7e3dc]">
            <Send className="size-3 text-stone-500" />
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-hidden p-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold tracking-wide text-stone-500">TO ORGANIZE</p>
            <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700">
              4
            </span>
          </div>
          <div className="rounded-lg border border-[#e7e3dc] bg-background p-3">
            <p className="text-sm font-semibold text-stone-800">Reddit · r/JapanTravel</p>
            <p className="mt-1 text-xs leading-relaxed text-stone-500">
              Hidden gems in Higashiyama — locals share their favorites
            </p>
            <div className="mt-2 flex items-center justify-between gap-2 rounded-lg border border-[#e7e3dc] bg-[#f5f3ef] px-3 py-2">
              <span className="text-xs font-medium text-amber-800">Place on canvas</span>
              <ChevronRight className="size-2.5 text-amber-800" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold tracking-wide text-stone-500">ON CANVAS</p>
            <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-xs font-medium text-emerald-800">
              3
            </span>
          </div>
          <div className="rounded-lg border border-[#e7e3dc] bg-background p-3 opacity-80">
            <p className="text-sm font-semibold text-stone-800">Fushimi Inari at sunrise</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="flex items-center gap-1 text-xs text-emerald-600">
                <CircleCheck className="size-2.5" />
                Added to canvas
              </span>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-1.5 py-0.5 font-mono text-[9px] text-amber-800">
                34.967, 135.772
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[#e7e3dc] bg-[#faf9f7] px-4 py-3">
        <span className="text-xs text-stone-500">7 items total</span>
        <span className="flex items-center gap-1 text-xs font-medium text-amber-800">
          <Plus className="size-3" />
          Add manually
        </span>
      </div>
    </aside>
  );
}
