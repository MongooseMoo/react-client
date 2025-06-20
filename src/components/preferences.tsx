import React, { useState } from "react";
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

const PreviewButton: React.FC = () => {
  const [state] = usePreferences();
  const [isPlaying, setIsPlaying] = useState(false);

  // Add a ref to track if component is mounted
  const isMounted = React.useRef(true);

  // Clean up on component unmount
  React.useEffect(() => {
    return () => {
      isMounted.current = false;
      speechSynthesis.cancel();
    };
  }, []);

  const handlePreview = () => {
    if (isPlaying) return; // Extra guard against concurrent calls
    setIsPlaying(true);
    console.log("Preview button clicked");

    const speakText = () => {
      if (!isMounted.current) return; // Don't proceed if unmounted

      const utterance = new SpeechSynthesisUtterance("This is a preview of the selected voice settings.");
      
      // Find the selected voice
      const voices = speechSynthesis.getVoices();
      console.log("Available voices:", voices.map(v => v.name));
      const selectedVoice = voices.find(voice => voice.name === state.speech.voice);
      console.log("Selected voice:", selectedVoice ? selectedVoice.name : "Not found");
      utterance.voice = selectedVoice || null;

      utterance.rate = state.speech.rate;
      utterance.pitch = state.speech.pitch;
      utterance.volume = state.speech.volume;

      console.log("Utterance settings:", {
        voice: utterance.voice ? utterance.voice.name : "Default",
        rate: utterance.rate,
        pitch: utterance.pitch,
        volume: utterance.volume
      });

      utterance.onend = () => {
        if (isMounted.current) {
          console.log("Speech ended");
          setIsPlaying(false);
        }
      };
      utterance.onerror = (event) => {
        if (isMounted.current) {
          console.error('Speech synthesis error:', event);
          setIsPlaying(false);
        }
      };

      // Cancel any ongoing speech
      speechSynthesis.cancel();

      // Speak the new utterance
      speechSynthesis.speak(utterance);
      console.log("Speech started");
    };

    // Check if voices are loaded
    if (speechSynthesis.getVoices().length > 0) {
      speakText();
    } else {
      // Create a cleanup function for the voices changed handler
      let voicesChangedHandler: (() => void) | null = () => {
        if (voicesChangedHandler) {
          speechSynthesis.onvoiceschanged = null; // Remove the event listener
          voicesChangedHandler = null; // Clear the reference
          if (isMounted.current) {
            speakText();
          }
        }
      };

      // Set up the handler
      speechSynthesis.onvoiceschanged = voicesChangedHandler;

      // Clean up the handler if component unmounts while waiting for voices
      const cleanup = () => {
        if (voicesChangedHandler) {
          speechSynthesis.onvoiceschanged = null;
          voicesChangedHandler = null;
        }
      };

      // Add cleanup to effect
      React.useEffect(() => cleanup, []);
    }
  };

  return (
    <button onClick={handlePreview} disabled={isPlaying}>
      {isPlaying ? "Playing..." : "Preview Voice"}
    </button>
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
      <PreviewButton />
    </div>
  );
};


const SoundsTab: React.FC = () => {
  const [state, dispatch] = usePreferences();

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={state.sound.muteInBackground}
          onChange={(e) =>
            dispatch({
              type: PrefActionType.SetSound,
              data: { ...state.sound, muteInBackground: e.target.checked },
            })
          }
        />
        Mute sounds when in background
      </label>
    </div>
  );
};

const EditorTab: React.FC = () => {
  const [state, dispatch] = usePreferences();
  const editor = state.editor;

  const handleAutocompleteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: PrefActionType.SetEditorAutocompleteEnabled,
      data: e.target.checked,
    });
  };

  const handleAccessibilityModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: PrefActionType.SetEditorAccessibilityMode,
      data: e.target.checked,
    });
  };

  return (
    <div>
      <label>
        <input type="checkbox" checked={editor.autocompleteEnabled} onChange={handleAutocompleteChange} />
        Enable Autocomplete
      </label>
      <br />
      <label>
        <input type="checkbox" checked={editor.accessibilityMode} onChange={handleAccessibilityModeChange} />
        Enable Accessibility Mode
      </label>
      <br />
    </div>
  );
};

const Preferences: React.FC = () => {
  const tabs = [
    { label: "General", content: <GeneralTab /> },
    { label: "Speech", content: <SpeechTab /> },
    { label: "Sounds", content: <SoundsTab /> },
    { label: "Editor", content: <EditorTab /> },
  ];

  return <Tabs tabs={tabs} />;
};

export default Preferences;
