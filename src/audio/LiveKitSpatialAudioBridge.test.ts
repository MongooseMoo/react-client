import { beforeEach, describe, expect, it, vi } from "vitest";
import { LiveKitSpatialAudioBridge } from "./LiveKitSpatialAudioBridge";
import { SPATIAL_DISTANCE_MODEL } from "./distanceModel";

const MockMediaStream = vi.fn();

vi.stubGlobal("MediaStream", MockMediaStream);
// jsdom does not implement HTMLMediaElement.play(); replace Audio with a quiet
// mock so the priming element does not spew "Not implemented" to stderr.
vi.stubGlobal(
  "Audio",
  vi.fn(() => ({
    muted: false,
    srcObject: null,
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
  })),
);

type BridgeCacophony = ConstructorParameters<typeof LiveKitSpatialAudioBridge>[0];

function createAudioParam(value = 0) {
  return {
    value,
    setValueAtTime: vi.fn((nextValue: number) => {
      value = nextValue;
      return undefined as never;
    }),
  };
}

function createNode(name: string) {
  return {
    channelCount: 2,
    channelCountMode: "max" as ChannelCountMode,
    channelInterpretation: "speakers" as ChannelInterpretation,
    connect: vi.fn(),
    context: { currentTime: 0 },
    disconnect: vi.fn(),
    name,
    numberOfInputs: 1,
    numberOfOutputs: 1,
  };
}

function createGain(name: string) {
  return {
    ...createNode(name),
    gain: createAudioParam(1),
  };
}

function createPanner() {
  return {
    ...createNode("panner"),
    coneInnerAngle: 360,
    coneOuterAngle: 360,
    coneOuterGain: 0,
    distanceModel: "inverse" as DistanceModelType,
    maxDistance: 10000,
    orientationX: createAudioParam(),
    orientationY: createAudioParam(),
    orientationZ: createAudioParam(),
    panningModel: "HRTF" as PanningModelType,
    positionX: createAudioParam(),
    positionY: createAudioParam(),
    positionZ: createAudioParam(),
    refDistance: 1,
    rolloffFactor: 1,
  };
}

function createCacophony() {
  const source = {
    ...createNode("source"),
    mediaStream: undefined,
  };
  const splitter = createNode("splitter");
  const panner = createPanner();
  const globalGainNode = createGain("global");
  const gains = [
    createGain("mix"),
    createGain("channel-1"),
    createGain("channel-2"),
    createGain("output"),
  ];

  let gainIndex = 0;
  const context = {
    currentTime: 7,
    createChannelSplitter: vi.fn(() => splitter),
    createGain: vi.fn(() => gains[gainIndex++]),
    createMediaStreamSource: vi.fn(() => source),
  };

  const cacophony = {
    context,
    createPanner: vi.fn(() => panner),
    globalGainNode,
    resume: vi.fn(async () => {}),
  } as unknown as BridgeCacophony;

  return { cacophony, context, gains, globalGainNode, panner, source, splitter };
}

function track(channelCount?: number) {
  return {
    enabled: false,
    getSettings: vi.fn(() => ({ channelCount })),
    id: "track-1",
    stop: vi.fn(),
  } as unknown as MediaStreamTrack;
}

