import type {
  Cacophony,
  AudioNode as CacophonyAudioNode,
  Playback,
  Position,
  Sound,
} from 'cacophony';

import { AmbisonicRenderer } from '../../audio/AmbisonicRenderer';
import { EffectChain } from '../../audio/effects/EffectChain';
import { buildEffectsSupport, MediaEffects } from '../../audio/effects/MediaEffects';
import type { EffectSpec } from '../../audio/effects/types';
import { MediaSessionController } from '../../audio/MediaSessionController';
import { GMCPMessage, GMCPPackage } from '../package';

const CORS_PROXY = 'https://mongoose.world:9080/?url=';
type CacophonySoundKind = NonNullable<Parameters<Cacophony['createSound']>[1]>;
const CACOPHONY_BUFFER = 'buffer' satisfies CacophonySoundKind;
const CACOPHONY_HTML = 'html' satisfies CacophonySoundKind;

export class GMCPMessageClientMediaLoad extends GMCPMessage {
  public readonly url?: string;
  public readonly name!: string;
}

export type MediaType = 'sound' | 'music' | 'video';

export class GMCPMessageClientMediaPlay extends GMCPMessage {
  public readonly name!: string;
  public readonly url?: string;
  public readonly type?: MediaType = 'sound';
  public readonly tag?: string;
  public readonly volume: number = 50; // Relative to the volume set on the player's client.
  public readonly fadein?: number = 0; // Volume increases, or fades in, ranged across a linear pattern from one to the volume set with the "volume" key.
  public readonly fadeout?: number = 0; // Volume decreases, or fades out, ranged across a linear pattern from the volume set with the "volume" key to one.
  public readonly start: number = 0;
  public readonly loops?: number = 0; // Number of iterations that the media plays.  A value of -1 allows the sound or music to loop indefinitely.
  public readonly priority?: number = 0; // Halts the play of current or future played media files with a lower priority while this media plays.
  public continue?: boolean = true;
  public key?: string; // Uniquely identifies media files with a "key" that is bound to their "name" or "url".  Halts the play of current media files with the same "key" that have a different "name" or "url" while this media plays.
  // Custom Mongoose extensions
  public readonly end?: number = 0; // The end time of the media in ms.
  public is3d: boolean = false; // If true, the media is 3D and should be played in the 3D space.
  public pan: number = 0; // -1 to 1
  public position: number[] = [0, 0, 0]; // x, y, z
  public readonly upmix?: string;
  public readonly channels?: number;
  // MCMP effects extension
  public readonly chain?: string; // Route this sound through the named effect chain.
  public readonly send?: number; // Aux-send level into `chain` (stays dry on master).
  public readonly effects?: EffectSpec[]; // Inline per-sound effect chain (one-off).
  // Media Session metadata (OS lock screen / transport controls). Optional —
  // the title falls back to the media name when these are absent.
  public readonly title?: string;
  public readonly artist?: string;
  public readonly album?: string;
  public readonly artwork?: MediaImage[];
}

export class GMCPMessageClientMediaStop extends GMCPMessage {
  public readonly name?: string; // Stops playing media by name matching the value specified.
  public readonly type?: MediaType; // Stops playing media by type matching the value specified.
  public readonly tag?: string; // Stops playing media by tag matching the value specified.
  public readonly priority?: number = 0;
  public readonly key?: string; // Stops playing media by key matching the value specified.
}

export class GMCPMessageClientMediaUpdate extends GMCPMessage {
  public readonly name?: string;
  public readonly url?: string;
  public readonly type?: MediaType = 'sound';
  public readonly tag?: string;
  public readonly volume?: number;
  public readonly fadein?: number = 0;
  public readonly fadeout?: number = 0;
  public readonly start?: number = 0;
  public readonly loops?: number = 0;
  public readonly priority?: number = 0;
  public continue?: boolean = true;
  public key?: string;
  public readonly end?: number = 0;
  public is3d?: boolean = false;
  public pan?: number = 0;
  public position?: number[] = [0, 0, 0];
  public upmix?: string;
  public channels?: number;
  // MCMP effects extension
  public readonly chain?: string;
  public readonly send?: number;
  public readonly effects?: EffectSpec[];
}

/** Define / replace / remove a named effect chain. Empty `effects` removes it. */
export class GMCPMessageClientMediaChain extends GMCPMessage {
  public readonly id!: string;
  public readonly effects?: EffectSpec[];
  public readonly preset?: string;
  public readonly gain?: number;
  public readonly fadein?: number;
}

/** Remove a named effect chain by id (rerouting its live sounds to master). */
export class GMCPMessageClientMediaChainStop extends GMCPMessage {
  public readonly id!: string;
}

