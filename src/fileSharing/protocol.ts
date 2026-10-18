/** Phase 1's complete wire vocabulary. Later-phase features are deliberately absent. */
export const MAX_FILE = 104857600;
export const PIECE = 16384;
export const MAX_FRAME = 32768;
export type Endpoint = { player: string; endpoint: string; epoch: string };
export type OfferState =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'withdrawn'
  | 'cancelled'
  | 'expired'
  | 'received'
  | 'revoked';
export type Metadata = {
  kind: 'file';
  id: string;
  size: number;
  name: string;
  encoding: 'identity';
  hash: 'sha256-leaves-16384';
  pieceSize: 16384;
};
export type Refs = { offer?: string; session?: string; search?: string };
export type WireError = {
  req?: string;
  about: string;
  code: string;
  refs: Refs;
  retryAfterMs?: number;
};
export type Ready = {
  req: string;
  hub: string;
  self: Endpoint;
  peer: 1;
  files: 1;
  data: 1;
  features: string[];
  maxReceiveSize: number;
  canShare: boolean;
  leaseMs: 30000;
  heartbeatMs: 10000;
};
export type Capabilities = {
  req: string;
  to: string;
  online: boolean;
  target?: Endpoint;
  peer: 0 | 1;
  files: 0 | 1;
  data: 0 | 1;
  features: string[];
  maxReceiveSize: number;
  legacyV1: boolean;
};
export type Reserved = {
  req?: string;
  event: string;
  peer: Endpoint;
  session: string;
  initiator: Endpoint;
  authorization: { kind: 'offer'; offer: string };
  capabilities: { data: 1; features: string[]; maxReceiveSize: number };
  negotiationMs: 30000;
};
export type Candidate = {
  candidate: string;
  sdpMid?: string;
  sdpMLineIndex?: number;
  usernameFragment?: string;
};
type Signal = { req: string; from: Endpoint; session: string };
export interface PeerInbound {
  Ready: Ready;
  Capabilities: Capabilities;
  Lease: { event: string; hub: string; self: Endpoint; seq: number; leaseMs: 30000 };
  End: {
    event: string;
    self: Endpoint;
    reason: 'superseded' | 'identity' | 'shutdown' | 'overload';
  };
  Reserved: Reserved;
  Connect: Signal & { sdp: string };
  Answer: Signal & { sdp: string };
  Candidate: Signal & { candidate?: Candidate; end?: true };
  Closed: { event: string; peer: Endpoint; session: string; reason: string };
  Ack: { req: string; about: string; refs: Refs };
  Error: WireError;
}
export interface FilesInbound {
  Offer: {
    req: string;
    from: Endpoint;
    offer: string;
    id: string;
    name: string;
    size: number;
    expiresAt: number;
  };
  Offered: { req: string; offer: string; target: Endpoint; expiresAt: number };
  OfferState: {
    event: string;
    offer: string;
    sender: Endpoint;
    receiver: Endpoint;
    state: OfferState;
    expiresAt: number;
  };
  Revoke: {
    event: string;
    peer: Endpoint;
    scope: 'peer' | 'offer';
    offer?: string;
    reason: string;
  };
  Ack: PeerInbound['Ack'];
  Error: WireError;
}
export type Target = { req: string; to: string; target: Endpoint };
export interface PeerOutbound {
  Hello: {
    req: string;
    endpoint: string;
    peer: 1;
    files: 1;
    data: 1;
    features: ['base'];
    maxReceiveSize: number;
  };
  Capabilities: { req: string; to: string };
  Reserve: Target & { purpose: 'files'; auth: { kind: 'offer'; offer: string } };
  Connect: Target & { session: string; sdp: string };
  Answer: Target & { session: string; sdp: string };
  Candidate: Target & { session: string; candidate?: Candidate; end?: true };
  Connected: Target & { session: string };
  Close: Target & { session: string; reason: 'done' | 'cancelled' | 'failed' | 'protocol' };
}
export interface FilesOutbound {
  Offer: Target & { offer: string; id: string; name: string; size: number };
  Respond: Target & { offer: string; accept: boolean };
  Withdraw: Target & { offer: string };
  Cancel: Target & { offer: string };
  Outcome: Target & { offer: string };
}
export interface WirePort<I, O> {
  send<K extends keyof O & string>(kind: K, data: O[K]): void;
  on<K extends keyof I & string>(kind: K, fn: (data: I[K]) => void): () => void;
}
export type PeerPort = WirePort<PeerInbound, PeerOutbound>;
export type FilesPort = WirePort<FilesInbound, FilesOutbound>;
export function randomId(): string {
  return [...crypto.getRandomValues(new Uint8Array(16))]
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('');
}
export function endpointKey(e: Endpoint): string {
  return JSON.stringify([e.player, e.endpoint, e.epoch]);
}
export function sameEndpoint(a: Endpoint | undefined, b: Endpoint | undefined): boolean {
  return Boolean(a && b && endpointKey(a) === endpointKey(b));
}
export function metadata(offer: { id: string; name: string; size: number }): Metadata {
  return {
    kind: 'file',
    ...offer,
    encoding: 'identity',
    hash: 'sha256-leaves-16384',
    pieceSize: PIECE,
  };
}
export const utf8Length = (s: string): number => new TextEncoder().encode(s).length;
export function check(ok: unknown, why = 'Invalid file-sharing message'): asserts ok {
  if (!ok) throw new Error(why);
}
const loneSurrogate = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u;
// Pinned Cf from https://www.unicode.org/Public/15.1.0/ucd/extracted/DerivedGeneralCategory.txt
// Avoid browser Unicode-version differences in property escapes.
const forbiddenName =
  /[/:\\\u00AD\u0600-\u0605\u061C\u06DD\u070F\u0890-\u0891\u08E2\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F\uFEFF\uFFF9-\uFFFB\u{110BD}\u{110CD}\u{13430}-\u{1343F}\u{1BCA0}-\u{1BCA3}\u{1D173}-\u{1D17A}\u{E0001}\u{E0020}-\u{E007F}]/u;
