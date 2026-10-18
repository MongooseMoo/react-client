import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { announce } from "@react-aria/live-announcer";
import CommandInput from "./input";
import { clientSpeechSuspended } from "../clientSpeechSuspension";
import { useConnectionStore } from "../stores/connectionStore";
import { useInputStore } from "../stores/inputStore";
import { useLiveKitStore } from "../stores/liveKitStore";
import { usePersonalDataStore } from "../stores/personalDataStore";
import { usePreferences } from "../stores/preferencesStore";
import type { RecognitionConstructor } from "../voiceInput";
import { FakeRecognition, fakeRecognizer } from "../voiceInputTestHelpers";

const { addCommandMock } = vi.hoisted(() => ({ addCommandMock: vi.fn() }));

vi.mock("@react-aria/live-announcer", () => ({ announce: vi.fn() }));
vi.mock("../CommandHistory", () => ({
  CommandHistory: class {
    addCommand = addCommandMock;
    navigateUp = vi.fn(() => "recalled");
    navigateDown = vi.fn(() => "");
    getHistory = vi.fn(() => []);
  },
}));

const announceMock = vi.mocked(announce);

/** A recognizer that, like a stalled browser, sends no end event when aborted. */
class NoEndOnAbort extends FakeRecognition {
  override abort(): void {
    this.aborted = true;
  }
}
const OWNER_A = { runtime: "fixture", playerUuid: "a", playerRef: "#1" };
const OWNER_B = { runtime: "fixture", playerUuid: "b", playerRef: "#2" };

function renderInput() {
  const onSend = vi.fn();
  const inputRef = React.createRef<HTMLTextAreaElement>();
  const view = render(<CommandInput onSend={onSend} inputRef={inputRef} />);
  return { onSend, view, textarea: screen.getByRole("textbox", { name: "Command" }) };
}

const micButton = () => screen.getByRole("button", { name: "Voice command" });
const altShiftD = () => fireEvent.keyDown(document.body, { code: "KeyD", key: "D", altKey: true, shiftKey: true });

async function startListening() {
  fireEvent.click(micButton());
  await waitFor(() => expect(FakeRecognition.instances).toHaveLength(1));
  return FakeRecognition.latest();
}

/** A recognizer whose availability check waits until the test resolves it. */
function slowRecognizer(): { recognizer: RecognitionConstructor; resolve: () => void } {
  let resolve = () => {};
  const recognizer = fakeRecognizer(() => new Promise((done) => { resolve = () => done("available"); }));
  return { recognizer, resolve: () => resolve() };
}

/** Let a pending availability check finish and any start that follows run. */
async function settle(resolve: () => void) {
  await act(async () => {
    resolve();
    await new Promise((done) => setTimeout(done, 0));
  });
}

function setVoice(changes: Partial<ReturnType<typeof usePreferences.getState>["voiceInput"]>) {
  const { voiceInput, setVoiceInput } = usePreferences.getState();
  setVoiceInput({ ...voiceInput, ...changes });
}

beforeEach(() => {
  vi.clearAllMocks();
  FakeRecognition.instances = [];
  window.webkitSpeechRecognition = fakeRecognizer();
  setVoice({ enabled: true, sendImmediately: false, language: "en-US" });
  useInputStore.getState().clear();
  useLiveKitStore.getState().reset();
  useConnectionStore.getState().setConnected(true);
  usePersonalDataStore.setState({ policyReady: true, visitor: false, owner: OWNER_A, gameSessionId: "s1" });
});

afterEach(() => {
  delete window.SpeechRecognition;
  delete window.webkitSpeechRecognition;
  setVoice({ enabled: false });
});

