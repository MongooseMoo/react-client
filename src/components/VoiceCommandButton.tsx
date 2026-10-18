import { announce } from "@react-aria/live-announcer";
import { useCallback, useEffect, useRef, useState } from "react";
import { setInputTextAndFocus } from "../inputFocus";
import { isVoiceCommandToggle } from "../reservedShortcuts";
import { useInputStore } from "../stores/inputStore";
import { useLiveKitStore } from "../stores/liveKitStore";
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

function appendToDraft(draft: string, heard: string): string {
  return draft.trim() ? `${draft.trimEnd()} ${heard}` : heard;
}

/**
 * Press (or Alt+Shift+D) to listen for one spoken command; press again to stop
 * early, Escape to discard. What is heard so far shows in the command input;
 * the final transcript stays there to check, or is sent at once if the player
 * chose that. Renders nothing where the browser has no speech recognition.
 */
const VoiceCommandButton = ({ onSend }: Props) => {
  const enabled = usePreferences((state) => state.voiceInput.enabled);
  const [recognizer] = useState(getRecognitionConstructor);
  const [listening, setListening] = useState(false);
  const sessionRef = useRef<VoiceSession | null>(null);
  const startingRef = useRef(false);
  const mountedRef = useRef(true);
  const onSendRef = useRef(onSend);
  onSendRef.current = onSend;

  const toggle = useCallback(async () => {
    if (!recognizer) return;
    if (sessionRef.current) {
      sessionRef.current.stop();
      return;
    }
    if (startingRef.current) return;

    startingRef.current = true;
    const { language, sendImmediately } = usePreferences.getState().voiceInput;
    const lang = recognitionLanguage(language);
    const availability = await checkAvailability(recognizer, lang);
    startingRef.current = false;
    if (!mountedRef.current) return;
    if (availability === "unsupported-language") {
      announce(voiceErrorMessage("language-not-supported"), "assertive");
      return;
    }

    // The client's own speech would be heard as the command.
    window.speechSynthesis?.cancel();
    const draft = useInputStore.getState().text;
    let heard = false;
    let failed = false;
    let ended = false;

    const session = startVoiceSession(
      recognizer,
      { lang, processLocally: availability === "on-device" },
      {
        onStart: () => {
          setListening(true);
          // LiveKit keeps its own hold on the microphone, so voice chat hears the command too.
          const inVoiceChat = useLiveKitStore.getState().rooms.length > 0;
          announce(inVoiceChat ? "Listening. Voice chat can hear you." : "Listening", "assertive");
        },
        onInterim: (text) => useInputStore.getState().setText(appendToDraft(draft, text)),
        onFinal: (text) => {
          heard = true;
          const command = appendToDraft(draft, text);
          if (sendImmediately) {
            useInputStore.getState().setText(command);
            announce(`Sent ${text}`, "polite");
            onSendRef.current();
          } else {
            setInputTextAndFocus(command, command.length);
            announce(`Heard ${text}`, "polite");
          }
        },
        onError: (code) => {
          failed = true;
          useInputStore.getState().setText(draft);
          announce(voiceErrorMessage(code), "assertive");
        },
        onEnd: () => {
          ended = true;
          if (sessionRef.current === session) sessionRef.current = null;
          if (!mountedRef.current) return;
          setListening(false);
          if (!heard && !failed) {
            useInputStore.getState().setText(draft);
            announce("Stopped listening", "polite");
          }
        },
      },
    );
    if (!ended) sessionRef.current = session;
  }, [recognizer]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      sessionRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!enabled || !recognizer) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      if (isVoiceCommandToggle(event)) {
        event.preventDefault();
        event.stopPropagation();
        void toggle();
      } else if (event.key === "Escape") {
        // Escape still pauses sounds too; App.tsx handles that.
        sessionRef.current?.abort();
      }
    };
    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      sessionRef.current?.abort();
    };
  }, [enabled, recognizer, toggle]);

  if (!recognizer || !enabled) return null;

  return (
    <button
      type="button"
      className="voice-command-button"
      aria-label="Voice command"
      aria-pressed={listening}
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
