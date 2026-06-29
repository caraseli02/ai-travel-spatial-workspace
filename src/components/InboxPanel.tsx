import React, { useState } from "react";
import {
  Sparkles,
  MessageSquare,
  Link2,
  FileText,
  Plane,
  Hotel,
  ChevronRight,
  Plus,
  Send,
  CheckCircle2,
  Circle,
} from "lucide-react";
import type { CanvasCard, InboxItem } from "../models/trip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { resolveInboxItemDisplayState } from "../models/tripMaterialMemory";

interface InboxPanelProps {
  items: InboxItem[];
  cards?: CanvasCard[];
  onProcessItem: (id: string) => void;
  onAddItem: (content: string) => void;
  onOpenAddManual?: () => void;
}

const sourceIcons: Record<string, React.ReactElement> = {
  whatsapp: <MessageSquare size={13} />,
  link: <Link2 size={13} />,
  note: <FileText size={13} />,
  flight: <Plane size={13} />,
  hotel: <Hotel size={13} />,
};

const sourceColors: Record<string, { icon: string; bg: string; border: string }> = {
  whatsapp: { icon: "#25d366", bg: "#f0fdf4", border: "#bbf7d0" },
  link: { icon: "#6366f1", bg: "#eef2ff", border: "#c7d2fe" },
  note: { icon: "#f59e0b", bg: "#fef3c7", border: "#fde68a" },
  flight: { icon: "#92400e", bg: "#fef3c7", border: "#fde68a" },
  hotel: { icon: "#be123c", bg: "#ffe4e6", border: "#fecdd3" },
};

const sampleInputs = [
  "https://google.com/flights/SFO-KIX-Dec14",
  "Try Junsei near Nanzenji! — Yuki",
  "Hiiragiya Ryokan availability?",
];

