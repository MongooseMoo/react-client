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

/**
 * One press of the button. It is current until it ends or is cancelled; every
 * callback checks it is still current before touching the input, so a late
 * result from an old dictation can never write or send.
 */
interface Dictation {
  phase: "starting" | "listening";
  /** The player, game session and connection it was started for. */
  identity: string;
  handle: DictationHandle;
  /** The input's text when listening began. */
  draft: string;
  /** The text dictation last put in the input; any other text is the player's. */
  written: string;
  /** A final result has arrived; the recognizer has not ended yet. */
  finalized: boolean;
  /** Enter or Send was pressed while listening: send the final result. */
  sendOnFinal: boolean;
  session: VoiceSession | null;
  releaseSpeech: (() => void) | null;
}

function appendToDraft(draft: string, heard: string): string {
  return draft.trim() ? `${draft.trimEnd()} ${heard}` : heard;
}

function currentIdentity(): string {
  const { owner, visitor, gameSessionId } = usePersonalDataStore.getState();
  const { connected } = useConnectionStore.getState();
  return JSON.stringify([owner ? ownerKey(owner) : null, visitor, gameSessionId, connected]);
}

/**
 * Press (or Alt+Shift+D) to listen for one spoken command; press again to stop
 * early, Escape to discard. What is heard so far shows in the command input
 * but cannot be sent: Enter or Send finishes listening and sends the final
 * transcript. Otherwise the final transcript stays there to check, or is sent
 * at once if the player chose that. Typing, recalling history, or anything
 * else changing the input stops dictation and keeps that text. Renders
 * nothing where the browser has no speech recognition.
 */
