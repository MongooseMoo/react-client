import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import VoiceCommandPreferences from "./VoiceCommandPreferences";
import { usePreferences } from "../stores/preferencesStore";
import { fakeRecognizer } from "../voiceInputTestHelpers";

vi.mock("@react-aria/live-announcer", () => ({ announce: vi.fn() }));

beforeEach(() => {
  const { setVoiceInput } = usePreferences.getState();
  setVoiceInput({ enabled: false, sendImmediately: false, language: "en-US" });
});

afterEach(() => {
  delete window.SpeechRecognition;
  delete window.webkitSpeechRecognition;
});

describe("VoiceCommandPreferences", () => {
  it("says the browser lacks speech recognition and offers no switch", () => {
    render(<VoiceCommandPreferences />);
    expect(screen.getByText(/need a browser with speech recognition/)).toBeTruthy();
    expect(screen.queryByRole("checkbox", { name: "Voice commands" })).toBeNull();
  });

  it("says plainly that audio leaves the device before the switch is on", async () => {
    window.webkitSpeechRecognition = fakeRecognizer(async ({ processLocally }) =>
      processLocally ? "unavailable" : "available");
    render(<VoiceCommandPreferences />);
    const toggle = screen.getByRole("checkbox", { name: "Voice commands" });
    await waitFor(() => expect(toggle).toHaveAccessibleDescription(
      /sends your audio to its maker's speech service \(Google, in Chrome\).*cannot do this on this device/));
    expect(toggle).not.toBeChecked();
  });

  it("does not claim to know where audio goes when the browser cannot say", async () => {
    window.webkitSpeechRecognition = fakeRecognizer();
    render(<VoiceCommandPreferences />);
    await waitFor(() => expect(screen.getByText(/does not say where speech is turned into text/)).toBeTruthy());
  });

  it("says when speech stays on this device", async () => {
    window.webkitSpeechRecognition = fakeRecognizer(async () => "available");
    render(<VoiceCommandPreferences />);
    await waitFor(() => expect(screen.getByText(/does not leave your computer/)).toBeTruthy());
  });

  it("offers the on-device download and checks again after it", async () => {
    let installed = false;
    const install = vi.fn(async () => { installed = true; return true; });
    window.webkitSpeechRecognition = fakeRecognizer(
      async () => (installed ? "available" : "downloadable"),
      install,
    );
    render(<VoiceCommandPreferences />);
    fireEvent.click(await screen.findByRole("button", { name: "Download on-device recognition" }));
    expect(install).toHaveBeenCalledWith({ langs: ["en-US"], processLocally: true });
    await waitFor(() => expect(screen.getByText(/does not leave your computer/)).toBeTruthy());
  });

  it("keeps the language fixed while its model downloads", async () => {
    window.webkitSpeechRecognition = fakeRecognizer(
      async () => "downloadable",
      () => new Promise<boolean>(() => {}),
    );
    render(<VoiceCommandPreferences />);
    fireEvent.click(await screen.findByRole("button", { name: "Download on-device recognition" }));
    expect(screen.getByRole("textbox", { name: "Recognition language" })).toBeDisabled();
  });

  it("never shows a finished download's result for a language chosen since", async () => {
    let finishInstall = () => {};
    let installed = false;
    window.webkitSpeechRecognition = fakeRecognizer(
      async ({ langs, processLocally }) => {
        if (!processLocally) return "available";
        if (langs[0] !== "en-US") return "unavailable";
        return installed ? "available" : "downloadable";
      },
      () => new Promise<boolean>((resolve) => { finishInstall = () => { installed = true; resolve(true); }; }),
    );
    render(<VoiceCommandPreferences />);
    fireEvent.click(await screen.findByRole("button", { name: "Download on-device recognition" }));
    // The language can still change from elsewhere, such as another tab's saved preferences.
    act(() => usePreferences.getState().setVoiceInput({ ...usePreferences.getState().voiceInput, language: "fr-FR" }));
    await waitFor(() => expect(screen.getByText(/to turn fr-FR speech into text/)).toBeTruthy());
    await act(async () => { finishInstall(); await new Promise((done) => setTimeout(done, 0)); });
    expect(screen.getByText(/to turn fr-FR speech into text/)).toBeTruthy();
    expect(screen.queryByText(/does not leave your computer/)).toBeNull();
  });

  it("saves the switches and language", async () => {
    window.webkitSpeechRecognition = fakeRecognizer();
    render(<VoiceCommandPreferences />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Voice commands" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Send what I say at once" }));
    fireEvent.input(screen.getByRole("textbox", { name: "Recognition language" }), { target: { value: "fr-FR" } });
    expect(usePreferences.getState().voiceInput).toEqual({ enabled: true, sendImmediately: true, language: "fr-FR" });
  });
});
