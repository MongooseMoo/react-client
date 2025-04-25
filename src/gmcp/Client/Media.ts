import { Playback, Position, Sound, SoundType } from "cacophony";

import { GMCPMessage, GMCPPackage } from "../package";

const CORS_PROXY = "https://mongoose.world:9080/?url=";

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
}

export class GMCPMessageClientMediaStop extends GMCPMessage {
  public readonly name?: string; // Stops playing media by name matching the value specified.
  public readonly type?: MediaType; // Stops playing media by type matching the value specified.
  public readonly tag?: string; // Stops playing media by tag matching the value specified.
  public readonly priority?: number = 0;
  public readonly key?: string; // Stops playing media by key matching the value specified.
}

export class GMCPMessageClientMediaListenerOrientation extends GMCPMessage {
  public readonly up?: Position;
  public readonly forward?: Position;
}

export class GMCPMessageClientMediaListenerPosition {
  public readonly position: Position = [0, 0, 0];
}

export interface ExtendedSound extends Sound {
  priority?: number;
  tag?: string;
  key?: string; // The unique key provided by GMCP or generated from URL
  gmcpName?: string; // The 'name' field from the GMCP message
  mediaType?: MediaType;
  playbackId?: number; // Store the ID of the current playback instance
}

export class GMCPClientMedia extends GMCPPackage {
  public packageName: string = "Client.Media";
  sounds: { [key: string]: ExtendedSound } = {};
  defaultUrl: string = "";

  handleDefault(url: string) {
    this.defaultUrl = url;
  }

  async handleLoad(data: GMCPMessageClientMediaLoad) {
    const url = (data.url || this.defaultUrl) + data.name;
    const key = data.url + data.name;
    let sound = this.sounds[key] as ExtendedSound;
    if (!sound) {
      let sound: ExtendedSound = await this.client.cacophony.createSound(url);
      sound.key = key;
      this.sounds[key] = sound;
    }
  }

  private getFullMediaUrl(name: string, url?: string, type?: MediaType): string {
    const baseUrl = url || this.defaultUrl;
    let fullUrl = baseUrl + name;
    // Apply CORS proxy only for music types if needed by the browser/server setup
    if (type?.toLowerCase() === "music") {
      // Check if the URL is already proxied or is local/same-origin
      if (!fullUrl.startsWith(CORS_PROXY) && !fullUrl.startsWith(window.location.origin)) {
         // Basic check, might need refinement based on actual URLs
         try {
            const urlOrigin = new URL(fullUrl).origin;
            if (urlOrigin !== window.location.origin) {
               console.log(`Applying CORS proxy to music URL: ${fullUrl}`);
               fullUrl = CORS_PROXY + encodeURIComponent(fullUrl);
            }
         } catch (e) {
             console.warn(`Could not parse URL to check origin, applying proxy: ${fullUrl}`, e);
             fullUrl = CORS_PROXY + encodeURIComponent(fullUrl);
         }
      }
    }
    return fullUrl;
  }


