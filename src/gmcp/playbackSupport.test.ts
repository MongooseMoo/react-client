import { afterEach, describe, expect, it, vi } from 'vitest';
import type MudClient from '../client';
import type { TelnetParser } from '../telnet';
import { usePersonalDataStore } from '../stores/personalDataStore';
import { SharedClock } from '../timing/SharedClock';
import { GMCPChar } from './Char';
import { GMCPClientMedia, buildPlaybackSupport } from './Client/Media';
import { GMCPCoreSupports } from './Core';
import { GMCPCoreTime } from './Core/Time';
import { GMCPPackage } from './package';
import { decodeSupportRequest, validateAdvertisedModules } from './playbackSupport';
import { GmcpSession } from './session';

vi.mock('../MidiService', () => ({ midiService: {
  sequenceOutputAvailable: true, subscribeOutput: () => () => {}, getSequenceOutput: async () => null,
} }));

const id = (n: number) => `11111111-1111-4111-8111-${n.toString(16).padStart(12, '0')}`;
const cleanups: Array<() => void> = [];
afterEach(() => {
  for (const cleanup of cleanups.splice(0)) cleanup();
  usePersonalDataStore.setState({ visitor: false, visitorWindow: false });
  vi.restoreAllMocks();
  vi.useRealTimers();
});

async function fixture(ready = true) {
  const wire: Array<{ name: string; payload: unknown }> = [];
  const clock = new SharedClock((value) => session.require('Core.Time').sendRequest(value));
  const state = { connected: true, localConnection: false, currentTransportGeneration: 1,
    liveServer: true, runtimeNamespace: 'test', registerDisconnectReset: vi.fn(), sharedClock: clock,
    resetIdentityState: () => clock.invalidate(),
    media: { reset: vi.fn(), configureSequences: vi.fn(), configureSharedMedia: vi.fn() },
  };
  const client = state as unknown as MudClient;
  const session = new GmcpSession(client);
  client.gmcp = session;
  const transport = { sendGmcp: (name: string, body: string) => wire.push({ name, payload: JSON.parse(body) }) } as unknown as TelnetParser;
  session.attachTransport(transport);
  const supports = session.register(GMCPCoreSupports);
  session.register(GMCPCoreTime);
  const media = session.register(GMCPClientMedia);
  session.register(GMCPChar);
  if (ready) session.markReady();
  await Promise.resolve();
  wire.length = 0;
  cleanups.push(() => { media.shutdown(); clock.shutdown(); });
  const request = (n: number) => session.receive('Client.Media.SupportRequest', JSON.stringify({ requestId: id(n), reason: 'stale' }));
  return { state, session, supports, media, clock, wire, transport, request };
}

