import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockAnnounce } = vi.hoisted(() => ({ mockAnnounce: vi.fn() }));

vi.mock("@react-aria/live-announcer", () => ({
  announce: mockAnnounce,
}));

import { useInputStore } from "../../stores/inputStore";
import { useItemsStore } from "../../stores/itemsStore";
import { useRoomStore } from "../../stores/roomStore";
import { useKeystrokesStore } from "../../stores/keystrokesStore";
import { usePreferences } from "../../stores/preferencesStore";
import { GMCPClientKeystrokes } from "./Keystrokes";

function createMockClient() {
  return {
    gmcp: { send: vi.fn(), handlers: { "Client.Media": { playEarcon: vi.fn() } } },
    sendCommand: vi.fn(),
  };
}

const scrabbleLayer = {
  id: "#4936",
  label: "Scrabble",
  modal: true,
  bindings: [
    { key: "ArrowLeft", modifiers: [], command: "press left on #4936", label: "Cursor left" },
    { key: "p", modifiers: [], command: "press p on #4936", label: "Place the selected tile" },
    { key: "s", modifiers: ["ctrl"], command: "status", label: "Ship status", autosend: false },
  ],
};

const helmLayer = {
  id: "#12",
  label: "Helm console",
  bindings: [
    { key: "s", modifiers: ["ctrl"], command: "scan", label: "Scan" },
    { key: "w", modifiers: ["ctrl"], command: "warp", label: "Warp" },
    { key: "F2", modifiers: ["alt"], command: "shields", label: "Shields" },
  ],
};

function press(target: Element, init: KeyboardEventInit): KeyboardEvent {
  const event = new KeyboardEvent("keydown", { bubbles: true, cancelable: true, ...init });
  target.dispatchEvent(event);
  return event;
}

const ctrlS = { key: "s", code: "KeyS", ctrlKey: true };
const altShiftH = { key: "H", code: "KeyH", altKey: true, shiftKey: true };

function element(id: string): HTMLElement {
  const found = document.getElementById(id);
  if (!found) throw new Error(`no #${id}`);
  return found;
}

