import { describe, expect, it, vi } from 'vitest';
import {
  startLinkingSession,
  cancelLinkingSession,
  resolveLinkingSessionTarget,
} from './linkingSessionModel';

describe('Linking Session Model', () => {
  it('starts a new linking session with an origin card ID', () => {
    const session = startLinkingSession('c1');
    expect(session.originId).toBe('c1');
  });

  it('cancels an active session and clears the origin card ID', () => {
    startLinkingSession('c1');
    const cancelled = cancelLinkingSession();
    expect(cancelled.originId).toBeNull();
  });

  it('cancels the session when the user resolves with the origin card (self-linking)', () => {
    const session = startLinkingSession('c1');
    const onAddConnection = vi.fn();
    const result = resolveLinkingSessionTarget({
      session,
      targetId: 'c1',
      connections: [],
      onAddConnection,
    });

    expect(result.originId).toBeNull();
    expect(onAddConnection).not.toHaveBeenCalled();
  });

  it('triggers onAddConnection and clears session when resolving a valid target card', () => {
    const session = startLinkingSession('c1');
    const onAddConnection = vi.fn();
    const result = resolveLinkingSessionTarget({
      session,
      targetId: 'c2',
      connections: [],
      onAddConnection,
    });

    expect(result.originId).toBeNull();
    expect(onAddConnection).toHaveBeenCalledWith('c1', 'c2');
  });

  it('does not trigger onAddConnection and clears session when target card is already connected', () => {
    const session = startLinkingSession('c1');
    const onAddConnection = vi.fn();
    const existingConnections = [{ from: 'c1', to: 'c2', label: 'custom-link' }];
    const result = resolveLinkingSessionTarget({
      session,
      targetId: 'c2',
      connections: existingConnections,
      onAddConnection,
    });

    expect(result.originId).toBeNull();
    expect(onAddConnection).not.toHaveBeenCalled();
  });
});