  async handlePlay(data: GMCPMessageClientMediaPlay) {
    const mediaUrl = this.getFullMediaUrl(data.name, data.url, data.type);
    const key = data.key || mediaUrl; // Use provided key or default to URL

    console.log(`[Media.Play] Request: key=${key}, name=${data.name}, url=${mediaUrl}, data=`, data);

    // --- Key Handling: Stop existing sound with same key but different URL ---
    const existingSoundSameKey = this.sounds[key];
    if (existingSoundSameKey && existingSoundSameKey.url !== mediaUrl) {
        console.log(`[Media.Play] Stopping existing sound with same key (${key}) but different URL (${existingSoundSameKey.url})`);
        this.stopSound(existingSoundSameKey);
        delete this.sounds[key]; // Ensure it's removed before potentially creating a new one
    }

    // --- Priority Handling: Stop lower priority sounds ---
    if (data.priority && data.priority > 0) {
        for (const activeKey in this.sounds) {
            const activeSound = this.sounds[activeKey];
            // Stop if the active sound has lower priority and is currently playing
            if (activeSound.priority !== undefined && activeSound.priority < data.priority && activeSound.isPlaying) {
                console.log(`[Media.Play] Stopping lower priority sound (${activeSound.priority}) key=${activeKey} due to new sound priority (${data.priority})`);
                this.stopSound(activeSound);
            }
        }
    }

    let sound = this.sounds[key];
    const panType = data.is3d ? "HRTF" : "stereo";

    try {
        // --- Sound Creation or Retrieval ---
        if (!sound) {
            console.log(`[Media.Play] Creating new sound for key: ${key}, URL: ${mediaUrl}`);
            const soundType = data.type === "music" ? SoundType.HTML : SoundType.Buffer;
            sound = await this.client.cacophony.createSound(mediaUrl, soundType, panType);
            sound.key = key; // Assign the key
            this.sounds[key] = sound; // Add to map immediately
        } else {
             console.log(`[Media.Play] Reusing existing sound for key: ${key}`);
             // If continue is false (default is true), stop the current playback before starting anew
             if (data.continue === false && sound.isPlaying) {
                 console.log(`[Media.Play] Continue=false, stopping existing playback for key: ${key}`);
                 sound.stopPlayback(sound.playbackId); // Stop specific playback instance
             } else if (data.continue === true && sound.isPlaying) {
                 console.log(`[Media.Play] Continue=true and sound already playing, ignoring play request for key: ${key}`);
                 return; // Don't restart if already playing and continue is true
             }
        }

        // --- Apply Properties ---
        sound.gmcpName = data.name; // Store the GMCP name
        sound.mediaType = data.type;
        sound.tag = data.tag;
        sound.priority = data.priority;

        if (data.volume !== undefined) sound.volume = data.volume / 100;
        const loopCount = data.loops === -1 ? Infinity : (data.loops || 0); // Default to 0 loops if undefined
        sound.loop(loopCount);

        if (data.is3d && data.position) {
            sound.threeDOptions = {
                coneInnerAngle: 360, coneOuterAngle: 0, // Defaults, adjust if needed
                panningModel: "HRTF", distanceModel: "inverse" // Common defaults
            };
            sound.position = [data.position[0], data.position[1], data.position[2]];
        } else {
            // Ensure 3D options are reset if not specified or apply panning
            sound.threeDOptions = undefined; // Or set to default 2D options if necessary
            sound.pan = data.pan ?? 0; // Apply stereo pan if provided
        }

        // --- Playback ---
        const playbackOptions = {
            start: data.start ? data.start / 1000 : 0, // Convert ms to seconds
            // Note: Cacophony's play doesn't directly take an 'end' time. We handle this with setTimeout.
        };

        console.log(`[Media.Play] Playing sound key=${key} with options:`, playbackOptions);
        const playback = sound.play(playbackOptions)[0]; // Assuming play returns an array of playbacks

        if (!playback) {
            console.error(`[Media.Play] Failed to start playback for key: ${key}`);
            // Clean up if playback failed immediately
            if (!sound.isPlaying) delete this.sounds[key];
            return;
        }

        sound.playbackId = playback.id; // Store the playback ID

        // --- Fades ---
        const fadeDurationMs = Math.max(data.fadein || 0, data.fadeout || 0);
        if (data.fadein && data.fadein > 0) {
            console.log(`[Media.Play] Fading in sound key=${key} over ${data.fadein}ms`);
            playback.fade(0, sound.volume, data.fadein); // Fade from 0 to target volume
        }
        // Fade out needs careful handling, especially with loops or explicit end times.
        // If an 'end' time is specified, schedule a fade-out.
        if (data.end && data.end > (data.start || 0)) {
            const duration = data.end - (data.start || 0);
            const fadeOutStartTime = duration - (data.fadeout || 0);

            if (data.fadeout && data.fadeout > 0 && fadeOutStartTime > 0) {
                 // Schedule fade-out to start before the end time
                 setTimeout(() => {
                     console.log(`[Media.Play] Fading out sound key=${key} over ${data.fadeout}ms before end`);
                     playback.fade(sound.volume, 0, data.fadeout);
                 }, fadeOutStartTime);
            }
            // Schedule stop at the end time regardless of fade
            setTimeout(() => {
                console.log(`[Media.Play] Stopping sound key=${key} at specified end time: ${data.end}ms`);
                this.stopSoundByKeyAndPlaybackId(key, playback.id);
            }, duration);
        } else if (data.fadeout && data.fadeout > 0 && loopCount === 0) {
             // If no end time, but fadeout is specified and it doesn't loop infinitely,
             // attempt to schedule fade based on sound duration (if available). This is less reliable.
             const soundDuration = sound.duration; // duration is in seconds
             if (soundDuration && soundDuration > 0) {
                 const fadeOutStartTimeMs = (soundDuration * 1000) - data.fadeout - (data.start || 0);
                 if (fadeOutStartTimeMs > 0) {
                     setTimeout(() => {
                         console.log(`[Media.Play] Fading out non-looping sound key=${key} based on duration`);
                         playback.fade(sound.volume, 0, data.fadeout);
                     }, fadeOutStartTimeMs);
                 }
             } else {
                 console.warn(`[Media.Play] Cannot schedule fadeout for key=${key} without end time or reliable duration.`);
             }
        }

        // --- Cleanup on End ---
        // Use the specific playback instance's onEnd
        playback.onEnd = () => {
            console.log(`[Media.Play] Playback ended naturally for key=${key}, playbackId=${playback.id}`);
            // Only remove if this specific playback was the last one associated with the sound key
            if (sound.playbackId === playback.id) {
                 this.stopSoundByKeyAndPlaybackId(key, playback.id); // Use helper to ensure cleanup
            }
        };

    } catch (error) {
        console.error(`[Media.Play] Error handling play request for key ${key}, URL ${mediaUrl}:`, error);
        // Clean up potentially partially created sound entry
        if (key && !this.sounds[key]?.isPlaying) {
             delete this.sounds[key];
        }
    }
  }

