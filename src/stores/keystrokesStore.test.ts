import { beforeEach, describe, expect, it } from "vitest";
import {
  findBinding,
  keyTakenBy,
  resolveLayer,
  type KeystrokeLayer,
  useKeystrokesStore,
} from "./keystrokesStore";

const scrabble: KeystrokeLayer = {
  id: "#4936",
  label: "Scrabble",
  modal: true,
  bindings: [
    { key: "ArrowLeft", modifiers: [], command: "press left on #4936", label: "Cursor left", autosend: true },
    { key: "p", modifiers: [], command: "press p on #4936", label: "Place the selected tile", autosend: true },
    { key: "s", modifiers: ["ctrl"], command: "status", label: "Ship status", autosend: false },
  ],
};

const helm: KeystrokeLayer = {
  id: "#12",
  label: "Helm console",
  modal: false,
  bindings: [
    { key: "s", modifiers: ["control"], command: "scan", label: "Scan", autosend: true },
    { key: "w", modifiers: ["ctrl"], command: "warp", label: "Warp", autosend: true },
    { key: "x", modifiers: ["hyper"], command: "eject", label: "Eject", autosend: true },
  ],
};

function keyEvent(init: KeyboardEventInit): KeyboardEvent {
  return new KeyboardEvent("keydown", init);
}

describe("useKeystrokesStore", () => {
  beforeEach(() => useKeystrokesStore.getState().clearLayers());

  it("adds layers in arrival order and moves a replaced layer to the end", () => {
    const store = useKeystrokesStore.getState();
    expect(store.putLayer(scrabble)).toBe(true);
    expect(store.putLayer(helm)).toBe(true);
    expect(store.putLayer({ ...scrabble, label: "Scrabble board" })).toBe(false);

    expect(useKeystrokesStore.getState().layers.map((layer) => layer.label)).toEqual([
      "Helm console",
      "Scrabble board",
    ]);
  });

  it("removes a layer and returns it, and ignores one that is not there", () => {
    const store = useKeystrokesStore.getState();
    store.putLayer(scrabble);
    expect(store.removeLayer("#4936")).toEqual(scrabble);
    expect(store.removeLayer("#4936")).toBeUndefined();
    expect(useKeystrokesStore.getState().layers).toEqual([]);
  });

  it("clears every layer and keys mode", () => {
    const store = useKeystrokesStore.getState();
    store.putLayer(scrabble);
    store.setKeysMode(true);
    store.clearLayers();
    expect(useKeystrokesStore.getState().layers).toEqual([]);
    expect(useKeystrokesStore.getState().keysMode).toBe(false);
  });
});

describe("resolveLayer", () => {
  it("marks bindings the client keeps or cannot read as unavailable", () => {
    const resolved = resolveLayer(helm, {});
    expect(resolved.map((binding) => binding.unavailable)).toEqual([
      undefined,
      "The browser keeps this key",
      'Unknown modifier "hyper"',
    ]);
    expect(resolved[0].chord).toEqual({ key: "s", modifiers: ["ctrl"] });
  });

  it("applies the player's key for that layer and command", () => {
    const resolved = resolveLayer(helm, {
      "#12": { warp: { key: "j", modifiers: ["ctrl"] } },
      "#4936": { scan: { key: "q", modifiers: [] } },
    });
    expect(resolved[0].chord).toEqual({ key: "s", modifiers: ["ctrl"] });
    expect(resolved[1].chord).toEqual({ key: "j", modifiers: ["ctrl"] });
    expect(resolved[1].unavailable).toBeUndefined();
    expect(resolved[1].changed).toBe(true);
  });
});

describe("findBinding", () => {
  it("fires Ctrl bindings outside keys mode", () => {
    const found = findBinding([helm], {}, false, keyEvent({ key: "s", code: "KeyS", ctrlKey: true }));
    expect(found?.binding.command).toBe("scan");
  });

  it("fires bindings without Ctrl, Alt or Meta only in keys mode", () => {
    const press = keyEvent({ key: "p", code: "KeyP" });
    expect(findBinding([scrabble], {}, false, press)).toBeUndefined();
    expect(findBinding([scrabble], {}, true, press)?.binding.command).toBe("press p on #4936");
  });

  it("never fires on auto-repeat", () => {
    const press = keyEvent({ key: "s", code: "KeyS", ctrlKey: true, repeat: true });
    expect(findBinding([helm], {}, true, press)).toBeUndefined();
  });

  it("lets the layer that arrived last win", () => {
    const press = keyEvent({ key: "s", code: "KeyS", ctrlKey: true });
    expect(findBinding([scrabble, helm], {}, false, press)?.binding.command).toBe("scan");
    expect(findBinding([helm, scrabble], {}, false, press)?.binding.command).toBe("status");
  });

  it("does not fire an unavailable binding", () => {
    const press = keyEvent({ key: "w", code: "KeyW", ctrlKey: true });
    expect(findBinding([helm], {}, false, press)).toBeUndefined();
  });

  it("fires on the player's key and not on the server's", () => {
    const overrides = { "#12": { scan: { key: "k", modifiers: ["ctrl" as const] } } };
    expect(findBinding([helm], overrides, false, keyEvent({ key: "s", code: "KeyS", ctrlKey: true }))).toBeUndefined();
    expect(
      findBinding([helm], overrides, false, keyEvent({ key: "k", code: "KeyK", ctrlKey: true }))?.binding.command,
    ).toBe("scan");
  });
});

describe("keyTakenBy", () => {
  it("names the reserved shortcut or the binding that has the key", () => {
    const layers = [scrabble, helm];
    expect(keyTakenBy(layers, {}, { key: "w", modifiers: ["ctrl"] }, scrabble.id, "status")).toBe(
      "The browser keeps this key",
    );
    expect(keyTakenBy(layers, {}, { key: "p", modifiers: [] }, helm.id, "scan")).toBe(
      "Scrabble: Place the selected tile",
    );
    expect(keyTakenBy(layers, {}, { key: "q", modifiers: [] }, helm.id, "scan")).toBeUndefined();
  });

  it("does not count the binding being changed", () => {
    expect(keyTakenBy([scrabble], {}, { key: "p", modifiers: [] }, scrabble.id, "press p on #4936")).toBeUndefined();
  });
});
