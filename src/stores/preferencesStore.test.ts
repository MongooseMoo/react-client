import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AutoreadMode, usePreferences } from "./preferencesStore";

describe("preferencesStore", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Reset to known defaults between tests.
    usePreferences.getState().setGeneral({
      localEcho: false,
      syncTimezoneToServer: true,
      syncLocationToServer: false,
    });
    usePreferences.getState().setSound({ muteInBackground: false, volume: 1.0 });
    usePreferences.getState().setMidi({ enabled: false });
    usePreferences.getState().setAutologging({
      enabled: false,
      maxBytes: 100 * 1024 * 1024,
    });
    localStorage.removeItem("preferences");
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
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
    expect(setItem).not.toHaveBeenCalled();
    vi.runAllTimers();
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

  it("notifies selector subscribers only when their preference domain changes", () => {
    const listener = vi.fn();
    const unsub = usePreferences.subscribe(
      (state) => state.autologging,
      listener,
    );

    usePreferences.getState().setGeneral({
      localEcho: true,
      syncTimezoneToServer: true,
      syncLocationToServer: false,
    });
    expect(listener).not.toHaveBeenCalled();

    const autologging = { enabled: true, maxBytes: 2048 };
    usePreferences.getState().setAutologging(autologging);
    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith(
      autologging,
      expect.objectContaining({ enabled: false }),
    );

    unsub();
  });

  it("debounces a burst of preference persistence writes", () => {
    const setItem = vi.mocked(localStorage.setItem);
    setItem.mockClear();

    usePreferences.getState().setSpeech({
      ...usePreferences.getState().speech,
      rate: 1.1,
    });
    usePreferences.getState().setSpeech({
      ...usePreferences.getState().speech,
      rate: 1.2,
    });
    usePreferences.getState().setSpeech({
      ...usePreferences.getState().speech,
      rate: 1.3,
    });

    expect(setItem).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(setItem).toHaveBeenCalledOnce();

    const stored = JSON.parse(setItem.mock.calls[0][1]);
    expect(stored.speech.rate).toBe(1.3);
  });

  it("flushes pending preference persistence before the page is discarded", () => {
    const setItem = vi.mocked(localStorage.setItem);
    setItem.mockClear();

    usePreferences.getState().setSound({
      muteInBackground: true,
      volume: 0.5,
    });
    expect(setItem).not.toHaveBeenCalled();

    window.dispatchEvent(new Event("pagehide"));
    expect(setItem).toHaveBeenCalledOnce();

    const stored = JSON.parse(setItem.mock.calls[0][1]);
    expect(stored.sound).toEqual({
      muteInBackground: true,
      volume: 0.5,
    });
  });
});
