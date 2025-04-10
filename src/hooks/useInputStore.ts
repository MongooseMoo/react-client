import { useEffect, useReducer } from "react";
import { inputStore, InputState, InputAction } from "../InputStore";

type InputStoreHook = [InputState, (action: InputAction) => void];

export const useInputStore = (): InputStoreHook => {
  const [, forceRender] = useReducer((s) => s + 1, 0);

  useEffect(() => {
    const unsubscribe = inputStore.subscribe(forceRender);
    return unsubscribe; // Cleanup subscription on unmount
  }, []);

  return [inputStore.getState(), inputStore.dispatch];
};
