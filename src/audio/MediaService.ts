import {
  Cacophony,
  type AudioNode as CacophonyAudioNode,
  type Playback,
  type Position,
  type Sound,
} from 'cacophony';

import { usePreferences } from '../stores/preferencesStore';
import { AmbisonicRenderer } from './AmbisonicRenderer';
import {
  type AudioCatalogIds,
  type AudioCategory,
  type AudioDiagnosticError,
  type AudioStage,
  AudioDiagnosticsRing,
  classifyLoadError,
  errorMessage,
} from './audioDiagnostics';
import type { PositionalFoaRenderer } from './PositionalFoaRenderer';
import {
  DEFAULT_SPATIAL_PROFILE,
  distanceBetween,
  profileDistanceGain,
  type SpatialProfile,
} from './distanceModel';
import { type MediaVoice, MediaVoices } from './MediaVoices';
import { clearNamedRoute, type NamedRouteState, routeNamedChain } from './namedRoute';
import { hasOcclusion, OCCLUSION_GLIDE_MS } from './occlusion';
import { VectorTweener } from './vectorTween';
import type { EffectChain } from './effects/EffectChain';
import { MediaEffects } from './effects/MediaEffects';
import type { EffectSpec } from './effects/types';
import { MediaSessionController } from './MediaSessionController';

const CORS_PROXY = 'https://mongoose.world:9080/?url=';
type CacophonySoundKind = NonNullable<Parameters<Cacophony['createSound']>[1]>;
const CACOPHONY_BUFFER = 'buffer' satisfies CacophonySoundKind;
const CACOPHONY_HTML = 'html' satisfies CacophonySoundKind;
const MAX_PRELOADED_SOUNDS = 32;

/** Constant makeup gain restoring the clean positional FOA decode to a useful level. Tune by ear.
 *  The SN3D encode + SH-HRIR binaural decode lands well below unity, so a positioned source is
 *  noticeably quiet even at distance 0 (live: peak ~30% at makeup 1), so ~3 (~+9.5 dB) targets a
 *  near-unity peak. Tune down if it clips; the master bus limiter should catch occasional peaks. */
const POSITIONAL_FOA_MAKEUP = 3;
/** Angular width (radians) of a stereo world source: L/R are encoded at ±half this around the bearing. */
const POSITIONAL_FOA_STEREO_WIDTH_RAD = 0.6;

export interface ClientMediaLoadPayload {
  readonly url?: string;
  readonly name: string;
  readonly type?: MediaType;
}

export type MediaType = 'sound' | 'music' | 'video';

export interface ClientMediaPlayPayload {
  readonly name: string;
  readonly url?: string;
  readonly type?: MediaType;
  readonly tag?: string;
  readonly volume?: number;
  readonly fadein?: number;
  readonly fadeout?: number;
  /** Join cursor: absolute source ms where the first pass starts. */
  readonly start?: number;
  /** Repeat window start: absolute source ms where later passes start (default: start). */
  readonly loopStart?: number;
  /** Window end: absolute source ms, exclusive. */
  readonly finish?: number;
  /** Plays remaining, counted from start; -1 loops forever. */
  readonly loops?: number;
  readonly priority?: number;
  readonly continue?: boolean;
  key?: string;
  readonly end?: number;
  readonly is3d?: boolean;
  readonly pan?: number;
  readonly position?: number[];
  readonly upmix?: string;
  readonly channels?: number;
  readonly chain?: string;
  readonly send?: number;
  /** How obstructed this voice's direct path is, 0 (clear) to 1; absent on a Play means 0. */
  readonly occlusion?: number;
  readonly effects?: EffectSpec[];
  /** Catalog gain in dB (-60..12); multiplies with volume. */
  readonly gainDb?: number;
  /** Catalog pitch in semitones (-24..24); playback rate 2^(st/12). */
  readonly pitchSemitones?: number;
  /** Distance/cone profile for a positioned sound. */
  readonly spatial?: SpatialProfile;
  /** Unit facing vector for a directional cone (converted to Web Audio axes by the handler). */
  readonly orientation?: number[];
  readonly title?: string;
  readonly artist?: string;
  readonly album?: string;
  readonly artwork?: MediaImage[];
  /** Catalog provenance, recorded in diagnostics only. */
  readonly catalog?: AudioCatalogIds;
}

export interface ClientMediaStopPayload {
  readonly name?: string;
  readonly type?: MediaType;
  readonly tag?: string;
  readonly priority?: number;
  readonly key?: string;
}

export interface ClientMediaUpdatePayload {
  readonly name?: string;
  readonly url?: string;
  readonly type?: MediaType;
  readonly tag?: string;
  readonly volume?: number;
  readonly fadein?: number;
  readonly fadeout?: number;
  readonly start?: number;
  readonly loopStart?: number;
  readonly finish?: number;
  readonly loops?: number;
  readonly priority?: number;
  readonly continue?: boolean;
  key?: string;
  readonly end?: number;
  readonly is3d?: boolean;
  readonly pan?: number;
  readonly position?: number[];
  readonly upmix?: string;
  readonly channels?: number;
  readonly chain?: string;
  readonly send?: number;
  /** New occlusion amount, 0..1; absent on an Update keeps the current one. */
  readonly occlusion?: number;
  readonly effects?: EffectSpec[];
  readonly gainDb?: number;
  readonly pitchSemitones?: number;
  readonly spatial?: SpatialProfile;
  readonly orientation?: number[];
}

/**
 * The MCMP play window, as absolute file positions in milliseconds. The first
 * pass plays start..finish; later passes play loopStart..finish.
 */
interface MediaSegment {
  readonly start: number;
  /** Repeat window start, at or before start. */
  readonly loopStart: number;
  readonly finish?: number;
}

export interface ClientMediaChainPayload {
  readonly id: string;
  readonly effects?: EffectSpec[];
  readonly preset?: string;
  readonly gain?: number;
  readonly fadein?: number;
}

export interface ClientMediaChainStopPayload {
  readonly id: string;
}

export interface ClientMediaAutomatePayload {
  readonly chain?: string;
  readonly key?: string;
  readonly target: string | number;
  readonly params?: Record<string, number | string>;
  readonly ramp?: number;
  readonly curve?: 'linear' | 'exponential';
  readonly bypass?: boolean;
}

export interface ClientMediaListenerOrientationPayload {
  readonly up?: Position;
  readonly forward?: Position;
}

export interface ClientMediaListenerPositionPayload {
  readonly position?: Position;
}

export interface ExtendedSound extends Sound, NamedRouteState {
  ambisonicRenderer?: AmbisonicRenderer;
  positionalFoa?: PositionalFoaRenderer;
  inputChannels?: number;
  mediaName?: string;
  mediaPosition?: Position;
  priority?: number;
  tag?: string;
  key?: string;
  mediaType?: MediaType;
  upmix?: string;
  effectChain?: EffectChain;
  effectGeneration?: number;
  /** The requested play window; a buffer sound realizes it as a Cacophony region. */
  segment?: MediaSegment;
  /** Last MCMP loop count; drives timer-based segment repeats for region-less sounds. */
  segmentLoops?: number;
  /** Pending finish/repeat timer for a region-less segment. */
  segmentTimer?: ReturnType<typeof setTimeout>;
  /** The Play that started this sound, so an Update can move its segment. */
  playPayload?: ClientMediaPlayPayload;
  /** Wire volume as a 0..1 multiplier (percent / 100); floats arrive on door-projected copies. */
  mediaVolume?: number;
  /** Catalog gain in dB; multiplies with volume. */
  gainDb?: number;
  /** Requested occlusion amount (0..1); absent = 0. Rendered per Playback, never in the gain. */
  occlusion?: number;
  /** Distance/cone profile; absent = {@link DEFAULT_SPATIAL_PROFILE}. */
  spatialProfile?: SpatialProfile;
  /** Cone facing, in Web Audio axes. */
  mediaOrientation?: Position;
  /** The scene (room) {@link mediaPosition} was given in; a position from an earlier scene is not a glide origin. */
  positionScene?: number;
  /** Positioned by the HRTF panner, so its distance gain is applied at the sound's gain. */
  pointSource?: boolean;
  /** The key claim generation that created this sound (diagnostics). */
  generation?: number;
}

