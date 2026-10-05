// Live voice streams (LiveKit participants) in the shared audio graph. A voice
// whose speaker is an entity in the current scene is an HRTF point source at
// that entity, facing the way the entity faces; any other voice (a phone call,
// a speaker in another room) is non-positional. Either can play through a
// named effect chain, like a Client.Media sound, but lives as long as the call
// and is never a media key.

import type { Cacophony, Position } from 'cacophony';

import { SPATIAL_PARAM_TAU_S } from './audioParamSmoothing';
import {
  DEFAULT_SPATIAL_PROFILE,
  distanceBetween,
  distanceCompensatedSend,
  profileDistanceGain,
  profilePannerDistance,
} from './distanceModel';
import { clearNamedRoute, type NamedRouteState, routeNamedChain } from './namedRoute';

/** The named chain a voice plays through: primary, or an aux send when `send` is set. */
export interface VoiceRoute {
  readonly chain?: string;
  readonly send?: number;
}

/** Where a voice is heard from; `null` is nowhere: non-positional. */
export type VoicePosition = Position | null;

/**
 * The way a voice's speaker faces, in Web Audio axes; `null` is no facing,
 * which is heard equally from every side.
 */
export type VoiceFacing = Position | null;

export interface MediaVoice {
  /**
   * Move the voice; the move is ramped over a short time constant. `null`
   * makes it non-positional (no direction, no distance attenuation), and a
   * position after `null` places it there directly.
   */
  setPosition(position: VoicePosition): void;
  /**
   * Turn the voice; the turn is ramped like a move. It is kept while the voice
   * is non-positional, where it has no effect, for when the voice is placed.
   */
  setFacing(forward: VoiceFacing): void;
  /** A full description: an absent chain means dry. */
  setRoute(route: VoiceRoute): void;
  /** Remove the voice from the graph. The track is left running for its owner. */
  detach(): void;
}

/** What MediaVoices needs to know about named chains. */
export interface VoiceChains {
  hasChain(id: string): boolean;
  hasPendingChain(id: string): boolean;
}

type VoiceSound = ReturnType<Cacophony['createMediaStreamSound']> &
  NamedRouteState & {
    /** Where the voice is; absent for a non-positional voice. */
    voicePosition?: Position;
  };

/**
 * A speaker's cone, as PannerNode cone parameters (angles are full widths, in
 * degrees). Speech is directional but not sharply: the voice is at full level
 * within 60° either side of where the speaker faces, and falls evenly from
 * there to -6 dB directly behind.
 */
export const VOICE_CONE_INNER_ANGLE = 120;
/** The cone's falloff runs all the way round, so its lowest level is directly behind. */
export const VOICE_CONE_OUTER_ANGLE = 360;
/** -6 dB as a linear gain. */
export const VOICE_CONE_OUTER_GAIN = 10 ** (-6 / 20);

/**
 * Voices fall off with distance on the curve a media sound uses when it names
 * none. The panner's own distance model expresses that curve exactly, so it is
 * left to the panner; there is no separate distance gain for a voice.
 */
const VOICE_PROFILE = DEFAULT_SPATIAL_PROFILE;

const VOICE_PANNER = {
  // A mono panner input: the browser downmixes a stereo track before panning.
  channelCount: 1,
  channelCountMode: 'explicit',
  channelInterpretation: 'speakers',
  panningModel: 'HRTF',
  ...profilePannerDistance(VOICE_PROFILE),
} as const;

/** A usable facing: three finite components, not all zero. */
function facingOf(forward: VoiceFacing | undefined): VoiceFacing {
  if (!forward || forward.length < 3) {
    return null;
  }
  const length = Math.hypot(forward[0], forward[1], forward[2]);
  return Number.isFinite(length) && length > 0 ? [forward[0], forward[1], forward[2]] : null;
}

function sameFacing(a: VoiceFacing, b: VoiceFacing): boolean {
  return a === b || (a !== null && b !== null && a[0] === b[0] && a[1] === b[1] && a[2] === b[2]);
}

/** The panner's cone and orientation for a facing: the voice cone, or none. */
function facingOptions(facing: VoiceFacing) {
  if (!facing) {
    return {
      coneInnerAngle: VOICE_PROFILE.coneInnerAngle,
      coneOuterAngle: VOICE_PROFILE.coneOuterAngle,
      coneOuterGain: VOICE_PROFILE.coneOuterGain,
    };
  }
  return {
    coneInnerAngle: VOICE_CONE_INNER_ANGLE,
    coneOuterAngle: VOICE_CONE_OUTER_ANGLE,
    coneOuterGain: VOICE_CONE_OUTER_GAIN,
    orientationX: facing[0],
    orientationY: facing[1],
    orientationZ: facing[2],
  };
}

export class MediaVoices {
  private readonly voices = new Set<VoiceSound>();

  constructor(
    private readonly cacophony: Cacophony,
    private readonly chains: VoiceChains,
  ) {}

