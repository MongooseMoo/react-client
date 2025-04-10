// State
export type InputState = {
  text: string;
};

// Action Types
export enum InputActionType {
  SetInput = "SET_INPUT",
  ClearInput = "CLEAR_INPUT",
}

// Actions
export type InputAction =
  | { type: InputActionType.SetInput; data: string }
  | { type: InputActionType.ClearInput };

// Store Class
class InputStore {
  private state: InputState = { text: "" };
  private listeners: Set<() => void> = new Set();

  private reducer(state: InputState, action: InputAction): InputState {
    switch (action.type) {
      case InputActionType.SetInput:
        // Only update if the text actually changed
        if (state.text !== action.data) {
          return { ...state, text: action.data };
        }
        return state;
      case InputActionType.ClearInput:
        if (state.text !== "") {
          return { ...state, text: "" };
        }
        return state;
      default:
        return state;
    }
  }

  dispatch = (action: InputAction) => {
    const previousState = this.state;
    this.state = this.reducer(this.state, action);
    // Only notify listeners if the state actually changed
    if (this.state !== previousState) {
      this.listeners.forEach((listener) => listener());
    }
  }

  getState(): InputState {
    return this.state;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

// Singleton instance
export const inputStore = new InputStore();

// Helper functions for easier dispatching
export const setInputText = (text: string) => {
  inputStore.dispatch({ type: InputActionType.SetInput, data: text });
};

export const clearInputText = () => {
  inputStore.dispatch({ type: InputActionType.ClearInput });
};
