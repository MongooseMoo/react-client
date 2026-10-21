import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { midiService, output } = vi.hoisted(() => {
  const output = { connected: true, intentional: false, initialized: false };
  return {
    output,
    midiService: {
      get connectionStatus() { return { inputConnected: false, outputConnected: output.connected }; },
      get intentionalDisconnectStatus() { return { input: false, output: output.intentional }; },
      get hasOutputDevice() { return output.connected; },
      get isInitialized() { return output.initialized; },
      isSupported: true,
      initialize: vi.fn(async () => { output.initialized = true; return true; }),
      attemptAutoReconnectInput: vi.fn(async () => false),
      getOutputDevices: vi.fn(() => [{ id: 'soundfont-synth', name: 'Soundfont Synthesizer' }]),
      connectOutputDevice: vi.fn(async () => { await Promise.resolve(); output.connected = true; return true; }),
      sendNote: vi.fn(),
      scheduleNoteOff: vi.fn(() => true),
      sendRawMessage: vi.fn(),
    },
  };
});

vi.mock('../../MidiService', () => ({ midiService }));

import { usePreferences } from '../../stores/preferencesStore';
import { GMCPClientMidi } from './Midi';

describe('GMCPClientMidi ControlChange', () => {
  let midi: GMCPClientMidi;
  const previous = usePreferences.getState().midi;

  beforeEach(() => {
    vi.clearAllMocks();
    usePreferences.getState().setMidi({ ...previous, enabled: true });
    midi = new GMCPClientMidi({ gmcp: { send: vi.fn() } } as never);
  });

  afterEach(() => {
    usePreferences.getState().setMidi(previous);
  });

  it('sends the MOO ControlChange frame as a MIDI CC message (contract case "midi")', async () => {
    midi.receiveRegisteredMessage('ControlChange', { channel: 0, controller: 10, value: 64 });
    await vi.waitFor(() => expect(midiService.sendRawMessage).toHaveBeenCalledWith([0xb0, 10, 64]));
  });

  it('puts the channel in the status byte', async () => {
    midi.receiveRegisteredMessage('ControlChange', { channel: 15, controller: 7, value: 127 });
    await vi.waitFor(() => expect(midiService.sendRawMessage).toHaveBeenCalledWith([0xbf, 7, 127]));
  });
});

describe('GMCPClientMidi Song', () => {
  const previous = usePreferences.getState().midi;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    usePreferences.getState().setMidi({ ...previous, enabled: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    usePreferences.getState().setMidi(previous);
  });

  it('plays each note of one Song message at its offset', async () => {
    const midi = new GMCPClientMidi({ gmcp: { send: vi.fn() } } as never);
    const played: number[] = [];
    vi.spyOn(midi as never, 'handleNoteAsync').mockImplementation(((note: { note: number }) => {
      played.push(note.note);
      return Promise.resolve();
    }) as never);
    midi.receiveRegisteredMessage('Song', { notes: [
      { note: 60, offset: 0, duration: 250 },
      { note: 64, offset: 500, duration: 250, velocity: 90, channel: 9 },
    ] });
    await vi.advanceTimersByTimeAsync(0);
    expect(played).toEqual([60]);
    await vi.advanceTimersByTimeAsync(499);
    expect(played).toEqual([60]);
    await vi.advanceTimersByTimeAsync(1);
    expect(played).toEqual([60, 64]);
    expect((midi as never as { handleNoteAsync: ReturnType<typeof vi.fn> }).handleNoteAsync).toHaveBeenLastCalledWith(
      { note: 64, velocity: 90, on: true, channel: 9, duration: 250 });
  });
});

