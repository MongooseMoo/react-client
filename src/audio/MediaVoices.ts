// Live voice streams (LiveKit participants) in the shared audio graph. A voice
// whose speaker is an entity in the current scene is an HRTF point source at
// that entity; any other voice (a phone call, a speaker in another room) is
// non-positional. Either can play through a named effect chain, like a
// Client.Media sound, but lives as long as the call and is never a media key.

import type { Cacophony, Position } from 'cacophony';

import { SPATIAL_PARAM_TAU_S } from './audioParamSmoothing';
import { SPATIAL_DISTANCE_MODEL } from './distanceModel';
import { clearNamedRoute, type NamedRouteState, routeNamedChain } from './namedRoute';

/** The named chain a voice plays through: primary, or an aux send when `send` is set. */
export interface VoiceRoute {
  readonly chain?: string;
  readonly send?: number;
}

/** Where a voice is heard from; `null` is nowhere: non-positional. */
export type VoicePosition = Position | null;

export interface MediaVoice {
  /**
   * Move the voice; the move is ramped over a short time constant. `null`
   * makes it non-positional (no direction, no distance attenuation), and a
   * position after `null` places it there directly.
   */
  setPosition(position: VoicePosition): void;
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

type VoiceSound = ReturnType<Cacophony['createMediaStreamSound']> & NamedRouteState;

const VOICE_PANNER = {
  // A mono panner input: the browser downmixes a stereo track before panning.
  channelCount: 1,
  channelCountMode: 'explicit',
  channelInterpretation: 'speakers',
  coneInnerAngle: 360,
  coneOuterAngle: 360,
  coneOuterGain: 0,
  distanceModel: 'inverse',
  panningModel: 'HRTF',
  refDistance: SPATIAL_DISTANCE_MODEL.refDistance,
  rolloffFactor: SPATIAL_DISTANCE_MODEL.rolloffFactor,
  maxDistance: SPATIAL_DISTANCE_MODEL.maxDistance,
} as const;

export class MediaVoices {
  private readonly voices = new Set<VoiceSound>();

  constructor(
    private readonly cacophony: Cacophony,
    private readonly chains: VoiceChains,
  ) {}

  attach(track: MediaStreamTrack, position: VoicePosition): MediaVoice {
    let sound = this.start(track, position);
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
          sound = this.restart(sound, track, next);
          positional = next !== null;
        } else if (next !== null) {
          sound.position = next;
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
   * distance model and no direction, wherever the listener stands or faces.
   */
  private start(track: MediaStreamTrack, position: VoicePosition): VoiceSound {
    track.enabled = true;
    const sound: VoiceSound = this.cacophony.createMediaStreamSound(new MediaStream([track]), {
      panType: position ? 'HRTF' : 'stereo',
      stopTracksOnStop: false,
    });
    if (position) {
      sound.threeDOptions = VOICE_PANNER;
      sound.position = position;
      // The first pose is immediate; once playing, moves ramp, which de-zippers
      // the per-frame steps the position tweener delivers.
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
  private restart(old: VoiceSound, track: MediaStreamTrack, position: VoicePosition): VoiceSound {
    const { namedChain, namedSend } = old;
    this.voices.delete(old);
    old.cleanup();
    const sound = this.start(track, position);
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
    const error = routeNamedChain(voice, chain, send, this.master());
    if (error) {
      console.warn(`Voice audio: chain '${chain}' unavailable; playing dry`, error);
    }
  }

  private master() {
    return this.cacophony.getBus('master');
  }
}
