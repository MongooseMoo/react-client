import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StatusCues, healthBand, pitchFor, type ToneMaker } from "./statusCues";

interface Played {
  type: OscillatorType | undefined;
  frequency: number | undefined;
  volume: number | undefined;
  stopped: boolean;
}

function fakeToneMaker(): { audio: ToneMaker; played: Played[] } {
  const played: Played[] = [];
  const audio = {
    createOscillator: vi.fn((options: OscillatorOptions, panType?: string) => {
      expect(panType).toBe("stereo");
      const tone: Played = { type: options.type, frequency: options.frequency, volume: undefined, stopped: false };
      return {
        play: (playOptions?: { volume?: number }) => {
          tone.volume = playOptions?.volume;
          played.push(tone);
          return [];
        },
        stop: () => { tone.stopped = true; },
      };
    }),
  } as unknown as ToneMaker;
  return { audio, played };
}

describe("StatusCues", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("pitches linearly from 200 Hz empty to 800 Hz full", () => {
    expect(pitchFor(0)).toBe(200);
    expect(pitchFor(50)).toBe(500);
    expect(pitchFor(100)).toBe(800);
    expect(pitchFor(140)).toBe(800);
  });

  it("puts health in five bands", () => {
    expect([100, 75, 74, 50, 49, 25, 24, 10, 9, 0].map(healthBand)).toEqual([0, 0, 1, 1, 2, 2, 3, 3, 4, 4]);
  });

  it("plays a reserve tone at its pitch and volume, and stops it", () => {
    const { audio, played } = fakeToneMaker();
    new StatusCues(audio).reserve(25, 0.4);
    expect(played).toEqual([{ type: "sine", frequency: 350, volume: 0.4, stopped: false }]);
    vi.advanceTimersByTime(120);
    expect(played[0].stopped).toBe(true);
  });

  it("beats faster in a lower band", () => {
    const beatStarts = (band: number) => {
      const { audio, played } = fakeToneMaker();
      new StatusCues(audio).heartbeat(band, 1);
      const starts: number[] = [];
      for (let ms = 0; ms <= 2000; ms += 10) {
        if (played.length > starts.length) starts.push(...Array(played.length - starts.length).fill(ms));
        vi.advanceTimersByTime(10);
      }
      return starts;
    };
    expect(beatStarts(0)).toEqual([0, 140, 900, 1040]);
    expect(beatStarts(4)).toEqual([0, 140, 300, 440]);
  });

  it("rises for an effect gained and falls for one lost", () => {
    const { audio, played } = fakeToneMaker();
    const cues = new StatusCues(audio);
    cues.effect(true, 1);
    vi.advanceTimersByTime(110);
    cues.effect(false, 1);
    vi.advanceTimersByTime(110);
    expect(played.map((tone) => tone.frequency)).toEqual([523, 784, 784, 523]);
  });

  it("blips at the target's remaining percent", () => {
    const { audio, played } = fakeToneMaker();
    new StatusCues(audio).targetBlip(10, 0.7);
    expect(played).toEqual([{ type: "square", frequency: 260, volume: 0.7, stopped: false }]);
  });
});
