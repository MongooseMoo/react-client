import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const lib = vi.hoisted(() => ({
  synths: [] as Array<{
    context: unknown;
    connect: ReturnType<typeof vi.fn>;
    sendMessage: ReturnType<typeof vi.fn>;
    destroy: ReturnType<typeof vi.fn>;
    addSoundBank: ReturnType<typeof vi.fn>;
    events: Map<string, (data: unknown) => void>;
  }>,
  bankLoaded: Promise.resolve() as Promise<void>,
}));

vi.mock('spessasynth_lib/dist/spessasynth_processor.min.js?url', () => ({
  default: '/assets/spessasynth_processor.js',
}));
vi.mock('spessasynth_lib', () => ({
  WorkletSynthesizer: class {
    connect = vi.fn();
    sendMessage = vi.fn();
    destroy = vi.fn();
    isReady = Promise.resolve();
    events = new Map<string, (data: unknown) => void>();
    addSoundBank = vi.fn(() => lib.bankLoaded);
    soundBankManager = { addSoundBank: this.addSoundBank };
    eventHandler = {
      addEvent: (name: string, _id: string, callback: (data: unknown) => void) =>
        this.events.set(name, callback),
    };
    constructor(public context: unknown) {
      lib.synths.push(this);
    }
  },
}));

import { SOUNDFONT_URL, SoundfontOutput } from './SoundfontOutput';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((done, fail) => {
    resolve = done;
    reject = fail;
  });
  return { promise, resolve, reject };
}

const bank = () => new Response(new Uint8Array([1, 2, 3]));
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

function fixture() {
  const context = {
    currentTime: 10,
    audioWorklet: { addModule: vi.fn(async () => {}) },
  };
  const destination = {};
  const output = { context: context as unknown as BaseAudioContext, destination: destination as AudioNode };
  const fallback = { send: vi.fn(), sendAt: vi.fn(), close: vi.fn() };
  const notify = vi.fn();
  let outputListener = () => {};
  const unsubscribe = vi.fn();
  const invalidated = vi.fn();
  const synth = new SoundfontOutput(
    () => output,
    fallback,
    notify,
    (listener) => {
      outputListener = listener;
      return unsubscribe;
    },
    invalidated,
  );
  return {
    synth,
    context,
    destination,
    fallback,
    notify,
    invalidated,
    unsubscribe,
    changeOutput: () => outputListener(),
  };
}

