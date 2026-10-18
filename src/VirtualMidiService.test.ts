import { beforeEach, describe, expect, it, vi } from 'vitest';
import { virtualMidiService } from './VirtualMidiService';
import { SequenceOutputNotReady } from './midi/SequenceOutput';

interface TestContext {
  currentTime: number;
  state: string;
  resume: ReturnType<typeof vi.fn>;
}

const synthState = vi.hoisted(() => ({
  instances: [] as Array<{
    options: unknown;
    send: ReturnType<typeof vi.fn>;
    allSoundOff: ReturnType<typeof vi.fn>;
    setAudioContext: ReturnType<typeof vi.fn>;
    dispose: ReturnType<typeof vi.fn>;
  }>,
  currentTime: 10,
  context: null as TestContext | null,
}));

vi.mock('@xrnavigation/webaudio-tinysynth', () => ({
  default: vi.fn().mockImplementation(function (this: Record<string, unknown>, options?: unknown) {
    let context = (options as { audioContext?: TestContext })?.audioContext ?? synthState.context;
    const dispatch = () => {
      // TinySynth's _dispatchMIDI resumes any suspended online context.
      if (context?.state === 'suspended') context.resume();
    };
    const instance = {
      options,
      send: vi.fn(dispatch),
      allSoundOff: vi.fn(),
      setAudioContext: vi.fn(async (next: TestContext) => {
        context = next;
        dispatch();
      }),
      dispose: vi.fn(async () => undefined),
      ready: vi.fn(async () => undefined),
      getAudioContext: () =>
        typeof context?.currentTime === 'number'
          ? context
          : { currentTime: synthState.currentTime },
    };
    // Real graph construction primes a note through send as well.
    dispatch();
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
    synthState.context = null;
    vi.clearAllMocks();
  });

  function pausedOutput() {
    const context: TestContext = { currentTime: 10, state: 'running', resume: vi.fn() };
    const listeners = new Set<() => void>();
    const source = {
      paused: false,
      subscribePlayback: (listener: () => void) => {
        listeners.add(listener);
        return () => {
          listeners.delete(listener);
        };
      },
    };
    const cleanup = virtualMidiService.setPlaybackSource(source);
    synthState.context = context;
    return {
      context,
      source,
      listeners,
      cleanup,
      attached: { context: context as unknown as BaseAudioContext, destination: {} as AudioNode },
      pause: () => {
        source.paused = true;
        context.state = 'suspended';
        listeners.forEach((listener) => {
          listener();
        });
      },
      resume: () => {
        context.state = 'running';
        source.paused = false;
        listeners.forEach((listener) => {
          listener();
        });
      },
    };
  }

  it('reports paused sequence output as transient and notifies after explicit resume', async () => {
    const playback = pausedOutput();
    await virtualMidiService.setAudioOutput(playback.attached);
    await virtualMidiService.initialize();
    playback.pause();
    const error = await virtualMidiService.getSequenceOutput().catch((error) => error);
    expect(error).toBeInstanceOf(SequenceOutputNotReady);
    const ready = vi.fn();
    const release = error.subscribeReady(ready);
    await Promise.resolve();
    expect(ready).not.toHaveBeenCalled();
    playback.resume();
    for (let i = 0; i < 6; i++) await Promise.resolve();
    expect(ready).toHaveBeenCalled();
    release();
    expect(await virtualMidiService.getSequenceOutput()).not.toBeNull();
    playback.cleanup();
  });

  it('waits for pending graph attachment and closes the readiness subscription race', async () => {
    const playback = pausedOutput();
    await virtualMidiService.setAudioOutput(playback.attached);
    await virtualMidiService.initialize();
    let finish = () => {};
    synthState.instances[0].setAudioContext.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    const attachment = virtualMidiService.setAudioOutput({
      ...playback.attached,
      destination: {} as AudioNode,
    });
    const error = await virtualMidiService.getSequenceOutput().catch((error) => error);
    expect(error).toBeInstanceOf(SequenceOutputNotReady);
    finish();
    await attachment;
    const ready = vi.fn();
    const release = error.subscribeReady(ready);
    await Promise.resolve();
    expect(ready).toHaveBeenCalled();
    release();
    playback.cleanup();
  });

  it('holds incoming and scheduled MIDI on the frozen audio clock until explicit resume', async () => {
    const playback = pausedOutput();
    await virtualMidiService.setAudioOutput(playback.attached);
    const port = await virtualMidiService.getVirtualPort();
    port?.send([0x90, 60, 100]);
    playback.pause();
    const synth = synthState.instances[0];
    const noteOff = [0x80, 60, 0];
    port?.sendAt?.(noteOff, 0.25);
    noteOff[1] = 70;
    port?.send([0xb0, 64, 0]);
    port?.send([0x90, 62, 100]);
    expect(playback.context.resume).not.toHaveBeenCalled();
    expect(synth.send).toHaveBeenCalledTimes(1);
    expect(synth.allSoundOff).not.toHaveBeenCalled();
    playback.resume();
    await vi.waitFor(() => expect(synth.send).toHaveBeenCalledTimes(4));
    expect(synth.send).toHaveBeenNthCalledWith(2, [0x80, 60, 0], 10.25);
    expect(synth.send).toHaveBeenNthCalledWith(3, [0xb0, 64, 0], 10);
    expect(synth.send).toHaveBeenNthCalledWith(4, [0x90, 62, 100], 10);
    expect(playback.context.resume).not.toHaveBeenCalled();
    playback.cleanup();
    expect(playback.listeners.size).toBe(0);
  });

  it('defers lazy graph construction while shared playback is paused', async () => {
    const playback = pausedOutput();
    playback.pause();
    await virtualMidiService.setAudioOutput(playback.attached);
    const pending = virtualMidiService.getVirtualPort();
    await Promise.resolve();
    expect(synthState.instances).toHaveLength(0);
    expect(playback.context.resume).not.toHaveBeenCalled();
    playback.resume();
    expect(await pending).not.toBeNull();
    expect(synthState.instances).toHaveLength(1);
    playback.cleanup();
  });

  it("removes a closed port's queued notes without reopening the context", async () => {
    const playback = pausedOutput();
    await virtualMidiService.setAudioOutput(playback.attached);
    const port = await virtualMidiService.getVirtualPort();
    playback.pause();
    port?.send([0x90, 60, 100]);
    port?.close();
    playback.resume();
    await Promise.resolve();
    expect(synthState.instances[0].send).not.toHaveBeenCalled();
    expect(playback.context.resume).not.toHaveBeenCalled();
    playback.cleanup();
  });

  it('defers graph reattachment while paused and dispatches retained note-offs after resume', async () => {
    const playback = pausedOutput();
    await virtualMidiService.setAudioOutput(playback.attached);
    const port = await virtualMidiService.getVirtualPort();
    const synth = synthState.instances[0];
    playback.pause();
    const next = { ...playback.attached, destination: {} as AudioNode };
    await virtualMidiService.setAudioOutput(next);
    port?.send([0x80, 60, 0]);
    expect(synth.setAudioContext).not.toHaveBeenCalled();
    expect(playback.context.resume).not.toHaveBeenCalled();
    playback.resume();
    await vi.waitFor(() => expect(synth.send).toHaveBeenCalledWith([0x80, 60, 0], 10));
    expect(synth.setAudioContext).toHaveBeenCalledOnce();
    expect(synth.setAudioContext).toHaveBeenCalledWith(next.context, next.destination);
    expect(playback.context.resume).not.toHaveBeenCalled();
    playback.cleanup();
  });

  it('cancels paused lazy initialization and unsubscribes on dispose', async () => {
    const playback = pausedOutput();
    playback.pause();
    await virtualMidiService.setAudioOutput(playback.attached);
    const pending = virtualMidiService.getVirtualPort();
    await virtualMidiService.dispose();
    expect(await pending).toBeNull();
    expect(playback.listeners.size).toBe(0);
    playback.resume();
    expect(synthState.instances).toHaveLength(0);
    expect(playback.context.resume).not.toHaveBeenCalled();
  });

  it('handles pause and explicit resume before the previous playback notification settles', async () => {
    const playback = pausedOutput();
    playback.pause();
    const pending = virtualMidiService.getVirtualPort();
    playback.resume();
    await vi.waitFor(() => expect(synthState.instances).toHaveLength(1));
    expect(await pending).not.toBeNull();
    playback.cleanup();
  });

  it('attaches the next client graph before draining MIDI and translates retained audio-clock delays', async () => {
    const previous = pausedOutput();
    await virtualMidiService.setAudioOutput(previous.attached);
    const port = await virtualMidiService.getVirtualPort();
    previous.pause();
    port?.sendAt?.([0x80, 60, 0], 0.25);
    previous.cleanup();
    const next = pausedOutput();
    next.context.currentTime = 100;
    await virtualMidiService.setAudioOutput(next.attached);
    await vi.waitFor(() =>
      expect(synthState.instances[0].send).toHaveBeenCalledWith([0x80, 60, 0], 100.25),
    );
    expect(previous.context.resume).not.toHaveBeenCalled();
    expect(previous.listeners.size).toBe(0);
    next.cleanup();
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
