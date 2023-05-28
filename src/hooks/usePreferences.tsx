import { useEffect, useReducer } from "react";
import { PrefAction, PrefState } from "../PreferencesStore";
import { preferencesStore } from "../PreferencesStore";

type PreferencesHook = [PrefState, (action: PrefAction) => void];

export const usePreferences = (): PreferencesHook => {
  const [, forceRender] = useReducer((s) => s + 1, 0);

  useEffect(() => preferencesStore.subscribe(forceRender), []);

  return [preferencesStore.getState(), preferencesStore.dispatch];
};
