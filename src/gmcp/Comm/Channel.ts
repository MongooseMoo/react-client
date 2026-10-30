import {
  channelPreferencesFor,
  channelSpeechText,
  shouldSpeak,
} from "../../channelReading";
import { duplex, inbound, outbound } from "../../protocol/messages";
import { useChannelHistoryStore } from "../../stores/channelHistoryStore";
import {
  type ChannelInfo,
  type ChannelKind,
  useChannelsStore,
} from "../../stores/channelsStore";
import { gmcpJsonMessage } from "../messages";
import { GMCPMessage, GMCPPackage } from "../package";

export class GMCPMessageCommChannelText extends GMCPMessage {
  public readonly channel!: string;
  public readonly talker!: string;
  public readonly text!: string;
}

const CHANNEL_KINDS: readonly ChannelKind[] = ["channel", "direct", "room"];

/**
 * Comm.Channel.List from the server: a list of
 * `{name, caption, command, kind, listening}`. `listening` is a MOO integer.
 */
export function decodeChannelList(payload: unknown): ChannelInfo[] {
  if (!Array.isArray(payload)) {
    throw new TypeError("Comm.Channel.List is not a list");
  }
  return payload.map((entry: unknown): ChannelInfo => {
    const { name, caption, command, kind, listening } = entry as Record<string, unknown>;
    if (
      typeof name !== "string" ||
      typeof caption !== "string" ||
      typeof command !== "string" ||
      !CHANNEL_KINDS.includes(kind as ChannelKind)
    ) {
      throw new TypeError(`Comm.Channel.List entry is malformed: ${JSON.stringify(entry)}`);
    }
    return { name, caption, command, kind: kind as ChannelKind, listening: Boolean(listening) };
  });
}

const channelList = gmcpJsonMessage<"List", ChannelInfo[], void>("List", {
  // A request for the list carries no data.
  encode: () => "",
  decode: decodeChannelList,
});
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
  constructor(client: ConstructorParameters<typeof GMCPCommChannelBase>[0]) {
    super(client);
    this.on("list", (data) => this.handleList(data));
    this.on("text", (data) => this.handleText(data));
    this.on("players", (data) => this.handlePlayers(data));
    this.on("start", (data) => this.handleStart(data));
    this.on("end", (data) => this.handleEnd(data));
  }

  handleList(data: ChannelInfo[]): void {
    useChannelsStore.getState().setChannels(data);
  }

  handleText(data: GMCPMessageCommChannelText): void {
    useChannelHistoryStore.getState().addChannelText(data);

    const preferences = channelPreferencesFor(data.channel);
    const focused = document.hasFocus();

    // A channel on "Same as Auto Read" is spoken, if at all, as its output
    // line by Auto Read. Only a channel with its own rule is spoken here.
    if (
      preferences.autoreadMode !== "default" &&
      shouldSpeak(preferences.autoreadMode, focused)
    ) {
      this.client.speak(channelSpeechText(data.talker, data.text), preferences.voice);
    }

    if ((data.channel === "say_to_you" || preferences.notify) && !focused) {
      this.client.sendNotification(`Message from ${data.talker}`, data.text);
    }
  }

  // --- Players ---
  handlePlayers(data: { name: string; channels?: string[] }[]): void {
    console.log("Received Comm.Channel.Players:", data);
    // TODO: Update shared channel/player info
  }

  // --- Start/End: the output lines between them are this channel's text ---
  handleStart(channelName: string): void {
    useChannelsStore.getState().setActiveChannel(channelName);
  }

  handleEnd(_channelName: string): void {
    useChannelsStore.getState().setActiveChannel(null);
  }

  override reset(): void {
    useChannelsStore.getState().reset();
  }
}
