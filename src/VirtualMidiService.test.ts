import { beforeEach, describe, expect, it, vi } from 'vitest';
import { virtualMidiService } from './VirtualMidiService';

const synthState = vi.hoisted(() => ({
  instances: [] as Array<{
    options: unknown;
    send: ReturnType<typeof vi.fn>;
    allSoundOff: ReturnType<typeof vi.fn>;
    setAudioContext: ReturnType<typeof vi.fn>;
    dispose: ReturnType<typeof vi.fn>;
  }>,
  currentTime: 10,
}));

vi.mock('@xrnavigation/webaudio-tinysynth', () => ({
  default: vi.fn().mockImplementation(function (this: Record<string, unknown>, options?: unknown) {
    const instance = {
      options,
      send: vi.fn(),
      allSoundOff: vi.fn(),
      setAudioContext: vi.fn(async () => undefined),
      dispose: vi.fn(async () => undefined),
      ready: vi.fn(async () => undefined),
      getAudioContext: () => ({ currentTime: synthState.currentTime }),
    };
    synthState.instances.push(instance);
    return instance;
  }),
}));

const output = () => ({
  context: {} as BaseAudioContext,
  destination: {} as AudioNode,
});

describe('VirtualMidiService', () => {
  beforeEach(async () => {
    await virtualMidiService.dispose();
    synthState.instances = [];
    vi.clearAllMocks();
  });

  it('renders into an attached output instead of a private context', async () => {
    const attached = output();
    await virtualMidiService.setAudioOutput(attached);
    await virtualMidiService.initialize();

    expect(synthState.instances[0].options).toEqual({
      audioContext: attached.context,
      destination: attached.destination,
    });
  });

  it('moves an existing synth when the output is attached later', async () => {
    await virtualMidiService.initialize();
    const attached = output();
    await virtualMidiService.setAudioOutput(attached);

    expect(synthState.instances).toHaveLength(1);
    expect(synthState.instances[0].setAudioContext).toHaveBeenCalledWith(
      attached.context,
      attached.destination,
    );
  });

  it('schedules sendAt on the audio clock', async () => {
    const port = await virtualMidiService.getVirtualPort();
    port?.sendAt?.([0x80, 60, 0], 0.25);

    expect(synthState.instances[0].send).toHaveBeenCalledWith([0x80, 60, 0], 10.25);
  });

  it('silences every channel when the port closes', async () => {
    const port = await virtualMidiService.getVirtualPort();
    port?.close();

    expect(synthState.instances[0].allSoundOff).toHaveBeenCalledTimes(16);
  });
});
