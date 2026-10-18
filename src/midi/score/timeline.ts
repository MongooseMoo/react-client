import {
  type CanonicalScore,
  SCORE_PPQ,
  type ScoreLoop,
  type ScoreMeter,
  type ScoreTempo,
} from './types';

function finitePosition(value: number): void {
  if (!Number.isFinite(value) || value < 0 || value > Number.MAX_SAFE_INTEGER)
    throw new RangeError('Position exceeds safe bounds');
}

/** Precomputed tempo segments; neither lookup walks elapsed beats or loop passes. */
export class TempoTimeline {
  private readonly segments: { tick: number; ms: number; msPerQuarter: number }[];

  constructor(tempos: readonly ScoreTempo[], ppq = SCORE_PPQ) {
    if (ppq !== SCORE_PPQ || !tempos.length || tempos.length > 20000 || tempos[0].tick !== 0)
      throw new RangeError('Invalid tempo map');
    this.segments = [];
    let ms = 0;
    for (let index = 0; index < tempos.length; index++) {
      const tempo = tempos[index];
      if (
        !Number.isSafeInteger(tempo.tick) ||
        tempo.tick < 0 ||
        !Number.isFinite(tempo.bpm) ||
        tempo.bpm < 20 ||
        tempo.bpm > 400
      )
        throw new RangeError('Invalid tempo segment');
      const previous = this.segments[index - 1];
      if (previous) {
        if (tempo.tick <= previous.tick) throw new RangeError('Tempo positions must increase');
        ms = previous.ms + ((tempo.tick - previous.tick) / ppq) * previous.msPerQuarter;
        finitePosition(ms);
      }
      this.segments.push({ tick: tempo.tick, ms, msPerQuarter: 60000 / tempo.bpm });
    }
  }

  timeAtTick(tick: number): number {
    finitePosition(tick);
    const segment = this.segmentAt(tick, 'tick');
    const ms = segment.ms + ((tick - segment.tick) / SCORE_PPQ) * segment.msPerQuarter;
    finitePosition(ms);
    return ms;
  }

  tickAtTime(ms: number): number {
    finitePosition(ms);
    const segment = this.segmentAt(ms, 'ms');
    const tick = segment.tick + ((ms - segment.ms) / segment.msPerQuarter) * SCORE_PPQ;
    finitePosition(tick);
    return tick;
  }

  private segmentAt(position: number, unit: 'tick' | 'ms') {
    let low = 0;
    let high = this.segments.length;
    while (low + 1 < high) {
      const middle = Math.floor((low + high) / 2);
      if (this.segments[middle][unit] <= position) low = middle;
      else high = middle;
    }
    return this.segments[low];
  }
}

/** Loops repeat the complete tempo region and end after total passes, without an implicit outro. */
export class ScoreTimeline {
  readonly tempo: TempoTimeline;
  readonly terminalTick: number | undefined;
  private readonly loop?: ScoreLoop;
  private readonly loopStartMs: number;
  private readonly loopDurationMs: number;

  constructor(score: Pick<CanonicalScore, 'tempos' | 'durationTicks'>, loop?: ScoreLoop) {
    if (!Number.isSafeInteger(score.durationTicks) || score.durationTicks < 0)
      throw new RangeError('Invalid score duration');
    this.tempo = new TempoTimeline(score.tempos);
    this.loopStartMs = 0;
    this.loopDurationMs = 0;
    if (!loop) {
      this.terminalTick = score.durationTicks;
      return;
    }
    if (
      !Number.isSafeInteger(loop.startTick) ||
      !Number.isSafeInteger(loop.endTick) ||
      loop.startTick < 0 ||
      loop.endTick <= loop.startTick ||
      loop.endTick > score.durationTicks ||
      (loop.plays !== -1 && (!Number.isSafeInteger(loop.plays) || loop.plays < 1))
    )
      throw new RangeError('Invalid score loop');
    this.loop = { ...loop };
    this.loopStartMs = this.tempo.timeAtTick(loop.startTick);
    this.loopDurationMs = this.tempo.timeAtTick(loop.endTick) - this.loopStartMs;
    this.terminalTick =
      loop.plays === -1 ? undefined : loop.startTick + loop.plays * (loop.endTick - loop.startTick);
    if (this.terminalTick !== undefined) {
      if (!Number.isSafeInteger(this.terminalTick))
        throw new RangeError('Loop terminal exceeds safe tick bounds');
      finitePosition(this.timeAtTick(this.terminalTick));
    }
  }

  timeAtTick(unwrappedTick: number): number {
    finitePosition(unwrappedTick);
    if (!this.loop || unwrappedTick < this.loop.startTick)
      return this.tempo.timeAtTick(unwrappedTick);
    const length = this.loop.endTick - this.loop.startTick;
    const occurrence = Math.floor((unwrappedTick - this.loop.startTick) / length);
    const localTick = this.loop.startTick + ((unwrappedTick - this.loop.startTick) % length);
    const ms =
      this.loopStartMs +
      occurrence * this.loopDurationMs +
      this.tempo.timeAtTick(localTick) -
      this.loopStartMs;
    finitePosition(ms);
    return ms;
  }

  tickAtTime(ms: number): number {
    finitePosition(ms);
    if (!this.loop || ms < this.loopStartMs) return this.tempo.tickAtTime(ms);
    const elapsed = ms - this.loopStartMs;
    const occurrence = Math.floor(elapsed / this.loopDurationMs);
    const contentTime = this.loopStartMs + (elapsed % this.loopDurationMs);
    const tick =
      this.loop.startTick +
      occurrence * (this.loop.endTick - this.loop.startTick) +
      this.tempo.tickAtTime(contentTime) -
      this.loop.startTick;
    finitePosition(tick);
    return tick;
  }

  contentPosition(unwrappedTick: number): { tick: number; occurrence: number; terminal: boolean } {
    finitePosition(unwrappedTick);
    if (this.terminalTick !== undefined && unwrappedTick >= this.terminalTick) {
      return {
        tick: this.loop?.endTick ?? this.terminalTick,
        occurrence: this.loop ? this.loop.plays - 1 : 0,
        terminal: true,
      };
    }
    if (!this.loop || unwrappedTick < this.loop.startTick)
      return { tick: unwrappedTick, occurrence: 0, terminal: false };
    const length = this.loop.endTick - this.loop.startTick;
    return {
      tick: this.loop.startTick + ((unwrappedTick - this.loop.startTick) % length),
      occurrence: Math.floor((unwrappedTick - this.loop.startTick) / length),
      terminal: false,
    };
  }
}

/** A meter change starts a new bar at its tick, including off-grid imported changes. */
export function nextMeterBoundary(
  tick: number,
  meters: readonly ScoreMeter[],
  unit: 'bar' | 'beat' = 'bar',
): number {
  finitePosition(tick);
  if (!meters.length || meters[0].tick !== 0) throw new RangeError('Invalid meter map');
  let index = 0;
  while (index + 1 < meters.length && meters[index + 1].tick <= tick) index++;
  const meter = meters[index];
  const length = ((4 * SCORE_PPQ) / meter.denominator) * (unit === 'bar' ? meter.numerator : 1);
  if (!Number.isSafeInteger(length) || length < 1) throw new RangeError('Invalid meter length');
  const boundary = meter.tick + Math.ceil((tick - meter.tick) / length) * length;
  const nextChange = meters[index + 1]?.tick;
  return nextChange === undefined ? boundary : Math.min(boundary, nextChange);
}
