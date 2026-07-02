import type { Connection, DayGroup, DayLabel } from "@/models/trip";
import { dayLabelConfig } from "@/models/trip";
import { buildInboxItem } from "@/models/tripWorkspaceInbox";
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
  tripWorkspaceReducer,
  type TripWorkspaceAction,
  type TripWorkspaceState,
} from "@/models/tripWorkspaceReducer";

export type { Connection, DayGroup, DayLabel, CardType, TripWorkspaceAction, TripWorkspaceState };
export {
  dayLabelConfig,
  buildInboxItem,
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
  tripWorkspaceReducer,
};
