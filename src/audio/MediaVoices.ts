// Live voice streams (LiveKit participants) in the shared audio graph: each is
// an HRTF point source that can play through a named effect chain, like a
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

export interface MediaVoice {
  /** Move the voice; the move is ramped over a short time constant. */
  setPosition(position: Position): void;
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

  attach(track: MediaStreamTrack, position: Position): MediaVoice {
    track.enabled = true;
    const sound: VoiceSound = this.cacophony.createMediaStreamSound(new MediaStream([track]), {
      panType: 'HRTF',
      stopTracksOnStop: false,
    });
    sound.threeDOptions = VOICE_PANNER;
    sound.position = position;
    // The first pose is immediate; once playing, moves ramp, which de-zippers
    // the per-frame steps the position tweener delivers.
    sound.spatialSmoothingTau = SPATIAL_PARAM_TAU_S;
    sound.play();
    this.voices.add(sound);

    void this.cacophony.resume().catch((error) => {
      console.warn('Voice audio: could not resume the audio context', error);
    });

    return {
      setPosition: (next) => {
        if (this.voices.has(sound)) {
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
