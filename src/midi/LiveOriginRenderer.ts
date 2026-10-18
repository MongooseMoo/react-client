import type { ScorePart } from './score';
import type { SequenceOutput, SequenceVoice } from './SequenceOutput';
import { SequencePartGraph } from './SequenceGraph';
import { sharedSequenceBudget, type SequenceBudget } from './SequenceService';
import type { LiveControl, LiveNote, LiveProgram } from './LiveOriginProtocol';

export const LEGACY_SERVER_ORIGIN = 'server:legacy';
interface Owned {
  id: number;
  channel: number;
  key: string;
  voice?: SequenceVoice;
  releaseBudget: () => void;
  timer?: ReturnType<typeof setTimeout>;
  released: boolean;
  held: boolean;
  abort: AbortController;
}
interface Channel {
  program: number;
  controls: Map<number, number>;
  graph?: SequencePartGraph;
}
interface Origin {
  channels: Map<number, Channel>;
  notes: Map<string, Owned>;
  lastOnId: number;
}
interface Options {
  getOutput(): Promise<SequenceOutput | null>;
  getDestination(context: BaseAudioContext): AudioNode;
  budget?: SequenceBudget;
  error?(message: string): void;
}

/** Immediate live input owns voices by origin/channel/key/event, never by global MIDI channel. */
export class LiveOriginRenderer {
  private readonly origins = new Map<string, Origin>();
  private readonly budget: SequenceBudget;
  private output?: SequenceOutput;
  private opening?: Promise<SequenceOutput | null>;
  private context?: BaseAudioContext;
  private readonly contextChanged = () => {
    if (this.context?.state !== 'running') this.reset();
  };
  private abort = new AbortController();
  private legacyCounter = 0;
  constructor(private readonly options: Options) {
    this.budget = options.budget ?? sharedSequenceBudget;
  }
  private state(id: string): Origin | undefined {
    let state = this.origins.get(id);
    if (!state && this.origins.size < 64) {
      state = { channels: new Map(), notes: new Map(), lastOnId: -1 };
      this.origins.set(id, state);
    }
    return state;
  }
  private channel(state: Origin, channel: number): Channel {
    let value = state.channels.get(channel);
    if (!value) {
      value = {
        program: 0,
        controls: new Map([
          [7, 100],
          [10, 64],
          [11, 127],
          [64, 0],
        ]),
      };
      state.channels.set(channel, value);
    }
    return value;
  }
  private async getOutput(): Promise<SequenceOutput | null> {
    if (this.output) return this.output;
    if (!this.opening) {
      const signal = this.abort.signal;
      this.opening = this.options
        .getOutput()
        .then((output) => {
          if (signal.aborted) {
            output?.dispose?.();
            return null;
          }
          if (output && output.context.state !== 'running') {
            output.dispose?.();
            this.options.error?.('Resume audio before playing live MIDI.');
            return null;
          }
          this.output = output ?? undefined;
          if (output) {
            this.context = output.context;
            this.context.addEventListener('statechange', this.contextChanged);
          }
          return output;
        })
        .finally(() => {
          if (!signal.aborted) this.opening = undefined;
        });
    }
    return this.opening;
  }
  async note(data: LiveNote): Promise<void> {
    const id = data.originId ?? LEGACY_SERVER_ORIGIN;
    const state = this.state(id);
    if (!state) return;
    const channel = this.channel(state, data.channel);
    const key = `${data.channel}:${data.note}`;
    const previous = state.notes.get(key);
    if (!data.on) {
      if (previous && (data.eventId === undefined || previous.id === data.eventId))
        this.release(state, previous, channel);
      return;
    }
    if (data.eventId !== undefined) {
      if (data.eventId <= state.lastOnId) return;
      state.lastOnId = data.eventId;
    }
    if (previous) this.stop(state, previous);
    if (state.notes.size >= 64) return;
    const releaseBudget = this.budget.reserveVoice();
    if (!releaseBudget) return;
    const owned: Owned = {
      id: data.eventId ?? ++this.legacyCounter,
      channel: data.channel,
      key,
      releaseBudget,
      released: false,
      held: false,
      abort: new AbortController(),
    };
    state.notes.set(key, owned);
    const signal = this.abort.signal;
    const program = channel.program;
    const current = () =>
      !signal.aborted &&
      this.origins.get(id) === state &&
      state.notes.get(key) === owned &&
      !owned.released;
    try {
      const output = await this.getOutput();
      if (!output || !current()) {
        this.stop(state, owned);
        return;
      }
      const part: ScorePart = {
        id: `${id}:${data.channel}`,
        name: 'Live input',
        kind: data.channel === 9 ? 'percussion' : 'melodic',
        program,
        notes: [],
        controls: [],
        programs: [],
      };
      if (part.kind === 'percussion' && (data.note < 35 || data.note > 81)) {
        this.stop(state, owned);
        this.options.error?.('Live percussion supports MIDI notes 35–81.');
        return;
      }
      await output.prepare([part], owned.abort.signal);
      if (!current() || output.context.state !== 'running') {
        this.stop(state, owned);
        return;
      }
      if (!channel.graph) {
        channel.graph = new SequencePartGraph(
          output.context,
          this.options.getDestination(output.context),
        );
        for (const [cc, value] of channel.controls)
          channel.graph.control(cc, value, output.context.currentTime);
      }
      owned.voice = output.playNote({
        program: part.program,
        percussion: part.kind === 'percussion',
        note: data.note,
        velocity: data.velocity,
        startTime: output.context.currentTime,
        destination: channel.graph.input,
      });
      void owned.voice.ended.then(() => this.stop(state, owned));
      if (data.duration !== undefined)
        owned.timer = setTimeout(() => {
          if (current()) this.release(state, owned, channel);
        }, data.duration);
    } catch (error) {
      const aborted = signal.aborted || owned.abort.signal.aborted;
      this.stop(state, owned);
      if (!aborted) this.options.error?.(error instanceof Error ? error.message : String(error));
    }
  }
  control(data: LiveControl): void {
    const state = this.state(data.originId ?? LEGACY_SERVER_ORIGIN);
    if (!state) return;
    const channel = this.channel(state, data.channel);
    channel.controls.set(data.controller, data.value);
    if (data.controller === 64 && data.value < 64) {
      for (const owned of state.notes.values())
        if (owned.channel === data.channel && owned.held) this.releaseVoice(state, owned);
    } else
      channel.graph?.control(data.controller, data.value, this.output?.context.currentTime ?? 0);
  }
  program(data: LiveProgram): void {
    const state = this.state(data.originId ?? LEGACY_SERVER_ORIGIN);
    if (state) this.channel(state, data.channel).program = data.program;
  }
  private release(state: Origin, owned: Owned, channel: Channel): void {
    if (owned.released) return;
    if (owned.timer !== undefined) clearTimeout(owned.timer);
    owned.timer = undefined;
    if ((channel.controls.get(64) ?? 0) >= 64 && owned.voice) {
      owned.held = true;
      return;
    }
    this.releaseVoice(state, owned);
  }
  private releaseVoice(state: Origin, owned: Owned): void {
    owned.released = true;
    owned.abort.abort();
    if (!owned.voice) this.stop(state, owned);
    else owned.voice.release();
  }
  private stop(state: Origin, owned: Owned): void {
    if (owned.timer !== undefined) clearTimeout(owned.timer);
    owned.released = true;
    owned.abort.abort();
    owned.voice?.stop();
    owned.releaseBudget();
    if (state.notes.get(owned.key) === owned) state.notes.delete(owned.key);
    if (![...state.notes.values()].some((note) => note.channel === owned.channel)) {
      const channel = state.channels.get(owned.channel);
      channel?.graph?.dispose();
      if (channel) channel.graph = undefined;
    }
  }
  releaseAll(originId: string): void {
    const state = this.origins.get(originId);
    if (!state) return;
    this.origins.delete(originId);
    for (const owned of state.notes.values()) this.stop(state, owned);
    for (const channel of state.channels.values()) channel.graph?.dispose();
  }
  reset(): void {
    this.abort.abort();
    this.abort = new AbortController();
    for (const id of this.origins.keys()) this.releaseAll(id);
    this.context?.removeEventListener('statechange', this.contextChanged);
    this.context = undefined;
    this.output?.dispose?.();
    this.output = undefined;
    this.opening = undefined;
  }
}
