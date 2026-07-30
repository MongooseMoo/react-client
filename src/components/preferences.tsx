import React, { useState } from "react";
import { announce } from "@react-aria/live-announcer";
import type { AutoreadMode, NavigationKeyScheme } from "../stores/preferencesStore";
import { usePreferences } from "../stores/preferencesStore";
import { useVoices } from "../hooks/useVoices";
import Tabs, { type TabProps } from "./tabs";
import AutoLogDialog, { type AutoLogDialogRef } from "./AutoLogDialog";

const GeneralTab: React.FC = () => {
  const general = usePreferences((state) => state.general);
  const setGeneral = usePreferences((state) => state.setGeneral);

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={general.localEcho}
          onChange={(e) =>
            setGeneral({ ...general, localEcho: e.target.checked })
          }
        />
        Local Echo
      </label>
      <br />
      <label>
        <input
          type="checkbox"
          checked={general.syncTimezoneToServer}
          onChange={(e) =>
            setGeneral({
              ...general,
              syncTimezoneToServer: e.target.checked,
            })
          }
        />
        Sync timezone to server
      </label>
      <br />
      <label>
        <input
          type="checkbox"
          checked={general.syncLocationToServer}
          onChange={(e) =>
            setGeneral({
              ...general,
              syncLocationToServer: e.target.checked,
            })
          }
        />
        Sync browser location to server
      </label>
    </div>
  );
};

const AutoRead: React.FC = () => {
  const speech = usePreferences((state) => state.speech);
  const setSpeech = usePreferences((state) => state.setSpeech);

  return (
    <label>
      Auto Read:
      <select
        value={speech.autoreadMode}
        onChange={(e) =>
          setSpeech({
            ...speech,
            autoreadMode: e.target.value as AutoreadMode,
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
  const speech = usePreferences((state) => state.speech);
  const setSpeech = usePreferences((state) => state.setSpeech);
  const voices = useVoices();

  return (
    <label>
      Voice:
      <select
        value={speech.voice}
        onChange={(e) =>
          setSpeech({ ...speech, voice: e.target.value })
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
  const speech = usePreferences((state) => state.speech);
  const setSpeech = usePreferences((state) => state.setSpeech);

  return (
    <label>
      Rate ({speech.rate.toFixed(1)}, range 0.1 - 10.0):
      <input
        type="range"
        min="0.1"
        max="10.0"
        step="0.1"
        value={speech.rate}
        onChange={(e) =>
          setSpeech({ ...speech, rate: parseFloat(e.target.value) })
        }
      />
    </label>
  );
};

const PitchSelection: React.FC = () => {
  const speech = usePreferences((state) => state.speech);
  const setSpeech = usePreferences((state) => state.setSpeech);

  return (
    <label>
      Pitch ({speech.pitch.toFixed(1)}, range 0 - 2):
      <input
        type="range"
        min="0"
        max="2"
        step="0.1"
        value={speech.pitch}
        onChange={(e) =>
          setSpeech({ ...speech, pitch: parseFloat(e.target.value) })
        }
      />
    </label>
  );
};

const VolumeSelection: React.FC = () => {
  const speech = usePreferences((state) => state.speech);
  const setSpeech = usePreferences((state) => state.setSpeech);

  return (
    <label>
      Volume ({speech.volume.toFixed(2)}, range 0 - 1):
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={speech.volume}
        onChange={(e) =>
          setSpeech({ ...speech, volume: parseFloat(e.target.value) })
        }
      />
    </label>
  );
};

const PreviewButton: React.FC = () => {
  const speech = usePreferences((state) => state.speech);
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
    announce("Playing voice preview", "polite");

    const speakText = () => {
      if (!isMounted.current) return; // Don't proceed if unmounted

      const utterance = new SpeechSynthesisUtterance("This is a preview of the selected voice settings.");

      // Find the selected voice
      const voices = speechSynthesis.getVoices();
      const selectedVoice = voices.find(voice => voice.name === speech.voice);
      utterance.voice = selectedVoice || null;

      utterance.rate = speech.rate;
      utterance.pitch = speech.pitch;
      utterance.volume = speech.volume;

      utterance.onend = () => {
        if (isMounted.current) {
          setIsPlaying(false);
          announce("Voice preview finished", "polite");
        }
      };
      utterance.onerror = (event) => {
        if (isMounted.current) {
          console.error('Speech synthesis error:', event);
          setIsPlaying(false);
          announce("Voice preview finished", "polite");
        }
      };

      // Cancel any ongoing speech
      speechSynthesis.cancel();

      // Speak the new utterance
      speechSynthesis.speak(utterance);
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
    }
  };

  return (
    <button type="button" onClick={handlePreview}>
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
  const sound = usePreferences((state) => state.sound);
  const setSound = usePreferences((state) => state.setSound);

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={sound.muteInBackground}
          onChange={(e) =>
            setSound({ ...sound, muteInBackground: e.target.checked })
          }
        />
        Mute sounds when in background
      </label>
    </div>
  );
};

const EditorTab: React.FC = () => {
  const editor = usePreferences((state) => state.editor);
  const setEditorAutocompleteEnabled = usePreferences(
    (state) => state.setEditorAutocompleteEnabled,
  );
  const setEditorAccessibilityMode = usePreferences(
    (state) => state.setEditorAccessibilityMode,
  );

  const handleAutocompleteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditorAutocompleteEnabled(e.target.checked);
  };

  const handleAccessibilityModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditorAccessibilityMode(e.target.checked);
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
  const midi = usePreferences((state) => state.midi);
  const setMidi = usePreferences((state) => state.setMidi);

  const handleMidiEnabledChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMidi({ enabled: e.target.checked });
  };

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={midi.enabled}
          onChange={handleMidiEnabledChange}
          aria-describedby="midi-help"
        />
        Enable MIDI
      </label>
      <br />
      <br />

      {midi.enabled && (
        <p id="midi-help" style={{ color: "var(--color-text-secondary)", fontSize: "0.9em" }}>
          Device selection and management is available in the MIDI tab when connected to a server.
        </p>
      )}
    </div>
  );
};

const HapticsTab: React.FC = () => {
  const haptics = usePreferences((state) => state.haptics);
  const setHaptics = usePreferences((state) => state.setHaptics);

  const handleHapticsEnabledChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHaptics({ ...haptics, enabled: e.target.checked });
  };

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={haptics.enabled}
          onChange={handleHapticsEnabledChange}
          aria-describedby="haptics-bluetooth-help"
        />
        Enable Haptics
      </label>

      {haptics.enabled && (
        <div>
          <br />
          <label>
            Intensity Cap ({Math.round(haptics.intensityCap * 100)}%):
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={haptics.intensityCap}
              onChange={(e) =>
                setHaptics({ ...haptics, intensityCap: parseFloat(e.target.value) })
              }
            />
          </label>
          <br />
          <label>
            Auto-Stop Timeout (seconds):
            <input
              type="number"
              min="1"
              max="60"
              value={haptics.autoStopTimeout}
              onChange={(e) =>
                setHaptics({ ...haptics, autoStopTimeout: parseInt(e.target.value, 10) || 1 })
              }
            />
          </label>
          <br />
          <p id="haptics-bluetooth-help" style={{ color: "var(--color-text-secondary)", fontSize: "0.9em", marginTop: "8px" }}>
            Bluetooth device support requires Chrome, Edge, or another Chromium-based browser.
          </p>
        </div>
      )}
    </div>
  );
};