describe('GMCPClientMidi automatic output', () => {
  const previous = usePreferences.getState().midi;
  let midi: GMCPClientMidi;

  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(output, { connected: false, intentional: false, initialized: false });
    usePreferences.getState().setMidi({ ...previous, enabled: true, lastOutputDeviceId: undefined });
    midi = new GMCPClientMidi({ gmcp: { send: vi.fn() } } as never);
  });

  afterEach(() => {
    Object.assign(output, { connected: true, intentional: false, initialized: false });
    usePreferences.getState().setMidi(previous);
  });

  const note = (n: number) => midi.receiveRegisteredMessage('Note', { note: n, velocity: 90, on: true });

  it('connects the soundfont before the first MOO note, without initializing Web MIDI', async () => {
    note(60);
    await vi.waitFor(() => expect(midiService.sendNote).toHaveBeenCalledWith({ note: 60, velocity: 90, on: true, channel: undefined }));
    expect(midiService.connectOutputDevice).toHaveBeenCalledWith('soundfont-synth');
    expect(midiService.connectOutputDevice.mock.invocationCallOrder[0])
      .toBeLessThan(midiService.sendNote.mock.invocationCallOrder[0]);
    expect(midiService.initialize).not.toHaveBeenCalled();
  });

  it('connects once for notes that arrive while the output is connecting', async () => {
    note(60);
    note(64);
    note(67);
    await vi.waitFor(() => expect(midiService.sendNote).toHaveBeenCalledTimes(3));
    expect(midiService.connectOutputDevice).toHaveBeenCalledOnce();
  });

  it('does not connect after the user disconnected the output on purpose', async () => {
    output.intentional = true;
    note(60);
    await vi.waitFor(() => expect(midiService.sendNote).toHaveBeenCalled());
    expect(midiService.connectOutputDevice).not.toHaveBeenCalled();
  });

  it('initializes and connects the saved output when it is in the device list', async () => {
    usePreferences.getState().setMidi({ ...usePreferences.getState().midi, lastOutputDeviceId: 'hw-1' });
    midiService.getOutputDevices.mockReturnValue([
      { id: 'soundfont-synth', name: 'Soundfont Synthesizer' }, { id: 'hw-1', name: 'Port 1' },
    ]);
    note(60);
    await vi.waitFor(() => expect(midiService.sendNote).toHaveBeenCalled());
    expect(midiService.initialize).toHaveBeenCalledOnce();
    expect(midiService.connectOutputDevice).toHaveBeenCalledWith('hw-1');
  });

  it('falls back to the soundfont when the saved output is gone', async () => {
    usePreferences.getState().setMidi({ ...usePreferences.getState().midi, lastOutputDeviceId: 'hw-gone' });
    midiService.getOutputDevices.mockReturnValue([{ id: 'soundfont-synth', name: 'Soundfont Synthesizer' }]);
    note(60);
    await vi.waitFor(() => expect(midiService.sendNote).toHaveBeenCalled());
    expect(midiService.connectOutputDevice).toHaveBeenCalledWith('soundfont-synth');
  });

  it('connects an output for a MOO ProgramChange before sending it', async () => {
    midi.receiveRegisteredMessage('ProgramChange', { channel: 0, program: 5 });
    await vi.waitFor(() => expect(midiService.sendRawMessage).toHaveBeenCalledWith([0xc0, 5]));
    expect(midiService.connectOutputDevice).toHaveBeenCalledWith('soundfont-synth');
  });
});

describe('GMCPClientMidi effects route', () => {
  it('routes browser synths through the media chain system without loading a synth', () => {
    const previous = usePreferences.getState().midi;
    usePreferences.getState().setMidi({ ...previous, enabled: true });
    const setMidiRoute = vi.fn();
    const midi = new GMCPClientMidi({ media: { setMidiRoute } } as never);
    midi.receiveRegisteredMessage('Route', { chain: 'room', send: 0.4 });
    expect(setMidiRoute).toHaveBeenCalledWith({ chain: 'room', send: 0.4 });
    usePreferences.getState().setMidi({ ...previous, enabled: false });
    midi.receiveRegisteredMessage('Route', {});
    expect(setMidiRoute).toHaveBeenCalledOnce();
    usePreferences.getState().setMidi(previous);
  });
});
