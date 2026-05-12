import { beforeEach, describe, expect, it, vi } from "vitest";
import { LiveKitSpatialAudioBridge } from "./LiveKitSpatialAudioBridge";

const MockMediaStream = vi.fn();

vi.stubGlobal("MediaStream", MockMediaStream);

function createSound() {
  return {
    cleanup: vi.fn(),
    play: vi.fn(),
    position: [0, 0, 0],
  };
}

describe("LiveKitSpatialAudioBridge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a Cacophony media stream sound without taking track ownership", () => {
    const track = { id: "track-1" } as MediaStreamTrack;
    const sound = createSound();
    const cacophony = {
      createMediaStreamSound: vi.fn().mockReturnValue(sound),
    };
    const bridge = new LiveKitSpatialAudioBridge(cacophony as any, () => [1, 2, 3]);

    bridge.attachParticipantTrack("player-2", track);

    expect(MockMediaStream).toHaveBeenCalledWith([track]);
    expect(cacophony.createMediaStreamSound).toHaveBeenCalledWith(expect.any(MockMediaStream), {
      stopTracksOnStop: false,
    });
    expect(sound.position).toEqual([1, 2, 3]);
    expect(sound.play).toHaveBeenCalledOnce();
  });

  it("updates an existing sound position from the spatial lookup", () => {
    const track = { id: "track-1" } as MediaStreamTrack;
    const sound = createSound();
    const positions: Record<string, [number, number, number]> = {
      "player-2": [1, 2, 3],
    };
    const bridge = new LiveKitSpatialAudioBridge(
      { createMediaStreamSound: vi.fn().mockReturnValue(sound) } as any,
      (participantId) => positions[participantId],
    );

    bridge.attachParticipantTrack("player-2", track);
    positions["player-2"] = [4, 5, 6];
    bridge.syncParticipant("player-2");

    expect(sound.position).toEqual([4, 5, 6]);
  });

  it("cleans up stale participant sounds without stopping the underlying track directly", () => {
    const firstSound = createSound();
    const secondSound = createSound();
    const track1 = { id: "track-1", stop: vi.fn() } as unknown as MediaStreamTrack;
    const track2 = { id: "track-2", stop: vi.fn() } as unknown as MediaStreamTrack;
    const bridge = new LiveKitSpatialAudioBridge(
      {
        createMediaStreamSound: vi.fn().mockReturnValueOnce(firstSound).mockReturnValueOnce(secondSound),
      } as any,
      () => [0, 0, 0],
    );

    bridge.attachParticipantTrack("player-1", track1);
    bridge.attachParticipantTrack("player-2", track2);
    bridge.detachMissing(["player-2"]);

    expect(firstSound.cleanup).toHaveBeenCalledOnce();
    expect(secondSound.cleanup).not.toHaveBeenCalled();
    expect(track1.stop).not.toHaveBeenCalled();
  });
});
