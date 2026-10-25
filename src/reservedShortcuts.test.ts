import { afterEach, describe, expect, it } from "vitest";
import type { Chord, Modifier } from "./keystrokeChords";
import {
  HEAD_RECENTER_CHORD,
  KEYS_MODE_CHORD,
  VOICE_COMMAND_CHORD,
  isHeadRecenterShortcut,
  isVoiceCommandToggle,
  reservedReason,
  statusReadoutFor,
} from "./reservedShortcuts";
import { usePreferences } from "./stores/preferencesStore";

const chord = (key: string, ...modifiers: Modifier[]): Chord => ({ key, modifiers });

describe("reservedReason", () => {
  it("keeps the keys mode toggle", () => {
    expect(reservedReason(KEYS_MODE_CHORD)).toBe("Alt+Shift+H turns keys mode on and off");
  });

  it("keeps the voice command key from server key layers", () => {
    expect(reservedReason(VOICE_COMMAND_CHORD)).toBe("Alt+Shift+D listens for a voice command");
    expect(reservedReason(chord("d", "shift"))).toBeUndefined();
  });

  it("recognizes Alt+Shift+D by physical key, whatever character it types", () => {
    const press = (init: KeyboardEventInit) => isVoiceCommandToggle(new KeyboardEvent("keydown", init));
    expect(press({ code: "KeyD", key: "Î", altKey: true, shiftKey: true })).toBe(true);
    expect(press({ code: "KeyD", key: "D", altKey: true, shiftKey: true, ctrlKey: true })).toBe(false);
    expect(press({ code: "KeyD", key: "d", altKey: true })).toBe(false);
  });

  it("keeps both the voice command and head tracking keys, and neither shortcut takes the other's", () => {
    expect(reservedReason(VOICE_COMMAND_CHORD)).toBe("Alt+Shift+D listens for a voice command");
    expect(reservedReason(HEAD_RECENTER_CHORD)).toBe("Alt+Shift+O recenters head tracking");
    const keydown = (code: string) => new KeyboardEvent("keydown", { code, altKey: true, shiftKey: true });
    expect(isVoiceCommandToggle(keydown("KeyD"))).toBe(true);
    expect(isVoiceCommandToggle(keydown("KeyO"))).toBe(false);
    expect(isHeadRecenterShortcut(keydown("KeyO"))).toBe(true);
    expect(isHeadRecenterShortcut(keydown("KeyD"))).toBe(false);
  });

  it("keeps the keys the browser will not give a page", () => {
    for (const key of ["w", "t", "n", "tab"]) {
      expect(reservedReason(chord(key, "ctrl"))).toMatch(/browser/);
      expect(reservedReason(chord(key, "ctrl", "shift"))).toMatch(/browser/);
    }
  });

  it("keeps the client's own shortcuts", () => {
    expect(reservedReason(chord("3", "ctrl"))).toMatch(/output/);
    expect(reservedReason(chord("3", "ctrl", "shift"))).toMatch(/sidebar/);
    expect(reservedReason(chord("arrowleft", "alt"))).toMatch(/buffer/);
    expect(reservedReason(chord("j", "alt"))).toMatch(/buffer/);
    expect(reservedReason(chord("w", "alt"))).toMatch(/buffer/);
    expect(reservedReason(chord(",", "alt"))).toMatch(/buffer/);
    expect(reservedReason(chord("5", "alt"))).toMatch(/message/);
    expect(reservedReason(chord("5", "alt", "shift"))).toMatch(/buffer/);
    expect(reservedReason(chord("pageup", "alt"))).toMatch(/message/);
    expect(reservedReason(chord("home", "alt", "shift"))).toMatch(/message/);
    expect(reservedReason(chord(" ", "alt"))).toMatch(/message/);
    expect(reservedReason(chord("enter", "alt"))).toMatch(/link/);
    expect(reservedReason(chord(" ", "alt", "shift"))).toMatch(/cop/i);
    expect(reservedReason(chord("t", "alt", "shift"))).toMatch(/timestamp/);
    expect(reservedReason(chord("r", "alt", "shift"))).toMatch(/read aloud/);
    expect(reservedReason(chord("delete", "alt", "shift"))).toMatch(/buffer/);
    expect(reservedReason(chord("enter"))).toMatch(/send/);
    expect(reservedReason(chord("tab"))).toMatch(/Tab/);
    expect(reservedReason(chord("tab", "shift"))).toMatch(/Tab/);
    expect(reservedReason(chord("escape"))).toMatch(/sounds/);
    expect(reservedReason(chord("escape", "ctrl"))).toMatch(/sounds/);
    expect(reservedReason(chord("control", "ctrl"))).toMatch(/speech/);
    expect(reservedReason(chord("p", "alt", "shift"))).toMatch(/access key/);
  });

  it("leaves keys the client does not use", () => {
    expect(reservedReason(chord("p"))).toBeUndefined();
    expect(reservedReason(chord("arrowleft"))).toBeUndefined();
    expect(reservedReason(chord("s", "ctrl"))).toBeUndefined();
    expect(reservedReason(chord("f2"))).toBeUndefined();
    expect(reservedReason(chord("enter", "ctrl"))).toBeUndefined();
    expect(reservedReason(chord("x", "alt"))).toBeUndefined();
    // Mute and Volume no longer have access keys.
    expect(reservedReason(chord("m", "alt", "shift"))).toBeUndefined();
    expect(reservedReason(chord("v", "ctrl", "alt"))).toBeUndefined();
  });
});

