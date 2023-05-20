import React, { useState, useEffect } from "react";
import { AudioConference, LiveKitRoom } from "@livekit/components-react";
import MudClient from "../client";

const serverUrl = "wss://mongoose-67t79p35.livekit.cloud";

interface AudioChatProps {
  client: MudClient;
}

const AudioChat: React.FC<AudioChatProps> = ({ client }) => {
  const [token, setToken] = useState("");
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const handleLiveKitToken = (token: string) => {
      setConnected(false);
      setToken(token);
      setTimeout(() => {
        setConnected(true);
      }, 1000);
    };

    client.on("livekitToken", handleLiveKitToken);

    return () => {
      client.off("livekitToken", handleLiveKitToken);
    };
  }, [client]);

  const handleDisconnected = () => {
    setToken("");
  };

  if (!token) {
    return null; // Returning null here instead of empty string
  }

  return (
    <div data-lk-theme="default">
      <LiveKitRoom
        video={false}
        audio={true}
        token={token}
        serverUrl={serverUrl}
        connect={connected}
        onDisconnected={handleDisconnected}
      >
        <AudioConference />
      </LiveKitRoom>
      <div className="audio-status" aria-live="polite"></div>
    </div>
  );
};

export default AudioChat;
