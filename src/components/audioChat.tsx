import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { announce } from '@react-aria/live-announcer';
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
import type { VoiceRoute } from '../audio/MediaVoices';
import type MudClient from '../client';
import { useLiveKitStore } from '../stores/liveKitStore';
import { useSpatialStore } from '../stores/spatialStore';
import { useFocusRefuge } from './FileTransfer/useFocusRefuge';

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

const SpatialLiveKitAudio: React.FC<AudioChatProps & VoiceRoute> = ({ client, chain, send }) => {
  const tracks = useTracks([Track.Source.Microphone], { onlySubscribed: true });
  const bridgeRef = useRef<LiveKitSpatialAudioBridge>();

  if (!bridgeRef.current) {
    bridgeRef.current = new LiveKitSpatialAudioBridge(
      client.media,
      (participantId) => useSpatialStore.getState().spatialEntities[participantId]?.position,
      // Already in Web Audio axes: Client.Spatial converts and tweens it into the store.
      (participantId) => useSpatialStore.getState().spatialEntities[participantId]?.forward,
    );
  }

  // Declared before the track effect, so a voice is attached straight onto the room's chain.
  useEffect(() => {
    bridgeRef.current?.setRoute({ chain, send });
  }, [chain, send]);

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
    const unsubscribeSpatialStore = useSpatialStore.subscribe(syncAll);
    syncAll();

    return () => {
      unsubscribeSpatialStore();
      bridge.cleanup();
    };
  }, []);

  return null;
};

const CacophonyAudioConference: React.FC<{ onDeviceError: () => void }> = ({ onDeviceError }) => {
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
          onDeviceError={onDeviceError}
          controls={{ microphone: true, screenShare: false, camera: false, chat: false }}
        />
      </div>
    </LayoutContextProvider>
  );
};

const AudioChat: React.FC<AudioChatProps> = ({ client }) => {
  const rooms = useLiveKitStore((state) => state.rooms);
  const removeToken = useLiveKitStore((state) => state.removeToken);
  const [status, setStatus] = useState('');
  const [failedRooms, setFailedRooms] = useState<Set<string>>(() => new Set());
  const failedRoomRefs = useRef(new Set<string>());
  const [attempts, setAttempts] = useState<Record<string, number>>({});
  const panel = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  useFocusRefuge(panel, statusRef);
  const lastReport = useRef('');
  const report = (message: string) => {
    if (lastReport.current === message) return;
    lastReport.current = message;
    setStatus(message);
    // The call remains mounted while its tab is hidden; a local live region would be silent.
    announce(message, 'polite');
  };
  const microphoneFailure = () => report('Microphone unavailable. Check microphone access, then try the microphone button again.');

  return (
    <div ref={panel} data-lk-theme="default">
      {rooms.map(({ token, chain, send }, index) => (
        <section key={token} aria-label={rooms.length > 1 ? `Voice chat ${index + 1}` : 'Voice chat'}>
        <LiveKitRoom
          key={`${token}-${attempts[token] ?? 0}`}
          video={false}
          audio={true}
          token={token}
          serverUrl={serverUrl}
          connect={true}
          onConnected={() => {
            failedRoomRefs.current.delete(token);
            setFailedRooms(previous => { const next = new Set(previous); next.delete(token); return next; });
            report(rooms.length > 1 ? `Voice chat ${index + 1} connected.` : 'Voice chat connected.');
          }}
          onError={() => {
            failedRoomRefs.current.add(token);
            setFailedRooms(previous => new Set(previous).add(token));
            report(rooms.length > 1 ? `Voice chat ${index + 1} could not connect. Try again.` : 'Voice chat could not connect. Try again.');
          }}
          onMediaDeviceFailure={() => {
            if (rooms.length > 1) report(`Voice chat ${index + 1}: Microphone unavailable. Check microphone access, then try the microphone button again.`);
            else microphoneFailure();
          }}
          onDisconnected={() => {
            // Connection failure can emit both events in one turn. Retain its recovery actions.
            if (failedRoomRefs.current.has(token)) return;
            report('Voice chat disconnected.');
            removeToken(token);
          }}
        >
          <SpatialLiveKitAudio client={client} chain={chain} send={send} />
          <CacophonyAudioConference onDeviceError={() => {
            if (rooms.length > 1) report(`Voice chat ${index + 1}: Microphone unavailable. Check microphone access, then try the microphone button again.`);
            else microphoneFailure();
          }} />
        </LiveKitRoom>
        {failedRooms.has(token) && <><button type="button" onClick={() => {
          failedRoomRefs.current.delete(token);
          setFailedRooms(previous => { const next = new Set(previous); next.delete(token); return next; });
          setAttempts(previous => ({ ...previous, [token]: (previous[token] ?? 0) + 1 }));
          report('Retrying voice chat.');
        }}>
          {rooms.length > 1 ? `Retry voice chat ${index + 1}` : 'Retry voice chat'}
        </button>
        <button type="button" onClick={() => {
          failedRoomRefs.current.delete(token);
          setFailedRooms(previous => { const next = new Set(previous); next.delete(token); return next; });
          removeToken(token);
          report('Voice chat disconnected.');
        }}>{rooms.length > 1 ? `Dismiss voice chat ${index + 1}` : 'Dismiss voice chat'}</button></>}
        </section>
      ))}
      <p ref={statusRef} tabIndex={-1} className="audio-status">{status}</p>
    </div>
  );
};

export default AudioChat;
