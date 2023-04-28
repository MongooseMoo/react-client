import React, { useMemo } from "react";
import { FaEraser, FaSave, FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import { Howl, Howler } from "howler";
export interface ToolbarProps {
  onClearLog: () => void;
  onSaveLog: () => void;
  onShowHideUsers: () => void;
}

const Toolbar = ({ onClearLog, onSaveLog, onShowHideUsers }: ToolbarProps) => {
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
      <button onClick={onShowHideUsers} accessKey="u">
        Show/Hide Users
      </button>
    </div >
  );
};

export default Toolbar;