/** A pending load's claim on a media key; a newer claim, Stop, or reset makes it stale. */
interface KeyClaim {
  readonly generation: number;
  readonly name: string;
  readonly tag?: string;
  readonly type?: MediaType;
}

interface KeyTicket {
  readonly generation: number;
  /** True while this claim is still the latest for its key and no reset intervened. */
  current(): boolean;
  /** Drop the pending-load record once the load has settled. */
  finish(): void;
}

function finiteMs(value: number | undefined): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, value) : undefined;
}

/** Contract default until messages carry a category: music → music, anything else → effects. */
function mediaCategory(type: MediaType | undefined): AudioCategory {
  return type === 'music' ? 'music' : 'effects';
}

interface MediaServiceOptions {
  manageFocus?: boolean;
  /** Override the sound-position tweener (tests inject a manually-clocked one). */
  motion?: VectorTweener;
}

export class MediaService {
  readonly cacophony: Cacophony;
  sounds: Record<string, ExtendedSound> = {};
  defaultUrl = '';
  /** The last 500 stage transitions and failures, for the Audio diagnostics view. */
  readonly diagnostics = new AudioDiagnosticsRing();

  private readonly cleanedSounds = new WeakSet<ExtendedSound>();
  /** Glides server-sent sound positions (keyed by sound) instead of snapping. */
  private readonly motion: VectorTweener;
  private readonly effects: MediaEffects;
  private readonly voices: MediaVoices;
  private readonly mediaSession = new MediaSessionController();
  private readonly preloadedSoundKeys = new Set<string>();
  /** Latest claim generation per media key; every Play/Load/Stop for a key bumps it. */
  private readonly keyGenerations = new Map<string, number>();
  /** Loads that have claimed a key but not yet settled, so Stop can cancel them. */
  private readonly pendingLoads = new Map<string, KeyClaim>();
  /** Bumped by stop-all/reset: invalidates every pending load at once. */
  private epoch = 0;
  /** Bumped by every scene snapshot; each room has its own coordinate origin. */
  private scene = 0;
  private currentMusic?: ExtendedSound;
  private globalMuted = false;
  private isWindowFocused = true;
  private readonly manageFocus: boolean;
  private unsubscribePreferences: (() => void) | null = null;
  private shutdownComplete = false;

  constructor(cacophony: Cacophony = new Cacophony(), options: MediaServiceOptions = {}) {
    this.cacophony = cacophony;
    this.effects = new MediaEffects(this.cacophony, {
      chainCreated: (id) => this.voices.chainCreated(id),
      chainDestroying: (id) => this.voices.chainDestroying(id),
    });
    this.voices = new MediaVoices(this.cacophony, this.effects);
    this.manageFocus = options.manageFocus ?? true;
    this.motion = options.motion ?? new VectorTweener();

    this.setGlobalVolume(usePreferences.getState().sound.volume);
    if (this.manageFocus && typeof window !== 'undefined') {
      window.addEventListener('focus', this.handleWindowFocus);
      window.addEventListener('blur', this.handleWindowBlur);
    }

    this.unsubscribePreferences = usePreferences.subscribe(
      (state) => state.sound.muteInBackground,
      () => {
        this.updateBackgroundMuteState();
      },
    );
  }

  get muted(): boolean {
    return this.cacophony.muted;
  }

  setGlobalVolume(volume: number): void {
    this.cacophony.setGlobalVolume(volume);
  }

  setGlobalMute(muted: boolean): void {
    this.globalMuted = muted;
    this.updateBackgroundMuteState();
  }

  updateBackgroundMuteState(): void {
    const prefs = usePreferences.getState();
    const shouldMuteInBackground = prefs.sound.muteInBackground && !this.isWindowFocused;
    this.cacophony.muted = this.globalMuted || shouldMuteInBackground;
  }

  setListenerPosition(position: Position | null | undefined): void {
    if (position?.length) {
      this.cacophony.listenerPosition = position;
      for (const sound of this.allSounds) {
        this.updateAmbisonicDistance(sound);
        this.updatePositionalSpatial(sound);
        this.applyLevels(sound);
      }
    }
  }

  /**
   * A Client.Spatial.Scene snapshot arrived: a hard cut, usually a room change.
   * Sound positions glide on this service's own tweener, which the Spatial
   * handler's cancel does not reach. Glides in flight land on their targets at
   * once (the last position the server gave, never somewhere part-way), and
   * the next position each sound receives is placed directly: its previous one
   * was in another room's coordinates, so there is nothing to glide from.
   */
  sceneChanged(): void {
    this.scene += 1;
    this.motion.finishAll();
  }

  /** The sound's distance gain under its spatial profile, for the current listener. */
  private distanceGain(sound: ExtendedSound): number {
    const distance = distanceBetween(this.cacophony.listenerPosition, sound.mediaPosition);
    return profileDistanceGain(distance, sound.spatialProfile ?? DEFAULT_SPATIAL_PROFILE);
  }

  /**
   * Recompute an ambisonic source's distance attenuation from the current
   * listener position. The ambisonic route has no panner, so we drive its
   * pre-encoder gain with the sound's profile curve ({@link profileDistanceGain}).
   */
  private updateAmbisonicDistance(sound: ExtendedSound): void {
    if (!sound.ambisonicRenderer) {
      return;
    }
    sound.ambisonicRenderer.setDistanceGain(this.distanceGain(sound));
  }

  /**
   * Set the sound's gain: wire volume × 10^(gainDb/20) × (for an HRTF point
   * source) its profile distance gain. This is the one stage where distance
   * falloff is applied on the HRTF route; the panner's rolloff is 0. Ambisonic
   * routes apply distance in their renderer instead.
   */
  private applyLevels(sound: ExtendedSound): void {
    if (this.cleanedSounds.has(sound)) {
      return;
    }
    const volume = sound.mediaVolume ?? 1;
    const gain = sound.gainDb ? 10 ** (sound.gainDb / 20) : 1;
    const distance = sound.pointSource && sound.upmix !== 'ambisonic' ? this.distanceGain(sound) : 1;
    sound.volume = volume * gain * distance;
  }

  /** HRTF panner settings for a point source: position and cone only, no native rolloff. */
  private pannerOptions(sound: ExtendedSound) {
    const profile = sound.spatialProfile ?? DEFAULT_SPATIAL_PROFILE;
    const orientation = sound.mediaOrientation;
    return {
      coneInnerAngle: profile.coneInnerAngle,
      coneOuterAngle: profile.coneOuterAngle,
      coneOuterGain: profile.coneOuterGain,
      panningModel: 'HRTF' as const,
      distanceModel: 'inverse' as const,
      refDistance: profile.refDistance,
      rolloffFactor: 0,
      maxDistance: profile.maxDistance,
      ...(orientation
        ? { orientationX: orientation[0], orientationY: orientation[1], orientationZ: orientation[2] }
        : {}),
    };
  }

  setListenerOrientation(
    orientation: { forward?: Position | null; up?: Position | null } | null | undefined,
  ): void {
    if (orientation?.forward?.length) {
      this.cacophony.listenerForwardOrientation = orientation.forward;
    }
    if (orientation?.up?.length) {
      this.cacophony.listenerUpOrientation = orientation.up;
    }
    this.syncAmbisonicRendererYaw();
    for (const sound of this.allSounds) {
      this.updatePositionalSpatial(sound);
    }
  }

