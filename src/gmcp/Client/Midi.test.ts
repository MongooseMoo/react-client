import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GMCPClientMidi } from './Midi';
import type { LiveOriginRenderer } from '../../midi/LiveOriginRenderer';
import type { MidiMessage } from '../../MidiService';
import { usePreferences } from '../../stores/preferencesStore';
import { GmcpSession } from '../session';
import { GMCPCoreSupports } from '../Core';
import { GMCPPackage } from '../package';
import type MudClient from '../../client';
import type { TelnetParser } from '../../telnet';

const packages: GMCPClientMidi[] = [];
const previous = usePreferences.getState().midi;
beforeEach(() => {
  usePreferences.getState().setMidi({ ...previous, enabled: true });
});
afterEach(() => {
  for (const midi of packages.splice(0)) midi.shutdown();
  usePreferences.getState().setMidi(previous);
});
function setup() {
  const send = vi.fn(),
    setMidiRoute = vi.fn(),
    sendSet = vi.fn();
  const renderer = {
    note: vi.fn(async () => {}),
    control: vi.fn(),
    program: vi.fn(),
    releaseAll: vi.fn(),
    reset: vi.fn(),
  };
  const midi = new GMCPClientMidi(
    {
      gmcp: {
        send,
        handlers: {
          'Core.Supports': { sendSet, advertisedModules: () => ['Client.Midi 2'] },
        },
      },
      media: { setMidiRoute },
    } as never,
    async () => renderer as unknown as LiveOriginRenderer,
  );
  packages.push(midi);
  return { midi, renderer, send, setMidiRoute, sendSet };
}
const rawData = { hex: '90 3C 64', type: 'Note On', data: new Uint8Array([0x90, 60, 100]) };
const input = (midi: GMCPClientMidi, message: Omit<MidiMessage, 'rawData'>) =>
  (midi as unknown as { handleInputMessage(message: MidiMessage): void }).handleInputMessage({
    ...message,
    rawData,
  });

