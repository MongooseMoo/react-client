import type React from "react";
import { useRef, useState } from "react";
import { announce } from "@react-aria/live-announcer";
import { chordFromEvent, formatChord, isTypingChord } from "../keystrokeChords";
import {
  bindingLabel,
  keyTakenBy,
  type KeystrokeLayer,
  type ResolvedBinding,
  resolveLayer,
  useKeystrokesStore,
} from "../stores/keystrokesStore";
import { usePreferences } from "../stores/preferencesStore";
import "./KeystrokePreferences.css";

function say(message: string): void {
  announce(message, "assertive", 2000);
}

function keyText({ binding, chord }: ResolvedBinding): string {
  return chord ? formatChord(chord) : [...binding.modifiers, binding.key].join("+");
}

function statusText({ chord, unavailable, changed }: ResolvedBinding): string {
  const status = unavailable
    ? `Unavailable: ${unavailable}`
    : chord && isTypingChord(chord)
      ? "Keys mode only"
      : "Ready";
  return changed ? `${status}. You changed this key.` : status;
}

/** Focus it and press Enter, then the new key; Escape cancels. */
function KeyButton({ layer, resolved }: { layer: KeystrokeLayer; resolved: ResolvedBinding }) {
  const [listening, setListening] = useState(false);
  const keyTaken = useRef(false);
  const label = bindingLabel(resolved.binding);
  const prompt = `Press the new key for ${label}, or Escape to cancel`;

  const start = () => {
    setListening(true);
    say(prompt);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!listening) return;
    const native = event.nativeEvent;
    // Tab still moves focus, which ends listening.
    if (native.key === "Tab" && !native.ctrlKey && !native.altKey && !native.metaKey) return;
    if (native.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      setListening(false);
      say("Change cancelled");
      return;
    }
    const chord = chordFromEvent(native);
    if (!chord) return;
    event.preventDefault();
    event.stopPropagation();

    const { layers } = useKeystrokesStore.getState();
    const { keystrokes, setKeystrokeOverride } = usePreferences.getState();
    const taken = keyTakenBy(layers, keystrokes, chord, layer.id, resolved.binding.command);
    if (taken) {
      say(`${formatChord(chord)} is taken: ${taken}. Press another key, or Escape to cancel.`);
      return;
    }
    setKeystrokeOverride(layer.id, resolved.binding.command, chord);
    setListening(false);
    keyTaken.current = true;
    say(`${label}: ${formatChord(chord)}`);
  };

  return (
    <button
      type="button"
      aria-label={listening ? prompt : `Change key for ${label}, now ${keyText(resolved)}`}
      onClick={() => {
        if (!listening) start();
      }}
      onKeyDown={handleKeyDown}
      onKeyUp={(event) => {
        // Space activates a button on key up; the space just taken as a new key must not.
        if (keyTaken.current) event.preventDefault();
        keyTaken.current = false;
      }}
      onBlur={() => setListening(false)}
    >
      {listening ? "Press the new key" : keyText(resolved)}
    </button>
  );
}

const KeystrokePreferencesTab: React.FC = () => {
  const layers = useKeystrokesStore((state) => state.layers);
  const keysMode = useKeystrokesStore((state) => state.keysMode);
  const overrides = usePreferences((state) => state.keystrokes);

  return (
    <div>
      <p id="keystroke-preferences-help">
        Keys mode is {keysMode ? "on" : "off"}. Alt+Shift+H in the command input or output turns it
        on and off. To change a key, choose it, press Enter, then press the new key; Escape cancels.
      </p>
      {layers.length === 0 && <p>No keys yet. A game or console you use adds its keys here.</p>}
      {layers.map((layer) => (
        <table
          key={layer.id}
          className="keystroke-preferences"
          aria-describedby="keystroke-preferences-help"
        >
          <caption>{layer.modal ? `${layer.label} (keys mode)` : layer.label}</caption>
          <thead>
            <tr>
              <th scope="col">Action</th>
              <th scope="col">Key</th>
              <th scope="col">Command</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {resolveLayer(layer, overrides).map((resolved) => (
              <tr key={[...resolved.binding.modifiers, resolved.binding.key, resolved.binding.command].join(" ")}>
                <th scope="row">{bindingLabel(resolved.binding)}</th>
                <td>
                  <KeyButton layer={layer} resolved={resolved} />
                </td>
                <td>{resolved.binding.command}</td>
                <td>{statusText(resolved)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ))}
    </div>
  );
};

export default KeystrokePreferencesTab;
