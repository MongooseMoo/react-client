// A chain of effects over one cacophony Bus, in one of three modes:
//
//   - NAMED (a server-defined environment): a dedicated registered bus that
//     sounds route to by name. Teardown reroutes live sounds to master first
//     (V3) via cacophony's `bus.destroy({ drainTo })`.
//   - MASTER OVERLAY (id === "master", V2): the bus is cacophony's master bus
//     (= globalGainNode) and must NEVER be createBus'd or destroy'd — the overlay
//     only adds/removes the exact filter nodes it owns.
//   - ANONYMOUS (an inline per-sound chain, P1): an unregistered bus owned by one
//     sound, torn down with that sound. No drain needed (the owner is going away).
//
// Each built effect is tracked with its wire `type`/`algorithm`/`id` so automation
// (P2) can translate wire params back to cacophony AudioParam names (by reusing
// `resolveEffect`) and ramp them, and so bypass can target a specific effect.
//
// Degradation (§6): an unknown effect `type` is skipped (resolve → null) and a
// worklet that fails to build is skipped — the rest of the chain still builds.

import type { Bus, Cacophony, FadeType } from 'cacophony';

import { buildEffect } from './buildEffect';
import { resolveEffect } from './resolveEffect';
import type { EffectSpec } from './types';

/** The live node type `Bus.addFilter` returns / the bus methods accept. */
type FilterNode = Awaited<ReturnType<Bus['addFilter']>>;

/** A built effect plus the wire metadata automation needs to address it. */
interface ChainEntry {
  id?: string;
  type: string;
  algorithm?: string;
  node: FilterNode;
}

export interface ChainOptions {
  /** Bus output level (0..). */
  gain?: number;
  /** ms ramp applied to the bus gain when (re)engaging. */
  fadein?: number;
}

export interface AutomateOptions {
  /** ms to reach the target values (0 / absent = instant). */
  duration?: number;
  /** Ramp shape. */
  curve?: FadeType;
}

type ChainMode = 'named' | 'master' | 'anonymous';

export class EffectChain {
  /** The chain id, or null for an anonymous inline chain. */
  readonly id: string | null;
  readonly bus: Bus;
  private readonly cacophony: Cacophony;
  private readonly mode: ChainMode;
  private entries: ChainEntry[] = [];
  /** Downstream target the bus output currently feeds (default: master). */
  private downstream: Bus | null = null;

  private constructor(cacophony: Cacophony, id: string | null, bus: Bus, mode: ChainMode) {
    this.cacophony = cacophony;
    this.id = id;
    this.bus = bus;
    this.mode = mode;
  }

  /** A named environment chain (`id === "master"` is the global overlay). */
  static async create(
    cacophony: Cacophony,
    id: string,
    effects: EffectSpec[],
    options: ChainOptions = {},
  ): Promise<EffectChain> {
    const isMaster = id === 'master';
    const bus = isMaster ? requireMasterBus(cacophony) : cacophony.createBus(id);
    const chain = new EffectChain(cacophony, id, bus, isMaster ? 'master' : 'named');
    await chain.applyEffects(effects);
    chain.setGain(options.gain, options.fadein);
    return chain;
  }

  /** An anonymous inline chain owned by a single sound (P1). */
  static async createAnonymous(
    cacophony: Cacophony,
    effects: EffectSpec[],
    options: ChainOptions = {},
  ): Promise<EffectChain> {
    const bus = cacophony.createBus();
    const chain = new EffectChain(cacophony, null, bus, 'anonymous');
    await chain.applyEffects(effects);
    chain.setGain(options.gain, options.fadein);
    return chain;
  }

  /**
   * Redirect the bus output from master to `target` (for `sound → inline →
   * named chain → master`). A null target restores the route to master.
   */
  connectDownstream(target: Bus | null): void {
    if (this.bus.destroyed) {
      return;
    }
    const next = target ?? requireMasterBus(this.cacophony);
    if (this.downstream === next || (this.downstream === null && target === null)) {
      return;
    }
    if (this.downstream) {
      this.bus.disconnect(this.downstream);
    } else {
      // The bus was auto-connected to master by createBus; drop that edge first.
      this.bus.disconnect(requireMasterBus(this.cacophony));
    }
    this.bus.connect(next);
    this.downstream = next;
  }

