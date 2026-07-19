import { useState } from "react";
import { Send, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface AiPromptBarProps {
  onSendQuery: (query: string) => void;
  isThinking: boolean;
  dayCount: number;
  isMobile: boolean;
  workspaceView?: "canvas" | "map";
}

export function AiPromptBar({
  onSendQuery,
  isThinking,
  dayCount,
  isMobile,
  workspaceView = "canvas",
}: AiPromptBarProps) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [mobileMapPromptOpen, setMobileMapPromptOpen] = useState(false);
  const nextDay = dayCount + 1;
  const suggestions = [
    `Plan Day ${nextDay}`,
    "Suggest a ryokan in Arashiyama",
    "Find a restaurant near Gion",
  ];
  const placeholderExample = `Plan Day ${nextDay}`;
  // On the mobile map companion the prompt starts as a compact FAB so the route sheet and
  // zoom controls stay the primary map affordances; tapping it reveals the full input.
  const isMobileMapCompanion = isMobile && workspaceView === "map";

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!value.trim() || isThinking) return;
    onSendQuery(value);
    setValue("");
    if (isMobileMapCompanion) setMobileMapPromptOpen(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSendQuery(suggestion);
    if (isMobileMapCompanion) setMobileMapPromptOpen(false);
  };

  if (isMobileMapCompanion && !mobileMapPromptOpen) {
    return (
      <div className="absolute bottom-[192px] right-4 z-[480]">
        <Button
          type="button"
          size="icon"
          className="size-11 rounded-full shadow-lg"
          onClick={() => setMobileMapPromptOpen(true)}
          aria-label="Ask AI about this trip"
        >
          <Sparkles className="size-5" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "pointer-events-none absolute left-1/2 w-full max-w-lg -translate-x-1/2 select-none px-3 md:px-4",
        isMobileMapCompanion ? "z-[480] bottom-[192px]" : "z-[600]",
        !isMobileMapCompanion &&
          (workspaceView === "map"
            ? "bottom-[calc(42vh+1rem)] md:bottom-14"
            : "bottom-[max(0.75rem,env(safe-area-inset-bottom))] md:bottom-14"),
      )}
    >
      <form
        onSubmit={handleSubmit}
        className={cn(
          "pointer-events-auto rounded-xl border bg-card transition-all duration-200",
          focused ? "border-amber-300 shadow-lg" : "border-border shadow-sm",
        )}
      >
        <div className="flex items-center gap-2 px-2.5 py-2 md:px-3 md:py-2.5">
          {isThinking ? (
            <Sparkles size={14} className="animate-spin text-amber-500" />
          ) : (
            <Sparkles size={14} className="text-primary" />
          )}
          <Input
            className="h-auto flex-1 border-0 bg-transparent px-0 text-xs shadow-none focus-visible:ring-0"
            placeholder={
              isThinking
                ? "AI is thinking..."
                : isMobile
                  ? "Ask AI about this trip…"
                  : `Paste a link or note to save, or ask AI to plan — e.g. "${placeholderExample}"`
            }
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            disabled={isThinking}
            autoFocus={isMobileMapCompanion}
          />
          {isThinking ? (
            <div className="flex items-center gap-1">
              <span
                className="size-1.5 animate-bounce rounded-full bg-amber-500"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="size-1.5 animate-bounce rounded-full bg-amber-500"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="size-1.5 animate-bounce rounded-full bg-amber-500"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          ) : (
            value && (
              <Button type="submit" size="icon-sm" className="size-6 shrink-0" aria-label="Send AI prompt">
                <Send size={12} />
              </Button>
            )
          )}
          {isMobileMapCompanion && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-6 shrink-0"
              onClick={() => setMobileMapPromptOpen(false)}
              aria-label="Close AI prompt"
            >
              <X size={12} />
            </Button>
          )}
        </div>

        {focused && !value && !isThinking && (
          <div className="flex animate-in flex-wrap gap-1.5 px-2.5 pb-2 fade-in slide-in-from-bottom-1 md:px-3 md:pb-2.5">
            {suggestions.map((s, i) => (
              <Button
                key={i}
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleSuggestionClick(s)}
                className="h-auto rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs text-amber-900 hover:bg-amber-100"
              >
                {s}
              </Button>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}
