import {
  Cacophony,
  type AudioNode as CacophonyAudioNode,
  type Playback,
  type Position,
  type Sound,
} from 'cacophony';

import { usePreferences } from '../stores/preferencesStore';
import { AmbisonicRenderer } from './AmbisonicRenderer';
import { PositionalFoaRenderer } from './PositionalFoaRenderer';
import { distanceBetween, inverseDistanceGain, SPATIAL_DISTANCE_MODEL } from './distanceModel';
import { EffectChain } from './effects/EffectChain';
import { MediaEffects } from './effects/MediaEffects';
import type { EffectSpec } from './effects/types';
import { MediaSessionController } from './MediaSessionController';

const CORS_PROXY = 'https://mongoose.world:9080/?url=';
type CacophonySoundKind = NonNullable<Parameters<Cacophony['createSound']>[1]>;
const CACOPHONY_BUFFER = 'buffer' satisfies CacophonySoundKind;
const CACOPHONY_HTML = 'html' satisfies CacophonySoundKind;

/** Constant makeup gain restoring the clean positional FOA decode to a useful level. Tune by ear. */
const POSITIONAL_FOA_MAKEUP = 1;

export interface ClientMediaLoadPayload {
  readonly url?: string;
  readonly name: string;
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
  readonly start?: number;
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
  readonly effects?: EffectSpec[];
  readonly title?: string;
  readonly artist?: string;
  readonly album?: string;
  readonly artwork?: MediaImage[];
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
  readonly effects?: EffectSpec[];
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

export interface ExtendedSound extends Sound {
  ambisonicRenderer?: AmbisonicRenderer;
  positionalFoa?: PositionalFoaRenderer;
  inputChannels?: number;
  mediaPosition?: Position;
  priority?: number;
  tag?: string;
  key?: string;
  mediaType?: MediaType;
  upmix?: string;
  effectChain?: EffectChain;
  effectGeneration?: number;
}

interface MediaServiceOptions {
  manageFocus?: boolean;
}

export class MediaService {
  readonly cacophony: Cacophony;
  sounds: Record<string, ExtendedSound> = {};
  defaultUrl = '';

  private readonly cleanedSounds = new WeakSet<ExtendedSound>();
  private readonly effects: MediaEffects;
  private readonly mediaSession = new MediaSessionController();
  private currentMusic?: ExtendedSound;
  private globalMuted = false;
  private isWindowFocused = true;
  private readonly manageFocus: boolean;
  private unsubscribePreferences: (() => void) | null = null;
  private shutdownComplete = false;

