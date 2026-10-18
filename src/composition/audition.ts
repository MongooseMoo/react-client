import type { Cacophony } from 'cacophony';
import { SequenceService, sharedSequenceBudget, type SequenceClock } from '../midi/SequenceService';
import { SequenceGraph } from '../midi/SequenceGraph';
import type { SequenceOutput, SequenceVoice } from '../midi/SequenceOutput';
import { TempoTimeline, type CanonicalScore, type ScorePart } from '../midi/score';
import { performanceToAudioTime } from '../timing/outputClock';
interface Options {
  engine: Cacophony;
  getOutput(): Promise<SequenceOutput | null>;
  isPaused(): boolean;
  correctionMs(): number;
  error?(message: string): void;
  finished?(): void;
}
export interface AuditionStart {
  startPerformanceMs: number;
  endPerformanceMs: number;
  countInStartPerformanceMs: number;
}
/** Private audio owns a separate local clock and grant, never the network clock. */
export class CompositionAudition {
  private service?: SequenceService;
  private output?: SequenceOutput;
  private abort = new AbortController();
  private generation = 0;
  private clicks: Array<{ voice: SequenceVoice; release: () => void }> = [];
  private clickGain?: GainNode;
  private timer?: ReturnType<typeof setTimeout>;
  constructor(private readonly options: Options) {}
  async start(score: CanonicalScore, countInBeats = 0): Promise<AuditionStart> {
    if (!Number.isSafeInteger(countInBeats) || countInBeats < 0 || countInBeats > 16)
      throw new RangeError('Count-in must be 0..16 beats');
    this.stop();
    if (this.options.isPaused()) throw new Error('Resume audio before starting a private audition');
    const generation = this.generation,
      signal = this.abort.signal;
    await this.options.engine.resume();
    const output = await this.options.getOutput();
    if (!output) throw new Error('Choose a browser MIDI output with independent voice support');
    if (generation !== this.generation) {
      output.dispose?.();
      throw new DOMException('Audition cancelled', 'AbortError');
    }
    this.output = output;
    const click: ScorePart = {
      id: 'private-count-in',
      name: 'Count in',
      kind: 'percussion',
      program: 0,
      notes: [],
      controls: [],
      programs: [],
    };
    try {
      await output.prepare(score.parts, signal);
      if (countInBeats) await output.prepare([click], signal);
      if (generation !== this.generation || signal.aborted)
        throw new DOMException('Audition cancelled', 'AbortError');
      const clockId = `local:${crypto.randomUUID()}`;
      const clock: SequenceClock = {
        acquire: () => () => {},
        subscribe: () => () => {},
        estimate: () => ({ clockId, status: 'current', offsetMs: 0 }),
        getServerNow: () => performance.now(),
        targetServerToPerformance: (value) => value,
      };
      let failure = '';
      const service = new SequenceService({
        clock,
        getOutput: async () => output,
        createGraph: (mix) => SequenceGraph.create(this.options.engine, () => undefined, mix),
        correctionMs: this.options.correctionMs,
        error: (_key, message) => {
          failure = message;
          this.options.error?.(message);
        },
      });
      this.service = service;
      const countInStart = performance.now() + 1500;
      const beatMs = 60000 / score.tempos[0].bpm;
      const start = countInStart + countInBeats * beatMs;
      await service.play({
        key: 'private-audition',
        contentId: score.contentId,
        midi: { version: 1, score },
        volume: 100,
        transport: {
          version: 1,
          clockId,
          sourceId: crypto.randomUUID(),
          revision: 1,
          kind: 'score',
          state: 'playing',
          anchorServerMs: start,
          anchorTick: 0,
          durationTicks: score.durationTicks,
        },
      });
      if (failure || !service.has('private-audition'))
        throw new Error(failure || 'Private audition could not start');
      if (generation !== this.generation)
        throw new DOMException('Audition cancelled', 'AbortError');
      if (countInBeats) {
        const context = output.context;
        const master = this.options.engine.getBus('master');
        if (!master) throw new Error('Audio output is unavailable');
        this.clickGain = context.createGain();
        this.clickGain.gain.value = 0.35;
        this.clickGain.connect(master.input as unknown as AudioNode);
        for (let beat = 0; beat < countInBeats; beat++) {
          const release = sharedSequenceBudget.reserveVoice();
          if (!release) throw new Error('MIDI voice limit reached during count-in');
          const timestamp =
            'getOutputTimestamp' in context
              ? (context as AudioContext).getOutputTimestamp()
              : undefined;
          const mapping = performanceToAudioTime(
            countInStart + beat * beatMs,
            {
              running: context.state === 'running',
              currentTime: context.currentTime,
              performanceNowMs: performance.now(),
              outputTimestamp:
                timestamp?.contextTime !== undefined && timestamp.performanceTime !== undefined
                  ? {
                      contextTime: timestamp.contextTime,
                      performanceTime: timestamp.performanceTime,
                    }
                  : undefined,
            },
            this.options.correctionMs(),
          );
          if (!mapping || mapping.audioTime < context.currentTime) {
            release();
            throw new Error('Audio clock is unavailable for count-in');
          }
          let voice: SequenceVoice;
          try {
            voice = output.playNote({
              program: 0,
              percussion: true,
              note: 37,
              velocity: beat === 0 ? 110 : 75,
              startTime: mapping.audioTime,
              destination: this.clickGain,
            });
          } catch (error) {
            release();
            throw error;
          }
          voice.release(mapping.audioTime + 0.04);
          this.clicks.push({ voice, release });
          void voice.ended.then(release);
        }
      }
      const startPerformanceMs = start + this.options.correctionMs();
      const endPerformanceMs =
        startPerformanceMs + new TempoTimeline(score.tempos).timeAtTick(score.durationTicks);
      this.timer = setTimeout(
        () => {
          this.stop();
          this.options.finished?.();
        },
        Math.max(0, endPerformanceMs - performance.now() + 100),
      );
      return {
        startPerformanceMs,
        endPerformanceMs,
        countInStartPerformanceMs: countInStart + this.options.correctionMs(),
      };
    } catch (error) {
      if (generation === this.generation) this.stop();
      throw error;
    }
  }
  stop(): void {
    this.generation++;
    this.abort.abort();
    this.abort = new AbortController();
    if (this.timer !== undefined) clearTimeout(this.timer);
    this.timer = undefined;
    for (const { voice, release } of this.clicks.splice(0)) {
      voice.stop();
      release();
    }
    this.clickGain?.disconnect();
    this.clickGain = undefined;
    if (this.service) this.service.shutdown();
    else this.output?.dispose?.();
    this.service = undefined;
    this.output = undefined;
  }
}