  /**
   * Put a live voice track (a LiveKit participant) in the graph as an HRTF
   * point source. It is not a media key: Client.Media.Stop never touches it.
   */
  attachVoice(track: MediaStreamTrack, position: Position): MediaVoice {
    return this.voices.attach(track, position);
  }

  setChain(data: ClientMediaChainPayload): Promise<void> {
    return this.effects.setChain(data);
  }

  removeChain(id: string): void {
    this.effects.removeChain(id);
  }

  automate(data: ClientMediaAutomatePayload): void {
    if (data.chain && this.effects.hasPendingChain(data.chain)) {
      // Apply after the chain's outstanding definition, never to a stale graph.
      void this.effects.whenChainReady(data.chain).then(() => this.applyAutomation(data));
      return;
    }
    this.applyAutomation(data);
  }

  private applyAutomation(data: ClientMediaAutomatePayload): void {
    const chain = this.resolveAutomateTarget(data);
    if (!chain) {
      console.warn('Client.Media.Automate: target chain/sound not found; ignored');
      return;
    }
    // The MOO sends an explicit bypass alongside params; apply both.
    if (typeof data.bypass === 'boolean') {
      chain.setBypass(data.target, data.bypass);
    }
    if (data.params) {
      chain.automate(data.target, data.params, { duration: data.ramp, curve: data.curve });
    }
  }

  handleDefault(url: string): void {
    this.defaultUrl = url;
  }

  /** Record a stage for a payload that has not produced a sound yet. */
  private tracePayload(
    stage: AudioStage,
    data: Pick<ClientMediaPlayPayload, 'name' | 'type' | 'catalog'>,
    key: string,
    generation: number,
    error?: AudioDiagnosticError,
  ): void {
    this.diagnostics.record({
      stage,
      key,
      name: data.name,
      generation,
      category: mediaCategory(data.type),
      catalog: data.catalog,
      error,
    });
  }

  /** Record a stage for an existing sound. */
  private traceSound(
    stage: AudioStage,
    sound: ExtendedSound,
    key = sound.key,
    error?: AudioDiagnosticError,
  ): void {
    this.diagnostics.record({
      stage,
      key,
      name: sound.mediaName,
      generation: sound.generation,
      category: mediaCategory(sound.mediaType),
      catalog: sound.playPayload?.catalog,
      error,
    });
  }

  async load(data: ClientMediaLoadPayload): Promise<void> {
    const url = this.mediaUrl(data);
    const key = url;
    if (this.sounds[key] || this.pendingLoads.has(key)) {
      return;
    }
    const ticket = this.claimKey(key, { name: data.name, type: data.type });
    try {
      this.tracePayload('loading', data, key, ticket.generation);
      let sound: ExtendedSound;
      try {
        sound = (await this.cacophony.createSound(url)) as ExtendedSound;
      } catch (error) {
        this.tracePayload('loading', data, key, ticket.generation, {
          code: classifyLoadError(error),
          message: errorMessage(error),
        });
        throw error;
      }
      if (!ticket.current() || this.sounds[key]) {
        // A Play, Stop, or reset for this key arrived while we were loading.
        this.tracePayload('decoded', data, key, ticket.generation, { code: 'STALE_GENERATION' });
        this.releaseSound(sound);
        return;
      }

      while (this.preloadedSoundKeys.size >= MAX_PRELOADED_SOUNDS) {
        const oldestKey = this.preloadedSoundKeys.values().next().value;
        if (oldestKey === undefined) {
          break;
        }
        this.preloadedSoundKeys.delete(oldestKey);
        const oldestSound = this.sounds[oldestKey];
        if (oldestSound) {
          this.releaseSound(oldestSound, oldestKey, {
            code: 'CAPACITY',
            message: `preload cache full (${MAX_PRELOADED_SOUNDS})`,
          });
        }
      }

      sound.key = key;
      sound.mediaName = data.name;
      sound.generation = ticket.generation;
      this.tracePayload('decoded', data, key, ticket.generation);
      this.sounds[key] = sound;
      this.preloadedSoundKeys.add(key);
    } finally {
      ticket.finish();
    }
  }

  /**
   * Claim a media key before any await. The claim's generation supersedes
   * every earlier claim for the key, so a later Play always wins over an
   * in-flight earlier load; Stop and reset invalidate it as well.
   */
  private claimKey(key: string, meta: Omit<KeyClaim, 'generation'>): KeyTicket {
    const generation = (this.keyGenerations.get(key) ?? 0) + 1;
    this.keyGenerations.set(key, generation);
    const claim: KeyClaim = { ...meta, generation };
    this.pendingLoads.set(key, claim);
    const epoch = this.epoch;
    return {
      generation,
      current: () => this.keyGenerations.get(key) === generation && this.epoch === epoch,
      finish: () => {
        if (this.pendingLoads.get(key) === claim) {
          this.pendingLoads.delete(key);
        }
      },
    };
  }

  /** Supersede whatever claim holds `key`, so its pending load never plays. */
  private cancelKey(key: string): void {
    this.keyGenerations.set(key, (this.keyGenerations.get(key) ?? 0) + 1);
    this.pendingLoads.delete(key);
  }

  mediaUrl(data: ClientMediaPlayPayload): string {
    let mediaUrl = this.resolvedUrl(data);
    if (data.type?.toLowerCase() === 'music') {
      mediaUrl = CORS_PROXY + encodeURIComponent(mediaUrl);
    }
    return mediaUrl;
  }

  async play(data: ClientMediaPlayPayload): Promise<void> {
    const mediaUrl = this.mediaUrl(data);
    data.key = data.key || mediaUrl;
    const soundKey = data.key;
    // Claim the key before any await: a later Play for this key, a Stop, or a
    // reset makes this call stale, and every continuation below checks that.
    const ticket = this.claimKey(soundKey, { name: data.name, tag: data.tag, type: data.type });
    try {
      await this.playClaimed(data, soundKey, mediaUrl, ticket);
    } finally {
      ticket.finish();
    }
  }

