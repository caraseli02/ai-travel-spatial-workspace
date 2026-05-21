import { useState, useCallback } from 'react';
import type { Connection } from '../models/tripWorkspaceModel';
import {
  startLinkingSession,
  cancelLinkingSession,
  resolveLinkingSessionTarget,
} from '../models/linkingSessionModel';

export interface UseLinkingSessionProps {
  connections: Connection[];
  onAddConnection: (fromId: string, toId: string) => void;
}

export function useLinkingSession({
  connections,
  onAddConnection,
}: UseLinkingSessionProps) {
  const [session, setSession] = useState({ originId: null as string | null });

  const start = useCallback((id: string) => {
    setSession(startLinkingSession(id));
  }, []);

  const cancel = useCallback(() => {
    setSession(cancelLinkingSession());
  }, []);

  const resolveTarget = useCallback((targetId: string) => {
    setSession(prev => resolveLinkingSessionTarget({
      session: prev,
      targetId,
      connections,
      onAddConnection,
    }));
  }, [connections, onAddConnection]);

  return {
    isActive: session.originId !== null,
    originId: session.originId,
    start,
    cancel,
    resolveTarget,
  };
}