export default function InboxPanel({
  items,
  cards = [],
  onProcessItem,
  onAddItem,
  onOpenAddManual,
}: InboxPanelProps) {
  const [inputVal, setInputVal] = useState("");
  const [placeholder, setPlaceholder] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const unprocessed = items.filter((i) => !i.processed);
  const processed = items.filter((i) => i.processed);

  function handleSend() {
    if (!inputVal.trim()) return;
    setIsProcessing(true);
    onAddItem(inputVal);
    setTimeout(() => {
      setIsProcessing(false);
      setInputVal("");
    }, 1200);
  }

  function cyclePlaceholder() {
    setPlaceholder((p) => (p + 1) % sampleInputs.length);
  }

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="border-b border-border px-4 pt-4 pb-3">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Inbox</h2>
          <Badge
            variant="secondary"
            className="gap-1 border-amber-200/80 bg-amber-50 text-amber-900"
          >
            <Sparkles className="size-2.5" />
            AI active
          </Badge>
        </div>
        <p className="text-xs leading-snug text-muted-foreground">
          Paste links, messages, or notes — Wayfarer will organize them on the canvas.
        </p>
      </div>

      <div className="border-b border-border/60 px-3 py-3">
        <div className="relative">
          <Textarea
            className="min-h-[76px] resize-none border-border bg-muted/50 pr-10 text-xs text-foreground placeholder:text-muted-foreground/70"
            placeholder={`Try: "${sampleInputs[placeholder]}"`}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onFocus={cyclePlaceholder}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.metaKey) handleSend();
            }}
            aria-describedby="inbox-input-hint"
          />
          <Button
            onClick={handleSend}
            disabled={!inputVal.trim() || isProcessing}
            size="icon-sm"
            className="absolute right-2.5 bottom-2.5 disabled:pointer-events-none disabled:opacity-40"
            aria-label="Submit inbox item"
          >
            {isProcessing ? (
              <div className="size-3 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              <Send className="size-3" />
            )}
          </Button>
        </div>
        <p id="inbox-input-hint" className="mt-1.5 text-xs font-medium text-muted-foreground">
          {inputVal.trim()
            ? "Press ⌘ Enter or tap send to add this to your inbox."
            : "Paste a link or note above to enable submit."}
        </p>
        {isProcessing && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-primary">
            <Sparkles className="size-3" />
            <span>Extracting details and placing on canvas…</span>
          </div>
        )}
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto px-3 py-2">
        {unprocessed.length > 0 && (
          <div className="mb-4">
            <div className="mb-2 flex items-center gap-2 px-1">
              <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                To organize
              </span>
              <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                {unprocessed.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {unprocessed.map((item) => (
                <InboxItemCard
                  key={item.id}
                  item={item}
                  cards={cards}
                  onProcess={onProcessItem}
                />
              ))}
            </div>
          </div>
        )}

        {processed.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-2 px-1">
              <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Organized
              </span>
              <Badge className="h-5 border-emerald-200 bg-emerald-50 px-1.5 text-[10px] text-emerald-800">
                {processed.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {processed.map((item) => (
                <InboxItemCard
                  key={item.id}
                  item={item}
                  cards={cards}
                  onProcess={onProcessItem}
                  dimmed
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border bg-muted/30 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <span className="text-xs text-muted-foreground">{items.length} items total</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenAddManual}
          className="h-auto gap-1 px-0 text-xs font-medium text-primary hover:bg-transparent hover:text-primary/80"
        >
          <Plus className="size-3" />
          Add manually
        </Button>
      </div>
    </div>
  );
}

function InboxItemCard({
  item,
  cards,
  onProcess,
  dimmed,
}: {
  item: InboxItem;
  cards: CanvasCard[];
  onProcess: (id: string) => void;
  dimmed?: boolean;
}) {
  const colors = sourceColors[item.type] || sourceColors.note;
  const icon = sourceIcons[item.type] || sourceIcons.note;
  const displayState = resolveInboxItemDisplayState(item, cards);

  return (
    <Card
      className={cn(
        "gap-0 py-0 shadow-none ring-0 transition-all duration-200",
        dimmed ? "border-border/60 bg-muted/30 opacity-75" : "border-border bg-card",
      )}
    >
      <CardContent className="p-3 [--card-spacing:--spacing(3)]">
        <div className="group">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {item.avatar ? (
                <span className="text-sm">{item.avatar}</span>
              ) : (
                <div
                  className="flex size-5 shrink-0 items-center justify-center rounded"
                  style={{
                    backgroundColor: colors.bg,
                    color: colors.icon,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  {icon}
                </div>
              )}
              <span className="max-w-[120px] truncate text-xs font-medium text-foreground/80">
                {item.source}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground/60">{item.timestamp}</span>
              {!dimmed ? (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onProcess(item.id)}
                  className="size-7 shrink-0 text-muted-foreground opacity-100 transition-opacity hover:bg-transparent hover:text-emerald-500 md:opacity-0 md:group-hover:opacity-100"
                  aria-label="Mark as organized"
                  title="Mark as organized"
                >
                  <Circle size={14} />
                </Button>
              ) : (
                <CheckCircle2 size={14} className="text-emerald-400" />
              )}
            </div>
          </div>

          <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
            {item.content}
          </p>

          {!dimmed ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onProcess(item.id)}
              className="mt-2.5 h-auto w-full min-w-0 justify-start gap-2 overflow-hidden px-3 py-2 text-left"
            >
              <span className="min-w-0 flex-1 truncate text-xs font-medium text-muted-foreground">
                {displayState.label}
              </span>
              <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary">
                <Sparkles className="size-2.5" />
                Place on canvas
                <ChevronRight className="size-2.5" />
              </span>
            </Button>
          ) : (
            <div
              className={cn(
                "mt-2 flex items-start gap-1 text-xs",
                displayState.kind === "previously-organized"
                  ? "text-muted-foreground"
                  : "text-emerald-600",
              )}
            >
              <CheckCircle2 className="mt-0.5 size-2.5 shrink-0" />
              <div className="min-w-0">
                <span className="font-medium">{displayState.label}</span>
                {displayState.kind === "linked-card" && (
                  <span className="block truncate text-[11px] text-muted-foreground">
                    {displayState.cardTitle}
                  </span>
                )}
                {displayState.kind === "previously-organized" && (
                  <span className="block text-[11px] leading-snug">
                    {displayState.description}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
