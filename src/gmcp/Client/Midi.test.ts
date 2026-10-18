import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GMCPClientMidi } from './Midi';
import type { LiveOriginRenderer } from '../../midi/LiveOriginRenderer';
import type { MidiMessage } from '../../MidiService';
import { usePreferences } from '../../stores/preferencesStore';

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
    sendAdd = vi.fn();
  const renderer = {
    note: vi.fn(async () => {}),
    control: vi.fn(),
    program: vi.fn(),
    releaseAll: vi.fn(),
    reset: vi.fn(),
  };
  const midi = new GMCPClientMidi(
    {
      gmcp: { send, handlers: { 'Core.Supports': { sendAdd } } },
      media: { setMidiRoute },
    } as never,
    async () => renderer as unknown as LiveOriginRenderer,
  );
  packages.push(midi);
  return { midi, renderer, send, setMidiRoute, sendAdd };
}
const rawData = { hex: '90 3C 64', type: 'Note On', data: new Uint8Array([0x90, 60, 100]) };
const input = (midi: GMCPClientMidi, message: Omit<MidiMessage, 'rawData'>) =>
  (midi as unknown as { handleInputMessage(message: MidiMessage): void }).handleInputMessage({
    ...message,
    rawData,
  });

describe('Client.Midi 2', () => {
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
    const { midi, sendAdd, setMidiRoute } = setup();
    midi.advertiseMidiSupport();
    expect(sendAdd).toHaveBeenCalledWith(['Client.Midi 2']);
    midi.receiveRegisteredMessage('Route', { chain: 'room', send: 0.4 });
    expect(setMidiRoute).toHaveBeenCalledWith({ chain: 'room', send: 0.4 });
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
