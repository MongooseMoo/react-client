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

const soundfontState = vi.hoisted(() => ({
  ready: async () => {},
  outputs: [] as Array<{ send: ReturnType<typeof vi.fn>; sendAt: ReturnType<typeof vi.fn>; close: ReturnType<typeof vi.fn> }>,
}));

vi.mock('./midi/SoundfontOutput', () => ({
  SoundfontOutput: class {
    send = vi.fn();
    sendAt = vi.fn();
    close = vi.fn();
    constructor() { soundfontState.outputs.push(this); }
    ready() { return soundfontState.ready(); }
  },
}));

vi.mock('./VirtualMidiService', () => ({
  virtualMidiService: {
    initialized: true,
    getPortName: () => 'Virtual Synthesizer',
    getVirtualPort: vi.fn(async () => virtualPort),
    getAudioOutput: () => ({}),
    subscribeAudioOutput: () => () => {},
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

  it('keeps timestamped capture subscribers independent from the ordinary relay callback', async () => {
    await midiService.initialize();
    const relay = vi.fn(), capture = vi.fn();
    const unsubscribe = midiService.subscribeInput(capture);
    await midiService.connectInputDevice('keyboard-1', relay);
    const receive = jzzState.inputPort.connect.mock.calls[0][0];
    const clock = vi.spyOn(performance, 'now').mockReturnValue(1234.5);
    receive([0x90, 60, 100]);
    expect(relay).toHaveBeenCalledOnce();
    expect(capture).toHaveBeenCalledWith(expect.objectContaining({ note: { note: 60, velocity: 100, on: true, channel: 0 } }), 1234.5);
    unsubscribe(); receive([0x80,60,0]); expect(capture).toHaveBeenCalledOnce(); expect(relay).toHaveBeenCalledTimes(2);
    clock.mockRestore();
  });

  it('notifies input connection consumers after intentional disconnect', async () => {
    await midiService.initialize(); await midiService.connectInputDevice('keyboard-1', vi.fn());
    const states: boolean[] = [];
    const unsubscribe = midiService.subscribeInputConnection(() => states.push(midiService.hasInputDevice));
    midiService.disconnectDevice('input');
    expect(states).toEqual([false]); unsubscribe();
  });

  it('drops malformed channel frames before relay and independent capture subscribers', async () => {
    await midiService.initialize();
    const relay = vi.fn(), capture = vi.fn();
    const unsubscribe = midiService.subscribeInput(capture);
    await midiService.connectInputDevice('keyboard-1', relay);
    const receive = jzzState.inputPort.connect.mock.calls[0][0];
    for (const data of [[], [0x90, 60], [0x90, 128, 100], [0xc0, 0, 100], [0x40, 60, 100]]) receive(data);
    expect(relay).not.toHaveBeenCalled(); expect(capture).not.toHaveBeenCalled();
    receive([0x90, 60, 100]); expect(relay).toHaveBeenCalledOnce(); expect(capture).toHaveBeenCalledOnce();
    unsubscribe();
  });
});

describe('MidiService soundfont connections', () => {
  beforeEach(() => {
    midiService.disconnect();
    soundfontState.outputs = [];
    soundfontState.ready = async () => {};
    vi.clearAllMocks();
  });

  it('lists soundfonts without constructing a renderer', () => {
    expect(midiService.getOutputDevices()).toContainEqual({ id: 'soundfont-synth', name: 'Soundfont Synthesizer' });
    expect(soundfontState.outputs).toHaveLength(0);
  });

  it('cancels a pending connection so late completion cannot reconnect it', async () => {
    let finish = () => {};
    soundfontState.ready = () => new Promise<void>((resolve) => { finish = resolve; });
    const connecting = midiService.connectOutputDevice('soundfont-synth');
    await vi.waitFor(() => expect(soundfontState.outputs).toHaveLength(1));
    midiService.disconnectWithIntent('output');
    finish();
    expect(await connecting).toBe(false);
    expect(midiService.hasOutputDevice).toBe(false);
    expect(soundfontState.outputs[0].close).toHaveBeenCalled();
  });

  it('keeps the previous output usable if a replacement fails to load', async () => {
    expect(await midiService.connectOutputDevice('virtual-synth')).toBe(true);
    soundfontState.ready = async () => { throw new Error('network unavailable'); };
    expect(await midiService.connectOutputDevice('soundfont-synth')).toBe(false);
    expect(midiService.connectionStatus.outputDeviceId).toBe('virtual-synth');
    midiService.sendNote({ note: 60, velocity: 100, on: true });
    expect(virtualPort.send).toHaveBeenCalledWith([0x90, 60, 100]);
    expect(midiService.getSoundfontMessage()).toContain('Check your connection');
  });

  it('drives sample note-offs through the sink audio clock', async () => {
    expect(await midiService.connectOutputDevice('soundfont-synth')).toBe(true);
    midiService.scheduleNoteOff({ note: 64, velocity: 100, on: true }, 500);
    expect(soundfontState.outputs[0].sendAt).toHaveBeenCalledWith([0x80, 64, 0], 0.5);
  });
});
