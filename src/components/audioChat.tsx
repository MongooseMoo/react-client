import React, { useEffect, useRef, useState } from 'react';
import { ControlBar, LiveKitRoom, useTracks } from '@livekit/components-react';
import { RemoteAudioTrack, Track } from 'livekit-client';
import { LiveKitSpatialAudioBridge } from '../audio/LiveKitSpatialAudioBridge';
import MudClient from '../client';
import type { SpatialEntity } from '../gmcp/Client/Spatial';
import { useSpatialStore } from '../stores/spatialStore';

const serverUrl = 'wss://mongoose-67t79p35.livekit.cloud';

interface AudioChatProps {
  client: MudClient;
}

const SpatialLiveKitAudio: React.FC<AudioChatProps> = ({ client }) => {
  const tracks = useTracks([Track.Source.Microphone], { onlySubscribed: true });
  const bridgeRef = useRef<LiveKitSpatialAudioBridge>();

  if (!bridgeRef.current) {
    bridgeRef.current = new LiveKitSpatialAudioBridge(
      client.media.cacophony,
      (participantId) => useSpatialStore.getState().spatialEntities[participantId]?.position,
    );
  }

  useEffect(() => {
    const bridge = bridgeRef.current!;
    const activeParticipantIds = new Set<string>();

    tracks.forEach((trackRef) => {
      const track = trackRef.publication.track;
      if (track instanceof RemoteAudioTrack) {
        activeParticipantIds.add(trackRef.participant.identity);
        bridge.attachParticipantTrack(trackRef.participant.identity, track.mediaStreamTrack);
      }
    });

    bridge.detachMissing(activeParticipantIds);
  }, [tracks]);

  useEffect(() => {
    const bridge = bridgeRef.current!;
    const syncAll = () => bridge.syncAll();
    const syncEntity = (entity: SpatialEntity) => bridge.syncParticipant(entity.id);
    const syncEntityId = (entityId: string) => bridge.syncParticipant(entityId);

    client.on('spatialScene', syncAll);
    client.on('spatialEntityEnter', syncEntity);
    client.on('spatialEntityMove', syncEntity);
    client.on('spatialEntityLeave', syncEntityId);

    return () => {
      client.off('spatialScene', syncAll);
      client.off('spatialEntityEnter', syncEntity);
      client.off('spatialEntityMove', syncEntity);
      client.off('spatialEntityLeave', syncEntityId);
      bridge.cleanup();
    };
  }, [client]);

  return null;
};

const AudioChat: React.FC<AudioChatProps> = ({ client }) => {
  const [tokens, setTokens] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const handleLiveKitToken = (token: string) => {
      setTokens((prevTokens) => [...prevTokens, token]);
      setConnected(true);
    };

    const handleLiveKitLeave = (token: string) => {
      setTokens((prevTokens) => {
        const updatedTokens = prevTokens.filter((prevToken) => prevToken !== token);
        if (updatedTokens.length === 0) {
          setConnected(false);
        }
        return updatedTokens;
      });
    };

    client.on('livekitToken', handleLiveKitToken);
    client.on('livekitLeave', handleLiveKitLeave);

    return () => {
      client.off('livekitToken', handleLiveKitToken);
      client.off('livekitLeave', handleLiveKitLeave);
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
          onDisconnected={() => client.emit('livekitLeave', token)}
        >
          <SpatialLiveKitAudio client={client} />
          <ControlBar
            controls={{ microphone: true, screenShare: false, camera: false, chat: false }}
          />
        </LiveKitRoom>
      ))}
      <div className="audio-status" aria-live="polite"></div>
    </div>
  );
};

export default AudioChat;
