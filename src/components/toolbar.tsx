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
import "./toolbar.css";

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
  const [volume, setVolume] = React.useState(preferencesStore.getState().sound.volume);

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
      type: PrefActionType.SetSound,
      data: {
        ...preferencesStore.getState().sound,
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
      {/* Log buttons group */}
      <div className="toolbar-group">
        <button onClick={onSaveLog} accessKey="l">
          <FaSave />
          Save Log
        </button>
        <button onClick={onCopyLog} accessKey="C">
          <FaCopy />
          Copy Log
        </button>
        <button onClick={onClearLog} accessKey="E">
          <FaEraser />
          Clear Log
        </button>
      </div>

      <div className="toolbar-separator" />

      {/* Preferences group */}
      <div className="toolbar-group">
        <button onClick={onOpenPrefs} accessKey="p">
          <FaCog />
          Preferences
        </button>
      </div>

      <div className="toolbar-separator" />

      {/* Mute + Volume group */}
      <div className="toolbar-group">
        <button
          onClick={handleMuteToggle}
          accessKey="M"
        >
          {muted ? <FaVolumeUp /> : <FaVolumeMute />}
          {muted ? "Unmute" : "Mute"}
        </button>
        <label className="toolbar-volume">
          Volume
          <input
            type="range"
            min="0"
            max="100"
            value={volume * 100}
            onChange={handleVolumeChange}
            accessKey="V"
          />
        </label>
      </div>

      <div className="toolbar-separator" />

      {/* Autosay group */}
      <div className="toolbar-group">
        <label className="toolbar-toggle">
          <FaCommentDots />
          Autosay
          <input
            type="checkbox"
            checked={autosay}
            onChange={handleAutosayChange}
          />
        </label>
      </div>

      <div className="toolbar-separator" />

      {/* Connect/Disconnect group */}
      <div className="toolbar-group">
        <button
          className={connected ? 'btn-disconnect' : 'btn-connect'}
          onClick={handleConnectionToggle}
        >
          {connected ? 'Disconnect' : 'Connect'}
        </button>
      </div>

      <div className="toolbar-spacer" />

      {/* Sidebar toggle */}
      <button
        onClick={onToggleSidebar}
        accessKey="U"
        title={showSidebar ? "Hide Sidebar (Alt+U)" : "Show Sidebar (Alt+U)"}
        aria-label={showSidebar ? "Hide Sidebar" : "Show Sidebar"}
        aria-expanded={showSidebar}
      >
        {showSidebar ? <FaChevronRight /> : <FaChevronLeft />}
        {showSidebar ? "Hide" : "Show"}
      </button>
    </div>
  );
};

export default Toolbar;
