// A named environment chain: a thin owner around one cacophony Bus that builds
// the ordered effect graph, and that knows the two lifecycle rules the design
// makes load-bearing:
//
//   - MASTER OVERLAY (id === "master", V2): the bus is cacophony's master bus,
//     which is `globalGainNode` and must NEVER be createBus'd or destroy'd. The
//     overlay only adds/removes the exact filter nodes it owns.
//   - NAMED CHAIN teardown (V3): destroying must reroute every live sound off the
//     bus to master FIRST, so an audible sound is never disconnected. cacophony's
//     `bus.destroy({ drainTo })` does exactly that (it walks the bus's tracked
//     routed sources), so we lean on it rather than tracking membership here.
//
// Degradation (§6): an unknown effect `type` is skipped (resolve → null) and a
// worklet that fails to build is skipped — the rest of the chain still builds.

import type { Bus, Cacophony } from 'cacophony';

import { buildEffect } from './buildEffect';
import { resolveEffect } from './resolveEffect';
import type { EffectSpec } from './types';

/** The live node type `Bus.addFilter` returns / `removeFilter` accepts. */
type FilterNode = Awaited<ReturnType<Bus['addFilter']>>;

export interface ChainOptions {
  /** Bus output level (0..). */
  gain?: number;
  /** ms ramp applied to the bus gain when (re)engaging. */
  fadein?: number;
}

export class EffectChain {
  /** The chain id — also the bus name a sound routes to (`sound.routeTo(id)`). */
  readonly id: string;
  readonly bus: Bus;
  private readonly cacophony: Cacophony;
  private readonly isMaster: boolean;
  /** The exact filter nodes this chain added (so the master overlay removes only its own). */
  private nodes: FilterNode[] = [];

  private constructor(cacophony: Cacophony, id: string, bus: Bus, isMaster: boolean) {
    this.cacophony = cacophony;
    this.id = id;
    this.bus = bus;
    this.isMaster = isMaster;
  }

  /**
   * Create a chain. `id === "master"` attaches to the existing master bus as a
   * non-owning overlay; any other id allocates a dedicated named bus.
   */
  static async create(
    cacophony: Cacophony,
    id: string,
    effects: EffectSpec[],
    options: ChainOptions = {},
  ): Promise<EffectChain> {
    const isMaster = id === 'master';
    const bus = isMaster ? requireMasterBus(cacophony) : cacophony.createBus(id);
    const chain = new EffectChain(cacophony, id, bus, isMaster);
    await chain.applyEffects(effects);
    chain.setGain(options.gain, options.fadein);
    return chain;
  }

  /**
   * Replace the chain's effect graph in place (re-`Chain`). The bus persists, so
   * sounds routed to it stay routed. Structural changes click (cacophony rebuilds
   * the whole filter chain), so the bus output is dipped to mask it.
   */
  async replace(effects: EffectSpec[], options: ChainOptions = {}): Promise<void> {
    await this.maskedRebuild(async () => {
      this.removeOwnFilters();
      await this.applyEffects(effects);
    });
    this.setGain(options.gain, options.fadein);
  }

  /**
   * Tear the chain down. Master overlay: strip only our filters (never destroy
   * the shared master bus). Named chain: reroute every live sound to `masterBus`
   * via cacophony's drain, then destroy the bus.
   */
  destroy(masterBus: Bus): void {
    if (this.isMaster) {
      this.removeOwnFilters();
      return;
    }
    if (!this.bus.destroyed) {
      this.bus.destroy({ drainTo: masterBus });
    }
    this.nodes = [];
  }

  private async applyEffects(effects: EffectSpec[]): Promise<void> {
    const sampleRate = this.cacophony.context.sampleRate;
    for (const spec of effects) {
      const resolved = resolveEffect(spec, sampleRate);
      if (!resolved) {
        console.warn(`EffectChain '${this.id}': unknown effect type '${spec.type}'; skipped`);
        continue;
      }
      try {
        const built = buildEffect(this.cacophony, resolved);
        const node = await this.bus.addFilter(built);
        this.nodes.push(node);
      } catch (error) {
        console.warn(
          `EffectChain '${this.id}': effect '${spec.type}' failed to build; skipped`,
          error,
        );
      }
    }
  }

  private removeOwnFilters(): void {
    for (const node of this.nodes) {
      try {
        this.bus.removeFilter(node);
      } catch {
        // Best-effort: the bus may already have dropped it.
      }
    }
    this.nodes = [];
  }

  private setGain(gain: number | undefined, fadein?: number): void {
    if (gain === undefined) {
      return;
    }
    if (fadein && fadein > 0) {
      const param = this.bus.output.gain;
      const now = this.cacophony.context.currentTime;
      param.setValueAtTime(param.value, now);
      param.linearRampToValueAtTime(gain, now + fadein / 1000);
    } else {
      this.bus.gain = gain;
    }
  }

  /** Dip the bus output to ~silence, run the structural change, then restore. */
  private async maskedRebuild(rebuild: () => Promise<void>): Promise<void> {
    const restore = this.bus.gain;
    this.bus.gain = 0;
    try {
      await rebuild();
    } finally {
      this.bus.gain = restore;
    }
  }
}

/** The master bus always exists; narrow `getBus` for the overlay path. */
function requireMasterBus(cacophony: Cacophony): Bus {
  const master = cacophony.getBus('master');
  if (!master) {
    throw new Error('EffectChain: master bus is unexpectedly absent');
  }
  return master;
}
