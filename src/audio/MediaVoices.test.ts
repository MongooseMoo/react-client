import type { Cacophony } from 'cacophony';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SPATIAL_PARAM_TAU_S } from './audioParamSmoothing';
import {
  DEFAULT_SPATIAL_PROFILE,
  MAX_SEND_DISTANCE_BOOST,
  SPATIAL_DISTANCE_MODEL,
} from './distanceModel';
import {
  MediaVoices,
  VOICE_CONE_INNER_ANGLE,
  VOICE_CONE_OUTER_ANGLE,
  VOICE_CONE_OUTER_GAIN,
} from './MediaVoices';

const MockMediaStream = vi.fn();
vi.stubGlobal('MediaStream', MockMediaStream);

function makeVoiceSound(panType: 'HRTF' | 'stereo' = 'HRTF') {
  let threeDOptions: unknown;
  let position: unknown;
  // Cacophony fixes a stream sound's panning mode at creation and rejects the
  // other mode's setters; the mock must too.
  const requireHrtf = () => {
    if (panType !== 'HRTF') {
      throw new Error('Position and threeDOptions require HRTF panning');
    }
  };
  const sound = {
    panType,
    get threeDOptions() {
      return threeDOptions;
    },
    set threeDOptions(value: unknown) {
      requireHrtf();
      threeDOptions = value;
    },
    get position() {
      return position;
    },
    set position(value: unknown) {
      requireHrtf();
      position = value;
    },
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
    /** Unset unless a test places the listener: every voice is then at distance gain 1. */
    listenerPosition: undefined as [number, number, number] | undefined,
    createMediaStreamSound: vi.fn((_stream: unknown, options?: { panType?: 'HRTF' | 'stereo' }) => {
      const voice = makeVoiceSound(options?.panType);
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

  describe('a speaker with no place in the current scene', () => {
    it('is heard plainly: a centred stereo voice with no panner pose at all', () => {
      const { cacophony, made, voices } = setup();
      const remote = track();

      voices.attach(remote, null);

      expect(remote.enabled).toBe(true);
      expect(cacophony.createMediaStreamSound).toHaveBeenCalledWith(expect.any(MockMediaStream), {
        panType: 'stereo',
        stopTracksOnStop: false,
      });
      const { sound } = made[0];
      // No 3D panner exists for this voice, so there is no position (not the
      // room origin, not the listener's), no distance model and no direction.
      expect(sound.position).toBeUndefined();
      expect(sound.threeDOptions).toBeUndefined();
      expect(sound.play).toHaveBeenCalledOnce();
    });

    it('becomes a point source at its entity when one appears, and plain again when it leaves', () => {
      const { cacophony, made, voices } = setup();
      const remote = track();
      const voice = voices.attach(remote, null);

      voice.setPosition([1, 2, 3]);

      expect(made).toHaveLength(2);
      expect(made[0].sound.cleanup).toHaveBeenCalledOnce();
      expect(cacophony.createMediaStreamSound).toHaveBeenLastCalledWith(
        expect.any(MockMediaStream),
        { panType: 'HRTF', stopTracksOnStop: false },
      );
      // Placed before it plays: the voice does not fly in from the origin.
      expect(made[1].sound.atPlay).toEqual({ position: [1, 2, 3], tau: SPATIAL_PARAM_TAU_S });
      expect(made[1].sound.threeDOptions).toEqual(
        expect.objectContaining({ panningModel: 'HRTF', distanceModel: 'inverse' }),
      );

      voice.setPosition([4, 5, 6]);
      expect(made).toHaveLength(2);
      expect(made[1].sound.position).toEqual([4, 5, 6]);

      voice.setPosition(null);

      expect(made).toHaveLength(3);
      expect(made[1].sound.cleanup).toHaveBeenCalledOnce();
      expect(made[2].sound.panType).toBe('stereo');
      expect(made[2].sound.position).toBeUndefined();
      expect(made[2].sound.play).toHaveBeenCalledOnce();

      // Still non-positional: nothing is rebuilt.
      voice.setPosition(null);
      expect(made).toHaveLength(3);
      expect(remote.stop).not.toHaveBeenCalled();
      expect(remote.enabled).toBe(true);
    });

    it('keeps its route, live or still wanted, when it changes mode', () => {
      const { defined, made, voices } = setup();
      defined.add('room');
      const routed = voices.attach(track(), null);
      const waiting = voices.attach(track(), null);
      routed.setRoute({ chain: 'room', send: 0.4 });
      waiting.setRoute({ chain: 'later' });

      routed.setPosition([1, 2, 3]);
      waiting.setPosition([1, 2, 3]);

      expect(made[2].sound.routeTo).toHaveBeenCalledWith('room', 0.4);
      expect(made[3].sound.routeTo).not.toHaveBeenCalled();

      defined.add('later');
      voices.chainCreated('later');
      expect(made[3].sound.routeTo).toHaveBeenCalledWith('later');
      // The sounds they replaced are gone from the graph and get nothing more.
      expect(made[1].sound.routeTo).not.toHaveBeenCalled();

      routed.setRoute({});
      expect(made[2].sound.removeSend).toHaveBeenCalledWith('room');
    });

    it('detaches the sound it has now, once', () => {
      const { made, voices } = setup();
      const voice = voices.attach(track(), null);
      voice.setPosition([1, 2, 3]);

      voice.detach();
      voice.detach();
      voice.setPosition(null);

      expect(made).toHaveLength(2);
      expect(made[0].sound.cleanup).toHaveBeenCalledOnce();
      expect(made[1].sound.cleanup).toHaveBeenCalledOnce();
    });
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

  describe('distance', () => {
    it('falls off on the curve media sounds use by default', () => {
      const { made, voices } = setup();

      voices.attach(track(), [1, 2, 3]);

      expect(made[0].sound.threeDOptions).toEqual(
        expect.objectContaining({
          distanceModel: DEFAULT_SPATIAL_PROFILE.model,
          refDistance: DEFAULT_SPATIAL_PROFILE.refDistance,
          rolloffFactor: DEFAULT_SPATIAL_PROFILE.rolloff,
          maxDistance: DEFAULT_SPATIAL_PROFILE.maxDistance,
        }),
      );
    });
  });

  describe("a speaker's facing", () => {
    const cone = {
      coneInnerAngle: VOICE_CONE_INNER_ANGLE,
      coneOuterAngle: VOICE_CONE_OUTER_ANGLE,
      coneOuterGain: VOICE_CONE_OUTER_GAIN,
    };
    const omnidirectional = { coneInnerAngle: 360, coneOuterAngle: 360, coneOuterGain: 1 };

    it('is a gentle cone: full level within 60 degrees either side, -6 dB directly behind', () => {
      expect(VOICE_CONE_INNER_ANGLE).toBe(120);
      expect(VOICE_CONE_OUTER_ANGLE).toBe(360);
      expect(20 * Math.log10(VOICE_CONE_OUTER_GAIN)).toBeCloseTo(-6, 9);
    });

    it('points the voice along its entity forward, with the cone, before it plays', () => {
      const { cacophony, made, voices } = setup();
      let optionsAtPlay: unknown;
      cacophony.createMediaStreamSound.mockImplementationOnce(
        (_stream: unknown, options?: { panType?: 'HRTF' | 'stereo' }) => {
          const voice = makeVoiceSound(options?.panType);
          voice.sound.play.mockImplementation(() => {
            optionsAtPlay = voice.sound.threeDOptions;
            return [];
          });
          made.push(voice);
          return voice.sound;
        },
      );

      voices.attach(track(), [1, 2, 3], [0, 0, -1]);

      const expected = expect.objectContaining({
        ...cone,
        orientationX: 0,
        orientationY: 0,
        orientationZ: -1,
        // Still the positional voice it was: the cone is added, nothing replaced.
        panningModel: 'HRTF',
        refDistance: DEFAULT_SPATIAL_PROFILE.refDistance,
      });
      expect(optionsAtPlay).toEqual(expected);
      expect(made[0].sound.threeDOptions).toEqual(expected);
    });

    it('turns with the entity', () => {
      const { made, voices } = setup();
      const voice = voices.attach(track(), [1, 2, 3], [0, 0, -1]);
      const { sound } = made[0];

      voice.setFacing([1, 0, 0]);

      expect(sound.threeDOptions).toEqual({
        ...cone,
        orientationX: 1,
        orientationY: 0,
        orientationZ: 0,
      });
      // The position is its own state: a turn does not move the voice.
      expect(sound.position).toEqual([1, 2, 3]);
    });

    it('writes nothing to the engine when the facing has not changed', () => {
      const { made, voices } = setup();
      const voice = voices.attach(track(), [1, 2, 3], [0, 0, -1]);
      const { sound } = made[0];
      const before = sound.threeDOptions;

      voice.setFacing([0, 0, -1]);

      expect(sound.threeDOptions).toBe(before);
    });

    it('is omnidirectional for an entity with no forward', () => {
      const { made, voices } = setup();

      voices.attach(track(), [1, 2, 3]);

      const options = made[0].sound.threeDOptions as Record<string, unknown>;
      expect(options).toEqual(expect.objectContaining(omnidirectional));
      expect(options).not.toHaveProperty('orientationX');
    });

    it('gains the cone when a forward arrives, and loses it when the forward goes', () => {
      const { made, voices } = setup();
      const voice = voices.attach(track(), [1, 2, 3]);
      const { sound } = made[0];

      voice.setFacing([0, 0, 1]);
      expect(sound.threeDOptions).toEqual({
        ...cone,
        orientationX: 0,
        orientationY: 0,
        orientationZ: 1,
      });

      voice.setFacing(null);
      expect(sound.threeDOptions).toEqual(omnidirectional);
    });

    it('treats a zero-length forward as no facing', () => {
      const { made, voices } = setup();

      voices.attach(track(), [1, 2, 3], [0, 0, 0]);

      expect(made[0].sound.threeDOptions).toEqual(expect.objectContaining(omnidirectional));
    });

    it('gives a non-positional voice no cone, and keeps the facing for when it is placed', () => {
      const { made, voices } = setup();
      const voice = voices.attach(track(), null, [0, 0, -1]);

      // A stereo voice has no panner: its setters would throw.
      expect(made[0].sound.threeDOptions).toBeUndefined();
      voice.setFacing([1, 0, 0]);
      expect(made[0].sound.threeDOptions).toBeUndefined();

      voice.setPosition([1, 2, 3]);
      expect(made[1].sound.threeDOptions).toEqual(
        expect.objectContaining({ ...cone, orientationX: 1, orientationY: 0, orientationZ: 0 }),
      );

      voice.setPosition(null);
      expect(made[2].sound.threeDOptions).toBeUndefined();
    });

    it('ignores a turn after the voice is detached', () => {
      const { made, voices } = setup();
      const voice = voices.attach(track(), [1, 2, 3]);
      const before = made[0].sound.threeDOptions;

      voice.detach();
      voice.setFacing([1, 0, 0]);

      expect(made[0].sound.threeDOptions).toBe(before);
    });
  });

  describe('reverb send independent of distance', () => {
    // The voice's rolloff is inside its panner, ahead of the gain the send is
    // tapped from. 4 m from the listener: distance gain 0.25.
    function room() {
      const context = setup();
      context.defined.add('room');
      context.cacophony.listenerPosition = [0, 0, 0];
      return context;
    }

    function lastSend(sound: ReturnType<typeof makeVoiceSound>['sound']): unknown[] {
      return sound.routeTo.mock.calls[sound.routeTo.mock.calls.length - 1];
    }

    it('sends a positional voice at send / distance gain', () => {
      const { made, voices } = room();
      const voice = voices.attach(track(), [0, 0, 4]);

      voice.setRoute({ chain: 'room', send: 0.3 });

      expect(lastSend(made[0].sound)).toEqual(['room', expect.closeTo(1.2, 9)]);
    });

    it('re-gains the send in place when the speaker moves', () => {
      const { made, voices } = room();
      const voice = voices.attach(track(), [0, 0, 4]);
      voice.setRoute({ chain: 'room', send: 0.3 });

      voice.setPosition([0, 0, 2]);

      expect(lastSend(made[0].sound)).toEqual(['room', expect.closeTo(0.6, 9)]);
      expect(made[0].sound.removeSend).not.toHaveBeenCalled();
    });

    it('re-gains the send in place when the listener moves', () => {
      const { cacophony, made, voices } = room();
      const voice = voices.attach(track(), [0, 0, 4]);
      voice.setRoute({ chain: 'room', send: 0.3 });

      cacophony.listenerPosition = [0, 0, 2];
      voices.listenerMoved();

      expect(lastSend(made[0].sound)).toEqual(['room', expect.closeTo(0.6, 9)]);
      expect(made[0].sound.removeSend).not.toHaveBeenCalled();
    });

    it('caps the boost for a distant speaker', () => {
      const { made, voices } = room();
      const voice = voices.attach(track(), [0, 0, 1000]);

      voice.setRoute({ chain: 'room', send: 0.3 });

      expect(lastSend(made[0].sound)).toEqual([
        'room',
        expect.closeTo(0.3 * MAX_SEND_DISTANCE_BOOST, 9),
      ]);
    });

    it('recomputes when the send changes', () => {
      const { made, voices } = room();
      const voice = voices.attach(track(), [0, 0, 4]);
      voice.setRoute({ chain: 'room', send: 0.3 });

      voice.setRoute({ chain: 'room', send: 0.5 });

      expect(lastSend(made[0].sound)).toEqual(['room', expect.closeTo(2, 9)]);
    });

    it('applies when the chain is defined after the voice asked for it', () => {
      const { defined, made, voices } = room();
      defined.delete('room');
      const voice = voices.attach(track(), [0, 0, 4]);
      voice.setRoute({ chain: 'room', send: 0.3 });
      expect(made[0].sound.routeTo).not.toHaveBeenCalled();

      defined.add('room');
      voices.chainCreated('room');

      expect(lastSend(made[0].sound)).toEqual(['room', expect.closeTo(1.2, 9)]);
    });

    it('leaves a non-positional voice at its send, wherever the listener goes', () => {
      const { cacophony, made, voices } = room();
      const voice = voices.attach(track(), null);
      voice.setRoute({ chain: 'room', send: 0.3 });

      cacophony.listenerPosition = [0, 0, 50];
      voices.listenerMoved();

      expect(made[0].sound.routeTo).toHaveBeenCalledOnce();
      expect(made[0].sound.routeTo).toHaveBeenCalledWith('room', 0.3);
    });

    it('follows the voice between positional and non-positional', () => {
      const { made, voices } = room();
      const voice = voices.attach(track(), null);
      voice.setRoute({ chain: 'room', send: 0.3 });

      voice.setPosition([0, 0, 4]);
      expect(lastSend(made[1].sound)).toEqual(['room', expect.closeTo(1.2, 9)]);

      voice.setPosition(null);
      expect(lastSend(made[2].sound)).toEqual(['room', 0.3]);
    });

    it('makes no send call for a dry voice or a primary route', () => {
      const { cacophony, made, voices } = room();
      voices.attach(track(), [0, 0, 4]);
      const primary = voices.attach(track(), [0, 0, 4]);
      primary.setRoute({ chain: 'room' });

      cacophony.listenerPosition = [0, 0, 2];
      voices.listenerMoved();
      primary.setPosition([0, 0, 9]);

      expect(made[0].sound.routeTo).not.toHaveBeenCalled();
      expect(made[1].sound.routeTo).toHaveBeenCalledOnce();
      expect(made[1].sound.routeTo).toHaveBeenCalledWith('room');
    });
  });
});
