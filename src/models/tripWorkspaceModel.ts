import type { Connection, DayGroup, DayLabel } from "@/models/trip";
import { dayLabelConfig } from "@/models/trip";
import { buildInboxItem, isTripMaterialCaptureInput, shouldCaptureViaPromptBar } from "@/models/tripWorkspaceInbox";
import {
  buildCustomDay,
  buildManualCanvasCard,
  buildProcessedCanvasCard,
  cardTypeOptions,
  dayColorPresets,
  cardDimensions,
  getCardCenter,
  isCardType,
  type CardType,
} from "@/models/tripWorkspaceCanvas";
import { applyAiPromptToTripWorkspace } from "@/models/tripWorkspaceAi";
import {
  canConnectCards,
  connectCards,
  deleteCanvasCardFromWorkspace,
  reduceTripWorkspaceWithEffects,
  tripWorkspaceReducer,
  type AiPromptEffect,
  type AiPromptResult,
  type TripWorkspaceAction,
  type TripWorkspaceState,
} from "@/models/tripWorkspaceReducer";

export type {
  Connection,
  DayGroup,
  DayLabel,
  CardType,
  AiPromptEffect,
  AiPromptResult,
  TripWorkspaceAction,
  TripWorkspaceState,
};
export {
  dayLabelConfig,
  buildInboxItem,
  isTripMaterialCaptureInput,
  shouldCaptureViaPromptBar,
  cardTypeOptions,
  dayColorPresets,
  cardDimensions,
  getCardCenter,
  isCardType,
  buildProcessedCanvasCard,
  buildManualCanvasCard,
  buildCustomDay,
  applyAiPromptToTripWorkspace,
  canConnectCards,
  connectCards,
  deleteCanvasCardFromWorkspace,
  reduceTripWorkspaceWithEffects,
  tripWorkspaceReducer,
};