function containsControl(s: string): boolean {
  for (const c of s) {
    const n = c.codePointAt(0) ?? 0;
    if (n <= 31 || (n >= 127 && n <= 159)) return true;
  }
  return false;
}
export function validName(v: unknown): v is string {
  return (
    typeof v === 'string' &&
    utf8Length(v) >= 1 &&
    utf8Length(v) <= 255 &&
    v.normalize('NFC') === v &&
    !loneSurrogate.test(v) &&
    !forbiddenName.test(v) &&
    !containsControl(v) &&
    v !== '.' &&
    v !== '..'
  );
}
/** Bounded recursive descent: detects decoded duplicate keys before JSON.parse can merge them. */
export function strictJson(raw: string, maxBytes = 65536, maxDepth = 8, maxValues = 2048): unknown {
  check(typeof raw === 'string' && utf8Length(raw) <= maxBytes);
  let p = 0;
  let values = 0;
  const space = () => {
    while (/[\x20\t\r\n]/.test(raw[p] ?? 'x')) p++;
  };
  const string = (): string => {
    check(raw[p] === '"');
    const start = p++;
    while (p < raw.length) {
      const c = raw[p++];
      if (c === '\\') {
        p++;
        continue;
      }
      if (c === '"') {
        const s: unknown = JSON.parse(raw.slice(start, p));
        check(typeof s === 'string' && !loneSurrogate.test(s));
        return s;
      }
      check(c.charCodeAt(0) >= 32);
    }
    throw new Error('Unterminated JSON string');
  };
  const value = (depth: number): unknown => {
    check(depth <= maxDepth && ++values <= maxValues);
    space();
    if (raw[p] === '"') return string();
    if (raw[p] === '{') {
      p++;
      space();
      const out: Record<string, unknown> = Object.create(null);
      const keys = new Set<string>();
      if (raw[p] === '}') {
        p++;
        return out;
      }
      for (;;) {
        space();
        const key = string();
        check(!keys.has(key));
        keys.add(key);
        space();
        check(raw[p++] === ':');
        out[key] = value(depth + 1);
        space();
        const c = raw[p++];
        if (c === '}') return out;
        check(c === ',');
      }
    }
    if (raw[p] === '[') {
      p++;
      space();
      const out: unknown[] = [];
      if (raw[p] === ']') {
        p++;
        return out;
      }
      for (;;) {
        out.push(value(depth + 1));
        space();
        const c = raw[p++];
        if (c === ']') return out;
        check(c === ',');
      }
    }
    for (const [s, v] of [
      ['true', true],
      ['false', false],
    ] as const)
      if (raw.startsWith(s, p)) {
        p += s.length;
        return v;
      }
    const number = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/.exec(raw.slice(p));
    check(number);
    p += number[0].length;
    const n = Number(number[0]);
    check(Number.isSafeInteger(n) && /^-?(?:0|[1-9]\d*)$/.test(number[0]) && number[0] !== '-0');
    return n;
  };
  const out = value(1);
  space();
  check(p === raw.length);
  return out;
}
type Test = (v: unknown) => boolean;
export const id: Test = (v) => typeof v === 'string' && /^[a-f0-9]{32}$/.test(v);
const hash: Test = (v) => typeof v === 'string' && /^[a-f0-9]{64}$/.test(v);
export const player: Test = (v) =>
  typeof v === 'string' && /^#(0|[1-9][0-9]{0,9})$/.test(v) && Number(v.slice(1)) <= 2147483647;
