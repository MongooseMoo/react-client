import type React from 'react';
import { useEffect, useRef } from 'react';
import {
  BarVisualizer,
  ConnectionQualityIndicator,
  ControlBar,
  LayoutContextProvider,
  LiveKitRoom,
  ParticipantAudioTile,
  ParticipantName,
  TrackLoop,
  useTracks,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { LiveKitSpatialAudioBridge } from '../audio/LiveKitSpatialAudioBridge';
import type MudClient from '../client';
import type { SpatialEntity } from '../gmcp/Client/Spatial';
import { useLiveKitStore } from '../stores/liveKitStore';
import { useSpatialStore } from '../stores/spatialStore';

const serverUrl = 'wss://mongoose-67t79p35.livekit.cloud';

interface AudioChatProps {
  client: MudClient;
}

function liveKitRemoteMediaStreamTrack(track: unknown): MediaStreamTrack | null {
  if (
    track &&
    typeof track === 'object' &&
    'mediaStreamTrack' in track &&
    typeof (track as { mediaStreamTrack?: unknown }).mediaStreamTrack === 'object' &&
    (track as { mediaStreamTrack?: unknown }).mediaStreamTrack !== null
  ) {
    return (track as { mediaStreamTrack: MediaStreamTrack }).mediaStreamTrack;
  }
  return null;
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
    const bridge = bridgeRef.current;
    if (!bridge) return;

    const activeParticipantIds = new Set<string>();

    tracks.forEach((trackRef) => {
      const track = trackRef.publication.track;
      const mediaStreamTrack = liveKitRemoteMediaStreamTrack(track);
      if (mediaStreamTrack && !trackRef.participant.isLocal) {
        activeParticipantIds.add(trackRef.participant.identity);
        bridge.attachParticipantTrack(trackRef.participant.identity, mediaStreamTrack);
      }
    });

    bridge.detachMissing(activeParticipantIds);
  }, [tracks]);

  useEffect(() => {
    const bridge = bridgeRef.current;
    if (!bridge) return;

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

const CacophonyAudioConference: React.FC = () => {
  const audioTracks = useTracks([Track.Source.Microphone]);

  return (
    <LayoutContextProvider>
      <div className="lk-audio-conference">
        <div className="lk-audio-conference-stage">
          <TrackLoop tracks={audioTracks}>
            <ParticipantAudioTile>
              <BarVisualizer barCount={7} options={{ minHeight: 8 }} />
              <div className="lk-participant-metadata">
                <div className="lk-participant-metadata-item">
                  <ParticipantName />
                </div>
                <ConnectionQualityIndicator className="lk-participant-metadata-item" />
              </div>
            </ParticipantAudioTile>
          </TrackLoop>
        </div>
        <ControlBar
          controls={{ microphone: true, screenShare: false, camera: false, chat: false }}
        />
      </div>
    </LayoutContextProvider>
  );
};

const AudioChat: React.FC<AudioChatProps> = ({ client }) => {
  const tokens = useLiveKitStore((state) => state.tokens);
  const removeToken = useLiveKitStore((state) => state.removeToken);

  if (!tokens.length) {
    return null;
  }

  return (
    <div data-lk-theme="default">
      {tokens.map((token) => (
        <LiveKitRoom
          key={token}
          video={false}
          audio={true}
          token={token}
          serverUrl={serverUrl}
          connect={true}
          onDisconnected={() => {
            removeToken(token);
          }}
        >
          <SpatialLiveKitAudio client={client} />
          <CacophonyAudioConference />
        </LiveKitRoom>
      ))}
      <div className="audio-status" aria-live="polite"></div>
    </div>
  );
};

export default AudioChat;
