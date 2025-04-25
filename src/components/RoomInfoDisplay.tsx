import React, { useState, useEffect, useCallback } from "react";
import MudClient from "../client";
import { GMCPMessageRoomInfo } from "../gmcp/Room";
import "./RoomInfoDisplay.css"; // We'll create this CSS file next

interface RoomInfoDisplayProps {
  client: MudClient;
}

const RoomInfoDisplay: React.FC<RoomInfoDisplayProps> = ({ client }) => {
  // Initialize state directly from the client's stored info
  const [roomInfo, setRoomInfo] = useState<GMCPMessageRoomInfo | null>(client.currentRoomInfo);

  const handleRoomInfo = useCallback((data: GMCPMessageRoomInfo) => {
    // Update state when new info arrives via event
    setRoomInfo(data);
    // No longer need to emit 'roomDataReceived' here, Sidebar will check client directly
  }, []); // No dependencies needed if not using client inside directly

  useEffect(() => {
    client.on("roomInfo", handleRoomInfo);

    return () => {
      client.off("roomInfo", handleRoomInfo);
    };
  }, [client, handleRoomInfo]);

  const handleExitClick = (direction: string) => {
    console.log(`Clicked exit: ${direction}`);
    client.sendCommand(direction); // Send the direction as a command
  };

  const headingId = "room-info-heading";

  if (!roomInfo) {
    return (
      <div
        className="room-info-display"
        role="region"
        aria-labelledby={headingId}
      >
        <h4 id={headingId}>Room Info</h4>
        <p>Waiting for room data...</p>
      </div>
    );
  }

  const exits = roomInfo.exits ? Object.entries(roomInfo.exits) : [];
  // Sort exits alphabetically for consistent order
  exits.sort(([dirA], [dirB]) => dirA.localeCompare(dirB));

  return (
    <div
      className="room-info-display"
      role="region"
      aria-labelledby={headingId}
    >
      <h4 id={headingId}>{roomInfo.name || "Current Room"}</h4>
      {roomInfo.area && <p className="room-area">Area: {roomInfo.area}</p>}
      {/* Add other details like environment if needed */}
      {/* {roomInfo.environment && <p>Environment: {roomInfo.environment}</p>} */}

      {exits.length > 0 && (
        <div className="room-exits">
          <h5>Exits</h5>
          <ul aria-label="Room Exits">
            {exits.map(([direction, roomId]) => (
              <li key={direction}>
                <button
                  onClick={() => handleExitClick(direction)}
                  title={`Go ${direction} (to room ${roomId})`}
                  aria-label={`Go ${direction}`}
                >
                  {direction.toUpperCase()}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RoomInfoDisplay;
