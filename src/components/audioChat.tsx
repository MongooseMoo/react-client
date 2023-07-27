import React, { useState, useEffect } from "react";
import { AudioConference, LiveKitRoom } from "@livekit/components-react";
import MudClient from "../client";

const serverUrl = "wss://mongoose-67t79p35.livekit.cloud";

interface AudioChatProps {
  client: MudClient;
}

const AudioChat: React.FC<AudioChatProps> = ({ client }) => {
  const [tokens, setTokens] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const handleLiveKitToken = (token: string) => {

      setTokens(prevTokens => [...prevTokens, token]);
      setConnected(true);
    };

    const handleLiveKitLeave = (token: string) => {
      setTokens(prevTokens => {
        const updatedTokens = prevTokens.filter(prevToken => prevToken !== token);
        if (updatedTokens.length === 0) {
          setConnected(false);
        }
        return updatedTokens;
      });
    };

    client.on("livekitToken", handleLiveKitToken);
    client.on("livekitLeave", handleLiveKitLeave);

    return () => {
      client.off("livekitToken", handleLiveKitToken);
      client.off("livekitLeave", handleLiveKitLeave);
    };
  }, [client]);

  if (!tokens.length) {
    return null;
  }

  return (
    <div data-lk-theme="default">
      {tokens.map((token, index) => (
        <LiveKitRoom
          key={index}
          video={false}
          audio={true}
          token={token}
          serverUrl={serverUrl}
          connect={true}
          onDisconnected={() => client.emit("livekitLeave", token)}
        >
          <AudioConference />
        </LiveKitRoom>
      ))}
      <div className="audio-status" aria-live="polite"></div>
    </div>
  );
};

export default AudioChat;
