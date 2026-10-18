/**
 * Speech-to-command through the Web Speech API. TypeScript's DOM library has
 * the result types but not the recognizer itself, so the parts used here are
 * declared below. Chrome and Edge expose it as webkitSpeechRecognition, Safari
 * as both names, and Firefox not at all.
 */

interface RecognitionResultEvent extends Event {
  readonly results: SpeechRecognitionResultList;
}

interface RecognitionErrorEvent extends Event {
  readonly error: string;
}

export interface Recognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  /** Chrome 139+: recognize on this device only. */
  processLocally?: boolean;
  onstart: ((event: Event) => void) | null;
  onresult: ((event: RecognitionResultEvent) => void) | null;
  onerror: ((event: RecognitionErrorEvent) => void) | null;
  onend: ((event: Event) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface RecognitionOptions {
  langs: string[];
  processLocally: boolean;
}

type AvailabilityStatus = "unavailable" | "downloadable" | "downloading" | "available";

export interface RecognitionConstructor {
  new (): Recognition;
  /** Chrome 139+. */
  available?: (options: RecognitionOptions) => Promise<AvailabilityStatus>;
  /** Chrome 139+: download the on-device model for these languages. */
  install?: (options: RecognitionOptions) => Promise<boolean>;
}

declare global {
  interface Window {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  }
}

export function getRecognitionConstructor(): RecognitionConstructor | undefined {
  if (typeof window === "undefined") return undefined;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition;
}

/** The preference, or the page's language, or the browser's. */
export function recognitionLanguage(preferred: string): string {
  return preferred.trim() || document.documentElement.lang || navigator.language || "en";
}

/**
 * Where speech in this language would be recognized.
 * - on-device: audio stays on this computer.
 * - downloadable: on-device after a one-time download; cloud until then.
 * - cloud: audio goes to the browser maker's speech service.
 * - unknown: the browser cannot be asked (Safari, Chrome before 139); treat it as cloud.
 * - unsupported-language: the browser cannot recognize this language at all.
 */
export type VoiceAvailability = "on-device" | "downloadable" | "cloud" | "unknown" | "unsupported-language";

export async function checkAvailability(
  recognizer: RecognitionConstructor,
  lang: string,
): Promise<VoiceAvailability> {
  if (!recognizer.available) return "unknown";
  try {
    const local = await recognizer.available({ langs: [lang], processLocally: true });
    if (local === "available") return "on-device";
    if (local === "downloadable" || local === "downloading") return "downloadable";
    const cloud = await recognizer.available({ langs: [lang], processLocally: false });
    return cloud === "unavailable" ? "unsupported-language" : "cloud";
  } catch (error) {
    console.warn("Could not check speech recognition availability:", error);
    return "unknown";
  }
}

export interface VoiceSessionHandlers {
  onStart: () => void;
  /** What has been heard so far; it may still change. */
  onInterim: (text: string) => void;
  /** The recognizer's final transcript. Called at most once. */
  onFinal: (text: string) => void;
  onError: (code: string) => void;
  /** Called once, after any final result or error. */
  onEnd: () => void;
}

export interface VoiceSession {
  /** Stop listening; what was heard so far still arrives as a final result. */
  stop: () => void;
  /** Stop listening and discard what was heard. */
  abort: () => void;
}

/** Listen for one utterance. The recognizer stops by itself when the speaker pauses. */
export function startVoiceSession(
  recognizer: RecognitionConstructor,
  options: { lang: string; processLocally: boolean },
  handlers: VoiceSessionHandlers,
): VoiceSession {
  const recognition = new recognizer();
  recognition.lang = options.lang;
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;
  if (options.processLocally) recognition.processLocally = true;

  let finished = false;
  let ended = false;

  recognition.onstart = () => handlers.onStart();
  recognition.onresult = (event) => {
    if (finished) return;
    let finalText = "";
    let interimText = "";
    for (let index = 0; index < event.results.length; index++) {
      const result = event.results[index];
      const transcript = result[0]?.transcript ?? "";
      if (result.isFinal) finalText += transcript;
      else interimText += transcript;
    }
    if (finalText.trim()) {
      finished = true;
      handlers.onFinal(finalText.trim());
    } else {
      handlers.onInterim(`${finalText}${interimText}`.trim());
    }
  };
  recognition.onerror = (event) => {
    if (finished) return;
    finished = true;
    handlers.onError(event.error);
  };
  recognition.onend = () => {
    if (ended) return;
    ended = true;
    handlers.onEnd();
  };

  try {
    recognition.start();
  } catch (error) {
    // start() throws when the recognizer is already running or cannot start.
    console.warn("Speech recognition did not start:", error);
    finished = true;
    handlers.onError("start-failed");
    ended = true;
    handlers.onEnd();
  }

  return {
    stop: () => recognition.stop(),
    abort: () => {
      finished = true;
      recognition.abort();
    },
  };
}

/** What to tell the player when recognition fails, by SpeechRecognitionErrorEvent.error. */
export function voiceErrorMessage(code: string): string {
  switch (code) {
    case "not-allowed":
      return "Microphone access is blocked. Allow the microphone for this site, then try again.";
    case "service-not-allowed":
      return "This browser does not allow speech recognition here.";
    case "no-speech":
      return "No speech heard.";
    case "audio-capture":
      return "No microphone found.";
    case "network":
      return "The speech service could not be reached.";
    case "language-not-supported":
      return "Speech recognition does not support this language.";
    case "aborted":
      return "Stopped listening.";
    default:
      return "Speech recognition failed.";
  }
}