  /** Replace the effect graph in place (re-`Chain`), gain-dipped to mask the click. */
  async replace(effects: EffectSpec[], options: ChainOptions = {}): Promise<void> {
    await this.maskedRebuild(async () => {
      this.removeOwnFilters();
      await this.applyEffects(effects);
    });
    this.setGain(options.gain, options.fadein);
  }

  /**
   * Ramp the numeric params of one effect (addressed by `id` or index). Wire
   * params are translated to cacophony AudioParam names by reusing
   * `resolveEffect`, then ramped on the live node. No-ops safely if the target
   * is missing or the bus is gone (V6).
   */
  automate(
    target: string | number,
    params: Record<string, number | string>,
    options: AutomateOptions = {},
  ): void {
    if (this.bus.destroyed) {
      return;
    }
    const entry = this.resolveEntry(target);
    if (!entry) {
      console.warn(`EffectChain '${this.id ?? '<inline>'}': automate target '${target}' not found`);
      return;
    }
    const resolved = resolveEffect(
      { type: entry.type, algorithm: entry.algorithm, params },
      this.cacophony.context.sampleRate,
    );
    if (!resolved) {
      return;
    }
    const rampType: FadeType = options.curve === 'exponential' ? 'exponential' : 'linear';
    for (const [name, value] of Object.entries(resolved.options)) {
      if (typeof value === 'number') {
        this.bus.rampFilterParam(entry.node, name, value, {
          duration: options.duration,
          type: rampType,
        });
      }
    }
  }

  /** Bypass / un-bypass one effect (keeps its node + params alive). */
  setBypass(target: string | number, bypassed: boolean): void {
    if (this.bus.destroyed) {
      return;
    }
    const entry = this.resolveEntry(target);
    if (!entry) {
      console.warn(`EffectChain '${this.id ?? '<inline>'}': bypass target '${target}' not found`);
      return;
    }
    this.bus.setFilterBypassed(entry.node, bypassed);
  }

  /**
   * Tear the chain down. Master overlay strips only its own filters; a named
   * chain reroutes live sounds to `masterBus` then destroys; an anonymous inline
   * chain just destroys (its owning sound is being released).
   */
  destroy(masterBus: Bus): void {
    if (this.mode === 'master') {
      this.removeOwnFilters();
      return;
    }
    if (!this.bus.destroyed) {
      this.bus.destroy(this.mode === 'named' ? { drainTo: masterBus } : undefined);
    }
    this.entries = [];
  }

  private async applyEffects(effects: EffectSpec[]): Promise<void> {
    const sampleRate = this.cacophony.context.sampleRate;
    for (const spec of effects) {
      const resolved = resolveEffect(spec, sampleRate);
      if (!resolved) {
        console.warn(
          `EffectChain '${this.id ?? '<inline>'}': unknown effect type '${spec.type}'; skipped`,
        );
        continue;
      }
      try {
        const built = buildEffect(this.cacophony, resolved);
        const node = await this.bus.addFilter(built);
        this.entries.push({
          id: spec.id,
          type: spec.type === 'echo' ? 'delay' : spec.type,
          algorithm: spec.algorithm,
          node,
        });
        if (spec.bypass) {
          this.bus.setFilterBypassed(node, true);
        }
      } catch (error) {
        console.warn(
          `EffectChain '${this.id ?? '<inline>'}': effect '${spec.type}' failed to build; skipped`,
          error,
        );
      }
    }
  }

  private resolveEntry(target: string | number): ChainEntry | undefined {
    if (typeof target === 'number') {
      return this.entries[target];
    }
    return this.entries.find((e) => e.id === target);
  }

  private removeOwnFilters(): void {
    for (const entry of this.entries) {
      try {
        this.bus.removeFilter(entry.node);
      } catch {
        // Best-effort: the bus may already have dropped it.
      }
    }
    this.entries = [];
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

/** The master bus always exists; narrow `getBus` for the overlay / downstream paths. */
function requireMasterBus(cacophony: Cacophony): Bus {
  const master = cacophony.getBus('master');
  if (!master) {
    throw new Error('EffectChain: master bus is unexpectedly absent');
  }
  return master;
}