describe("VoiceCommandButton", () => {
  it("is absent where the browser has no speech recognition", () => {
    delete window.webkitSpeechRecognition;
    renderInput();
    expect(screen.queryByRole("button", { name: "Voice command" })).toBeNull();
  });

  it("is absent until the player turns voice commands on", () => {
    setVoice({ enabled: false });
    renderInput();
    expect(screen.queryByRole("button", { name: "Voice command" })).toBeNull();
  });

  it("is a toggle button that names its shortcut", () => {
    renderInput();
    expect(micButton()).toHaveAttribute("aria-pressed", "false");
    expect(micButton()).toHaveAttribute("aria-keyshortcuts", "Alt+Shift+D");
  });

  it("shows what is heard and leaves the final transcript to check", async () => {
    const { onSend, textarea } = renderInput();
    const recognition = await startListening();
    expect(recognition.lang).toBe("en-US");
    expect(micButton()).toHaveAttribute("aria-pressed", "true");
    expect(announceMock).toHaveBeenCalledWith("Listening", "assertive");

    act(() => recognition.hear(["look at", false]));
    expect(textarea).toHaveValue("look at");
    act(() => recognition.hear(["look at fountain", true]));
    act(() => recognition.end());

    expect(textarea).toHaveValue("look at fountain");
    expect(onSend).not.toHaveBeenCalled();
    expect(announceMock).toHaveBeenCalledWith("Heard look at fountain", "polite");
    expect(micButton()).toHaveAttribute("aria-pressed", "false");

    // Enter then sends it the way a typed command goes, history included.
    fireEvent.keyDown(textarea, { key: "Enter" });
    expect(onSend).toHaveBeenCalledWith("look at fountain");
    expect(addCommandMock).toHaveBeenCalledWith("look at fountain");
  });

  it("sends the final transcript through the typed path when asked to", async () => {
    setVoice({ sendImmediately: true });
    const { onSend, textarea } = renderInput();
    const recognition = await startListening();
    act(() => recognition.hear(["north", true]));
    expect(onSend.mock.calls).toEqual([["north"]]);
    expect(addCommandMock).toHaveBeenCalledWith("north");
    expect(textarea).toHaveValue("");
    expect(announceMock).toHaveBeenCalledWith("Sent north", "polite");
  });

  describe("never sends a partial result", () => {
    for (const sendImmediately of [true, false]) {
      for (const press of ["Enter", "Send"] as const) {
        it(`${press} during an interim result finishes listening and sends only the final (send at once ${sendImmediately ? "on" : "off"})`, async () => {
          setVoice({ sendImmediately });
          const { onSend, textarea } = renderInput();
          const recognition = await startListening();
          act(() => recognition.hear(["drop", false]));

          if (press === "Enter") fireEvent.keyDown(textarea, { key: "Enter" });
          else fireEvent.click(screen.getByRole("button", { name: "Send" }));
          expect(onSend).not.toHaveBeenCalled();
          expect(recognition.stopped).toBe(true);

          act(() => recognition.hear(["drop all", true]));
          act(() => recognition.end());
          expect(onSend.mock.calls).toEqual([["drop all"]]);
        });
      }
    }

    it("sends nothing when no final result follows Enter", async () => {
      const { onSend, textarea } = renderInput();
      const recognition = await startListening();
      act(() => recognition.hear(["drop", false]));
      fireEvent.keyDown(textarea, { key: "Enter" });
      act(() => recognition.fail("no-speech"));
      act(() => recognition.end());
      expect(onSend).not.toHaveBeenCalled();
      expect(textarea).toHaveValue("");
    });
  });

  describe("the player's own edits win", () => {
    it("typing during dictation stops it and keeps the typed text", async () => {
      setVoice({ sendImmediately: true });
      const { onSend, textarea } = renderInput();
      const recognition = await startListening();
      act(() => recognition.hear(["look", false]));
      fireEvent.input(textarea, { target: { value: "inventory" } });
      expect(recognition.aborted).toBe(true);
      expect(micButton()).toHaveAttribute("aria-pressed", "false");

      act(() => recognition.hear(["look north", false]));
      act(() => recognition.hear(["look north", true]));
      act(() => recognition.end());
      expect(textarea).toHaveValue("inventory");
      expect(onSend).not.toHaveBeenCalled();

      // A typed send goes out once, and nothing from the old session follows.
      fireEvent.keyDown(textarea, { key: "Enter" });
      expect(onSend.mock.calls).toEqual([["inventory"]]);
    });

    it("recalling history during dictation stops it and keeps the recalled command", async () => {
      const { textarea } = renderInput();
      const recognition = await startListening();
      fireEvent.keyDown(textarea, { key: "ArrowUp" });
      expect(recognition.aborted).toBe(true);
      act(() => recognition.hear(["late", true]));
      expect(textarea).toHaveValue("recalled");
    });

    it("an error does not undo text changed by something else", async () => {
      const { textarea } = renderInput();
      const recognition = await startListening();
      act(() => useInputStore.getState().setText("page Bob"));
      act(() => recognition.fail("network"));
      act(() => recognition.end());
      expect(textarea).toHaveValue("page Bob");
    });
  });

  it("adds what is heard to a draft already in the input", async () => {
    const { textarea } = renderInput();
    fireEvent.input(textarea, { target: { value: "say" } });
    const recognition = await startListening();
    act(() => recognition.hear(["hello there", true]));
    expect(textarea).toHaveValue("say hello there");
  });

  it("puts the draft back and says why when recognition fails", async () => {
    const { onSend, textarea } = renderInput();
    fireEvent.input(textarea, { target: { value: "say" } });
    const recognition = await startListening();
    act(() => recognition.hear(["mumble", false]));
    act(() => recognition.fail("not-allowed"));
    act(() => recognition.end());
    expect(textarea).toHaveValue("say");
    expect(onSend).not.toHaveBeenCalled();
    expect(announceMock).toHaveBeenCalledWith(expect.stringMatching(/Microphone access is blocked/), "assertive");
  });

  it("starts and stops with Alt+Shift+D, and Escape discards", async () => {
    const { textarea } = renderInput();
    altShiftD();
    await waitFor(() => expect(FakeRecognition.instances).toHaveLength(1));
    const recognition = FakeRecognition.latest();
    altShiftD();
    expect(recognition.stopped).toBe(true);

    act(() => recognition.hear(["drop", false]));
    fireEvent.keyDown(document.body, { key: "Escape" });
    expect(recognition.aborted).toBe(true);
    expect(textarea).toHaveValue("");
    expect(announceMock).toHaveBeenCalledWith("Stopped listening", "polite");
  });

  it("ignores the shortcut while voice commands are off", () => {
    setVoice({ enabled: false });
    renderInput();
    altShiftD();
    expect(FakeRecognition.instances).toHaveLength(0);
  });

  describe("a start still checking availability can be cancelled", () => {
    const cancellations: [string, () => void][] = [
      ["Escape", () => fireEvent.keyDown(document.body, { key: "Escape" })],
      ["a second press", () => fireEvent.click(micButton())],
      ["a second Alt+Shift+D", altShiftD],
      ["turning voice commands off", () => act(() => setVoice({ enabled: false }))],
      ["a typed send", () => fireEvent.keyDown(screen.getByRole("textbox", { name: "Command" }), { key: "Enter" })],
      ["disconnecting", () => act(() => useConnectionStore.getState().setConnected(false))],
    ];
    for (const [name, cancel] of cancellations) {
      it(`by ${name}`, async () => {
        const slow = slowRecognizer();
        window.webkitSpeechRecognition = slow.recognizer;
        renderInput();
        fireEvent.click(micButton());
        expect(micButton()).toHaveAttribute("aria-pressed", "true");
        cancel();
        await settle(slow.resolve);
        expect(FakeRecognition.instances).toHaveLength(0);
        expect(screen.queryByRole("button", { name: "Voice command", pressed: true })).toBeNull();
      });
    }

    it("by unmounting", async () => {
      const slow = slowRecognizer();
      window.webkitSpeechRecognition = slow.recognizer;
      const { view } = renderInput();
      fireEvent.click(micButton());
      view.unmount();
      await settle(slow.resolve);
      expect(FakeRecognition.instances).toHaveLength(0);
    });
  });

  describe("a session belongs to the player and connection that started it", () => {
    it("disconnecting stops it, and a later final sends nothing as the next owner", async () => {
      setVoice({ sendImmediately: true });
      const { onSend } = renderInput();
      act(() => useInputStore.getState().setText("page Alice"));
      const recognition = await startListening();
      act(() => {
        useConnectionStore.getState().setConnected(false);
        usePersonalDataStore.getState().clear();
      });
      expect(recognition.aborted).toBe(true);
      act(() => {
        usePersonalDataStore.getState().confirm(OWNER_B);
        useConnectionStore.getState().setConnected(true);
      });
      act(() => recognition.hear(["hello", true]));
      act(() => recognition.end());
      expect(onSend).not.toHaveBeenCalled();
      expect(addCommandMock).not.toHaveBeenCalled();
      expect(useInputStore.getState().text).toBe("");
    });

    it("a new game session stops it", async () => {
      renderInput();
      const recognition = await startListening();
      act(() => usePersonalDataStore.setState({ gameSessionId: "s2" }));
      expect(recognition.aborted).toBe(true);
    });
  });

  it("reports a recognizer that refuses to start without throwing again", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    window.webkitSpeechRecognition = class extends FakeRecognition {
      override start(): void { throw new Error("InvalidStateError"); }
    };
    renderInput();
    fireEvent.click(micButton());
    await waitFor(() =>
      expect(announceMock).toHaveBeenCalledWith("Speech recognition failed.", "assertive"));
    expect(micButton()).toHaveAttribute("aria-pressed", "false");
    // The next press starts afresh.
    fireEvent.click(micButton());
    await waitFor(() => expect(FakeRecognition.instances).toHaveLength(2));
    warn.mockRestore();
  });

  it("recognizes on the device when the browser can", async () => {
    window.webkitSpeechRecognition = fakeRecognizer(async () => "available");
    renderInput();
    const recognition = await startListening();
    expect(recognition.processLocally).toBe(true);
  });

  it("holds the client's own speech while listening and gives it back at the final result", async () => {
    const cancel = vi.fn();
    vi.stubGlobal("speechSynthesis", { cancel });
    window.webkitSpeechRecognition = NoEndOnAbort;
    renderInput();
    const recognition = await startListening();
    expect(cancel).toHaveBeenCalled();
    expect(clientSpeechSuspended()).toBe(true);
    // No end event follows; speech must not wait for one.
    act(() => recognition.hear(["look", true]));
    expect(clientSpeechSuspended()).toBe(false);
    expect(micButton()).toHaveAttribute("aria-pressed", "false");
    vi.unstubAllGlobals();
  });

  describe("gives the client's speech back without waiting for an end event", () => {
    const endings: [string, (recognition: FakeRecognition, view: ReturnType<typeof render>) => void][] = [
      ["an error", (recognition) => act(() => recognition.fail("no-speech"))],
      ["Escape", () => fireEvent.keyDown(document.body, { key: "Escape" })],
      ["unmounting", (_recognition, view) => view.unmount()],
      ["turning voice commands off", () => act(() => setVoice({ enabled: false }))],
      ["disconnecting", () => act(() => useConnectionStore.getState().setConnected(false))],
    ];
    for (const [name, end] of endings) {
      it(`on ${name}`, async () => {
        window.webkitSpeechRecognition = NoEndOnAbort;
        const { view } = renderInput();
        const recognition = await startListening();
        expect(clientSpeechSuspended()).toBe(true);
        end(recognition, view);
        expect(clientSpeechSuspended()).toBe(false);
        expect(useInputStore.getState().dictation).toBeNull();
      });
    }
  });

  it("warns that voice chat hears the command too", async () => {
    useLiveKitStore.getState().setRoom({ token: "t" });
    renderInput();
    await startListening();
    expect(announceMock).toHaveBeenCalledWith("Listening. Voice chat can hear you.", "assertive");
  });

  it("does not listen for a language the browser cannot recognize", async () => {
    window.webkitSpeechRecognition = fakeRecognizer(async () => "unavailable");
    renderInput();
    fireEvent.click(micButton());
    await waitFor(() =>
      expect(announceMock).toHaveBeenCalledWith("Speech recognition does not support this language.", "assertive"));
    expect(FakeRecognition.instances).toHaveLength(0);
    expect(micButton()).toHaveAttribute("aria-pressed", "false");
  });

  describe("every dictation has a bounded lifetime", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      window.webkitSpeechRecognition = NoEndOnAbort;
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    async function startOnFakeTimers() {
      fireEvent.click(micButton());
      await act(async () => { await vi.advanceTimersByTimeAsync(0); });
      return FakeRecognition.latest();
    }

    it("a stop with no final and no end gives up after two seconds", async () => {
      const { onSend, textarea } = renderInput();
      fireEvent.input(textarea, { target: { value: "say" } });
      const recognition = await startOnFakeTimers();
      act(() => recognition.hear(["drop", false]));
      fireEvent.keyDown(textarea, { key: "Enter" });
      expect(recognition.stopped).toBe(true);

      await act(async () => { await vi.advanceTimersByTimeAsync(1999); });
      expect(clientSpeechSuspended()).toBe(true);
      await act(async () => { await vi.advanceTimersByTimeAsync(1); });

      expect(recognition.aborted).toBe(true);
      expect(clientSpeechSuspended()).toBe(false);
      expect(useInputStore.getState().dictation).toBeNull();
      expect(micButton()).toHaveAttribute("aria-pressed", "false");
      expect(textarea).toHaveValue("say");
      expect(onSend).not.toHaveBeenCalled();
      expect(announceMock).toHaveBeenCalledWith("Nothing was sent. Say it again.", "polite");

      // A late final from the abandoned recognizer does nothing.
      act(() => recognition.hear(["drop all", true]));
      expect(onSend).not.toHaveBeenCalled();
    });

    it("listening stops after fifteen seconds, and a final in the grace period still counts", async () => {
      const { textarea } = renderInput();
      const recognition = await startOnFakeTimers();
      await act(async () => { await vi.advanceTimersByTimeAsync(15000); });
      expect(recognition.stopped).toBe(true);
      expect(clientSpeechSuspended()).toBe(true);
      act(() => recognition.hear(["look", true]));
      expect(textarea).toHaveValue("look");
      expect(clientSpeechSuspended()).toBe(false);
    });

    it("listening that hears nothing at all ends by seventeen seconds", async () => {
      renderInput();
      const recognition = await startOnFakeTimers();
      await act(async () => { await vi.advanceTimersByTimeAsync(17000); });
      expect(recognition.aborted).toBe(true);
      expect(clientSpeechSuspended()).toBe(false);
      expect(micButton()).toHaveAttribute("aria-pressed", "false");
    });

    it("a press while waiting for a stopped recognizer ends it at once", async () => {
      renderInput();
      const recognition = await startOnFakeTimers();
      fireEvent.click(micButton());
      expect(recognition.stopped).toBe(true);
      fireEvent.click(micButton());
      expect(recognition.aborted).toBe(true);
      expect(clientSpeechSuspended()).toBe(false);
      expect(micButton()).toHaveAttribute("aria-pressed", "false");
      // And the next press starts a new one.
      await startOnFakeTimers();
      expect(FakeRecognition.instances).toHaveLength(2);
    });
  });

  describe("cancelling before a final never leaves heard words to send", () => {
    const cancellations: [string, string | null, () => void][] = [
      ["turning voice commands off", "Dictation stopped", () => act(() => setVoice({ enabled: false }))],
      ["disconnecting", "Dictation stopped: disconnected", () => act(() => useConnectionStore.getState().setConnected(false))],
      ["a new game session", "Dictation stopped: new game session", () => act(() => usePersonalDataStore.setState({ gameSessionId: "s2" }))],
    ];
    for (const [name, message, cancel] of cancellations) {
      it(`by ${name}`, async () => {
        const { onSend, textarea } = renderInput();
        fireEvent.input(textarea, { target: { value: "say" } });
        const recognition = await startListening();
        act(() => recognition.hear(["drop", false]));
        cancel();
        expect(recognition.aborted).toBe(true);
        expect(useInputStore.getState().text).toBe("say");
        if (message) expect(announceMock).toHaveBeenCalledWith(message, "polite");
        act(() => useConnectionStore.getState().setConnected(true));
        // Enter now sends only the player's own draft.
        fireEvent.keyDown(textarea, { key: "Enter" });
        expect(onSend.mock.calls).toEqual([["say"]]);
      });
    }

    it("when the player changes, the old draft is not brought back either", async () => {
      renderInput();
      act(() => useInputStore.getState().setText("page Alice"));
      const recognition = await startListening();
      act(() => recognition.hear(["hello", false]));
      act(() => usePersonalDataStore.setState({ owner: OWNER_B }));
      expect(useInputStore.getState().text).toBe("");
      expect(announceMock).toHaveBeenCalledWith("Dictation stopped: player changed", "polite");
    });

    it("unmounting removes the heard words without saying anything", async () => {
      const { view, textarea } = renderInput();
      fireEvent.input(textarea, { target: { value: "say" } });
      const recognition = await startListening();
      act(() => recognition.hear(["drop", false]));
      announceMock.mockClear();
      view.unmount();
      expect(useInputStore.getState().text).toBe("say");
      expect(announceMock).not.toHaveBeenCalled();
    });
  });

  it("a held send that ends with no final says nothing was sent", async () => {
    const { onSend, textarea } = renderInput();
    const recognition = await startListening();
    act(() => recognition.hear(["drop", false]));
    fireEvent.keyDown(textarea, { key: "Enter" });
    act(() => recognition.end());
    expect(onSend).not.toHaveBeenCalled();
    expect(textarea).toHaveValue("");
    expect(announceMock).toHaveBeenCalledWith("Nothing was sent. Say it again.", "polite");
  });

  it("says why when auto-login connecting stops an early dictation", async () => {
    act(() => useConnectionStore.getState().setConnected(false));
    renderInput();
    const recognition = await startListening();
    act(() => useConnectionStore.getState().setConnected(true));
    expect(recognition.aborted).toBe(true);
    expect(announceMock).toHaveBeenCalledWith("Dictation stopped: connected", "polite");
  });

  it("a recognizer that cannot even be created gives speech back and says so", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    window.webkitSpeechRecognition = class extends FakeRecognition {
      constructor() {
        super();
        throw new Error("constructor refused");
      }
    };
    renderInput();
    fireEvent.click(micButton());
    await waitFor(() =>
      expect(announceMock).toHaveBeenCalledWith("Speech recognition failed.", "assertive"));
    expect(clientSpeechSuspended()).toBe(false);
    expect(useInputStore.getState().dictation).toBeNull();
    expect(micButton()).toHaveAttribute("aria-pressed", "false");
    warn.mockRestore();
  });

  it("a dictation cancelled while the client's speech is being stopped starts nothing and holds nothing", async () => {
    // Stopping speech synchronously disconnects, as an injected re-entry.
    vi.stubGlobal("speechSynthesis", {
      cancel: () => useConnectionStore.getState().setConnected(false),
    });
    const { view } = renderInput();
    fireEvent.click(micButton());
    await act(async () => { await new Promise((done) => setTimeout(done, 0)); });
    expect(clientSpeechSuspended()).toBe(false);
    expect(FakeRecognition.instances.every((recognition) => !recognition.started || recognition.aborted)).toBe(true);
    view.unmount();
    expect(clientSpeechSuspended()).toBe(false);
    vi.unstubAllGlobals();
  });
});
