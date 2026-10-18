import { announce } from "@react-aria/live-announcer";
import { useEffect, useState } from "react";
import { usePreferences } from "../stores/preferencesStore";
import {
  checkAvailability,
  getRecognitionConstructor,
  recognitionLanguage,
  type VoiceAvailability,
} from "../voiceInput";
import "./VoiceCommandPreferences.css";

function privacyText(availability: VoiceAvailability | "checking", lang: string): string {
  switch (availability) {
    case "checking":
      return "Checking where speech is turned into text…";
    case "on-device":
      return `Speech in ${lang} is turned into text on this device. Your audio does not leave your computer.`;
    case "downloadable":
      return `This browser can turn ${lang} speech into text on this device after a one-time download. Until then, your audio is sent to the browser maker's speech service (Google, in Chrome).`;
    case "cloud":
      return `This browser sends your audio to its maker's speech service (Google, in Chrome) to turn ${lang} speech into text. It cannot do this on this device.`;
    case "unknown":
      return "This browser does not say where speech is turned into text. Assume your audio is sent to its maker's speech service, such as Google in Chrome or Apple in Safari.";
    case "unsupported-language":
      return `This browser cannot turn ${lang} speech into text. Choose another language.`;
  }
}

/** Voice command settings, in the Speech section. */
const VoiceCommandPreferences = () => {
  const voiceInput = usePreferences((state) => state.voiceInput);
  const setVoiceInput = usePreferences((state) => state.setVoiceInput);
  const [recognizer] = useState(getRecognitionConstructor);
  const [availability, setAvailability] = useState<VoiceAvailability | "checking">("checking");
  const [installing, setInstalling] = useState(false);
  const lang = recognitionLanguage(voiceInput.language);

  useEffect(() => {
    if (!recognizer) return;
    let cancelled = false;
    setAvailability("checking");
    void checkAvailability(recognizer, lang).then((result) => {
      if (!cancelled) setAvailability(result);
    });
    return () => {
      cancelled = true;
    };
  }, [recognizer, lang]);

  if (!recognizer) {
    return (
      <fieldset className="voice-command-preferences">
        <legend>Voice commands</legend>
        <p className="voice-command-note">
          Voice commands need a browser with speech recognition, such as Chrome, Edge or Safari.
        </p>
      </fieldset>
    );
  }

  const install = async () => {
    if (!recognizer.install) return;
    setInstalling(true);
    announce(`Downloading speech recognition for ${lang}`, "polite");
    let installed = false;
    try {
      installed = await recognizer.install({ langs: [lang], processLocally: true });
    } catch (error) {
      console.warn("On-device speech recognition download failed:", error);
    }
    setInstalling(false);
    announce(
      installed
        ? `Speech in ${lang} is now turned into text on this device.`
        : "The download did not finish. Your audio still goes to the speech service.",
      installed ? "polite" : "assertive",
    );
    setAvailability(await checkAvailability(recognizer, lang));
  };

  return (
    <fieldset className="voice-command-preferences">
      <legend>Voice commands</legend>
      <p id="voice-command-privacy" className="voice-command-note" data-availability={availability}>
        {privacyText(availability, lang)}
      </p>
      {availability === "downloadable" && recognizer.install && (
        <button type="button" onClick={() => void install()} disabled={installing}>
          {installing ? "Downloading…" : "Download on-device recognition"}
        </button>
      )}
      <label>
        <input
          type="checkbox"
          checked={voiceInput.enabled}
          aria-describedby="voice-command-privacy voice-command-help"
          onChange={(event) => setVoiceInput({ ...voiceInput, enabled: event.target.checked })}
        />
        Voice commands
      </label>
      <p id="voice-command-help" className="voice-command-note">
        Press Alt+Shift+D or the microphone button by the command box, then speak one command.
        Listening stops when you pause; press again to stop sooner, or Escape to discard.
      </p>
      <label>
        <input
          type="checkbox"
          checked={voiceInput.sendImmediately}
          aria-describedby="voice-command-send-help"
          onChange={(event) => setVoiceInput({ ...voiceInput, sendImmediately: event.target.checked })}
        />
        Send what I say at once
      </label>
      <p id="voice-command-send-help" className="voice-command-note">
        When off, what you said waits in the command box for you to check and press Enter.
      </p>
      <label htmlFor="voice-command-language">Recognition language</label>
      <input
        id="voice-command-language"
        type="text"
        value={voiceInput.language}
        placeholder={recognitionLanguage("")}
        spellCheck={false}
        autoComplete="off"
        aria-describedby="voice-command-language-help"
        onChange={(event) => setVoiceInput({ ...voiceInput, language: event.target.value })}
      />
      <p id="voice-command-language-help" className="voice-command-note">
        A language tag such as en-US or fr-FR. Leave empty to follow the page language.
      </p>
    </fieldset>
  );
};

export default VoiceCommandPreferences;
