import type { CanvasCard } from "../../models/trip";
import type { CardSourceMemory } from "../../models/tripMaterialMemory";

export interface CardDetailEditState {
  title: string;
  subtitle: string;
  tag: string;
  tagColor: string;
  details: string[];
  price: string;
  rating: number;
}

export interface CardDetailEditHandlers {
  onTitleChange: (value: string) => void;
  onSubtitleChange: (value: string) => void;
  onTagChange: (value: string) => void;
  onTagColorChange: (value: string) => void;
  onPriceChange: (value: string) => void;
  onRatingChange: (value: number) => void;
  onDetailItemChange: (index: number, value: string) => void;
  onAddDetail: () => void;
  onRemoveDetail: (index: number) => void;
  onFieldChange: (updates: Partial<CanvasCard>) => void;
}

export interface CardDetailEditProps {
  card: CanvasCard;
  editState: CardDetailEditState;
  handlers: CardDetailEditHandlers;
}

export interface CardDetailViewProps {
  card: CanvasCard;
  displayDetails: string[];
  sourceMemory?: CardSourceMemory;
}
