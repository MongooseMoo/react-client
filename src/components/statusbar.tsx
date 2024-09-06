import React, { useState, useEffect } from "react";
import "./statusbar.css";
import MudClient from "../client";

export interface StatusbarProps {
  client: MudClient;
}

interface UpdateInfo {
  version: string;
  description?: string;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
}

const Statusbar: React.FC<StatusbarProps> = ({ client }) => {
  const [statusText, setStatusText] = useState<string>("Not connected");
  const [updateAvailable, setUpdateAvailable] = useState<UpdateInfo | null>(null);

  useEffect(() => {
    const handleStatusText = (text: string) => setStatusText(text);
    const handleConnect = () => setStatusText("Connected");
    const handleDisconnect = () => setStatusText("Disconnected");
    const handleUpdateAvailable = (info: UpdateInfo) => setUpdateAvailable(info);

    client.on("statustext", handleStatusText);
    client.on("connect", handleConnect);
    client.on("disconnect", handleDisconnect);
    client.on("updateAvailable", handleUpdateAvailable);

    return () => {
      client.off("statustext", handleStatusText);
      client.off("connect", handleConnect);
      client.off("disconnect", handleDisconnect);
      client.off("updateAvailable", handleUpdateAvailable);
    };
  }, [client]);

  const handleUpdateClick = () => {
    if (updateAvailable) {
      client.installUpdate();
    }
  };

  return (
    <div className="statusbar">
      <span>{statusText}</span>
      {updateAvailable && (
        <button 
          onClick={handleUpdateClick}
          title={`Update to version ${updateAvailable.version}${updateAvailable.description ? `: ${updateAvailable.description}` : ''}`}
          className={`update-button ${updateAvailable.urgency || 'low'}`}
        >
          Update Available
        </button>
      )}
    </div>
  );
};

export default Statusbar;