export const integer =
  (min: number, max: number): Test =>
  (v) =>
    typeof v === 'number' && Number.isSafeInteger(v) && v >= min && v <= max;
const literal =
  (...xs: unknown[]): Test =>
  (v) =>
    xs.includes(v);
const str =
  (min: number, max: number): Test =>
  (v) =>
    typeof v === 'string' && !loneSurrogate.test(v) && utf8Length(v) >= min && utf8Length(v) <= max;
const ascii =
  (min: number, max: number): Test =>
  (v) =>
    str(min, max)(v) && /^[\x20-\x7e]*$/.test(String(v));
export function record(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}
export function shape(required: Record<string, Test>, optional: Record<string, Test> = {}): Test {
  return (v) =>
    record(v) &&
    Object.entries(required).every(([k, test]) => Object.hasOwn(v, k) && test(v[k])) &&
    Object.keys(v).every(
      (k) => Object.hasOwn(required, k) || (Object.hasOwn(optional, k) && optional[k](v[k])),
    );
}
const endpoint = shape({ player, endpoint: id, epoch: id });
const size = integer(0, MAX_FILE);
const gen = integer(1, 2147483647);
const time = integer(0, Number.MAX_SAFE_INTEGER);
// Unknown feature tokens are ignored locally; they never expand Phase 1 authority.
export const validFeatures: Test = (v) =>
  Array.isArray(v) &&
  v.length <= 32 &&
  v.every(
    (x, i) =>
      typeof x === 'string' && /^[a-z][a-z0-9-]{0,31}$/.test(x) && (i === 0 || v[i - 1] < x),
  );
