import type { MidiMessage } from '../MidiService';
import {
  TempoTimeline,
  type CanonicalScore,
  type ScoreNote,
  type ScoreControl,
  type ScoreProgram,
  type ScoreBend,
} from '../midi/score';
import type { CaptureTake, CapturedInput } from './model';
interface Options {
  score: CanonicalScore;
  partId: string;
  patternId: string;
  startPerformanceMs: number;
  startTick?: number;
  channel?: number;
}
/** Keeps exact receipt timestamps alongside derived integer musical positions. */
export class CompositionCapture {
  private readonly events: CapturedInput[] = [];
  private readonly timeline: TempoTimeline;
  private readonly startTick: number;
  readonly endPerformanceMs: number;
  constructor(private readonly options: Options) {
    this.timeline = new TempoTimeline(options.score.tempos);
    this.startTick = options.startTick ?? 0;
    this.endPerformanceMs =
      options.startPerformanceMs +
      this.timeline.timeAtTick(options.score.durationTicks) -
      this.timeline.timeAtTick(this.startTick);
  }
  input(message: MidiMessage, performanceTimeMs: number): void {
    if (
      !Number.isFinite(performanceTimeMs) ||
      performanceTimeMs < this.options.startPerformanceMs ||
      performanceTimeMs > this.endPerformanceMs
    )
      return;
    const data = [...message.rawData.data];
    const type = data[0] & 0xf0;
    if (this.options.channel !== undefined && (data[0] & 15) !== this.options.channel) return;
    if (
      data.length < 2 ||
      data.length > 3 ||
      data[0] < 0x80 ||
      data[0] >= 0xf0 ||
      ![0x80, 0x90, 0xb0, 0xc0, 0xe0].includes(type) ||
      data.slice(1).some((byte) => !Number.isInteger(byte) || byte < 0 || byte > 127)
    )
      return;
    if (data.length !== (type === 0xc0 ? 2 : 3)) return;
    if (this.events.length >= 20000) throw new RangeError('Recording reached 20000 input events');
    this.events.push({ performanceTimeMs, data });
  }
  finish(now: number): {
    take: CaptureTake;
    notes: readonly ScoreNote[];
    controls: ScoreControl[];
    programs: ScoreProgram[];
    bends: ScoreBend[];
  } {
    const endPerformanceMs = Math.max(
      this.options.startPerformanceMs,
      Math.min(now, this.endPerformanceMs),
    );
    const position = (ms: number) =>
      Math.min(
        this.options.score.durationTicks,
        Math.max(
          this.startTick,
          Math.round(
            this.timeline.tickAtTime(
              this.timeline.timeAtTick(this.startTick) + ms - this.options.startPerformanceMs,
            ),
          ),
        ),
      );
    const endTick = position(endPerformanceMs);
    const pending = new Map<string, Array<{ tick: number; note: number; velocity: number }>>();
    const notes: ScoreNote[] = [],
      controls: ScoreControl[] = [],
      programs: ScoreProgram[] = [],
      bends: ScoreBend[] = [];
    for (const event of this.events) {
      if (event.performanceTimeMs > endPerformanceMs) continue;
      const [status, first, second] = event.data,
        type = status & 0xf0,
        tick = position(event.performanceTimeMs);
      const key = `${status & 15}:${first}`;
      if (type === 0x90 && second > 0) {
        const queue = pending.get(key) ?? [];
        queue.push({ tick, note: first, velocity: second });
        pending.set(key, queue);
      } else if (type === 0x80 || type === 0x90) {
        const onset = pending.get(key)?.shift();
        if (onset && onset.tick < this.options.score.durationTicks)
          notes.push([
            onset.tick,
            Math.max(1, Math.min(endTick, tick) - onset.tick),
            onset.note,
            onset.velocity,
          ]);
      } else if (type === 0xb0) controls.push({ tick, controller: first, value: second });
      else if (type === 0xc0) programs.push({ tick, program: first });
      else if (type === 0xe0) bends.push({ tick, value: first + 128 * second });
    }
    for (const queue of pending.values())
      for (const onset of queue)
        if (endTick > onset.tick)
          notes.push([onset.tick, endTick - onset.tick, onset.note, onset.velocity]);
    notes.sort((a, b) => a[0] - b[0]);
    return {
      notes,
      controls,
      programs,
      bends,
      take: {
        id: crypto.randomUUID(),
        partId: this.options.partId,
        patternId: this.options.patternId,
        startPerformanceMs: this.options.startPerformanceMs,
        endPerformanceMs,
        startTick: this.startTick,
        events: this.events.filter((event) => event.performanceTimeMs <= endPerformanceMs),
        unquantizedNotes: notes,
      },
    };
  }
}
