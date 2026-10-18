import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GMCPChar } from './Char';
import { useSessionStore } from '../stores/sessionStore';
import { GmcpSession } from './session';
import type MudClient from '../client';
import { usePersonalDataStore } from '../stores/personalDataStore';
import { GMCPPackage } from './package';
import type { TelnetParser } from '../telnet';

class MediaFixture extends GMCPPackage {
  readonly packageName = 'Client.Media';
  sendPlaybackSupport = vi.fn();
}

describe('confirmed character ownership', () => {
  beforeEach(() => useSessionStore.getState().reset());

  it('reports after every accepted identity, including identical notifications, A-B-A and guests without an Auth session', () => {
    const reset = vi.fn();
    const setNetworkReady = vi.fn();
    const sendGmcp = vi.fn();
    const client = {
      liveServer: true,
      resetIdentityState: reset,
      registerDisconnectReset: vi.fn(),
      sharedClock: { setNetworkReady },
    } as unknown as MudClient;
    client.gmcp = new GmcpSession(client);
    client.gmcp.attachTransport({ sendGmcp } as unknown as TelnetParser);
    const media = client.gmcp.register(MediaFixture);
    client.gmcp.register(GMCPChar);
    const reported: string[] = [];
    media.sendPlaybackSupport.mockImplementation(() => {
      reported.push(useSessionStore.getState().playerUuid || useSessionStore.getState().playerId);
    });
    for (const identity of [
      { name: '#10', fullname: 'A', uuid: 'a' },
      { name: '#10', fullname: 'A', uuid: 'a' },
      { name: '#11', fullname: 'B', uuid: 'b' },
      { name: '#10', fullname: 'A', uuid: 'a' },
      { name: '#guest', fullname: 'Guest' },
      { name: '#guest', fullname: 'Guest' },
    ]) client.gmcp.receive('Char.Name', JSON.stringify(identity));
    expect(reported).toEqual(['a', 'a', 'b', 'a', '#guest', '#guest']);
    expect(media.sendPlaybackSupport).toHaveBeenCalledTimes(6);
    expect(reset).toHaveBeenCalledTimes(3);
    expect(setNetworkReady).not.toHaveBeenCalled();
    expect(sendGmcp).not.toHaveBeenCalled();
  });

  it('rejects invalid identity payloads without publishing support or changing identity', () => {
    const client = { registerDisconnectReset: vi.fn() } as unknown as MudClient;
    client.gmcp = new GmcpSession(client);
    const media = client.gmcp.register(MediaFixture);
    client.gmcp.register(GMCPChar);
    client.gmcp.receive('Char.Name', '{"name":"#10","fullname":"A","uuid":"a"}');
    media.sendPlaybackSupport.mockClear();
    const generation = client.gmcp.generation;
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    for (const payload of ['null', '[]', '{}', '{bad', '{"name":""}', '{"name":10}', '{"name":"#10","uuid":false}']) {
      client.gmcp.receive('Char.Name', payload);
    }
    expect(media.sendPlaybackSupport).not.toHaveBeenCalled();
    expect(useSessionStore.getState().playerId).toBe('#10');
    expect(useSessionStore.getState().playerUuid).toBe('a');
    expect(client.gmcp.generation).toBe(generation);
    error.mockRestore();
  });
  it('forgets retained account identity when a reconnect resolves to a live guest without UUID', () => {
    const client = {
      liveServer: true,
      runtimeNamespace: 'live:test',
      gmcp: { confirmIdentity: vi.fn(), require: vi.fn(() => ({ sendPlaybackSupport: vi.fn() })) },
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
    const client = { resetIdentityState: reset, registerDisconnectReset: vi.fn() } as unknown as MudClient;
    Object.assign(client, { gmcp: new GmcpSession(client) });
    client.gmcp.register(MediaFixture);
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