describe('Client.Midi 2', () => {
  it.each([
    'unknown-status',
    'oversized-message',
  ])('rejects a malformed correlated %s reply through the real session without retrying', async (kind) => {
    vi.useFakeTimers();
    const sendGmcp = vi.fn();
    const client = { connected: true, registerDisconnectReset: vi.fn() } as unknown as MudClient;
    const session = new GmcpSession(client);
    client.gmcp = session;
    session.attachTransport({ sendGmcp } as unknown as TelnetParser);
    session.markReady();
    const midi = session.register(GMCPClientMidi);
    packages.push(midi);
    try {
      const pending = midi.world.request('EditorPublish', {
        libraryId: 'lib',
        expectedLibraryRevision: 1,
        published: true,
      });
      const failure = expect(pending).rejects.toThrow('Invalid world music protocol data');
      await vi.advanceTimersByTimeAsync(1);
      const { requestId } = JSON.parse(sendGmcp.mock.calls[0][1]);
      const fields =
        kind === 'unknown-status'
          ? { status: 'bogus' }
          : { status: 'ok', message: 'x'.repeat(257) };
      session.receive('Client.Midi.EditorReply', JSON.stringify({ requestId, ...fields }));
      await failure;
      await vi.advanceTimersByTimeAsync(10000);
      expect(sendGmcp).toHaveBeenCalledOnce();
    } finally {
      vi.useRealTimers();
    }
  });
  it('network reset preserves private capture and its lease, while explicit panic still notifies', () => {
    const { midi, send } = setup();
    const panic = vi.fn();
    midi.subscribePanic(panic);
    const release = midi.suspendInputRelay();
    midi.reset();
    expect(panic).not.toHaveBeenCalled();
    input(midi, { note: { note: 60, velocity: 100, on: true, channel: 0 } });
    midi.sendManualNote(62, 100, true);
    midi.sendManualNote(62, 0, false);
    expect(send).not.toHaveBeenCalled();
    release();
    release();
    midi.sendManualNote(64, 100, true);
    expect(send).toHaveBeenCalledWith(
      'Client.Midi.Note',
      JSON.stringify({ note: 64, velocity: 100, on: true, channel: 0 }),
    );
    midi.sendAllNotesOff();
    expect(panic).toHaveBeenCalledOnce();
  });
  it('routes validated CC/program to independent origin state, preserving zero values', async () => {
    const { midi, renderer } = setup();
    midi.receiveRegisteredMessage('ControlChange', {
      originId: 'session-a',
      channel: 0,
      controller: 10,
      value: 64,
    });
    midi.receiveRegisteredMessage('ProgramChange', {
      originId: 'session-b',
      channel: 0,
      program: 0,
    });
    await vi.waitFor(() =>
      expect(renderer.control).toHaveBeenCalledWith({
        originId: 'session-a',
        channel: 0,
        controller: 10,
        value: 64,
      }),
    );
    expect(renderer.program).toHaveBeenCalledWith({
      originId: 'session-b',
      channel: 0,
      program: 0,
    });
  });
  it('drops Raw/System messages and rejects all malformed fields before renderer access', async () => {
    const { midi, renderer } = setup();
    expect(midi.receiveRegisteredMessage('RawMessage', { data: [0xff] })).toBe(false);
    expect(midi.receiveRegisteredMessage('SystemMessage', { data: [0xff] })).toBe(false);
    expect(() =>
      midi.receiveRegisteredMessage('ControlChange', { channel: 0, controller: 120, value: 0 }),
    ).toThrow();
    expect(() =>
      midi.receiveRegisteredMessage('Note', { note: 128, velocity: 100, on: true }),
    ).toThrow();
    await Promise.resolve();
    expect(renderer.note).not.toHaveBeenCalled();
    expect(renderer.control).not.toHaveBeenCalled();
  });
  it('consumes release-all arriving while renderer initialization is pending', async () => {
    let ready = (_: LiveOriginRenderer) => {};
    const renderer = { note: vi.fn(async () => {}), releaseAll: vi.fn(), reset: vi.fn() };
    const midi = new GMCPClientMidi(
      { gmcp: { send: vi.fn() } } as never,
      () =>
        new Promise((resolve) => {
          ready = resolve;
        }),
    );
    packages.push(midi);
    midi.receiveRegisteredMessage('Note', {
      originId: 'session-a',
      eventId: 1,
      note: 60,
      velocity: 100,
      on: true,
    });
    midi.receiveRegisteredMessage('NoteReleaseAll', { originId: 'session-a' });
    ready(renderer as unknown as LiveOriginRenderer);
    await vi.waitFor(() => expect(renderer.releaseAll).toHaveBeenCalledWith('session-a'));
    expect(renderer.note.mock.invocationCallOrder[0]).toBeLessThan(
      renderer.releaseAll.mock.invocationCallOrder[0],
    );
  });
  it('reset invalidates packets awaiting renderer initialization', async () => {
    let ready = (_: LiveOriginRenderer) => {};
    const renderer = { note: vi.fn(), reset: vi.fn() };
    const midi = new GMCPClientMidi(
      { gmcp: { send: vi.fn() } } as never,
      () =>
        new Promise((resolve) => {
          ready = resolve;
        }),
    );
    packages.push(midi);
    midi.receiveRegisteredMessage('Note', { note: 60, velocity: 100, on: 1 });
    midi.reset();
    ready(renderer as unknown as LiveOriginRenderer);
    await Promise.resolve();
    await Promise.resolve();
    expect(renderer.note).not.toHaveBeenCalled();
    expect(renderer.reset).toHaveBeenCalled();
  });
  it('advertises version 2 and preserves the existing effects route', () => {
    const { midi, sendSet, setMidiRoute } = setup();
    midi.advertiseMidiSupport();
    expect(sendSet).toHaveBeenCalledWith(['Client.Midi 2']);
    midi.receiveRegisteredMessage('Route', { chain: 'room', send: 0.4 });
    expect(setMidiRoute).toHaveBeenCalledWith({ chain: 'room', send: 0.4 });
  });
  it('late enable replaces the complete current capability set and repeated toggles preserve other packages', () => {
    usePreferences.getState().setMidi({ enabled: false });
    class MediaFixture extends GMCPPackage {
      readonly packageName = 'Client.Media';
      sendPlaybackSupport = vi.fn();
    }
    class ClockFixture extends GMCPPackage {
      readonly packageName = 'Core.Time';
    }
    class OptionalFixture extends GMCPPackage {
      readonly packageName = 'Client.Optional';
      readonly packageVersion = 3;
      active = true;
      override get enabled() { return this.active; }
    }
    const sendGmcp = vi.fn();
    const setNetworkReady = vi.fn();
    const client = {
      connected: true,
      registerDisconnectReset: vi.fn(),
      sharedClock: { setNetworkReady },
    } as unknown as MudClient;
    const session = new GmcpSession(client);
    client.gmcp = session;
    session.attachTransport({ sendGmcp } as unknown as TelnetParser);
    const supports = session.register(GMCPCoreSupports);
    const media = session.register(MediaFixture);
    session.register(ClockFixture);
    const optional = session.register(OptionalFixture);
    const midi = session.register(GMCPClientMidi);
    packages.push(midi);
    const reset = vi.spyOn(midi, 'reset');
    const initial = ['Core.Supports 1', 'Client.Media 1', 'Core.Time 1', 'Client.Optional 3'];
    expect(supports.advertisedModules()).toEqual(initial);
    session.markReady();
    setNetworkReady.mockClear();

    usePreferences.getState().setMidi({ enabled: true });
    midi.advertiseMidiSupport();
    midi.advertiseMidiSupport();
    expect(sendGmcp.mock.calls).toEqual([
      ['Core.Supports.Set', JSON.stringify([...initial, 'Client.Midi 2'])],
    ]);
    expect(media.sendPlaybackSupport).toHaveBeenCalledOnce();
    expect(setNetworkReady).toHaveBeenCalledOnce();
    expect(setNetworkReady).toHaveBeenLastCalledWith(true);
    expect(reset).not.toHaveBeenCalled();

    usePreferences.getState().setMidi({ enabled: false });
    midi.unadvertiseMidiSupport();
    midi.unadvertiseMidiSupport();
    expect(sendGmcp.mock.calls[1]).toEqual(['Core.Supports.Remove', '["Client.Midi"]']);
    expect(sendGmcp).toHaveBeenCalledTimes(2);
    optional.active = false;
    usePreferences.getState().setMidi({ enabled: true });
    midi.advertiseMidiSupport();
    expect(sendGmcp.mock.calls[2]).toEqual([
      'Core.Supports.Set',
      JSON.stringify(['Core.Supports 1', 'Client.Media 1', 'Core.Time 1', 'Client.Midi 2']),
    ]);
    expect(media.sendPlaybackSupport).toHaveBeenCalledTimes(3);
    expect(reset).not.toHaveBeenCalled();
  });
  it('removes MIDI enabled in the initial session Set, including after a reconnect reset', () => {
    class CoreFixture extends GMCPPackage {
      readonly packageName = 'Core';
      sendHello = vi.fn();
    }
    class AuthFixture extends GMCPPackage {
      readonly packageName = 'Auth.Autologin';
      sendStoredLogin = vi.fn();
    }
    class MediaFixture extends GMCPPackage {
      readonly packageName = 'Client.Media';
      publishEffectsSupport = vi.fn();
      sendPlaybackSupport = vi.fn();
    }
    const sendGmcp = vi.fn();
    const client = { connected: true, registerDisconnectReset: vi.fn() } as unknown as MudClient;
    const session = new GmcpSession(client);
    client.gmcp = session;
    const transport = { sendGmcp } as unknown as TelnetParser;
    session.attachTransport(transport);
    session.register(CoreFixture);
    session.register(GMCPCoreSupports);
    session.register(AuthFixture);
    session.register(MediaFixture);
    const midi = session.register(GMCPClientMidi);
    packages.push(midi);
    for (let connection = 0; connection < 2; connection++) {
      usePreferences.getState().setMidi({ enabled: true });
      session.start();
      const capabilitySet = sendGmcp.mock.calls.find(([name]) => name === 'Core.Supports.Set');
      expect(JSON.parse(capabilitySet?.[1])).toContain('Client.Midi 2');
      sendGmcp.mockClear();
      usePreferences.getState().setMidi({ enabled: false });
      midi.unadvertiseMidiSupport();
      midi.unadvertiseMidiSupport();
      expect(sendGmcp.mock.calls).toEqual([['Core.Supports.Remove', '["Client.Midi"]']]);
      session.reset();
      midi.reset();
      session.attachTransport(transport);
      sendGmcp.mockClear();
    }
  });
});

describe('private capture relay lease', () => {
  it('releases accepted keyboard notes/pedals first, suppresses new onsets, and resumes idempotently', () => {
    const { midi, send } = setup();
    input(midi, { note: { note: 60, velocity: 100, on: true, channel: 0 } });
    input(midi, { controlChange: { channel: 0, controller: 64, value: 127 } });
    const release = midi.suspendInputRelay();
    expect(send).toHaveBeenCalledWith(
      'Client.Midi.Note',
      JSON.stringify({ note: 60, velocity: 0, on: false, channel: 0 }),
    );
    expect(send).toHaveBeenCalledWith(
      'Client.Midi.ControlChange',
      JSON.stringify({ channel: 0, controller: 64, value: 0 }),
    );
    const count = send.mock.calls.length;
    input(midi, { note: { note: 62, velocity: 100, on: true } });
    input(midi, { systemMessage: { type: 'Reset', data: [0xff] } });
    expect(send).toHaveBeenCalledTimes(count);
    release();
    release();
    input(midi, { note: { note: 62, velocity: 100, on: true } });
    expect(send).toHaveBeenCalledTimes(count + 1);
  });
});
