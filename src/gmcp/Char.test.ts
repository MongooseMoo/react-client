import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GMCPChar } from './Char';
import { useSessionStore } from '../stores/sessionStore';
import { GmcpSession } from './session';
import type MudClient from '../client';
import { usePersonalDataStore } from '../stores/personalDataStore';

describe('confirmed character ownership', () => {
  beforeEach(() => useSessionStore.getState().reset());
  it('forgets retained account identity when a reconnect resolves to a live guest without UUID', () => {
    const client = {
      liveServer: true,
      runtimeNamespace: 'live:test',
      gmcp: { confirmIdentity: vi.fn() },
    } as unknown as MudClient;
    const handler = new GMCPChar(client);
    usePersonalDataStore
      .getState()
      .confirm({ runtime: 'live:test', playerUuid: 'alice', playerRef: '#1' });
    usePersonalDataStore.getState().clear('reconnect');
    const before = usePersonalDataStore.getState().forgetEpoch;
    handler.handleName({ name: '#guest', fullname: 'Guest' });
    expect(usePersonalDataStore.getState().owner).toBeUndefined();
    expect(usePersonalDataStore.getState().forgetEpoch).toBe(before + 1);
    handler.handleName({ name: '#guest', fullname: 'Guest' });
    expect(usePersonalDataStore.getState().forgetEpoch).toBe(before + 1);
    usePersonalDataStore.getState().clear('reconnect');
    handler.handleName({ name: '#guest', fullname: 'Guest' });
    expect(usePersonalDataStore.getState().forgetEpoch).toBe(before + 1);
  });

  it('retains the wire identity and invalidates editors on an in-place switch', () => {
    const reset = vi.fn();
    const client = { resetIdentityState: reset } as unknown as MudClient;
    Object.assign(client, { gmcp: new GmcpSession(client) });
    const handler = new GMCPChar(client);
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
