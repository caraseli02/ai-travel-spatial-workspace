import type { Connection } from './tripWorkspaceModel';
import { canConnectCards } from './tripWorkspaceModel';

export interface LinkingSessionData {
  originId: string | null;
}

export function startLinkingSession(cardId: string): LinkingSessionData {
  return { originId: cardId };
}

export function cancelLinkingSession(): LinkingSessionData {
  return { originId: null };
}

export function resolveLinkingSessionTarget({
  session,
  targetId,
  connections,
  onAddConnection,
}: {
  session: LinkingSessionData;
  targetId: string;
  connections: Connection[];
  onAddConnection: (fromId: string, toId: string) => void;
}): LinkingSessionData {
  if (!session.originId) return session;
  if (session.originId === targetId) {
    return { originId: null };
  }
  if (canConnectCards(connections, session.originId, targetId)) {
    onAddConnection(session.originId, targetId);
  }
  return { originId: null };
}

