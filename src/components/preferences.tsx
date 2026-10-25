import React, { useState } from "react";
import { announce } from "@react-aria/live-announcer";
import type { AutoreadMode, NavigationKeyScheme } from "../stores/preferencesStore";
import { usePreferences } from "../stores/preferencesStore";
import { useVoices } from "../hooks/useVoices";
import Tabs, { type TabProps } from "./tabs";
import AutoLogDialog, { type AutoLogDialogRef } from "./AutoLogDialog";
import LogFolderPreferences from "./LogFolderPreferences";
import ChannelPreferencesTab from "./ChannelPreferences";
import KeystrokePreferencesTab from "./KeystrokePreferences";
import HeadTrackingControls from './HeadTrackingControls';
import AppIntegrationPreferences from '../launch/AppIntegrationPreferences';
import VoiceCommandPreferences from "./VoiceCommandPreferences";
import { clientSpeechSuspended } from "../clientSpeechSuspension";

function PreferenceNumber({ id, label, value, min, max, onCommit }: {
  id: string; label: string; value: number; min: number; max: number;
  onCommit: (value: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));
  const [error, setError] = useState('');
  React.useEffect(() => setDraft(String(value)), [value]);
  const commit = () => {
    const next = Number(draft);
    if (!draft.trim() || !Number.isInteger(next) || next < min || next > max) {
      setError(`Enter a whole number from ${min} to ${max}.`);
      return;
    }
    setError('');
    onCommit(next);
  };
  return <>
    <label htmlFor={id}>{label}</label>
    <input id={id} type="number" min={min} max={max} step="1" value={draft}
      aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined}
      onChange={event => { setDraft(event.currentTarget.value); setError(''); }}
      onBlur={commit} onKeyDown={event => {
        if (event.key === 'Enter') { event.preventDefault(); commit(); }
      }} />
    {error && <p id={`${id}-error`} role="alert">{error}</p>}
  </>;
}

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
      <AppIntegrationPreferences />
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
      Rate
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
      Pitch
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
      Volume
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
    // A listening voice command would hear the preview as the command.
    if (clientSpeechSuspended()) {
      announce("No voice preview while a voice command is listening", "polite");
      return;
    }
    setIsPlaying(true);
    announce("Playing voice preview", "polite");

    const speakText = () => {
      if (!isMounted.current) return; // Don't proceed if unmounted
      // The voices may load after a voice command has started listening.
      if (clientSpeechSuspended()) {
        setIsPlaying(false);
        announce("No voice preview while a voice command is listening", "polite");
        return;
      }

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
      <VoiceCommandPreferences />
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
      <HeadTrackingControls />
    </div>
  );
};

type StatusSoundCue = "reserveTones" | "heartbeat" | "targetBlip" | "effectEarcons";

const STATUS_SOUND_CUES: { cue: StatusSoundCue; label: string; help: string }[] = [
  { cue: "heartbeat", label: "Heartbeat", help: "Beats when your health changes band; faster when it is lower." },
  { cue: "reserveTones", label: "Reserve tones", help: "A tone when a power or body reserve moves by a tenth; higher means fuller." },
  { cue: "targetBlip", label: "Target blip", help: "A blip when your target's health changes; higher means healthier." },
  { cue: "effectEarcons", label: "Effect sounds", help: "Rising tones when you gain an effect, falling when you lose one." },
];

const StatusTab: React.FC = () => {
  const status = usePreferences((state) => state.status);
  const setStatus = usePreferences((state) => state.setStatus);

  return (
    <div>
      <p id="status-keys-help">
        Alt+H reads your health, Alt+M your power reserves, Alt+V your body reserve and Alt+T your
        target. When your buffer keys use H or T, those stay buffer keys.
      </p>
      <label>
        <input
          type="checkbox"
          checked={status.warnings.enabled}
          onChange={(e) => setStatus({ ...status, warnings: { enabled: e.target.checked } })}
          aria-describedby="status-warnings-help"
        />
        Spoken health warnings
      </label>
      <p id="status-warnings-help">Says when your health falls below 50, 25 and 10 percent.</p>
      {STATUS_SOUND_CUES.map(({ cue, label, help }) => (
        <fieldset key={cue}>
          <legend>{label}</legend>
          <label>
            <input
              type="checkbox"
              checked={status[cue].enabled}
              onChange={(e) => setStatus({ ...status, [cue]: { ...status[cue], enabled: e.target.checked } })}
              aria-describedby={`status-${cue}-help`}
            />
            Play
          </label>
          <label>
            {label} volume
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={status[cue].volume}
              disabled={!status[cue].enabled}
              aria-valuetext={`${Math.round(status[cue].volume * 100)}%`}
              onChange={(e) =>
                setStatus({ ...status, [cue]: { ...status[cue], volume: parseFloat(e.target.value) } })
              }
            />
          </label>
          <p id={`status-${cue}-help`}>{help}</p>
        </fieldset>
      ))}
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
  const setEditorLineComments = usePreferences((state) => state.setEditorLineComments);

  const handleAutocompleteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditorAutocompleteEnabled(e.target.checked);
  };

  const handleAccessibilityModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditorAccessibilityMode(e.target.checked);
  };

  const handleLineCommentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditorLineComments(e.target.checked);
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
      <label>
        <input type="checkbox" checked={editor.lineComments} onChange={handleLineCommentsChange} />
        Show "comment"; lines in MOO code as {'//'} comments
      </label>
      <br />
    </div>
  );
};

