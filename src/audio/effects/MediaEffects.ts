// Owns the set of live named effect chains for the Client.Media handler and
// translates the GMCP chain messages into EffectChain lifecycle calls.
//
// Degradation (§6): an unknown chain preset is a no-op (never silently removes
// an existing chain); empty/absent effects remove the chain (rerouting its live
// sounds to master first, via EffectChain.destroy → cacophony drain).

import type { Cacophony } from 'cacophony';

import { EffectChain } from './EffectChain';
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
}

const MAX_CHAINS = 16;
const MAX_EFFECTS_PER_CHAIN = 8;

export function buildEffectsSupport(): EffectsSupport {
  return {
    types: ADVERTISED_EFFECT_TYPES,
    reverbAlgorithms: ['fdn', 'plate'],
    presets: Object.keys(CHAIN_PRESETS),
    automation: false, // P2
    chains: true,
    maxChains: MAX_CHAINS,
    maxEffectsPerChain: MAX_EFFECTS_PER_CHAIN,
  };
}

export class MediaEffects {
  private readonly cacophony: Cacophony;
  private readonly chains = new Map<string, EffectChain>();

  constructor(cacophony: Cacophony) {
    this.cacophony = cacophony;
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
   */
  async setChain(spec: ChainSpec): Promise<void> {
    if (!spec.id) {
      return;
    }
    const effects = this.resolveChainEffects(spec);
    if (effects === undefined) {
      return; // unknown preset — no-op (do not disturb an existing chain)
    }
    if (effects.length === 0) {
      this.removeChain(spec.id);
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
      const chain = await EffectChain.create(this.cacophony, spec.id, capped, options);
      this.chains.set(spec.id, chain);
    }
  }

  /** Remove a named chain (`Client.Media.ChainStop` or empty `Chain`). */
  removeChain(id: string): void {
    const chain = this.chains.get(id);
    if (!chain) {
      return;
    }
    const master = this.cacophony.getBus('master');
    if (master) {
      chain.destroy(master);
    }
    this.chains.delete(id);
  }

  /** Tear down every chain (e.g. on package shutdown). */
  shutdown(): void {
    for (const id of [...this.chains.keys()]) {
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
