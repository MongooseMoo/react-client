import { describe, expect, it } from "vitest";
import type { Chord, Modifier } from "./keystrokeChords";
import {
  HEAD_RECENTER_CHORD,
  KEYS_MODE_CHORD,
  VOICE_COMMAND_CHORD,
  isHeadRecenterShortcut,
  isVoiceCommandToggle,
  reservedReason,
} from "./reservedShortcuts";

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
  });
});
