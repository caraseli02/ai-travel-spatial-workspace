import type { CanvasCard, Connection } from "@/models/trip";
import { buildInboxItem } from "@/models/tripWorkspaceInbox";
import {
  buildCustomDay,
  buildManualCanvasCard,
  buildProcessedCanvasCard,
} from "@/models/tripWorkspaceCanvas";
import { applyAiPromptToTripWorkspace } from "@/models/tripWorkspaceAi";
import type {
  AiPromptEffect,
  AiPromptResult,
  TripWorkspaceAction,
  TripWorkspaceState,
} from "@/models/tripWorkspaceTypes";

export type { AiPromptEffect, AiPromptResult, TripWorkspaceAction, TripWorkspaceState };

function mergeCanvasCardUpdate(existingCard: CanvasCard, updatedCard: CanvasCard): CanvasCard {
  return {
    ...existingCard,
    ...updatedCard,
    promotedFromInboxId: updatedCard.promotedFromInboxId ?? existingCard.promotedFromInboxId,
  };
}

export function canConnectCards(
  connections: Connection[],
  fromId: string,
  toId: string,
): boolean {
  if (!fromId || !toId) return false;
  if (fromId === toId) return false;

  const alreadyConnected = connections.some(
    (conn) =>
      (conn.from === fromId && conn.to === toId) || (conn.from === toId && conn.to === fromId),
  );

  return !alreadyConnected;
}

export function connectCards(
  state: TripWorkspaceState,
  fromId: string,
  toId: string,
): TripWorkspaceState {
  if (!canConnectCards(state.connections, fromId, toId)) {
    return state;
  }

  const newConnection: Connection = {
    from: fromId,
    to: toId,
    label: "custom-link",
  };

  return {
    ...state,
    connections: [...state.connections, newConnection],
  };
}

export function deleteCanvasCardFromWorkspace(
  state: TripWorkspaceState,
  cardId: string,
): TripWorkspaceState {
  const nextCards = state.cards.filter((card) => card.id !== cardId);
  const nextConnections = state.connections.filter(
    (connection) => connection.from !== cardId && connection.to !== cardId,
  );
  const nextSelectedCard = state.selectedCard?.id === cardId ? null : state.selectedCard;

  return {
    ...state,
    cards: nextCards,
    connections: nextConnections,
    selectedCard: nextSelectedCard,
  };
}

export function tripWorkspaceReducer(
  state: TripWorkspaceState,
  action: TripWorkspaceAction,
): TripWorkspaceState {
  switch (action.type) {
    case "ADD_INBOX_ITEM": {
      const newItem = buildInboxItem(action.content);
      return {
        ...state,
        items: [newItem, ...state.items],
      };
    }
    case "PROCESS_INBOX_ITEM": {
      const item = state.items.find((i) => i.id === action.id);
      if (!item) return state;

      const result = buildProcessedCanvasCard({
        item,
        activeDay: state.activeDay,
        dayLabels: state.dayLabels,
        cards: state.cards,
      });

      const nextConnections = result.connection
        ? [...state.connections, result.connection]
        : state.connections;

      return {
        ...state,
        items: state.items.map((i) => (i.id === action.id ? result.processedItem : i)),
        cards: [...state.cards, result.newCard],
        connections: nextConnections,
      };
    }
    case "DELETE_CARD": {
      return deleteCanvasCardFromWorkspace(state, action.id);
    }
    case "ADD_CONNECTION": {
      return connectCards(state, action.fromId, action.toId);
    }
    case "ADD_CUSTOM_DAY": {
      if (state.days.some((d) => d.day === action.dayNum)) {
        return state;
      }
      const { newDay, newLabel } = buildCustomDay(state.days, action.dayNum, action.label);
      return {
        ...state,
        days: [...state.days, newDay],
        dayLabels: [...state.dayLabels, newLabel],
        showAddDayModal: false,
      };
    }
    case "UPDATE_CARD": {
      const existingCard = state.cards.find((c) => c.id === action.card.id);
      const nextCard = existingCard ? mergeCanvasCardUpdate(existingCard, action.card) : action.card;
      const nextSelectedCard =
        state.selectedCard?.id === action.card.id
          ? state.selectedCard.promotedFromInboxId && !nextCard.promotedFromInboxId
            ? { ...nextCard, promotedFromInboxId: state.selectedCard.promotedFromInboxId }
            : nextCard
          : state.selectedCard;
      return {
        ...state,
        cards: state.cards.map((c) => (c.id === action.card.id ? nextCard : c)),
        selectedCard: nextSelectedCard,
      };
    }
    case "UPDATE_CARD_POSITION": {
      const nextCards = state.cards.map((c) =>
        c.id === action.id ? { ...c, x: action.x, y: action.y } : c,
      );
      const nextSelectedCard =
        state.selectedCard?.id === action.id
          ? { ...state.selectedCard, x: action.x, y: action.y }
          : state.selectedCard;
      return {
        ...state,
        cards: nextCards,
        selectedCard: nextSelectedCard,
      };
    }
    case "AI_PROMPT_START":
      return {
        ...state,
        isAiThinking: true,
      };
    case "AI_PROMPT_SUCCESS": {
      const { nextState } = applyAiPromptToTripWorkspace({
        ...state,
        query: action.query,
        trip: action.trip,
      });
      return {
        ...state,
        ...nextState,
        isAiThinking: false,
      };
    }
    case "SET_SELECTED_CARD":
      return {
        ...state,
        selectedCard: action.card,
      };
    case "OPEN_CREATE_MODAL":
      return {
        ...state,
        showCreateModal: true,
        createModalCoords: action.coords,
      };
    case "CLOSE_CREATE_MODAL":
      return {
        ...state,
        showCreateModal: false,
        createModalCoords: null,
      };
    case "OPEN_ADD_DAY_MODAL":
      return {
        ...state,
        showAddDayModal: true,
      };
    case "CLOSE_ADD_DAY_MODAL":
      return {
        ...state,
        showAddDayModal: false,
      };
    case "TOGGLE_OVERFLOW":
      return {
        ...state,
        showOverflow: action.show !== undefined ? action.show : !state.showOverflow,
      };
    case "SET_ACTIVE_DAY": {
      const nextActiveDay =
        typeof action.day === "function" ? action.day(state.activeDay) : action.day;
      return {
        ...state,
        activeDay: nextActiveDay,
      };
    }
    case "CREATE_MANUAL_CARD": {
      const coords = state.createModalCoords || { x: 450, y: 250 };
      const newCard = buildManualCanvasCard({ cardData: action.cardData, coords });
      return {
        ...state,
        cards: [...state.cards, newCard],
        showCreateModal: false,
        createModalCoords: null,
      };
    }
    default:
      return state;
  }
}
