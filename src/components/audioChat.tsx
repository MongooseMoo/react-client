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
import { useLiveKitStore } from '../stores/liveKitStore';
import { useSpatialStore } from '../stores/spatialStore';

const serverUrl = 'wss://mongoose-67t79p35.livekit.cloud';
/** Wake-hold id keeping MediaService's idle suspend off while voice chat is live. */
const VOICE_WAKE_HOLD = 'livekit-voice';

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

    // Voice runs through the shared cacophony context, and MediaService cannot see LiveKit's
    // streams in its sound registry, so hold the context awake for the room's lifetime.
    client.media.acquireWakeHold(VOICE_WAKE_HOLD);

    const syncAll = () => bridge.syncAll();
    const unsubscribeSpatialStore = useSpatialStore.subscribe(syncAll);
    syncAll();

    return () => {
      unsubscribeSpatialStore();
      bridge.cleanup();
      client.media.releaseWakeHold(VOICE_WAKE_HOLD);
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
