import {
  check,
  endpointKey,
  id,
  integer,
  record,
  shape,
  strictJson,
  utf8Length,
  validMetadata,
  validFeatures,
  type Endpoint,
  type Metadata,
} from './protocol';
export type Outcome = 'verified' | 'saved' | 'browser-download' | 'export-uncertain';
export type Control =
  | {
      op: 'hello';
      v: 1;
      session: string;
      self: Endpoint;
      peer: Endpoint;
      features: string[];
      maxFrame: number;
      slots: { free: number; total: number };
    }
  | { op: 'push'; q: string; t: string; a: number; offer: string; mode: 'full' }
  | { op: 'accepted'; q: string; t: string; a: number; mode: 'full'; meta: Metadata }
  | { op: 'outcome'; q: string; t: string; a: number; meta: Metadata; outcome: Outcome }
  | { op: 'error'; q: string; t: string; a: number; code: string; retryAfterMs?: number }
  | { op: 'cancel'; q: string; t: string; a: number; reason: 'cancelled' }
  | { op: 'cancelled'; q: string; t: string; a: number };
export type Bind =
  | { op: 'bind'; q: string; t: string; a: number; session: string; meta: Metadata }
  | { op: 'bound'; q: string; t: string; a: number }
  | { op: 'bind-error'; q: string; t: string; a: number; code: 'denied' | 'stale' | 'protocol' };
const eq = (v: unknown) => (x: unknown) => x === v;
const endpoint = (e: unknown): boolean =>
  record(e) &&
  shape({
    player: (x) => typeof x === 'string' && /^#(?:0|[1-9]\d*)$/.test(x),
    endpoint: id,
    epoch: id,
  })(e);
const common = { q: id, t: id, a: integer(1, 2147483647) };
export function parseControl(raw: string): Control {
  const v = strictJson(raw, 8192, 6, 128);
  check(record(v));
  let valid = false;
  switch (v.op) {
    case 'hello':
      valid = shape({
        op: eq('hello'),
        v: eq(1),
        session: id,
        self: endpoint,
        peer: endpoint,
        features: (x) =>
          validFeatures(x) && (x as string[]).length === 1 && (x as string[])[0] === 'base',
        maxFrame: integer(16391, 32768),
        slots: shape({ free: integer(0, 3), total: integer(0, 3) }),
      })(v);
      if (valid) check((v.slots as { free: number }).free <= (v.slots as { total: number }).total);
      break;
    case 'push':
      valid = shape({ ...common, op: eq('push'), offer: id, mode: eq('full') })(v);
      break;
    case 'accepted':
      valid = shape({ ...common, op: eq('accepted'), mode: eq('full'), meta: validMetadata })(v);
      break;
    case 'outcome':
      valid = shape({
        ...common,
        op: eq('outcome'),
        meta: validMetadata,
        outcome: (x) =>
          ['verified', 'saved', 'browser-download', 'export-uncertain'].includes(String(x)),
      })(v);
      break;
    case 'error':
      valid =
        shape(
          {
            ...common,
            op: eq('error'),
            code: (x) =>
              [
                'busy',
                'denied',
                'not-found',
                'stale',
                'limit',
                'protocol',
                'unreadable',
                'expired',
              ].includes(String(x)),
          },
          { retryAfterMs: integer(1000, 60000) },
        )(v) && (v.code === 'busy') === (v.retryAfterMs !== undefined);
      break;
    case 'cancel':
      valid = shape({ ...common, op: eq('cancel'), reason: eq('cancelled') })(v);
      break;
    case 'cancelled':
      valid = shape({ ...common, op: eq('cancelled') })(v);
      break;
  }
  check(valid);
  return v as Control;
}
export function parseBind(raw: string): Bind {
  const v = strictJson(raw, 8192, 6, 128);
  check(record(v));
  check(
    v.op === 'bind'
      ? shape({ ...common, op: eq('bind'), session: id, meta: validMetadata })(v)
      : v.op === 'bound'
        ? shape({ ...common, op: eq('bound') })(v)
        : shape({
            ...common,
            op: eq('bind-error'),
            code: (x) => ['denied', 'stale', 'protocol'].includes(String(x)),
          })(v),
  );
  return v as Bind;
}
export function helloMatches(
  msg: Extract<Control, { op: 'hello' }>,
  session: string,
  self: Endpoint,
  peer: Endpoint,
  discoveredFeatures: string[],
): void {
  check(
    msg.session === session &&
      endpointKey(msg.self) === endpointKey(peer) &&
      endpointKey(msg.peer) === endpointKey(self) &&
      msg.features.every((f) => discoveredFeatures.includes(f)),
  );
}
/** Continuous token buckets; control frames and payload have separate limits. */
export class Bucket {
  private tokens: number;
  private last = performance.now();
  constructor(
    private readonly rate: number,
    private readonly burst: number,
  ) {
    this.tokens = burst;
  }
  take(n: number): boolean {
    const now = performance.now();
    this.tokens = Math.min(this.burst, this.tokens + ((now - this.last) * this.rate) / 1000);
    this.last = now;
    if (this.tokens < n) return false;
    this.tokens -= n;
    return true;
  }
}
export const controlBytes = (msg: Control | Bind): number => utf8Length(JSON.stringify(msg));
