import React, { useCallback } from "react";
import {
  FaCog,
  FaCommentDots,
  FaEraser,
  FaSave,
  FaCopy, // <-- Import FaCopy
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
  onCopyLog: () => void; // <-- Add onCopyLog prop
  onToggleSidebar: () => void;
  onOpenPrefs: () => void;
  showSidebar?: boolean;
}

const Toolbar = ({
  client,
  onClearLog,
  onSaveLog,
  onCopyLog, // <-- Destructure onCopyLog
  onToggleSidebar,
  onOpenPrefs,
  showSidebar,
}: ToolbarProps) => {
  const connected = useClientEvent(client, 'connectionChange', client.connected);
  const [muted, setMuted] = React.useState(client.cacophony.muted);
  const autosay = useClientEvent(client, 'autosayChanged', client.autosay) || false;
  const [volume, setVolume] = React.useState(preferencesStore.getState().general.volume);

  const handleMuteToggle = useCallback(() => {
    const newMutedState = !muted;
    setMuted(newMutedState);
    client.setGlobalMute(newMutedState);
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
        Save Log (Alt+L)
      </button>
      {/* Note: accessKey="C" typically maps to Alt+C or Alt+Shift+C depending on browser/OS */}
      <button onClick={onCopyLog} accessKey="C">
        <FaCopy />
        Copy Log (Alt+Shift+C)
      </button>
      <button onClick={onClearLog} accessKey="E"> {/* Changed accessKey to avoid conflict */}
        <FaEraser />
        Clear Log (Alt+E)
      </button>
      <button onClick={onOpenPrefs} accessKey="p">
        <FaCog />
        Preferences (Alt+P)
      </button>
      <button
        onClick={handleMuteToggle}
        accessKey="M" // Changed accessKey to avoid conflict if needed, or keep 'm'
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
          accessKey="V" // Changed accessKey to avoid conflict if needed, or keep 'v'
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
      <button
        onClick={onToggleSidebar}
        accessKey="U"
        title={showSidebar ? "Hide Sidebar (Alt+U)" : "Show Sidebar (Alt+U)"} // Add title attribute
        aria-label={showSidebar ? "Hide Sidebar" : "Show Sidebar"} // Add aria-label for clarity
        aria-expanded={showSidebar} // Indicate expanded state
      >
        {showSidebar ? <FaChevronRight /> : <FaChevronLeft />}
        {/* Keep concise text, title/aria-label provide details */}
        {showSidebar ? "Hide Sidebar" : "Show Sidebar"}
      </button>
    </div>
  );
};

export default Toolbar;
