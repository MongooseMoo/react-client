import { beforeEach, describe, expect, it, vi } from "vitest";

import { AutoreadMode, usePreferences } from "../../stores/preferencesStore";
import { GMCPClientSpeech, MAX_SPEECH_LENGTH } from "./Speech";

class MockUtterance {
  text: string;
  rate = 1;
  pitch = 1;
  volume = 1;
  lang = "";
  voice: unknown = null;
  constructor(text: string) {
    this.text = text;
  }
}

const speak = vi.fn();
const cancel = vi.fn();

function createMockClient() {
  return {
    gmcp: {
      send: vi.fn(),
    },
  };
}

function spokenUtterance(): MockUtterance {
  expect(speak).toHaveBeenCalledTimes(1);
  return speak.mock.calls[0][0] as MockUtterance;
}

describe("GMCPClientSpeech", () => {
  let handler: GMCPClientSpeech;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("SpeechSynthesisUtterance", MockUtterance);
    vi.stubGlobal("speechSynthesis", { speak, cancel });
    // Known preference values so fallback behaviour is deterministic.
    usePreferences.getState().setSpeech({
      autoreadMode: AutoreadMode.Off,
      voice: "",
      rate: 1.5,
      pitch: 1.2,
      volume: 0.7,
    });
    handler = new GMCPClientSpeech(createMockClient() as never);
  });

  it("clamps params above the Web Speech ranges", () => {
    handler.handleSpeak({ text: "hi", rate: 999, pitch: 999, volume: 999 } as never);
    const utterance = spokenUtterance();
    expect(utterance.rate).toBe(10);
    expect(utterance.pitch).toBe(2);
    expect(utterance.volume).toBe(1);
  });

  it("clamps params below the Web Speech ranges", () => {
    handler.handleSpeak({ text: "hi", rate: -5, pitch: -5, volume: -5 } as never);
    const utterance = spokenUtterance();
    expect(utterance.rate).toBe(0.1);
    expect(utterance.pitch).toBe(0);
    expect(utterance.volume).toBe(0);
  });

  it("falls back to preference values when params are omitted", () => {
    handler.handleSpeak({ text: "hi" } as never);
    const utterance = spokenUtterance();
    expect(utterance.rate).toBe(1.5);
    expect(utterance.pitch).toBe(1.2);
    expect(utterance.volume).toBe(0.7);
  });

  it("falls back to preferences for non-finite server values", () => {
    handler.handleSpeak({
      text: "hi",
      rate: Number.NaN,
      pitch: Number.POSITIVE_INFINITY,
      volume: Number.NaN,
    } as never);
    const utterance = spokenUtterance();
    expect(utterance.rate).toBe(1.5);
    expect(utterance.pitch).toBe(1.2);
    expect(utterance.volume).toBe(0.7);
  });

  it("truncates text longer than the cap", () => {
    const longText = "a".repeat(MAX_SPEECH_LENGTH + 1000);
    handler.handleSpeak({ text: longText } as never);
    const utterance = spokenUtterance();
    expect(utterance.text).toHaveLength(MAX_SPEECH_LENGTH);
  });

  it("leaves short text untouched", () => {
    handler.handleSpeak({ text: "hello world" } as never);
    expect(spokenUtterance().text).toBe("hello world");
  });

  it("cancels pending speech on shutdown", () => {
    handler.shutdown();
    expect(cancel).toHaveBeenCalledTimes(1);
  });
});
