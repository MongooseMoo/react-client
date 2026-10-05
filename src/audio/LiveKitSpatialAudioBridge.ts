import type { Position } from "cacophony";

import type { MediaService } from "./MediaService";
import type { MediaVoice, VoiceRoute } from "./MediaVoices";

export type SpatialPositionLookup = (participantId: string) => Position | null | undefined;

type VoiceMedia = Pick<MediaService, "attachVoice">;

interface SpatialAudioEntry {
  track: MediaStreamTrack;
  voice: MediaVoice;
}

/** One LiveKit room's remote participants, as positioned voices in the shared audio graph. */
export class LiveKitSpatialAudioBridge {
  private readonly entries = new Map<string, SpatialAudioEntry>();
  private route: VoiceRoute = {};

  constructor(
    private readonly media: VoiceMedia,
    private readonly lookupPosition: SpatialPositionLookup,
  ) {}

  attachParticipantTrack(participantId: string, track: MediaStreamTrack): void {
    const existing = this.entries.get(participantId);
    if (existing?.track === track) {
      this.syncParticipant(participantId);
      return;
    }

    this.detachParticipant(participantId);

    // The first placement snaps so a new voice does not fly in from the origin.
    const voice = this.media.attachVoice(track, this.positionFor(participantId));
    voice.setRoute(this.route);
    this.entries.set(participantId, { track, voice });
  }

  /** The named effect chain every voice in this room plays through. */
  setRoute(route: VoiceRoute): void {
    this.route = route;
    for (const entry of this.entries.values()) {
      entry.voice.setRoute(route);
    }
  }

  syncParticipant(participantId: string): void {
    this.entries.get(participantId)?.voice.setPosition(this.positionFor(participantId));
  }

  syncAll(): void {
    for (const participantId of this.entries.keys()) {
      this.syncParticipant(participantId);
    }
  }

  detachParticipant(participantId: string): void {
    const entry = this.entries.get(participantId);
    if (!entry) {
      return;
    }
    entry.voice.detach();
    this.entries.delete(participantId);
  }

  detachMissing(activeParticipantIds: Iterable<string>): void {
    const active = new Set(activeParticipantIds);
    Array.from(this.entries.keys()).forEach((participantId) => {
      if (!active.has(participantId)) {
        this.detachParticipant(participantId);
      }
    });
  }

  cleanup(): void {
    for (const participantId of Array.from(this.entries.keys())) {
      this.detachParticipant(participantId);
    }
  }

  private positionFor(participantId: string): Position {
    return this.lookupPosition(participantId) ?? [0, 0, 0];
  }
}
