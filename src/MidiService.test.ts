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
