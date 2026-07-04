import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AiPromptBarStaticProps {
  className?: string;
}

export function AiPromptBarStatic({ className }: AiPromptBarStaticProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-3 shadow-md",
        className,
      )}
      aria-hidden="true"
    >
      <div className="flex items-center gap-2">
        <Sparkles className="size-3.5 shrink-0 text-primary" />
        <p className="flex-1 text-xs text-muted-foreground">Ask AI about this trip…</p>
        <Button type="button" size="icon" className="size-8 shrink-0 rounded-md" disabled tabIndex={-1}>
          <Plus className="size-4" />
        </Button>
      </div>
    </div>
  );
}
