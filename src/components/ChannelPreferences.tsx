import type React from "react";
import { useMemo } from "react";
import {
  CHANNEL_READ_MODES,
  CHANNEL_READ_MODE_LABELS,
  DEFAULT_CHANNEL_PREFERENCES,
} from "../channelReading";
import { useVoices } from "../hooks/useVoices";
import { useChannelHistoryStore } from "../stores/channelHistoryStore";
import { useChannelsStore } from "../stores/channelsStore";
import {
  type ChannelPreferences as ChannelSettings,
  type ChannelReadMode,
  usePreferences,
} from "../stores/preferencesStore";
import "./ChannelPreferences.css";

interface ChannelRow {
  name: string;
  caption: string;
  /** Shown after the caption; empty when there is nothing to add. */
  note: string;
}

/**
 * Every channel worth a row: the ones the server listed (listened-to first),
 * then any that have sent text this session or have saved settings but are not
 * in the server's list (games, fediverse feeds and the like).
 */
export function channelRows(
  listed: { name: string; caption: string; kind: string; listening: boolean }[],
  seen: string[],
  saved: string[],
): ChannelRow[] {
  const rows: ChannelRow[] = [];
  const known = new Set<string>();
  const add = (row: ChannelRow) => {
    if (known.has(row.name)) return;
    known.add(row.name);
    rows.push(row);
  };

  for (const channel of listed) {
    if (channel.listening) add({ name: channel.name, caption: channel.caption, note: "" });
  }
  for (const channel of listed) {
    add({ name: channel.name, caption: channel.caption, note: "not listening" });
  }
  for (const name of seen) add({ name, caption: name, note: "" });
  for (const name of saved) add({ name, caption: name, note: "" });
  return rows;
}

const ChannelPreferencesTab: React.FC = () => {
  const listed = useChannelsStore((state) => state.channels);
  const entries = useChannelHistoryStore((state) => state.entries);
  const settings = usePreferences((state) => state.channels);
  const setChannelPreferences = usePreferences((state) => state.setChannelPreferences);
  const voices = useVoices();

  const seen = useMemo(
    () => Array.from(new Set(entries.map((entry) => entry.channel))),
    [entries],
  );
  const rows = channelRows(listed, seen, Object.keys(settings));

  if (rows.length === 0) {
    return <p>No channels yet. They appear here once you are connected.</p>;
  }

  return (
    <div>
      <p id="channel-preferences-help">
        Choose how each channel is read aloud. A channel on "Same as Auto Read"
        follows the Speech tab.
      </p>
      <table className="channel-preferences" aria-describedby="channel-preferences-help">
        <thead>
          <tr>
            <th scope="col">Channel</th>
            <th scope="col">Read aloud</th>
            <th scope="col">Voice</th>
            <th scope="col">Notify</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const current: ChannelSettings = settings[row.name] ?? DEFAULT_CHANNEL_PREFERENCES;
            const update = (change: Partial<ChannelSettings>) =>
              setChannelPreferences(row.name, { ...current, ...change });
            const voiceInstalled =
              current.voice === "" || voices.some((voice) => voice.name === current.voice);

            return (
              <tr key={row.name}>
                <th scope="row">
                  {row.caption}
                  {row.note && <span className="channel-note"> ({row.note})</span>}
                </th>
                <td>
                  <select
                    aria-label={`${row.caption}: read aloud`}
                    value={current.autoreadMode}
                    onChange={(e) => update({ autoreadMode: e.target.value as ChannelReadMode })}
                  >
                    {CHANNEL_READ_MODES.map((mode) => (
                      <option key={mode} value={mode}>
                        {CHANNEL_READ_MODE_LABELS[mode]}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    aria-label={`${row.caption}: voice`}
                    value={current.voice}
                    onChange={(e) => update({ voice: e.target.value })}
                  >
                    <option value="">Same as Speech</option>
                    {!voiceInstalled && (
                      <option value={current.voice}>{current.voice} (not on this device)</option>
                    )}
                    {voices.map((voice) => (
                      <option key={voice.voiceURI} value={voice.name}>
                        {voice.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="checkbox"
                    aria-label={`${row.caption}: notify when the window is not focused`}
                    checked={current.notify}
                    onChange={(e) => update({ notify: e.target.checked })}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ChannelPreferencesTab;