describe("GMCPClientKeystrokes", () => {
  let client: ReturnType<typeof createMockClient>;
  let handler: GMCPClientKeystrokes;

  beforeEach(() => {
    mockAnnounce.mockClear();
    usePreferences.setState({ keystrokes: {} });
    useKeystrokesStore.getState().clearLayers();
    useInputStore.getState().clear();
    document.body.innerHTML = `
      <textarea id="command-input" aria-label="Command"></textarea>
      <div id="output" class="output" role="region" tabindex="0"><p id="line">line</p></div>
      <textarea id="notes" aria-label="Notes"></textarea>
      <dialog open><button id="dialog-button" type="button">OK</button></dialog>
    `;
    client = createMockClient();
    handler = new GMCPClientKeystrokes(client as never);
  });

  afterEach(() => {
    handler.shutdown();
    document.body.innerHTML = "";
  });

  describe("older messages", () => {
    it("fires a binding sent with the ctrl modifier", () => {
      handler.receiveRegisteredMessage("Bind", { key: "s", modifiers: ["ctrl"], command: "status", autosend: true });

      const event = press(document.body, ctrlS);

      expect(client.sendCommand).toHaveBeenCalledWith("status");
      expect(event.defaultPrevented).toBe(true);
    });

    it("keeps Bind, Unbind and Bind_all on the server keys layer", () => {
      handler.receiveRegisteredMessage("Bind", { key: "F1", modifiers: ["alt"], command: "look", autosend: true });
      handler.receiveRegisteredMessage("Bind", { key: "F3", modifiers: ["alt"], command: "score", autosend: true });
      handler.receiveRegisteredMessage("Unbind", { key: "f1", modifiers: ["option"] });

      expect(useKeystrokesStore.getState().layers).toEqual([
        {
          id: "",
          label: "Server keys",
          modal: false,
          bindings: [{ key: "F3", modifiers: ["alt"], command: "score", autosend: true }],
        },
      ]);

      handler.receiveRegisteredMessage("Bind_all", {
        bindings: [{ key: "F4", modifiers: ["alt"], command: "who" }],
      });
      expect(useKeystrokesStore.getState().layers[0].bindings).toEqual([
        { key: "F4", modifiers: ["alt"], command: "who", autosend: true },
      ]);
      expect(mockAnnounce).not.toHaveBeenCalled();
    });

    it("replaces a Bind for the same key", () => {
      handler.receiveRegisteredMessage("Bind", { key: "F1", modifiers: ["alt"], command: "look", autosend: true });
      handler.receiveRegisteredMessage("Bind", { key: "f1", modifiers: ["option"], command: "glance", autosend: true });

      expect(useKeystrokesStore.getState().layers[0].bindings.map((binding) => binding.command)).toEqual([
        "glance",
      ]);
    });

    it("removes every layer on UnbindAll", () => {
      handler.receiveRegisteredMessage("Layer", helmLayer);
      handler.receiveRegisteredMessage("Bind", { key: "F1", modifiers: ["alt"], command: "look", autosend: true });

      handler.receiveRegisteredMessage("UnbindAll", {});

      expect(useKeystrokesStore.getState().layers).toEqual([]);
    });

    it("answers ListBindings with every binding of every layer and its layer id", () => {
      handler.receiveRegisteredMessage("Bind", { key: "F1", modifiers: ["alt"], command: "look", autosend: true });
      handler.receiveRegisteredMessage("Layer", scrabbleLayer);

      handler.receiveRegisteredMessage("ListBindings", {});

      expect(client.gmcp.send).toHaveBeenCalledTimes(1);
      const [name, payload] = client.gmcp.send.mock.calls[0];
      expect(name).toBe("Client.Keystrokes.BindingsList");
      expect(JSON.parse(payload)).toEqual([
        { id: "", key: "F1", modifiers: ["alt"], command: "look", autosend: true },
        { id: "#4936", key: "ArrowLeft", modifiers: [], command: "press left on #4936", label: "Cursor left", autosend: true },
        { id: "#4936", key: "p", modifiers: [], command: "press p on #4936", label: "Place the selected tile", autosend: true },
        { id: "#4936", key: "s", modifiers: ["ctrl"], command: "status", label: "Ship status", autosend: false },
      ]);
    });
  });

  describe("layers", () => {
    it("adds a layer, defaulting modal to false and autosend to true", () => {
      handler.receiveRegisteredMessage("Layer", helmLayer);

      expect(useKeystrokesStore.getState().layers).toEqual([
        {
          id: "#12",
          label: "Helm console",
          modal: false,
          bindings: helmLayer.bindings.map((binding) => ({ ...binding, autosend: true })),
        },
      ]);
    });

    it("announces a non-modal layer with the number of keys it installs", () => {
      handler.receiveRegisteredMessage("Layer", helmLayer);

      expect(mockAnnounce).toHaveBeenCalledWith("Helm console keys: 2", "assertive", 2000);
    });

    it("announces a modal layer and does not switch keys mode on", () => {
      handler.receiveRegisteredMessage("Layer", scrabbleLayer);

      expect(mockAnnounce).toHaveBeenCalledWith(
        "Scrabble keys available. Alt+Shift+H for keys mode.",
        "assertive",
        2000,
      );
      expect(useKeystrokesStore.getState().keysMode).toBe(false);
    });

    it("does not announce a layer again when it is replaced", () => {
      handler.receiveRegisteredMessage("Layer", helmLayer);
      mockAnnounce.mockClear();

      handler.receiveRegisteredMessage("Layer", helmLayer);

      expect(mockAnnounce).not.toHaveBeenCalled();
    });

    it("removes a layer and says so, and ignores one that is not there", () => {
      handler.receiveRegisteredMessage("Layer", helmLayer);
      mockAnnounce.mockClear();

      handler.receiveRegisteredMessage("RemoveLayer", { id: "#12" });
      handler.receiveRegisteredMessage("RemoveLayer", { id: "#12" });

      expect(useKeystrokesStore.getState().layers).toEqual([]);
      expect(mockAnnounce).toHaveBeenCalledTimes(1);
      expect(mockAnnounce).toHaveBeenCalledWith("Helm console keys removed", "assertive", 2000);
    });

    it("switches keys mode off when the last modal layer goes", () => {
      handler.receiveRegisteredMessage("Layer", scrabbleLayer);
      handler.receiveRegisteredMessage("Layer", { ...scrabbleLayer, id: "#5000", label: "Chess" });
      press(element("command-input"), altShiftH);
      mockAnnounce.mockClear();

      handler.receiveRegisteredMessage("RemoveLayer", { id: "#4936" });
      expect(useKeystrokesStore.getState().keysMode).toBe(true);
      expect(mockAnnounce).toHaveBeenLastCalledWith("Scrabble keys removed", "assertive", 2000);

      handler.receiveRegisteredMessage("RemoveLayer", { id: "#5000" });
      expect(useKeystrokesStore.getState().keysMode).toBe(false);
      expect(mockAnnounce).toHaveBeenLastCalledWith("Chess keys removed. Keys mode off", "assertive", 2000);
    });

    it("lets the layer that arrived last win a shared key", () => {
      handler.receiveRegisteredMessage("Layer", helmLayer);
      handler.receiveRegisteredMessage("Layer", scrabbleLayer);

      press(document.body, ctrlS);

      expect(useInputStore.getState().text).toBe("status");
      expect(client.sendCommand).not.toHaveBeenCalled();
    });

    it("uses the key the player chose for that layer and command", () => {
      usePreferences.getState().setKeystrokeOverride("#12", "scan", { key: "j", modifiers: ["ctrl"] });
      handler.receiveRegisteredMessage("Layer", helmLayer);

      press(document.body, ctrlS);
      press(document.body, { key: "j", code: "KeyJ", ctrlKey: true });

      expect(client.sendCommand).toHaveBeenCalledTimes(1);
      expect(client.sendCommand).toHaveBeenCalledWith("scan");
    });

    it("fills words from the input box into the command", () => {
      handler.receiveRegisteredMessage("Layer", {
        id: "#1",
        label: "Mail",
        bindings: [{ key: "m", modifiers: ["ctrl"], command: "mail %2 to %1 (%*)", label: "Mail" }],
      });
      useInputStore.getState().setText("bob hello");

      press(document.body, { key: "m", code: "KeyM", ctrlKey: true });

      expect(client.sendCommand).toHaveBeenCalledWith("mail hello to bob (bob hello)");
    });

    it("clears every layer on reset", () => {
      handler.receiveRegisteredMessage("Layer", scrabbleLayer);
      useKeystrokesStore.getState().setKeysMode(true);

      handler.reset();

      expect(useKeystrokesStore.getState().layers).toEqual([]);
      expect(useKeystrokesStore.getState().keysMode).toBe(false);
    });
  });

  describe("where keys work", () => {
    beforeEach(() => handler.receiveRegisteredMessage("Layer", helmLayer));

    it("fires in the command input, the output and on the page body", () => {
      press(element("command-input"), ctrlS);
      press(element("output"), ctrlS);
      press(element("line"), ctrlS);
      press(document.body, ctrlS);

      expect(client.sendCommand).toHaveBeenCalledTimes(4);
    });

    it("never fires in another text field or a dialog", () => {
      const inNotes = press(element("notes"), ctrlS);
      const inDialog = press(element("dialog-button"), ctrlS);

      expect(client.sendCommand).not.toHaveBeenCalled();
      expect(inNotes.defaultPrevented).toBe(false);
      expect(inDialog.defaultPrevented).toBe(false);
    });

    it("stops the key reaching the focused element's own handler", () => {
      const reached = vi.fn();
      element("command-input").addEventListener("keydown", reached);

      press(element("command-input"), ctrlS);

      expect(reached).not.toHaveBeenCalled();
    });

    it("never fires on auto-repeat", () => {
      press(document.body, { ...ctrlS, repeat: true });

      expect(client.sendCommand).not.toHaveBeenCalled();
    });
  });

  describe("keys mode", () => {
    beforeEach(() => {
      handler.receiveRegisteredMessage("Layer", scrabbleLayer);
      mockAnnounce.mockClear();
    });

    it("fires typing keys even when the command input has text", () => {
      press(document.body, altShiftH);
      useInputStore.getState().setText("half typed");

      const typed = press(element("command-input"), { key: "p", code: "KeyP" });

      expect(typed.defaultPrevented).toBe(true);
      expect(client.sendCommand).toHaveBeenCalledWith("press p on #4936");
    });

    it("switches keys mode off for a staged command and back on when it is sent", () => {
      handler.receiveRegisteredMessage("Layer", {
        id: "#7",
        label: "Yahtzee",
        modal: true,
        bindings: [{ key: "s", modifiers: ["shift"], command: "score ", label: "Score", autosend: false }],
      });
      press(document.body, altShiftH);

      press(element("command-input"), { key: "S", code: "KeyS", shiftKey: true });
      expect(useInputStore.getState().text).toBe("score ");
      expect(useKeystrokesStore.getState().keysMode).toBe(false);
      expect(mockAnnounce).toHaveBeenLastCalledWith("Keys mode off", "assertive", 2000);

      const typed = press(element("command-input"), { key: "p", code: "KeyP" });
      expect(typed.defaultPrevented).toBe(false);

      expect(useKeystrokesStore.getState().commandSent()).toBe(true);
      expect(useKeystrokesStore.getState().keysMode).toBe(true);
      expect(useKeystrokesStore.getState().commandSent()).toBe(false);
    });

    it("does not turn keys mode back on after a staged command once the modal layers are gone", () => {
      handler.receiveRegisteredMessage("Layer", { ...scrabbleLayer, bindings: [
        { key: "s", modifiers: ["shift"], command: "score ", label: "Score", autosend: false },
      ] });
      press(document.body, altShiftH);
      press(element("command-input"), { key: "S", code: "KeyS", shiftKey: true });

      handler.receiveRegisteredMessage("RemoveLayer", { id: scrabbleLayer.id });

      expect(useKeystrokesStore.getState().commandSent()).toBe(false);
      expect(useKeystrokesStore.getState().keysMode).toBe(false);
    });

    it("still fires a Ctrl binding while the command input has text", () => {
      handler.receiveRegisteredMessage("Layer", helmLayer);
      useInputStore.getState().setText("half typed");

      press(element("command-input"), ctrlS);

      expect(client.sendCommand).toHaveBeenCalled();
    });

    it("leaves typing keys to the command input until keys mode is on", () => {
      const typed = press(element("command-input"), { key: "p", code: "KeyP" });

      expect(client.sendCommand).not.toHaveBeenCalled();
      expect(typed.defaultPrevented).toBe(false);
    });

    it("turns on and off with Alt+Shift+H and says which layers it is for", () => {
      const toggle = press(element("command-input"), altShiftH);
      expect(toggle.defaultPrevented).toBe(true);
      expect(useKeystrokesStore.getState().keysMode).toBe(true);
      expect(mockAnnounce).toHaveBeenLastCalledWith("Keys mode on: Scrabble", "assertive", 2000);

      press(element("command-input"), { key: "p", code: "KeyP" });
      expect(client.sendCommand).toHaveBeenCalledWith("press p on #4936");

      press(element("output"), altShiftH);
      expect(useKeystrokesStore.getState().keysMode).toBe(false);
      expect(mockAnnounce).toHaveBeenLastCalledWith("Keys mode off", "assertive", 2000);
    });

    it("matches Alt+Shift+H by the physical key", () => {
      press(document.body, { key: "˙", code: "KeyH", altKey: true, shiftKey: true });

      expect(useKeystrokesStore.getState().keysMode).toBe(true);
    });

    it("does not toggle on auto-repeat or where keys do not work", () => {
      press(document.body, { ...altShiftH, repeat: true });
      press(element("notes"), altShiftH);

      expect(useKeystrokesStore.getState().keysMode).toBe(false);
    });

    it("never lets an unbound key type in keys mode, and lets Enter send", () => {
      press(document.body, altShiftH);

      const typed = press(element("command-input"), { key: "x", code: "KeyX" });
      const space = press(element("command-input"), { key: " ", code: "Space" });
      const enter = press(element("command-input"), { key: "Enter", code: "Enter" });

      expect(typed.defaultPrevented).toBe(true);
      expect(space.defaultPrevented).toBe(true);
      expect(enter.defaultPrevented).toBe(false);
      expect(client.sendCommand).not.toHaveBeenCalled();
    });

    it("cannot be bound by a layer", () => {
      handler.receiveRegisteredMessage("Layer", {
        id: "#9",
        label: "Greedy",
        bindings: [{ key: "h", modifiers: ["alt", "shift"], command: "grab", label: "Grab" }],
      });

      press(document.body, altShiftH);

      expect(client.sendCommand).not.toHaveBeenCalled();
      expect(useKeystrokesStore.getState().keysMode).toBe(true);
    });
  });

  describe("key help", () => {
    const altShiftF1 = { key: "F1", code: "F1", altKey: true, shiftKey: true };

    beforeEach(() => {
      handler.receiveRegisteredMessage("Layer", scrabbleLayer);
      press(document.body, altShiftF1);
    });

    it("says what each key does and does nothing else", () => {
      expect(mockAnnounce).toHaveBeenLastCalledWith(
        "Key help on. Press a key to hear what it does. Escape ends key help.", "assertive", 2000);

      const bound = press(element("command-input"), { key: "p", code: "KeyP" });
      expect(mockAnnounce).toHaveBeenLastCalledWith("P: Place the selected tile", "assertive", 2000);
      press(element("command-input"), { key: "x", code: "KeyX" });
      expect(mockAnnounce).toHaveBeenLastCalledWith("X: not bound", "assertive", 2000);
      press(element("command-input"), altShiftH);
      expect(mockAnnounce).toHaveBeenLastCalledWith("Alt+Shift+H turns keys mode on and off", "assertive", 2000);
      const enter = press(element("command-input"), { key: "Enter", code: "Enter" });

      expect(bound.defaultPrevented).toBe(true);
      expect(enter.defaultPrevented).toBe(true);
      expect(client.sendCommand).not.toHaveBeenCalled();
      expect(useKeystrokesStore.getState().keysMode).toBe(false);
    });

    it("lets a lone modifier through", () => {
      const shift = press(element("command-input"), { key: "Shift", code: "ShiftLeft", shiftKey: true });

      expect(shift.defaultPrevented).toBe(false);
    });

    it("ends with Escape or Alt+Shift+F1", () => {
      press(element("command-input"), { key: "Escape", code: "Escape" });
      expect(mockAnnounce).toHaveBeenLastCalledWith("Key help off", "assertive", 2000);
      press(element("command-input"), { key: "p", code: "KeyP" });
      expect(client.sendCommand).not.toHaveBeenCalled();

      press(document.body, altShiftF1);
      press(document.body, altShiftF1);
      expect(mockAnnounce).toHaveBeenLastCalledWith("Key help off", "assertive", 2000);
    });
  });

  describe("interact mode", () => {
    const altBacktick = { key: "`", code: "Backquote", altKey: true };
    const tab = { key: "Tab", code: "Tab" };
    const ctrlI = { key: "i", code: "KeyI", ctrlKey: true };
    const said = () => mockAnnounce.mock.lastCall?.[0];

    beforeEach(() => {
      useItemsStore.getState().reset();
      useRoomStore.getState().reset();
      useItemsStore.getState().setLocationItems("inv", [{ id: "#7", name: "lamp", verbs: [["rub", "#7"]] }]);
      useItemsStore.getState().setLocationItems("room", [
        { id: "#8", name: "chest", verbs: [["open", "#8"]] },
        { id: "#9", name: "dust", verbs: [] },
        { id: "#10", name: "Rindalin" },
      ]);
      useRoomStore.getState().setRoomInfo({ num: 1, name: "Hall", area: "", exits: { north: 2 } } as never);
    });

    it("lands on what you carry, then what is here, then the exits, skipping what has no verbs", () => {
      const toggle = press(element("command-input"), altBacktick);

      expect(toggle.defaultPrevented).toBe(true);
      expect(useKeystrokesStore.getState().keysMode).toBe(true);
      expect(said()).toBe("Interact mode on. lamp, 1 of 4. Tab moves, Ctrl+I interacts, Escape ends.");
      const moves = [tab, tab, tab, tab].map((key) => {
        const event = press(element("command-input"), key);
        expect(event.defaultPrevented).toBe(true);
        return said();
      });
      expect(moves).toEqual(["chest, 2 of 4", "Rindalin, 3 of 4", "north exit, 4 of 4", "lamp, 1 of 4"]);
      press(element("command-input"), { ...tab, shiftKey: true });
      expect(said()).toBe("north exit, 4 of 4");
    });

    it("plays the earcon the server sent for each thing it lands on, and nothing for one without", () => {
      const lampEarcon = { name: "ui/tick.m4a", position: [1, 2, 0] };
      const northEarcon = { name: "ui/select.m4a", position: [0, 5, 1] };
      useItemsStore.getState().setLocationItems("inv", [
        { id: "#7", name: "lamp", verbs: [["rub", "#7"]], earcon: lampEarcon },
      ]);
      useRoomStore.getState().setRoomInfo({
        num: 1, name: "Hall", area: "", exits: { north: 2 }, earcons: { north: northEarcon },
      } as never);
      const playEarcon = client.gmcp.handlers["Client.Media"].playEarcon;

      press(document.body, altBacktick);
      press(document.body, tab);
      press(document.body, tab);
      press(document.body, tab);

      expect(playEarcon.mock.calls).toEqual([[lampEarcon], [northEarcon]]);
    });

    it("sends interact for the thing it is on, by number or by exit name", () => {
      press(element("output"), altBacktick);
      press(element("output"), ctrlI);
      press(element("output"), { ...tab, shiftKey: true });
      press(element("output"), ctrlI);

      expect(client.sendCommand.mock.calls).toEqual([["interact #7"], ["interact north"]]);
    });

    it("says so when the thing it is on has gone", () => {
      press(document.body, altBacktick);
      useItemsStore.getState().setLocationItems("inv", []);
      press(document.body, ctrlI);

      expect(client.sendCommand).not.toHaveBeenCalled();
      expect(said()).toBe("That is no longer here. Tab to choose again.");
      press(document.body, tab);
      expect(said()).toBe("chest, 1 of 3");
    });

    it("ends with Escape or Alt+backtick, leaving keys mode as it was", () => {
      press(document.body, altBacktick);
      press(document.body, { key: "Escape", code: "Escape" });
      expect(said()).toBe("Interact mode off");
      expect(useKeystrokesStore.getState().keysMode).toBe(false);
      const plainTab = press(document.body, tab);
      expect(plainTab.defaultPrevented).toBe(false);

      press(document.body, altShiftH);
      press(document.body, altBacktick);
      press(document.body, altBacktick);
      expect(said()).toBe("Interact mode off");
      expect(useKeystrokesStore.getState().keysMode).toBe(true);
    });

    it("ends when keys mode does", () => {
      press(document.body, altBacktick);
      press(document.body, altShiftH);
      expect(useKeystrokesStore.getState().keysMode).toBe(false);

      const plainTab = press(document.body, tab);
      press(document.body, ctrlI);
      expect(plainTab.defaultPrevented).toBe(false);
      expect(client.sendCommand).not.toHaveBeenCalled();
    });

    it("lets you type while paused for text, and comes back on the same thing when you send it", () => {
      press(document.body, altBacktick);
      press(document.body, tab);
      useKeystrokesStore.getState().pauseKeysMode();
      mockAnnounce.mockClear();

      const pausedTab = press(element("command-input"), tab);
      const typed = press(element("command-input"), { key: "x", code: "KeyX" });
      press(element("command-input"), ctrlI);
      expect(pausedTab.defaultPrevented).toBe(false);
      expect(typed.defaultPrevented).toBe(false);
      expect(client.sendCommand).not.toHaveBeenCalled();
      expect(mockAnnounce).not.toHaveBeenCalled();

      useKeystrokesStore.getState().commandSent();
      press(element("command-input"), ctrlI);
      expect(client.sendCommand).toHaveBeenCalledWith("interact #8");
    });

    it("does not start with nothing around", () => {
      useItemsStore.getState().reset();
      useRoomStore.getState().reset();
      press(document.body, altBacktick);

      expect(said()).toBe("Nothing here to interact with");
      expect(useKeystrokesStore.getState().keysMode).toBe(false);
    });

    it("cannot be bound by a layer, and key help names it", () => {
      handler.receiveRegisteredMessage("Layer", {
        id: "#9",
        label: "Greedy",
        bindings: [{ key: "`", modifiers: ["alt"], command: "grab", label: "Grab" }],
      });
      press(document.body, { key: "F1", code: "F1", altKey: true, shiftKey: true });
      press(document.body, altBacktick);

      expect(said()).toBe("Alt+backtick turns interact mode on and off");
      expect(client.sendCommand).not.toHaveBeenCalled();
    });
  });

  it("stops listening on shutdown", () => {
    handler.receiveRegisteredMessage("Layer", helmLayer);
    handler.shutdown();

    press(document.body, ctrlS);

    expect(client.sendCommand).not.toHaveBeenCalled();
  });
});
