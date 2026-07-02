import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PreviewAiPromptBar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border-[1.5px] border-[#e7e3dc] bg-[#fefcf8] p-3 shadow-md",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <Sparkles className="size-3.5 shrink-0 text-amber-800" />
        <p className="flex-1 text-xs text-stone-500">Ask AI about this trip…</p>
        <Button type="button" size="icon" className="size-8 shrink-0 rounded-md" disabled tabIndex={-1}>
          <Plus className="size-4" />
        </Button>
      </div>
    </div>
  );
}
