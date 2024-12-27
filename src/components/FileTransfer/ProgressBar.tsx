import React from "react";
import "./ProgressBar.css";

interface TransferProgressBarProps {
  progress: number;
}

const ProgressBar: React.FC<TransferProgressBarProps> = ({ progress }) => {
  return (
    <div className="progress-bar">
      <progress value={progress} max="100" />
      <span>{progress.toFixed(2)}%</span>
    </div>
  );
};

export default ProgressBar;
