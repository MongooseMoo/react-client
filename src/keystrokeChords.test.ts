import { describe, expect, it } from "vitest";
import {
  chordFromEvent,
  chordsEqual,
  formatChord,
  isTypingChord,
  matchesEvent,
  parseChord,
} from "./keystrokeChords";

function keyEvent(init: KeyboardEventInit): KeyboardEvent {
  return new KeyboardEvent("keydown", init);
}

describe("parseChord", () => {
  it("accepts every modifier alias in the spec", () => {
    expect(parseChord("s", ["control"])).toEqual(parseChord("s", ["ctrl"]));
    expect(parseChord("s", ["option"])).toEqual(parseChord("s", ["alt"]));
    expect(parseChord("s", ["cmd"])).toEqual(parseChord("s", ["meta"]));
    expect(parseChord("s", ["CTRL", "Shift"])).toEqual({
      chord: { key: "s", modifiers: ["ctrl", "shift"] },
    });
  });

  it("accepts the key aliases and ignores case", () => {
    expect(parseChord("left", []).chord?.key).toBe("arrowleft");
    expect(parseChord("RIGHT", []).chord?.key).toBe("arrowright");
    expect(parseChord("up", []).chord?.key).toBe("arrowup");
    expect(parseChord("down", []).chord?.key).toBe("arrowdown");
    expect(parseChord("esc", []).chord?.key).toBe("escape");
    expect(parseChord("space", []).chord?.key).toBe(" ");
    expect(parseChord("del", []).chord?.key).toBe("delete");
    expect(parseChord("P", []).chord?.key).toBe("p");
    expect(parseChord("ArrowLeft", []).chord?.key).toBe("arrowleft");
  });

  it("names a modifier it does not know", () => {
    expect(parseChord("s", ["hyper"])).toEqual({ error: 'Unknown modifier "hyper"' });
  });
});

describe("matchesEvent", () => {
  const chord = (key: string, modifiers: string[] = []) => {
    const parsed = parseChord(key, modifiers).chord;
    if (!parsed) throw new Error(`bad chord ${key}`);
    return parsed;
  };

  it("matches Ctrl bindings sent as ctrl", () => {
    expect(matchesEvent(chord("s", ["ctrl"]), keyEvent({ key: "s", code: "KeyS", ctrlKey: true }))).toBe(true);
  });

  it("requires the modifiers to match exactly", () => {
    expect(matchesEvent(chord("p"), keyEvent({ key: "p", code: "KeyP", ctrlKey: true }))).toBe(false);
    expect(matchesEvent(chord("p", ["ctrl"]), keyEvent({ key: "p", code: "KeyP" }))).toBe(false);
  });

  it("matches a letter or digit by its physical key", () => {
    expect(matchesEvent(chord("p", ["alt"]), keyEvent({ key: "π", code: "KeyP", altKey: true }))).toBe(true);
    expect(matchesEvent(chord("7", ["shift"]), keyEvent({ key: "&", code: "Digit7", shiftKey: true }))).toBe(true);
  });

  it("matches a letter by the character typed", () => {
    expect(matchesEvent(chord("a"), keyEvent({ key: "a", code: "KeyQ" }))).toBe(true);
    expect(matchesEvent(chord("p", ["shift"]), keyEvent({ key: "P", code: "KeyP", shiftKey: true }))).toBe(true);
  });

  it("matches named keys by event.key", () => {
    expect(matchesEvent(chord("left"), keyEvent({ key: "ArrowLeft", code: "ArrowLeft" }))).toBe(true);
    expect(matchesEvent(chord("F2"), keyEvent({ key: "F2", code: "F2" }))).toBe(true);
    expect(matchesEvent(chord("space"), keyEvent({ key: " ", code: "Space" }))).toBe(true);
  });
});

describe("chordFromEvent", () => {
  it("takes letters and digits from the physical key when the character is not one", () => {
    expect(chordFromEvent(keyEvent({ key: "π", code: "KeyP", altKey: true }))).toEqual({
      key: "p",
      modifiers: ["alt"],
    });
    expect(chordFromEvent(keyEvent({ key: "!", code: "Digit1", ctrlKey: true, shiftKey: true }))).toEqual({
      key: "1",
      modifiers: ["ctrl", "shift"],
    });
  });

  it("takes other keys from event.key", () => {
    expect(chordFromEvent(keyEvent({ key: "ArrowUp", code: "ArrowUp" }))).toEqual({
      key: "arrowup",
      modifiers: [],
    });
  });

  it("returns nothing for a lone modifier", () => {
    expect(chordFromEvent(keyEvent({ key: "Shift", code: "ShiftLeft", shiftKey: true }))).toBeUndefined();
  });
});

describe("chordsEqual", () => {
  it("ignores modifier order", () => {
    expect(
      chordsEqual({ key: "s", modifiers: ["shift", "ctrl"] }, { key: "s", modifiers: ["ctrl", "shift"] }),
    ).toBe(true);
  });
});

describe("formatChord", () => {
  it("writes chords the way the shortcut list does", () => {
    expect(formatChord({ key: "s", modifiers: ["shift", "ctrl"] })).toBe("Ctrl+Shift+S");
    expect(formatChord({ key: "arrowleft", modifiers: [] })).toBe("Left Arrow");
    expect(formatChord({ key: " ", modifiers: ["alt"] })).toBe("Alt+Space");
    expect(formatChord({ key: "f2", modifiers: ["meta"] })).toBe("Meta+F2");
    expect(formatChord({ key: "pagedown", modifiers: [] })).toBe("Page Down");
  });
});

describe("isTypingChord", () => {
  it("is true without Ctrl, Alt or Meta", () => {
    expect(isTypingChord({ key: "p", modifiers: [] })).toBe(true);
    expect(isTypingChord({ key: "p", modifiers: ["shift"] })).toBe(true);
    expect(isTypingChord({ key: "f2", modifiers: [] })).toBe(true);
    expect(isTypingChord({ key: "p", modifiers: ["ctrl"] })).toBe(false);
    expect(isTypingChord({ key: "p", modifiers: ["alt", "shift"] })).toBe(false);
    expect(isTypingChord({ key: "p", modifiers: ["meta"] })).toBe(false);
  });
});
