import { ChevronLeft, Compass, MessageSquare, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TripListHeaderProps {
  chatCount: number;
  showChatHistory: boolean;
  onBack: () => void;
  onToggleChat: () => void;
  onCreateTrip: () => void;
}

export function TripListHeader({
  chatCount,
  showChatHistory,
  onBack,
  onToggleChat,
  onCreateTrip,
}: TripListHeaderProps) {
  const chatToggleLabel = `${showChatHistory ? "Close" : "Open"} chat history${
    chatCount > 0
      ? `, ${chatCount} ${chatCount === 1 ? "conversation" : "conversations"}`
      : ""
  }`;

  return (
    <header className="z-20 h-16 shrink-0 border-b border-border bg-background">
      <div className="mx-auto flex h-full w-full max-w-[1344px] items-center justify-between px-4 sm:px-12">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="h-auto gap-2 px-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          <div className="flex size-7 items-center justify-center rounded-[6px] bg-primary">
            <Compass className="size-[15px] text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="text-[15px] font-semibold tracking-[-0.3px]">Wayfarer</span>
        </Button>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleChat}
            aria-label={chatToggleLabel}
            className={cn(showChatHistory && "bg-accent text-foreground")}
          >
            <MessageSquare className="size-4" />
            <span className="hidden sm:inline">Chat</span>
            {chatCount > 0 && (
              <Badge className="size-5 justify-center rounded-full p-0 text-[10px]">
                {chatCount}
              </Badge>
            )}
          </Button>

          <Button onClick={onCreateTrip} size="sm">
            <Plus className="size-3.5" />
            New trip
          </Button>
        </div>
      </div>
    </header>
  );
}
