import { create } from "zustand";

export enum AutoreadMode {
  Off = "off",
  Unfocused = "unfocused",
  All = "all",
}

export type GeneralPreferences = {
  localEcho: boolean;
  syncTimezoneToServer: boolean;
  syncLocationToServer: boolean;
};

export type SpeechPreferences = {
  autoreadMode: AutoreadMode;
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
};

export type SoundPreferences = {
  muteInBackground: boolean;
  volume: number;
};

export type ChannelPreferences = {
  autoreadMode: AutoreadMode;
  notify: boolean;
};

export type EditorPreferences = {
  autocompleteEnabled: boolean;
  accessibilityMode: boolean;
};

export type NavigationKeyScheme = "jkli" | "wasd" | "dvorak-rh" | "dvorak-lh";

export type KeyboardPreferences = {
  navigationKeyScheme: NavigationKeyScheme;
};

export type MidiPreferences = {
  enabled: boolean;
  lastInputDeviceId?: string;
  lastOutputDeviceId?: string;
};

export type HapticsPreferences = {
  enabled: boolean;
  intensityCap: number;
  autoStopTimeout: number;
};

export type AutologgingPreferences = {
  enabled: boolean;
  maxBytes: number;
};

export type PrefState = {
  general: GeneralPreferences;
  speech: SpeechPreferences;
  sound: SoundPreferences;
  channels?: { [channelId: string]: ChannelPreferences };
  editor: EditorPreferences;
  keyboard: KeyboardPreferences;
  midi: MidiPreferences;
  haptics: HapticsPreferences;
  autologging: AutologgingPreferences;
};

type PrefActions = {
  setGeneral: (data: GeneralPreferences) => void;
  setSpeech: (data: SpeechPreferences) => void;
  setSound: (data: SoundPreferences) => void;
  setChannels: (data: { [channelId: string]: ChannelPreferences }) => void;
  setEditorAutocompleteEnabled: (value: boolean) => void;
  setEditorAccessibilityMode: (value: boolean) => void;
  setKeyboard: (data: KeyboardPreferences) => void;
  setMidi: (data: MidiPreferences) => void;
  setHaptics: (data: HapticsPreferences) => void;
  setAutologging: (data: AutologgingPreferences) => void;
};

const STORAGE_KEY = "preferences";

function getInitialPreferences(): PrefState {
  return {
    general: {
      localEcho: false,
      syncTimezoneToServer: true,
      syncLocationToServer: false,
    },
    speech: {
      autoreadMode: AutoreadMode.Off,
      voice: "",
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
    },
    sound: { muteInBackground: false, volume: 1.0 },
    channels: {
      sayto: { autoreadMode: AutoreadMode.Off, notify: true },
    },
    editor: { autocompleteEnabled: true, accessibilityMode: true },
    keyboard: { navigationKeyScheme: "jkli" },
    midi: { enabled: false },
    haptics: { enabled: false, intensityCap: 1.0, autoStopTimeout: 5 },
    autologging: { enabled: false, maxBytes: 100 * 1024 * 1024 },
  };
}

function mergePreferences(initial: PrefState, stored: PrefState): PrefState {
  // Deep-merge stored values onto defaults so newly-added preferences appear,
  // and strip removed haptics fields from old localStorage data.
  const storedHaptics = (stored.haptics ?? {}) as Record<string, unknown>;
  const { intifaceUrl, autoConnect, ...cleanHaptics } = storedHaptics;
  return {
    ...initial,
    general: { ...initial.general, ...stored.general },
    speech: { ...initial.speech, ...stored.speech },
    sound: { ...initial.sound, ...stored.sound },
    channels: stored.channels
      ? { ...initial.channels, ...stored.channels }
      : initial.channels,
    editor: { ...initial.editor, ...stored.editor },
    keyboard: { ...initial.keyboard, ...stored.keyboard },
    midi: { ...initial.midi, ...stored.midi },
    haptics: { ...initial.haptics, ...cleanHaptics },
    autologging: { ...initial.autologging, ...stored.autologging },
  };
}

function loadPreferences(): PrefState {
  const initial = getInitialPreferences();
  const storedData = localStorage.getItem(STORAGE_KEY);
  if (!storedData) return initial;

  let parsed: (PrefState & { general?: { volume?: number } }) | null = null;
  try {
    parsed = JSON.parse(storedData);
  } catch {
    return initial;
  }
  if (!parsed) return initial;

  // Migration: move volume from general to sound if it exists.
  if (parsed.general?.volume !== undefined && parsed.sound) {
    if (!parsed.sound.volume) {
      parsed.sound.volume = parsed.general.volume;
    }
    delete parsed.general.volume;
  }

  return mergePreferences(initial, parsed);
}

/**
 * Reactive preferences store. Read in React with selectors
 * (`usePreferences((s) => s.speech)`) and imperatively elsewhere
 * (`usePreferences.getState()`). Persisted to localStorage in the same raw
 * shape used before the Zustand migration, so existing saved preferences load.
 */
export const usePreferences = create<PrefState & PrefActions>((set) => ({
  ...loadPreferences(),
  setGeneral: (data) => set({ general: data }),
  setSpeech: (data) => set({ speech: data }),
  setSound: (data) => set({ sound: data }),
  setChannels: (data) => set({ channels: data }),
  setEditorAutocompleteEnabled: (value) =>
    set((s) => ({ editor: { ...s.editor, autocompleteEnabled: value } })),
  setEditorAccessibilityMode: (value) =>
    set((s) => ({ editor: { ...s.editor, accessibilityMode: value } })),
  setKeyboard: (data) => set({ keyboard: data }),
  setMidi: (data) => set({ midi: data }),
  setHaptics: (data) => set({ haptics: data }),
  setAutologging: (data) => set({ autologging: data }),
}));

// Persist on every change. JSON.stringify drops the action functions, leaving
// exactly the PrefState shape the previous store wrote.
usePreferences.subscribe((state) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
});