const refs = shape({}, { offer: id, session: id, search: id });
const ack = shape({ req: id, about: ascii(1, 32), refs });
const error = shape(
  {
    about: ascii(1, 32),
    code: literal(
      'malformed',
      'too-large',
      'unsupported',
      'unavailable',
      'denied',
      'rate',
      'busy',
      'conflict',
      'stale-endpoint',
      'unknown',
      'expired',
      'closed',
      'not-found',
      'limit',
      'state',
    ),
    refs,
  },
  { req: id, retryAfterMs: integer(1000, 60000) },
);
const auth = shape({ kind: literal('offer'), offer: id });
const candidate = shape(
  { candidate: str(1, 2048) },
  { sdpMid: ascii(1, 32), sdpMLineIndex: integer(0, 15), usernameFragment: ascii(1, 256) },
);
const sig = { req: id, from: endpoint, session: id };
const peerSchemas: Record<keyof PeerInbound, Test> = {
  Ready: shape({
    req: id,
    hub: id,
    self: endpoint,
    peer: literal(1),
    files: literal(1),
    data: literal(1),
    features: (v) => validFeatures(v) && (v as string[]).includes('base'),
    maxReceiveSize: integer(0, 10737418240),
    canShare: literal(true, false),
    leaseMs: literal(30000),
    heartbeatMs: literal(10000),
  }),
  Lease: shape({ event: id, hub: id, self: endpoint, seq: gen, leaseMs: literal(30000) }),
  End: shape({
    event: id,
    self: endpoint,
    reason: literal('superseded', 'identity', 'shutdown', 'overload'),
  }),
  Capabilities: shape(
    {
      req: id,
      to: player,
      online: literal(true, false),
      peer: literal(0, 1),
      files: literal(0, 1),
      data: literal(0, 1),
      features: validFeatures,
      maxReceiveSize: integer(0, 10737418240),
      legacyV1: literal(true, false),
    },
    { target: endpoint },
  ),
  Reserved: shape(
    {
      event: id,
      peer: endpoint,
      session: id,
      initiator: endpoint,
      authorization: auth,
      capabilities: shape({
        data: literal(1),
        features: validFeatures,
        maxReceiveSize: integer(0, 10737418240),
      }),
      negotiationMs: literal(30000),
    },
    { req: id },
  ),
  Connect: shape({ ...sig, sdp: str(1, 32768) }),
  Answer: shape({ ...sig, sdp: str(1, 32768) }),
  Candidate: shape(sig, { candidate, end: literal(true) }),
  Closed: shape({
    event: id,
    peer: endpoint,
    session: id,
    reason: literal('done', 'cancelled', 'failed', 'protocol', 'timeout', 'revoked', 'offline'),
  }),
  Ack: ack,
  Error: error,
};
const fileSchemas: Record<keyof FilesInbound, Test> = {
  Offer: shape({
    req: id,
    from: endpoint,
    offer: id,
    id: hash,
    name: validName,
    size,
    expiresAt: time,
  }),
  Offered: shape({ req: id, offer: id, target: endpoint, expiresAt: time }),
  OfferState: shape({
    event: id,
    offer: id,
    sender: endpoint,
    receiver: endpoint,
    state: literal(
      'pending',
      'accepted',
      'rejected',
      'withdrawn',
      'cancelled',
      'expired',
      'received',
      'revoked',
    ),
    expiresAt: time,
  }),
  Revoke: shape(
    {
      event: id,
      peer: endpoint,
      scope: literal('peer', 'offer'),
      reason: literal('policy', 'offline', 'identity', 'expired'),
    },
    { offer: id },
  ),
  Ack: ack,
  Error: error,
};
export function knownInbound(packageName: string, kind: string): boolean {
  return Object.hasOwn(packageName === 'Client.Peer' ? peerSchemas : fileSchemas, kind);
}
export function validatePeer<K extends keyof PeerInbound>(kind: K, v: unknown): PeerInbound[K] {
  check(peerSchemas[kind]?.(v));
  const data = v as PeerInbound[K];
  if (kind === 'Capabilities') {
    const c = data as Capabilities;
    check(
      c.target
        ? c.online &&
            c.target.player === c.to &&
            c.peer === 1 &&
            c.files === 1 &&
            c.data === 1 &&
            c.features.includes('base') &&
            !c.legacyV1
        : c.peer === 0 &&
            c.files === 0 &&
            c.data === 0 &&
            c.maxReceiveSize === 0 &&
            c.features.length === 0 &&
            (c.online || !c.legacyV1),
    );
  }
  if (kind === 'Candidate') {
    const c = data as PeerInbound['Candidate'];
    check(Boolean(c.candidate) !== Boolean(c.end));
    if (c.candidate)
      check(c.candidate.sdpMid !== undefined || c.candidate.sdpMLineIndex !== undefined);
  }
  if (kind === 'Error') validateError(data as WireError);
  return data;
}
export function validateFiles<K extends keyof FilesInbound>(kind: K, v: unknown): FilesInbound[K] {
  check(fileSchemas[kind]?.(v));
  if (kind === 'Revoke') {
    const r = v as FilesInbound['Revoke'];
    check((r.scope === 'offer') === Boolean(r.offer));
  }
  if (kind === 'Error') validateError(v as WireError);
  return v as FilesInbound[K];
}
function validateError(e: WireError): void {
  check((e.code === 'rate' || e.code === 'busy') === (e.retryAfterMs !== undefined));
}
export function validMetadata(v: unknown): v is Metadata {
  return shape({
    kind: literal('file'),
    id: hash,
    size,
    name: validName,
    encoding: literal('identity'),
    hash: literal('sha256-leaves-16384'),
    pieceSize: literal(PIECE),
  })(v);
}
export function validateSdp(sdp: string): void {
  check(str(1, 32768)(sdp) && !/^m=(audio|video)\s/m.test(sdp));
  const fingerprints = [...sdp.matchAll(/^a=fingerprint:([^\r\n]+)\r?$/gm)].map((m) => m[1]);
  const media = [...sdp.matchAll(/^m=([^\r\n]+)/gm)].map((m) => m[1]);
  check(
    fingerprints.length > 0 &&
      new Set(fingerprints).size === 1 &&
      media.length === 1 &&
      /^application\s/.test(media[0]),
  );
}
