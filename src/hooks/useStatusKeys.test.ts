import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { announce } from "@react-aria/live-announcer";
import { useCharacterStatusStore } from "../stores/characterStatusStore";
import { usePreferences } from "../stores/preferencesStore";
import { useStatusKeys } from "./useStatusKeys";

vi.mock("@react-aria/live-announcer", () => ({ announce: vi.fn() }));

const press = (init: KeyboardEventInit) => {
  const event = new KeyboardEvent("keydown", { altKey: true, cancelable: true, ...init });
  window.dispatchEvent(event);
  return event;
};

describe("useStatusKeys", () => {
  afterEach(() => {
    useCharacterStatusStore.getState().reset();
    usePreferences.getState().setKeyboard({ navigationKeyScheme: "jkli" });
    vi.mocked(announce).mockClear();
  });

  it("speaks each readout and keeps the browser from taking the key", () => {
    const { unmount } = renderHook(() => useStatusKeys());
    useCharacterStatusStore.getState().setMeters([
      { id: "health", kind: "health", label: "Health", value: 9, max: 10, words: "scratched", rate: 0 },
      { id: "#5", kind: "power", label: "Mana", value: 1, max: 4, rate: 0 },
    ], performance.now());
    useCharacterStatusStore.getState().setTarget({ name: "a rat", value: 0.5, words: "hurt" });

    expect(press({ key: "h", code: "KeyH" }).defaultPrevented).toBe(true);
    press({ key: "m", code: "KeyM" });
    press({ key: "v", code: "KeyV" });
    press({ key: "t", code: "KeyT" });
    expect(vi.mocked(announce).mock.calls).toEqual([
      ["Health 90%, scratched", "assertive"],
      ["Mana 25%", "assertive"],
      ["No body reserve", "assertive"],
      ["a rat 50%, hurt", "assertive"],
    ]);
    unmount();
    press({ key: "h", code: "KeyH" });
    expect(announce).toHaveBeenCalledTimes(4);
  });

  it("leaves H and T to the buffer keys under the Dvorak right-hand scheme, and ignores repeats", () => {
    const { unmount } = renderHook(() => useStatusKeys());
    usePreferences.getState().setKeyboard({ navigationKeyScheme: "dvorak-rh" });
    expect(press({ key: "h", code: "KeyJ" }).defaultPrevented).toBe(false);
    press({ key: "t", code: "KeyK" });
    press({ key: "m", code: "KeyM", repeat: true });
    expect(announce).not.toHaveBeenCalled();
    press({ key: "m", code: "KeyM" });
    expect(announce).toHaveBeenCalledWith("No power reserves", "assertive");
    unmount();
  });
});
