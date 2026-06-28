import { Calendar, ExternalLink, Link, Trash2 } from "lucide-react";
import type { CardSourceMemory } from "../../models/tripMaterialMemory";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CardDetailFooterProps {
  sourceMemory?: CardSourceMemory;
  isLinkingActive?: boolean;
  confirmDelete: boolean;
  onStartLinking?: () => void;
  onDelete?: () => void;
  showLinkButton: boolean;
  showDeleteButton: boolean;
}

export function CardDetailFooter({
  sourceMemory,
  isLinkingActive = false,
  confirmDelete,
  onStartLinking,
  onDelete,
  showLinkButton,
  showDeleteButton,
}: CardDetailFooterProps) {
  return (
    <div className="mt-auto shrink-0 space-y-2 border-t border-border bg-muted/30 p-4">
      {showLinkButton && onStartLinking && (
        <Button
          variant="outline"
          onClick={onStartLinking}
          className={cn(
            "w-full text-xs font-semibold",
            isLinkingActive && "animate-pulse border-amber-300 bg-amber-100 text-amber-900",
          )}
        >
          <Link className={cn("size-3", isLinkingActive ? "text-amber-700" : "")} />
          {isLinkingActive ? "Select target card on canvas..." : "Link with another card"}
        </Button>
      )}

      <div className="grid grid-cols-2 gap-2">
        {showDeleteButton && onDelete && (
          <Button
            variant="outline"
            onClick={onDelete}
            className={cn(
              "text-xs font-semibold border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive",
              confirmDelete &&
                "animate-pulse border-destructive bg-destructive text-destructive-foreground hover:bg-destructive hover:text-destructive-foreground",
            )}
          >
            <Trash2 className="size-3" />
            {confirmDelete ? "Confirm delete" : "Delete Card"}
          </Button>
        )}

        <Button variant="outline" className="text-xs font-semibold text-muted-foreground">
          <Calendar className="size-3" />
          Itinerary
        </Button>
      </div>

      {sourceMemory?.kind === "source-backed" && sourceMemory.sourceUrl && (
        <Button asChild className="w-full text-xs font-bold">
          <a href={sourceMemory.sourceUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-3" />
            Open original link
          </a>
        </Button>
      )}
    </div>
  );
}
