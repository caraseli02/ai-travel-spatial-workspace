import { useReducer, useCallback } from 'react';
import {
  tripWorkspaceReducer,
  type TripWorkspaceState
} from '../models/tripWorkspaceModel';
import type { CanvasCard, Trip } from '../models/trip';

export function useTripWorkspaceState(initialState: TripWorkspaceState, trip?: Trip) {
  const [state, dispatch] = useReducer(tripWorkspaceReducer, initialState);

  const addInboxItem = useCallback((content: string) => {
    dispatch({ type: 'ADD_INBOX_ITEM', content });
  }, []);

  const processInboxItem = useCallback((id: string) => {
    dispatch({ type: 'PROCESS_INBOX_ITEM', id });
  }, []);

  const deleteCard = useCallback((id: string) => {
    dispatch({ type: 'DELETE_CARD', id });
  }, []);

  const updateCard = useCallback((card: CanvasCard) => {
    dispatch({ type: 'UPDATE_CARD', card });
  }, []);

  const addConnection = useCallback((fromId: string, toId: string) => {
    dispatch({ type: 'ADD_CONNECTION', fromId, toId });
  }, []);

  const addCustomDay = useCallback((dayNum: number, label: string) => {
    dispatch({ type: 'ADD_CUSTOM_DAY', dayNum, label });
  }, []);

  const sendAiQuery = useCallback((query: string) => {
    if (!query.trim()) return;
    dispatch({ type: 'AI_PROMPT_START' });
    setTimeout(() => {
      dispatch({ type: 'AI_PROMPT_SUCCESS', query, trip });
    }, 1200);
  }, [trip]);

  const setSelectedCard = useCallback((card: CanvasCard | null) => {
    dispatch({ type: 'SET_SELECTED_CARD', card });
  }, []);

  const openCreateModal = useCallback((coords: { x: number; y: number } | null) => {
    dispatch({ type: 'OPEN_CREATE_MODAL', coords });
  }, []);

  const closeCreateModal = useCallback(() => {
    dispatch({ type: 'CLOSE_CREATE_MODAL' });
  }, []);

  const openAddDayModal = useCallback(() => {
    dispatch({ type: 'OPEN_ADD_DAY_MODAL' });
  }, []);

  const closeAddDayModal = useCallback(() => {
    dispatch({ type: 'CLOSE_ADD_DAY_MODAL' });
  }, []);

  const toggleOverflow = useCallback((show?: boolean) => {
    dispatch({ type: 'TOGGLE_OVERFLOW', show });
  }, []);

  const updateCardPosition = useCallback((id: string, x: number, y: number) => {
    dispatch({ type: 'UPDATE_CARD_POSITION', id, x, y });
  }, []);

  const setActiveDay = useCallback((day: number | null | ((prev: number | null) => number | null)) => {
    dispatch({ type: 'SET_ACTIVE_DAY', day });
  }, []);

  const createManualCard = useCallback((cardData: Omit<CanvasCard, 'id' | 'x' | 'y' | 'rotation'>) => {
    dispatch({ type: 'CREATE_MANUAL_CARD', cardData });
  }, []);

  return {
    state,
    addInboxItem,
    processInboxItem,
    deleteCard,
    updateCard,
    addConnection,
    addCustomDay,
    sendAiQuery,
    setSelectedCard,
    openCreateModal,
    closeCreateModal,
    openAddDayModal,
    closeAddDayModal,
    toggleOverflow,
    updateCardPosition,
    setActiveDay,
    createManualCard,
    dispatch,
  };
}
