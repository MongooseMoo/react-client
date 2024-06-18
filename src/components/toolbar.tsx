import React from "react";
import {
  FaCog,
  FaEraser,
  FaSave,
  FaVolumeMute,
  FaVolumeUp,
} from "react-icons/fa";
import type MudClient from "../client";

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
  const [muted, setMuted] = React.useState(client.cacophony.muted);

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
        <input type="range" min="0" max="100" onChange={(e) => client.cacophony.setGlobalVolume(Number(e.target.value) / 100)} />
      </label>
      <button onClick={onToggleUsers} accessKey="u">
        Show/Hide Users
      </button>
      <label>
        Volume
        <input
          type="range"
          min="0"
          max="100"
          onChange={(e) => client.cacophony.setGlobalVolume(Number(e.target.value) / 100)}
        />
      </label>
    </div>
  );
};

export default Toolbar;
