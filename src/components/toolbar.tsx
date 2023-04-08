import React from "react";

export interface ToolbarProps {
  onSaveLog: () => void;
}

const Toolbar = ({ onSaveLog }: ToolbarProps) => {
  return (
    <div className="toolbar">
      <button onClick={onSaveLog}>Save Log</button>
    </div>
  );
};

export default Toolbar;