  private async playClaimed(
    data: ClientMediaPlayPayload,
    soundKey: string,
    mediaUrl: string,
    ticket: KeyTicket,
  ): Promise<void> {
    let sound: ExtendedSound | undefined = this.sounds[soundKey];
    this.preloadedSoundKeys.delete(soundKey);
    const panType = data.is3d ? 'HRTF' : 'stereo';
    const segment = this.requestedSegment(data);
    const isNewSound =
      !sound ||
      sound.url !== mediaUrl ||
      !this.sameSegment(sound.segment, segment) ||
      data.continue === false;
    if (!sound || isNewSound) {
      if (sound) {
        this.releaseSound(sound, soundKey);
      }
      sound = await this.createMediaSound(data, soundKey, mediaUrl, panType, segment, ticket);
      if (!sound) {
        return;
      }
      sound.segment = segment;
    }

    sound.key = soundKey;
    sound.mediaName = data.name;
    sound.playPayload = data;
    sound.generation = ticket.generation;
    this.assignSoundMetadata(sound, data);
    this.sounds[soundKey] = sound;
    this.applySoundState(sound, data);
    // A Play is full state: without the field the voice is clear, so a listener
    // who walks through the door and is re-Played the sound direct hears it open up.
    const occlusion = data.occlusion ?? 0;
    const occlusionChanged = occlusion !== (sound.occlusion ?? 0);
    sound.occlusion = occlusion;
    if (occlusionChanged && sound.isPlaying) {
      // Same key and source: the voice is kept, so it glides (a door moving mid-sound).
      this.renderOcclusion(sound, sound.playbacks, OCCLUSION_GLIDE_MS);
    }
    // A voice that is not playing yet gets the amount in startVoice, before its first sample.

    // Route before the voice starts, so it is never heard dry: wait for a
    // Chain definition that is still building, and for inline effects.
    if (data.chain) {
      await this.effects.whenChainReady(data.chain);
      if (!ticket.current()) {
        this.tracePayload('routed', data, soundKey, ticket.generation, { code: 'STALE_GENERATION' });
        return;
      }
    }
    await this.applyEffectRouting(sound, soundKey, data, 'play');
    if (!ticket.current() || this.sounds[soundKey] !== sound) {
      this.tracePayload('routed', data, soundKey, ticket.generation, { code: 'STALE_GENERATION' });
      return;
    }
    this.traceSound('routed', sound);

    if (sound.isPlaying) {
      // Same key and source: keep the voice. An explicit start still seeks.
      if (data.start !== undefined) {
        this.seekToPosition(sound, data.start);
      }
    } else {
      const playback = this.startVoice(sound, soundKey, data);
      this.scheduleSegmentTimer(sound, soundKey);

      if (playback && data.upmix === 'ambisonic') {
        const inputChannels = this.resolveAmbisonicInputChannels(sound, data);
        const target = await this.resolveAmbisonicTarget(sound, soundKey, data);
        if (inputChannels === 4) {
          // True 4-channel FOA content: decode + head-rotate the recorded field.
          await this.configureAmbisonicPlayback(sound, playback, inputChannels, target, soundKey);
        } else {
          // Mono/stereo world object: physically-correct positional encode (clean path).
          // Stereo content keeps its width (L/R spread); mono stays a point.
          const width = inputChannels >= 2 ? POSITIONAL_FOA_STEREO_WIDTH_RAD : 0;
          await this.configurePositionalFoa(sound, playback, width, target, soundKey);
        }
      }
    }

    if (data.type === 'music' && this.sounds[soundKey] === sound) {
      this.activateMusicSession(sound, data);
    }
  }

  /** Create the source (and its region sprite) for a Play; undefined if the claim went stale. */
  private async createMediaSound(
    data: ClientMediaPlayPayload,
    soundKey: string,
    mediaUrl: string,
    panType: 'HRTF' | 'stereo',
    segment: MediaSegment | undefined,
    ticket: KeyTicket,
  ): Promise<ExtendedSound | undefined> {
    const kind = data.type === 'music' ? CACOPHONY_HTML : CACOPHONY_BUFFER;
    this.tracePayload('loading', data, soundKey, ticket.generation);
    let sound: ExtendedSound;
    try {
      sound = (await this.cacophony.createSound(mediaUrl, kind, panType)) as ExtendedSound;
    } catch (error) {
      this.tracePayload('loading', data, soundKey, ticket.generation, {
        code: classifyLoadError(error),
        message: errorMessage(error),
      });
      throw error;
    }
    if (ticket.current() && segment && kind === CACOPHONY_BUFFER) {
      const regionError = this.regionOutOfRange(sound, segment);
      if (regionError) {
        this.tracePayload('decoded', data, soundKey, ticket.generation, regionError);
      }
      sound = await this.segmentSound(sound, segment, panType);
    }
    if (!ticket.current()) {
      // Superseded by a later Play, a Stop, or a reset: release only our own source.
      this.tracePayload('decoded', data, soundKey, ticket.generation, {
        code: 'STALE_GENERATION',
      });
      this.releaseSound(sound);
      return undefined;
    }
    this.tracePayload('decoded', data, soundKey, ticket.generation);
    return sound;
  }

  /**
   * A requested region that the decoded buffer cannot hold. A bound off by at
   * most one decoded sample is rounding; anything more is REGION_OUT_OF_RANGE.
   * Diagnostic only: segmentSound still clamps the region to the buffer.
   */
  private regionOutOfRange(
    sound: ExtendedSound,
    segment: MediaSegment,
  ): AudioDiagnosticError | undefined {
    const buffer = sound.buffer;
    if (!buffer) {
      return undefined;
    }
    const sample = 1 / (buffer.sampleRate || this.cacophony.context.sampleRate);
    const start = segment.start / 1000;
    const finish = segment.finish === undefined ? undefined : segment.finish / 1000;
    if (start > buffer.duration + sample || (finish !== undefined && finish > buffer.duration + sample)) {
      return {
        code: 'REGION_OUT_OF_RANGE',
        message: `region ${segment.start}..${segment.finish ?? 'end'} ms exceeds decoded ${Math.round(buffer.duration * 1000)} ms`,
      };
    }
    return undefined;
  }

  /**
   * Start a fresh voice at the Play's cursor: prepare a stopped Playback,
   * position it, then start it. Cacophony 0.33 `PlayOptions` has no start
   * offset, so the offset is set on the prepared Playback (whose `play()`
   * starts from it) rather than seeking a voice that is already audible.
   */
  private startVoice(
    sound: ExtendedSound,
    soundKey: string,
    data: ClientMediaPlayPayload,
  ): Playback | undefined {
    const voices = sound.preplay();
    const [playback] = voices;
    this.releaseSoundWhenPlaybackEnds(sound, soundKey);
    if (!playback) {
      return undefined;
    }
    if (sound.occlusion) {
      // A fresh Playback is clear (0). Occlude it while it is still stopped, so
      // a sound that starts behind a closed door never leaks an unfiltered attack.
      this.renderOcclusion(sound, voices, 0);
    }
    const offset = data.start === undefined ? 0 : this.soundOffsetSeconds(sound, data.start);
    if (offset > 0) {
      try {
        playback.seek(offset);
      } catch (error) {
        console.warn(`Client.Media: cannot start '${soundKey}' at ${offset}s; starting at 0`, error);
        this.traceSound('started', sound, soundKey, {
          code: 'SEEK_UNAVAILABLE',
          message: `cannot start at ${offset}s: ${errorMessage(error)}`,
        });
      }
    }
    playback.play({
      fadeIn: data.fadein || undefined,
      fadeOut: data.fadeout || undefined,
    });
    this.traceSound('started', sound, soundKey);
    return playback;
  }

  /**
   * Move `voices` to the sound's occlusion amount over `durationMs`. Cacophony
   * renders occlusion per Playback (a Sound does not forward it), in a stage
   * of its own between the voice's effects and its panner. Everything this
   * service re-routes (named chains, inline effect buses, the FOA renderers)
   * hangs off the Playback's output, downstream of that stage, and a seek or
   * loop restart keeps the stage with its Playback, so the amount only needs
   * applying when a voice is prepared and when the amount changes. It is
   * independent of {@link applyLevels}: volume, fades and distance never fold in.
   */
  private renderOcclusion(
    sound: ExtendedSound,
    voices: readonly Playback[],
    durationMs: number,
  ): void {
    const amount = sound.occlusion ?? 0;
    for (const voice of voices) {
      let failure: string | undefined;
      if (hasOcclusion(voice)) {
        try {
          voice.setOcclusion(amount, durationMs);
        } catch (error) {
          failure = errorMessage(error);
        }
      } else {
        failure = 'the audio engine has no per-voice occlusion';
      }
      if (failure !== undefined) {
        console.warn(`Client.Media: occlusion unavailable for '${sound.key}'; playing unoccluded`);
        this.traceSound('routed', sound, sound.key, {
          code: 'CAPABILITY_UNAVAILABLE',
          message: `occlusion ${amount} unavailable; playing unoccluded: ${failure}`,
        });
      }
    }
  }

