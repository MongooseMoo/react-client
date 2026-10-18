import { useId } from 'react';
import { getSoundfont, soundfonts } from '../midi/soundfonts';
import { usePreferences } from '../stores/preferencesStore';
import './SoundfontPicker.css';

export default function SoundfontPicker() {
  const id = useId();
  const midi = usePreferences((state) => state.midi);
  const selected = getSoundfont(midi.midiJsSoundfont);
  return (
    <div className="soundfont-picker">
      <label htmlFor={id}>Soundfont collection</label>
      <select
        id={id}
        value={selected.id}
        aria-describedby={`${id}-help`}
        onChange={(event) => {
          usePreferences.getState().setMidi({
            ...usePreferences.getState().midi,
            midiJsSoundfont: getSoundfont(event.target.value).id,
          });
        }}
      >
        {soundfonts.map((font) => (
          <option key={font.id} value={font.id}>
            {font.name}
          </option>
        ))}
      </select>
      <p id={`${id}-help`}>
        {selected.description} Choose Soundfont Synthesizer as your output. Reconnect after changing
        collections.
      </p>
      <p className="soundfont-picker-note">
        Downloads on demand. Built-in synth covers drums and loading instruments.
      </p>
      <a
        href="https://github.com/gleitz/midi-js-soundfonts#soundfonts-available"
        target="_blank"
        rel="noreferrer"
      >
        Soundfont credits & licenses<span className="sr-only"> (opens a new tab)</span>
      </a>
    </div>
  );
}
