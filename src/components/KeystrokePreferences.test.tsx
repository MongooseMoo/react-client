import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockAnnounce } = vi.hoisted(() => ({ mockAnnounce: vi.fn() }));

vi.mock("@react-aria/live-announcer", () => ({
  announce: mockAnnounce,
}));

import { useKeystrokesStore } from "../stores/keystrokesStore";
import { usePreferences } from "../stores/preferencesStore";
import KeystrokePreferencesTab from "./KeystrokePreferences";

const scrabble = {
  id: "#4936",
  label: "Scrabble",
  modal: true,
  bindings: [
    { key: "p", modifiers: [], command: "press p on #4936", label: "Place the selected tile", autosend: true },
    { key: "s", modifiers: ["ctrl"], command: "status", label: "Ship status", autosend: false },
  ],
};

const helm = {
  id: "#12",
  label: "Helm console",
  modal: false,
  bindings: [
    { key: "w", modifiers: ["ctrl"], command: "warp", label: "Warp", autosend: true },
    { key: "x", modifiers: ["hyper"], command: "eject", label: "Eject", autosend: true },
  ],
};

describe("KeystrokePreferencesTab", () => {
  beforeEach(() => {
    mockAnnounce.mockClear();
    usePreferences.setState({ keystrokes: {} });
    useKeystrokesStore.getState().clearLayers();
  });

  afterEach(() => cleanup());

  it("says so when no layer has sent keys", () => {
    render(<KeystrokePreferencesTab />);

    expect(screen.getByText(/No keys yet/)).toBeTruthy();
  });

  it("lists every layer and its keys, including unavailable ones with the reason", () => {
    act(() => {
      useKeystrokesStore.getState().putLayer(scrabble);
      useKeystrokesStore.getState().putLayer(helm);
    });

    render(<KeystrokePreferencesTab />);

    const scrabbleTable = screen.getByRole("table", { name: "Scrabble (keys mode)" });
    const place = within(scrabbleTable).getByRole("row", { name: /Place the selected tile/ });
    expect(within(place).getByRole("button", { name: "Change key for Place the selected tile, now P" })).toBeTruthy();
    expect(within(place).getByText("press p on #4936")).toBeTruthy();
    expect(within(place).getByText("Keys mode only")).toBeTruthy();

    const helmTable = screen.getByRole("table", { name: "Helm console" });
    const warp = within(helmTable).getByRole("row", { name: /Warp/ });
    expect(within(warp).getByText("Unavailable: The browser keeps this key")).toBeTruthy();
    const eject = within(helmTable).getByRole("row", { name: /Eject/ });
    expect(within(eject).getByRole("button", { name: "Change key for Eject, now hyper+x" })).toBeTruthy();
    expect(within(eject).getByText('Unavailable: Unknown modifier "hyper"')).toBeTruthy();
  });

  it("says whether keys mode is on", () => {
    render(<KeystrokePreferencesTab />);
    expect(screen.getByText(/Keys mode is off/)).toBeTruthy();

    act(() => useKeystrokesStore.getState().setKeysMode(true));
    expect(screen.getByText(/Keys mode is on/)).toBeTruthy();
  });

  describe("changing a key", () => {
    beforeEach(() => {
      act(() => {
        useKeystrokesStore.getState().putLayer(scrabble);
        useKeystrokesStore.getState().putLayer(helm);
      });
      render(<KeystrokePreferencesTab />);
    });

    function startChanging(name: RegExp): HTMLElement {
      const button = screen.getByRole("button", { name });
      button.focus();
      fireEvent.click(button);
      return button;
    }

    it("takes the next key pressed and remembers it for that layer and command", () => {
      const button = startChanging(/Change key for Ship status/);
      expect(button).toHaveAccessibleName("Press the new key for Ship status, or Escape to cancel");
      expect(mockAnnounce).toHaveBeenLastCalledWith(
        "Press the new key for Ship status, or Escape to cancel",
        "assertive",
        2000,
      );

      fireEvent.keyDown(button, { key: "Control", code: "ControlLeft", ctrlKey: true });
      fireEvent.keyDown(button, { key: "j", code: "KeyJ", ctrlKey: true });

      expect(usePreferences.getState().keystrokes).toEqual({
        "#4936": { status: { key: "j", modifiers: ["ctrl"] } },
      });
      expect(mockAnnounce).toHaveBeenLastCalledWith("Ship status: Ctrl+J", "assertive", 2000);
      expect(button).toHaveAccessibleName("Change key for Ship status, now Ctrl+J");
      expect(document.activeElement).toBe(button);
    });

    it("does not start again when Space, just taken as the new key, is released", () => {
      const button = startChanging(/Change key for Ship status/);

      fireEvent.keyDown(button, { key: " ", code: "Space" });
      const release = fireEvent.keyUp(button, { key: " ", code: "Space" });

      expect(release).toBe(false);
      expect(button).toHaveAccessibleName("Change key for Ship status, now Space");
    });

    it("refuses a key the client keeps and keeps listening", () => {
      const button = startChanging(/Change key for Ship status/);

      fireEvent.keyDown(button, { key: "w", code: "KeyW", ctrlKey: true });

      expect(usePreferences.getState().keystrokes).toEqual({});
      expect(mockAnnounce).toHaveBeenLastCalledWith(
        "Ctrl+W is taken: The browser keeps this key. Press another key, or Escape to cancel.",
        "assertive",
        2000,
      );
      expect(button).toHaveAccessibleName("Press the new key for Ship status, or Escape to cancel");
    });

    it("refuses a key another binding has", () => {
      const button = startChanging(/Change key for Ship status/);

      fireEvent.keyDown(button, { key: "p", code: "KeyP" });

      expect(usePreferences.getState().keystrokes).toEqual({});
      expect(mockAnnounce).toHaveBeenLastCalledWith(
        "P is taken: Scrabble: Place the selected tile. Press another key, or Escape to cancel.",
        "assertive",
        2000,
      );
    });

    it("cancels on Escape without leaving the dialog", () => {
      const button = startChanging(/Change key for Ship status/);

      const escapeAllowed = fireEvent.keyDown(button, { key: "Escape", code: "Escape" });

      expect(escapeAllowed).toBe(false);
      expect(usePreferences.getState().keystrokes).toEqual({});
      expect(mockAnnounce).toHaveBeenLastCalledWith("Change cancelled", "assertive", 2000);
      expect(button).toHaveAccessibleName("Change key for Ship status, now Ctrl+S");
    });

    it("stops listening when focus leaves", () => {
      const button = startChanging(/Change key for Ship status/);

      fireEvent.blur(button);

      expect(button).toHaveAccessibleName("Change key for Ship status, now Ctrl+S");
    });

    it("makes an unavailable binding usable with a free key", () => {
      const button = startChanging(/Change key for Warp/);

      fireEvent.keyDown(button, { key: "j", code: "KeyJ", altKey: true, ctrlKey: true });

      const warp = screen.getByRole("row", { name: /Warp/ });
      expect(within(warp).getByText("Ready. You changed this key.")).toBeTruthy();
    });
  });
});