  handleStop(data: GMCPMessageClientMediaStop): void {
    console.log("[Media.Stop] Request:", data);
    let soundsToStop: ExtendedSound[] = [];

    if (data.name) {
        soundsToStop = soundsToStop.concat(this.soundsByName(data.name));
    }
    if (data.type) {
        soundsToStop = soundsToStop.concat(this.soundsByType(data.type));
    }
    if (data.tag) {
        soundsToStop = soundsToStop.concat(this.soundsByTag(data.tag));
    }
    if (data.key) {
        soundsToStop = soundsToStop.concat(this.soundsByKey(data.key));
    }

    // If no specific criteria, stop all sounds
    if (!data.name && !data.type && !data.tag && !data.key) {
        console.log("[Media.Stop] Stopping all sounds.");
        this.stopAllSounds();
        return; // Exit early as all sounds are stopped
    }

    // Remove duplicates and stop the selected sounds
    const uniqueSounds = [...new Set(soundsToStop)];
    console.log(`[Media.Stop] Stopping ${uniqueSounds.length} sound(s) based on criteria.`);
    uniqueSounds.forEach((sound) => this.stopSound(sound));
  }

  // Stops a sound and removes it from the map
  private stopSound(sound: ExtendedSound) {
    if (!sound || !sound.key) return;
    const key = sound.key;
    console.log(`[Media] Stopping sound key=${key}`);
    sound.stop(); // Stop all playbacks for this sound
    delete this.sounds[key];
  }

  // Stops a specific playback instance and removes the sound if no other playbacks are active
  private stopSoundByKeyAndPlaybackId(key: string, playbackId: number | undefined) {
      const sound = this.sounds[key];
      if (sound) {
          if (playbackId !== undefined) {
              sound.stopPlayback(playbackId);
              console.log(`[Media] Stopped playbackId=${playbackId} for key=${key}`);
          } else {
              // If no specific playback ID, stop all for this sound
              sound.stop();
               console.log(`[Media] Stopped all playbacks for key=${key}`);
          }
          // Only delete if no other playbacks are running for this sound object
          if (!sound.isPlaying) {
              console.log(`[Media] Removing sound object key=${key} as it's no longer playing.`);
              delete this.sounds[key];
          }
      }
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
    }
  }

  // Find sounds by the 'name' specified in the GMCP message
  soundsByName(name: string): ExtendedSound[] {
    return Object.values(this.sounds).filter(sound => sound.gmcpName === name);
  }

  // Find sounds by the GMCP key or the generated URL key
  soundsByKey(key: string): ExtendedSound[] {
    return Object.values(this.sounds).filter(sound => sound.key === key);
  }

  // Find sounds by the tag specified in the GMCP message
  soundsByTag(tag: string): ExtendedSound[] {
    return Object.values(this.sounds).filter(sound => sound.tag === tag);
  }

  // Find sounds by the media type specified
  soundsByType(type: MediaType): ExtendedSound[] {
    return Object.values(this.sounds).filter(sound => sound.mediaType === type);
  }

  // Get all currently managed sound objects
  get allSounds(): ExtendedSound[] {
    return Object.values(this.sounds);
  }

  // Stop all currently managed sounds
  stopAllSounds() {
    this.allSounds.forEach((sound) => this.stopSound(sound)); // Use helper to ensure cleanup
    // this.sounds map is cleared within stopSound calls
  }
}
