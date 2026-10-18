import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  checkAvailability,
  getRecognitionConstructor,
  languageName,
  recognitionLanguage,
  startVoiceSession,
  voiceErrorMessage,
  type VoiceSessionHandlers,
} from "./voiceInput";
import { FakeRecognition, fakeRecognizer } from "./voiceInputTestHelpers";

function handlers(): VoiceSessionHandlers & { [K in keyof VoiceSessionHandlers]: ReturnType<typeof vi.fn> } {
  return { onStart: vi.fn(), onInterim: vi.fn(), onFinal: vi.fn(), onError: vi.fn(), onEnd: vi.fn() };
}

beforeEach(() => {
  FakeRecognition.instances = [];
});

afterEach(() => {
  delete window.SpeechRecognition;
  delete window.webkitSpeechRecognition;
});

describe("getRecognitionConstructor", () => {
  it("finds nothing in a browser without speech recognition", () => {
    expect(getRecognitionConstructor()).toBeUndefined();
  });

  it("finds the prefixed recognizer Chrome exposes", () => {
    const recognizer = fakeRecognizer();
    window.webkitSpeechRecognition = recognizer;
    expect(getRecognitionConstructor()).toBe(recognizer);
  });
});

describe("recognitionLanguage", () => {
  it("uses the preference, then the page language", () => {
    expect(recognitionLanguage(" fr-FR ")).toBe("fr-FR");
    expect(recognitionLanguage("")).toBe(document.documentElement.lang || navigator.language || "en");
  });
});

describe("languageName", () => {
  it("names a language tag in the browser's language", () => {
    expect(languageName("en")).toBe("English");
    expect(languageName("en-US")).toBe("English (United States)");
    expect(languageName("fr-FR")).toBe("French (France)");
  });

  it("falls back to the tag when it cannot be named", () => {
    expect(languageName("not a tag")).toBe("not a tag");
    expect(languageName("")).toBe("");
  });

  it("falls back to the tag where Intl.DisplayNames is missing", () => {
    // Replace only DisplayNames: the rest of Intl must stay intact for every other test.
    const original = Object.getOwnPropertyDescriptor(Intl, "DisplayNames");
    Object.defineProperty(Intl, "DisplayNames", { value: undefined, configurable: true, writable: true });
    try {
      expect(languageName("en-US")).toBe("en-US");
    } finally {
      if (original) Object.defineProperty(Intl, "DisplayNames", original);
    }
  });
});

describe("checkAvailability", () => {
  it("reports unknown when the browser cannot be asked", async () => {
    expect(await checkAvailability(fakeRecognizer(), "en-US")).toBe("unknown");
  });

  it("reports on-device when the local model is installed", async () => {
    const available = vi.fn(async () => "available" as const);
    expect(await checkAvailability(fakeRecognizer(available), "en-US")).toBe("on-device");
    expect(available).toHaveBeenCalledWith({ langs: ["en-US"], processLocally: true });
  });

  it("reports downloadable while the local model can be or is being installed", async () => {
    expect(await checkAvailability(fakeRecognizer(async () => "downloadable"), "en-US")).toBe("downloadable");
    expect(await checkAvailability(fakeRecognizer(async () => "downloading"), "en-US")).toBe("downloadable");
  });

  it("falls back to asking about the cloud service", async () => {
    const available = vi.fn(async ({ processLocally }: { processLocally: boolean }) =>
      processLocally ? ("unavailable" as const) : ("available" as const));
    expect(await checkAvailability(fakeRecognizer(available), "en-US")).toBe("cloud");
    const none = fakeRecognizer(async () => "unavailable");
    expect(await checkAvailability(none, "tlh")).toBe("unsupported-language");
  });

  it("reports unknown when asking fails", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const failing = fakeRecognizer(async () => { throw new Error("nope"); });
    expect(await checkAvailability(failing, "en-US")).toBe("unknown");
    warn.mockRestore();
  });
});

describe("startVoiceSession", () => {
  it("listens for one utterance with interim results", () => {
    const events = handlers();
    startVoiceSession(fakeRecognizer(), { lang: "en-GB", processLocally: true }, events);
    const recognition = FakeRecognition.latest();
    expect(recognition.started).toBe(true);
    expect(recognition.lang).toBe("en-GB");
    expect(recognition.continuous).toBe(false);
    expect(recognition.interimResults).toBe(true);
    expect(recognition.processLocally).toBe(true);
    expect(events.onStart).toHaveBeenCalledOnce();
  });

  it("does not ask for local processing on the cloud path", () => {
    startVoiceSession(fakeRecognizer(), { lang: "en", processLocally: false }, handlers());
    expect(FakeRecognition.latest().processLocally).toBeUndefined();
  });

  it("passes interim text, then the final transcript once", () => {
    const events = handlers();
    startVoiceSession(fakeRecognizer(), { lang: "en", processLocally: false }, events);
    const recognition = FakeRecognition.latest();
    recognition.hear(["go", false]);
    recognition.hear(["go north", false]);
    recognition.hear(["go north", true]);
    recognition.hear(["go north again", true]);
    recognition.end();
    expect(events.onInterim.mock.calls).toEqual([["go"], ["go north"]]);
    expect(events.onFinal.mock.calls).toEqual([["go north"]]);
    expect(events.onEnd).toHaveBeenCalledOnce();
  });

  it("never treats an empty final result as heard", () => {
    const events = handlers();
    startVoiceSession(fakeRecognizer(), { lang: "en", processLocally: false }, events);
    FakeRecognition.latest().hear(["  ", true]);
    expect(events.onFinal).not.toHaveBeenCalled();
  });

  it("reports an error and ignores results after it", () => {
    const events = handlers();
    startVoiceSession(fakeRecognizer(), { lang: "en", processLocally: false }, events);
    const recognition = FakeRecognition.latest();
    recognition.fail("no-speech");
    recognition.hear(["late", true]);
    recognition.end();
    expect(events.onError).toHaveBeenCalledWith("no-speech");
    expect(events.onFinal).not.toHaveBeenCalled();
    expect(events.onEnd).toHaveBeenCalledOnce();
  });

  it("stops on request and discards on abort", () => {
    const events = handlers();
    const session = startVoiceSession(fakeRecognizer(), { lang: "en", processLocally: false }, events);
    const recognition = FakeRecognition.latest();
    session.stop();
    expect(recognition.stopped).toBe(true);
    session.abort();
    recognition.hear(["discarded", true]);
    expect(events.onFinal).not.toHaveBeenCalled();
    expect(events.onEnd).toHaveBeenCalledOnce();
  });

  it("reports a recognizer that refuses to start", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const events = handlers();
    const refusing = class extends FakeRecognition {
      override start(): void { throw new Error("InvalidStateError"); }
    };
    startVoiceSession(refusing, { lang: "en", processLocally: false }, events);
    expect(events.onError).toHaveBeenCalledWith("start-failed");
    expect(events.onEnd).toHaveBeenCalledOnce();
    warn.mockRestore();
  });
});

describe("voiceErrorMessage", () => {
  it("names the microphone permission problem plainly", () => {
    expect(voiceErrorMessage("not-allowed")).toMatch(/Microphone access is blocked/);
    expect(voiceErrorMessage("no-speech")).toBe("No speech heard.");
    expect(voiceErrorMessage("something-new")).toBe("Speech recognition failed.");
  });
});
