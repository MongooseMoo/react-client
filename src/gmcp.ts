import { Howl, Howler } from "howler";
import type MudClient from "./client";
import { audioContext } from "./audio";
import { WebRTCClient } from "./webrtc";

// @ts-ignore
Howler.ctx = audioContext;
export class GMCPMessage {}

export class GMCPMessageCoreClient extends GMCPMessage {
    public readonly name: string;
    public readonly version: string;

    constructor(name: string, version: string) {
        super();
        this.name = name;
        this.version = version;
    }
}

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
    public readonly start?: number = 0;
    public readonly loops?: number = 0; // Number of iterations that the media plays.  A value of -1 allows the sound or music to loop indefinitely.
    public readonly priority?: number = 0; // Halts the play of current or future played media files with a lower priority while this media plays.
    public continue?: boolean = true;
    public key?: string; // Uniquely identifies media files with a "key" that is bound to their "name" or "url".  Halts the play of current media files with the same "key" that have a different "name" or "url" while this media plays.
}

export class GMCPMessageClientMediaStop extends GMCPMessage {
    public readonly name?: string; // Stops playing media by name matching the value specified.
    public readonly type?: MediaType; // Stops playing media by type matching the value specified.
    public readonly tag?: string; // Stops playing media by tag matching the value specified.
    public readonly priority?: number = 0;
    public readonly key?: string; // Stops playing media by key matching the value specified.
}

export class GMCPMessageClientWebRTCUserLeft extends GMCPMessage {
    public readonly userId!: string;
    public readonly channel!: string;
}

export class GMCPMessageClientWebRTCUserJoined extends GMCPMessage {
    public readonly userId!: string;
    public readonly channel!: string;
}

export class GMCPPackage {
    public readonly packageName!: string;
    public readonly packageVersion?: number = 1;
    protected readonly client: MudClient;

    constructor(client: MudClient) {
        this.client = client;
    }

    sendData(messageName: string, data?: any): void {
        this.client.sendGmcp(
            this.packageName + "." + messageName,
            JSON.stringify(data)
        );
    }
}

export class GMCPCore extends GMCPPackage {
    public packageName: string = "Core";
    sendHello(): void {
        this.sendData("Hello", { client: "Mongoose Client", version: "0.1" });
    }
}

export class GMCPCoreSupports extends GMCPPackage {
    packageName = "Core.Supports";

    sendSet() {
        const packages = Object.values(this.client.gmcpHandlers).map(
            (p) => p.packageName + " " + p.packageVersion!.toString()
        );
        this.sendData("Set", packages);
    }
}

export interface Sound extends Howl {
    tag?: string;
    key?: string;
    // ssh
    _src?: string;
    type?: MediaType;
}

export class GMCPClientMedia extends GMCPPackage {
    public packageName: string = "Client.Media";
    sounds: { [key: string]: Sound } = {};
    defaultUrl: string = "";
    handleDefault(url: string): void {
        this.defaultUrl = url;
    }

    handleLoad(data: GMCPMessageClientMediaLoad): void {
        const url = (data.url || this.defaultUrl) + data.name;
        const key = data.url + data.name;
        let sound = this.sounds[key] as Howl;
        if (!sound) {
            let sound: Sound = new Howl({ src: [url] });
            sound.key = key;
            this.sounds[key] = sound;
        }
    }

    handlePlay(data: GMCPMessageClientMediaPlay): void {
        const mediaUrl = (data.url || this.defaultUrl) + data.name;
        data.key = data.key || mediaUrl;
        let sound = this.sounds[data.key];

        if (!sound || sound._src !== mediaUrl) {
            if (data.type === "music") {
                sound = new Howl({
                    src: [(data.url || this.defaultUrl) + data.name],
                    html5: true,
                    format: ["aac", "mp3", "ogg"],
                });
            } else {
                sound = new Howl({ src: [mediaUrl] });
            }
        } else {
            console.log("updating", data, sound);
        }
        // type
        if (data.type) {
            sound.type = data.type;
        }
        sound.volume(data.volume / 100);
        if (data.fadein) {
            sound.fade(0, data.volume, data.fadein);
        }
        if (data.fadeout) {
            sound.fade(data.volume, 0, data.fadeout);
        }
        if (data.start) {
            sound.seek(data.start);
        }
        if (data.loops === -1) {
            sound.loop(true);
        }
        if (data.tag) {
            sound.tag = data.tag;
        }
        if (data.key) {
            sound.key = data.key;
        }
        console.log(
            "Sound is currently   ",
            sound.playing() ? "playing" : "stopped"
        );
        if (!sound.playing()) {
            sound.play();
            console.log("playing", data, sound);
        }
        this.sounds[data.key] = sound;
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
    }

    soundsByName(name: string) {
        // must check the end of the url because the url isn't in the sound object
        return Object.values(this.sounds).filter((sound) => {
            return (
                sound._src && sound._src[sound._src.length - 1].endsWith(name)
            );
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
            (sound: Sound) => sound.type === type
        );
    }
}

export class GMCPClientWebRTC extends GMCPPackage {
    public packageName: string = "Client.WebRTC";
    private webrtcClient: WebRTCClient;

    constructor(client: MudClient) {
        super(client);
        const webrtcClient = new WebRTCClient(audioContext);
        this.webrtcClient = webrtcClient;
        this.webrtcClient.on("offerGenerated", (userId, offer) => {
            this.sendData("Offer", { userId: userId, offer: offer });
        });
    }

    handleUserJoined(data: GMCPMessageClientWebRTCUserJoined): void {
        this.webrtcClient.createConnection(data.userId, true);
    }

    handleUserLeft(data: GMCPMessageClientWebRTCUserLeft): void {
        this.webrtcClient.closeConnection(data.userId);
    }
}
