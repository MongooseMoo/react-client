import { duplex, inbound, outbound } from "../../protocol/messages";
import { useChannelHistoryStore } from "../../stores/channelHistoryStore";
import { gmcpJsonMessage } from "../messages";
import { GMCPMessage, GMCPPackage } from "../package";

export class GMCPMessageCommChannelText extends GMCPMessage {
  public readonly channel!: string;
  public readonly talker!: string;
  public readonly text!: string;
}

const channelList = gmcpJsonMessage<"List", string[], void>("List");
const channelText = gmcpJsonMessage<"Text", GMCPMessageCommChannelText>("Text");
const channelPlayers = gmcpJsonMessage<
  "Players",
  { name: string; channels?: string[] }[],
  string
>("Players");
const channelEnable = gmcpJsonMessage<"Enable", never, string>("Enable");
const channelStart = gmcpJsonMessage<"Start", string>("Start");
const channelEnd = gmcpJsonMessage<"End", string>("End");

const GMCPCommChannelBase = GMCPPackage.with({
  packageName: "Comm.Channel",
  messages: [
    duplex(channelList),
    inbound(channelText),
    duplex(channelPlayers),
    outbound(channelEnable),
    inbound(channelStart),
    inbound(channelEnd),
  ] as const,
});

export class GMCPCommChannel extends GMCPCommChannelBase {
  public channels: string[] = [];

  constructor(client: ConstructorParameters<typeof GMCPCommChannelBase>[0]) {
    super(client);
    this.on("list", (data) => this.handleList(data));
    this.on("text", (data) => this.handleText(data));
    this.on("players", (data) => this.handlePlayers(data));
    this.on("start", (data) => this.handleStart(data));
    this.on("end", (data) => this.handleEnd(data));
  }

  handleList(data: string[]): void {
    this.channels = data;

  }

  handleText(data: GMCPMessageCommChannelText): void {
    console.log(`Received Comm.Channel.Text on ${data.channel} from ${data.talker}: ${data.text}`);
    useChannelHistoryStore.getState().addChannelText(data);
    if (data.channel === "say_to_you" && !document.hasFocus()) {
      this.client.sendNotification(`Message from ${data.talker}`, data.text);
    }
  }

  // --- Players ---
  handlePlayers(data: { name: string; channels?: string[] }[]): void {
    console.log("Received Comm.Channel.Players:", data);
    // TODO: Update shared channel/player info
  }

  // --- Start/End/Text ---
  handleStart(channelName: string): void {
    console.log(`Received Comm.Channel.Start for ${channelName}`);
    // TODO: Potentially set a flag indicating channel text is incoming
  }

  handleEnd(channelName: string): void {
    console.log(`Received Comm.Channel.End for ${channelName}`);
    // TODO: Clear the flag set by handleStart
  }
}
