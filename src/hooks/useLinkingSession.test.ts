// @vitest-environment happy-dom
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useLinkingSession } from '@/hooks/useLinkingSession';

describe('useLinkingSession', () => {
  it('starts a linking session with the origin card id', () => {
    const onAddConnection = vi.fn();
    const { result } = renderHook(() =>
      useLinkingSession({ connections: [], onAddConnection }),
    );

    act(() => {
      result.current.start('c1');
    });

    expect(result.current.isActive).toBe(true);
    expect(result.current.originId).toBe('c1');
  });

  it('cancels an active linking session', () => {
    const onAddConnection = vi.fn();
    const { result } = renderHook(() =>
      useLinkingSession({ connections: [], onAddConnection }),
    );

    act(() => {
      result.current.start('c1');
    });

    act(() => {
      result.current.cancel();
    });

    expect(result.current.isActive).toBe(false);
    expect(result.current.originId).toBeNull();
  });

  it('creates a connection and clears the session when resolving a valid target', () => {
    const onAddConnection = vi.fn();
    const { result } = renderHook(() =>
      useLinkingSession({ connections: [], onAddConnection }),
    );

    act(() => {
      result.current.start('c1');
    });

    act(() => {
      result.current.resolveTarget('c2');
    });

    expect(onAddConnection).toHaveBeenCalledWith('c1', 'c2');
    expect(result.current.isActive).toBe(false);
    expect(result.current.originId).toBeNull();
  });
});
