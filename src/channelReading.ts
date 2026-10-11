import {
  AutoreadMode,
  type ChannelPreferences,
  type ChannelReadMode,
  usePreferences,
} from "./stores/preferencesStore";

/** A channel with no saved settings follows Auto Read and the Speech voice. */
export const DEFAULT_CHANNEL_PREFERENCES: ChannelPreferences = {
  autoreadMode: "default",
  voice: "",
  notify: false,
};

export function channelPreferencesFor(channel: string): ChannelPreferences {
  return usePreferences.getState().channels[channel] ?? DEFAULT_CHANNEL_PREFERENCES;
}

/**
 * Whether this channel has its own reading rule. When it does, the channel's
 * rule decides whether its lines are spoken, and Auto Read leaves them alone.
 */
export function channelHasOwnReading(channel: string): boolean {
  return channelPreferencesFor(channel).autoreadMode !== "default";
}

export function shouldSpeak(mode: AutoreadMode, windowFocused: boolean): boolean {
  if (mode === AutoreadMode.All) return true;
  if (mode === AutoreadMode.Unfocused) return !windowFocused;
  return false;
}

export const CHANNEL_READ_MODES: readonly ChannelReadMode[] = [
  "default",
  AutoreadMode.Off,
  AutoreadMode.Unfocused,
  AutoreadMode.All,
];

export const CHANNEL_READ_MODE_LABELS: Record<ChannelReadMode, string> = {
  default: "Same as Auto Read",
  [AutoreadMode.Off]: "Never",
  [AutoreadMode.Unfocused]: "When the window is not focused",
  [AutoreadMode.All]: "Always",
};

export function nextChannelReadMode(mode: ChannelReadMode): ChannelReadMode {
  const index = CHANNEL_READ_MODES.indexOf(mode);
  return CHANNEL_READ_MODES[(index + 1) % CHANNEL_READ_MODES.length];
}

/** What is spoken for one channel message: who said it, then what they said. */
export function channelSpeechText(talker: string, text: string): string {
  return talker ? `${talker}. ${text}` : text;
}
