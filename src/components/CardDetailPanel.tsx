import { Edit3, Eye, X } from "lucide-react";
import type { CanvasCard } from "../models/trip";
import { filterRedundantCardDetails } from "../utils/tripWorkspaceViewHelpers";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { CardSourceMemory } from "../models/tripMaterialMemory";
import { CANVAS_CARD_TYPE_LABELS } from "./card-detail/constants";
import { CANVAS_CARD_TYPE_ICONS } from "./card-detail/cardDetailIcons";
import { CardDetailFooter } from "./card-detail/CardDetailFooter";
import { getCardDetailComponents } from "./card-detail/cardDetailRegistry";
import { useCardDetailEditState } from "./card-detail/useCardDetailEditState";

interface CardDetailPanelProps {
  card: CanvasCard | null;
  sourceMemory?: CardSourceMemory;
  onClose: () => void;
  onUpdateCard?: (updated: CanvasCard) => void;
  onDeleteCard?: (id: string) => void;
  onStartLinking?: (id: string) => void;
  isLinkingActive?: boolean;
}

export default function CardDetailPanel({
  card,
  sourceMemory,
  onClose,
  onUpdateCard,
  onDeleteCard,
  onStartLinking,
  isLinkingActive = false,
}: CardDetailPanelProps) {
  const {
    isEditing,
    setIsEditing,
    confirmDelete,
    setConfirmDelete,
    editState,
    handlers,
  } = useCardDetailEditState(card, onUpdateCard);

  if (!card) return null;

  const { Edit, View } = getCardDetailComponents(card.type);
  const displayDetails = filterRedundantCardDetails(card.details, card.price);

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    } else {
      onDeleteCard?.(card.id);
      onClose();
    }
  };

  const handleStartLinking = () => {
    onStartLinking?.(card.id);
    onClose();
  };

  return (
    <Sheet open={!!card} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="z-[800] gap-0 overflow-y-auto p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-[280px]"
      >
        <SheetHeader className="sticky top-0 z-10 flex-row items-center justify-between border-b border-border bg-card p-0">
          <div className="flex items-center gap-2 px-4 py-3 text-xs font-semibold text-muted-foreground">
            <span className="text-primary">{CANVAS_CARD_TYPE_ICONS[card.type]}</span>
            <SheetTitle className="text-xs font-semibold text-muted-foreground">
              {CANVAS_CARD_TYPE_LABELS[card.type] || "Card"}
            </SheetTitle>
          </div>
          <div className="flex items-center gap-1 px-4">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsEditing((e) => !e)}
              title={isEditing ? "View details" : "Edit details"}
              aria-label={isEditing ? "View details" : "Edit details"}
            >
              {isEditing ? <Eye className="size-3.5" /> : <Edit3 className="size-3.5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              aria-label="Close details panel"
            >
              <X className="size-3.5" />
            </Button>
          </div>
        </SheetHeader>

        {card.image && (
          <div className="relative h-[140px] w-full shrink-0 overflow-hidden bg-muted">
            <img src={card.image} alt={card.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/10 transition-all group-hover:bg-black/25" />
          </div>
        )}

        <div className="flex-1 p-4">
          {isEditing ? (
            <Edit card={card} editState={editState} handlers={handlers} />
          ) : (
            <View
              card={card}
              displayDetails={displayDetails}
              sourceMemory={sourceMemory}
            />
          )}
        </div>

        <CardDetailFooter
          sourceMemory={sourceMemory}
          isLinkingActive={isLinkingActive}
          confirmDelete={confirmDelete}
          onStartLinking={handleStartLinking}
          onDelete={handleDelete}
          showLinkButton={!!onStartLinking}
          showDeleteButton={!!onDeleteCard}
        />
      </SheetContent>
    </Sheet>
  );
}
