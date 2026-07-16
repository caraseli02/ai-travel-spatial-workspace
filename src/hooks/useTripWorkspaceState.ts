import { useReducer, useCallback, useRef, useEffect } from 'react';
import {
  reduceTripWorkspaceWithEffects,
  type AiPromptEffect,
  type TripWorkspaceAction,
  type TripWorkspaceState
} from '@/models/tripWorkspaceModel';
import type { CanvasCard, Trip } from '@/models/trip';
import {
  delayedAiPromptExecutor,
  type AiPromptExecutor,
} from '@/hooks/aiPromptExecutor';
import {
  clearAiPromptPending,
  consumeAbandonedAiPrompt,
  markAiPromptPending,
} from '@/models/aiPromptPending';

interface TripWorkspaceHookState {
  workspace: TripWorkspaceState;
  aiPromptEffect: AiPromptEffect | null;
}

type TripWorkspaceHookAction =
  | TripWorkspaceAction
  | { type: 'CLEAR_AI_PROMPT_EFFECT' };

function tripWorkspaceHookReducer(
  current: TripWorkspaceHookState,
  action: TripWorkspaceHookAction,
): TripWorkspaceHookState {
  if (action.type === 'CLEAR_AI_PROMPT_EFFECT') {
    return {
      ...current,
      aiPromptEffect: null,
    };
  }

  const result = reduceTripWorkspaceWithEffects(current.workspace, action);

  return {
    workspace: result.nextState,
    aiPromptEffect:
      result.effects[0] ?? (action.type === 'AI_PROMPT_START' ? null : current.aiPromptEffect),
  };
}

export function useTripWorkspaceState(
  initialState: TripWorkspaceState,
  trip?: Trip,
  aiPromptExecutor: AiPromptExecutor = delayedAiPromptExecutor,
) {
  const [{ workspace: state, aiPromptEffect }, dispatch] = useReducer(
    tripWorkspaceHookReducer,
    {
      workspace: initialState,
      aiPromptEffect: null,
    },
  );
  const cancelAiExecutionRef = useRef<(() => void) | null>(null);
  const aiRequestGenerationRef = useRef(0);

  useEffect(() => {
    if (!trip?.id) return;
    if (consumeAbandonedAiPrompt(trip.id)) {
      dispatch({ type: 'AI_PROMPT_CANCEL' });
    }
  }, [trip?.id]);

  useEffect(() => {
    return () => {
      cancelAiExecutionRef.current?.();
      cancelAiExecutionRef.current = null;
      if (trip?.id) {
        clearAiPromptPending(trip.id);
      }
      aiRequestGenerationRef.current += 1;
    };
  }, [trip?.id]);

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
    cancelAiExecutionRef.current?.();
    const generation = ++aiRequestGenerationRef.current;
    if (trip?.id) {
      markAiPromptPending(trip.id, query.trim());
    }
    dispatch({ type: 'AI_PROMPT_START' });
    cancelAiExecutionRef.current = aiPromptExecutor.execute(() => {
      if (generation !== aiRequestGenerationRef.current) return;
      if (trip?.id) {
        clearAiPromptPending(trip.id);
      }
      dispatch({ type: 'AI_PROMPT_SUCCESS', query, trip });
    });
  }, [aiPromptExecutor, trip]);

  const clearAiPromptEffect = useCallback(() => {
    dispatch({ type: 'CLEAR_AI_PROMPT_EFFECT' });
  }, []);

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

  const createManualCard = useCallback((cardData: Omit<CanvasCard, 'id' | 'y' | 'x' | 'rotation'>) => {
    dispatch({ type: 'CREATE_MANUAL_CARD', cardData });
  }, []);

  return {
    state,
    aiPromptEffect,
    addInboxItem,
    processInboxItem,
    deleteCard,
    updateCard,
    addConnection,
    addCustomDay,
    sendAiQuery,
    clearAiPromptEffect,
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
