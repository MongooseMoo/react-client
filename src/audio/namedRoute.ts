// Named-chain routing shared by every source that can play through a
// server-defined effect chain: Client.Media sounds and LiveKit voices.

import type { Bus } from 'cacophony';

/** Which named chain a source is meant to play through, and whether that route is live. */
export interface NamedRouteState {
  /** Named chain the source routes to (primary, or aux when {@link namedSend} is set). */
  namedChain?: string;
  /** The send the server asked for. */
  namedSend?: number;
  /** Whether {@link namedChain} is currently applied as the source's own route. */
  chainRouted?: boolean;
  /**
   * The gain the live aux send has in the engine: {@link namedSend}, raised to
   * undo the source's distance gain when the send is tapped after it.
   */
  sendGain?: number;
}

export interface NamedRoutable extends NamedRouteState {
  routeTo(target: Bus | string, sendGain?: number): void;
  removeSend(target: Bus | string): void;
}

/** Undo the live named route: remove its aux send, or return the primary route to master. */
export function clearNamedRoute(source: NamedRoutable, master: Bus | undefined): void {
  const chain = source.namedChain;
  const routed = source.chainRouted;
  source.chainRouted = false;
  source.sendGain = undefined;
  if (!routed || !chain) {
    return;
  }
  try {
    if (source.namedSend !== undefined) {
      source.removeSend(chain);
    } else if (master) {
      source.routeTo(master);
    }
  } catch (error) {
    console.warn(`Client.Media: could not clear chain '${chain}'`, error);
  }
}

/**
 * Route the source to `chain` (primary, or an aux send at `send`), first
 * undoing a different named route. A no-op when that route is already live.
 * `compensatedSend` is the gain the engine gives the send, when that is not
 * `send` itself (see {@link NamedRouteState.sendGain}); a live aux send to the same
 * chain is re-gained in place, never removed and added again.
 * Returns the error when the chain cannot be routed to; the source then plays
 * dry and keeps the route it wants, so a later call can apply it.
 */
export function routeNamedChain(
  source: NamedRoutable,
  chain: string | undefined,
  send: number | undefined,
  master: Bus | undefined,
  compensatedSend: number | undefined = send,
): unknown {
  // A primary route has no send gain, whatever the caller computed.
  const sendGain = send === undefined ? undefined : compensatedSend;
  const live = source.chainRouted && source.namedChain === chain;
  if (live && source.namedSend === send && source.sendGain === sendGain) {
    return undefined;
  }
  // The engine re-gains an existing send; only a different chain, or a change
  // between a primary route and an aux send, needs the old route undone.
  const regain = live && source.namedSend !== undefined && send !== undefined;
  if (!regain) {
    clearNamedRoute(source, master);
  }
  source.namedChain = chain;
  source.namedSend = send;
  if (!chain) {
    return undefined;
  }
  try {
    if (sendGain !== undefined) {
      source.routeTo(chain, sendGain);
    } else {
      source.routeTo(chain);
    }
    source.chainRouted = true;
    source.sendGain = sendGain;
    return undefined;
  } catch (error) {
    return error ?? new Error(`chain '${chain}' unavailable`);
  }
}
