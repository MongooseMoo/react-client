import React from "react";
import { PrefActionType } from "../PreferencesStore";
import { usePreferences } from "../hooks/usePreferences";
import { useVoices } from "../hooks/useVoices";
import Tabs from "./tabs";

const GeneralTab: React.FC = () => {
  const [state, dispatch] = usePreferences();

  return (
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
};

const AutoRead: React.FC = () => {
  const [state, dispatch] = usePreferences();

  return (
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
  );
};

const VoiceSelection: React.FC = () => {
  const [state, dispatch] = usePreferences();
  const voices = useVoices();

  return (
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
  );
};

const RateSelection: React.FC = () => {
  const [state, dispatch] = usePreferences();

  return (
    <label>
      Rate (0.1 - 10.0):
      <input
        type="range"
        min="0.1"
        max="10.0"
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
  );
};

const PitchSelection: React.FC = () => {
  const [state, dispatch] = usePreferences();

  return (
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
  );
};

const VolumeSelection: React.FC = () => {
  const [state, dispatch] = usePreferences();

  return (
    <label>
      Volume (0 - 1):
      <input
        type="range"
        min="0.1"
        max="1"
        step="0.1"
        value={state.speech.volume}
        onChange={(e) =>
          dispatch({
            type: PrefActionType.SetSpeech,
            data: { ...state.speech, volume: parseFloat(e.target.value) },
          })
        }
      />
    </label>
  );
};

const SpeechTab: React.FC = () => {
  return (
    <div>
      <AutoRead />
      <br />
      <VoiceSelection />
      <br />
      <RateSelection />
      <br />
      <PitchSelection />
      <br />
      <VolumeSelection />
      <br />
    </div>
  );
};

const Preferences: React.FC = () => {
  const tabs = [
    { label: "General", content: <GeneralTab /> },
    { label: "Speech", content: <SpeechTab /> },
  ];

  return <Tabs tabs={tabs} />;
};

export default Preferences;
