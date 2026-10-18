import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { announce } from "@react-aria/live-announcer";
import CommandInput from "./input";
import { useInputStore } from "../stores/inputStore";
import { useLiveKitStore } from "../stores/liveKitStore";
import { usePersonalDataStore } from "../stores/personalDataStore";
import { usePreferences } from "../stores/preferencesStore";
import { FakeRecognition, fakeRecognizer } from "../voiceInputTestHelpers";

const { addCommandMock } = vi.hoisted(() => ({ addCommandMock: vi.fn() }));

vi.mock("@react-aria/live-announcer", () => ({ announce: vi.fn() }));
vi.mock("../CommandHistory", () => ({
  CommandHistory: class {
    addCommand = addCommandMock;
    navigateUp = vi.fn(() => "");
    navigateDown = vi.fn(() => "");
    getHistory = vi.fn(() => []);
  },
}));

const announceMock = vi.mocked(announce);

function renderInput() {
  const onSend = vi.fn();
  const inputRef = React.createRef<HTMLTextAreaElement>();
  render(<CommandInput onSend={onSend} inputRef={inputRef} />);
  return { onSend, textarea: screen.getByRole("textbox", { name: "Command" }) };
}

async function startListening() {
  fireEvent.click(screen.getByRole("button", { name: "Voice command" }));
  await waitFor(() => expect(FakeRecognition.instances).toHaveLength(1));
  return FakeRecognition.latest();
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
  usePersonalDataStore.setState({
    policyReady: true,
    visitor: false,
    owner: { runtime: "fixture", playerUuid: "a", playerRef: "#1" },
  });
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
    const button = screen.getByRole("button", { name: "Voice command" });
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(button).toHaveAttribute("aria-keyshortcuts", "Alt+Shift+D");
  });

  it("shows what is heard and leaves the final transcript to check", async () => {
    const { onSend, textarea } = renderInput();
    const recognition = await startListening();
    expect(recognition.lang).toBe("en-US");
    expect(screen.getByRole("button", { name: "Voice command" })).toHaveAttribute("aria-pressed", "true");
    expect(announceMock).toHaveBeenCalledWith("Listening", "assertive");

    act(() => recognition.hear(["look at", false]));
    expect(textarea).toHaveValue("look at");
    act(() => recognition.hear(["look at fountain", true]));
    act(() => recognition.end());

    expect(textarea).toHaveValue("look at fountain");
    expect(onSend).not.toHaveBeenCalled();
    expect(announceMock).toHaveBeenCalledWith("Heard look at fountain", "polite");
    expect(screen.getByRole("button", { name: "Voice command" })).toHaveAttribute("aria-pressed", "false");

    // Enter then sends it the way a typed command goes, history included.
    fireEvent.keyDown(textarea, { key: "Enter" });
    expect(onSend).toHaveBeenCalledWith("look at fountain");
    expect(addCommandMock).toHaveBeenCalledWith("look at fountain");
  });

  it("sends the final transcript through the typed path when asked to, never a partial one", async () => {
    setVoice({ sendImmediately: true });
    const { onSend, textarea } = renderInput();
    const recognition = await startListening();

    act(() => recognition.hear(["north", false]));
    expect(onSend).not.toHaveBeenCalled();
    act(() => recognition.hear(["north", true]));

    expect(onSend).toHaveBeenCalledTimes(1);
    expect(onSend).toHaveBeenCalledWith("north");
    expect(addCommandMock).toHaveBeenCalledWith("north");
    expect(textarea).toHaveValue("");
    expect(announceMock).toHaveBeenCalledWith("Sent north", "polite");
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
    fireEvent.keyDown(document.body, { code: "KeyD", key: "D", altKey: true, shiftKey: true });
    await waitFor(() => expect(FakeRecognition.instances).toHaveLength(1));
    const recognition = FakeRecognition.latest();
    fireEvent.keyDown(document.body, { code: "KeyD", key: "D", altKey: true, shiftKey: true });
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
    fireEvent.keyDown(document.body, { code: "KeyD", key: "D", altKey: true, shiftKey: true });
    expect(FakeRecognition.instances).toHaveLength(0);
  });

  it("recognizes on the device when the browser can", async () => {
    window.webkitSpeechRecognition = fakeRecognizer(async () => "available");
    renderInput();
    const recognition = await startListening();
    expect(recognition.processLocally).toBe(true);
  });

  it("stops the client's speech so it is not heard as the command", async () => {
    const cancel = vi.fn();
    vi.stubGlobal("speechSynthesis", { cancel });
    renderInput();
    await startListening();
    expect(cancel).toHaveBeenCalled();
    vi.unstubAllGlobals();
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
    fireEvent.click(screen.getByRole("button", { name: "Voice command" }));
    await waitFor(() =>
      expect(announceMock).toHaveBeenCalledWith("Speech recognition does not support this language.", "assertive"));
    expect(FakeRecognition.instances).toHaveLength(0);
  });
});
