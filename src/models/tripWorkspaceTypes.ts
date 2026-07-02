import type { CanvasCard, Connection, DayGroup, DayLabel, InboxItem, Trip } from "@/models/trip";

export interface TripWorkspaceState {
  activeDay: number | null;
  days: DayGroup[];
  dayLabels: DayLabel[];
  cards: CanvasCard[];
  connections: Connection[];
  items: InboxItem[];
  selectedCard: CanvasCard | null;
  isAiThinking: boolean;
  showCreateModal: boolean;
  createModalCoords: { x: number; y: number } | null;
  showAddDayModal: boolean;
  showOverflow: boolean;
}

export type TripWorkspaceAction =
  | { type: "ADD_INBOX_ITEM"; content: string }
  | { type: "PROCESS_INBOX_ITEM"; id: string }
  | { type: "DELETE_CARD"; id: string }
  | { type: "UPDATE_CARD"; card: CanvasCard }
  | { type: "ADD_CONNECTION"; fromId: string; toId: string }
  | { type: "ADD_CUSTOM_DAY"; dayNum: number; label: string }
  | { type: "AI_PROMPT_START" }
  | { type: "AI_PROMPT_SUCCESS"; query: string; trip?: Trip }
  | { type: "SET_SELECTED_CARD"; card: CanvasCard | null }
  | { type: "OPEN_CREATE_MODAL"; coords: { x: number; y: number } | null }
  | { type: "CLOSE_CREATE_MODAL" }
  | { type: "OPEN_ADD_DAY_MODAL" }
  | { type: "CLOSE_ADD_DAY_MODAL" }
  | { type: "TOGGLE_OVERFLOW"; show?: boolean }
  | { type: "UPDATE_CARD_POSITION"; id: string; x: number; y: number }
  | { type: "SET_ACTIVE_DAY"; day: number | null | ((prev: number | null) => number | null) }
  | { type: "CREATE_MANUAL_CARD"; cardData: Omit<CanvasCard, "id" | "x" | "y" | "rotation"> };
