import type { Cacophony } from "cacophony";

/** The part of Cacophony the status sounds use: plain oscillators, no sound files. */
export type ToneMaker = Pick<Cacophony, "createOscillator">;

/** 200 Hz empty to 800 Hz full, linear in percent. */
export function pitchFor(percent: number): number {
  return 200 + 6 * Math.min(Math.max(percent, 0), 100);
}

// Health bands, healthiest first: 75 % and up, 50, 25, 10, under 10.
const BAND_FLOORS = [75, 50, 25, 10];

/** 0 for the healthiest band up to 4 for under 10 percent. */
export function healthBand(percent: number): number {
  const band = BAND_FLOORS.findIndex((floor) => percent >= floor);
  return band === -1 ? BAND_FLOORS.length : band;
}

// Milliseconds from one beat to the next, by band: the heart races as health falls.
const BEAT_INTERVALS = [900, 750, 600, 450, 300];

/** Short one-shot tones through the client's Cacophony, so master volume and mute apply. */
export class StatusCues {
  constructor(private readonly audio: ToneMaker) {}

  private tone(frequency: number, ms: number, volume: number, delayMs = 0, type: OscillatorType = "sine"): void {
    const start = () => {
      const synth = this.audio.createOscillator({ type, frequency }, "stereo");
      synth.play({ volume });
      setTimeout(() => synth.stop(), ms);
    };
    if (delayMs === 0) start();
    else setTimeout(start, delayMs);
  }

  /** A reserve moved by a step: one tone pitched by its percent. */
  reserve(percent: number, volume: number): void {
    this.tone(pitchFor(percent), 120, volume);
  }

  /** Health entered another band: two lub-dub beats, faster in lower bands. */
  heartbeat(band: number, volume: number): void {
    const interval = BEAT_INTERVALS[band];
    for (let beat = 0; beat < 2; beat++) {
      this.tone(110, 80, volume, beat * interval, "triangle");
      this.tone(90, 80, volume, beat * interval + 140, "triangle");
    }
  }

  /** The target's health changed: a short blip pitched by what it has left. */
  targetBlip(percent: number, volume: number): void {
    this.tone(pitchFor(percent), 60, volume, 0, "square");
  }

  /** An effect was gained (rising pair) or lost (falling pair). */
  effect(gained: boolean, volume: number): void {
    const [first, second] = gained ? [523, 784] : [784, 523];
    this.tone(first, 90, volume);
    this.tone(second, 90, volume, 110);
  }
}
