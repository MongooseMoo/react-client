import React, { useState, useEffect, useCallback } from "react";
import MudClient from "../client";
// import { TimeInfo } from "../gmcp/IRE/Time"; // Removed IRE.Time import
import './statusbar.css'; // Ensure CSS is imported

export interface StatusbarProps {
  client: MudClient;
}

// Define an interface for Vitals data if possible, using 'any' for now
interface VitalsData {
  hp?: string;
  maxhp?: string;
  mp?: string;
  maxmp?: string;
  ep?: string;
  maxep?: string;
  wp?: string;
  maxwp?: string;
  nl?: string; // Next level percentage?
  [key: string]: any; // Allow other vitals
}

const Statusbar: React.FC<StatusbarProps> = ({ client }) => {
  const [statusText, setStatusText] = useState<string>("Not connected");
  const [vitals, setVitals] = useState<VitalsData | null>(null);
  // const [timeInfo, setTimeInfo] = useState<TimeInfo | null>(null); // Removed timeInfo state

  const handleStatusText = useCallback((text: string) => setStatusText(text), []);
  const handleConnect = useCallback(() => setStatusText("Connected"), []);
  const handleDisconnect = useCallback(() => {
    setStatusText("Disconnected");
    setVitals(null); // Clear vitals on disconnect
    // setTimeInfo(null); // Removed timeInfo clear
  }, []);
  const handleVitals = useCallback((data: VitalsData) => setVitals(data), []);
  // const handleTime = useCallback((data: TimeInfo | Partial<TimeInfo>) => { // Removed handleTime
  //   setTimeInfo(prev => ({ ...(prev ?? {} as TimeInfo), ...data }));
  // }, []);

  useEffect(() => {
    client.on("statustext", handleStatusText);
    client.on("connect", handleConnect);
    client.on("disconnect", handleDisconnect);
    client.on("vitals", handleVitals); // Listen for vitals updates
    // client.on("timeList", handleTime); // Removed time listeners
    // client.on("timeUpdate", handleTime); // Removed time listeners

    // Removed initial time request

    return () => {
      client.off("statustext", handleStatusText);
      client.off("connect", handleConnect);
      client.off("disconnect", handleDisconnect);
      client.off("vitals", handleVitals);
      // client.off("timeList", handleTime); // Removed time listeners
      // client.off("timeUpdate", handleTime); // Removed time listeners
    };
  }, [client, handleStatusText, handleConnect, handleDisconnect, handleVitals]); // Removed handleTime dependency

  // Helper to format vitals
  const formatVital = (current?: string, max?: string): string | null => {
    if (current === undefined || max === undefined) return null;
    return `${current}/${max}`;
  };

  const hp = formatVital(vitals?.hp, vitals?.maxhp);
  const mp = formatVital(vitals?.mp, vitals?.maxmp);
  // Add other vitals as needed (e.g., ep, wp)

  // Removed time formatting

  return (
    <div className="statusbar">
      <span className="status-connection">{statusText}</span>
      {vitals && (
        <span className="status-vitals">
          {hp && ` HP: ${hp}`}
          {mp && ` MP: ${mp}`}
          {/* Add other vitals here */}
        </span>
      )}
      {/* Removed time display span */}
    </div>
  );
};

export default Statusbar;
