import React, { useEffect, useRef, useState } from "react";
import { PrefActionType } from "../PreferencesStore";
import { usePreferences } from "../hooks/UsePreferences";
import { useVoices } from "../hooks/useVoices";
import "./preferences.css";

const Preferences: React.FC = () => {
  const [state, dispatch] = usePreferences();
  const [selectedTab, setSelectedTab] = useState<"general" | "speech">(
    "general"
  );
  const voices = useVoices();

  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  return (
    <div role="tablist" aria-label="Preferences" tabIndex={0} ref={dialogRef}>
      <button
        role="tab"
        aria-selected={selectedTab === "general"}
        id="general-tab"
        aria-controls="general-panel"
        onClick={() => setSelectedTab("general")}
      >
        General
      </button>
      <button
        role="tab"
        aria-selected={selectedTab === "speech"}
        id="speech-tab"
        aria-controls="speech-panel"
        onClick={() => setSelectedTab("speech")}
      >
        Speech
      </button>

      <div
        role="tabpanel"
        id="general-panel"
        aria-labelledby="general-tab"
        hidden={selectedTab !== "general"}
      >
        <label>
          <input
            type="checkbox"
            checked={state.general.localEcho}
            onChange={(e) =>
              dispatch({
                type: PrefActionType.SetGeneral,
                data: { ...state.general, localEcho: e.target.checked },
              })
            }
          />
          Local Echo
        </label>
      </div>

      <div
        role="tabpanel"
        id="speech-panel"
        aria-labelledby="speech-tab"
        hidden={selectedTab !== "speech"}
      >
        <label>
          Voice:
          <select
            value={state.speech.voice}
            onChange={(e) =>
              dispatch({
                type: PrefActionType.SetSpeech,
                data: { ...state.speech, voice: e.target.value },
              })
            }
          >
            {voices.map((voice) => (
              <option key={voice.voiceURI} value={voice.name}>
                {voice.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Rate (0.1 - 2.0):
          <input
            type="range"
            min="0.1"
            max="2.0"
            step="0.1"
            value={state.speech.rate}
            onChange={(e) =>
              dispatch({
                type: PrefActionType.SetSpeech,
                data: { ...state.speech, rate: parseFloat(e.target.value) },
              })
            }
          />
        </label>
        <label>
          Pitch (0 - 2):
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={state.speech.pitch}
            onChange={(e) =>
              dispatch({
                type: PrefActionType.SetSpeech,
                data: { ...state.speech, pitch: parseFloat(e.target.value) },
              })
            }
          />
        </label>
      </div>
    </div>
  );
};

export default Preferences;