  update(data: ClientMediaUpdatePayload): void {
    const targetSounds = data.key
      ? this.soundsByKey(data.key)
      : data.name
        ? this.soundsByName(data.name)
        : [];

    targetSounds.forEach((sound) => {
      if (this.resegment(sound, data)) {
        return;
      }
      this.assignSoundMetadata(sound, {
        key: data.key ?? sound.key,
        tag: data.tag ?? sound.tag,
        type: data.type ?? sound.mediaType,
        upmix: data.upmix ?? sound.upmix,
        channels: data.channels ?? sound.inputChannels,
      });
      this.applySoundState(sound, data);
      if (data.occlusion !== undefined) {
        sound.occlusion = data.occlusion;
        this.renderOcclusion(sound, sound.playbacks, OCCLUSION_GLIDE_MS);
      }
      // Only an explicit start moves the playhead; no other Update field seeks or restarts.
      if (data.start !== undefined) {
        this.seekToPosition(sound, data.start);
      }
      void this.applyEffectRouting(sound, sound.key ?? data.key ?? '', data, 'update').catch(
        (error) => console.error('Client.Media.Update: effect routing failed', error),
      );
      const [playback] = sound.playbacks;
      if (data.upmix === 'ambisonic' && playback) {
        const inputChannels = this.resolveAmbisonicInputChannels(sound, data);
        if (inputChannels === 4) {
          this.configureAmbisonicPlayback(sound, playback, inputChannels).catch(console.error);
        } else {
          const width = inputChannels >= 2 ? POSITIONAL_FOA_STEREO_WIDTH_RAD : 0;
          this.configurePositionalFoa(sound, playback, width).catch(console.error);
        }
      } else if (data.upmix && data.upmix !== 'ambisonic') {
        this.cleanupUpmix(sound);
      }
      const soundKey = sound.key ?? data.key;
      if (soundKey) {
        sound.key = soundKey;
        this.sounds[soundKey] = sound;
      }
    });
  }

  /**
   * Stop the union of the given selectors (`{}` stops everything), including
   * loads that have claimed a matching key but not yet started.
   */
  stop(data: ClientMediaStopPayload): void {
    if (!data.name && !data.type && !data.tag && !data.key) {
      this.stopAllSounds();
      return;
    }
    for (const [key, claim] of [...this.pendingLoads]) {
      if (
        key === data.key ||
        (data.name !== undefined && claim.name === data.name) ||
        (data.tag !== undefined && claim.tag === data.tag) ||
        (data.type !== undefined && claim.type === data.type)
      ) {
        this.cancelKey(key);
      }
    }
    const selected = new Set<ExtendedSound>([
      ...(data.name ? this.soundsByName(data.name) : []),
      ...(data.type ? this.soundsByType(data.type) : []),
      ...(data.tag ? this.soundsByTag(data.tag) : []),
      ...(data.key ? this.soundsByKey(data.key) : []),
    ]);
    selected.forEach((sound) => {
      this.stopSound(sound);
    });
  }

  soundsByName(name: string): ExtendedSound[] {
    return Object.values(this.sounds).filter((sound) => sound.mediaName === name);
  }

  soundsByKey(key: string): ExtendedSound[] {
    return Object.values(this.sounds).filter((sound) => sound.key === key);
  }

  soundsByTag(tag: string): ExtendedSound[] {
    return Object.values(this.sounds).filter((sound) => sound.tag === tag);
  }

  soundsByType(type: MediaType): ExtendedSound[] {
    return Object.values(this.sounds).filter((sound) => sound.mediaType === type);
  }

  get allSounds(): ExtendedSound[] {
    return Object.values(this.sounds);
  }

  stopAllSounds(): void {
    this.epoch += 1;
    this.pendingLoads.clear();
    this.allSounds.forEach((sound) => {
      this.traceSound('stopped', sound);
      this.releaseSound(sound);
    });
    this.sounds = {};
  }

  syncAmbisonicRendererYaw(): void {
    const yaw = this.currentListenerYaw();
    for (const sound of this.allSounds) {
      sound.ambisonicRenderer?.setRotationMatrixFromYaw(yaw);
    }
  }

  reset(): void {
    this.stopAllSounds();
    this.defaultUrl = '';
    this.currentMusic = undefined;
    this.mediaSession.clear();
    this.effects.shutdown();
  }

  shutdown(): void {
    this.reset();
    if (this.shutdownComplete) {
      return;
    }
    this.shutdownComplete = true;
    if (this.manageFocus && typeof window !== 'undefined') {
      window.removeEventListener('focus', this.handleWindowFocus);
      window.removeEventListener('blur', this.handleWindowBlur);
    }
    this.unsubscribePreferences?.();
    this.unsubscribePreferences = null;
  }

  private readonly handleWindowFocus = (): void => {
    this.isWindowFocused = true;
    this.updateBackgroundMuteState();
  };

  private readonly handleWindowBlur = (): void => {
    this.isWindowFocused = false;
    this.updateBackgroundMuteState();
  };

  /**
   * Route the sound to `chain` (primary, or an aux send at `send`), first
   * undoing a different named route. A no-op when that route is already live.
   */
  private routeNamedChain(sound: ExtendedSound, chain: string | undefined, send: number | undefined): void {
    const error = routeNamedChain(sound, chain, send, this.cacophony.getBus('master'));
    if (error) {
      console.warn(`Client.Media: chain '${chain}' unavailable; playing dry`, error);
      this.traceSound('routed', sound, sound.key, {
        code: 'CAPABILITY_UNAVAILABLE',
        message: `chain '${chain}' unavailable; playing dry: ${errorMessage(error)}`,
      });
    }
  }

  /** Undo the live named route: remove its aux send, or return the primary route to master. */
  private clearNamedRoute(sound: ExtendedSound): void {
    clearNamedRoute(sound, this.cacophony.getBus('master'));
  }

  /** Move a sound off its inline effect bus (back to master) and destroy that bus. */
  private detachInlineChain(sound: ExtendedSound): void {
    if (!sound.effectChain) {
      return;
    }
    const master = this.cacophony.getBus('master');
    try {
      if (master) {
        sound.routeTo(master);
      }
    } catch (error) {
      console.warn('Client.Media: could not reroute sound off its inline effects', error);
    }
    this.destroyInlineChain(sound);
  }

  /**
   * Apply a Play's routing (a full description: absent chain/effects mean
   * none) or an Update's (absent fields keep their current value; `chain: ""`
   * clears named routing and `effects: []` clears inline effects).
   */
  private async applyEffectRouting(
    sound: ExtendedSound,
    soundKey: string,
    data: Pick<ClientMediaPlayPayload, 'chain' | 'send' | 'effects' | 'upmix'>,
    mode: 'play' | 'update',
  ): Promise<void> {
    if ((data.upmix ?? sound.upmix) === 'ambisonic') {
      return;
    }
    const isPlay = mode === 'play';
    const chain =
      data.chain !== undefined ? data.chain || undefined : isPlay ? undefined : sound.namedChain;
    const send = data.send !== undefined ? data.send : isPlay ? undefined : sound.namedSend;
    const effects = data.effects ?? (isPlay ? [] : undefined);

    if (effects && effects.length > 0) {
      this.clearNamedRoute(sound);
      sound.namedChain = chain;
      sound.namedSend = send;
      await this.applyInlineEffects(sound, soundKey, { chain, send, effects });
      return;
    }
    if (effects) {
      this.detachInlineChain(sound);
    }
    if (sound.effectChain) {
      // Update without effects: keep the inline chain, re-point what it feeds.
      sound.namedChain = chain;
      sound.namedSend = send;
      this.pointInlineChain(sound.effectChain, chain, send);
      return;
    }
    this.routeNamedChain(sound, chain, send);
  }

