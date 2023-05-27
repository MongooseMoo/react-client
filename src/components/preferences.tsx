import React from "react";
import { PrefActionType } from "../PreferencesStore";
import { usePreferences } from "../hooks/usePreferences";
import { useVoices } from "../hooks/useVoices";
import Tabs from "./tabs"; // Import the new Tab component

const Preferences: React.FC = () => {
  const [state, dispatch] = usePreferences();
  const voices = useVoices();

  const generalTabContent = (
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
  );

  const speechTabContent = (
    <div>
      <label>
        Auto Read:
        <select
          value={state.speech.autoreadMode}
          onChange={(e) =>
            dispatch({
              type: PrefActionType.SetSpeech,
              data: {
                ...state.speech,
                autoreadMode: e.target.value as any,
              },
            })
          }
        >
          <option value="off">Off</option>
          <option value="unfocused">Unfocused</option>
          <option value="all">Always</option>
        </select>
      </label>
      <br />
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
      <br />
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
      <br />
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
      <br />
    </div>
  );

  const tabs = [
    { label: "General", content: generalTabContent },
    { label: "Speech", content: speechTabContent },
  ];

  return <Tabs tabs={tabs} />;
};

export default Preferences;
