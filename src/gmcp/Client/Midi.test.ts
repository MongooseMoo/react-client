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
