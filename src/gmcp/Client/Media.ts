import type { Cacophony, Playback, Position, Sound } from "cacophony";

import { AmbisonicRenderer } from "../../audio/AmbisonicRenderer";
import { GMCPMessage, GMCPPackage } from "../package";

const CORS_PROXY = "https://mongoose.world:9080/?url=";
type CacophonySoundKind = NonNullable<Parameters<Cacophony["createSound"]>[1]>;
const CACOPHONY_BUFFER = "Buffer" as CacophonySoundKind;
const CACOPHONY_HTML = "HTML" as CacophonySoundKind;

export class GMCPMessageClientMediaLoad extends GMCPMessage {
  public readonly url?: string;
  public readonly name!: string;
}

export type MediaType = "sound" | "music" | "video";

export class GMCPMessageClientMediaPlay extends GMCPMessage {
  public readonly name!: string;
  public readonly url?: string;
  public readonly type?: MediaType = "sound";
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
  public readonly type?: MediaType = "sound";
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
}

export class GMCPClientMedia extends GMCPPackage {
  public packageName: string = "Client.Media";
  sounds: { [key: string]: ExtendedSound } = {};
  defaultUrl: string = "";
  private cleanedSounds = new WeakSet<ExtendedSound>();

  constructor(client: GMCPPackage["client"]) {
    super(client);
    this.client.on("spatialListenerOrientation", this.handleSpatialListenerOrientation);
    this.client.on("spatialScene", this.handleSpatialScene);
  }

  private assignSoundMetadata(
    sound: ExtendedSound,
    data: Pick<GMCPMessageClientMediaPlay, "key" | "tag" | "type" | "upmix" | "channels">,
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
    if (key !== undefined && this.sounds[key] === sound) {
      delete this.sounds[key];
    }

    for (const soundKey of Object.keys(this.sounds)) {
      if (this.sounds[soundKey] === sound) {
        delete this.sounds[soundKey];
      }
    }

    if (this.cleanedSounds.has(sound)) {
      return;
    }

    this.cleanedSounds.add(sound);
    this.cleanupUpmix(sound);
    sound.cleanup();
  }

  private releaseSoundWhenPlaybackEnds(
    sound: ExtendedSound,
    key: string,
    playback: Playback,
  ): void {
    playback.on("ended", () => {
      if (this.sounds[key] === sound) {
        this.releaseSound(sound, key);
      }
    });
  }

  private resolvedUrl(data: Pick<GMCPMessageClientMediaLoad, "name" | "url">): string {
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
    data: Pick<GMCPMessageClientMediaPlay, "channels">,
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
  ) {
    this.cleanupUpmix(sound);
    let renderer: AmbisonicRenderer;
    try {
      renderer = await AmbisonicRenderer.create(this.client.cacophony, inputChannels);
    } catch (error) {
      console.warn("Unsupported ambisonic input channel count", {
        error,
        inputChannels,
        sound: sound.key ?? sound.url,
      });
      return;
    }
    renderer.attachPlayback(playback);
    renderer.setRotationMatrixFromYaw(this.currentListenerYaw());
    sound.ambisonicRenderer = renderer;
  }

  private applySoundState(
    sound: ExtendedSound,
    data: Pick<
      GMCPMessageClientMediaUpdate,
      "volume" | "pan" | "loops" | "is3d" | "position" | "start" | "priority"
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
        panningModel: "HRTF",
        distanceModel: "inverse",
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
    if (data.type?.toLowerCase() === "music") {
      mediaUrl = CORS_PROXY + encodeURIComponent(mediaUrl);
    }
    return mediaUrl;
  }

  async handlePlay(data: GMCPMessageClientMediaPlay) {
    let mediaUrl = this.mediaUrl(data);
    data.key = data.key || mediaUrl;
    const soundKey = data.key;
    let sound = this.sounds[soundKey] as ExtendedSound;
    const panType = data.is3d ? "HRTF" : "stereo";
    // Sound creation or updating
    if (!sound || sound.url !== mediaUrl) {
      // Cleanup old sound before replacing
      if (sound) {
        this.releaseSound(sound, soundKey);
      }
      // Create a new sound object
      if (data.type === "music") {
        sound = await this.client.cacophony.createSound(
          mediaUrl,
          CACOPHONY_HTML,
          panType
        );
      } else {
        sound = await this.client.cacophony.createSound(
          mediaUrl,
          CACOPHONY_BUFFER,
          panType
        );
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
      const [playback] = sound.play() as Playback[];
      this.releaseSoundWhenPlaybackEnds(sound, soundKey, playback);
      if (data.start !== undefined) {
        sound.seek(data.start / 1000);
      }
      const targetVolume = (data.volume ?? 50) / 100;
      const context = this.client.cacophony.context;
      const currentTime = context.currentTime;

      if (data.fadein && playback.gainNode) {
        // Start at 0, ramp to target volume over fadein ms
        playback.gainNode.gain.setValueAtTime(0, currentTime);
        playback.gainNode.gain.linearRampToValueAtTime(
          targetVolume,
          currentTime + data.fadein / 1000
        );
      }

      if (data.fadeout && playback.gainNode) {
        // Schedule fadeout at end of sound
        const duration = playback.duration;
        if (isFinite(duration)) {
          const fadeoutStart = currentTime + duration - data.fadeout / 1000;
          if (fadeoutStart > currentTime) {
            playback.gainNode.gain.setValueAtTime(targetVolume, fadeoutStart);
            playback.gainNode.gain.linearRampToValueAtTime(
              0,
              currentTime + duration
            );
          }
        }
      }

      if (data.upmix === "ambisonic") {
        const inputChannels = this.resolveAmbisonicInputChannels(sound, data);
        await this.configureAmbisonicPlayback(sound, playback, inputChannels);
      }
    }
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
      const [playback] = sound.playbacks;
      if (data.upmix === "ambisonic" && playback) {
        const inputChannels = this.resolveAmbisonicInputChannels(sound, data);
        this.configureAmbisonicPlayback(sound, playback, inputChannels).catch(console.error);
      } else if (data.upmix && data.upmix !== "ambisonic") {
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
      this.soundsByName(data.name).forEach((sound) => this.stopSound(sound));
    }
    if (data.type) {
      this.soundsByType(data.type).forEach((sound) => this.stopSound(sound));
    }
    if (data.tag) {
      this.soundsByTag(data.tag).forEach((sound) => this.stopSound(sound));
    }
    if (data.key) {
      this.soundsByKey(data.key).forEach((sound) => this.stopSound(sound));
    }
    if (!data.name && !data.type && !data.tag && !data.key) {
      this.allSounds.forEach((sound) => {
        this.cleanupUpmix(sound);
        sound.cleanup();
      });
      this.sounds = {};
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
      return typeof sound.url === "string" && sound.url.endsWith(name);
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
    return Object.values(this.sounds).filter(
      (sound: ExtendedSound) => sound.mediaType === type
    );
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
    this.client.off("spatialListenerOrientation", this.handleSpatialListenerOrientation);
    this.client.off("spatialScene", this.handleSpatialScene);
  }
}