/** Ramp an effect's params (or toggle bypass) on a chain or a playing sound's inline chain. */
export class GMCPMessageClientMediaAutomate extends GMCPMessage {
  public readonly chain?: string; // target a named chain…
  public readonly key?: string; // …or a playing sound's inline chain (by media key)
  public readonly target!: string | number; // effect id or index within the chain
  public readonly params?: Record<string, number | string>; // wire params to ramp
  public readonly ramp?: number; // ms (0 / absent = instant)
  public readonly curve?: 'linear' | 'exponential';
  public readonly bypass?: boolean; // toggle bypass instead of ramping
}

export class GMCPMessageClientMediaListenerOrientation extends GMCPMessage {
  public readonly up?: Position;
  public readonly forward?: Position;
}

export class GMCPMessageClientMediaListenerPosition {
  public readonly position: Position = [0, 0, 0];
}

export interface ExtendedSound extends Sound {
  ambisonicRenderer?: AmbisonicRenderer;
  inputChannels?: number;
  priority?: number;
  tag?: string;
  key?: string;
  mediaType?: MediaType;
  upmix?: string;
  /** Inline per-sound effect chain (anonymous bus), torn down with the sound. */
  effectChain?: EffectChain;
  /** Bumped each time inline effects are (re)built, to discard stale async builds. */
  effectGeneration?: number;
}

export class GMCPClientMedia extends GMCPPackage {
  public packageName: string = 'Client.Media';
  sounds: { [key: string]: ExtendedSound } = {};
  defaultUrl: string = '';
  private cleanedSounds = new WeakSet<ExtendedSound>();
  private readonly effects: MediaEffects;
  /** OS lock screen / transport-control surface for the active music track. */
  private readonly mediaSession = new MediaSessionController();
  /** The music sound currently bound to the Media Session, if any. */
  private currentMusic?: ExtendedSound;

  constructor(client: GMCPPackage['client']) {
    super(client);
    this.effects = new MediaEffects(this.client.cacophony);
    this.client.on('spatialListenerOrientation', this.handleSpatialListenerOrientation);
    this.client.on('spatialScene', this.handleSpatialScene);
  }

  /** Advertise effect support to the server (client → server). Sent on GMCP negotiation. */
  sendEffectsSupport(): void {
    this.sendData('EffectsSupport', buildEffectsSupport());
  }

  /** `Client.Media.Chain` — define / replace / remove a named effect chain. */
  handleChain(data: GMCPMessageClientMediaChain): void {
    this.effects
      .setChain(data)
      .catch((error) => console.error(`Client.Media.Chain '${data.id}' failed`, error));
  }

  /** `Client.Media.ChainStop` — remove a named effect chain by id. */
  handleChainStop(data: GMCPMessageClientMediaChainStop): void {
    if (data.id) {
      this.effects.removeChain(data.id);
    }
  }

