// The single boundary between the pure translation (`resolveEffect`) and live
// cacophony nodes. Given a validated build plan it calls the matching factory.
// `resolveEffect` is the type authority for each factory's option shape (it
// validates + clamps), so the option record is cast to the factory parameter
// type here, at this one dynamic-dispatch boundary, and nowhere else.

import type { Cacophony, CacophonyEffect } from 'cacophony';

import type { ResolvedEffect } from './types';

/** Anything `Bus.addFilter` accepts: a cacophony effect or a built biquad node. */
export type BuiltEffect = CacophonyEffect | ReturnType<Cacophony['createBiquadFilter']>;

/** Cast helper naming the factory's first-parameter type for `f`. */
type OptionsOf<F extends keyof Cacophony> = Cacophony[F] extends (
  options?: infer O,
  ...rest: never[]
) => unknown
  ? O
  : never;

/** Build a live cacophony effect (or biquad node) from a resolved plan. */
export function buildEffect(cacophony: Cacophony, resolved: ResolvedEffect): BuiltEffect {
  if (resolved.kind === 'biquad') {
    return cacophony.createBiquadFilter(resolved.options);
  }

  const o = resolved.options;
  switch (resolved.factory) {
    case 'createFdnReverb':
      return cacophony.createFdnReverb(o as OptionsOf<'createFdnReverb'>);
    case 'createReverb':
      return cacophony.createReverb(o as OptionsOf<'createReverb'>);
    case 'createDelay':
      return cacophony.createDelay(o as OptionsOf<'createDelay'>);
    case 'createChorus':
      return cacophony.createChorus(o as OptionsOf<'createChorus'>);
    case 'createFlanger':
      return cacophony.createFlanger(o as OptionsOf<'createFlanger'>);
    case 'createVibrato':
      return cacophony.createVibrato(o as OptionsOf<'createVibrato'>);
    case 'createDoubling':
      return cacophony.createDoubling(o as OptionsOf<'createDoubling'>);
    case 'createPhaser':
      return cacophony.createPhaser(o as OptionsOf<'createPhaser'>);
    case 'createTremolo':
      return cacophony.createTremolo(o as OptionsOf<'createTremolo'>);
    case 'createAutoPan':
      return cacophony.createAutoPan(o as OptionsOf<'createAutoPan'>);
    case 'createDistortion':
      return cacophony.createDistortion(o as OptionsOf<'createDistortion'>);
    case 'createCompressor':
      return cacophony.createCompressor(o as OptionsOf<'createCompressor'>);
    case 'createLimiter':
      return cacophony.createLimiter(o as OptionsOf<'createLimiter'>);
    case 'createGate':
      return cacophony.createGate(o as OptionsOf<'createGate'>);
    default: {
      // Exhaustiveness: every WorkletFactory is handled above.
      const _never: never = resolved.factory;
      throw new Error(`Unhandled effect factory: ${String(_never)}`);
    }
  }
}