describe("status keys", () => {
  const press = (init: KeyboardEventInit) => new KeyboardEvent("keydown", { altKey: true, ...init });

  afterEach(() => usePreferences.getState().setKeyboard({ navigationKeyScheme: "jkli" }));

  it("reads health, power, body and target on Alt+H, M, V and T", () => {
    expect(statusReadoutFor(press({ key: "h", code: "KeyH" }), "jkli")).toBe("health");
    expect(statusReadoutFor(press({ key: "m", code: "KeyM" }), "jkli")).toBe("power");
    expect(statusReadoutFor(press({ key: "v", code: "KeyV" }), "jkli")).toBe("body");
    expect(statusReadoutFor(press({ key: "t", code: "KeyT" }), "jkli")).toBe("target");
    expect(statusReadoutFor(press({ key: "x", code: "KeyX" }), "jkli")).toBeUndefined();
  });

  it("takes only plain Alt, and the physical key when Option types another character", () => {
    expect(statusReadoutFor(press({ key: "˙", code: "KeyH" }), "jkli")).toBe("health");
    expect(statusReadoutFor(press({ key: "H", code: "KeyH", shiftKey: true }), "jkli")).toBeUndefined();
    expect(statusReadoutFor(press({ key: "h", code: "KeyH", ctrlKey: true }), "jkli")).toBeUndefined();
    expect(statusReadoutFor(new KeyboardEvent("keydown", { key: "h", code: "KeyH" }), "jkli")).toBeUndefined();
  });

  it("yields H and T to the Dvorak right-hand buffer keys", () => {
    expect(statusReadoutFor(press({ key: "h", code: "KeyJ" }), "dvorak-rh")).toBeUndefined();
    expect(statusReadoutFor(press({ key: "t", code: "KeyK" }), "dvorak-rh")).toBeUndefined();
    expect(statusReadoutFor(press({ key: "m", code: "KeyM" }), "dvorak-rh")).toBe("power");
    expect(statusReadoutFor(press({ key: "v", code: "KeyV" }), "dvorak-rh")).toBe("body");
  });

  it("names the status key, or the buffer key when the chosen scheme uses the letter", () => {
    expect(reservedReason(chord("h", "alt"))).toBe("Alt+H reads your health");
    expect(reservedReason(chord("m", "alt"))).toBe("Alt+M reads your power reserves");
    expect(reservedReason(chord("v", "alt"))).toBe("Alt+V reads your body reserve");
    expect(reservedReason(chord("t", "alt"))).toBe("Alt+T reads your target's health");
    usePreferences.getState().setKeyboard({ navigationKeyScheme: "dvorak-rh" });
    expect(reservedReason(chord("h", "alt"))).toMatch(/buffer/);
    expect(reservedReason(chord("t", "alt"))).toMatch(/buffer/);
    expect(reservedReason(chord("m", "alt"))).toBe("Alt+M reads your power reserves");
  });
});
