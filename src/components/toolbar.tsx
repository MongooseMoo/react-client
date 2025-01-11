import React from "react";
import {
  FaCog,
  FaCommentDots,
  FaEraser,
  FaSave,
  FaVolumeMute,
  FaVolumeUp,
} from "react-icons/fa";
import type MudClient from "../client";
import { preferencesStore, PrefActionType } from "../PreferencesStore";
import { useClientEvent } from "../hooks/useClientEvent";

export interface ToolbarProps {
  client: MudClient;
  onClearLog: () => void;
  onSaveLog: () => void;
  onToggleUsers: () => void;
  onOpenPrefs: () => void;
}

const Toolbar = ({
  client,
  onClearLog,
  onSaveLog,
  onToggleUsers,
  onOpenPrefs,
}: ToolbarProps) => {
  const connected = useClientEvent(client, 'connectionChange', client.connected);
  const [muted, setMuted] = React.useState(client.cacophony.muted);
  const autosay = useClientEvent(client, 'autosayChanged', client.autosay);
  const [volume, setVolume] = React.useState(preferencesStore.getState().general.volume);

  return (
    <div className="toolbar">
      <button onClick={onSaveLog} accessKey="l">
        <FaSave />
        Save Log
      </button>
      <button onClick={onClearLog} accessKey="c">
        <FaEraser />
        Clear Log
      </button>
      <button onClick={onOpenPrefs} accessKey="p">
        <FaCog />
        Preferences
      </button>
      <button
        onClick={() => {
          setMuted(!muted);
          client.cacophony.muted = !muted;
        }}
        accessKey="m"
      >
        {muted ? <FaVolumeUp /> : <FaVolumeMute />}
        {muted ? "Unmute" : "Mute"}
      </button>
      <label>
        Volume
        <input
          type="range"
          min="0"
          max="100"
          value={volume * 100}
          onChange={(e) => {
            const newVolume = Number(e.target.value) / 100;
            setVolume(newVolume);
            client.cacophony.setGlobalVolume(newVolume);
            preferencesStore.dispatch({
              type: PrefActionType.SetGeneral,
              data: {
                ...preferencesStore.getState().general,
                volume: newVolume
              }
            });
          }}
        />
      </label>
      <label>
        <FaCommentDots/>
        Autosay
        <input type="checkbox"
          checked={autosay}
          onChange={(e) => {
            client.autosay = e.target.checked;
          }}
        />
      </label>
      <button onClick={() => connected ? client.close() : client.connect()}>
        {connected ? 'Disconnect' : 'Connect'}
      </button>
      <button onClick={onToggleUsers} accessKey="u">
        Show/Hide Users
      </button>
    </div>
  );
};

export default Toolbar;