describe('SoundfontOutput', () => {
  beforeEach(() => {
    lib.synths.length = 0;
    lib.bankLoaded = Promise.resolve();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => bank()),
    );
  });
  afterEach(() => vi.unstubAllGlobals());

  it('loads the worklet and the one bank only when connected, rendering into the shared output', async () => {
    const { synth, context, destination } = fixture();
    expect(fetch).not.toHaveBeenCalled();
    expect(lib.synths).toHaveLength(0);
    await synth.ready();
    expect(context.audioWorklet.addModule).toHaveBeenCalledWith('/assets/spessasynth_processor.js');
    expect(lib.synths[0].context).toBe(context);
    expect(lib.synths[0].connect).toHaveBeenCalledWith(destination);
    await vi.waitFor(() => expect(lib.synths[0].addSoundBank).toHaveBeenCalled());
    expect(fetch).toHaveBeenCalledWith(SOUNDFONT_URL, expect.objectContaining({ credentials: 'omit' }));
    expect(SOUNDFONT_URL).toBe('https://mongoose.world/sounds/soundfonts/MuseScore_General.sf3');
    const [buffer] = lib.synths[0].addSoundBank.mock.calls[0] as unknown as [ArrayBuffer];
    expect([...new Uint8Array(buffer)]).toEqual([1, 2, 3]);
    synth.close();
  });

  it('plays the built-in synth while the bank loads, then the SoundFont on the audio clock', async () => {
    const pending = deferred<void>();
    lib.bankLoaded = pending.promise;
    const { synth, fallback, notify } = fixture();
    await synth.ready();
    synth.send([0x90, 60, 100]);
    synth.sendAt([0x80, 60, 0], 0.25);
    expect(fallback.send).toHaveBeenCalledWith([0x90, 60, 100]);
    expect(fallback.sendAt).toHaveBeenCalledWith([0x80, 60, 0], 0.25);
    expect(lib.synths[0].sendMessage).not.toHaveBeenCalled();

    pending.resolve();
    await vi.waitFor(() => expect(notify).toHaveBeenLastCalledWith('MuseScore General ready.'));
    fallback.send.mockClear();
    synth.send([0x90, 62, 100]);
    synth.sendAt([0x80, 62, 0], 0.5);
    expect(lib.synths[0].sendMessage).toHaveBeenCalledWith([0x90, 62, 100]);
    expect(lib.synths[0].sendMessage).toHaveBeenCalledWith([0x80, 62, 0], 0, { time: 10.5 });
    expect(fallback.send).not.toHaveBeenCalledWith([0x90, 62, 100]);
    synth.close();
  });

  it('carries channel settings made during loading into the SoundFont and releases notes the built-in synth started', async () => {
    const pending = deferred<void>();
    lib.bankLoaded = pending.promise;
    const { synth, fallback } = fixture();
    await synth.ready();
    synth.send([0xc1, 40]);
    synth.send([0xb1, 7, 90]);
    synth.send([0xb1, 7, 80]);
    synth.send([0xe1, 0, 70]);
    synth.send([0x91, 64, 100]);
    pending.resolve();
    await vi.waitFor(() => expect(lib.synths[0].sendMessage).toHaveBeenCalled());
    expect(lib.synths[0].sendMessage.mock.calls.map(([data]) => data)).toEqual([
      [0xc1, 40],
      [0xb1, 7, 80],
      [0xe1, 0, 70],
    ]);
    synth.send([0x81, 64, 0]);
    expect(fallback.send).toHaveBeenLastCalledWith([0x81, 64, 0]);
    expect(lib.synths[0].sendMessage).toHaveBeenLastCalledWith([0x81, 64, 0]);
    synth.close();
  });

  it('stays on the built-in synth and says so when the bank cannot load', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('', { status: 503 }));
    const { synth, fallback, notify } = fixture();
    await synth.ready();
    await vi.waitFor(() => expect(notify).toHaveBeenLastCalledWith(expect.stringContaining('could not load')));
    synth.send([0x90, 60, 100]);
    expect(fallback.send).toHaveBeenCalledWith([0x90, 60, 100]);
    expect(lib.synths[0].sendMessage).not.toHaveBeenCalled();
    synth.close();
  });

  it('treats a bank the synthesizer rejects as a failed load', async () => {
    lib.bankLoaded = new Promise(() => {});
    const { synth, fallback, notify } = fixture();
    await synth.ready();
    await vi.waitFor(() => expect(lib.synths[0].events.has('soundBankError')).toBe(true));
    lib.synths[0].events.get('soundBankError')?.(new Error('bad bank'));
    await vi.waitFor(() => expect(notify).toHaveBeenLastCalledWith(expect.stringContaining('could not load')));
    synth.send([0x90, 60, 100]);
    expect(fallback.send).toHaveBeenCalledWith([0x90, 60, 100]);
    synth.close();
  });

  it('fails the connection when the worklet cannot load', async () => {
    const { synth, context } = fixture();
    context.audioWorklet.addModule.mockRejectedValueOnce(new Error('no worklets'));
    await expect(synth.ready()).rejects.toThrow('no worklets');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('cancels the download, destroys the synthesizer and closes the built-in synth on close', async () => {
    const pending = deferred<Response>();
    vi.mocked(fetch).mockReturnValueOnce(pending.promise);
    const { synth, fallback, notify, unsubscribe } = fixture();
    await synth.ready();
    const signal = (vi.mocked(fetch).mock.calls[0][1] as RequestInit).signal;
    synth.close();
    expect(signal?.aborted).toBe(true);
    expect(lib.synths[0].destroy).toHaveBeenCalledOnce();
    expect(fallback.close).toHaveBeenCalledOnce();
    expect(unsubscribe).toHaveBeenCalledOnce();
    const count = notify.mock.calls.length;
    pending.resolve(bank());
    await settle();
    synth.send([0x90, 60, 100]);
    expect(fallback.send).not.toHaveBeenCalled();
    expect(lib.synths[0].addSoundBank).not.toHaveBeenCalled();
    expect(notify).toHaveBeenCalledTimes(count);
  });

  it('closes itself when the client audio output changes', async () => {
    const { synth, changeOutput, invalidated, fallback } = fixture();
    await synth.ready();
    changeOutput();
    expect(lib.synths[0].destroy).toHaveBeenCalledOnce();
    expect(fallback.close).toHaveBeenCalledOnce();
    expect(invalidated).toHaveBeenCalledOnce();
  });
});
