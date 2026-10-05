import type { Cacophony } from 'cacophony';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MediaService } from './MediaService';

vi.stubGlobal('MediaStream', vi.fn());

function makeBus(name: string | null, order: string[]) {
  return {
    name,
    addFilter: vi.fn(async (arg: unknown) => arg),
    removeFilter: vi.fn(),
    destroy: vi.fn(() => order.push(`destroy:${name}`)),
    destroyed: false,
    gain: 1,
    output: { gain: { value: 1, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() } },
  };
}

function setup() {
  const order: string[] = [];
  const master = makeBus('master', order);
  const created = new Map<string, ReturnType<typeof makeBus>>();
  const sound = {
    threeDOptions: undefined as unknown,
    position: undefined as unknown,
    play: vi.fn(() => [{ panner: undefined }]),
    routeTo: vi.fn((target: unknown, send?: number) =>
      order.push(`routeTo:${typeof target === 'string' ? target : 'master'}:${send ?? 'primary'}`),
    ),
    removeSend: vi.fn((target: string) => order.push(`removeSend:${target}`)),
    cleanup: vi.fn(),
  };
  const cacophony = {
    context: { currentTime: 0, sampleRate: 48000 },
    createBus: vi.fn((name?: string) => {
      const bus = makeBus(name ?? null, order);
      if (name) created.set(name, bus);
      return bus;
    }),
    getBus: vi.fn((name: string) => (name === 'master' ? master : created.get(name))),
    createFdnReverb: vi.fn(() => ({ __effect: 'fdn' })),
    createMediaStreamSound: vi.fn(() => sound),
    resume: vi.fn(async () => {}),
    setGlobalVolume: vi.fn(),
    muted: false,
  };
  const media = new MediaService(cacophony as unknown as Cacophony, { manageFocus: false });
  return { media, order, sound };
}

const reverb = { id: 'room', effects: [{ type: 'reverb', algorithm: 'fdn' }] };
const track = () => ({ enabled: false }) as unknown as MediaStreamTrack;

describe('MediaService voices', () => {
  let warn: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warn.mockRestore();
  });

  it('joins a chain that is defined after the voice asked for it', async () => {
    const { media, sound } = setup();
    const voice = media.attachVoice(track(), [0, 0, 0]);

    voice.setRoute({ chain: 'room', send: 0.4 });
    expect(sound.routeTo).not.toHaveBeenCalled();

    await media.setChain(reverb);
    expect(sound.routeTo).toHaveBeenCalledWith('room', 0.4);
  });

  it('takes the voice off a chain before ChainStop destroys it, and puts it back on redefinition', async () => {
    const { media, order, sound } = setup();
    await media.setChain(reverb);
    const voice = media.attachVoice(track(), [0, 0, 0]);
    voice.setRoute({ chain: 'room', send: 0.4 });
    order.length = 0;

    media.removeChain('room');
    expect(order).toEqual(['removeSend:room', 'destroy:room']);

    await media.setChain(reverb);
    expect(sound.routeTo).toHaveBeenLastCalledWith('room', 0.4);
  });

  it('keeps a voice send level with the room as the listener walks away from the speaker', async () => {
    const { media, sound } = setup();
    await media.setChain(reverb);
    media.setListenerPosition([0, 0, 0]);
    const voice = media.attachVoice(track(), [0, 0, 4], [0, 0, -1]);
    voice.setRoute({ chain: 'room', send: 0.3 });
    // 4 m: the panner's distance gain is 0.25, ahead of the tap.
    expect(sound.routeTo).toHaveBeenLastCalledWith('room', expect.closeTo(1.2, 9));
    expect(sound.threeDOptions).toEqual(expect.objectContaining({ orientationZ: -1 }));

    media.setListenerPosition([0, 0, 2]);
    expect(sound.routeTo).toHaveBeenLastCalledWith('room', expect.closeTo(0.6, 9));
    expect(sound.removeSend).not.toHaveBeenCalled();
  });

  it('keeps voices through a stop-all and a reset, which only returns them to dry', async () => {
    const { media, order, sound } = setup();
    await media.setChain(reverb);
    const voice = media.attachVoice(track(), [0, 0, 0]);
    voice.setRoute({ chain: 'room' });
    order.length = 0;

    media.stopAllSounds();
    expect(order).toEqual([]);

    media.reset();
    expect(order).toEqual(['routeTo:master:primary', 'destroy:room']);
    expect(sound.cleanup).not.toHaveBeenCalled();

    voice.detach();
    expect(sound.cleanup).toHaveBeenCalledOnce();
  });
});