const KeyboardTab: React.FC = () => {
  const keyboard = usePreferences((state) => state.keyboard);
  const setKeyboard = usePreferences((state) => state.setKeyboard);

  return (
    <div>
      <label>
        Buffer Navigation Keys:
        <select
          value={keyboard.navigationKeyScheme}
          onChange={(e) =>
            setKeyboard({ navigationKeyScheme: e.target.value as NavigationKeyScheme })
          }
          aria-describedby="keyboard-nav-help"
        >
          <option value="jkli">JKLI (QWERTY right-hand)</option>
          <option value="wasd">WASD (QWERTY left-hand)</option>
          <option value="dvorak-rh">HTNC (Dvorak right-hand)</option>
          <option value="dvorak-lh">,OAE (Dvorak left-hand)</option>
        </select>
      </label>
      <p id="keyboard-nav-help" style={{ color: "var(--color-text-secondary)", fontSize: "0.9em", marginTop: "0.5em" }}>
        Arrow keys always work in addition to the selected scheme.
      </p>
    </div>
  );
};

const AutologgingTab: React.FC = () => {
  const autologging = usePreferences((state) => state.autologging);
  const setAutologging = usePreferences((state) => state.setAutologging);
  const dialogRef = React.useRef<AutoLogDialogRef | null>(null);
  const maxMegabytes = Math.round(autologging.maxBytes / 1024 / 1024);

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={autologging.enabled}
          onChange={(e) =>
            setAutologging({ ...autologging, enabled: e.target.checked })
          }
        />
        Enable Autologging
      </label>
      <br />
      <label>
        Storage Cap (MB):
        <input
          type="number"
          min="1"
          max="2048"
          value={maxMegabytes}
          onChange={(e) =>
            setAutologging({
              ...autologging,
              maxBytes: Math.max(1, parseInt(e.target.value, 10) || 1) * 1024 * 1024,
            })
          }
        />
      </label>
      <br />
      <button type="button" onClick={() => dialogRef.current?.open()}>Manage Autologs</button>
      <AutoLogDialog ref={dialogRef} />
    </div>
  );
};

const Preferences: React.FC = () => {
  const tabs: TabProps[] = [
    { id: "preferences-general-tab", label: "General", content: <GeneralTab /> },
    { id: "preferences-speech-tab", label: "Speech", content: <SpeechTab /> },
    { id: "preferences-sounds-tab", label: "Sounds", content: <SoundsTab /> },
    { id: "preferences-editor-tab", label: "Editor", content: <EditorTab /> },
    { id: "preferences-keyboard-tab", label: "Keyboard", content: <KeyboardTab /> },
    { id: "preferences-midi-tab", label: "MIDI", content: <MidiTab /> },
    { id: "preferences-haptics-tab", label: "Haptics", content: <HapticsTab /> },
    { id: "preferences-autologging-tab", label: "Logging", content: <AutologgingTab /> },
  ];

  return <Tabs tabs={tabs} ariaLabel="Preferences sections" />;
};

export default Preferences;
