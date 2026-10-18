import { announce } from "@react-aria/live-announcer";
import { useCallback, useEffect, useRef, useState } from "react";
import { suspendClientSpeech } from "../clientSpeechSuspension";
import { setInputTextAndFocus } from "../inputFocus";
import { isVoiceCommandToggle } from "../reservedShortcuts";
import { useConnectionStore } from "../stores/connectionStore";
import { type DictationHandle, useInputStore } from "../stores/inputStore";
import { useLiveKitStore } from "../stores/liveKitStore";
import { ownerKey, usePersonalDataStore } from "../stores/personalDataStore";
import { usePreferences } from "../stores/preferencesStore";
import {
  checkAvailability,
  getRecognitionConstructor,
  recognitionLanguage,
  startVoiceSession,
  voiceErrorMessage,
  type VoiceSession,
} from "../voiceInput";
import "./VoiceCommandButton.css";

type Props = {
  /** Sends whatever is in the command input, the way Enter does. */
  onSend: () => void;
};

type Phase = "idle" | "starting" | "listening";

/** Longest a dictation listens before it is stopped. A final cut off by this is never sent. */
const LISTEN_LIMIT_MS = 60000;
/** How long a stopped recognizer gets to deliver its final result or end. */
const STOP_GRACE_MS = 2000;
/** How long the browser gets to say where speech is recognized before listening starts. */
const START_LIMIT_MS = 10000;

const NOTHING_SENT = "Nothing was sent. Say it again.";
const TIME_LIMIT_REVIEW = "Time limit reached. Check the command box, then press Enter.";
const TIME_LIMIT_NOTHING = "Time limit reached. Nothing was heard.";
const TIME_LIMIT_NO_FINAL = "Time limit reached. No final words came back; nothing was sent. Say it again.";

function voiceEnabled(): boolean {
  return usePreferences.getState().voiceInput.enabled;
}

interface Identity {
  player: string;
  gameSessionId: string;
  connected: boolean;
}

function currentIdentity(): Identity {
  const { owner, visitor, gameSessionId } = usePersonalDataStore.getState();
  const { connected } = useConnectionStore.getState();
  return { player: JSON.stringify([owner ? ownerKey(owner) : null, visitor]), gameSessionId, connected };
}

/** Why the identity changed, or nothing when it has not. */
function identityChange(from: Identity, to: Identity): string | undefined {
  if (from.connected !== to.connected) return to.connected ? "connected" : "disconnected";
  if (from.player !== to.player) return "player changed";
  if (from.gameSessionId !== to.gameSessionId) return "new game session";
  return undefined;
}

/**
 * One press of the button. It is current until terminate() ends it; every
 * callback checks it is still current before touching the input, so a late
 * result from an old dictation can never write or send.
 */
interface Dictation {
  phase: "starting" | "listening";
  /** The player, game session and connection it was started under. */
  identity: Identity;
  handle: DictationHandle;
  /** The input's text when listening began. */
  draft: string;
  /** The text dictation last put in the input, or null before it has written any. */
  written: string | null;
  /** stop() was called; the recognizer has STOP_GRACE_MS to finish. */
  stopping: boolean;
  /** LISTEN_LIMIT_MS stopped it, so any final may be cut off: review it, never send it. */
  timeLimit: boolean;
  /** Interim words have arrived, so ending without a final is not silence. */
  heardWords: boolean;
  /** Enter or Send was pressed while listening: send the final result. */
  sendOnFinal: boolean;
  session: VoiceSession | null;
  releaseSpeech: (() => void) | null;
  timer: ReturnType<typeof setTimeout> | null;
}

/**
 * How a dictation ends, which decides what happens to the text it wrote:
 * - final: the final transcript is already in the input; leave it.
 * - discard: remove what was heard. The draft comes back only for the same
 *   player; for another player the input is emptied.
 * - keep: something else changed the input; that text is the player's.
 */
type Ending = {
  text: "final" | "discard" | "keep";
  announce?: string;
  priority?: "polite" | "assertive";
  /**
   * Ended from inside an input-store notification. The send handle is then
   * cleared after it, not during it: a write in the middle of a notification
   * makes later subscribers (the launched-draft keeper in
   * launch/placeLaunchText) see a nested change before the one in progress.
   * Until then the handle answers false, since the dictation is not current.
   */
  inInputNotification?: boolean;
};

