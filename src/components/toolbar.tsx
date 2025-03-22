import React, { useCallback } from "react";
import {
  FaCog,
  FaCommentDots,
  FaEraser,
  FaSave,
  FaVolumeMute,
  FaVolumeUp,
  FaChevronRight,
  FaChevronLeft,
} from "react-icons/fa";
import type MudClient from "../client";
import { preferencesStore, PrefActionType } from "../PreferencesStore";
import { useClientEvent } from "../hooks/useClientEvent";

export interface ToolbarProps {
  client: MudClient;
  onClearLog: () => void;
  onSaveLog: () => void;
  onToggleSidebar: () => void;
  onOpenPrefs: () => void;
  showSidebar?: boolean;
}

const Toolbar = ({
  client,
  onClearLog,
  onSaveLog,
  onToggleSidebar,
  onOpenPrefs,
  showSidebar,
}: ToolbarProps) => {
  const connected = useClientEvent(client, 'connectionChange', client.connected);
  const [muted, setMuted] = React.useState(client.cacophony.muted);
  const autosay = useClientEvent(client, 'autosayChanged', client.autosay) || false;
  const [volume, setVolume] = React.useState(preferencesStore.getState().general.volume);

  const handleMuteToggle = useCallback(() => {
    setMuted(!muted);
    client.cacophony.muted = !muted;
  }, [muted, client]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
  }, [client]);

  const handleAutosayChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    client.autosay = e.target.checked;
  }, [client]);

  const handleConnectionToggle = useCallback(() => {
    if (connected) {
      client.close();
    } else {
      client.connect();
    }
  }, [connected, client]);

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
        onClick={handleMuteToggle}
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
          onChange={handleVolumeChange}
          accessKey="v"
        />
      </label>
      <label>
        <FaCommentDots/>
        Autosay
        <input type="checkbox"
          checked={autosay}
          onChange={handleAutosayChange}
        />
      </label>
      <button onClick={handleConnectionToggle}>
        {connected ? 'Disconnect' : 'Connect'}
      </button>
      <button onClick={onToggleSidebar} accessKey="u">
        {showSidebar ? <FaChevronRight /> : <FaChevronLeft />}
        {showSidebar ? "Hide Sidebar" : "Show Sidebar"}
      </button>
    </div>
  );
};

export default Toolbar;
