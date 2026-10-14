import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GMCPChar } from './Char';
import { useSessionStore } from '../stores/sessionStore';

describe('confirmed character ownership', () => {
  beforeEach(() => useSessionStore.getState().reset());

  it('retains the wire identity and invalidates editors on an in-place switch', () => {
    const reset = vi.fn();
    const handler = new GMCPChar({ editors: { reset } } as never);
    handler.handleName({ name: '#10', fullname: 'A', uuid: 'opaque-a' });
    expect(useSessionStore.getState().playerUuid).toBe('opaque-a');
    handler.handleName({ name: '#10', fullname: 'Renamed A', uuid: 'opaque-a' });
    expect(reset).not.toHaveBeenCalled();
    handler.handleName({ name: '#11', fullname: 'B', uuid: 'opaque-b' });
    expect(reset).toHaveBeenCalledOnce();
    expect(useSessionStore.getState().playerId).toBe('#11');
    handler.handleName({ name: '#11', fullname: 'Recycled B', uuid: 'new-lifetime' });
    expect(reset).toHaveBeenCalledTimes(2);
  });
});
