import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockAmbisonicRendererCreate, mockCreateSound } = vi.hoisted(() => ({
  mockAmbisonicRendererCreate: vi.fn(),
  mockCreateSound: vi.fn(),
}));

vi.mock("cacophony", () => ({
  SoundType: {
    Buffer: "buffer",
    HTML: "html",
  },
}));

vi.mock("../../audio/AmbisonicRenderer", () => ({
  AmbisonicRenderer: {
    create: mockAmbisonicRendererCreate,
  },
}));

import {
  GMCPClientMedia,
  GMCPMessageClientMediaPlay,
  GMCPMessageClientMediaStop,
  GMCPMessageClientMediaUpdate,
} from "./Media";

type MockPlayback = {
  connect: ReturnType<typeof vi.fn>;
  gainNode: {
    gain: {
      setValueAtTime: ReturnType<typeof vi.fn>;
      linearRampToValueAtTime: ReturnType<typeof vi.fn>;
    };
  };
  disconnect: ReturnType<typeof vi.fn>;
  duration: number;
  stereoPan: number;
};

type MockSound = {
  cleanup: ReturnType<typeof vi.fn>;
  isPlaying: boolean;
  key?: string;
  loop: ReturnType<typeof vi.fn>;
  mediaType?: string;
  play: ReturnType<typeof vi.fn>;
  playbacks: MockPlayback[];
  position: number[];
  priority?: number;
  seek: ReturnType<typeof vi.fn>;
  stereoPan: number;
  tag?: string;
  threeDOptions?: Record<string, unknown>;
  url: string;
  volume: number;
};

function createMockSound(url: string): MockSound {
  const playback: MockPlayback = {
    connect: vi.fn(),
    disconnect: vi.fn(),
    gainNode: {
      gain: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
      },
    },
    duration: 5,
    stereoPan: 0,
  };

  const sound: MockSound = {
    cleanup: vi.fn(),
    isPlaying: false,
    loop: vi.fn(),
    mediaType: undefined,
    play: vi.fn(() => {
      sound.isPlaying = true;
      return [playback];
    }),
    playbacks: [playback],
    position: [0, 0, 0],
    priority: undefined,
    seek: vi.fn(),
    stereoPan: 0,
    tag: undefined,
    threeDOptions: undefined,
    url,
    volume: 1,
  };

  return sound;
}

function createMockClient() {
  const listeners = new Map<string, Set<(data: unknown) => void>>();
  return {
    cacophony: {
      context: {
        currentTime: 100,
      },
      createSound: mockCreateSound,
      listenerForwardOrientation: [0, 0, -1],
      listenerUpOrientation: [0, 1, 0],
      listenerPosition: [0, 0, 0],
    },
    emit: vi.fn(),
    off: vi.fn((event: string, handler: (data: unknown) => void) => {
      listeners.get(event)?.delete(handler);
    }),
    on: vi.fn((event: string, handler: (data: unknown) => void) => {
      if (!listeners.has(event)) {
        listeners.set(event, new Set());
      }
      listeners.get(event)!.add(handler);
    }),
    sendGmcp: vi.fn(),
    trigger(event: string, data: unknown) {
      for (const handler of listeners.get(event) ?? []) {
        handler(data);
      }
    },
  };
}