  private async buildInlineChain(
    sound: ExtendedSound,
    soundKey: string,
    effects: EffectSpec[],
  ): Promise<EffectChain | undefined> {
    const master = this.cacophony.getBus('master');
    if (sound.effectChain && master) {
      sound.effectChain.destroy(master);
      sound.effectChain = undefined;
    }
    const generation = (sound.effectGeneration ?? 0) + 1;
    sound.effectGeneration = generation;

    const { EffectChain } = await import('./effects/EffectChain');
    const inline = await EffectChain.createAnonymous(this.cacophony, effects);

    const stale =
      sound.effectGeneration !== generation ||
      this.cleanedSounds.has(sound) ||
      this.sounds[soundKey] !== sound;
    if (stale) {
      if (master) {
        inline.destroy(master);
      }
      return undefined;
    }

    sound.effectChain = inline;
    return inline;
  }

  /**
   * Point an inline chain at the sound's named chain. With a `send`, the
   * inline output stays on master (the dry path) and feeds the named chain at
   * the send level, exactly as chain+send behaves without inline effects.
   * Without a send, the inline chain runs in series into the named chain.
   */
  private pointInlineChain(inline: EffectChain, chain: string | undefined, send: number | undefined): void {
    const target = chain ? (this.effects.getChain(chain)?.bus ?? null) : null;
    if (target && send !== undefined) {
      inline.connectDownstream(null);
      inline.setSend(target, send);
      return;
    }
    inline.setSend(null);
    inline.connectDownstream(target);
  }

  private async applyInlineEffects(
    sound: ExtendedSound,
    soundKey: string,
    data: Pick<ClientMediaPlayPayload, 'chain' | 'send' | 'effects'>,
  ): Promise<void> {
    const inline = await this.buildInlineChain(sound, soundKey, data.effects ?? []);
    if (!inline) {
      return;
    }
    this.pointInlineChain(inline, data.chain, data.send);
    try {
      sound.routeTo(inline.bus);
    } catch (error) {
      console.warn('Client.Media: failed to route sound through inline effects', error);
      this.traceSound('routed', sound, soundKey, {
        code: 'CAPABILITY_UNAVAILABLE',
        message: `inline effects unavailable: ${errorMessage(error)}`,
      });
    }
  }

  private resolveAutomateTarget(data: ClientMediaAutomatePayload): EffectChain | undefined {
    if (data.chain) {
      return this.effects.getChain(data.chain);
    }
    if (data.key) {
      const [sound] = this.soundsByKey(data.key);
      return sound?.effectChain;
    }
    return undefined;
  }

  private assignSoundMetadata(
    sound: ExtendedSound,
    data: Pick<ClientMediaPlayPayload, 'key' | 'tag' | 'type' | 'upmix' | 'channels'>,
  ): void {
    sound.key = data.key ?? sound.key;
    sound.tag = data.tag ?? sound.tag;
    sound.mediaType = data.type ?? sound.mediaType;
    sound.upmix = data.upmix ?? sound.upmix;
    const channels = this.normalizeInputChannels(data.channels);
    if (channels !== undefined) {
      sound.inputChannels = channels;
    }
  }

  private cleanupUpmix(sound: ExtendedSound): void {
    sound.ambisonicRenderer?.cleanup();
    delete sound.ambisonicRenderer;
    sound.positionalFoa?.cleanup();
    delete sound.positionalFoa;
  }

  // A sound is stale if it was released/cleaned during an await, or replaced
  // under its key. buildInlineChain OR-s an additional generation check on top
  // of this; the create and FOA-attach paths only need these two conditions.
  // soundKey is optional because the update() FOA callers have no key in scope.
  private isSoundStale(sound: ExtendedSound, soundKey?: string): boolean {
    if (this.cleanedSounds.has(sound)) {
      return true;
    }
    return soundKey !== undefined && this.sounds[soundKey] !== sound;
  }

  private releaseSound(sound: ExtendedSound, key?: string, reason?: AudioDiagnosticError): void {
    if (!this.cleanedSounds.has(sound)) {
      this.traceSound('released', sound, key ?? sound.key, reason);
    }
    this.motion.cancel(sound);
    this.clearSegmentTimer(sound);
    if (sound === this.currentMusic) {
      this.currentMusic = undefined;
      this.mediaSession.clear();
    }

    if (key !== undefined && this.sounds[key] === sound) {
      delete this.sounds[key];
      this.preloadedSoundKeys.delete(key);
    }

    for (const soundKey of Object.keys(this.sounds)) {
      if (this.sounds[soundKey] === sound) {
        delete this.sounds[soundKey];
        this.preloadedSoundKeys.delete(soundKey);
      }
    }

    this.destroyInlineChain(sound);

    if (this.cleanedSounds.has(sound)) {
      return;
    }

    this.cleanedSounds.add(sound);
    this.cleanupUpmix(sound);
    sound.cleanup();
  }

  private destroyInlineChain(sound: ExtendedSound): void {
    const chain = sound.effectChain;
    if (!chain) {
      return;
    }
    sound.effectChain = undefined;
    sound.effectGeneration = undefined;
    const master = this.cacophony.getBus('master');
    if (master) {
      chain.destroy(master);
    }
  }

  private releaseSoundWhenPlaybackEnds(sound: ExtendedSound, key: string): void {
    let unsubscribe: (() => void) | undefined;
    unsubscribe = sound.on('ended', () => {
      unsubscribe?.();
      // The OS now-playing surface tracks live playback, so tear it down the
      // instant the track ends — synchronously, not on the deferred cleanup
      // below. Resource teardown can wait a macrotask; the session can't, or
      // the OS keeps showing a finished track as "playing".
      if (sound === this.currentMusic) {
        this.currentMusic = undefined;
        this.mediaSession.clear();
      }
      // Defer cleanup one macrotask. Cacophony's own end-of-playback teardown
      // (AudioBufferSourceNode.onended -> _runLoopEnded -> stop()) runs in the
      // same 'ended' turn; if we cleanup() synchronously here, the sound is
      // marked cleaned and that internal stop() throws "Cannot stop a sound that
      // has been cleaned up". Letting cacophony finish first avoids the race.
      setTimeout(() => {
        if (this.sounds[key] === sound) {
          this.releaseSound(sound, key);
        }
      }, 0);
    });
  }

  private resolvedUrl(data: Pick<ClientMediaLoadPayload, 'name' | 'url'>): string {
    return (data.url || this.defaultUrl) + data.name;
  }

  private currentListenerYaw(): number {
    const forward = this.cacophony.listenerForwardOrientation;
    if (!forward?.length) {
      return 0;
    }
    return Math.atan2(forward[0], -forward[2]);
  }

  private normalizeInputChannels(channels?: number): number | undefined {
    if (channels === undefined || !Number.isFinite(channels)) {
      return undefined;
    }
    const normalized = Math.trunc(channels);
    if (normalized < 1) {
      return undefined;
    }
    return normalized;
  }

  private resolveAmbisonicInputChannels(
    sound: ExtendedSound,
    data: Pick<ClientMediaPlayPayload, 'channels'>,
  ): number {
    return (
      this.normalizeInputChannels(data.channels) ??
      this.normalizeInputChannels(sound.inputChannels) ??
      this.normalizeInputChannels(sound.buffer?.numberOfChannels) ??
      2
    );
  }

