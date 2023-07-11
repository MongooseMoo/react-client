export type PrefState = {
  general: {
    localEcho: boolean;
  };
  speech: {
    autoreadMode: AutoreadMode;
    voice: string;
    rate: number;
    pitch: number;
    volume: number;
  };
  channels?: {
    [channelId: string]: {
      autoreadMode: AutoreadMode;
      notify: boolean;
    };
  };
};

export enum AutoreadMode {
  Off = "off",
  Unfocused = "unfocused",
  All = "all",
}

export enum PrefActionType {
  SetChannels = "SET_CHANNELS",
  SetGeneral = "SET_GENERAL",
  SetSpeech = "SET_SPEECH",
}

export type PrefAction =
  | { type: PrefActionType.SetGeneral; data: PrefState["general"] }
  | { type: PrefActionType.SetSpeech; data: PrefState["speech"] }
  | { type: PrefActionType.SetChannels; data: PrefState["channels"] };

const initialState: PrefState = {
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
  channels: {
    "sayto": {
      autoreadMode: AutoreadMode.Off,
      notify: true,
    },
  }
};

class PreferencesStore {
  private state: PrefState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    const storedData = localStorage.getItem("preferences");
    this.state = storedData
      ? { ...initialState, ...JSON.parse(storedData) }
      : { ...initialState };
  }

  private reducer = (state: PrefState, action: PrefAction): PrefState => {
    switch (action.type) {
      case PrefActionType.SetGeneral:
        return { ...state, general: action.data };
      case PrefActionType.SetSpeech:
        return { ...state, speech: action.data };
      default:
        return state;
    }
  };

  public dispatch = (action: PrefAction) => {
    this.state = this.reducer(this.state, action);
    localStorage.setItem("preferences", JSON.stringify(this.state));
    this.listeners.forEach((listener) => listener());
  };

  public getState = (): PrefState => this.state;
  public subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
      return undefined; // Make sure to return void.
    };
  };
}

export const preferencesStore = new PreferencesStore();
