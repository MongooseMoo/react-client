import { Howl } from 'howler';
import type MudClient from './client';

export class GMCPMessage { }



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

export type MediaType = "sound" | "music" | "video"

export class GMCPMnessageClientMediaPlay extends GMCPMessage {
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
  public readonly key?: string; // Uniquely identifies media files with a "key" that is bound to their "name" or "url".  Halts the play of current media files with the same "key" that have a different "name" or "url" while this media plays.
}

export class GMCPMessageClientMediaStop extends GMCPMessage {
  public readonly name?: string; // Stops playing media by name matching the value specified.
  public readonly type?: MediaType; // Stops playing media by type matching the value specified.
  public readonly tag?: string; // Stops playing media by tag matching the value specified.
  public readonly priority?: number = 0;
  public readonly key?: string; // Stops playing media by key matching the value specified.
}

export class GMCPPackage {
  public readonly packageName!: string;
  private readonly client: MudClient;

  constructor(client: MudClient) {
    this.client = client;
  }

  sendData(data: any): void {
    this.client.sendGmcp(this.packageName, JSON.stringify(data));
  }
}

export class CoreSupports extends GMCPPackage {
  serverSupports: string[] = [];
  packageName = 'Core.Supports';
  constructor(client: MudClient) {
    super(client);
  }

  handleSet(data: string[]) {
    this.serverSupports = data;
  }
}


export class CoreClient extends GMCPPackage {
  constructor(client: MudClient) {
    super(client);
  }

  setClient(name: string, version: string): void {
    this.sendData({ "name": name, "version": version });
  }
}

export class ClientMedia extends GMCPPackage {
  public packageName: string = 'Core.Media';
  sounds: { [key: string]: Howl } = {};
  defaultUrl: string = '';

  constructor(client: MudClient) {
    super(client);
  }

  handleDefault(url: string): void {
    this.defaultUrl = url;
  }

  handleLoad(data: GMCPMessageClientMediaLoad): void {
    const url = data.url || this.defaultUrl + data.name;
    this.sounds[data.name] = new Howl({ src: [url] });
  }

  handlePlay(data: GMCPMnessageClientMediaPlay): void {
    let sound = this.sounds[data.name];
    if (!sound) {
      sound = new Howl({ src: [data.url || this.defaultUrl + data.name] });
    }
    sound.volume(data.volume);
    if (data.fadein) {
      sound.fade(0, data.volume, data.fadein);
    }
    if (data.fadeout) {
      sound.fade(data.volume, 0, data.fadeout);
    }
    if (data.start) {
      sound.seek(data.start);
    }
    if (data.loops) {
      sound.loop(data.loops);
    }
  }

  handleStop(data: GMCPMessageClientMediaStop): void {
    if (data.name) {
      let sound = this.sounds[data.name];
      if (sound) {
        sound.stop();
      }
    }

  }

}

