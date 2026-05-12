import type { Cacophony, MediaStreamSound, Position } from "cacophony";

export type SpatialPositionLookup = (participantId: string) => Position | null | undefined;

interface SpatialAudioEntry {
  sound: MediaStreamSound;
  track: MediaStreamTrack;
}

export class LiveKitSpatialAudioBridge {
  private readonly entries = new Map<string, SpatialAudioEntry>();

  constructor(
    private readonly cacophony: Pick<Cacophony, "createMediaStreamSound">,
    private readonly lookupPosition: SpatialPositionLookup,
  ) {}

  attachParticipantTrack(participantId: string, track: MediaStreamTrack): void {
    const existing = this.entries.get(participantId);
    if (existing?.track === track) {
      this.syncParticipant(participantId);
      return;
    }

    this.detachParticipant(participantId);

    const sound = this.cacophony.createMediaStreamSound(new MediaStream([track]), {
      stopTracksOnStop: false,
    });
    sound.position = this.positionFor(participantId);
    sound.play();
    this.entries.set(participantId, { sound, track });
  }

  syncParticipant(participantId: string): void {
    const entry = this.entries.get(participantId);
    if (!entry) {
      return;
    }
    entry.sound.position = this.positionFor(participantId);
  }

  syncAll(): void {
    Array.from(this.entries.keys()).forEach((participantId) => this.syncParticipant(participantId));
  }

  detachParticipant(participantId: string): void {
    const entry = this.entries.get(participantId);
    if (!entry) {
      return;
    }
    entry.sound.cleanup();
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
    Array.from(this.entries.keys()).forEach((participantId) => this.detachParticipant(participantId));
  }

  private positionFor(participantId: string): Position {
    return this.lookupPosition(participantId) ?? [0, 0, 0];
  }
}
