import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockAmbisonicRendererCreate, mockCreateSound } = vi.hoisted(() => ({
  mockAmbisonicRendererCreate: vi.fn(),
  mockCreateSound: vi.fn(),
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
  on: ReturnType<typeof vi.fn>;
  play: ReturnType<typeof vi.fn>;
  playbacks: MockPlayback[];
  position: number[];
  priority?: number;
  seek: ReturnType<typeof vi.fn>;
  stereoPan: number;
  tag?: string;
  threeDOptions?: Record<string, unknown>;
  trigger: (event: string) => void;
  url: string;
  volume: number;
};

function createMockSound(url: string): MockSound {
  const soundListeners = new Map<string, Set<() => void>>();
  const playback: MockPlayback = {
    connect: vi.fn(),
    disconnect: vi.fn(),
    duration: 5,
    stereoPan: 0,
  };

  const sound: MockSound = {
    cleanup: vi.fn(),
    isPlaying: false,
    loop: vi.fn(),
    mediaType: undefined,
    on: vi.fn((event: string, listener: () => void) => {
      if (!soundListeners.has(event)) {
        soundListeners.set(event, new Set());
      }
      soundListeners.get(event)!.add(listener);
      return () => soundListeners.get(event)?.delete(listener);
    }),
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
    trigger(event: string) {
      for (const listener of soundListeners.get(event) ?? []) {
        listener();
      }
    },
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

  afterEach(() => {
    vi.useRealTimers();
  });

  it("uses the resolved URL as the load and play key when data.url is missing", async () => {
    handler.handleDefault("https://media.example/");
    const sound = createMockSound("https://media.example/chime.ogg");
    mockCreateSound.mockResolvedValue(sound);

    await handler.handleLoad({
      name: "chime.ogg",
    });

    expect(handler.sounds["https://media.example/chime.ogg"]).toBe(sound);

    await handler.handlePlay({
      name: "chime.ogg",
      type: "sound",
      volume: 50,
    } as GMCPMessageClientMediaPlay);

    expect(mockCreateSound).toHaveBeenCalledTimes(1);
    expect(sound.play).toHaveBeenCalledOnce();
    expect(handler.sounds["https://media.example/chime.ogg"]).toBe(sound);
  });

  it("passes string sound types to Cacophony", async () => {
    mockCreateSound.mockResolvedValue(createMockSound("https://media.example/theme.ogg"));

    await handler.handlePlay({
      name: "theme.ogg",
      type: "music",
      volume: 50,
    } as GMCPMessageClientMediaPlay);

    expect(mockCreateSound).toHaveBeenCalledWith(
      "https://mongoose.world:9080/?url=theme.ogg",
      "html",
      "stereo",
    );
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

  it("cleans up the replaced sound and stores only the replacement", async () => {
    const oldSound = createMockSound("one.ogg");
    const newSound = createMockSound("two.ogg");
    mockCreateSound.mockResolvedValueOnce(oldSound).mockResolvedValueOnce(newSound);

    await handler.handlePlay({
      key: "effect",
      name: "one.ogg",
      type: "sound",
      volume: 50,
    } as GMCPMessageClientMediaPlay);

    await handler.handlePlay({
      key: "effect",
      name: "two.ogg",
      type: "sound",
      volume: 50,
    } as GMCPMessageClientMediaPlay);

    expect(oldSound.cleanup).toHaveBeenCalledOnce();
    expect(handler.sounds.effect).toBe(newSound);
  });

  it("cleans up a sound when its explicit end timer fires", async () => {
    vi.useFakeTimers();
    const sound = createMockSound("bell.ogg");
    mockCreateSound.mockResolvedValue(sound);

    await handler.handlePlay({
      end: 100,
      key: "bell",
      name: "bell.ogg",
      type: "sound",
      volume: 50,
    } as GMCPMessageClientMediaPlay);

    vi.advanceTimersByTime(100);

    expect(sound.cleanup).toHaveBeenCalledOnce();
    expect(handler.sounds).toEqual({});
  });

  it("cleans up a finite sound after natural playback completion", async () => {
    const sound = createMockSound("pop.ogg");
    mockCreateSound.mockResolvedValue(sound);

    await handler.handlePlay({
      key: "pop",
      name: "pop.ogg",
      type: "sound",
      volume: 50,
    } as GMCPMessageClientMediaPlay);

    sound.trigger("ended");

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
    expect(mockAmbisonicRendererCreate).toHaveBeenCalledWith(client.cacophony, 2);
    expect(renderer.attachPlayback).toHaveBeenCalledWith(sound.playbacks[0]);
    expect(renderer.setRotationMatrixFromYaw).toHaveBeenCalledWith(0);

    handler.handleListenerOrientation({
      forward: [1, 0, 0],
    } as any);

    expect(renderer.setRotationMatrixFromYaw).toHaveBeenLastCalledWith(Math.PI / 2);

    handler.handleStop({ key: "show-1" } as GMCPMessageClientMediaStop);
    expect(renderer.cleanup).toHaveBeenCalledOnce();
  });

  it("routes declared four-channel ambisonic playback through FOA passthrough", async () => {
    const sound = createMockSound("https://media.example/foa.ogg");
    mockCreateSound.mockResolvedValue(sound);

    await handler.handlePlay({
      channels: 4,
      key: "foa-1",
      name: "foa.ogg",
      type: "music",
      upmix: "ambisonic",
      volume: 50,
    } as GMCPMessageClientMediaPlay);

    const renderer = await mockAmbisonicRendererCreate.mock.results[0].value;
    expect(mockAmbisonicRendererCreate).toHaveBeenCalledWith(client.cacophony, 4);
    expect(renderer.attachPlayback).toHaveBeenCalledWith(sound.playbacks[0]);
    expect(sound.inputChannels).toBe(4);
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
