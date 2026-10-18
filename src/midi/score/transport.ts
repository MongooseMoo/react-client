import type { ScoreTimeline } from './timeline';
import type { MediaTransport, ScoreTransport, TransportState } from './types';

export interface ScorePosition {
  unwrappedTick: number;
  contentTick: number;
  occurrence: number;
  state: TransportState;
  terminal: boolean;
}

export function scorePosition(
  transport: ScoreTransport,
  timeline: ScoreTimeline,
  serverNowMs: number,
): ScorePosition {
  if (!Number.isFinite(serverNowMs) || serverNowMs < 0) throw new RangeError('Invalid server time');
  const elapsed =
    transport.state === 'playing' ? Math.max(0, serverNowMs - transport.anchorServerMs) : 0;
  const positionMs = timeline.timeAtTick(transport.anchorTick) + elapsed;
  const maximumMs =
    timeline.terminalTick === undefined ? undefined : timeline.timeAtTick(timeline.terminalTick);
  const terminal = maximumMs !== undefined && positionMs >= maximumMs;
  const unwrappedTick =
    terminal && timeline.terminalTick !== undefined
      ? timeline.terminalTick
      : timeline.tickAtTime(positionMs);
  const position = timeline.contentPosition(unwrappedTick);
  return {
    unwrappedTick,
    contentTick: position.tick,
    occurrence: position.occurrence,
    terminal,
    state: terminal ? 'stopped' : transport.state,
  };
}

export interface MediaPosition {
  unwrappedMs: number;
  positionMs: number;
  occurrence: number;
  state: TransportState;
  terminal: boolean;
}

export function mediaPosition(transport: MediaTransport, serverNowMs: number): MediaPosition {
  if (!Number.isFinite(serverNowMs) || serverNowMs < 0) throw new RangeError('Invalid server time');
  const elapsed =
    transport.state === 'playing' && transport.mode === 'finite'
      ? Math.max(0, serverNowMs - transport.anchorServerMs) * transport.rate
      : 0;
  let unwrappedMs = transport.positionMs + elapsed;
  if (!Number.isFinite(unwrappedMs) || unwrappedMs > Number.MAX_SAFE_INTEGER)
    throw new RangeError('Media position exceeds safe bounds');
  const loop = transport.mode === 'finite' ? transport.loop : undefined;
  const terminalMs = loop
    ? loop.plays === -1
      ? undefined
      : loop.startMs + loop.plays * (loop.endMs - loop.startMs)
    : transport.mode === 'finite'
      ? transport.durationMs
      : undefined;
  const terminal = terminalMs !== undefined && unwrappedMs >= terminalMs;
  if (terminal && terminalMs !== undefined) unwrappedMs = terminalMs;
  if (!loop || unwrappedMs < loop.startMs)
    return {
      unwrappedMs,
      positionMs: unwrappedMs,
      occurrence: 0,
      terminal,
      state: terminal ? 'stopped' : transport.state,
    };
  const length = loop.endMs - loop.startMs;
  return {
    unwrappedMs,
    positionMs: terminal ? loop.endMs : loop.startMs + ((unwrappedMs - loop.startMs) % length),
    occurrence: terminal ? loop.plays - 1 : Math.floor((unwrappedMs - loop.startMs) / length),
    terminal,
    state: terminal ? 'stopped' : transport.state,
  };
}
