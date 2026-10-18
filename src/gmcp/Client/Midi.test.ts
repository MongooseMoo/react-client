import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { midiService } = vi.hoisted(() => ({
  midiService: {
    connectionStatus: { inputConnected: false, outputConnected: true },
    hasOutputDevice: true,
    sendRawMessage: vi.fn(),
  },
}));

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
