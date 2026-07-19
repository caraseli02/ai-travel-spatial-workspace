import type { FormEvent } from "react";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TripPromptBarProps {
  promptValue: string;
  promptFocused: boolean;
  onPromptValueChange: (value: string) => void;
  onPromptFocusedChange: (focused: boolean) => void;
  onSubmit: (event?: FormEvent, overrideValue?: string) => void | Promise<void>;
}

const suggestions = [
  "Plan a 5-day trip to Paris for 2 people",
  "Create a beach vacation to Bali",
  "Weekend getaway to Tokyo",
  "Adventure trip to Iceland",
];

export function TripPromptBar({
  promptValue,
  promptFocused,
  onPromptValueChange,
  onPromptFocusedChange,
  onSubmit,
}: TripPromptBarProps) {
  const expanded = promptFocused || promptValue.trim().length > 0;

  return (
    <div
      data-testid="trip-prompt-bar"
      className="shrink-0 border-t border-border/60 bg-background px-4 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-12 sm:pb-4"
    >
      <div className="mx-auto flex w-full max-w-[760px] flex-col items-center gap-2">
        {expanded && (
          <div
            data-testid="trip-prompt-bar-suggestions"
            className="scrollbar-none flex w-full flex-nowrap items-center justify-start gap-2 overflow-x-auto pb-1 animate-in fade-in slide-in-from-bottom-1"
          >
            {suggestions.map((suggestion) => (
              <Button
                key={suggestion}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onSubmit(undefined, suggestion)}
                className="h-auto rounded-full px-3 py-1.5 text-[10px] font-medium whitespace-nowrap shadow-sm active:scale-[0.98]"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        )}

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void onSubmit(event);
          }}
          className={cn(
            "flex w-full max-w-[672px] items-center gap-2 rounded-2xl border bg-card py-1 pr-1 pl-2 transition-all duration-200",
            promptFocused ? "border-primary/50" : "border-border",
          )}
        >
          <Button type="button" size="icon" className="pointer-events-none shrink-0" tabIndex={-1} aria-hidden>
            <Sparkles className="size-4" />
          </Button>

          <Input
            type="text"
            enterKeyHint="send"
            className="h-8 flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 dark:bg-transparent"
            placeholder="Describe your dream trip..."
            value={promptValue}
            onChange={(event) => onPromptValueChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey && promptValue.trim()) {
                event.preventDefault();
                void onSubmit(event);
              }
            }}
            onFocus={() => onPromptFocusedChange(true)}
            onBlur={() => setTimeout(() => onPromptFocusedChange(false), 200)}
          />

          <Button
            type="submit"
            variant="outline"
            size="icon"
            disabled={!promptValue.trim()}
            className="shrink-0"
          >
            <Send className="size-4 text-muted-foreground" />
          </Button>
        </form>

        {expanded && (
          <p
            data-testid="trip-prompt-bar-disclaimer"
            className="text-center text-[10px] text-muted-foreground select-none animate-in fade-in"
          >
            AI can make mistakes. Double-check important details.
          </p>
        )}
      </div>
    </div>
  );
}
