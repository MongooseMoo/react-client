import React from "react";

export interface ToolbarProps {
  onClearLog: () => void;
  onSaveLog: () => void;
}

const Toolbar = ({ onClearLog, onSaveLog }: ToolbarProps) => {
  return (
    <div className="toolbar">
      <button onClick={onSaveLog} accessKey="l">
        Save Log
      </button>
      <button onClick={onClearLog} accessKey="c">
        Clear Log
      </button>
    </div>
  );
};

export default Toolbar;
