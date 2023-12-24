import { Playback, Position, Sound, SoundType } from 'cacophony';

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
    key?: string;
    mediaType?: MediaType;
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

    async handlePlay(data: GMCPMessageClientMediaPlay) {
        let mediaUrl = (data.url || this.defaultUrl) + data.name;
        data.key = data.key || mediaUrl;
        let sound = this.sounds[data.key] as ExtendedSound;

        // Sound creation or updating
        if (!sound || sound.url !== mediaUrl) {
            // Create a new sound object
            if (data.type === "music") {
                mediaUrl = CORS_PROXY + encodeURIComponent(mediaUrl);
                sound = await this.client.cacophony.createSound(mediaUrl, SoundType.HTML);
            } else {
                sound = await this.client.cacophony.createSound(mediaUrl);
            }
        }

        // Update volume if provided
        if (data.volume !== undefined) {
            sound.volume = data.volume / 100;
        }

        // Update looping if provided
        if (data.loops !== undefined) {
            sound.loop && sound.loop(data.loops === -1 ? "infinite" : data.loops);
        }

        // Start at a specific position
        if (data.start) {
            sound.seek(data.start);
        }

        if (data.end) {
            setTimeout(() => {
                sound.stop();
            }
                , data.end);
        }

        // 3D functionality
        if (data.is3d) {
            // @ts-ignore
            sound.threeDOptions = {
                coneInnerAngle: 360,
                coneOuterAngle: 0,
                panningModel: 'HRTF',
                distanceModel: 'inverse',
            };
            sound.position = [data.position[0], data.position[1], data.position[2]];
        }

        // Priority handling
        if (data.priority) {
            for (let key in this.sounds) {
                const activeSound = this.sounds[key];
                if (activeSound.priority && activeSound.priority < data.priority) {
                    activeSound.stop();
                }
            }
            sound.priority = data.priority;
        }

        // Playback control
        if (!sound.isPlaying()) {
            const playback = sound.play()[0] as Playback;
            if (data.fadein) {
                playback.fadeIn(data.fadein);
            }
            if (data.fadeout) {
                playback.fadeOut(data.fadeout);
            }
        }

        this.sounds[data.key] = sound;
        sound.key = data.key;

    }

    handleStop(data: GMCPMessageClientMediaStop): void {
        if (data.name) {
            this.soundsByName(data.name).forEach((sound) => sound.stop());
        }
        if (data.type) {
            this.soundsByType(data.type).forEach((sound) => sound.stop());
        }
        if (data.tag) {
            this.soundsByTag(data.tag).forEach((sound) => sound.stop());
        }
        if (data.key) {
            this.soundsByKey(data.key).forEach((sound) => sound.stop());
        }
        if (!data.name && !data.type && !data.tag && !data.key) {
            this.allSounds.forEach((sound) => sound.stop());
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


    soundsByName(name: string) {
        // must check the end of the url because the url isn't in the sound object
        return Object.values(this.sounds).filter((sound) => {
            return sound.url && sound.url[sound.url.length - 1].endsWith(name);
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
        this.allSounds.forEach((sound) => sound.stop());
        this.sounds = {};
    }


}

