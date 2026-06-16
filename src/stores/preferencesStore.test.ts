import { beforeEach, describe, expect, it, vi } from "vitest";
import { AutoreadMode, usePreferences } from "./preferencesStore";

describe("preferencesStore", () => {
  beforeEach(() => {
    // Reset to known defaults between tests.
    usePreferences.getState().setGeneral({
      localEcho: false,
      syncTimezoneToServer: true,
      syncLocationToServer: false,
    });
    usePreferences.getState().setSound({ muteInBackground: false, volume: 1.0 });
    usePreferences.getState().setMidi({ enabled: false });
    localStorage.removeItem("preferences");
  });

  it("exposes default preferences", () => {
    expect(usePreferences.getState().general.localEcho).toBe(false);
    expect(usePreferences.getState().general.syncTimezoneToServer).toBe(true);
    expect(usePreferences.getState().general.syncLocationToServer).toBe(false);
    expect(usePreferences.getState().speech.autoreadMode).toBe(AutoreadMode.Off);
  });

  it("setSound replaces the sound section", () => {
    usePreferences.getState().setSound({ muteInBackground: true, volume: 0.5 });
    expect(usePreferences.getState().sound).toEqual({
      muteInBackground: true,
      volume: 0.5,
    });
  });

  it("setEditorAutocompleteEnabled updates only that field", () => {
    const before = usePreferences.getState().editor.accessibilityMode;
    usePreferences.getState().setEditorAutocompleteEnabled(false);
    expect(usePreferences.getState().editor.autocompleteEnabled).toBe(false);
    // other editor fields untouched
    expect(usePreferences.getState().editor.accessibilityMode).toBe(before);
  });

  it("persists changes to localStorage in the raw PrefState shape", () => {
    // localStorage is a no-op mock in the test setup, so assert on the write.
    const setItem = vi.mocked(localStorage.setItem);
    setItem.mockClear();
    usePreferences.getState().setGeneral({
      localEcho: true,
      syncTimezoneToServer: false,
      syncLocationToServer: true,
    });
    expect(setItem).toHaveBeenCalledWith("preferences", expect.any(String));
    const lastCall = setItem.mock.calls.at(-1);
    const stored = JSON.parse(lastCall?.[1] as string);
    expect(stored.general.localEcho).toBe(true);
    expect(stored.general.syncTimezoneToServer).toBe(false);
    expect(stored.general.syncLocationToServer).toBe(true);
    // action functions are not serialized by JSON.stringify
    expect(stored.setGeneral).toBeUndefined();
  });

  it("notifies subscribers on change", () => {
    let calls = 0;
    const unsub = usePreferences.subscribe(() => {
      calls += 1;
    });
    usePreferences.getState().setMidi({ enabled: true });
    unsub();
    expect(calls).toBe(1);
  });
});
