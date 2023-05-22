import React, { useEffect, useState } from "react";
import { FaEraser, FaSave, FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import { Howl, Howler } from "howler";

export interface ToolbarProps {
  onClearLog: () => void;
  onSaveLog: () => void;
  onToggleUsers: () => void;
}

const Toolbar = ({ onClearLog, onSaveLog, onToggleUsers }: ToolbarProps) => {
  const [muted, setMuted] = useState(Howler.mute());

  const toggleMute = () => {
    const currentMuteStatus = Howler.mute();
    Howler.mute(!currentMuteStatus);
  }

  useEffect(() => {
    setMuted(Howler.mute());
  }, []);

  useEffect(() => {
    setMuted(Howler.mute());
  }, [muted]);

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
      <button
        onClick={toggleMute}
        accessKey="m"
      >
        {muted ? <FaVolumeUp /> : <FaVolumeMute />}
        {muted ? "Unmute" : "Mute"}
      </button>
      <button onClick={onToggleUsers} accessKey="u">
        Show/Hide Users
      </button>
      <label>
        Volume
        <input type="range" min="0" max="100" onChange={(e) => Howler.volume(Number(e.target.value) / 100)} />
      </label>
    </div >
  );
};

export default Toolbar;