/** What to say when a dictation ends without a final result. */
function unsent(dictation: Dictation): string {
  if (dictation.timeLimit) return dictation.heardWords ? TIME_LIMIT_NO_FINAL : TIME_LIMIT_NOTHING;
  return dictation.sendOnFinal ? NOTHING_SENT : "Stopped listening";
}

function appendToDraft(draft: string, heard: string): string {
  return draft.trim() ? `${draft.trimEnd()} ${heard}` : heard;
}

/**
 * Press (or Alt+Shift+D) to listen for one spoken command; press again to stop
 * early, Escape to discard. What is heard so far shows in the command input
 * but cannot be sent: Enter or Send finishes listening and sends the final
 * transcript. Otherwise the final transcript stays there to check, or is sent
 * at once if the player chose that. Typing, recalling history, or anything
 * else changing the input stops dictation and keeps that text. Every
 * dictation ends within LISTEN_LIMIT_MS + STOP_GRACE_MS even if the browser
 * stops sending events, and the client's speech comes back when it does.
 * Renders nothing where the browser has no speech recognition.
 */
const VoiceCommandButton = ({ onSend }: Props) => {
  const enabled = usePreferences((state) => state.voiceInput.enabled);
  const [recognizer] = useState(getRecognitionConstructor);
  const [phase, setPhase] = useState<Phase>("idle");
  const currentRef = useRef<Dictation | null>(null);
  const onSendRef = useRef(onSend);
  onSendRef.current = onSend;

  /** The only way a dictation ends. Safe to call more than once. */
  const terminate = useCallback((dictation: Dictation, ending: Ending) => {
    if (currentRef.current !== dictation) return;
    currentRef.current = null;
    if (dictation.timer !== null) clearTimeout(dictation.timer);
    dictation.timer = null;
    const input = useInputStore.getState();
    const clearHandle = () => {
      if (useInputStore.getState().dictation === dictation.handle) useInputStore.getState().setDictation(null);
    };
    if (ending.inInputNotification) queueMicrotask(clearHandle);
    else clearHandle();
    const releaseSpeech = dictation.releaseSpeech;
    dictation.releaseSpeech = null;
    releaseSpeech?.();
    try {
      dictation.session?.abort();
    } catch (error) {
      console.warn("Speech recognition did not abort:", error);
    }
    if (ending.text === "discard" && dictation.written !== null && input.text === dictation.written) {
      const samePlayer = currentIdentity().player === dictation.identity.player;
      useInputStore.getState().setText(samePlayer ? dictation.draft : "");
    }
    setPhase("idle");
    if (ending.announce) announce(ending.announce, ending.priority ?? "polite");
  }, []);

  /** Ask the recognizer to finish, and end the dictation if it does not within the grace period. */
  const requestStop = useCallback((dictation: Dictation, timeLimit = false) => {
    if (currentRef.current !== dictation || dictation.stopping) return;
    dictation.stopping = true;
    dictation.timeLimit = timeLimit;
    if (dictation.timer !== null) clearTimeout(dictation.timer);
    dictation.timer = setTimeout(() => {
      terminate(dictation, { text: "discard", announce: unsent(dictation) });
    }, STOP_GRACE_MS);
    try {
      dictation.session?.stop();
    } catch (error) {
      console.warn("Speech recognition did not stop:", error);
      terminate(dictation, { text: "discard", announce: unsent(dictation) });
    }
  }, [terminate]);

  const listen = useCallback((dictation: Dictation, lang: string, processLocally: boolean) => {
    if (!recognizer) return;
    const { sendImmediately } = usePreferences.getState().voiceInput;
    const input = useInputStore.getState;
    // Still the live dictation, and voice commands still on. The preference
    // subscription below ends it when they go off, but a recognizer callback
    // can arrive first in the same task; it must not write or send either.
    const isCurrent = () => {
      if (currentRef.current !== dictation) return false;
      if (voiceEnabled()) return true;
      terminate(dictation, { text: "discard", announce: "Dictation stopped" });
      return false;
    };
    dictation.phase = "listening";
    dictation.draft = input().text;
    dictation.written = dictation.draft;
    setPhase("listening");

    // Hold the client's speech before stopping what is playing, so a stop that
    // re-enters and cancels this dictation still finds the hold to release.
    dictation.releaseSpeech = suspendClientSpeech();
    window.speechSynthesis?.cancel();
    if (!isCurrent()) return;
    if (identityChange(dictation.identity, currentIdentity())) {
      terminate(dictation, { text: "discard" });
      return;
    }

    const session = startVoiceSession(recognizer, { lang, processLocally }, {
      onStart: () => {
        if (!isCurrent()) return;
        // LiveKit keeps its own hold on the microphone, so voice chat hears the command too.
        const inVoiceChat = useLiveKitStore.getState().rooms.length > 0;
        announce(inVoiceChat ? "Listening. Voice chat can hear you." : "Listening", "assertive");
      },
      onInterim: (text) => {
        if (!isCurrent()) return;
        if (text) dictation.heardWords = true;
        dictation.written = appendToDraft(dictation.draft, text);
        input().setText(dictation.written);
      },
      onFinal: (text) => {
        if (!isCurrent()) return;
        const command = appendToDraft(dictation.draft, text);
        // A final after the time limit may be cut off mid-sentence: the player checks it first.
        const send = !dictation.timeLimit && (sendImmediately || dictation.sendOnFinal);
        dictation.written = command;
        input().setText(command);
        // The text is the player's now; end before sending so the send path no longer asks.
        terminate(dictation, { text: "final" });
        if (send) {
          announce(`Sent ${text}`, "polite");
          onSendRef.current();
        } else {
          setInputTextAndFocus(command, command.length);
          // Enter may be held from before the cutoff; its repeat must not send this unchecked.
          if (dictation.timeLimit) input().setNeedsFreshEnter(true);
          announce(dictation.timeLimit ? TIME_LIMIT_REVIEW : `Heard ${text}`, "polite");
        }
      },
      onError: (code) => {
        if (!isCurrent()) return;
        const message = voiceErrorMessage(code);
        terminate(dictation, {
          text: "discard",
          announce: dictation.sendOnFinal ? `${message} ${NOTHING_SENT}` : message,
          priority: "assertive",
        });
      },
      onEnd: () => {
        if (!isCurrent()) return;
        terminate(dictation, { text: "discard", announce: unsent(dictation) });
      },
    });
    if (!isCurrent()) {
      // It ended while starting (a refusal, or a cancellation re-entering); free the recognizer.
      session.abort();
      return;
    }
    dictation.session = session;
    // Replaces the start timer.
    if (dictation.timer !== null) clearTimeout(dictation.timer);
    dictation.timer = setTimeout(() => requestStop(dictation, true), LISTEN_LIMIT_MS);
  }, [recognizer, terminate, requestStop]);

  const toggle = useCallback(async () => {
    if (!recognizer) return;
    const current = currentRef.current;
    if (!current && !voiceEnabled()) return;
    if (current) {
      if (current.phase === "listening" && !current.stopping) requestStop(current);
      // Still starting, or already stopping and waiting on the browser: end it now.
      else terminate(current, { text: "discard", announce: unsent(current) });
      return;
    }

    const dictation: Dictation = {
      phase: "starting",
      identity: currentIdentity(),
      handle: {
        interceptSend: () => {
          if (currentRef.current !== dictation) return false;
          if (dictation.phase === "starting") {
            // Typed text was never dictation's; send it and drop the start.
            terminate(dictation, { text: "keep" });
            return false;
          }
          dictation.sendOnFinal = true;
          requestStop(dictation);
          return true;
        },
      },
      draft: "",
      written: null,
      stopping: false,
      timeLimit: false,
      heardWords: false,
      sendOnFinal: false,
      session: null,
      releaseSpeech: null,
      timer: null,
    };
    currentRef.current = dictation;
    useInputStore.getState().setDictation(dictation.handle);
    setPhase("starting");
    // The browser may never answer where speech is recognized; do not wait forever.
    dictation.timer = setTimeout(() => {
      terminate(dictation, {
        text: "discard",
        announce: "Speech recognition did not start. Try again.",
        priority: "assertive",
      });
    }, START_LIMIT_MS);

    try {
      const lang = recognitionLanguage(usePreferences.getState().voiceInput.language);
      const availability = await checkAvailability(recognizer, lang);
      // Escape, a second press, a typed send, turning the feature off, unmounting
      // or a new player or connection may have ended it while the browser answered.
      if (currentRef.current !== dictation) return;
      if (!voiceEnabled()) {
        terminate(dictation, { text: "discard" });
        return;
      }
      if (availability === "unsupported-language") {
        terminate(dictation, {
          text: "discard",
          announce: voiceErrorMessage("language-not-supported"),
          priority: "assertive",
        });
        return;
      }
      listen(dictation, lang, availability === "on-device");
    } catch (error) {
      console.warn("Voice command failed:", error);
      terminate(dictation, { text: "discard", announce: voiceErrorMessage("start-failed"), priority: "assertive" });
    }
  }, [recognizer, terminate, requestStop, listen]);

  // Anything other than dictation changing the input makes the text the player's.
  useEffect(() => useInputStore.subscribe((state, previous) => {
    const dictation = currentRef.current;
    if (!dictation) return;
    // A reset for a new owner (a connection starting, a first sign-in) ends any
    // dictation, whatever the text is now: the launched-draft keeper may already
    // have put its draft back in this same notification, so comparing text
    // cannot tell. Keep whatever the reset or the keeper left.
    if (state.ownerResets !== previous.ownerResets) {
      terminate(dictation, { text: "keep", announce: "Dictation stopped", inInputNotification: true });
      return;
    }
    if (dictation.phase !== "listening" || state.text === previous.text) return;
    if (state.text !== dictation.written) {
      terminate(dictation, { text: "keep", announce: "Stopped listening", inInputNotification: true });
    }
  }), [terminate]);

  // A dictation belongs to the player, game session and connection it started under.
  useEffect(() => {
    const check = () => {
      const dictation = currentRef.current;
      if (!dictation) return;
      const reason = identityChange(dictation.identity, currentIdentity());
      if (reason) terminate(dictation, { text: "discard", announce: `Dictation stopped: ${reason}` });
    };
    const unsubscribePersonal = usePersonalDataStore.subscribe(check);
    const unsubscribeConnection = useConnectionStore.subscribe(check);
    return () => {
      unsubscribePersonal();
      unsubscribeConnection();
    };
  }, [terminate]);

  // Turning the feature off ends any dictation the moment the preference
  // changes, not after React re-renders: a result arriving in between must not send.
  useEffect(() => usePreferences.subscribe(
    (state) => state.voiceInput.enabled,
    (enabledNow) => {
      const dictation = currentRef.current;
      if (!enabledNow && dictation) terminate(dictation, { text: "discard", announce: "Dictation stopped" });
    },
  ), [terminate]);

  // Unmounting ends any dictation silently.
  useEffect(() => () => {
    if (currentRef.current) terminate(currentRef.current, { text: "discard" });
  }, [terminate]);

  useEffect(() => {
    if (!enabled || !recognizer) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      if (isVoiceCommandToggle(event)) {
        event.preventDefault();
        event.stopPropagation();
        void toggle();
      } else if (event.key === "Escape" && currentRef.current) {
        // Escape still pauses sounds too; App.tsx handles that.
        const dictation = currentRef.current;
        terminate(dictation, { text: "discard", announce: unsent(dictation) });
      }
    };
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [enabled, recognizer, toggle, terminate]);

  if (!recognizer || !enabled) return null;

  return (
    <button
      type="button"
      className="voice-command-button"
      data-phase={phase}
      aria-label="Voice command"
      aria-pressed={phase !== "idle"}
      aria-keyshortcuts="Alt+Shift+D"
      title="Voice command (Alt+Shift+D)"
      onClick={() => void toggle()}
    >
      <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="22" height="22">
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7" />
      </svg>
    </button>
  );
};

export default VoiceCommandButton;
