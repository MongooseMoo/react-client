import { inbound } from '../../protocol/messages';
import { gmcpJsonMessage } from '../messages';
import { GMCPPackage } from '../package';

// Interfaces based on IRE.Sound documentation keys
export interface IREPlayPayload {
  name: string;
  fadein_csec?: number;
  fadeout_csec?: number;
  loop?: boolean;
  // Add other potential keys if needed based on client capabilities
  volume?: number;
}

export interface IREStopPayload {
  name: string;
  fadeout_csec?: number;
}

export interface IREStopAllPayload {
  fadeout_csec?: number;
}

export interface IREPreloadPayload {
  name: string;
}

// This package handles IRE-specific sound messages and translates them into the
// shared media service payloads used by the MCMP Client.Media adapter.
const soundPlay = gmcpJsonMessage<'Play', IREPlayPayload>('Play');
const soundStop = gmcpJsonMessage<'Stop', IREStopPayload>('Stop');
const soundStopall = gmcpJsonMessage<'Stopall', IREStopAllPayload>('Stopall');
const soundPreload = gmcpJsonMessage<'Preload', IREPreloadPayload>('Preload');

const GmcPIRESoundBase = GMCPPackage.with({
  packageName: 'IRE.Sound',
  messages: [
    inbound(soundPlay),
    inbound(soundStop),
    inbound(soundStopall),
    inbound(soundPreload),
  ] as const,
});

export class GmcPIRESound extends GmcPIRESoundBase {
  constructor(client: ConstructorParameters<typeof GmcPIRESoundBase>[0]) {
    super(client);
    this.on('play', (data) => this.handlePlay(data));
    this.on('stop', (data) => this.handleStop(data));
    this.on('stopall', (data) => this.handleStopall(data));
    this.on('preload', (data) => this.handlePreload(data));
  }

  // --- Server Messages ---

  handlePlay(data: IREPlayPayload): void {
    console.log('Received IRE.Sound.Play:', data);
    void this.client.media
      .play({
        name: data.name,
        type: 'sound',
        volume: data.volume ?? 50,
        fadein: data.fadein_csec ? data.fadein_csec * 10 : 0,
        fadeout: data.fadeout_csec ? data.fadeout_csec * 10 : 0,
        loops: data.loop ? -1 : 0,
      })
      .catch((error) => {
        console.error('IRE.Sound.Play failed:', error);
      });
  }

  handleStop(data: IREStopPayload): void {
    console.log('Received IRE.Sound.Stop:', data);
    this.client.media.stop({ name: data.name });
  }

  handleStopall(data: IREStopAllPayload): void {
    console.log('Received IRE.Sound.Stopall:', data);
    this.client.media.stop({});
  }

  handlePreload(data: IREPreloadPayload): void {
    console.log('Received IRE.Sound.Preload:', data);
    void this.client.media.load({ name: data.name }).catch((error) => {
      console.error('IRE.Sound.Preload failed:', error);
    });
  }

  // No client messages defined
}