const VoiceCommandButton = ({ onSend }: Props) => {
  const enabled = usePreferences((state) => state.voiceInput.enabled);
  const [recognizer] = useState(getRecognitionConstructor);
  const [phase, setPhase] = useState<Phase>("idle");
  const currentRef = useRef<Dictation | null>(null);
  const onSendRef = useRef(onSend);
  onSendRef.current = onSend;

  /** Stop treating this dictation as current. Its later callbacks do nothing. */
  const retire = useCallback((dictation: Dictation) => {
    if (currentRef.current !== dictation) return;
    currentRef.current = null;
    dictation.releaseSpeech?.();
    if (useInputStore.getState().dictation === dictation.handle) {
      useInputStore.getState().setDictation(null);
    }
    setPhase("idle");
  }, []);

  /**
   * End this dictation now and discard what it heard.
   * - player: Escape or a second press while starting; put the draft back.
   * - edit: the player changed the input; keep their text.
   * - quiet: preference off, unmount, a typed send, or a new player or
   *   connection; touch nothing.
   */
  const cancel = useCallback((dictation: Dictation, reason: "player" | "edit" | "quiet") => {
    if (currentRef.current !== dictation) return;
    const listening = dictation.phase === "listening" && !dictation.finalized;
    retire(dictation);
    dictation.session?.abort();
    // After a final result, what was heard is already the player's text.
    if (reason === "quiet" || dictation.finalized) return;
    if (reason === "player" && listening && useInputStore.getState().text === dictation.written) {
      useInputStore.getState().setText(dictation.draft);
    }
    announce("Stopped listening", "polite");
  }, [retire]);

  const listen = useCallback((dictation: Dictation, lang: string, processLocally: boolean) => {
    if (!recognizer) return;
    const { sendImmediately } = usePreferences.getState().voiceInput;
    const input = useInputStore.getState;
    dictation.phase = "listening";
    dictation.draft = input().text;
    dictation.written = dictation.draft;
    dictation.releaseSpeech = suspendClientSpeech();
    setPhase("listening");
    const isCurrent = () => currentRef.current === dictation;
    const restoreDraft = () => {
      if (dictation.finalized || input().text !== dictation.written) return;
      dictation.written = dictation.draft;
      input().setText(dictation.draft);
    };

    const session = startVoiceSession(recognizer, { lang, processLocally }, {
      onStart: () => {
        if (!isCurrent()) return;
        // LiveKit keeps its own hold on the microphone, so voice chat hears the command too.
        const inVoiceChat = useLiveKitStore.getState().rooms.length > 0;
        announce(inVoiceChat ? "Listening. Voice chat can hear you." : "Listening", "assertive");
      },
      onInterim: (text) => {
        if (!isCurrent() || dictation.finalized) return;
        dictation.written = appendToDraft(dictation.draft, text);
        input().setText(dictation.written);
      },
      onFinal: (text) => {
        if (!isCurrent() || dictation.finalized) return;
        const command = appendToDraft(dictation.draft, text);
        dictation.finalized = true;
        dictation.written = command;
        // From here the text is the player's; the send path no longer asks.
        if (input().dictation === dictation.handle) input().setDictation(null);
        if (sendImmediately || dictation.sendOnFinal) {
          input().setText(command);
          announce(`Sent ${text}`, "polite");
          onSendRef.current();
        } else {
          setInputTextAndFocus(command, command.length);
          announce(`Heard ${text}`, "polite");
        }
      },
      onError: (code) => {
        if (!isCurrent()) return;
        restoreDraft();
        retire(dictation);
        announce(voiceErrorMessage(code), "assertive");
      },
      onEnd: () => {
        if (!isCurrent()) return;
        if (!dictation.finalized) {
          restoreDraft();
          announce("Stopped listening", "polite");
        }
        retire(dictation);
      },
    });
    // A recognizer that refused to start has already ended and retired this dictation.
    if (isCurrent()) dictation.session = session;
  }, [recognizer, retire]);

  const toggle = useCallback(async () => {
    if (!recognizer) return;
    const current = currentRef.current;
    if (current) {
      if (current.phase === "starting") cancel(current, "player");
      else if (!current.finalized) current.session?.stop();
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
            cancel(dictation, "quiet");
            return false;
          }
          if (!dictation.sendOnFinal) {
            dictation.sendOnFinal = true;
            dictation.session?.stop();
          }
          return true;
        },
      },
      draft: "",
      written: "",
      finalized: false,
      sendOnFinal: false,
      session: null,
      releaseSpeech: null,
    };
    currentRef.current = dictation;
    useInputStore.getState().setDictation(dictation.handle);
    setPhase("starting");

    const lang = recognitionLanguage(usePreferences.getState().voiceInput.language);
    const availability = await checkAvailability(recognizer, lang);
    // Escape, a second press, a typed send, turning the feature off, unmounting
    // or a new player or connection may have cancelled it while the browser answered.
    if (currentRef.current !== dictation) return;
    if (!usePreferences.getState().voiceInput.enabled || currentIdentity() !== dictation.identity) {
      cancel(dictation, "quiet");
      return;
    }
    if (availability === "unsupported-language") {
      retire(dictation);
      announce(voiceErrorMessage("language-not-supported"), "assertive");
      return;
    }
    listen(dictation, lang, availability === "on-device");
  }, [recognizer, cancel, retire, listen]);

  // Anything other than dictation changing the input makes the text the player's.
  useEffect(() => useInputStore.subscribe((state, previous) => {
    const dictation = currentRef.current;
    if (dictation?.phase !== "listening" || dictation.finalized) return;
    if (state.text !== previous.text && state.text !== dictation.written) cancel(dictation, "edit");
  }), [cancel]);

  // A dictation belongs to the player, game session and connection it started under.
  useEffect(() => {
    const check = () => {
      const dictation = currentRef.current;
      if (dictation && currentIdentity() !== dictation.identity) cancel(dictation, "quiet");
    };
    const unsubscribePersonal = usePersonalDataStore.subscribe(check);
    const unsubscribeConnection = useConnectionStore.subscribe(check);
    return () => {
      unsubscribePersonal();
      unsubscribeConnection();
    };
  }, [cancel]);

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
        cancel(currentRef.current, "player");
      }
    };
    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      // Turning the feature off or unmounting ends any dictation, starting or listening.
      if (currentRef.current) cancel(currentRef.current, "quiet");
    };
  }, [enabled, recognizer, toggle, cancel]);

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