  private async configureAmbisonicPlayback(
    sound: ExtendedSound,
    playback: Playback,
    inputChannels: number,
    outputTarget?: CacophonyAudioNode,
    soundKey?: string,
  ): Promise<void> {
    this.cleanupUpmix(sound);
    let renderer: AmbisonicRenderer;
    try {
      renderer = await AmbisonicRenderer.create(this.cacophony, inputChannels);
    } catch (error) {
      console.warn('Unsupported ambisonic input channel count', {
        error,
        inputChannels,
        sound: sound.key ?? sound.url,
      });
      this.traceSound('routed', sound, soundKey ?? sound.key, {
        code: 'CAPABILITY_UNAVAILABLE',
        message: `ambisonic renderer unavailable for ${inputChannels} channels: ${errorMessage(error)}`,
      });
      return;
    }
    if (this.isSoundStale(sound, soundKey)) {
      renderer.cleanup();
      return;
    }
    renderer.attachPlayback(playback, outputTarget);
    renderer.setRotationMatrixFromYaw(this.currentListenerYaw());
    sound.ambisonicRenderer = renderer;
    this.updateAmbisonicDistance(sound);
  }

  /**
   * Wire a mono/stereo world object through the physically-correct positional
   * FOA path (`encodeMonoToFoaSN3D` → `FoaDecoder`). Replaces the perceptual
   * stereo→B-format upmix for non-FOA sources: the source gets a real bearing,
   * so it sits at a spot, swings around the head on turn, and falls off with
   * distance — none of which the dormant upmixer did.
   */
  private async configurePositionalFoa(
    sound: ExtendedSound,
    playback: Playback,
    stereoWidthRad: number,
    outputTarget?: CacophonyAudioNode,
    soundKey?: string,
  ): Promise<void> {
    this.cleanupUpmix(sound);
    let renderer: PositionalFoaRenderer;
    try {
      const { PositionalFoaRenderer } = await import('./PositionalFoaRenderer');
      renderer = await PositionalFoaRenderer.create(
        this.cacophony,
        POSITIONAL_FOA_MAKEUP,
        stereoWidthRad,
      );
    } catch (error) {
      console.warn('Positional FOA renderer unavailable', {
        error,
        sound: sound.key ?? sound.url,
      });
      this.traceSound('routed', sound, soundKey ?? sound.key, {
        code: 'CAPABILITY_UNAVAILABLE',
        message: `positional FOA renderer unavailable: ${errorMessage(error)}`,
      });
      return;
    }
    if (this.isSoundStale(sound, soundKey)) {
      renderer.cleanup();
      return;
    }
    renderer.attachPlayback(playback, outputTarget);
    sound.positionalFoa = renderer;
    this.updatePositionalSpatial(sound);
  }

  /**
   * Recompute a positional-FOA source's bearing (azimuth/elevation relative to
   * the listener's head) and distance attenuation from the current listener
   * pose. Driven on listener move, listener turn, and source move.
   */
  private updatePositionalSpatial(sound: ExtendedSound): void {
    const renderer = sound.positionalFoa;
    if (!renderer) {
      return;
    }
    const listenerPos = this.cacophony.listenerPosition;
    const listenerForward = this.cacophony.listenerForwardOrientation;
    renderer.setBearingFromPositions(listenerPos, listenerForward, sound.mediaPosition);
    renderer.setDistanceGain(this.distanceGain(sound));
  }

  private async resolveAmbisonicTarget(
    sound: ExtendedSound,
    soundKey: string,
    data: Pick<ClientMediaPlayPayload, 'chain' | 'effects'>,
  ): Promise<CacophonyAudioNode | undefined> {
    if (data.effects && data.effects.length > 0) {
      const inline = await this.buildInlineChain(sound, soundKey, data.effects);
      return inline?.bus.input;
    }
    if (data.chain) {
      console.warn(
        `Client.Media: named chain '${data.chain}' is not supported for ambisonic sounds; use inline effects`,
      );
      this.traceSound('routed', sound, soundKey, {
        code: 'CAPABILITY_UNAVAILABLE',
        message: `named chain '${data.chain}' is not supported for ambisonic sounds`,
      });
    }
    return undefined;
  }

  private applySoundState(
    sound: ExtendedSound,
    data: Pick<
      ClientMediaUpdatePayload,
      | 'volume'
      | 'pan'
      | 'loops'
      | 'is3d'
      | 'position'
      | 'priority'
      | 'gainDb'
      | 'pitchSemitones'
      | 'spatial'
      | 'orientation'
    >,
  ): void {
    if (data.volume !== undefined) {
      sound.mediaVolume = data.volume / 100;
    }
    if (data.gainDb !== undefined) {
      sound.gainDb = data.gainDb;
    }
    if (data.pitchSemitones !== undefined) {
      // Set on the Sound before its voice is prepared, so the voice starts at this rate.
      sound.playbackRate = 2 ** (data.pitchSemitones / 12);
    }
    if (data.spatial !== undefined) {
      sound.spatialProfile = data.spatial;
    }
    if (data.orientation && data.orientation.length >= 3) {
      sound.mediaOrientation = [data.orientation[0], data.orientation[1], data.orientation[2]];
    }

    // A source's panning mode is fixed when it is created (is3d -> HRTF), and
    // Cacophony rejects the other mode's setters. The MOO sends `pan` on every
    // packet, so a point source ignores it rather than failing the Play.
    const hrtf = sound.panType === 'HRTF';
    if (data.pan !== undefined && !hrtf) {
      sound.stereoPan = data.pan / 100;
    }

    if (data.loops !== undefined) {
      sound.segmentLoops = data.loops;
      // A region-less segment with a finish repeats by timer; looping the
      // element itself would replay the whole file.
      if (!this.repeatsByTimer(sound)) {
        // 'infinite' (not Infinity) is what makes Cacophony loop the source
        // natively and gaplessly; a number restarts it from onended each pass.
        const loopCount = data.loops === -1 ? 'infinite' : data.loops - 1;
        sound.loop(loopCount);
      }
    }

    if (data.is3d) {
      sound.pointSource = true;
    }
    if (hrtf && sound.pointSource && (data.is3d || data.spatial || data.orientation)) {
      sound.threeDOptions = this.pannerOptions(sound);
    }

    if (data.position?.length) {
      const target: Position = [data.position[0], data.position[1], data.position[2]];
      // First placement snaps, and so does the first one after a scene snapshot;
      // later updates glide from the current position.
      const from = sound.positionScene === this.scene ? sound.mediaPosition : undefined;
      sound.positionScene = this.scene;
      this.motion.tween(sound, from, target, (value) => {
        sound.mediaPosition = [value[0], value[1], value[2]];
        if (hrtf) {
          sound.position = sound.mediaPosition;
        }
        this.updateAmbisonicDistance(sound);
        this.updatePositionalSpatial(sound);
        this.applyLevels(sound);
      });
    }

    this.applyLevels(sound);

    if (data.priority) {
      for (const key in this.sounds) {
        const activeSound = this.sounds[key];
        if (activeSound === sound) {
          continue;
        }
        if (activeSound.priority && activeSound.priority < data.priority) {
          this.releaseSound(activeSound, key);
        }
      }
      sound.priority = data.priority;
    }
  }

  /**
   * The MCMP window a Play asks for, or undefined for the whole file. `start`,
   * `loopStart` and `finish` are absolute positions in ms; `end` is a legacy
   * spelling of `finish`. A finish at or before start is ignored; without a
   * usable loopStart the repeat window starts at `start`.
   */
  private requestedSegment(
    data: Pick<ClientMediaPlayPayload, 'finish' | 'start' | 'loopStart' | 'end'>,
  ): MediaSegment | undefined {
    const start = finiteMs(data.start) ?? 0;
    let finish = finiteMs(data.finish) ?? finiteMs(data.end);
    if (finish !== undefined && finish <= start) {
      console.warn(`Client.Media: finish ${finish} is not after start ${start}; ignored`);
      finish = undefined;
    }
    let loopStart = finiteMs(data.loopStart) ?? start;
    if (loopStart > start) {
      console.warn(`Client.Media: loopStart ${loopStart} is after start ${start}; ignored`);
      loopStart = start;
    }
    if (start === 0 && finish === undefined) {
      return undefined;
    }
    return { start, loopStart, finish };
  }

