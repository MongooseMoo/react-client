import { Howler } from "howler";
import React from "react";
import {
  FaCog,
  FaEraser,
  FaSave,
  FaVolumeMute,
  FaVolumeUp,
} from "react-icons/fa";
export interface ToolbarProps {
  onClearLog: () => void;
  onSaveLog: () => void;
  onToggleUsers: () => void;
  onOpenPrefs: () => void;
}

const Toolbar = ({
  onClearLog,
  onSaveLog,
  onToggleUsers,
  onOpenPrefs,
}: ToolbarProps) => {
  //@ts-ignore
  const [muted, setMuted] = React.useState(Howler._muted);

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
          if (muted) {
            Howler.mute(false);
            setMuted(false);
          } else {
            Howler.mute(true);
            setMuted(true);
          }
        }}
        accessKey="m"
      >
        {muted ? <FaVolumeUp /> : <FaVolumeMute />}
        {muted ? "Unmute" : "Mute"}
      </button>
      <label>
        Volume
        <input type="range" min="0" max="100" onChange={(e) => Howler.volume(Number(e.target.value) / 100)} />
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
          onChange={(e) => Howler.volume(Number(e.target.value) / 100)}
        />
      </label>
    </div>
  );
};

export default Toolbar;