const MidiTab: React.FC = () => {
  const midi = usePreferences((state) => state.midi);
  const setMidi = usePreferences((state) => state.setMidi);

  const handleMidiEnabledChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMidi({ ...midi, enabled: e.target.checked });
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

        <p id="midi-help" style={{ color: "var(--color-text-secondary)", fontSize: "0.9em" }}>
          Device selection and management is available in the MIDI tab when connected to a server.
        </p>
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
            Intensity Cap
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={haptics.intensityCap}
              aria-valuetext={`${Math.round(haptics.intensityCap * 100)}%`}
              onChange={(e) =>
                setHaptics({ ...haptics, intensityCap: parseFloat(e.target.value) })
              }
            />
          </label>
          <br />
          <PreferenceNumber id="haptics-timeout" label="Auto-Stop Timeout (seconds):"
            min={1} max={60} value={haptics.autoStopTimeout}
            onCommit={autoStopTimeout => setHaptics({ ...haptics, autoStopTimeout })} />
          <br />
        </div>
      )}
      <p id="haptics-bluetooth-help" style={{ color: "var(--color-text-secondary)", fontSize: "0.9em", marginTop: "8px" }}>
        Bluetooth device support requires Chrome, Edge, or another Chromium-based browser.
      </p>
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
        Alt+arrow keys always work in addition to the selected scheme.
      </p>
      <details>
        <summary>Keyboard shortcuts</summary>
        <dl>
          <dt>Command</dt>
          <dd>Enter sends; Shift+Enter adds a line. Tab completes a matching command or name; with no match or after a space, Tab leaves. Shift+Tab always leaves without changing your draft. Up/Down recalls history for a single-line draft.</dd>
          <dt>Recent output</dt>
          <dd>Ctrl+1 through Ctrl+0 reviews the newest ten lines (0 is tenth). Repeat the same shortcut within half a second to copy the line.</dd>
          <dt>Buffers</dt>
          <dd>Alt+Left/Right changes buffer; Alt+Up/Down reviews messages. The selected letter scheme works with Alt too. Alt+PageUp/PageDown moves ten messages; Alt+Home/End moves to the first/last message.</dd>
          <dt>Reviewed message</dt>
          <dd>Alt+Space repeats; Alt+Enter opens its link or offers a link choice; Alt+Shift+Space copies. Alt+Shift+1 through Alt+Shift+0 selects a numbered buffer. Alt+Shift+T toggles timestamps; Alt+Shift+Delete deletes the current buffer.</dd>
          <dt>Status</dt>
          <dd>Alt+H reads your health, Alt+M your power reserves, Alt+V your body reserve and Alt+T your target. When your buffer keys use H or T, those stay buffer keys. The Status section turns the status sounds and warnings on and off.</dd>
          <dt>Sounds</dt>
          <dd>Escape pauses client sounds. Use Resume sounds in the toolbar to continue playback. Alt+Shift+O recenters head tracking.</dd>
          <dt>Server keys</dt>
          <dd>Alt+Shift+H turns keys mode on and off, so a game's or console's keys work on letters and other typing keys. The Keys section lists every key and lets you change it.</dd>
          <dt>Voice commands</dt>
          <dd>Alt+Shift+D listens for one spoken command when voice commands are on in the Speech section; press it again to stop sooner, or Escape to discard.</dd>
        </dl>
        <p>Ctrl+Shift+number opens and focuses a sidebar destination. Numbers stay fixed when optional tabs appear; unavailable destinations do nothing.</p>
        <table>
          <caption>Sidebar destinations</caption>
          <thead><tr><th scope="col">Number</th><th scope="col">Destination</th></tr></thead>
          <tbody>
            {['Room', 'Inventory', 'Users', 'Server', 'MIDI', 'Haptics', 'Files', 'Audio', 'Audio diagnostics'].map((label, index) =>
              <tr key={label}><td>{index + 1}</td><td>{label}</td></tr>)}
          </tbody>
        </table>
        <p>Browser access keys: L Save log, C Copy log, E Clear log, P Preferences, U Sidebar. Selected player: G Page, S Say to, K Look, F Follow. The activation modifier depends on your browser and operating system.</p>
      </details>
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
      <PreferenceNumber id="autolog-storage-cap" label="Storage Cap (MB):"
        min={1} max={2048} value={maxMegabytes}
        onCommit={megabytes => setAutologging({ ...autologging, maxBytes: megabytes * 1024 * 1024 })} />
      <br />
      <button type="button" onClick={() => dialogRef.current?.open()}>Manage Autologs</button>
      <AutoLogDialog ref={dialogRef} />
      <LogFolderPreferences />
    </div>
  );
};

const Preferences: React.FC = () => {
  const tabs: TabProps[] = [
    { id: "preferences-general-tab", label: "General", content: <GeneralTab /> },
    { id: "preferences-speech-tab", label: "Speech", content: <SpeechTab /> },
    { id: "preferences-channels-tab", label: "Channels", content: <ChannelPreferencesTab /> },
    { id: "preferences-sounds-tab", label: "Sounds", content: <SoundsTab /> },
    { id: "preferences-status-tab", label: "Status", content: <StatusTab /> },
    { id: "preferences-editor-tab", label: "Editor", content: <EditorTab /> },
    { id: "preferences-keyboard-tab", label: "Keyboard", content: <KeyboardTab /> },
    { id: "preferences-keys-tab", label: "Keys", content: <KeystrokePreferencesTab /> },
    { id: "preferences-midi-tab", label: "MIDI", content: <MidiTab /> },
    { id: "preferences-haptics-tab", label: "Haptics", content: <HapticsTab /> },
    { id: "preferences-autologging-tab", label: "Logging", content: <AutologgingTab /> },
  ];

  return <Tabs tabs={tabs} ariaLabel="Preferences sections" />;
};

export default Preferences;