describe('playback capability attestation', () => {
  it('preserves exact enabled module versions and validates the full inventory before Set', async () => {
    const f = await fixture();
    class Optional extends GMCPPackage { readonly packageName = 'Client.Optional'; readonly packageVersion = 37; }
    f.session.register(Optional);
    f.supports.refreshCurrentSupport();
    expect(f.wire.map((message) => message.name)).toEqual(['Core.Supports.Set', 'Client.Media.PlaybackSupport']);
    const modules = f.supports.advertisedModules();
    expect(modules).toContain('Client.Optional 37');
    expect(modules).toContain('Client.Media 1');
    expect(f.wire[0].payload).toEqual(modules);
    expect(f.wire[1].payload).toMatchObject({ modules, sharedTransport: true });
    f.wire.length = 0;
    class Duplicate extends GMCPPackage { readonly packageName = 'client.MEDIA'; }
    f.session.register(Duplicate);
    expect(() => f.supports.refreshCurrentSupport()).toThrow(/duplicate/);
    expect(f.wire).toEqual([]);
  });

  it('keeps the maximum canonical inventory within the report budget without truncation', () => {
    const modules = Array.from({ length: 64 }, (_, n) => `${'A'.repeat(61)}${String(n).padStart(3, '0')} 65535`);
    const report = buildPlaybackSupport(modules, true, id(1));
    expect(report.modules).toEqual(modules);
    expect(JSON.stringify(report).length).toBeLessThanOrEqual(8192);
    for (const bad of [['Client.Media 01'], ['Client.Media 0'], ['Client.Media 65536'], ['Client.Media 1 extra'],
      ['Client.Media 1', 'client.media 1'], ['é 1'], [...modules, 'Extra 1']])
      expect(() => validateAdvertisedModules(bad)).toThrow();
  });

  it('publishes Set, one correlated report and truthful readiness before an eager clock probe', async () => {
    vi.useFakeTimers();
    const f = await fixture();
    const release = f.clock.acquire('test');
    f.clock.setNetworkReady(false);
    f.wire.length = 0;
    f.request(1);
    expect(f.wire.map((message) => message.name)).toEqual([
      'Core.Supports.Set', 'Client.Media.PlaybackSupport', 'Client.Media.PlaybackSupport',
    ]);
    expect(f.wire[1].payload).toMatchObject({ requestId: id(1), sharedTransport: false });
    expect(f.wire[2].payload).toMatchObject({ sharedTransport: true });
    expect(f.wire[2].payload).not.toHaveProperty('requestId');
    vi.advanceTimersByTime(0);
    expect(f.wire.at(-1)?.name).toBe('Core.Time.Request');
    const before = f.wire.length;
    f.request(1);
    expect(f.wire).toHaveLength(before);
    release();
  });

  it('retains recent request IDs across identity and same-parser WONT resets, replacing them on a new transport epoch', async () => {
    const f = await fixture();
    f.request(1);
    f.session.confirmIdentity('#1', 'a');
    f.session.confirmIdentity('#2', 'b');
    f.session.confirmIdentity('#1', 'a');
    f.session.reset();
    f.session.attachTransport(f.transport);
    f.session.markReady();
    f.wire.length = 0;
    f.request(1);
    expect(f.wire).toEqual([]);
    f.state.currentTransportGeneration++;
    f.request(1);
    expect(f.wire.filter((message) => message.name === 'Core.Supports.Set')).toHaveLength(1);
  });

  it('retains 64 recent IDs and permits a harmless repeat after oldest eviction', async () => {
    const f = await fixture();
    for (let n = 1; n <= 65; n++) f.request(n);
    f.wire.length = 0;
    f.request(2);
    expect(f.wire).toEqual([]);
    f.request(1);
    expect(f.wire.map((message) => message.name)).toEqual(['Core.Supports.Set', 'Client.Media.PlaybackSupport']);
  });

  it('drops an unready or local request without consuming its ready-network retry', async () => {
    const f = await fixture(false);
    f.request(1);
    expect(f.wire).toEqual([]);
    f.session.markReady();
    f.state.localConnection = true;
    f.request(1);
    f.state.localConnection = false;
    f.state.connected = false;
    f.request(1);
    f.state.connected = true;
    f.wire.length = 0;
    f.request(1);
    expect(f.wire.map((message) => message.name)).toEqual(['Core.Supports.Set', 'Client.Media.PlaybackSupport']);
  });

  it('enforces original payload bounds before parsing and exempts only SupportRequest from visitor filtering', async () => {
    const f = await fixture();
    usePersonalDataStore.setState({ visitor: true, visitorWindow: false });
    const receive = vi.spyOn(f.media, 'receiveRegisteredMessage');
    const parse = vi.spyOn(JSON, 'parse');
    const payload = JSON.stringify({ requestId: id(1) });
    for (const bad of [`${' '.repeat(256)}${payload}`, `${payload}é`, `{"requestId":"${'\\u0031'.repeat(41)}"}`])
      f.session.receive('Client.Media.SupportRequest', bad);
    expect(parse).not.toHaveBeenCalled();
    expect(receive).not.toHaveBeenCalled();
    parse.mockRestore();
    f.session.receive('Client.Media.Play', '{}');
    f.session.receive('Client.Media.PlaybackSupport', payload);
    f.session.receive('Client.Media.SupportRequests', payload);
    expect(receive).not.toHaveBeenCalled();
    f.request(1);
    expect(receive).toHaveBeenCalledOnce();
    expect(f.wire.map((message) => message.name)).toEqual(['Core.Supports.Set', 'Client.Media.PlaybackSupport']);
  });

  it('strictly decodes requests and keeps PlaybackSupport outbound-only', async () => {
    for (const bad of [null, [], {}, { version: 1, requestId: id(1) }, { version: 2, requestId: id(1) }, { requestId: id(0xabcdef).toUpperCase() },
      { requestId: id(1), reason: undefined }, { requestId: id(1), reason: 'other' },
      { requestId: id(1), extra: true }]) expect(() => decodeSupportRequest(bad)).toThrow();
    expect(decodeSupportRequest({ requestId: id(1), reason: 'missing' })).toEqual({ requestId: id(1), reason: 'missing' });
    const f = await fixture();
    expect(f.media.receiveRegisteredMessage('PlaybackSupport', {})).toBe(false);
  });
});
