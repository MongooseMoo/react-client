import type { Cacophony } from 'cacophony';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SPATIAL_PARAM_TAU_S } from './audioParamSmoothing';
import { SPATIAL_DISTANCE_MODEL } from './distanceModel';
import { MediaVoices } from './MediaVoices';

const MockMediaStream = vi.fn();
vi.stubGlobal('MediaStream', MockMediaStream);

function makeVoiceSound() {
  const sound = {
    threeDOptions: undefined as unknown,
    position: undefined as unknown,
    spatialSmoothingTau: 0,
    /** What the sound looked like at the moment it started playing. */
    atPlay: undefined as unknown,
    play: vi.fn(() => {
      sound.atPlay = { position: sound.position, tau: sound.spatialSmoothingTau };
      return [];
    }),
    routeTo: vi.fn(),
    removeSend: vi.fn(),
    cleanup: vi.fn(),
  };
  return { sound };
}

function setup() {
  const master = { name: 'master' };
  const made: ReturnType<typeof makeVoiceSound>[] = [];
  const cacophony = {
    context: { currentTime: 7 },
    createMediaStreamSound: vi.fn(() => {
      const voice = makeVoiceSound();
      made.push(voice);
      return voice.sound;
    }),
    getBus: vi.fn((name: string) => (name === 'master' ? master : undefined)),
    resume: vi.fn(async () => {}),
  };
  const defined = new Set<string>();
  const pending = new Set<string>();
  const voices = new MediaVoices(cacophony as unknown as Cacophony, {
    hasChain: (id) => defined.has(id),
    hasPendingChain: (id) => pending.has(id),
  });
  return { cacophony, defined, made, master, pending, voices };
}

function track() {
  return { enabled: false, stop: vi.fn() } as unknown as MediaStreamTrack;
}

describe('MediaVoices', () => {
  let warn: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warn.mockRestore();
  });

  it('plays a track as an HRTF point source without taking ownership of it', () => {
    const { cacophony, made, voices } = setup();
    const remote = track();

    voices.attach(remote, [1, 2, 3]);

    expect(remote.enabled).toBe(true);
    expect(MockMediaStream).toHaveBeenCalledWith([remote]);
    expect(cacophony.createMediaStreamSound).toHaveBeenCalledWith(expect.any(MockMediaStream), {
      panType: 'HRTF',
      stopTracksOnStop: false,
    });
    const { sound } = made[0];
    expect(sound.threeDOptions).toEqual(
      expect.objectContaining({
        channelCount: 1,
        channelCountMode: 'explicit',
        channelInterpretation: 'speakers',
        distanceModel: 'inverse',
        panningModel: 'HRTF',
        refDistance: SPATIAL_DISTANCE_MODEL.refDistance,
        rolloffFactor: SPATIAL_DISTANCE_MODEL.rolloffFactor,
        maxDistance: SPATIAL_DISTANCE_MODEL.maxDistance,
      }),
    );
    expect(sound.position).toEqual([1, 2, 3]);
    expect(sound.play).toHaveBeenCalledOnce();
    expect(cacophony.resume).toHaveBeenCalledOnce();
  });

  it('places the voice before it plays, then moves it with smoothing on', () => {
    const { made, voices } = setup();
    const voice = voices.attach(track(), [1, 2, 3]);
    const { sound } = made[0];

    // Cacophony applies a pose set before play immediately and ramps later ones.
    expect(sound.atPlay).toEqual({ position: [1, 2, 3], tau: SPATIAL_PARAM_TAU_S });

    voice.setPosition([4, 5, 6]);
    expect(sound.position).toEqual([4, 5, 6]);
  });

  it('detaches once, leaves the track running, and ignores later calls', () => {
    const { defined, made, voices } = setup();
    defined.add('room');
    const remote = track();
    const voice = voices.attach(remote, [0, 0, 0]);
    const { sound } = made[0];

    voice.detach();
    voice.detach();
    voice.setRoute({ chain: 'room' });
    voice.setPosition([1, 1, 1]);
    voices.chainCreated('room');

    expect(sound.cleanup).toHaveBeenCalledOnce();
    expect(remote.stop).not.toHaveBeenCalled();
    expect(sound.routeTo).not.toHaveBeenCalled();
    expect(sound.position).toEqual([0, 0, 0]);
  });

  it('routes through a defined chain as a send or as the primary route', () => {
    const { defined, made, master, voices } = setup();
    defined.add('room');
    const voice = voices.attach(track(), [0, 0, 0]);
    const { sound } = made[0];

    voice.setRoute({ chain: 'room', send: 0.4 });
    expect(sound.routeTo).toHaveBeenLastCalledWith('room', 0.4);

    voice.setRoute({ chain: 'room', send: 0.4 });
    expect(sound.routeTo).toHaveBeenCalledOnce();

    voice.setRoute({ chain: 'room' });
    expect(sound.removeSend).toHaveBeenCalledWith('room');
    expect(sound.routeTo).toHaveBeenLastCalledWith('room');

    voice.setRoute({});
    expect(sound.routeTo).toHaveBeenLastCalledWith(master);
    expect(warn).not.toHaveBeenCalled();
  });

  it('plays dry with one warning when the chain is not defined, then joins it once it is', () => {
    const { defined, made, voices } = setup();
    const voice = voices.attach(track(), [0, 0, 0]);
    const { sound } = made[0];

    voice.setRoute({ chain: 'room', send: 0.5 });
    expect(sound.routeTo).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledOnce();

    defined.add('room');
    voices.chainCreated('other');
    expect(sound.routeTo).not.toHaveBeenCalled();
    voices.chainCreated('room');
    expect(sound.routeTo).toHaveBeenCalledWith('room', 0.5);
  });

  it('does not warn while the chain is still being built', () => {
    const { made, pending, voices } = setup();
    pending.add('room');
    const voice = voices.attach(track(), [0, 0, 0]);

    voice.setRoute({ chain: 'room', send: 0.5 });

    expect(made[0].sound.routeTo).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
  });

  it('leaves a chain before it is destroyed and rejoins when it is defined again', () => {
    const { defined, made, master, voices } = setup();
    defined.add('room');
    const sent = voices.attach(track(), [0, 0, 0]);
    const primary = voices.attach(track(), [0, 0, 0]);
    sent.setRoute({ chain: 'room', send: 0.3 });
    primary.setRoute({ chain: 'room' });

    voices.chainDestroying('room');
    defined.delete('room');

    expect(made[0].sound.removeSend).toHaveBeenCalledWith('room');
    expect(made[1].sound.routeTo).toHaveBeenLastCalledWith(master);

    defined.add('room');
    voices.chainCreated('room');

    expect(made[0].sound.routeTo).toHaveBeenLastCalledWith('room', 0.3);
    expect(made[1].sound.routeTo).toHaveBeenLastCalledWith('room');
  });

  it('keeps wanting a chain it could not be routed to', () => {
    const { defined, made, voices } = setup();
    defined.add('room');
    const voice = voices.attach(track(), [0, 0, 0]);
    const { sound } = made[0];
    sound.routeTo.mockImplementationOnce(() => {
      throw new Error('destroyed');
    });

    voice.setRoute({ chain: 'room', send: 0.2 });
    expect(warn).toHaveBeenCalledOnce();

    voices.chainCreated('room');
    expect(sound.routeTo).toHaveBeenLastCalledWith('room', 0.2);
    expect(sound.removeSend).not.toHaveBeenCalled();
  });
});
