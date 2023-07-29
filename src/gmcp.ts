import { Howl, Howler } from "howler";
import { preferencesStore } from "./PreferencesStore";
import type MudClient from "./client";
import { set } from "js-cookie";


abstract class GMCPMessage { }

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

export class GMCPMessageCommChannelText extends GMCPMessage {
  public readonly channel!: string;
  public readonly talker!: string;
  public readonly text!: string;
}

export class GMCPMessageCommWebRTCOffer extends GMCPMessage {
  public readonly offer!: string;
  public readonly userId!: string;
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

  shutdown() {
    // Do nothing
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
  priority?: number;
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

  constructor(client: MudClient) {
    super(client);
    Howler.usingWebAudio = true; // Force to use Web Audio
    Howler.ctx = this.client.audioContext;
  }

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

    // Sound creation or updating
    if (!sound || sound._src !== mediaUrl) {
      // Create a new sound object
      sound = new Howl({
        src: [mediaUrl],
        html5: true,
        preload: true,
        format: ["aac", "mp3", "ogg"],
        loop: (data.loops === -1) ? true : false, // Looping
        volume: data.volume / 100, // Initial volume
        onfade: () => { if (data.fadeout) sound.stop(); } // Stop the sound after fadeout
      });

      // Fade in
      if (data.fadein) {
        sound.fade(0, data.volume, data.fadein);
      }

      // Start at a specific position
      if (data.start) {
        sound.seek(data.start / 1000);
      }
    } else {
      // Update volume if provided
      if (data.volume !== undefined) {
        sound.volume(data.volume / 100);
      }

      // Update looping if provided
      if (data.loops !== undefined) {
        sound.loop(data.loops === -1);
      }
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
      sound.pannerAttr({
        coneInnerAngle: 360,
        coneOuterAngle: 0,
        panningModel: 'HRTF',
        distanceModel: 'inverse',
        position: [data.position[0], data.position[1], data.position[2]],
        orientation: [1, 0, 0]
      });
    }

    // Fade out
    if (data.fadeout) {
      sound.fade(data.volume, 0, data.fadeout);
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
    if (!sound.playing()) {
      sound.play();
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

  soundsByName(name: string) {
    // must check the end of the url because the url isn't in the sound object
    return Object.values(this.sounds).filter((sound) => {
      return sound._src && sound._src[sound._src.length - 1].endsWith(name);
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

  get allSounds() {
    return Object.values(this.sounds);
  }
}

class GmcpMessageCharName {
  public name!: string;
  public fullname: string = "";
}

export class GMCPChar extends GMCPPackage {
  public packageName: string = "Char";

  handleName(data: GmcpMessageCharName): void {
    this.client.worldData.playerId = data.name;
    this.client.worldData.playerName = data.fullname;
    this.client.emit("statustext", `Logged in as ${data.fullname}`);
  }

  sendLogin(name: string, password: string): void {
    this.client.sendGmcp(
      "Char.Login",
      JSON.stringify({ name: name, password: password })
    );
  }
}

export class GMCPCommChannel extends GMCPPackage {
  public packageName: string = "Comm.Channel";
  public channels: string[] = [];

  handleList(data: string[]): void {
    this.channels = data;

  }

  sendList(): void {
    this.sendData("List");
  }

  handleText(data: GMCPMessageCommChannelText): void {
    if (data.channel === "say_to_you") {
      if (!document.hasFocus()) {
        this.client.sendNotification(`Message from ${data.talker}`, `${data.text}`);
      }
    }
  }
}

export class GMCPMessageRoomInfo extends GMCPMessage {
  num: string = "";
  name: string = "";
  area: string = "";
}

export class GMCPRoom extends GMCPPackage {
  public static readonly packageName: string = "Room";
  public name: string = "";
  public id: string = "";
  public exits: string[] = [];
  public people: string[] = [];

  handleInfo(data: GMCPMessageRoomInfo): void {
    this.name = data.name;
    this.id = data.num;
    this.client.worldData.roomId = this.id;
    this.client.emit("room", this);
  }
}

export class GMCPMessageCommLiveKitToken {
  token: string = "";
}

export class GMCPCommLiveKit extends GMCPPackage {
  public packageName: string = "Comm.LiveKit";

  handleroom_token(data: GMCPMessageCommLiveKitToken): void {
    this.client.worldData.liveKitTokens.push(data.token);
    this.client.emit("livekitToken", data.token);
  }

  handleroom_leave(data: GMCPMessageCommLiveKitToken): void {
    this.client.worldData.liveKitTokens = this.client.worldData.liveKitTokens.filter((token) => token !== data.token);
    this.client.emit("livekitLeave", data.token);
  }
}

export class GMCPMessageClientMediaSpeechSpeak {
  text: string = "";
  rate: number = 1;
  pitch = 1;
  volume = 0.5;
}

export class GMCPClientSpeech extends GMCPPackage {
  public packageName: string = "Client.Speech";

  handleSpeak(data: GMCPMessageClientMediaSpeechSpeak): void {
    const utterance = new SpeechSynthesisUtterance(data.text);
    utterance.rate = data.rate;
    utterance.pitch = data.pitch;
    utterance.volume = data.volume;
    speechSynthesis.speak(utterance);
  }
}

export class GMCPAutoLogin extends GMCPPackage {
  public packageName: string = "Auth.Autologin";

  handleToken(data: string): void {
    localStorage.setItem("LoginRefreshToken", data);
  }

  sendLogin(): void {
    var token = localStorage.getItem("LoginRefreshToken");
    if (token)
      this.sendData("Login", token);
  }
}