  constructor(cacophony: Cacophony = new Cacophony(), options: MediaServiceOptions = {}) {
    this.cacophony = cacophony;
    this.effects = new MediaEffects(this.cacophony);
    this.manageFocus = options.manageFocus ?? true;

    this.setGlobalVolume(usePreferences.getState().sound.volume);
    if (this.manageFocus && typeof window !== 'undefined') {
      window.addEventListener('focus', this.handleWindowFocus);
      window.addEventListener('blur', this.handleWindowBlur);
    }

    this.unsubscribePreferences = usePreferences.subscribe(() => {
      this.updateBackgroundMuteState();
    });
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
      }
    }
  }

  /**
   * Recompute an ambisonic source's distance attenuation from the current
   * listener position. The HRTF panner gets distance from the Web Audio
   * PannerNode for free; the ambisonic route has no panner, so we drive its
   * pre-encoder gain with the same falloff curve ({@link inverseDistanceGain}).
   */
  private updateAmbisonicDistance(sound: ExtendedSound): void {
    if (!sound.ambisonicRenderer) {
      return;
    }
    const distance = distanceBetween(this.cacophony.listenerPosition, sound.mediaPosition);
    sound.ambisonicRenderer.setDistanceGain(inverseDistanceGain(distance));
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

  setChain(data: ClientMediaChainPayload): Promise<void> {
    return this.effects.setChain(data);
  }

  removeChain(id: string): void {
    this.effects.removeChain(id);
  }

  automate(data: ClientMediaAutomatePayload): void {
    const chain = this.resolveAutomateTarget(data);
    if (!chain) {
      console.warn('Client.Media.Automate: target chain/sound not found; ignored');
      return;
    }
    if (typeof data.bypass === 'boolean') {
      chain.setBypass(data.target, data.bypass);
      return;
    }
    if (data.params) {
      chain.automate(data.target, data.params, { duration: data.ramp, curve: data.curve });
    }
  }

  handleDefault(url: string): void {
    this.defaultUrl = url;
  }

  async load(data: ClientMediaLoadPayload): Promise<void> {
    const url = this.resolvedUrl(data);
    const key = url;
    if (!this.sounds[key]) {
      const sound = (await this.cacophony.createSound(url)) as ExtendedSound;
      sound.key = key;
      this.sounds[key] = sound;
    }
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
    let sound = this.sounds[soundKey] as ExtendedSound;
    const panType = data.is3d ? 'HRTF' : 'stereo';
    if (!sound || sound.url !== mediaUrl) {
      if (sound) {
        this.releaseSound(sound, soundKey);
      }
      if (data.type === 'music') {
        sound = (await this.cacophony.createSound(
          mediaUrl,
          CACOPHONY_HTML,
          panType,
        )) as ExtendedSound;
      } else {
        sound = (await this.cacophony.createSound(
          mediaUrl,
          CACOPHONY_BUFFER,
          panType,
        )) as ExtendedSound;
      }
    }

    sound.key = soundKey;
    this.assignSoundMetadata(sound, data);
    this.sounds[soundKey] = sound;
    this.applySoundState(sound, data);

    const stopDelay = this.stopDelayMs(data);
    if (stopDelay !== undefined) {
      const endKey = soundKey;
      setTimeout(() => {
        if (this.sounds[endKey] === sound) {
          this.releaseSound(sound, endKey);
        }
      }, stopDelay);
    }

    if (!sound.isPlaying) {
      const [playback] = sound.play({
        fadeIn: data.fadein || undefined,
        fadeOut: data.fadeout || undefined,
      }) as Playback[];
      this.releaseSoundWhenPlaybackEnds(sound, soundKey);
      if (data.start !== undefined) {
        sound.seek(data.start / 1000);
      }

      if (data.upmix === 'ambisonic') {
        const inputChannels = this.resolveAmbisonicInputChannels(sound, data);
        const target = await this.resolveAmbisonicTarget(sound, soundKey, data);
        if (inputChannels === 4) {
          // True 4-channel FOA content: decode + head-rotate the recorded field.
          await this.configureAmbisonicPlayback(sound, playback, inputChannels, target);
        } else {
          // Mono/stereo world object: physically-correct positional encode (clean path).
          await this.configurePositionalFoa(sound, playback, target);
        }
      }
    }

    await this.applyEffectRouting(sound, soundKey, data);

    if (data.type === 'music') {
      this.activateMusicSession(sound, data);
    }
  }

  update(data: ClientMediaUpdatePayload): void {
    const targetSounds = data.key
      ? this.soundsByKey(data.key)
      : data.name
        ? this.soundsByName(data.name)
        : [];

    targetSounds.forEach((sound) => {
      this.assignSoundMetadata(sound, {
        key: data.key ?? sound.key,
        tag: data.tag ?? sound.tag,
        type: data.type ?? sound.mediaType,
        upmix: data.upmix ?? sound.upmix,
        channels: data.channels ?? sound.inputChannels,
      });
      this.applySoundState(sound, data);
      void this.applyEffectRouting(sound, sound.key ?? data.key ?? '', data).catch((error) =>
        console.error('Client.Media.Update: effect routing failed', error),
      );
      const [playback] = sound.playbacks;
      if (data.upmix === 'ambisonic' && playback) {
        const inputChannels = this.resolveAmbisonicInputChannels(sound, data);
        if (inputChannels === 4) {
          this.configureAmbisonicPlayback(sound, playback, inputChannels).catch(console.error);
        } else {
          this.configurePositionalFoa(sound, playback).catch(console.error);
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

  stop(data: ClientMediaStopPayload): void {
    if (data.name) {
      this.soundsByName(data.name).forEach((sound) => {
        this.stopSound(sound);
      });
    }
    if (data.type) {
      this.soundsByType(data.type).forEach((sound) => {
        this.stopSound(sound);
      });
    }
    if (data.tag) {
      this.soundsByTag(data.tag).forEach((sound) => {
        this.stopSound(sound);
      });
    }
    if (data.key) {
      this.soundsByKey(data.key).forEach((sound) => {
        this.stopSound(sound);
      });
    }
    if (!data.name && !data.type && !data.tag && !data.key) {
      this.stopAllSounds();
    }
  }

  soundsByName(name: string): ExtendedSound[] {
    return Object.values(this.sounds).filter((sound) => {
      return typeof sound.url === 'string' && sound.url.endsWith(name);
    });
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
    this.allSounds.forEach((sound) => {
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

  shutdown(): void {
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
    this.currentMusic = undefined;
    this.mediaSession.clear();
    this.effects.shutdown();
  }

  private readonly handleWindowFocus = (): void => {
    this.isWindowFocused = true;
    this.updateBackgroundMuteState();
  };

  private readonly handleWindowBlur = (): void => {
    this.isWindowFocused = false;
    this.updateBackgroundMuteState();
  };

  private applyChainRouting(
    sound: ExtendedSound,
    data: Pick<ClientMediaPlayPayload, 'chain' | 'send'>,
  ): void {
    if (!data.chain) {
      return;
    }
    try {
      if (typeof data.send === 'number') {
        sound.routeTo(data.chain, data.send);
      } else {
        sound.routeTo(data.chain);
      }
    } catch (error) {
      console.warn(`Client.Media: chain '${data.chain}' unavailable; playing dry`, error);
    }
  }

  private async applyEffectRouting(
    sound: ExtendedSound,
    soundKey: string,
    data: Pick<ClientMediaPlayPayload, 'chain' | 'send' | 'effects' | 'upmix'>,
  ): Promise<void> {
    if (data.upmix === 'ambisonic') {
      return;
    }
    if (data.effects && data.effects.length > 0) {
      await this.applyInlineEffects(sound, soundKey, data);
      return;
    }
    this.applyChainRouting(sound, data);
  }

  private async buildInlineChain(
    sound: ExtendedSound,
    soundKey: string,
    effects: EffectSpec[],
    downstream?: ReturnType<MediaEffects['getChain']> | null,
  ): Promise<EffectChain | undefined> {
    const master = this.cacophony.getBus('master');
    if (sound.effectChain && master) {
      sound.effectChain.destroy(master);
      sound.effectChain = undefined;
    }
    const generation = (sound.effectGeneration ?? 0) + 1;
    sound.effectGeneration = generation;

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
    if (downstream !== undefined) {
      inline.connectDownstream(downstream ? downstream.bus : null);
    }
    return inline;
  }

  private async applyInlineEffects(
    sound: ExtendedSound,
    soundKey: string,
    data: Pick<ClientMediaPlayPayload, 'chain' | 'effects'>,
  ): Promise<void> {
    const downstream = data.chain ? this.effects.getChain(data.chain) : undefined;
    const inline = await this.buildInlineChain(sound, soundKey, data.effects ?? [], downstream);
    if (!inline) {
      return;
    }
    try {
      sound.routeTo(inline.bus);
    } catch (error) {
      console.warn('Client.Media: failed to route sound through inline effects', error);
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
    sound.key = data.key;
    sound.tag = data.tag;
    sound.mediaType = data.type;
    sound.upmix = data.upmix;
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

  private releaseSound(sound: ExtendedSound, key?: string): void {
    if (sound === this.currentMusic) {
      this.currentMusic = undefined;
      this.mediaSession.clear();
    }

    if (key !== undefined && this.sounds[key] === sound) {
      delete this.sounds[key];
    }

    for (const soundKey of Object.keys(this.sounds)) {
      if (this.sounds[soundKey] === sound) {
        delete this.sounds[soundKey];
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
      if (this.sounds[key] === sound) {
        this.releaseSound(sound, key);
      }
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
    outputTarget?: CacophonyAudioNode,
  ): Promise<void> {
    this.cleanupUpmix(sound);
    let renderer: PositionalFoaRenderer;
    try {
      renderer = await PositionalFoaRenderer.create(this.cacophony, POSITIONAL_FOA_MAKEUP);
    } catch (error) {
      console.warn('Positional FOA renderer unavailable', {
        error,
        sound: sound.key ?? sound.url,
      });
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
    renderer.setDistanceGain(inverseDistanceGain(distanceBetween(listenerPos, sound.mediaPosition)));
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
    }
    return undefined;
  }

  private applySoundState(
    sound: ExtendedSound,
    data: Pick<
      ClientMediaUpdatePayload,
      'volume' | 'pan' | 'loops' | 'is3d' | 'position' | 'start' | 'priority'
    >,
  ): void {
    if (data.volume !== undefined) {
      sound.volume = data.volume / 100;
    }

    if (data.pan !== undefined) {
      sound.stereoPan = data.pan / 100;
    }

    if (data.loops !== undefined) {
      const loopCount = data.loops === -1 ? Infinity : data.loops - 1;
      sound.loop(loopCount);
    }

    if (data.is3d) {
      sound.threeDOptions = {
        coneInnerAngle: 360,
        coneOuterAngle: 0,
        panningModel: 'HRTF',
        distanceModel: 'inverse',
        refDistance: SPATIAL_DISTANCE_MODEL.refDistance,
        rolloffFactor: SPATIAL_DISTANCE_MODEL.rolloffFactor,
        maxDistance: SPATIAL_DISTANCE_MODEL.maxDistance,
      };
    }

    if (data.position?.length) {
      sound.mediaPosition = [data.position[0], data.position[1], data.position[2]];
      sound.position = sound.mediaPosition;
      this.updateAmbisonicDistance(sound as ExtendedSound);
      this.updatePositionalSpatial(sound as ExtendedSound);
    }

    if (data.start !== undefined) {
      sound.seek(data.start / 1000);
    }

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

  private stopDelayMs(
    data: Pick<ClientMediaPlayPayload, 'finish' | 'start' | 'end'>,
  ): number | undefined {
    if (typeof data.finish === 'number' && Number.isFinite(data.finish)) {
      const start =
        typeof data.start === 'number' && Number.isFinite(data.start) ? Math.max(0, data.start) : 0;
      return Math.max(0, data.finish - start);
    }

    if (typeof data.end === 'number' && Number.isFinite(data.end) && data.end > 0) {
      return data.end;
    }

    return undefined;
  }

  private stopSound(sound: ExtendedSound): void {
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
