import type {
  AudioNode as CacophonyAudioNode,
  Cacophony,
  GainNode as CacophonyGainNode,
  MediaStreamAudioSourceNode,
  PannerNode as CacophonyPannerNode,
  Position,
} from "cacophony";

import { SPATIAL_DISTANCE_MODEL } from "./distanceModel";

export type SpatialPositionLookup = (participantId: string) => Position | null | undefined;

type LiveKitCacophony = Pick<Cacophony, "context" | "createPanner" | "globalGainNode" | "resume">;

interface SpatialAudioEntry {
  track: MediaStreamTrack;
  stream: MediaStream;
  source: MediaStreamAudioSourceNode;
  panner: CacophonyPannerNode;
  outputGain: CacophonyGainNode;
  downmixNodes: CacophonyAudioNode[];
  primeElement?: HTMLAudioElement;
}

export class LiveKitSpatialAudioBridge {
  private readonly entries = new Map<string, SpatialAudioEntry>();

  constructor(
    private readonly cacophony: LiveKitCacophony,
    private readonly lookupPosition: SpatialPositionLookup,
  ) {}

  attachParticipantTrack(participantId: string, track: MediaStreamTrack): void {
    const existing = this.entries.get(participantId);
    if (existing?.track === track) {
      this.syncParticipant(participantId);
      return;
    }

    this.detachParticipant(participantId);

    if (!this.cacophony.context.createMediaStreamSource) {
      throw new Error("Media stream sources are not supported on this audio context.");
    }

    track.enabled = true;
    const stream = new MediaStream([track]);
    const source = this.cacophony.context.createMediaStreamSource(stream);
    const { output, nodes } = this.downmixToMono(source, track);
    const panner = this.cacophony.createPanner({
      channelCount: 1,
      channelCountMode: "explicit",
      channelInterpretation: "speakers",
      distanceModel: "inverse",
      panningModel: "HRTF",
      refDistance: SPATIAL_DISTANCE_MODEL.refDistance,
      rolloffFactor: SPATIAL_DISTANCE_MODEL.rolloffFactor,
      maxDistance: SPATIAL_DISTANCE_MODEL.maxDistance,
    });
    const outputGain = this.cacophony.context.createGain();

    output.connect(panner);
    panner.connect(outputGain);
    outputGain.connect(this.cacophony.globalGainNode);

    this.applyPosition(panner, this.positionFor(participantId));
    this.entries.set(participantId, {
      downmixNodes: nodes,
      outputGain,
      panner,
      primeElement: this.createPrimeElement(stream),
      source,
      stream,
      track,
    });

    void this.cacophony.resume().catch((error) => {
      console.warn("LiveKit spatial audio: could not resume Cacophony context", error);
    });
  }

  syncParticipant(participantId: string): void {
    const entry = this.entries.get(participantId);
    if (!entry) {
      return;
    }
    this.applyPosition(entry.panner, this.positionFor(participantId));
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
    this.disconnectEntry(entry);
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

  private createPrimeElement(stream: MediaStream): HTMLAudioElement | undefined {
    // Chromium will not decode a remote WebRTC track that is only wired into
    // the Web Audio graph: packets arrive but no samples are produced, so the
    // panner taps silence. Pulling the same stream through a muted media
    // element primes the decode pipeline; the element stays muted so it does
    // not double-play over the spatialised Web Audio output. Firefox does not
    // need this, but the element is harmless there.
    if (typeof Audio === "undefined") {
      return undefined;
    }
    try {
      const element = new Audio();
      element.muted = true;
      element.srcObject = stream;
      // Muted autoplay needs no user gesture; a rejection only loses priming.
      void element.play().catch(() => {});
      return element;
    } catch {
      return undefined;
    }
  }

  private downmixToMono(
    source: MediaStreamAudioSourceNode,
    track: MediaStreamTrack,
  ): { output: CacophonyAudioNode; nodes: CacophonyAudioNode[] } {
    const channelCount = this.trackChannelCount(track);
    if (channelCount <= 1 || !this.cacophony.context.createChannelSplitter) {
      return { output: source, nodes: [] };
    }

    const splitter = this.cacophony.context.createChannelSplitter(channelCount);
    const mix = this.cacophony.context.createGain();
    const nodes: CacophonyAudioNode[] = [splitter, mix];

    source.connect(splitter);
    for (let channel = 0; channel < channelCount; channel += 1) {
      const channelGain = this.cacophony.context.createGain();
      channelGain.gain.value = 1 / channelCount;
      splitter.connect(channelGain, channel);
      channelGain.connect(mix);
      nodes.push(channelGain);
    }

    return { output: mix, nodes };
  }

  private trackChannelCount(track: MediaStreamTrack): number {
    const channelCount = track.getSettings?.().channelCount;
    if (typeof channelCount === "number" && Number.isFinite(channelCount) && channelCount > 0) {
      return Math.max(1, Math.trunc(channelCount));
    }
    return 2;
  }

  private applyPosition(panner: CacophonyPannerNode, [x, y, z]: Position): void {
    const time = this.cacophony.context.currentTime;
    panner.positionX.setValueAtTime(x, time);
    panner.positionY.setValueAtTime(y, time);
    panner.positionZ.setValueAtTime(z, time);
  }

  private disconnectEntry(entry: SpatialAudioEntry): void {
    if (entry.primeElement) {
      try {
        entry.primeElement.pause();
        entry.primeElement.srcObject = null;
      } catch {
        // Element may already be torn down by the browser during teardown.
      }
    }
    const nodes: CacophonyAudioNode[] = [
      entry.source,
      ...entry.downmixNodes,
      entry.panner,
      entry.outputGain,
    ];
    for (const node of nodes) {
      try {
        node.disconnect();
      } catch {
        // Node may already be disconnected by the browser during track teardown.
      }
    }
  }
}
