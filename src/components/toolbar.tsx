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
        <button onClick={onSaveLog} accessKey="l" aria-label="Save Log" title="Save Log">
          <FaSave />
          <span className="toolbar-label">Save Log</span>
        </button>
        <button onClick={onCopyLog} accessKey="C" aria-label="Copy Log" title="Copy Log">
          <FaCopy />
          <span className="toolbar-label">Copy Log</span>
        </button>
        <button onClick={onClearLog} accessKey="E" aria-label="Clear Log" title="Clear Log">
          <FaEraser />
          <span className="toolbar-label">Clear Log</span>
        </button>
      </div>

      <div className="toolbar-separator" />

      {/* Preferences group */}
      <div className="toolbar-group">
        <button onClick={onOpenPrefs} accessKey="p" aria-label="Preferences" title="Preferences">
          <FaCog />
          <span className="toolbar-label">Preferences</span>
        </button>
      </div>

      <div className="toolbar-separator" />

      {/* Mute + Volume group */}
      <div className="toolbar-group">
        <button
          onClick={handleMuteToggle}
          accessKey="M"
          aria-label={muted ? "Unmute" : "Mute"}
          title={muted ? "Unmute" : "Mute"}
        >
          {muted ? <FaVolumeUp /> : <FaVolumeMute />}
          <span className="toolbar-label">{muted ? "Unmute" : "Mute"}</span>
        </button>
        <label className="toolbar-volume">
          <span className="toolbar-label">Volume</span>
          <input
            type="range"
            min="0"
            max="100"
            value={volume * 100}
            onChange={handleVolumeChange}
            accessKey="V"
            aria-label="Volume"
          />
        </label>
      </div>

      <div className="toolbar-separator" />

      {/* Autosay group */}
      <div className="toolbar-group">
        <label className="toolbar-toggle">
          <FaCommentDots />
          <span className="toolbar-label">Autosay</span>
          <input
            type="checkbox"
            checked={autosay}
            onChange={handleAutosayChange}
            aria-label="Toggle autosay"
          />
        </label>
      </div>

      <div className="toolbar-separator" />

      {/* Connect/Disconnect group */}
      <div className="toolbar-group toolbar-connection">
        <button
          className={connected ? 'btn-disconnect' : 'btn-connect'}
          onClick={handleConnectionToggle}
          aria-label={connected ? 'Disconnect' : 'Connect'}
          title={connected ? 'Disconnect' : 'Connect'}
        >
          <span className="toolbar-label">{connected ? 'Disconnect' : 'Connect'}</span>
        </button>
      </div>

      <div className="toolbar-spacer" />

      {/* Sidebar toggle */}
      <button
        className="toolbar-sidebar-toggle"
        onClick={onToggleSidebar}
        accessKey="U"
        title={showSidebar ? "Hide Sidebar (Alt+U)" : "Show Sidebar (Alt+U)"}
        aria-label={showSidebar ? "Hide Sidebar" : "Show Sidebar"}
        aria-expanded={showSidebar}
      >
        {showSidebar ? <FaChevronRight /> : <FaChevronLeft />}
        <span className="toolbar-label">{showSidebar ? "Hide" : "Show"}</span>
      </button>
    </div>
  );
};

export default Toolbar;
