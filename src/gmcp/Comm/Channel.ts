import { GMCPMessage, GMCPPackage } from "../package";

export class GMCPMessageCommChannelText extends GMCPMessage {
  public readonly channel!: string;
  public readonly talker!: string;
  public readonly text!: string;
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
    console.log(`Received Comm.Channel.Text on ${data.channel} from ${data.talker}: ${data.text}`);
    this.client.emit("channelText", data); // Emit the structured data
    if (data.channel === "say_to_you") {
      if (!document.hasFocus()) {
        this.client.sendNotification(`Message from ${data.talker}`, `${data.text}`);
      }
    }
  }

  // --- Players ---
  handlePlayers(data: { name: string; channels?: string[] }[]): void {
    console.log("Received Comm.Channel.Players:", data);
    // TODO: Update shared channel/player info
    this.client.emit("channelPlayers", data);
  }

  sendPlayersRequest(): void {
    this.sendData("Players", ""); // Empty body as per docs
  }

  // --- Enable ---
  sendEnable(channelName: string): void {
    this.sendData("Enable", channelName);
  }

  // --- Start/End/Text ---
  handleStart(channelName: string): void {
    console.log(`Received Comm.Channel.Start for ${channelName}`);
    // TODO: Potentially set a flag indicating channel text is incoming
    this.client.emit("channelStart", channelName);
  }

  handleEnd(channelName: string): void {
    console.log(`Received Comm.Channel.End for ${channelName}`);
    // TODO: Clear the flag set by handleStart
    this.client.emit("channelEnd", channelName);
  }
}