  private sameSegment(a: MediaSegment | undefined, b: MediaSegment | undefined): boolean {
    return a?.start === b?.start && a?.loopStart === b?.loopStart && a?.finish === b?.finish;
  }

  /**
   * Swap a whole-file buffer sound for a Cacophony region over the repeat
   * window [loopStart, finish). Region playback seeks, loops and ends inside
   * the window natively (the source's loopStart/loopEnd), so `loops` repeats
   * the window, not the file. The voice then starts at `start` inside the
   * region (startVoice), so the first pass is start..finish and every later
   * pass restarts at the region start, loopStart.
   */
  private async segmentSound(
    base: ExtendedSound,
    segment: MediaSegment,
    panType: 'HRTF' | 'stereo',
  ): Promise<ExtendedSound> {
    const buffer = base.buffer;
    if (!buffer) {
      return base;
    }
    const start = segment.loopStart / 1000;
    const finish = Math.min(
      segment.finish === undefined ? buffer.duration : segment.finish / 1000,
      buffer.duration,
    );
    if (finish <= start) {
      return base;
    }
    const sprite = await this.cacophony.createSprite(
      buffer,
      { segment: { start, duration: finish - start } },
      { panType },
    );
    const sound = sprite.get('segment') as ExtendedSound;
    sound.url = base.url;
    base.cleanup();
    return sound;
  }

  /** An absolute file position (ms) as seconds into the sound, relative to its region if it has one. */
  private soundOffsetSeconds(sound: ExtendedSound, positionMs: number): number {
    const seconds = positionMs / 1000;
    const region = sound.region;
    if (!region) {
      return seconds;
    }
    return Math.min(Math.max(0, seconds - region.start), region.duration);
  }

  /** Seek to an absolute file position, translated into the sound's region if it has one. */
  private seekToPosition(sound: ExtendedSound, positionMs: number): void {
    sound.seek(this.soundOffsetSeconds(sound, positionMs));
  }

  private repeatsByTimer(sound: ExtendedSound): boolean {
    return !sound.region && sound.segment?.finish !== undefined;
  }

  /**
   * A region-less sound (streamed music, or an undecodable buffer) cannot loop
   * a window natively, so a timer seeks back to `loopStart` at each `finish`
   * and releases the sound after the last pass: (finish - start) +
   * (N - 1) × (finish - loopStart), or never for `loops: -1`.
   */
  private scheduleSegmentTimer(sound: ExtendedSound, key: string): void {
    this.clearSegmentTimer(sound);
    const segment = sound.segment;
    if (!this.repeatsByTimer(sound) || segment?.finish === undefined) {
      return;
    }
    const firstLength = segment.finish - segment.start;
    const length = segment.finish - segment.loopStart;
    let passes = 0;
    const onSegmentEnd = () => {
      sound.segmentTimer = undefined;
      if (this.sounds[key] !== sound) {
        return;
      }
      passes += 1;
      const loops = sound.segmentLoops ?? 1;
      if (loops !== -1 && passes >= Math.max(1, loops)) {
        this.releaseSound(sound, key);
        return;
      }
      this.seekToPosition(sound, segment.loopStart);
      sound.segmentTimer = setTimeout(onSegmentEnd, length);
    };
    sound.segmentTimer = setTimeout(onSegmentEnd, firstLength);
  }

  private clearSegmentTimer(sound: ExtendedSound): void {
    if (sound.segmentTimer !== undefined) {
      clearTimeout(sound.segmentTimer);
      sound.segmentTimer = undefined;
    }
  }

  /**
   * An Update carrying `finish` (or legacy `end`) or `loopStart` moves the
   * play window, which a region cannot do in place: replay the original Play
   * with the update merged over it. Returns true when it took over the update.
   */
  private resegment(sound: ExtendedSound, data: ClientMediaUpdatePayload): boolean {
    const original = sound.playPayload;
    if (
      !original ||
      (data.finish === undefined && data.end === undefined && data.loopStart === undefined)
    ) {
      return false;
    }
    const overrides = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined),
    ) as Partial<ClientMediaPlayPayload>;
    const finish = data.finish ?? data.end ?? original.finish;
    // This replay is internal, not a full-state Play from the server: name the
    // amount in effect now, or play() would read its absence as clear. A later
    // Update may also have moved it away from the original Play's.
    const occlusion = data.occlusion ?? sound.occlusion;
    void this.play({
      ...original,
      ...overrides,
      finish,
      occlusion,
      key: sound.key ?? original.key,
    }).catch(
      (error) => console.error('Client.Media.Update: resegment failed', error),
    );
    return true;
  }

  private stopSound(sound: ExtendedSound): void {
    this.traceSound('stopped', sound);
    if (sound.key !== undefined) {
      // Also supersede a Play for this key that is still awaiting routing.
      this.cancelKey(sound.key);
    }
    this.releaseSound(sound, sound.key);
  }

  private activateMusicSession(sound: ExtendedSound, data: ClientMediaPlayPayload): void {
    this.currentMusic = sound;
    this.mediaSession.setNowPlaying(
      {
        title: this.musicTitle(data),
        artist: data.artist,
        album: data.album,
        artwork: data.artwork,
      },
      {
        play: () => this.resumeCurrentMusic(),
        pause: () => this.pauseCurrentMusic(),
        stop: () => this.stopCurrentMusic(),
        seekTo: (time) => this.seekCurrentMusic(time),
        seekBackward: (offset) => this.nudgeCurrentMusic(-offset),
        seekForward: (offset) => this.nudgeCurrentMusic(offset),
      },
    );
    this.mediaSession.setPlaybackState(sound.isPlaying ? 'playing' : 'paused');
    this.updateMusicPosition();
  }

  private musicTitle(data: ClientMediaPlayPayload): string {
    if (data.title) {
      return data.title;
    }
    const base = data.name.split('/').pop() ?? data.name;
    return base.replace(/\.[^.]+$/, '') || data.name;
  }

  private resumeCurrentMusic(): void {
    const sound = this.currentMusic;
    if (!sound) {
      return;
    }
    sound.resume();
    this.mediaSession.setPlaybackState('playing');
    this.updateMusicPosition();
  }

  private pauseCurrentMusic(): void {
    const sound = this.currentMusic;
    if (!sound) {
      return;
    }
    sound.pause();
    this.mediaSession.setPlaybackState('paused');
    this.updateMusicPosition();
  }

  private stopCurrentMusic(): void {
    const sound = this.currentMusic;
    if (sound) {
      this.releaseSound(sound, sound.key);
    }
  }

  private seekCurrentMusic(time: number): void {
    const sound = this.currentMusic;
    if (!sound) {
      return;
    }
    sound.seek(time);
    this.updateMusicPosition();
  }

  private nudgeCurrentMusic(deltaSeconds: number): void {
    const sound = this.currentMusic;
    if (!sound) {
      return;
    }
    const current = sound.playbacks[0]?.currentTime ?? 0;
    const duration = sound.duration;
    let next = current + deltaSeconds;
    if (next < 0) {
      next = 0;
    } else if (Number.isFinite(duration) && next > duration) {
      next = duration;
    }
    this.seekCurrentMusic(next);
  }

  private updateMusicPosition(): void {
    const sound = this.currentMusic;
    if (!sound) {
      return;
    }
    const position = sound.playbacks[0]?.currentTime ?? 0;
    this.mediaSession.setPositionState(sound.duration, position, sound.isPlaying ? 1 : 0);
  }
}