describe("GMCPClientMedia", () => {
  let handler: GMCPClientMedia;
  let client: ReturnType<typeof createMockClient>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAmbisonicRendererCreate.mockResolvedValue({
      attachPlayback: vi.fn(),
      cleanup: vi.fn(),
      setRotationMatrixFromYaw: vi.fn(),
    });
    client = createMockClient();
    handler = new GMCPClientMedia(client as any);
  });

  it("stores tag and type so stop-by-tag and stop-by-type work", async () => {
    const sound = createMockSound("https://media.example/ambience/rain.ogg");
    mockCreateSound.mockResolvedValue(sound);

    await handler.handlePlay({
      key: "rain-loop",
      name: "ambience/rain.ogg",
      tag: "weather",
      type: "music",
      volume: 50,
    } as GMCPMessageClientMediaPlay);

    expect(sound.tag).toBe("weather");
    expect(sound.mediaType).toBe("music");

    handler.handleStop({ tag: "weather" } as GMCPMessageClientMediaStop);
    expect(sound.cleanup).toHaveBeenCalledOnce();
    expect(handler.sounds).toEqual({});
  });

  it("stops sounds by full name suffix instead of last-character matching", async () => {
    const sound = createMockSound("https://media.example/birds/chirp.ogg");
    mockCreateSound.mockResolvedValue(sound);

    await handler.handlePlay({
      key: "bird-1",
      name: "birds/chirp.ogg",
      type: "sound",
      volume: 50,
    } as GMCPMessageClientMediaPlay);

    handler.handleStop({ name: "birds/chirp.ogg" } as GMCPMessageClientMediaStop);

    expect(sound.cleanup).toHaveBeenCalledOnce();
    expect(handler.sounds).toEqual({});
  });

  it("updates an existing sound in place without replaying it", async () => {
    const sound = createMockSound("https://media.example/radio.ogg");
    mockCreateSound.mockResolvedValue(sound);

    await handler.handlePlay({
      key: "radio-1",
      name: "radio.ogg",
      type: "sound",
      volume: 50,
      is3d: true,
      position: [0, 0, 0],
    } as GMCPMessageClientMediaPlay);

    expect(sound.play).toHaveBeenCalledTimes(1);

    handler.handleUpdate({
      key: "radio-1",
      volume: 25,
      pan: 50,
      start: 2000,
      is3d: true,
      position: [4, 5, 6],
    } as GMCPMessageClientMediaUpdate);

    expect(sound.play).toHaveBeenCalledTimes(1);
    expect(sound.volume).toBe(0.25);
    expect(sound.stereoPan).toBe(0.5);
    expect(sound.position).toEqual([4, 5, 6]);
    expect(sound.seek).toHaveBeenCalledWith(2);
    expect(sound.threeDOptions).toMatchObject({
      distanceModel: "inverse",
      panningModel: "HRTF",
    });
  });

  it("routes ambisonic upmix playback through the renderer and follows listener yaw", async () => {
    const sound = createMockSound("https://media.example/show.ogg");
    mockCreateSound.mockResolvedValue(sound);

    await handler.handlePlay({
      key: "show-1",
      name: "show.ogg",
      type: "music",
      upmix: "ambisonic",
      volume: 50,
    } as GMCPMessageClientMediaPlay);

    const renderer = await mockAmbisonicRendererCreate.mock.results[0].value;
    expect(mockAmbisonicRendererCreate).toHaveBeenCalledOnce();
    expect(renderer.attachPlayback).toHaveBeenCalledWith(sound.playbacks[0]);
    expect(renderer.setRotationMatrixFromYaw).toHaveBeenCalledWith(0);

    handler.handleListenerOrientation({
      forward: [1, 0, 0],
    } as any);

    expect(renderer.setRotationMatrixFromYaw).toHaveBeenLastCalledWith(Math.PI / 2);

    handler.handleStop({ key: "show-1" } as GMCPMessageClientMediaStop);
    expect(renderer.cleanup).toHaveBeenCalledOnce();
  });

  it("updates ambisonic renderer rotation on Client.Spatial orientation events", async () => {
    const sound = createMockSound("https://media.example/show.ogg");
    mockCreateSound.mockResolvedValue(sound);

    await handler.handlePlay({
      key: "show-1",
      name: "show.ogg",
      type: "music",
      upmix: "ambisonic",
      volume: 50,
    } as GMCPMessageClientMediaPlay);

    const renderer = await mockAmbisonicRendererCreate.mock.results[0].value;

    client.cacophony.listenerForwardOrientation = [-1, 0, 0];
    client.trigger("spatialListenerOrientation", {
      listenerId: "player-1",
      forward: [-1, 0, 0],
      up: [0, 1, 0],
    });

    expect(renderer.setRotationMatrixFromYaw).toHaveBeenLastCalledWith(-Math.PI / 2);
  });
});
