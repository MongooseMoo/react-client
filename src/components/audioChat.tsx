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

interface RoomCallbacks {
  label: string;
  onConnected: () => void;
  onError: () => void;
  onMicrophoneError: () => void;
  onDisconnected: () => void;
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
  const roomCallbacks = useRef(new Map<string, RoomCallbacks>());
  const report = (message: string) => {
    if (lastReport.current === message) return;
    lastReport.current = message;
    setStatus(message);
    // The call remains mounted while its tab is hidden; a local live region would be silent.
    announce(message, 'polite');
  };
  useEffect(() => {
    const active = new Set(rooms.map(room => room.token));
    for (const token of roomCallbacks.current.keys()) {
      if (!active.has(token)) {
        roomCallbacks.current.delete(token);
        failedRoomRefs.current.delete(token);
      }
    }
    setFailedRooms(previous => {
      const next = new Set([...previous].filter(token => active.has(token)));
      return next.size === previous.size ? previous : next;
    });
    setAttempts(previous => {
      const entries = Object.entries(previous).filter(([token]) => active.has(token));
      return entries.length === Object.keys(previous).length ? previous : Object.fromEntries(entries);
    });
  }, [rooms]);

  return (
    <div ref={panel} data-lk-theme="default">
      {rooms.map(({ token, chain, send }, index) => {
        let callbacks = roomCallbacks.current.get(token);
        if (!callbacks) {
          // LiveKit reconnects when onError changes. Keep callbacks stable through status updates.
          const held: RoomCallbacks = {
            label: 'Voice chat',
            onConnected: () => {
              failedRoomRefs.current.delete(token);
              setFailedRooms(previous => { const next = new Set(previous); next.delete(token); return next; });
              report(`${held.label} connected.`);
            },
            onError: () => {
              failedRoomRefs.current.add(token);
              setFailedRooms(previous => previous.has(token) ? previous : new Set(previous).add(token));
              report(`${held.label} could not connect. Try again.`);
            },
            onMicrophoneError: () => report(`${held.label === 'Voice chat' ? '' : `${held.label}: `}Microphone unavailable. Check microphone access, then try the microphone button again.`),
            onDisconnected: () => {
              if (failedRoomRefs.current.has(token)) return;
              report(`${held.label} disconnected.`);
              removeToken(token);
            },
          };
          callbacks = held;
          roomCallbacks.current.set(token, held);
        }
        callbacks.label = rooms.length > 1 ? `Voice chat ${index + 1}` : 'Voice chat';
        return (
        <section key={token} aria-label={rooms.length > 1 ? `Voice chat ${index + 1}` : 'Voice chat'}>
        <LiveKitRoom
          key={`${token}-${attempts[token] ?? 0}`}
          video={false}
          audio={true}
          token={token}
          serverUrl={serverUrl}
          connect={true}
          onConnected={callbacks.onConnected}
          onError={callbacks.onError}
          onMediaDeviceFailure={callbacks.onMicrophoneError}
          onDisconnected={callbacks.onDisconnected}
        >
          <SpatialLiveKitAudio client={client} chain={chain} send={send} />
          <CacophonyAudioConference onDeviceError={callbacks.onMicrophoneError} />
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
      ); })}
      <p ref={statusRef} tabIndex={-1} className="audio-status">{status}</p>
    </div>
  );
};

export default AudioChat;
