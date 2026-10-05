import { beforeEach, describe, expect, it, vi } from "vitest";
import { LiveKitSpatialAudioBridge } from "./LiveKitSpatialAudioBridge";

function createMedia() {
  const voices: Array<{
    detach: ReturnType<typeof vi.fn>;
    setPosition: ReturnType<typeof vi.fn>;
    setRoute: ReturnType<typeof vi.fn>;
  }> = [];
  const media = {
    attachVoice: vi.fn(() => {
      const voice = { detach: vi.fn(), setPosition: vi.fn(), setRoute: vi.fn() };
      voices.push(voice);
      return voice;
    }),
  };
  return { media, voices };
}

function track(id: string) {
  return { id } as unknown as MediaStreamTrack;
}

describe("LiveKitSpatialAudioBridge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("attaches a participant's track as a voice at its looked-up position", () => {
    const { media } = createMedia();
    const remoteTrack = track("a");
    const bridge = new LiveKitSpatialAudioBridge(media, () => [1, 2, 3]);

    bridge.attachParticipantTrack("player-2", remoteTrack);

    expect(media.attachVoice).toHaveBeenCalledWith(remoteTrack, [1, 2, 3]);
  });

  it("places a participant with no known position at the origin", () => {
    const { media } = createMedia();
    const bridge = new LiveKitSpatialAudioBridge(media, () => undefined);

    bridge.attachParticipantTrack("player-2", track("a"));

    expect(media.attachVoice).toHaveBeenCalledWith(expect.anything(), [0, 0, 0]);
  });

  it("moves the voice on sync, and re-attaching the same track only syncs", () => {
    const { media, voices } = createMedia();
    const positions: Record<string, [number, number, number]> = { "player-2": [1, 2, 3] };
    const remoteTrack = track("a");
    const bridge = new LiveKitSpatialAudioBridge(media, (participantId) => positions[participantId]);

    bridge.attachParticipantTrack("player-2", remoteTrack);
    expect(voices[0].setPosition).not.toHaveBeenCalled();

    positions["player-2"] = [4, 5, 6];
    bridge.syncAll();
    expect(voices[0].setPosition).toHaveBeenLastCalledWith([4, 5, 6]);

    bridge.attachParticipantTrack("player-2", remoteTrack);
    expect(media.attachVoice).toHaveBeenCalledOnce();
    expect(voices[0].setPosition).toHaveBeenCalledTimes(2);
  });

  it("replaces the voice when a participant's track changes", () => {
    const { media, voices } = createMedia();
    const bridge = new LiveKitSpatialAudioBridge(media, () => [0, 0, 0]);

    bridge.attachParticipantTrack("player-2", track("a"));
    bridge.attachParticipantTrack("player-2", track("b"));

    expect(voices[0].detach).toHaveBeenCalledOnce();
    expect(voices).toHaveLength(2);
    expect(voices[1].detach).not.toHaveBeenCalled();
  });

  it("gives the room's route to voices already attached and to later ones", () => {
    const { media, voices } = createMedia();
    const bridge = new LiveKitSpatialAudioBridge(media, () => [0, 0, 0]);

    bridge.attachParticipantTrack("player-1", track("a"));
    expect(voices[0].setRoute).toHaveBeenLastCalledWith({});

    bridge.setRoute({ chain: "room", send: 0.4 });
    expect(voices[0].setRoute).toHaveBeenLastCalledWith({ chain: "room", send: 0.4 });

    bridge.attachParticipantTrack("player-2", track("b"));
    expect(voices[1].setRoute).toHaveBeenLastCalledWith({ chain: "room", send: 0.4 });
  });

  it("detaches participants that are no longer active, and everyone on cleanup", () => {
    const { media, voices } = createMedia();
    const bridge = new LiveKitSpatialAudioBridge(media, () => [0, 0, 0]);

    bridge.attachParticipantTrack("player-1", track("a"));
    bridge.attachParticipantTrack("player-2", track("b"));
    bridge.detachMissing(["player-2"]);

    expect(voices[0].detach).toHaveBeenCalledOnce();
    expect(voices[1].detach).not.toHaveBeenCalled();

    bridge.cleanup();
    expect(voices[1].detach).toHaveBeenCalledOnce();
    expect(voices[0].detach).toHaveBeenCalledOnce();
  });
});
