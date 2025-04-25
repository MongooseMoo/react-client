import type MudClient from "../../client";
import { GMCPPackage } from "../package";

// Need to import dependent types/classes used within IRE.Sound
import { GMCPClientMedia, GMCPMessageClientMediaLoad, GMCPMessageClientMediaPlay, GMCPMessageClientMediaStop } from "../Client/Media";

// Interfaces based on IRE.Sound documentation keys
export interface IREPlayPayload {
  name: string;
  fadein_csec?: number;
  fadeout_csec?: number;
  loop?: boolean;
  // Add other potential keys if needed based on client capabilities
  volume?: number; // Example: Map to cacophony volume
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

// This package handles IRE-specific sound messages.
// It might delegate actual sound playing to the existing Client.Media handler
// or directly use the cacophony library if the parameters differ significantly.
export class GmcPIRESound extends GMCPPackage {
  public packageName: string = "IRE.Sound";
  private mediaHandler: GMCPClientMedia | undefined;

  constructor(client: MudClient) {
    super(client);
    // Get a reference to the Client.Media handler if needed for delegation
    // This assumes Client.Media is already initialized on the client
    this.mediaHandler = client.gmcpHandlers['Client.Media'] as GMCPClientMedia;
    if (!this.mediaHandler) {
      console.warn("IRE.Sound: Could not find Client.Media handler for potential delegation.");
    }
  }

  // --- Server Messages ---

  handlePlay(data: IREPlayPayload): void {
    console.log("Received IRE.Sound.Play:", data);
    // Option 1: Delegate to Client.Media if parameters map well
    if (this.mediaHandler) {
      // Translate IRE parameters to Client.Media parameters
      const mediaPlayData: GMCPMessageClientMediaPlay = {
        name: data.name,
        // url: undefined, // Assuming name is sufficient or needs resolving
        type: "sound", // Default type
        volume: 50, // Default volume, adjust if IRE provides it
        fadein: data.fadein_csec ? data.fadein_csec * 10 : 0, // Convert centiseconds to ms
        fadeout: data.fadeout_csec ? data.fadeout_csec * 10 : 0, // Convert centiseconds to ms
        loops: data.loop ? -1 : 0, // Map boolean loop to Client.Media loops (-1 for infinite)
        // priority: undefined, // Map if available
        // continue: true, // Default
        // key: undefined, // Map if available
        // is3d: false, // Default
        // pan: 0, // Default
        // position: [0, 0, 0], // Default
      };
      this.mediaHandler.handlePlay(mediaPlayData);
    } else {
      // Option 2: Implement directly using cacophony (if parameters differ significantly)
      console.warn("IRE.Sound.Play: No Client.Media handler found, direct implementation needed.");
      // TODO: Implement sound playing using this.client.cacophony
    }
    this.client.emit("ireSoundPlay", data);
  }

  handleStop(data: IREStopPayload): void {
    console.log("Received IRE.Sound.Stop:", data);
    if (this.mediaHandler) {
      const mediaStopData: GMCPMessageClientMediaStop = {
        name: data.name,
        // TODO: Handle fadeout if Client.Media supports it on stop
      };
      this.mediaHandler.handleStop(mediaStopData);
    } else {
      console.warn("IRE.Sound.Stop: No Client.Media handler found, direct implementation needed.");
      // TODO: Implement sound stopping using this.client.cacophony
    }
    this.client.emit("ireSoundStop", data);
  }

  handleStopall(data: IREStopAllPayload): void {
    console.log("Received IRE.Sound.Stopall:", data);
    if (this.mediaHandler) {
      const mediaStopData: GMCPMessageClientMediaStop = {
        // No specific name/type/tag/key means stop all
        // TODO: Handle fadeout if Client.Media supports it on stop all
      };
      this.mediaHandler.handleStop(mediaStopData);
    } else {
      console.warn("IRE.Sound.Stopall: No Client.Media handler found, direct implementation needed.");
      // TODO: Implement stop all sounds using this.client.cacophony
    }
    this.client.emit("ireSoundStopall", data);
  }

  handlePreload(data: IREPreloadPayload): void {
    console.log("Received IRE.Sound.Preload:", data);
    if (this.mediaHandler) {
      const mediaLoadData: GMCPMessageClientMediaLoad = {
        name: data.name,
        // url: undefined, // Assuming name is sufficient or needs resolving
      };
      this.mediaHandler.handleLoad(mediaLoadData);
    } else {
      console.warn("IRE.Sound.Preload: No Client.Media handler found, direct implementation needed.");
      // TODO: Implement sound preloading using this.client.cacophony
    }
    this.client.emit("ireSoundPreload", data);
  }

  // No client messages defined
}
