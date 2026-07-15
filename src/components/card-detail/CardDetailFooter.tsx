import { ExternalLink, Link, Trash2 } from "lucide-react";
import type { CardSourceMemory } from "../../models/tripMaterialMemory";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CardDetailFooterProps {
  sourceMemory?: CardSourceMemory;
  isLinkingActive?: boolean;
  onStartLinking?: () => void;
  onDelete?: () => void;
  showLinkButton: boolean;
  showDeleteButton: boolean;
}

export function CardDetailFooter({
  sourceMemory,
  isLinkingActive = false,
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

      {sourceMemory?.kind === "source-backed" && sourceMemory.sourceUrl && (
        <Button asChild className="w-full text-xs font-bold">
          <a href={sourceMemory.sourceUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-3" />
            Open original link
          </a>
        </Button>
      )}

      {showDeleteButton && onDelete && (
        <div
          className="border-t border-destructive/20 pt-2"
          data-card-detail-footer-section="destructive"
        >
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full text-xs font-semibold border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-3" />
                Delete Card
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this card?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. The card will be removed from your trip workspace.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={onDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}
