// Owns the set of live named effect chains for the Client.Media handler and
// translates the GMCP chain messages into EffectChain lifecycle calls.
//
// Degradation (§6): an unknown chain preset is a no-op (never silently removes
// an existing chain); empty/absent effects remove the chain (rerouting its live
// sounds to master first, via EffectChain.destroy → cacophony drain).

import { type Cacophony, Playback } from 'cacophony';

import { hasOcclusion } from '../occlusion';
import type { EffectChain } from './EffectChain';
import { CHAIN_PRESETS } from './presets';
import { ADVERTISED_EFFECT_TYPES, type ChainSpec, type EffectSpec } from './types';

/** The `Client.Media.EffectsSupport` capability payload (client → server). */
export interface EffectsSupport {
  types: readonly string[];
  reverbAlgorithms: readonly string[];
  presets: readonly string[];
  automation: boolean;
  chains: boolean;
  maxChains: number;
  maxEffectsPerChain: number;
  /** The client applies the `occlusion` field of Play/Update (0..1, per voice). */
  occlusion: boolean;
}

/** The latest queued build for one chain id; it never rejects. */
interface PendingChain {
  settled: Promise<void>;
}

/** Told when a named chain's bus appears or is about to go, for sources that outlive chains. */
export interface ChainObserver {
  chainCreated(id: string): void;
  chainDestroying(id: string): void;
}

const MAX_CHAINS = 16;
const MAX_EFFECTS_PER_CHAIN = 8;

/**
 * `voice` is what the engine plays sounds with; occlusion is advertised only
 * when it really has `setOcclusion` (the installed Cacophony's Playback does).
 */
export function buildEffectsSupport(voice: unknown = Playback.prototype): EffectsSupport {
  return {
    types: ADVERTISED_EFFECT_TYPES,
    reverbAlgorithms: ['fdn', 'plate'],
    presets: Object.keys(CHAIN_PRESETS),
    automation: true,
    chains: true,
    maxChains: MAX_CHAINS,
    maxEffectsPerChain: MAX_EFFECTS_PER_CHAIN,
    occlusion: hasOcclusion(voice),
  };
}

export class MediaEffects {
  private readonly cacophony: Cacophony;
  private readonly chains = new Map<string, EffectChain>();
  /** Latest requested revision per chain id; a build for an older revision is discarded. */
  private readonly revisions = new Map<string, number>();
  /** The tail of each chain's serialized build queue, while one is outstanding. */
  private readonly pending = new Map<string, PendingChain>();

  constructor(
    cacophony: Cacophony,
    private readonly observer?: ChainObserver,
  ) {
    this.cacophony = cacophony;
  }

  /**
   * Resolves once every Chain definition received so far for `id` has been
   * applied (or discarded), so a Play can route through the chain it names
   * without a dry burst. Never rejects.
   */
  whenChainReady(id: string): Promise<void> {
    return this.pending.get(id)?.settled ?? Promise.resolve();
  }

  /** Whether a Chain definition for `id` is still being applied. */
  hasPendingChain(id: string): boolean {
    return this.pending.has(id);
  }

  private bumpRevision(id: string): number {
    const revision = (this.revisions.get(id) ?? 0) + 1;
    this.revisions.set(id, revision);
    return revision;
  }

  private isCurrent(id: string, revision: number): boolean {
    return this.revisions.get(id) === revision;
  }

  /** Look up a live chain (for routing a sound through it). */
  getChain(id: string): EffectChain | undefined {
    return this.chains.get(id);
  }

  hasChain(id: string): boolean {
    return this.chains.has(id);
  }

  /**
   * Apply a `Client.Media.Chain` message: create, replace, or remove the named
   * chain. Effects come from `spec.effects`, or from a client chain preset when
   * `spec.preset` is given. Empty effects remove the chain.
   *
   * Definitions for one id are applied in arrival order; each carries a
   * revision, and a build that is no longer the latest when it runs (or when
   * its async construction finishes) is dropped, so a stale build never wins.
   */
  setChain(spec: ChainSpec): Promise<void> {
    if (!spec.id) {
      return Promise.resolve();
    }
    const { id } = spec;
    const revision = this.bumpRevision(id);
    const entry: PendingChain = { settled: Promise.resolve() };
    const build = this.whenChainReady(id)
      .then(() => this.applyChain(spec, revision))
      .finally(() => {
        // Cleared before the caller's await resumes, so it sees the chain as ready.
        if (this.pending.get(id) === entry) {
          this.pending.delete(id);
        }
      });
    entry.settled = build.catch(() => undefined);
    this.pending.set(id, entry);
    return build;
  }

  private async applyChain(spec: ChainSpec, revision: number): Promise<void> {
    if (!this.isCurrent(spec.id, revision)) {
      return;
    }
    const effects = this.resolveChainEffects(spec);
    if (effects === undefined) {
      return; // unknown preset — no-op (do not disturb an existing chain)
    }
    if (effects.length === 0) {
      this.destroyChain(spec.id);
      return;
    }
    if (this.chains.size >= MAX_CHAINS && !this.chains.has(spec.id)) {
      console.warn(`MediaEffects: chain limit (${MAX_CHAINS}) reached; '${spec.id}' ignored`);
      return;
    }
    const capped = effects.slice(0, MAX_EFFECTS_PER_CHAIN);
    const options = { gain: spec.gain, fadein: spec.fadein };
    const existing = this.chains.get(spec.id);
    if (existing) {
      await existing.replace(capped, options);
    } else {
      const { EffectChain } = await import('./EffectChain');
      const chain = await EffectChain.create(this.cacophony, spec.id, capped, options);
      if (!this.isCurrent(spec.id, revision)) {
        // Superseded (a ChainStop or reset) while building: never install it.
        const master = this.cacophony.getBus('master');
        if (master) {
          chain.destroy(master);
        }
        return;
      }
      this.chains.set(spec.id, chain);
      this.observer?.chainCreated(spec.id);
    }
  }

  /**
   * Remove a named chain (`Client.Media.ChainStop`). Also cancels any
   * definition for it that is still building.
   */
  removeChain(id: string): void {
    this.bumpRevision(id);
    this.destroyChain(id);
  }

  private destroyChain(id: string): void {
    const chain = this.chains.get(id);
    if (!chain) {
      return;
    }
    this.observer?.chainDestroying(id);
    const master = this.cacophony.getBus('master');
    if (master) {
      chain.destroy(master);
    }
    this.chains.delete(id);
  }

  /** Tear down every chain (e.g. on package shutdown). */
  shutdown(): void {
    for (const id of new Set([...this.chains.keys(), ...this.pending.keys()])) {
      this.removeChain(id);
    }
  }

  /**
   * Returns the ordered effects for a chain spec, or `undefined` to signal "do
   * nothing" (an unknown preset name). An explicit empty list means "remove".
   */
  private resolveChainEffects(spec: ChainSpec): EffectSpec[] | undefined {
    if (spec.preset !== undefined) {
      const preset = CHAIN_PRESETS[spec.preset];
      if (!preset) {
        console.warn(`MediaEffects: unknown chain preset '${spec.preset}'; ignored`);
        return undefined;
      }
      return preset;
    }
    return spec.effects ?? [];
  }
}