  /**
   * Route a sound through an effect chain when `data.chain` is set. A missing
   * chain plays dry (routeTo throws on an unregistered bus name) — the sound is
   * never dropped for an effect's sake (§6).
   */
  private applyChainRouting(
    sound: ExtendedSound,
    data: Pick<GMCPMessageClientMediaPlay, 'chain' | 'send'>,
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

  /**
   * Dispatch a (non-ambisonic) sound to an inline effect chain or a named chain.
   * Ambisonic sounds are routed via the renderer's output target in the
   * ambisonic-setup path instead (their playback output feeds the FOA decoder,
   * not a bus), so this is a no-op for them.
   */
  private async applyEffectRouting(
    sound: ExtendedSound,
    soundKey: string,
    data: Pick<GMCPMessageClientMediaPlay, 'chain' | 'send' | 'effects' | 'upmix'>,
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

  /**
   * Build an anonymous per-sound effect chain, generation-guarded so a sound
   * released during the async build never gets a worklet bus attached to a
   * corpse (V5). Stores it on the sound (torn down in `releaseSound`) and wires
   * its downstream target, but does NOT route the sound — the caller decides how
   * the sound reaches the inline bus (playback route vs ambisonic renderer).
   */
  private async buildInlineChain(
    sound: ExtendedSound,
    soundKey: string,
    effects: EffectSpec[],
    downstream?: ReturnType<MediaEffects['getChain']> | null,
  ): Promise<EffectChain | undefined> {
    const master = this.client.cacophony.getBus('master');
    if (sound.effectChain && master) {
      sound.effectChain.destroy(master);
      sound.effectChain = undefined;
    }
    const generation = (sound.effectGeneration ?? 0) + 1;
    sound.effectGeneration = generation;

    const inline = await EffectChain.createAnonymous(this.client.cacophony, effects);

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

  /**
   * Build an inline chain and route the (non-ambisonic) sound through it
   * (`sound → inline → named chain | master`).
   */
  private async applyInlineEffects(
    sound: ExtendedSound,
    soundKey: string,
    data: Pick<GMCPMessageClientMediaPlay, 'chain' | 'effects'>,
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

  /** `Client.Media.Automate` — ramp an effect's params or toggle its bypass. */
  handleAutomate(data: GMCPMessageClientMediaAutomate): void {
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

  private resolveAutomateTarget(data: GMCPMessageClientMediaAutomate): EffectChain | undefined {
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
    data: Pick<GMCPMessageClientMediaPlay, 'key' | 'tag' | 'type' | 'upmix' | 'channels'>,
  ) {
    sound.key = data.key;
    sound.tag = data.tag;
    sound.mediaType = data.type;
    sound.upmix = data.upmix;
    const channels = this.normalizeInputChannels(data.channels);
    if (channels !== undefined) {
      sound.inputChannels = channels;
    }
  }

  private cleanupUpmix(sound: ExtendedSound) {
    sound.ambisonicRenderer?.cleanup();
    delete sound.ambisonicRenderer;
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

    // Destroy the inline effect chain BEFORE the cleaned-sounds guard, so a
    // partial/out-of-order release can never skip the worklet-bus teardown (V4).
    this.destroyInlineChain(sound);

    if (this.cleanedSounds.has(sound)) {
      return;
    }

    this.cleanedSounds.add(sound);
    this.cleanupUpmix(sound);
    sound.cleanup();
  }

  /** Tear down a sound's inline effect chain, if any (idempotent). */
  private destroyInlineChain(sound: ExtendedSound): void {
    const chain = sound.effectChain;
    if (!chain) {
      return;
    }
    sound.effectChain = undefined;
    sound.effectGeneration = undefined;
    const master = this.client.cacophony.getBus('master');
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

  private resolvedUrl(data: Pick<GMCPMessageClientMediaLoad, 'name' | 'url'>): string {
    return (data.url || this.defaultUrl) + data.name;
  }

  private currentListenerYaw(): number {
    const forward = this.client.cacophony.listenerForwardOrientation;
    if (!forward?.length) {
      return 0;
    }
    return Math.atan2(forward[0], -forward[2]);
  }

  private syncAmbisonicRendererYaw(): void {
    const yaw = this.currentListenerYaw();
    for (const sound of this.allSounds) {
      sound.ambisonicRenderer?.setRotationMatrixFromYaw(yaw);
    }
  }

  private handleSpatialListenerOrientation = (): void => {
    this.syncAmbisonicRendererYaw();
  };

  private handleSpatialScene = (): void => {
    this.syncAmbisonicRendererYaw();
  };

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
    data: Pick<GMCPMessageClientMediaPlay, 'channels'>,
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
  ) {
    this.cleanupUpmix(sound);
    let renderer: AmbisonicRenderer;
    try {
      renderer = await AmbisonicRenderer.create(this.client.cacophony, inputChannels);
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
  }

  /**
   * For an ambisonic sound, resolve the node its binaural output should feed:
   * the input of an inline effect bus (built here, P3/V11), or master. Named
   * chains are not supported for ambisonic sounds — the renderer's manual output
   * connection is not tracked by the bus, so chain-removal could not reroute it.
   */
  private async resolveAmbisonicTarget(
    sound: ExtendedSound,
    soundKey: string,
    data: Pick<GMCPMessageClientMediaPlay, 'chain' | 'effects'>,
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
      GMCPMessageClientMediaUpdate,
      'volume' | 'pan' | 'loops' | 'is3d' | 'position' | 'start' | 'priority'
    >,
  ) {
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
      };
    }

    if (data.position?.length) {
      sound.position = [data.position[0], data.position[1], data.position[2]];
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

  handleDefault(url: string) {
    this.defaultUrl = url;
  }

  async handleLoad(data: GMCPMessageClientMediaLoad) {
    const url = this.resolvedUrl(data);
    const key = url;
    if (!this.sounds[key]) {
      const sound: ExtendedSound = await this.client.cacophony.createSound(url);
      sound.key = key;
      this.sounds[key] = sound;
    }
  }

  mediaUrl(data: GMCPMessageClientMediaPlay): string {
    let mediaUrl = this.resolvedUrl(data);
    if (data.type?.toLowerCase() === 'music') {
      mediaUrl = CORS_PROXY + encodeURIComponent(mediaUrl);
    }
    return mediaUrl;
  }

  async handlePlay(data: GMCPMessageClientMediaPlay) {
    const mediaUrl = this.mediaUrl(data);
    data.key = data.key || mediaUrl;
    const soundKey = data.key;
    let sound = this.sounds[soundKey] as ExtendedSound;
    const panType = data.is3d ? 'HRTF' : 'stereo';
    // Sound creation or updating
    if (!sound || sound.url !== mediaUrl) {
      // Cleanup old sound before replacing
      if (sound) {
        this.releaseSound(sound, soundKey);
      }
      // Create a new sound object
      if (data.type === 'music') {
        sound = await this.client.cacophony.createSound(mediaUrl, CACOPHONY_HTML, panType);
      } else {
        sound = await this.client.cacophony.createSound(mediaUrl, CACOPHONY_BUFFER, panType);
      }
    }

    sound.key = soundKey;
    this.assignSoundMetadata(sound, data);
    this.sounds[soundKey] = sound;
    this.applySoundState(sound, data);

    if (data.end) {
      const endKey = soundKey;
      setTimeout(() => {
        if (this.sounds[endKey] === sound) {
          this.releaseSound(sound, endKey);
        }
      }, data.end);
    }

    // Playback control
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
        await this.configureAmbisonicPlayback(sound, playback, inputChannels, target);
      }
    }

    await this.applyEffectRouting(sound, soundKey, data);

    if (data.type === 'music') {
      this.activateMusicSession(sound, data);
    }
  }

  /**
   * Make `sound` the OS "now playing" track: publish its metadata to the lock
   * screen and bind the hardware/lock-screen transport controls to it. The
   * controls act locally on the cacophony sound — MCMP has no client→server
   * transport verb, so a lock-screen pause pauses the user's local audio only.
   */
  private activateMusicSession(sound: ExtendedSound, data: GMCPMessageClientMediaPlay): void {
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

  /** Lock-screen title: explicit `title`, else the media filename sans path/ext. */
  private musicTitle(data: GMCPMessageClientMediaPlay): string {
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

  /** Push the current track's duration/position to the lock-screen scrubber. */
  private updateMusicPosition(): void {
    const sound = this.currentMusic;
    if (!sound) {
      return;
    }
    const position = sound.playbacks[0]?.currentTime ?? 0;
    this.mediaSession.setPositionState(sound.duration, position, sound.isPlaying ? 1 : 0);
  }

  handleUpdate(data: GMCPMessageClientMediaUpdate) {
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
        this.configureAmbisonicPlayback(sound, playback, inputChannels).catch(console.error);
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

  handleStop(data: GMCPMessageClientMediaStop): void {
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
      // Route through the single release funnel so inline effect buses are torn
      // down too (V4) — never a bare sound.cleanup() that bypasses releaseSound.
      this.stopAllSounds();
    }
  }

  private stopSound(sound: ExtendedSound) {
    this.releaseSound(sound, sound.key);
  }

  handleListenerPosition(data: GMCPMessageClientMediaListenerPosition) {
    if (data.position?.length) {
      this.client.cacophony.listenerPosition = data.position;
    }
  }

  handleListenerOrientation(data: GMCPMessageClientMediaListenerOrientation) {
    if (data.up && data.up.length) {
      this.client.cacophony.listenerUpOrientation = data.up;
    }
    if (data.forward && data.forward.length) {
      this.client.cacophony.listenerForwardOrientation = data.forward;
      this.syncAmbisonicRendererYaw();
    }
  }

  soundsByName(name: string) {
    return Object.values(this.sounds).filter((sound) => {
      return typeof sound.url === 'string' && sound.url.endsWith(name);
    });
  }

  soundsByKey(key: string) {
    // Howl objects don't have keys, but we add a .key to some. Search through these and return any matching the key.
    return Object.values(this.sounds).filter((sound) => sound.key === key);
  }

  soundsByTag(tag: string) {
    return Object.values(this.sounds).filter((sound) => sound.tag === tag);
  }

  soundsByType(type: MediaType) {
    return Object.values(this.sounds).filter((sound: ExtendedSound) => sound.mediaType === type);
  }

  get allSounds() {
    return Object.values(this.sounds);
  }

  stopAllSounds() {
    this.allSounds.forEach((sound) => {
      this.releaseSound(sound);
    });
    this.sounds = {};
  }

  override shutdown() {
    this.currentMusic = undefined;
    this.mediaSession.clear();
    this.effects.shutdown();
    this.client.off('spatialListenerOrientation', this.handleSpatialListenerOrientation);
    this.client.off('spatialScene', this.handleSpatialScene);
  }
}
