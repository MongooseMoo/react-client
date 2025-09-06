import React, { useState, useEffect } from "react";
import { PrefActionType } from "../PreferencesStore";
import { usePreferences } from "../hooks/usePreferences";
import { useVoices } from "../hooks/useVoices";
import { midiService, MidiDevice } from "../MidiService";
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

const MidiTab: React.FC = () => {
  const [state, dispatch] = usePreferences();

  const handleMidiEnabledChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: PrefActionType.SetMidi,
      data: { ...state.midi, enabled: e.target.checked },
    });
  };

  const handleMidiJsSoundfontChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSoundfont = e.target.value;
    dispatch({
      type: PrefActionType.SetMidi,
      data: { ...state.midi, midiJsSoundfont: newSoundfont },
    });
    // Reload synthesizers with new soundfont
    if (midiService.isInitialized) {
      await midiService.reloadSynthesizers();
    }
  };

  const handleSpessaSynthSoundfontChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSoundfontUrl = e.target.value;
    dispatch({
      type: PrefActionType.SetMidi,
      data: { ...state.midi, spessaSynthSoundfont: newSoundfontUrl },
    });
    // Reload synthesizers with new soundfont
    if (midiService.isInitialized) {
      await midiService.reloadSynthesizers();
    }
  };

  if (!midiService.isSupported) {
    return (
      <div>
        <p>MIDI is not supported in this browser.</p>
        <p>MIDI support is available in Chrome, Edge, Opera, and Brave.</p>
      </div>
    );
  }

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={state.midi.enabled}
          onChange={handleMidiEnabledChange}
        />
        Enable MIDI
      </label>
      <br />
      <br />
      
      {state.midi.enabled && (
        <div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              MIDI.js Soundfont:
            </label>
            <select 
              value={state.midi.midiJsSoundfont || 'MusyngKite'}
              onChange={handleMidiJsSoundfontChange}
              style={{ padding: '5px', minWidth: '200px' }}
            >
              <option value="FatBoy">FatBoy</option>
              <option value="FluidR3">FluidR3 GM</option>
              <option value="MusyngKite">MusyngKite (Default)</option>
            </select>
            <p style={{ color: '#666', fontSize: '0.8em', margin: '5px 0' }}>
              Soundfont used by the MIDI.js Synthesizer port.
            </p>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              SpessaSynth Soundfont URL:
            </label>
            <input
              type="url"
              value={state.midi.spessaSynthSoundfont || ''}
              onChange={handleSpessaSynthSoundfontChange}
              placeholder="https://example.com/soundfont.sf2"
              style={{ padding: '5px', minWidth: '300px' }}
            />
            <p style={{ color: '#666', fontSize: '0.8em', margin: '5px 0' }}>
              Optional: URL to a SF2/SF3 soundfont file for the SpessaSynth Synthesizer port.
              Leave empty to use SpessaSynth's built-in sounds.
            </p>
          </div>
          
          <p style={{ color: "#666", fontSize: "0.9em" }}>
            Device selection and management is available in the MIDI tab when connected to a server.
          </p>
        </div>
      )}
    </div>
  );
};

const Preferences: React.FC = () => {
  const tabs = [
    { label: "General", content: <GeneralTab /> },
    { label: "Speech", content: <SpeechTab /> },
    { label: "Sounds", content: <SoundsTab /> },
    { label: "Editor", content: <EditorTab /> },
    { label: "MIDI", content: <MidiTab /> },
  ];

  return <Tabs tabs={tabs} />;
};

export default Preferences;
