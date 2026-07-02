import { ArrowUp, Inbox, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { inboxItems } from "./landingData";

export function InboxMock({ className }: { className?: string }) {
  return (
    <Card className={cn("overflow-hidden rounded-[18px] py-0 shadow-lg", className)}>
      <div className="flex items-center justify-between border-b border-border px-4 py-4">
        <div className="flex items-center gap-2">
          <Inbox className="size-[18px]" />
          <span className="font-semibold">Inbox</span>
        </div>
        <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">
          3 new
        </Badge>
      </div>
      <div className="flex items-center gap-2.5 border-b border-border px-4 py-3.5">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary">
          <Sparkles className="size-3.5 text-primary-foreground" />
        </div>
        <p className="flex-1 text-sm text-muted-foreground">Paste a link, screenshot, or note…</p>
        <ArrowUp className="size-[18px] text-muted-foreground" />
      </div>
      <div className="flex flex-col gap-2.5 p-4">
        {inboxItems.map((item) => (
          <div
            key={item.title}
            className="flex items-center gap-3 rounded-xl border border-border bg-background p-3"
          >
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-[10px]",
                item.iconBg,
              )}
            >
              <item.icon className="size-[19px]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{item.title}</p>
              <p className="truncate text-xs text-muted-foreground">{item.sub}</p>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold",
                item.tagClass,
              )}
            >
              {item.tag}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