describe("LiveKitSpatialAudioBridge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("downmixes unknown remote tracks before the Cacophony HRTF panner", () => {
    const remoteTrack = track();
    const { cacophony, context, gains, globalGainNode, panner, source, splitter } =
      createCacophony();
    const bridge = new LiveKitSpatialAudioBridge(cacophony, () => [1, 2, 3]);

    bridge.attachParticipantTrack("player-2", remoteTrack);

    expect(remoteTrack.enabled).toBe(true);
    expect(MockMediaStream).toHaveBeenCalledWith([remoteTrack]);
    expect(context.createMediaStreamSource).toHaveBeenCalledWith(expect.any(MockMediaStream));
    expect(context.createChannelSplitter).toHaveBeenCalledWith(2);
    expect(source.connect).toHaveBeenCalledWith(splitter);
    expect(splitter.connect).toHaveBeenCalledWith(gains[1], 0);
    expect(splitter.connect).toHaveBeenCalledWith(gains[2], 1);
    expect(gains[1].gain.value).toBe(0.5);
    expect(gains[2].gain.value).toBe(0.5);
    expect(gains[1].connect).toHaveBeenCalledWith(gains[0]);
    expect(gains[2].connect).toHaveBeenCalledWith(gains[0]);
    expect(gains[0].connect).toHaveBeenCalledWith(panner);
    expect(panner.connect).toHaveBeenCalledWith(gains[3]);
    expect(gains[3].connect).toHaveBeenCalledWith(globalGainNode);
    expect(cacophony.createPanner).toHaveBeenCalledWith(
      expect.objectContaining({
        channelCount: 1,
        channelCountMode: "explicit",
        channelInterpretation: "speakers",
        panningModel: "HRTF",
        refDistance: SPATIAL_DISTANCE_MODEL.refDistance,
        rolloffFactor: SPATIAL_DISTANCE_MODEL.rolloffFactor,
        maxDistance: SPATIAL_DISTANCE_MODEL.maxDistance,
      }),
    );
    expect(panner.positionX.setValueAtTime).toHaveBeenCalledWith(1, 7);
    expect(panner.positionY.setValueAtTime).toHaveBeenCalledWith(2, 7);
    expect(panner.positionZ.setValueAtTime).toHaveBeenCalledWith(3, 7);
    expect(cacophony.resume).toHaveBeenCalledOnce();
  });

  it("updates an existing panner position from the spatial lookup", () => {
    const remoteTrack = track(1);
    const { cacophony, panner } = createCacophony();
    const positions: Record<string, [number, number, number]> = {
      "player-2": [1, 2, 3],
    };
    const bridge = new LiveKitSpatialAudioBridge(cacophony, (participantId) => positions[participantId]);

    bridge.attachParticipantTrack("player-2", remoteTrack);
    positions["player-2"] = [4, 5, 6];
    bridge.syncParticipant("player-2");

    expect(panner.positionX.setValueAtTime).toHaveBeenLastCalledWith(4, 7);
    expect(panner.positionY.setValueAtTime).toHaveBeenLastCalledWith(5, 7);
    expect(panner.positionZ.setValueAtTime).toHaveBeenLastCalledWith(6, 7);
  });

  it("primes Chromium decode with a muted media element and tears it down on detach", () => {
    const createdElements: Array<{
      muted: boolean;
      srcObject: unknown;
      play: ReturnType<typeof vi.fn>;
      pause: ReturnType<typeof vi.fn>;
    }> = [];
    const MockAudio = vi.fn(() => {
      const element = {
        muted: false,
        srcObject: null as unknown,
        play: vi.fn().mockResolvedValue(undefined),
        pause: vi.fn(),
      };
      createdElements.push(element);
      return element;
    });
    const originalAudio = (globalThis as { Audio?: unknown }).Audio;
    (globalThis as { Audio?: unknown }).Audio = MockAudio;

    try {
      const remoteTrack = track(1);
      const { cacophony } = createCacophony();
      const bridge = new LiveKitSpatialAudioBridge(cacophony, () => [0, 0, 0]);

      bridge.attachParticipantTrack("player-2", remoteTrack);

      expect(createdElements).toHaveLength(1);
      const element = createdElements[0];
      expect(element.muted).toBe(true);
      expect(element.srcObject).toBeInstanceOf(MockMediaStream);
      expect(element.play).toHaveBeenCalledOnce();

      bridge.detachParticipant("player-2");

      expect(element.pause).toHaveBeenCalledOnce();
      expect(element.srcObject).toBeNull();
    } finally {
      (globalThis as { Audio?: unknown }).Audio = originalAudio;
    }
  });

  it("cleans up stale participant graph nodes without stopping the underlying track", () => {
    const firstTrack = track(2);
    const secondTrack = track(1);
    const first = createCacophony();
    const second = createCacophony();
    const cacophony = {
      ...first.cacophony,
      context: {
        ...first.context,
        createChannelSplitter: vi.fn(first.context.createChannelSplitter)
          .mockImplementationOnce(first.context.createChannelSplitter)
          .mockImplementationOnce(second.context.createChannelSplitter),
        createGain: vi.fn(first.context.createGain)
          .mockImplementationOnce(first.context.createGain)
          .mockImplementationOnce(first.context.createGain)
          .mockImplementationOnce(first.context.createGain)
          .mockImplementationOnce(second.context.createGain),
        createMediaStreamSource: vi.fn()
          .mockImplementationOnce(first.context.createMediaStreamSource)
          .mockImplementationOnce(second.context.createMediaStreamSource),
      },
      createPanner: vi.fn()
        .mockImplementationOnce(first.cacophony.createPanner)
        .mockImplementationOnce(second.cacophony.createPanner),
    } as unknown as BridgeCacophony;
    const bridge = new LiveKitSpatialAudioBridge(cacophony, () => [0, 0, 0]);

    bridge.attachParticipantTrack("player-1", firstTrack);
    bridge.attachParticipantTrack("player-2", secondTrack);
    bridge.detachMissing(["player-2"]);

    expect(first.source.disconnect).toHaveBeenCalled();
    expect(first.splitter.disconnect).toHaveBeenCalled();
    expect(first.panner.disconnect).toHaveBeenCalled();
    expect(firstTrack.stop).not.toHaveBeenCalled();
    expect(second.source.disconnect).not.toHaveBeenCalled();
  });
});
