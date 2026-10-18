import { create } from "zustand";

export type ChannelKind = "channel" | "direct" | "room";

/** One entry of the server's Comm.Channel.List. */
export interface ChannelInfo {
  /** The exact string used as `channel` in Comm.Channel.Text. */
  name: string;
  caption: string;
  command: string;
  kind: ChannelKind;
  listening: boolean;
}

interface ChannelsState {
  /** Channels the server listed, in the server's order. */
  channels: ChannelInfo[];
  /**
   * The channel whose text the server is sending right now: set by
   * Comm.Channel.Start, cleared by Comm.Channel.End. Output lines that arrive
   * while it is set belong to that channel.
   */
  activeChannel: string | null;
  setChannels: (channels: ChannelInfo[]) => void;
  setActiveChannel: (channel: string | null) => void;
  reset: () => void;
}

export const useChannelsStore = create<ChannelsState>((set) => ({
  channels: [],
  activeChannel: null,
  setChannels: (channels) => set({ channels }),
  setActiveChannel: (activeChannel) => set({ activeChannel }),
  reset: () => set({ channels: [], activeChannel: null }),
}));
