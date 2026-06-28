import type { ComponentType } from "react";
import type { CanvasCard } from "../../models/trip";
import {
  ArticleCardDetailEdit,
  ArticleCardDetailView,
} from "./ArticleCardDetail";
import {
  FlightCardDetailEdit,
  FlightCardDetailView,
} from "./FlightCardDetail";
import {
  HotelCardDetailEdit,
  HotelCardDetailView,
} from "./HotelCardDetail";
import {
  NoteCardDetailEdit,
  NoteCardDetailView,
} from "./NoteCardDetail";
import {
  PolaroidCardDetailEdit,
  PolaroidCardDetailView,
} from "./PolaroidCardDetail";
import {
  StickyCardDetailEdit,
  StickyCardDetailView,
} from "./StickyCardDetail";
import type { CardDetailEditProps, CardDetailViewProps } from "./types";

export const CANVAS_CARD_TYPES = [
  "sticky",
  "polaroid",
  "flight",
  "hotel",
  "article",
  "note",
] as const satisfies readonly CanvasCard["type"][];

export interface CardDetailTypeComponents {
  Edit: ComponentType<CardDetailEditProps>;
  View: ComponentType<CardDetailViewProps>;
}

const cardDetailByType: Record<CanvasCard["type"], CardDetailTypeComponents> = {
  sticky: { Edit: StickyCardDetailEdit, View: StickyCardDetailView },
  polaroid: { Edit: PolaroidCardDetailEdit, View: PolaroidCardDetailView },
  flight: { Edit: FlightCardDetailEdit, View: FlightCardDetailView },
  hotel: { Edit: HotelCardDetailEdit, View: HotelCardDetailView },
  article: { Edit: ArticleCardDetailEdit, View: ArticleCardDetailView },
  note: { Edit: NoteCardDetailEdit, View: NoteCardDetailView },
};

export function getCardDetailComponents(type: CanvasCard["type"]): CardDetailTypeComponents {
  return cardDetailByType[type];
}
