import { beforeEach, describe, expect, it, vi } from 'vitest';
import { midiService } from './MidiService';

type JzzDeviceChange = {
  inputs?: {
    added?: Array<{ id?: string; name?: string }>;
    removed?: Array<{ id?: string; name?: string }>;
  };
  outputs?: {
    added?: Array<{ id?: string; name?: string }>;
    removed?: Array<{ id?: string; name?: string }>;
  };
};

const jzzState = vi.hoisted(() => ({
  deviceChangeListener: undefined as ((info: JzzDeviceChange) => void) | undefined,
  inputPort: {
    close: vi.fn(),
    connect: vi.fn(),
  },
}));

vi.mock('jzz', () => ({
  default: vi.fn(() => ({
    info: vi.fn(() => ({
      inputs: [{ id: 'keyboard-1', name: 'Test Keyboard' }],
      outputs: [],
    })),
    onChange: vi.fn((listener: (info: JzzDeviceChange) => void) => {
      jzzState.deviceChangeListener = listener;
      return {};
    }),
    openMidiIn: vi.fn(async () => jzzState.inputPort),
  })),
}));

vi.mock('./stores/preferencesStore', () => ({
  usePreferences: {
    getState: () => ({
      midi: {
        lastInputDeviceId: undefined,
        lastOutputDeviceId: undefined,
      },
      setMidi: vi.fn(),
    }),
  },
}));

const virtualPort = vi.hoisted(() => ({
  send: vi.fn(),
  sendAt: vi.fn(),
  close: vi.fn(),
}));

vi.mock('./VirtualMidiService', () => ({
  virtualMidiService: {
    initialized: true,
    getPortName: () => 'Virtual Synthesizer',
    getVirtualPort: vi.fn(async () => virtualPort),
  },
}));

describe('MidiService note scheduling', () => {
  beforeEach(() => {
    midiService.disconnect();
    vi.clearAllMocks();
  });

  it('schedules the note-off on the virtual synth clock', async () => {
    await midiService.connectOutputDevice('virtual-synth');

    const scheduled = midiService.scheduleNoteOff({ note: 60, velocity: 100, on: true, channel: 2 }, 250);

    expect(scheduled).toBe(true);
    expect(virtualPort.sendAt).toHaveBeenCalledWith([0x82, 60, 0], 0.25);
  });

  it('reports no scheduling without an output', () => {
    expect(midiService.scheduleNoteOff({ note: 60, velocity: 100, on: true }, 250)).toBe(false);
  });
});

describe('MidiService device changes', () => {
  beforeEach(() => {
    midiService.disconnect();
    jzzState.deviceChangeListener = undefined;
    vi.clearAllMocks();
  });

  it('records a removed connection before notifying device-change listeners', async () => {
    await midiService.initialize();
    await midiService.connectInputDevice('keyboard-1', vi.fn());
    let connectedWhenNotified: boolean | undefined;
    const unsubscribe = midiService.onDeviceChange(() => {
      connectedWhenNotified = midiService.connectionStatus.inputConnected;
    });

    jzzState.deviceChangeListener?.({
      inputs: {
        removed: [{ id: 'keyboard-1', name: 'Test Keyboard' }],
      },
    });

    expect(connectedWhenNotified).toBe(false);
    expect(midiService.connectionStatus.inputConnected).toBe(false);
    unsubscribe();
  });
});
