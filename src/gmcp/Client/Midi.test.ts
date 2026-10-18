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
