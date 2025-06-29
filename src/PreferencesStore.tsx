export enum AutoreadMode {
  Off = "off",
  Unfocused = "unfocused",
  All = "all",
}

export type GeneralPreferences = {
  localEcho: boolean;
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

export type PrefState = {
  general: GeneralPreferences;
  speech: SpeechPreferences;
  sound: SoundPreferences;
  channels?: { [channelId: string]: ChannelPreferences };
  editor: EditorPreferences;
};

export enum PrefActionType {
  SetGeneral = "SET_GENERAL",
  SetSpeech = "SET_SPEECH",
  SetSound = "SET_SOUND",
  SetChannels = "SET_CHANNELS",
  SetEditorAutocompleteEnabled = "SET_EDITOR_AUTOCOMPLETE_ENABLED",
  SetEditorAccessibilityMode = "SET_EDITOR_ACCESSIBILITY_MODE",
}

export type PrefAction =
  | { type: PrefActionType.SetGeneral; data: GeneralPreferences }
  | { type: PrefActionType.SetSpeech; data: SpeechPreferences }
  | { type: PrefActionType.SetSound; data: SoundPreferences }
  | { type: PrefActionType.SetChannels; data: { [channelId: string]: ChannelPreferences } }
  | { type: PrefActionType.SetEditorAutocompleteEnabled; data: boolean }
  | { type: PrefActionType.SetEditorAccessibilityMode; data: boolean };

class PreferencesStore {
  private state: PrefState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    // Merge the initial preferences with the stored preferences from localStorage
    const storedData = localStorage.getItem("preferences");
    const initialPreferences = this.getInitialPreferences();
    let parsedData = storedData ? JSON.parse(storedData) : null;
    
    // Migration: move volume from general to sound if it exists
    if (parsedData?.general?.volume !== undefined && parsedData?.sound) {
      if (!parsedData.sound.volume) {
        parsedData.sound.volume = parsedData.general.volume;
      }
      delete parsedData.general.volume;
    }
    
    this.state = parsedData ? this.mergePreferences(initialPreferences, parsedData) : initialPreferences;
  }

  private getInitialPreferences(): PrefState {
    return {
      general: {
        localEcho: false,
      },
      speech: {
        autoreadMode: AutoreadMode.Off,
        voice: "",
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
      },
      sound: {
        muteInBackground: false,
        volume: 1.0,
      },
      channels: {
        "sayto": {
          autoreadMode: AutoreadMode.Off,
          notify: true,
        },
      },
      editor: {
        autocompleteEnabled: true,
        accessibilityMode: true,
      },
    };
  }

  private mergePreferences(initial: PrefState, stored: PrefState): PrefState {
    // Merge the stored preferences with the initial preferences, picking up new preferences
    return {
      ...initial,
      general: { ...initial.general, ...stored.general },
      speech: { ...initial.speech, ...stored.speech },
      sound: { ...initial.sound, ...stored.sound },
      channels: stored.channels ? { ...initial.channels, ...stored.channels } : initial.channels,
      editor: { ...initial.editor, ...stored.editor },
    };
  }

  private reducer(state: PrefState, action: PrefAction): PrefState {
    switch (action.type) {
      case PrefActionType.SetGeneral:
        return { ...state, general: action.data };
      case PrefActionType.SetSpeech:
        return { ...state, speech: action.data };
      case PrefActionType.SetSound:
        return { ...state, sound: action.data };
      case PrefActionType.SetChannels:
        return { ...state, channels: action.data };
      case PrefActionType.SetEditorAutocompleteEnabled:
        return { ...state, editor: { ...state.editor, autocompleteEnabled: action.data } };
      case PrefActionType.SetEditorAccessibilityMode:
        return { ...state, editor: { ...state.editor, accessibilityMode: action.data } };
      default:
        return state;
    }
  }

  dispatch = (action: PrefAction) => {
    this.state = this.reducer(this.state, action);
    localStorage.setItem("preferences", JSON.stringify(this.state));
    this.listeners.forEach((listener) => listener());
  }

  public getState(): PrefState {
    return this.state;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const preferencesStore = new PreferencesStore();
