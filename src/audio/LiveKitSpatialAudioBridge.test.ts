import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSpatialStore } from "../stores/spatialStore";
import { LiveKitSpatialAudioBridge } from "./LiveKitSpatialAudioBridge";

function createMedia() {
  const voices: Array<{
    detach: ReturnType<typeof vi.fn>;
    setFacing: ReturnType<typeof vi.fn>;
    setPosition: ReturnType<typeof vi.fn>;
    setRoute: ReturnType<typeof vi.fn>;
  }> = [];
  const media = {
    attachVoice: vi.fn(() => {
      const voice = { detach: vi.fn(), setFacing: vi.fn(), setPosition: vi.fn(), setRoute: vi.fn() };
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

    // No facing lookup was given: the voice has none.
    expect(media.attachVoice).toHaveBeenCalledWith(remoteTrack, [1, 2, 3], null);
  });

  it("attaches a participant who is not in the scene as a non-positional voice", () => {
    const { media } = createMedia();
    const remoteTrack = track("a");
    const bridge = new LiveKitSpatialAudioBridge(media, () => undefined);

    bridge.attachParticipantTrack("player-2", remoteTrack);

    // A phone-call partner has no place in this room: never the room origin.
    expect(media.attachVoice).toHaveBeenCalledWith(remoteTrack, null, null);
  });

  it("makes the voice positional when its entity appears, and non-positional when it leaves", () => {
    const { media, voices } = createMedia();
    const positions: Record<string, [number, number, number] | null> = {};
    const bridge = new LiveKitSpatialAudioBridge(media, (participantId) => positions[participantId]);
    bridge.attachParticipantTrack("player-2", track("a"));

    positions["player-2"] = [4, 5, 6];
    bridge.syncAll();
    expect(voices[0].setPosition).toHaveBeenLastCalledWith([4, 5, 6]);

    // The speaker left the scene (or the listener walked out and stayed on the call).
    delete positions["player-2"];
    bridge.syncAll();
    expect(voices[0].setPosition).toHaveBeenLastCalledWith(null);

    positions["player-2"] = null;
    bridge.syncParticipant("player-2");
    expect(voices[0].setPosition).toHaveBeenLastCalledWith(null);
    expect(media.attachVoice).toHaveBeenCalledOnce();
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

  describe("the speaker's facing", () => {
    it("attaches the voice facing the way its entity does", () => {
      const { media } = createMedia();
      const remoteTrack = track("a");
      const bridge = new LiveKitSpatialAudioBridge(
        media,
        () => [1, 2, 3],
        () => [0, 0, -1],
      );

      bridge.attachParticipantTrack("player-2", remoteTrack);

      expect(media.attachVoice).toHaveBeenCalledWith(remoteTrack, [1, 2, 3], [0, 0, -1]);
    });

    it("attaches an entity with no forward, and a bridge given no facing lookup, with no facing", () => {
      const { media } = createMedia();
      const remoteTrack = track("a");

      new LiveKitSpatialAudioBridge(
        media,
        () => [1, 2, 3],
        () => undefined,
      ).attachParticipantTrack("player-2", remoteTrack);
      new LiveKitSpatialAudioBridge(media, () => [1, 2, 3]).attachParticipantTrack("player-3", remoteTrack);

      expect(media.attachVoice).toHaveBeenNthCalledWith(1, remoteTrack, [1, 2, 3], null);
      expect(media.attachVoice).toHaveBeenNthCalledWith(2, remoteTrack, [1, 2, 3], null);
    });

    it("turns the voice on sync, and drops the facing when the forward goes", () => {
      const { media, voices } = createMedia();
      const facings: Record<string, [number, number, number] | undefined> = { "player-2": [0, 0, -1] };
      const bridge = new LiveKitSpatialAudioBridge(
        media,
        () => [1, 2, 3],
        (participantId) => facings[participantId],
      );
      bridge.attachParticipantTrack("player-2", track("a"));

      facings["player-2"] = [1, 0, 0];
      bridge.syncAll();
      expect(voices[0].setFacing).toHaveBeenLastCalledWith([1, 0, 0]);

      delete facings["player-2"];
      bridge.syncParticipant("player-2");
      expect(voices[0].setFacing).toHaveBeenLastCalledWith(null);
    });

    it("follows the entity through the spatial store, as the audio chat subscribes it", () => {
      const store = useSpatialStore;
      store.getState().reset();
      store.getState().enterEntity({ id: "player-2", position: [1, 2, 3], forward: [0, 0, -1] });
      const { media, voices } = createMedia();
      const bridge = new LiveKitSpatialAudioBridge(
        media,
        (participantId) => store.getState().spatialEntities[participantId]?.position,
        (participantId) => store.getState().spatialEntities[participantId]?.forward,
      );
      const unsubscribe = store.subscribe(() => bridge.syncAll());
      const remoteTrack = track("a");
      bridge.attachParticipantTrack("player-2", remoteTrack);
      expect(media.attachVoice).toHaveBeenCalledWith(remoteTrack, [1, 2, 3], [0, 0, -1]);

      // A step of the turn Client.Spatial.EntityMove tweens into the store.
      store.getState().patchEntity("player-2", { forward: [1, 0, 0] });
      expect(voices[0].setFacing).toHaveBeenLastCalledWith([1, 0, 0]);
      expect(voices[0].setPosition).toHaveBeenLastCalledWith([1, 2, 3]);

      unsubscribe();
      store.getState().reset();
    });
  });
});
