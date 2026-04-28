import { beforeEach, describe, expect, it, vi } from "vitest";

const mockCreateSound = vi.fn();

vi.mock("cacophony", () => ({
  SoundType: {
    Buffer: "buffer",
    HTML: "html",
  },
}));

import {
  GMCPClientMedia,
  GMCPMessageClientMediaPlay,
  GMCPMessageClientMediaStop,
  GMCPMessageClientMediaUpdate,
} from "./Media";

type MockPlayback = {
  gainNode: {
    gain: {
      setValueAtTime: ReturnType<typeof vi.fn>;
      linearRampToValueAtTime: ReturnType<typeof vi.fn>;
    };
  };
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
  return {
    cacophony: {
      context: {
        currentTime: 100,
      },
      createSound: mockCreateSound,
    },
    emit: vi.fn(),
    sendGmcp: vi.fn(),
  };
}

describe("GMCPClientMedia", () => {
  let handler: GMCPClientMedia;
  let client: ReturnType<typeof createMockClient>;

  beforeEach(() => {
    vi.clearAllMocks();
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
});