  attach(track: MediaStreamTrack, position: VoicePosition, forward: VoiceFacing = null): MediaVoice {
    let facing = facingOf(forward);
    let sound = this.start(track, position, facing);
    let positional = position !== null;

    void this.cacophony.resume().catch((error) => {
      console.warn('Voice audio: could not resume the audio context', error);
    });

    return {
      setPosition: (next) => {
        if (!this.voices.has(sound)) {
          return;
        }
        if ((next !== null) !== positional) {
          sound = this.restart(sound, track, next, facing);
          positional = next !== null;
        } else if (next !== null) {
          sound.position = next;
          sound.voicePosition = next;
          this.refreshSend(sound);
        }
      },
      setFacing: (next) => {
        const turned = facingOf(next);
        if (!this.voices.has(sound) || sameFacing(turned, facing)) {
          return;
        }
        facing = turned;
        if (positional) {
          sound.threeDOptions = facingOptions(facing);
        }
      },
      setRoute: (route) => {
        if (this.voices.has(sound)) {
          this.route(sound, route.chain || undefined, route.send);
        }
      },
      detach: () => {
        if (this.voices.delete(sound)) {
          sound.cleanup();
        }
      },
    };
  }

  /**
   * Put the track in the graph in the mode its position calls for. Cacophony
   * fixes a stream sound's panning mode when the sound is created. With a
   * position it is an HRTF point source. Without one it is a stereo source at
   * centre pan: the voice has no 3D panner at all, so it has no position, no
   * distance model, no cone and no direction, wherever the listener stands or
   * faces.
   */
  private start(track: MediaStreamTrack, position: VoicePosition, facing: VoiceFacing): VoiceSound {
    track.enabled = true;
    const sound: VoiceSound = this.cacophony.createMediaStreamSound(new MediaStream([track]), {
      panType: position ? 'HRTF' : 'stereo',
      stopTracksOnStop: false,
    });
    if (position) {
      sound.threeDOptions = { ...VOICE_PANNER, ...facingOptions(facing) };
      sound.position = position;
      sound.voicePosition = position;
      // The first pose is immediate; once playing, moves and turns ramp, which
      // de-zippers the per-frame steps the position and facing tweeners deliver.
      sound.spatialSmoothingTau = SPATIAL_PARAM_TAU_S;
    }
    sound.play();
    this.voices.add(sound);
    return sound;
  }

  /**
   * Swap a voice for one in the other panning mode: positional when its
   * speaker enters the scene, non-positional when the speaker leaves it. The
   * track keeps running and the new sound takes over the route the old one
   * had, or still wanted.
   */
  private restart(
    old: VoiceSound,
    track: MediaStreamTrack,
    position: VoicePosition,
    facing: VoiceFacing,
  ): VoiceSound {
    const { namedChain, namedSend } = old;
    this.voices.delete(old);
    old.cleanup();
    const sound = this.start(track, position, facing);
    this.route(sound, namedChain, namedSend);
    return sound;
  }

  /** A named chain now exists: voices that want it and are playing dry join it. */
  chainCreated(id: string): void {
    for (const voice of this.voices) {
      if (voice.namedChain === id && !voice.chainRouted) {
        this.route(voice, voice.namedChain, voice.namedSend);
      }
    }
  }

  /**
   * A named chain is about to be destroyed: its voices leave it first and keep
   * wanting it. Left to the bus drain, an aux send would land on master and
   * play the voice dry twice.
   */
  chainDestroying(id: string): void {
    for (const voice of this.voices) {
      if (voice.namedChain === id) {
        clearNamedRoute(voice, this.master());
      }
    }
  }

  /** The listener moved: every positional voice's distance gain changed with it. */
  listenerMoved(): void {
    for (const voice of this.voices) {
      this.refreshSend(voice);
    }
  }

  private route(voice: VoiceSound, chain: string | undefined, send: number | undefined): void {
    if (chain && !this.chains.hasChain(chain)) {
      // Not defined (yet): play dry and remember it for chainCreated.
      clearNamedRoute(voice, this.master());
      voice.namedChain = chain;
      voice.namedSend = send;
      if (!this.chains.hasPendingChain(chain)) {
        console.warn(`Voice audio: chain '${chain}' is not defined; playing dry until it is`);
      }
      return;
    }
    const error = routeNamedChain(voice, chain, send, this.master(), this.sendGain(voice, send));
    if (error) {
      console.warn(`Voice audio: chain '${chain}' unavailable; playing dry`, error);
    }
  }

  /**
   * The gain for a voice's send to its chain. A positional voice's distance
   * rolloff is inside its panner, which is ahead of the gain node Cacophony
   * taps a send from: left alone, a voice's reverb would fall with distance as
   * fast as the voice itself. The panner's distance gain cannot be read back,
   * so it is computed here from the same profile and the same positions the
   * panner is given, and divided out of the send, as for a media sound.
   * A non-positional voice has no distance gain.
   */
  private sendGain(voice: VoiceSound, send: number | undefined): number | undefined {
    if (send === undefined || !voice.voicePosition) {
      return send;
    }
    const distance = distanceBetween(this.cacophony.listenerPosition, voice.voicePosition);
    return distanceCompensatedSend(send, profileDistanceGain(distance, VOICE_PROFILE));
  }

  /** Bring a live send up to date with the voice's distance; a send that is not live is left alone. */
  private refreshSend(voice: VoiceSound): void {
    if (voice.chainRouted && voice.namedSend !== undefined) {
      this.route(voice, voice.namedChain, voice.namedSend);
    }
  }

  private master() {
    return this.cacophony.getBus('master');
  }
}
