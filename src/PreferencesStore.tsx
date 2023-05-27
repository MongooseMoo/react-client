export type PrefState = {
  general: {
    localEcho: boolean;
  };
  speech: {
    voice: string;
    rate: number;
    pitch: number;
  };
};

export enum PrefActionType {
  SetGeneral = "SET_GENERAL",
  SetSpeech = "SET_SPEECH",
}

export type PrefAction =
  | { type: PrefActionType.SetGeneral; data: PrefState["general"] }
  | { type: PrefActionType.SetSpeech; data: PrefState["speech"] };

const initialState: PrefState = {
  general: {
    localEcho: false,
  },
  speech: {
    voice: "",
    rate: 1.0,
    pitch: 1.0,
  },
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
