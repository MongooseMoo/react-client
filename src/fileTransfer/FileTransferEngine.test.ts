import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { performance } from 'node:perf_hooks';

import { computeContentId } from './contentId';
import { FileTransferEngine, type FileTransferEngineOptions } from './FileTransferEngine';
import { createMemoryTransferStorage } from './storage';
import {
  createGatedStorage,
  LinkNetwork,
  polyfillBlobArrayBuffer,
  SignalingHub,
  type FakeLink,
} from './testHarness';
import type {
  FileTransferErrorCode,
  ReceivedFile,
  TransferSnapshot,
  TransferState,
  TransferStorage,
} from './types';
import { MAX_HELD_CANDIDATES } from './types';
import { encodeFrame, PIECE_SIZE, SEND_WINDOW, STORED_REPORT_INTERVAL } from './wire';

polyfillBlobArrayBuffer();

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const SOME_OFFER: RTCSessionDescriptionInit = { type: 'offer', sdp: 'not a real link' };

interface Peer {
  name: string;
  engine: FileTransferEngine;
  storage: TransferStorage;
  delivered: ReceivedFile[];
  changes: TransferSnapshot[];
}

let hub: SignalingHub;
let network: LinkNetwork;
let peers: Peer[];
/** Each published snapshot beside a copy taken when it was published. */
let published: Array<{ snapshot: TransferSnapshot; asPublished: TransferSnapshot }>;

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  hub = new SignalingHub();
  network = new LinkNetwork();
  peers = [];
  published = [];
});

afterEach(() => {
  for (const { engine } of peers) engine.dispose();
  const timersLeft = vi.getTimerCount();
  vi.useRealTimers();

  expect(timersLeft).toBe(0);
  for (const { snapshot, asPublished } of published) {
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(snapshot).toEqual(asPublished);
  }
});

function peer(name: string, options: Partial<FileTransferEngineOptions> = {}): Peer {
  const storage = options.storage ?? createMemoryTransferStorage();
  const delivered: ReceivedFile[] = [];
  const changes: TransferSnapshot[] = [];
  const engine = new FileTransferEngine({
    signaling: hub.peer(name),
    createLink: network.factory(name),
    deliver: (file) => {
      delivered.push(file);
    },
    ...options,
    storage,
  });
  engine.on('change', (snapshot) => {
    changes.push(snapshot);
    published.push({ snapshot, asPublished: { ...snapshot } });
  });
  const made = { name, engine, storage, delivered, changes };
  peers.push(made);
  return made;
}

/** One turn of the real event loop: hashing and file reading finish on it, not on microtasks. */
function turn(): Promise<void> {
  return new Promise((resolve) => setImmediate(resolve));
}

async function until<T>(probe: () => T | undefined | null | false, what: string): Promise<T> {
  // Native hashing/file reads run beside the controlled engine timers. A turn
  // count can expire before those operations finish on a busy CI worker.
  const deadline = performance.now() + 2 * SECOND;
  while (performance.now() < deadline) {
    const found = probe();
    if (found) return found;
    await turn();
  }
  throw new Error(`Timed out waiting until ${what}`);
}

/** Long enough for anything already in motion to play out. */
async function quiet(): Promise<void> {
  for (let turns = 0; turns < 40; turns++) await turn();
}

function bytesOf(size: number, seed = 0): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(size);
  for (let i = 0; i < size; i++) bytes[i] = (i * 31 + (i >>> 8) + seed) & 0xff;
  return bytes;
}

function fileOf(size: number, name = 'notes.bin', seed = 0): File {
  return new File([bytesOf(size, seed)], name);
}

async function contentOf(blob: Blob): Promise<Uint8Array> {
  return new Uint8Array(await blob.arrayBuffer());
}

/** For megabytes of content, where a matcher comparing element by element takes too long. */
function sameBytes(one: Uint8Array, other: Uint8Array): boolean {
  return one.length === other.length && one.every((byte, index) => byte === other[index]);
}

function idOf(n: number): string {
  return n.toString(16).padStart(64, '0');
}

/** A transfer as its peer last published it, whether or not the peer still lists it. */
function current(of: Peer, key: string): TransferSnapshot {
  const found = of.changes.findLast((snapshot) => snapshot.key === key);
  if (!found) throw new Error(`${of.name} has published no transfer ${key}`);
  return found;
}

function lists(of: Peer, key: string): boolean {
  return of.engine.transfers().some((transfer) => transfer.key === key);
}

/** The states a peer published for one transfer, consecutive repeats (progress) removed. */
function states(of: Peer, key: string): TransferState[] {
  return of.changes
    .filter((snapshot) => snapshot.key === key)
    .map((snapshot) => snapshot.state)
    .filter((state, index, all) => state !== all[index - 1]);
}

function errorCode(of: Peer, key: string): FileTransferErrorCode | undefined {
  return current(of, key).error?.code;
}

function reaches(of: Peer, key: string, state: TransferState): Promise<unknown> {
  return until(() => current(of, key).state === state, `${of.name}'s ${key} is ${state}`);
}

function undecided(of: Peer): TransferSnapshot[] {
  return of.engine
    .transfers()
    .filter((transfer) => transfer.direction === 'receive' && transfer.state === 'offered');
}

function incomingOffer(of: Peer, name?: string): Promise<TransferSnapshot> {
  return until(
    () => undecided(of).find((transfer) => name === undefined || transfer.name === name),
    `${of.name} is offered ${name ?? 'a file'}`,
  );
}

/** Sends and accepts; returns both sides' first snapshots. */
async function exchange(from: Peer, to: Peer, file: File) {
  const sent = await from.engine.send(file, to.name);
  const offer = await incomingOffer(to, file.name);
  await to.engine.accept(offer.key);
  return { sent, offer };
}

async function transfer(from: Peer, to: Peer, file: File) {
  const keys = await exchange(from, to, file);
  await reaches(from, keys.sent.key, 'complete');
  await reaches(to, keys.offer.key, 'complete');
  return keys;
}

/** Lets `count` pieces through `link`-matching links of `owner`, then gives the rest `verdict`. */
function afterPieces(owner: string, count: number, verdict: 'hold' | 'stall', linkIndex = 0): void {
  let seen = 0;
  network.tap = (link, type) =>
    link === network.linksOf(owner)[linkIndex] && type === 'piece' && ++seen > count
      ? verdict
      : 'pass';
}

function receivedBytes(of: Peer, key: string): number {
  return current(of, key).transferredBytes;
}

function heldBy(of: Peer, from: string, id: string): Promise<number[]> {
  return of.storage.heldPieces({ from, id });
}

describe('a transfer from start to finish', () => {
  it.each([
    ['several pieces with a short last one', 3 * PIECE_SIZE + 5],
    ['an empty file', 0],
    ['an exact multiple of the piece size', 2 * PIECE_SIZE],
    ['a single byte', 1],
  ])('delivers %s byte for byte', async (_label, size) => {
    const alice = peer('alice');
    const bob = peer('bob');
    const file = fileOf(size);

    const { sent, offer } = await transfer(alice, bob, file);

    expect(bob.delivered).toHaveLength(1);
    const [received] = bob.delivered;
    expect(received.from).toBe('alice');
    expect(received.name).toBe('notes.bin');
    expect(received.id).toBe(await computeContentId(file));
    expect(await contentOf(received.blob)).toEqual(bytesOf(size));
    expect(current(alice, sent.key)).toMatchObject({ id: received.id, transferredBytes: size });
    expect(current(bob, offer.key)).toMatchObject({ id: received.id, transferredBytes: size });
    expect(await heldBy(bob, 'alice', received.id)).toEqual([]);
  });

  it('publishes each side passing through its states in order', async () => {
    const alice = peer('alice');
    const bob = peer('bob');

    const { sent, offer } = await transfer(alice, bob, fileOf(3 * PIECE_SIZE + 5));

    expect(states(alice, sent.key)).toEqual([
      'preparing',
      'offered',
      'connecting',
      'transferring',
      'verifying',
      'complete',
    ]);
    expect(states(bob, offer.key)).toEqual([
      'offered',
      'connecting',
      'transferring',
      'verifying',
      'complete',
    ]);
  });

  it('reports progress piece by piece on both sides', async () => {
    const alice = peer('alice');
    const bob = peer('bob');
    const size = 2 * PIECE_SIZE + 7;

    const { sent, offer } = await transfer(alice, bob, fileOf(size));

    const progress = (of: Peer, key: string) =>
      of.changes
        .filter((snapshot) => snapshot.key === key && snapshot.state === 'transferring')
        .map((snapshot) => snapshot.transferredBytes);
    expect(progress(alice, sent.key)).toEqual([0, PIECE_SIZE, 2 * PIECE_SIZE, size]);
    expect(progress(bob, offer.key)).toEqual([0, PIECE_SIZE, 2 * PIECE_SIZE, size]);
  });

  it('does not know the id while preparing and resolves send once the offer is out', async () => {
    const alice = peer('alice');
    peer('bob');
    const file = fileOf(10);

    const sending = alice.engine.send(file, 'bob');
    const [preparing] = alice.engine.transfers();
    const sent = await sending;

    expect(preparing).toMatchObject({ state: 'preparing', id: '', peer: 'bob', direction: 'send' });
    expect(sent).toMatchObject({ key: preparing.key, state: 'offered', name: 'notes.bin', size: 10 });
    expect(sent.id).toBe(await computeContentId(file));
    expect(hub.sentOf('offer')).toHaveLength(1);
  });

  it('calls the sender complete only once the receiver said so', async () => {
    const alice = peer('alice');
    const bob = peer('bob');
    network.tap = (_link, type) => (type === 'complete' ? 'hold' : 'pass');

    const { sent, offer } = await exchange(alice, bob, fileOf(PIECE_SIZE + 1));
    await reaches(bob, offer.key, 'complete');
    await quiet();

    expect(bob.delivered).toHaveLength(1);
    expect(current(alice, sent.key).state).toBe('verifying');

    network.linksOf('bob')[0].release();
    await reaches(alice, sent.key, 'complete');
    await quiet();
    expect(bob.delivered).toHaveLength(1);
  });

  it('lists transfers oldest first, finished ones included', async () => {
    const alice = peer('alice');
    const bob = peer('bob');

    await transfer(alice, bob, fileOf(5, 'first.bin', 1));
    await alice.engine.send(fileOf(6, 'second.bin', 2), 'bob');

    expect(alice.engine.transfers().map(({ name, state }) => [name, state])).toEqual([
      ['first.bin', 'complete'],
      ['second.bin', 'offered'],
    ]);
  });
});

describe('declining and cancelling', () => {
  it('ends both sides as rejected when the receiver rejects', async () => {
    const alice = peer('alice');
    const bob = peer('bob');
    const sent = await alice.engine.send(fileOf(10), 'bob');
    const offer = await incomingOffer(bob);

    bob.engine.reject(offer.key);
    await reaches(alice, sent.key, 'rejected');

    expect(states(bob, offer.key)).toEqual(['offered', 'rejected']);
    expect(states(alice, sent.key)).toEqual(['preparing', 'offered', 'rejected']);
    expect(network.linksOf('alice')[0].closed).toBe(true);
    expect(network.linksOf('bob')).toEqual([]);
  });

  it('stops a send cancelled while preparing without signalling anything', async () => {
    const alice = peer('alice');
    peer('bob');

    const sending = alice.engine.send(fileOf(3 * PIECE_SIZE), 'bob');
    alice.engine.cancel(alice.engine.transfers()[0].key);
    const result = await sending;
    await quiet();

    expect(result.state).toBe('cancelled');
    expect(states(alice, result.key)).toEqual(['preparing', 'cancelled']);
    expect(hub.sent).toEqual([]);
    expect(network.links).toEqual([]);
  });

  it('cancels an unanswered offer from the sending side', async () => {
    const alice = peer('alice');
    const bob = peer('bob');
    const sent = await alice.engine.send(fileOf(10), 'bob');
    const offer = await incomingOffer(bob);

    alice.engine.cancel(sent.key);
    await reaches(bob, offer.key, 'cancelled');

    expect(current(alice, sent.key).state).toBe('cancelled');
    expect(network.linksOf('alice')[0].closed).toBe(true);
  });

  it('treats the receiver cancelling an undecided offer as a rejection', async () => {
    const alice = peer('alice');
    const bob = peer('bob');
    const sent = await alice.engine.send(fileOf(10), 'bob');
    const offer = await incomingOffer(bob);

    bob.engine.cancel(offer.key);
    await reaches(alice, sent.key, 'rejected');

    expect(current(bob, offer.key).state).toBe('rejected');
    expect(hub.sentOf('cancel')).toEqual([]);
  });

  it('cancels from the sending side while connecting', async () => {
    const alice = peer('alice');
    const bob = peer('bob');
    network.tap = (_link, type) => (type === 'ready' ? 'hold' : 'pass');
    const { sent, offer } = await exchange(alice, bob, fileOf(PIECE_SIZE + 1));
    await reaches(bob, offer.key, 'transferring');
    expect(current(alice, sent.key).state).toBe('connecting');

    alice.engine.cancel(sent.key);
    await reaches(bob, offer.key, 'cancelled');

    expect(current(alice, sent.key).state).toBe('cancelled');
    expect(network.links.every((link) => link.closed)).toBe(true);
  });

  it('cancels from the receiving side while connecting', async () => {
    const alice = peer('alice');
    const bob = peer('bob');
    hub.drop = (signal) => signal.kind === 'answer';
    const { sent, offer } = await exchange(alice, bob, fileOf(PIECE_SIZE + 1));
    expect(current(bob, offer.key).state).toBe('connecting');

    bob.engine.cancel(offer.key);
    await reaches(alice, sent.key, 'cancelled');

    expect(current(bob, offer.key).state).toBe('cancelled');
    expect(network.links.every((link) => link.closed)).toBe(true);
  });

  it('cancels from the sending side while transferring and empties the receiver', async () => {
    const alice = peer('alice');
    const bob = peer('bob');
    afterPieces('alice', 1, 'stall');
    const { sent, offer } = await exchange(alice, bob, fileOf(3 * PIECE_SIZE));
    await until(() => receivedBytes(bob, offer.key) === PIECE_SIZE, 'bob holds one piece');
    expect(current(alice, sent.key).state).toBe('transferring');

    alice.engine.cancel(sent.key);
    await reaches(bob, offer.key, 'cancelled');
    await quiet();

    expect(current(alice, sent.key).state).toBe('cancelled');
    expect(await heldBy(bob, 'alice', sent.id)).toEqual([]);
    expect(bob.delivered).toEqual([]);
  });

  it('cancels from the receiving side while transferring and empties its storage', async () => {
    const alice = peer('alice');
    const bob = peer('bob');
    afterPieces('alice', 1, 'stall');
    const { sent, offer } = await exchange(alice, bob, fileOf(3 * PIECE_SIZE));
    await until(() => receivedBytes(bob, offer.key) === PIECE_SIZE, 'bob holds one piece');

    bob.engine.cancel(offer.key);
    await reaches(alice, sent.key, 'cancelled');
    await quiet();

    expect(current(bob, offer.key).state).toBe('cancelled');
    expect(await heldBy(bob, 'alice', sent.id)).toEqual([]);
    expect(states(alice, sent.key).at(-1)).toBe('cancelled');
  });

  it('ignores cancel and reject of a finished transfer and refuses unknown keys', async () => {
    const alice = peer('alice');
    const bob = peer('bob');
    const { sent, offer } = await transfer(alice, bob, fileOf(10));
    const signalsBefore = hub.sent.length;

    alice.engine.cancel(sent.key);
    bob.engine.cancel(offer.key);
    bob.engine.reject(offer.key);

    expect(current(alice, sent.key).state).toBe('complete');
    expect(current(bob, offer.key).state).toBe('complete');
    expect(hub.sent).toHaveLength(signalsBefore);
    expect(() => alice.engine.cancel('nope')).toThrow(
      expect.objectContaining({ code: 'unknown-transfer' }),
    );
    expect(() => alice.engine.reject('nope')).toThrow(
      expect.objectContaining({ code: 'unknown-transfer' }),
    );
  });

  it('accepts and rejects only an undecided incoming offer', async () => {
    const alice = peer('alice');
    const bob = peer('bob');
    const sent = await alice.engine.send(fileOf(10), 'bob');
    const offer = await incomingOffer(bob);
    const unknown = expect.objectContaining({ code: 'unknown-transfer' });

    await expect(alice.engine.accept(sent.key)).rejects.toEqual(unknown);
    await expect(alice.engine.accept('nope')).rejects.toEqual(unknown);
    expect(() => alice.engine.reject(sent.key)).toThrow(unknown);
    expect(current(alice, sent.key).state).toBe('offered');

    await bob.engine.accept(offer.key);
    await expect(bob.engine.accept(offer.key)).rejects.toEqual(unknown);
    expect(() => bob.engine.reject(offer.key)).toThrow(unknown);
    expect(current(bob, offer.key).state).not.toBe('rejected');
  });
});

describe('consent', () => {
  it('creates no link on the receiving side before the user accepts', async () => {
    const alice = peer('alice');
    const bob = peer('bob');
    await alice.engine.send(fileOf(10), 'bob');
    const offer = await incomingOffer(bob);
    await quiet();

    expect(network.linksOf('bob')).toEqual([]);
    expect(hub.sentOf('answer')).toEqual([]);

    await bob.engine.accept(offer.key);
    expect(network.linksOf('bob')).toHaveLength(1);
  });

  it('holds candidates that arrive before acceptance and applies them after', async () => {
    const alice = peer('alice');
    const bob = peer('bob');
    await alice.engine.send(fileOf(10), 'bob');
    const offer = await incomingOffer(bob);
    const [aliceLink] = network.linksOf('alice');

    aliceLink.emitCandidate({ candidate: 'one' });
    aliceLink.emitCandidate({ candidate: 'unusable' });
    aliceLink.emitCandidate({ candidate: 'two' });
    await quiet();
    await bob.engine.accept(offer.key);
    await reaches(bob, offer.key, 'complete');

    expect(network.linksOf('bob')[0].candidates).toEqual([{ candidate: 'one' }, { candidate: 'two' }]);
  });

  it('holds at most 64 candidates for an undecided offer', async () => {
    const bob = peer('bob');
    const mallory = hub.peer('mallory');
    mallory.sendOffer('bob', { id: idOf(1), name: 'a', size: 1 }, SOME_OFFER, 'first');
    for (let n = 0; n < 70; n++) mallory.sendCandidate('bob', idOf(1), { candidate: `c${n}` });
    const offer = await incomingOffer(bob);

    await bob.engine.accept(offer.key).catch(() => undefined);

    const [link] = network.linksOf('bob');
    expect(link.candidates).toHaveLength(64);
    expect(link.candidates.at(-1)).toEqual({ candidate: 'c63' });
  });

  it('passes candidates on in both directions once the link exists, and drops strays', async () => {
    const alice = peer('alice');
    const bob = peer('bob');
    network.tap = (_link, type) => (type === 'piece' ? 'hold' : 'pass');
    const { sent } = await exchange(alice, bob, fileOf(10));
    const [aliceLink] = network.linksOf('alice');
    const [bobLink] = network.linksOf('bob');

    aliceLink.emitCandidate({ candidate: 'from alice' });
    bobLink.emitCandidate({ candidate: 'from bob' });
    hub.peer('mallory').sendCandidate('bob', sent.id, { candidate: 'from a stranger' });
    hub.peer('alice').sendCandidate('bob', idOf(9), { candidate: 'for nothing' });
    await quiet();

    expect(bobLink.candidates).toEqual([{ candidate: 'from alice' }]);
    expect(aliceLink.candidates).toEqual([{ candidate: 'from bob' }]);
  });
});

describe('an offer is untrusted', () => {
  it.each([
    ['an id that is not 64 lower-case hex characters', { id: 'A'.repeat(64), name: 'a', size: 1 }],
    ['a short id', { id: 'abc', name: 'a', size: 1 }],
    ['a negative size', { id: idOf(1), name: 'a', size: -1 }],
    ['a fractional size', { id: idOf(1), name: 'a', size: 1.5 }],
    ['a size that is not a number', { id: idOf(1), name: 'a', size: NaN }],
    ['a size beyond safe integers', { id: idOf(1), name: 'a', size: 2 ** 53 }],
  ])('ignores an offer with %s', async (_label, offer) => {
    const bob = peer('bob');

    hub.peer('mallory').sendOffer('bob', offer, SOME_OFFER, 'first');
    await quiet();

    expect(bob.engine.transfers()).toEqual([]);
    expect(hub.sent).toHaveLength(1);
  });

  it.each([
    ['../../etc/passwd', 'passwd'],
    ['C:\\Users\\bob\\evil.exe', 'evil.exe'],
    ['...hidden', 'hidden'],
    ['dir/.profile', 'profile'],
    ['a\u0000b\nc\u007f.txt', 'abc.txt'],
    ['\u0001.\u0002.rc', 'rc'],
    ['', 'download'],
    ['..', 'download'],
    ['secret/', 'download'],
  ])('shows the name %j as %j', async (offered, shown) => {
    const bob = peer('bob');

    hub.peer('mallory').sendOffer('bob', { id: idOf(1), name: offered, size: 1 }, SOME_OFFER, 'first');

    expect((await incomingOffer(bob)).name).toBe(shown);
  });

  it('delivers under the sanitised name', async () => {
    const alice = peer('alice');
    const bob = peer('bob');

    const sent = await alice.engine.send(fileOf(10, '../up/.bashrc'), 'bob');
    await bob.engine.accept((await incomingOffer(bob, 'bashrc')).key);
    await reaches(alice, sent.key, 'complete');

    expect(bob.delivered[0].name).toBe('bashrc');
    expect(current(alice, sent.key).name).toBe('../up/.bashrc');
  });

  it('rejects an offer above the size limit and records nothing', async () => {
    const alice = peer('alice');
    const bob = peer('bob', { maxFileSize: PIECE_SIZE });

    const sent = await alice.engine.send(fileOf(PIECE_SIZE + 1), 'bob');
    await reaches(alice, sent.key, 'rejected');

    expect(bob.engine.transfers()).toEqual([]);
    expect(bob.changes).toEqual([]);
    expect(network.linksOf('bob')).toEqual([]);
  });

  it('refuses to send a file above the size limit without creating a transfer', async () => {
    const alice = peer('alice', { maxFileSize: 10 });

    await expect(alice.engine.send(fileOf(11), 'bob')).rejects.toMatchObject({ code: 'too-large' });

    expect(alice.engine.transfers()).toEqual([]);
    expect(alice.changes).toEqual([]);
  });

  it('keeps four undecided offers per peer by default, and leaves room for other peers', async () => {
    const alice = peer('alice');
    const bob = peer('bob');
    const mallory = hub.peer('mallory');

    for (let n = 1; n <= 6; n++) {
      mallory.sendOffer('bob', { id: idOf(n), name: `spam${n}`, size: 1 }, SOME_OFFER, 'first');
    }
    await quiet();
    const sent = await alice.engine.send(fileOf(10, 'wanted.bin'), 'bob');
    await bob.engine.accept((await incomingOffer(bob, 'wanted.bin')).key);
    await reaches(alice, sent.key, 'complete');

    expect(undecided(bob).map((offer) => offer.name)).toEqual(['spam1', 'spam2', 'spam3', 'spam4']);
    expect(hub.sentOf('reject').map((signal) => signal.id)).toEqual([idOf(5), idOf(6)]);
    expect(bob.changes.map((snapshot) => snapshot.name)).not.toContain('spam5');
  });

  it('keeps no more undecided offers per peer than it is told to', async () => {
    const bob = peer('bob', { maxPendingOffersPerPeer: 1 });

    for (const from of ['mallory', 'mallory', 'trudy']) {
      const n = hub.sent.length + 1;
      hub.peer(from).sendOffer('bob', { id: idOf(n), name: `${from}${n}`, size: 1 }, SOME_OFFER, 'first');
    }
    await quiet();

    expect(undecided(bob).map((offer) => offer.name)).toEqual(['mallory1', 'trudy3']);
  });

  it('bounds the undecided offers of all peers together', async () => {
    const bob = peer('bob', { maxPendingOffersOverall: 3 });

    for (const [n, from] of ['p1', 'p2', 'p3', 'p4'].entries()) {
      hub.peer(from).sendOffer('bob', { id: idOf(n), name: from, size: 1 }, SOME_OFFER, 'first');
    }
    await quiet();

    expect(undecided(bob).map((offer) => offer.peer)).toEqual(['p1', 'p2', 'p3']);
    expect(hub.sentOf('reject')).toEqual([{ kind: 'reject', from: 'bob', to: 'p4', id: idOf(3) }]);
  });

  it('lets an offer the user never decided on expire, making room again', async () => {
    const bob = peer('bob', { offerTimeoutMs: MINUTE, maxPendingOffersPerPeer: 1 });
    const mallory = hub.peer('mallory');
    mallory.sendOffer('bob', { id: idOf(1), name: 'ignored', size: 1 }, SOME_OFFER, 'first');
    const ignored = await incomingOffer(bob);

    vi.advanceTimersByTime(MINUTE - 1);
    expect(current(bob, ignored.key).state).toBe('offered');
    vi.advanceTimersByTime(1);

    expect(current(bob, ignored.key)).toMatchObject({ state: 'failed' });
    expect(errorCode(bob, ignored.key)).toBe('timeout');
    expect(bob.engine.transfers()).toEqual([]);
    expect(hub.sentOf('reject')).toEqual([{ kind: 'reject', from: 'bob', to: 'mallory', id: idOf(1) }]);

    mallory.sendOffer('bob', { id: idOf(2), name: 'next', size: 1 }, SOME_OFFER, 'first');
    expect((await incomingOffer(bob)).name).toBe('next');
  });

  it('releases a sender whose offer expired unanswered at the receiver', async () => {
    const alice = peer('alice');
    const bob = peer('bob', { offerTimeoutMs: MINUTE });
    const sent = await alice.engine.send(fileOf(10), 'bob');
    await incomingOffer(bob);

    vi.advanceTimersByTime(MINUTE);
    await reaches(alice, sent.key, 'rejected');

    expect(network.linksOf('bob')).toEqual([]);
  });

  it.each([
    ['a bidirectional override', 'invoice‮fdp.exe', 'invoicefdp.exe'],
    ['isolates and zero-width characters', '⁦a​b‍﻿c⁩.txt', 'abc.txt'],
    ['a zero-width character before a leading dot', '​.hidden', 'hidden'],
  ])('strips %s from a name', async (_label, offered, shown) => {
    const bob = peer('bob');

    hub.peer('mallory').sendOffer('bob', { id: idOf(1), name: offered, size: 1 }, SOME_OFFER, 'first');

    expect((await incomingOffer(bob)).name).toBe(shown);
  });

  it.each([
    ['a long name, plainly', 'a'.repeat(200000), 'a'.repeat(255)],
    ['a padded name, keeping the extension it really has', `report.pdf${' '.repeat(300)}.exe`, `report.pdf${' '.repeat(241)}.exe`],
    ['a name whose extension is itself too long, plainly', `a.${'b'.repeat(400)}`, `a.${'b'.repeat(253)}`],
    ['a long name by characters, not code units', '😀'.repeat(300), '😀'.repeat(255)],
  ])('cuts %s to 255 characters', async (_label, offered, shown) => {
    const bob = peer('bob');

    hub.peer('mallory').sendOffer('bob', { id: idOf(1), name: offered, size: 1 }, SOME_OFFER, 'first');

    expect((await incomingOffer(bob)).name).toBe(shown);
  });

  it('keeps the newest description of an offer repeated before the user decided', async () => {
    const alice = peer('alice');
    const bob = peer('bob');
    const file = fileOf(PIECE_SIZE + 1);
    const sent = await alice.engine.send(file, 'bob');
    const offer = await incomingOffer(bob);
    const stale = hub.peer('alice');

    stale.sendCandidate('bob', sent.id, { candidate: 'for the first description' });
    stale.sendOffer('bob', { id: sent.id, name: file.name, size: file.size }, SOME_OFFER, 'first');
    stale.sendOffer('bob', hubOffer(0).offer, hubOffer(0).description, 'first');
    await quiet();

    expect(bob.changes).toHaveLength(1);
    await bob.engine.accept(offer.key);
    await reaches(bob, offer.key, 'complete');
    expect(network.linksOf('bob')[0].candidates).toEqual([]);
  });
});

function hubOffer(index: number) {
  const signal = hub.sentOf('offer')[index];
  if (signal?.kind !== 'offer') throw new Error(`No offer number ${index} was signalled`);
  return signal;
}

describe('a request', () => {
  it('is rejected by a client that shares nothing', async () => {
    peer('alice');
    const bob = peer('bob');

    hub.peer('alice').sendRequest('bob', idOf(1));
    await quiet();

    expect(hub.sentOf('reject')).toEqual([{ kind: 'reject', from: 'bob', to: 'alice', id: idOf(1) }]);
    expect(bob.engine.transfers()).toEqual([]);
  });
});

describe('a peer that breaks the rules', () => {
  /** Runs a transfer in which the first frame of `type` sent by `owner` is replaced. */
  async function withReplaced(
    owner: string,
    type: 'piece' | 'ready',
    replacement: (original: ArrayBuffer) => ArrayBuffer,
  ) {
    const alice = peer('alice');
    const bob = peer('bob');
    let replaced = false;
    network.tap = (link, frameType, data) => {
      if (replaced || link.owner !== owner || frameType !== type) return 'pass';
      replaced = true;
      return replacement(data);
    };
    const { sent, offer } = await exchange(alice, bob, fileOf(3 * PIECE_SIZE));
    await reaches(alice, sent.key, 'failed');
    await reaches(bob, offer.key, 'failed');
    await quiet();
    return { alice, bob, sent, offer };
  }

  it('fails both sides with integrity when a piece was altered, and delivers nothing', async () => {
    const alice = peer('alice');
    const bob = peer('bob');
    let pieces = 0;
    network.tap = (_link, type, data) => {
      if (type !== 'piece' || ++pieces !== 2) return 'pass';
      const altered = new Uint8Array(data.slice(0));
      altered[altered.length - 1] ^= 0xff;
      return altered.buffer;
    };

    const { sent, offer } = await exchange(alice, bob, fileOf(3 * PIECE_SIZE));
    await reaches(alice, sent.key, 'failed');
    await quiet();

    expect(errorCode(bob, offer.key)).toBe('integrity');
    expect(errorCode(alice, sent.key)).toBe('integrity');
    expect(states(bob, offer.key)).toEqual(['offered', 'connecting', 'transferring', 'verifying', 'failed']);
    expect(bob.delivered).toEqual([]);
    expect(await heldBy(bob, 'alice', sent.id)).toEqual([]);
    expect(network.links.every((link) => link.closed)).toBe(true);
  });

  it.each([
    [
      'a piece of the wrong length',
      () => encodeFrame({ type: 'piece', index: 0, bytes: new ArrayBuffer(PIECE_SIZE - 1) }),
    ],
    [
      'a piece index outside the file, as a frame from an old build decodes to',
      () => encodeFrame({ type: 'piece', index: 0x0100007b, bytes: new ArrayBuffer(PIECE_SIZE) }),
    ],
    ['a frame that cannot be decoded', () => new Uint8Array([200, 1, 2, 3]).buffer],
    ['a ready frame', () => encodeFrame({ type: 'ready', have: [] })],
    ['a complete frame', () => encodeFrame({ type: 'complete' })],
  ])('fails both sides with protocol when the receiver gets %s', async (_label, frame) => {
    const { alice, bob, sent, offer } = await withReplaced('alice', 'piece', frame);

    expect(errorCode(bob, offer.key)).toBe('protocol');
    expect(errorCode(alice, sent.key)).toBe('protocol');
    expect(bob.delivered).toEqual([]);
    expect(await heldBy(bob, 'alice', sent.id)).toEqual([]);
    expect(network.linksOf('bob')[0].count('abort')).toBe(1);
  });

  it.each([
    [
      'a piece',
      () => encodeFrame({ type: 'piece', index: 0, bytes: new ArrayBuffer(PIECE_SIZE) }),
    ],
    ['ready ranges outside the file', () => encodeFrame({ type: 'ready', have: [[0, 999]] })],
    [
      'ready ranges that overlap',
      () =>
        encodeFrame({
          type: 'ready',
          have: [
            [0, 2],
            [1, 3],
          ],
        }),
    ],
    ['a frame that cannot be decoded', () => new Uint8Array([200]).buffer],
  ])('fails both sides with protocol when the sender gets %s', async (_label, frame) => {
    const { alice, bob, sent, offer } = await withReplaced('bob', 'ready', frame);

    expect(errorCode(alice, sent.key)).toBe('protocol');
    expect(errorCode(bob, offer.key)).toBe('protocol');
    expect(network.linksOf('alice')[0].count('abort')).toBe(1);
    expect(network.linksOf('alice')[0].count('piece')).toBe(0);
  });

  it('fails the sender with protocol when ready arrives twice', async () => {
    const alice = peer('alice');
    const bob = peer('bob');
    afterPieces('alice', 0, 'stall');
    const { sent } = await exchange(alice, bob, fileOf(PIECE_SIZE));
    await reaches(alice, sent.key, 'transferring');

    network.linksOf('alice')[0].handlers.onFrame(encodeFrame({ type: 'ready', have: [] }));
    await reaches(alice, sent.key, 'failed');

    expect(errorCode(alice, sent.key)).toBe('protocol');
  });

  it('treats an abort reason it does not know as a protocol failure', async () => {
    const alice = peer('alice');
    const bob = peer('bob');
    afterPieces('alice', 0, 'stall');
    const { sent } = await exchange(alice, bob, fileOf(PIECE_SIZE));
    await reaches(alice, sent.key, 'transferring');

    network.linksOf('alice')[0].handlers.onFrame(encodeFrame({ type: 'abort', reason: 'too-large' }));
    await reaches(alice, sent.key, 'failed');

    expect(errorCode(alice, sent.key)).toBe('protocol');
  });

  it('fails with protocol when a piece arrives before the receiver said it was ready', async () => {
    const alice = peer('alice');
    const bob = peer('bob');
    hub.drop = (signal) => signal.kind === 'answer';
    const { offer } = await exchange(alice, bob, fileOf(PIECE_SIZE));

    const early = encodeFrame({ type: 'piece', index: 0, bytes: new ArrayBuffer(PIECE_SIZE) });
    network.linksOf('bob')[0].handlers.onFrame(early);
    await reaches(bob, offer.key, 'failed');

    expect(errorCode(bob, offer.key)).toBe('protocol');
    expect(await heldBy(bob, 'alice', offer.id)).toEqual([]);
  });

  it('ignores a piece it already holds', async () => {
    const alice = peer('alice');
    const bob = peer('bob');
    afterPieces('alice', 1, 'hold');
    const file = fileOf(2 * PIECE_SIZE);
    const { sent, offer } = await exchange(alice, bob, file);
    await until(() => receivedBytes(bob, offer.key) === PIECE_SIZE, 'bob holds one piece');
    const changesBefore = bob.changes.length;

    const again = encodeFrame({ type: 'piece', index: 0, bytes: new ArrayBuffer(PIECE_SIZE) });
    network.linksOf('bob')[0].handlers.onFrame(again);
    await quiet();
    expect(bob.changes).toHaveLength(changesBefore);

    network.linksOf('alice')[0].release();
    await reaches(alice, sent.key, 'complete');
    expect(await contentOf(bob.delivered[0].blob)).toEqual(bytesOf(file.size));
  });
});

describe('several transfers at once', () => {
  it('sends to two peers at the same time', async () => {
    const alice = peer('alice');
    const bob = peer('bob');
    const carol = peer('carol');
    const forBob = fileOf(2 * PIECE_SIZE + 1, 'bob.bin', 1);
    const forCarol = fileOf(3 * PIECE_SIZE + 2, 'carol.bin', 2);

    const [toBob, toCarol] = await Promise.all([
      alice.engine.send(forBob, 'bob'),
      alice.engine.send(forCarol, 'carol'),
    ]);
    await bob.engine.accept((await incomingOffer(bob)).key);
    await carol.engine.accept((await incomingOffer(carol)).key);
    await reaches(alice, toBob.key, 'complete');
    await reaches(alice, toCarol.key, 'complete');

    expect(await contentOf(bob.delivered[0].blob)).toEqual(bytesOf(forBob.size, 1));
    expect(await contentOf(carol.delivered[0].blob)).toEqual(bytesOf(forCarol.size, 2));
  });

  it('moves two files between the same two peers, each on its own link', async () => {
    const alice = peer('alice');
    const bob = peer('bob');
    network.tap = (_link, type) => (type === 'piece' ? 'hold' : 'pass');
    const one = await exchange(alice, bob, fileOf(PIECE_SIZE + 1, 'one.bin', 1));
    const two = await exchange(alice, bob, fileOf(PIECE_SIZE + 2, 'two.bin', 2));
    const [linkOne, linkTwo] = network.linksOf('alice');
    await until(() => linkOne.peer?.opened && linkTwo.peer?.opened, 'both links are open');

    linkOne.emitCandidate({ candidate: 'for one' });
    linkTwo.emitCandidate({ candidate: 'for two' });
    linkTwo.peer?.emitCandidate({ candidate: 'back for two' });
    await quiet();

    expect(linkOne.peer?.candidates).toEqual([{ candidate: 'for one' }]);
    expect(linkTwo.peer?.candidates).toEqual([{ candidate: 'for two' }]);
    expect(linkOne.candidates).toEqual([]);
    expect(linkTwo.candidates).toEqual([{ candidate: 'back for two' }]);

    linkOne.release();
    linkTwo.release();
    await reaches(alice, one.sent.key, 'complete');
    await reaches(alice, two.sent.key, 'complete');
    const byName = new Map(bob.delivered.map((file) => [file.name, file.blob]));
    expect(await contentOf(byName.get('one.bin')!)).toEqual(bytesOf(PIECE_SIZE + 1, 1));
    expect(await contentOf(byName.get('two.bin')!)).toEqual(bytesOf(PIECE_SIZE + 2, 2));
  });

  it('sends the same file to two recipients', async () => {
    const alice = peer('alice');
    const bob = peer('bob');
    const carol = peer('carol');
    const file = fileOf(2 * PIECE_SIZE + 9);

    const toBob = await alice.engine.send(file, 'bob');
    const toCarol = await alice.engine.send(file, 'carol');
    await bob.engine.accept((await incomingOffer(bob)).key);
    await carol.engine.accept((await incomingOffer(carol)).key);
    await reaches(alice, toBob.key, 'complete');
    await reaches(alice, toCarol.key, 'complete');

    expect(toBob.id).toBe(toCarol.id);
    expect(toBob.key).not.toBe(toCarol.key);
    expect(await contentOf(bob.delivered[0].blob)).toEqual(bytesOf(file.size));
    expect(await contentOf(carol.delivered[0].blob)).toEqual(bytesOf(file.size));
  });

  it('fails a second send of content already on its way to the same peer', async () => {
    const alice = peer('alice');
    peer('bob');
    const first = await alice.engine.send(fileOf(100, 'a.bin'), 'bob');

    await expect(alice.engine.send(fileOf(100, 'b.bin'), 'bob')).rejects.toMatchObject({
      code: 'duplicate',
    });

    const [, second] = alice.engine.transfers();
    expect(second).toMatchObject({ state: 'failed', name: 'b.bin', id: first.id });
    expect(second.error?.code).toBe('duplicate');
    expect(current(alice, first.key).state).toBe('offered');
    expect(hub.sentOf('offer')).toHaveLength(1);
  });

  it('fails only one of two simultaneous sends of the same content to one peer', async () => {
    const alice = peer('alice');
    peer('bob');

    const outcomes = await Promise.allSettled([
      alice.engine.send(fileOf(100, 'a.bin'), 'bob'),
      alice.engine.send(fileOf(100, 'b.bin'), 'bob'),
    ]);

    expect(outcomes.map((outcome) => outcome.status).sort()).toEqual(['fulfilled', 'rejected']);
    expect(hub.sentOf('offer')).toHaveLength(1);
  });

  it('fails a send of content the same peer is already offering us', async () => {
    const alice = peer('alice');
    const bob = peer('bob');
    await alice.engine.send(fileOf(100), 'bob');
    await incomingOffer(bob);

    await expect(bob.engine.send(fileOf(100), 'alice')).rejects.toMatchObject({ code: 'duplicate' });

    expect(hub.sentOf('offer')).toHaveLength(1);
  });

  it('rejects an offer of content we are already sending to that peer, so offers that cross both end', async () => {
    const alice = peer('alice');
    const bob = peer('bob');
    const proceed = network.holdNegotiation();

    const sending = Promise.all([
      alice.engine.send(fileOf(100), 'bob'),
      bob.engine.send(fileOf(100), 'alice'),
    ]);
    await until(() => network.links.length === 2, 'both made a link');
    proceed();
    const [fromAlice, fromBob] = await sending;
    await reaches(alice, fromAlice.key, 'rejected');
    await reaches(bob, fromBob.key, 'rejected');

    expect(alice.engine.transfers()).toHaveLength(1);
    expect(bob.engine.transfers()).toHaveLength(1);
  });
});

describe('resuming', () => {
  it('continues over a new link without asking the user again, sending only what is missing', async () => {
    const alice = peer('alice');
    const bob = peer('bob');
    const file = fileOf(4 * PIECE_SIZE - 100);
    afterPieces('alice', 2, 'hold');
    const { sent, offer } = await exchange(alice, bob, file);
    await until(() => receivedBytes(bob, offer.key) === 2 * PIECE_SIZE, 'bob holds two pieces');
    await reaches(alice, sent.key, 'verifying');

    network.linksOf('alice')[0].sever();
    await reaches(alice, sent.key, 'complete');
    await reaches(bob, offer.key, 'complete');

    const [first, second] = network.linksOf('alice');
    expect(first.count('piece')).toBe(4);
    expect(second.count('piece')).toBe(2);
    expect(network.linksOf('alice')).toHaveLength(2);
    expect(bob.changes.filter((snapshot) => snapshot.state === 'offered')).toHaveLength(1);
    expect(bob.engine.transfers()).toHaveLength(1);
    expect(states(bob, offer.key)).toEqual([
      'offered',
      'connecting',
      'transferring',
      'connecting',
      'transferring',
      'verifying',
      'complete',
    ]);
    expect(bob.delivered).toHaveLength(1);
    expect(await contentOf(bob.delivered[0].blob)).toEqual(bytesOf(file.size));
    expect(network.linksOf('bob')[0].closed).toBe(true);
  });

  it('shows the sender what the receiver already holds when the transfer resumes', async () => {
    const alice = peer('alice');
    const bob = peer('bob');
    afterPieces('alice', 2, 'hold');
    const { sent, offer } = await exchange(alice, bob, fileOf(4 * PIECE_SIZE));
    await until(() => receivedBytes(bob, offer.key) === 2 * PIECE_SIZE, 'bob holds two pieces');
    await reaches(alice, sent.key, 'verifying');

    network.linksOf('alice')[0].sever();
    await reaches(alice, sent.key, 'complete');

    const resumed = alice.changes.slice(
      alice.changes.findIndex((snapshot) => snapshot.state === 'connecting' && snapshot.transferredBytes > 0),
    );
    expect(resumed.map((snapshot) => [snapshot.state, snapshot.transferredBytes / PIECE_SIZE])).toEqual([
      ['connecting', 4],
      ['transferring', 2],
      ['transferring', 3],
      ['transferring', 4],
      ['verifying', 4],
      ['complete', 4],
    ]);
  });

  it('ignores a repeated offer that changes the name or size the user accepted', async () => {
    const alice = peer('alice');
    const bob = peer('bob');
    afterPieces('alice', 1, 'hold');
    const file = fileOf(2 * PIECE_SIZE);
    const { sent, offer } = await exchange(alice, bob, file);
    await until(() => receivedBytes(bob, offer.key) === PIECE_SIZE, 'bob holds one piece');
    const impostor = hub.peer('alice');

    impostor.sendOffer('bob', { id: sent.id, name: 'other.bin', size: file.size }, SOME_OFFER, 'first');
    impostor.sendOffer('bob', { id: sent.id, name: file.name, size: file.size + 1 }, SOME_OFFER, 'first');
    await quiet();

    expect(network.linksOf('bob')).toHaveLength(1);
    expect(current(bob, offer.key).state).toBe('transferring');
    expect(bob.engine.transfers()).toHaveLength(1);
  });

  it('resumes after the receiving engine was restarted on the same storage', async () => {
    const alice = peer('alice');
    const bob = peer('bob');
    const file = fileOf(4 * PIECE_SIZE - 100);
    afterPieces('alice', 2, 'hold');
    const { sent, offer } = await exchange(alice, bob, file);
    await until(() => receivedBytes(bob, offer.key) === 2 * PIECE_SIZE, 'bob holds two pieces');
    await reaches(alice, sent.key, 'verifying');

    bob.engine.dispose();
    const bobAgain = peer('bob', { storage: bob.storage });
    const offeredAgain = await incomingOffer(bobAgain);
    await bobAgain.engine.accept(offeredAgain.key);
    await reaches(alice, sent.key, 'complete');

    expect(network.linksOf('alice')[1].count('piece')).toBe(2);
    expect(bob.delivered).toEqual([]);
    expect(await contentOf(bobAgain.delivered[0].blob)).toEqual(bytesOf(file.size));
    expect(
      bobAgain.changes.find((snapshot) => snapshot.state === 'transferring')?.transferredBytes,
    ).toBe(2 * PIECE_SIZE);
  });

  it('offers first once and as a resume after every lost link', async () => {
    const alice = peer('alice');
    const bob = peer('bob');
    afterPieces('alice', 1, 'hold');
    const { sent, offer } = await exchange(alice, bob, fileOf(2 * PIECE_SIZE));
    await until(() => receivedBytes(bob, offer.key) === PIECE_SIZE, 'bob holds one piece');

    network.linksOf('alice')[0].sever();
    await reaches(alice, sent.key, 'complete');

    expect(hub.sentOf('offer').map((signal) => signal.kind === 'offer' && signal.attempt)).toEqual([
      'first',
      'resume',
    ]);
  });
});

describe('the last word', () => {
  /** Runs a transfer in which the first `losses` complete frames never arrive. */
  async function withCompleteLost(losses: number) {
    const alice = peer('alice');
    const bob = peer('bob');
    let completes = 0;
    network.tap = (_link, type) => (type === 'complete' && ++completes <= losses ? 'drop' : 'pass');
    const { sent, offer } = await exchange(alice, bob, fileOf(PIECE_SIZE + 1));
    await reaches(bob, offer.key, 'complete');
    return { alice, bob, sent, offer };
  }

  it('leaves the link open after saying complete, for the sender to close', async () => {
    const alice = peer('alice');
    const bob = peer('bob');
    network.tap = (_link, type) => (type === 'complete' ? 'hold' : 'pass');
    const { sent, offer } = await exchange(alice, bob, fileOf(10));
    await reaches(bob, offer.key, 'complete');
    await quiet();
    const [aliceLink] = network.linksOf('alice');
    const [bobLink] = network.linksOf('bob');

    expect(bobLink.closed).toBe(false);

    bobLink.release();
    await reaches(alice, sent.key, 'complete');
    expect(aliceLink.closed).toBe(true);
    await until(() => bobLink.down, 'bob learns that alice closed');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('leaves the link open after saying abort, for the far side to close', async () => {
    const alice = peer('alice');
    const bob = peer('bob', { deliver: () => Promise.reject(new Error('no room')) });
    network.tap = (_link, type) => (type === 'abort' ? 'hold' : 'pass');
    const { sent, offer } = await exchange(alice, bob, fileOf(10));
    await reaches(bob, offer.key, 'failed');
    await quiet();
    const [bobLink] = network.linksOf('bob');

    expect(bobLink.closed).toBe(false);
    expect(current(alice, sent.key).state).toBe('verifying');

    bobLink.release();
    await reaches(alice, sent.key, 'failed');
    expect(errorCode(alice, sent.key)).toBe('delivery');
    await until(() => bobLink.down, 'bob learns that alice closed');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('stops waiting for the far side to close after the idle time', async () => {
    const alice = peer('alice', { idleTimeoutMs: 10 * MINUTE });
    const bob = peer('bob', { idleTimeoutMs: 30 * SECOND });
    network.tap = (_link, type) => (type === 'complete' ? 'drop' : 'pass');
    const { offer } = await exchange(alice, bob, fileOf(10));
    await reaches(bob, offer.key, 'complete');
    const [bobLink] = network.linksOf('bob');

    vi.advanceTimersByTime(30 * SECOND - 1);
    expect(bobLink.closed).toBe(false);
    vi.advanceTimersByTime(1);
    expect(bobLink.closed).toBe(true);
  });

  it('confirms a delivered file to a sender that resumes, without asking or delivering again', async () => {
    const { alice, bob, sent } = await withCompleteLost(1);
    expect(current(alice, sent.key).state).toBe('verifying');

    vi.advanceTimersByTime(30 * SECOND);
    await reaches(alice, sent.key, 'complete');
    await quiet();

    expect(bob.delivered).toHaveLength(1);
    expect(bob.engine.transfers()).toHaveLength(1);
    expect(bob.changes.filter((snapshot) => snapshot.state === 'offered')).toHaveLength(1);
    expect(network.linksOf('alice')[1].count('piece')).toBe(0);
    expect(network.linksOf('bob')[1].sentTypes).toEqual(['complete']);
    expect(network.links.every((link) => link.closed || link.down)).toBe(true);
  });

  it('confirms again when the confirmation is lost too', async () => {
    const { alice, bob, sent } = await withCompleteLost(2);

    vi.advanceTimersByTime(30 * SECOND);
    await until(() => network.linksOf('bob')[1]?.count('complete') === 1, 'bob confirms');
    vi.advanceTimersByTime(30 * SECOND);
    await reaches(alice, sent.key, 'complete');

    expect(bob.delivered).toHaveLength(1);
    expect(bob.engine.transfers()).toHaveLength(1);
    expect(network.linksOf('bob')).toHaveLength(3);
    expect(network.linksOf('bob')[1].closed).toBe(true);
  });

  it('passes candidates to and from a link that exists only to confirm', async () => {
    const { alice, bob, sent } = await withCompleteLost(1);
    hub.drop = (signal) => signal.kind === 'answer';
    vi.advanceTimersByTime(30 * SECOND);
    await until(() => hub.sentOf('answer').length === 2, 'bob answers the resume');
    const aliceSecond = network.linksOf('alice')[1];
    const bobSecond = network.linksOf('bob')[1];

    aliceSecond.emitCandidate({ candidate: 'to bob' });
    bobSecond.emitCandidate({ candidate: 'to alice' });
    await quiet();

    expect(bobSecond.candidates).toEqual([{ candidate: 'to bob' }]);
    expect(aliceSecond.candidates).toEqual([{ candidate: 'to alice' }]);
    expect(current(bob, bob.engine.transfers()[0].key).state).toBe('complete');
    expect(current(alice, sent.key).state).toBe('connecting');
  });

  it('treats a first offer of a file already delivered as a new transfer', async () => {
    const alice = peer('alice');
    const bob = peer('bob');
    const file = fileOf(10);
    await transfer(alice, bob, file);

    const again = await exchange(alice, bob, file);
    await reaches(alice, again.sent.key, 'complete');

    expect(bob.delivered).toHaveLength(2);
    expect(bob.engine.transfers()).toHaveLength(2);
  });

  it('does not confirm a resume that names the file differently', async () => {
    const { bob, sent } = await withCompleteLost(1);
    const impostor = hub.peer('alice');

    impostor.sendOffer('bob', { id: sent.id, name: 'other.bin', size: sent.size }, SOME_OFFER, 'resume');
    const asked = await incomingOffer(bob, 'other.bin');

    expect(asked.state).toBe('offered');
    expect(network.linksOf('bob')).toHaveLength(1);
  });

  it('ignores cancels from either side while a link is kept for the last word', async () => {
    const alice = peer('alice');
    const bob = peer('bob');
    network.tap = (_link, type) => (type === 'complete' ? 'hold' : 'pass');
    const { sent, offer } = await exchange(alice, bob, fileOf(10));
    await reaches(bob, offer.key, 'complete');
    const [bobLink] = network.linksOf('bob');
    const signals = hub.sent.length;

    bob.engine.cancel(offer.key);
    hub.peer('alice').sendCancel('bob', sent.id);
    await quiet();

    expect(hub.sent).toHaveLength(signals + 1);
    expect(current(bob, offer.key).state).toBe('complete');
    expect(bobLink.closed).toBe(false);

    bobLink.release();
    await reaches(alice, sent.key, 'complete');
  });

  it('releases a link kept for the last word on dispose', async () => {
    const { bob } = await withCompleteLost(1);
    const [bobLink] = network.linksOf('bob');
    expect(bobLink.closed).toBe(false);

    for (const { engine } of peers) engine.dispose();

    expect(bobLink.closed).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
    expect(bob.engine.transfers()).toEqual([]);
  });
});

describe('verifying without a link', () => {
  /** Runs a transfer up to the point where bob reads the whole file back, and stops him there. */
  async function untilVerifying(options: Partial<FileTransferEngineOptions> = {}) {
    const alice = peer('alice');
    const ungated = createMemoryTransferStorage();
    const gate = createGatedStorage(ungated);
    const bob = peer('bob', { ...options, storage: gate.storage });
    const file = fileOf(2 * PIECE_SIZE);
    afterPieces('alice', 1, 'hold');
    const { sent, offer } = await exchange(alice, bob, file);
    await until(() => receivedBytes(bob, offer.key) === PIECE_SIZE, 'bob holds one piece');
    await reaches(alice, sent.key, 'verifying');
    gate.gated = true;
    network.linksOf('alice')[0].release();
    await until(() => gate.waiting === 1, 'the last write waits');
    gate.releaseNext();
    await until(
      () => current(bob, offer.key).state === 'verifying' && gate.waiting === 1,
      'bob is reading the file back',
    );
    const spoilStoredFile = () =>
      ungated.putPiece({ from: 'alice', id: sent.id }, 1, new ArrayBuffer(PIECE_SIZE));
    return { alice, bob, gate, file, sent, offer, spoilStoredFile };
  }

  it('finishes and delivers although the link was lost, then tells the sender on its new link', async () => {
    const { alice, bob, gate, file, sent, offer } = await untilVerifying();

    network.linksOf('alice')[0].sever();
    await until(() => network.linksOf('bob')[1]?.count('ready') === 1, 'bob is ready on a new link');
    await reaches(alice, sent.key, 'verifying');
    expect(current(bob, offer.key).state).toBe('verifying');

    gate.releaseAll();
    await reaches(alice, sent.key, 'complete');

    expect(states(bob, offer.key)).toEqual([
      'offered',
      'connecting',
      'transferring',
      'verifying',
      'complete',
    ]);
    expect(states(alice, sent.key).slice(-4)).toEqual([
      'verifying',
      'connecting',
      'verifying',
      'complete',
    ]);
    expect(bob.delivered).toHaveLength(1);
    expect(await contentOf(bob.delivered[0].blob)).toEqual(bytesOf(file.size));
    expect(network.linksOf('bob')[1].sentTypes).toEqual(['ready', 'complete']);
    expect(network.linksOf('alice')[1].count('piece')).toBe(0);
  });

  it('says the last word on a link that opens only after verification ended', async () => {
    const { alice, bob, gate, sent, offer } = await untilVerifying();
    hub.drop = (signal) => signal.kind === 'answer';
    network.linksOf('alice')[0].sever();
    await until(() => hub.sentOf('answer').length === 2, 'bob answers the new offer, unheard');

    gate.releaseAll();
    await reaches(bob, offer.key, 'complete');
    expect(current(alice, sent.key).state).toBe('connecting');

    const lostAnswer = hub.sentOf('answer')[1];
    hub.drop = () => false;
    if (lostAnswer.kind === 'answer') {
      hub.peer('bob').sendAnswer('alice', hubOffer(0).offer, lostAnswer.description);
    }
    await reaches(alice, sent.key, 'complete');

    expect(network.linksOf('bob')[1].sentTypes).toEqual(['complete']);
    expect(bob.delivered).toHaveLength(1);
  });

  it('passes candidates to the link it makes for an offer that arrives while verifying', async () => {
    const { alice, gate, sent } = await untilVerifying();

    network.linksOf('alice')[0].sever();
    await until(() => network.linksOf('bob').length === 2, 'bob makes a new link');
    network.linksOf('alice')[1].emitCandidate({ candidate: 'for the new link' });
    await quiet();
    gate.releaseAll();
    await reaches(alice, sent.key, 'complete');

    expect(network.linksOf('bob')[1].candidates).toEqual([{ candidate: 'for the new link' }]);
  });

  it('does not cost the sender the transfer when verifying takes many idle times', async () => {
    const { alice, bob, gate, sent, offer } = await untilVerifying();

    for (let idleTimes = 0; idleTimes < 6; idleTimes++) {
      vi.advanceTimersByTime(30 * SECOND);
      await quiet();
    }
    expect(current(alice, sent.key).state).toBe('verifying');
    expect(hub.sentOf('offer')).toHaveLength(1);

    gate.releaseAll();
    await reaches(alice, sent.key, 'complete');
    await reaches(bob, offer.key, 'complete');
    await quiet();

    expect(bob.delivered).toHaveLength(1);
    expect(network.linksOf('alice')).toHaveLength(1);
  });

  it('asks again after the verification time, and is told at once that the file is still being checked', async () => {
    const { alice, bob, gate, sent, offer } = await untilVerifying();

    vi.advanceTimersByTime(5 * MINUTE - 1);
    expect(hub.sentOf('offer')).toHaveLength(1);
    vi.advanceTimersByTime(1);
    await until(() => network.linksOf('bob')[1]?.count('ready') === 1, 'bob is ready on a new link');
    await reaches(alice, sent.key, 'verifying');
    expect(current(bob, offer.key).state).toBe('verifying');
    expect(network.linksOf('alice')[1].count('piece')).toBe(0);

    gate.releaseAll();
    await reaches(alice, sent.key, 'complete');
    await quiet();

    expect(bob.delivered).toHaveLength(1);
    expect(bob.changes.filter((snapshot) => snapshot.state === 'offered')).toHaveLength(1);
  });

  it('tells a sender on its new link that the file failed verification', async () => {
    const { alice, bob, gate, sent, offer, spoilStoredFile } = await untilVerifying();
    await spoilStoredFile();

    network.linksOf('alice')[0].sever();
    await until(() => hub.sentOf('offer').length === 2, 'alice offers again');
    await quiet();
    gate.releaseAll();
    await reaches(alice, sent.key, 'failed');

    expect(errorCode(alice, sent.key)).toBe('integrity');
    expect(errorCode(bob, offer.key)).toBe('integrity');
    expect(network.linksOf('bob')[1].sentTypes).toEqual(['ready', 'abort']);
    expect(bob.delivered).toEqual([]);
  });

  it('owes the last word when no link is left, and confirms on the next resume', async () => {
    const { alice, bob, gate, sent, offer } = await untilVerifying();
    hub.drop = (signal) => signal.kind === 'offer';
    network.linksOf('alice')[0].sever();
    await until(() => hub.sentOf('offer').length === 2, 'alice offers again, unheard');

    gate.releaseAll();
    await reaches(bob, offer.key, 'complete');
    expect(bob.delivered).toHaveLength(1);
    expect(current(alice, sent.key).state).toBe('connecting');

    hub.drop = () => false;
    vi.advanceTimersByTime(30 * SECOND);
    await reaches(alice, sent.key, 'complete');
    expect(bob.delivered).toHaveLength(1);
    expect(bob.engine.transfers()).toHaveLength(1);
  });

  it('rejects the resume of a transfer that failed for a reason a new link cannot mend', async () => {
    const { alice, bob, gate, sent, offer, spoilStoredFile } = await untilVerifying();
    await spoilStoredFile();
    hub.drop = (signal) => signal.kind === 'offer';
    network.linksOf('alice')[0].sever();
    await until(() => hub.sentOf('offer').length === 2, 'alice offers again, unheard');

    gate.releaseAll();
    await reaches(bob, offer.key, 'failed');
    expect(errorCode(bob, offer.key)).toBe('integrity');

    hub.drop = () => false;
    vi.advanceTimersByTime(30 * SECOND);
    await reaches(alice, sent.key, 'rejected');
    expect(bob.engine.transfers()).toHaveLength(1);
    expect(network.linksOf('bob')).toHaveLength(1);
  });

  it('ignores frames while verifying', async () => {
    const { alice, bob, gate, sent, offer } = await untilVerifying();

    const stray = encodeFrame({ type: 'piece', index: 0, bytes: new ArrayBuffer(PIECE_SIZE) });
    network.linksOf('bob')[0].handlers.onFrame(stray);
    network.linksOf('bob')[0].handlers.onFrame(encodeFrame({ type: 'ready', have: [] }));
    await quiet();
    expect(current(bob, offer.key).state).toBe('verifying');

    gate.releaseAll();
    await reaches(alice, sent.key, 'complete');
    expect(bob.delivered).toHaveLength(1);
  });

  it('stops verifying when the user cancels, and delivers nothing', async () => {
    const { alice, bob, gate, sent, offer } = await untilVerifying();

    bob.engine.cancel(offer.key);
    gate.releaseAll();
    await reaches(alice, sent.key, 'cancelled');
    await quiet();

    expect(current(bob, offer.key).state).toBe('cancelled');
    expect(bob.delivered).toEqual([]);
    expect(await heldBy(bob, 'alice', sent.id)).toEqual([]);
  });
});

describe('a resume offer for a transfer that is over', () => {
  it('asks the user again when the earlier attempt lost its link, and continues from its pieces', async () => {
    const alice = peer('alice');
    const bob = peer('bob', { reconnectWaitMs: 10 * SECOND });
    const file = fileOf(4 * PIECE_SIZE - 100);
    afterPieces('alice', 2, 'hold');
    const { sent, offer } = await exchange(alice, bob, file);
    await until(() => receivedBytes(bob, offer.key) === 2 * PIECE_SIZE, 'bob holds two pieces');

    let offers = 0;
    hub.drop = (signal) => signal.kind === 'offer' && ++offers === 1;
    network.linksOf('alice')[0].sever();
    await reaches(bob, offer.key, 'connecting');
    vi.advanceTimersByTime(10 * SECOND);
    expect(errorCode(bob, offer.key)).toBe('connection-failed');

    vi.advanceTimersByTime(20 * SECOND);
    const again = await incomingOffer(bob);
    await bob.engine.accept(again.key);
    await reaches(alice, sent.key, 'complete');

    expect(again.key).not.toBe(offer.key);
    expect(network.linksOf('alice').at(-1)?.count('piece')).toBe(2);
    expect(await contentOf(bob.delivered[0].blob)).toEqual(bytesOf(file.size));
  });

  it('rejects it when the earlier attempt was cancelled', async () => {
    const alice = peer('alice');
    const bob = peer('bob');
    afterPieces('alice', 1, 'hold');
    const { sent, offer } = await exchange(alice, bob, fileOf(2 * PIECE_SIZE));
    await until(() => receivedBytes(bob, offer.key) === PIECE_SIZE, 'bob holds one piece');
    hub.drop = (signal) => signal.kind === 'cancel';

    // Alice never hears the cancel, only that her link closed.
    bob.engine.cancel(offer.key);
    await reaches(alice, sent.key, 'rejected');

    expect(bob.engine.transfers()).toHaveLength(1);
    expect(hub.sentOf('reject')).toHaveLength(1);
  });

  it('asks the user when nothing is known of the transfer being resumed', async () => {
    const bob = peer('bob');

    hub.peer('alice').sendOffer('bob', { id: idOf(1), name: 'a', size: 1 }, SOME_OFFER, 'resume');

    expect((await incomingOffer(bob)).state).toBe('offered');
  });
});

describe('a link that fails', () => {
  it('reconnects the allowed number of times in a row, then gives up with connection-failed', async () => {
    const alice = peer('alice', { maxReconnects: 3 });
    const bob = peer('bob');
    afterPieces('alice', 1, 'hold');
    const { sent, offer } = await exchange(alice, bob, fileOf(3 * PIECE_SIZE));
    await until(() => receivedBytes(bob, offer.key) === PIECE_SIZE, 'bob holds one piece');

    network.failing = (link, step) => link.owner === 'alice' && step === 'createOffer';
    network.linksOf('alice')[0].sever();
    await reaches(alice, sent.key, 'failed');

    expect(errorCode(alice, sent.key)).toBe('connection-failed');
    expect(network.linksOf('alice')).toHaveLength(1 + 3);
    expect(network.linksOf('alice').every((link) => link.closed)).toBe(true);
    expect(hub.sentOf('offer')).toHaveLength(1);
  });

  it('gives up with timeout when the last failure was silence', async () => {
    const alice = peer('alice', { maxReconnects: 1 });
    const bob = peer('bob');
    afterPieces('alice', 1, 'hold');
    const { sent, offer } = await exchange(alice, bob, fileOf(3 * PIECE_SIZE));
    await until(() => receivedBytes(bob, offer.key) === PIECE_SIZE, 'bob holds one piece');

    hub.drop = (signal) => signal.kind === 'offer';
    network.linksOf('alice')[0].sever();
    await reaches(alice, sent.key, 'connecting');
    vi.advanceTimersByTime(30 * SECOND);

    expect(current(alice, sent.key).state).toBe('failed');
    expect(errorCode(alice, sent.key)).toBe('timeout');
  });

  it('starts counting failures afresh once the receiver is ready again', async () => {
    const alice = peer('alice', { maxReconnects: 1 });
    // Bob in turn takes one repeated offer more than that, counted from the last piece he stored.
    const bob = peer('bob', { maxReconnects: 0 });
    const file = fileOf(4 * PIECE_SIZE);
    const piecesOn = new Map<FakeLink, number>();
    network.tap = (link, type) => {
      if (link.owner !== 'alice' || type !== 'piece') return 'pass';
      const count = (piecesOn.get(link) ?? 0) + 1;
      piecesOn.set(link, count);
      return count > 1 && network.linksOf('alice').indexOf(link) < 2 ? 'hold' : 'pass';
    };
    const { sent, offer } = await exchange(alice, bob, file);

    for (const [linkIndex, pieces] of [
      [0, 1],
      [1, 2],
    ]) {
      await until(() => receivedBytes(bob, offer.key) === pieces * PIECE_SIZE, 'bob holds more');
      await reaches(alice, sent.key, 'verifying');
      network.linksOf('alice')[linkIndex].sever();
      await until(() => network.linksOf('alice').length === linkIndex + 2, 'alice reconnects');
    }
    await reaches(alice, sent.key, 'complete');

    expect(network.linksOf('alice').map((link) => link.count('piece'))).toEqual([4, 3, 2]);
    expect(await contentOf(bob.delivered[0].blob)).toEqual(bytesOf(file.size));
  });

  it('counts a send that fails as its link goes down as one failure', async () => {
    const alice = peer('alice', { maxReconnects: 1 });
    const bob = peer('bob');
    const file = fileOf(3 * PIECE_SIZE);
    afterPieces('alice', 1, 'stall');
    const { sent, offer } = await exchange(alice, bob, file);
    await until(() => receivedBytes(bob, offer.key) === PIECE_SIZE, 'bob holds one piece');
    await until(() => network.linksOf('alice')[0].count('piece') === 2, 'the second piece stalls');

    network.linksOf('alice')[0].sever();
    await reaches(alice, sent.key, 'complete');

    expect(network.linksOf('alice')).toHaveLength(2);
    expect(network.linksOf('alice')[1].count('piece')).toBe(2);
    expect(await contentOf(bob.delivered[0].blob)).toEqual(bytesOf(file.size));
  });

  it('treats a send that fails on a link still thought up as that link failing', async () => {
    const alice = peer('alice');
    const bob = peer('bob');
    const file = fileOf(3 * PIECE_SIZE);
    afterPieces('alice', 1, 'stall');
    const { sent, offer } = await exchange(alice, bob, file);
    await until(() => receivedBytes(bob, offer.key) === PIECE_SIZE, 'bob holds one piece');
    await until(() => network.linksOf('alice')[0].count('piece') === 2, 'the second piece stalls');

    const [first] = network.linksOf('alice');
    first.failStalledSends();
    await reaches(alice, sent.key, 'complete');

    expect(first.closed).toBe(true);
    expect(network.linksOf('alice')).toHaveLength(2);
  });

  it('fails a send whose link cannot make an offer, and closes the link', async () => {
    const alice = peer('alice');
    network.failing = (_link, step) => step === 'createOffer';

    await expect(alice.engine.send(fileOf(10), 'bob')).rejects.toMatchObject({
      code: 'connection-failed',
    });

    const [failed] = alice.engine.transfers();
    expect(failed.state).toBe('failed');
    expect(network.linksOf('alice')[0].closed).toBe(true);
    expect(hub.sent).toEqual([]);
  });

  it('fails an acceptance whose link cannot take the offer, and closes the link', async () => {
    const alice = peer('alice');
    const bob = peer('bob');
    await alice.engine.send(fileOf(10), 'bob');
    const offer = await incomingOffer(bob);
    network.failing = (_link, step) => step === 'acceptOffer';

    await expect(bob.engine.accept(offer.key)).rejects.toMatchObject({ code: 'connection-failed' });

    expect(current(bob, offer.key).state).toBe('failed');
    expect(errorCode(bob, offer.key)).toBe('connection-failed');
    expect(network.linksOf('bob')[0].closed).toBe(true);
    expect(hub.sentOf('answer')).toEqual([]);
  });

  it('offers again on a new link when the answer cannot be applied', async () => {
    const alice = peer('alice');
    const bob = peer('bob');
    const file = fileOf(PIECE_SIZE + 1);
    network.failing = (link, step) => step === 'acceptAnswer' && link === network.linksOf('alice')[0];

    const { sent } = await transfer(alice, bob, file);

    expect(network.linksOf('alice')).toHaveLength(2);
    expect(network.linksOf('alice')[0].closed).toBe(true);
    expect(states(alice, sent.key)).toEqual([
      'preparing',
      'offered',
      'connecting',
      'transferring',
      'verifying',
      'complete',
    ]);
    expect(await contentOf(bob.delivered[0].blob)).toEqual(bytesOf(file.size));
  });

  it('takes an answer only once per offer', async () => {
    const alice = peer('alice');
    const bob = peer('bob');
    network.tap = (_link, type) => (type === 'piece' ? 'hold' : 'pass');
    const { sent } = await exchange(alice, bob, fileOf(10));
    await reaches(alice, sent.key, 'verifying');
    const answer = hub.sentOf('answer')[0];

    hub.peer('bob').sendAnswer('alice', hubOffer(0).offer, (answer as { description: RTCSessionDescriptionInit }).description);
    await quiet();

    expect(current(alice, sent.key).state).toBe('verifying');
    expect(network.linksOf('alice')).toHaveLength(1);
  });

  it('swallows the rejection of an offer still being made when the send is cancelled', async () => {
    const alice = peer('alice');
    peer('bob');
    const proceed = network.holdNegotiation();

    const sending = alice.engine.send(fileOf(10), 'bob');
    await until(() => network.linksOf('alice').length === 1, 'alice made a link');
    alice.engine.cancel(alice.engine.transfers()[0].key);
    proceed();
    const result = await sending;
    await quiet();

    expect(result.state).toBe('cancelled');
    expect(states(alice, result.key)).toEqual(['preparing', 'cancelled']);
    expect(hub.sent).toEqual([]);
    expect(network.linksOf('alice')[0].closed).toBe(true);
  });

  it('swallows the rejection of an answer still being made when the transfer is cancelled', async () => {
    const alice = peer('alice');
    const bob = peer('bob');
    const sent = await alice.engine.send(fileOf(10), 'bob');
    const offer = await incomingOffer(bob);
    const proceed = network.holdNegotiation();

    const accepting = bob.engine.accept(offer.key);
    bob.engine.cancel(offer.key);
    proceed();
    await expect(accepting).resolves.toBeUndefined();
    await reaches(alice, sent.key, 'cancelled');

    expect(states(bob, offer.key)).toEqual(['offered', 'connecting', 'cancelled']);
    expect(hub.sentOf('answer')).toEqual([]);
  });

  it('ignores events from a link it has replaced', async () => {
    const alice = peer('alice');
    const bob = peer('bob');
    network.tap = (_link, type) => (type === 'piece' ? 'hold' : 'pass');
    network.failing = (link, step) => step === 'acceptAnswer' && link === network.linksOf('alice')[0];
    const { sent, offer } = await exchange(alice, bob, fileOf(PIECE_SIZE));
    await reaches(alice, sent.key, 'verifying');
    const [replaced, inUse] = network.linksOf('alice');
    const [bobReplaced] = network.linksOf('bob');

    replaced.handlers.onOpen();
    replaced.handlers.onFrame(encodeFrame({ type: 'complete' }));
    replaced.handlers.onDown('late');
    bobReplaced.handlers.onFrame(encodeFrame({ type: 'ready', have: [] }));
    bobReplaced.handlers.onDown('late');
    await quiet();

    expect(current(alice, sent.key).state).toBe('verifying');
    expect(current(bob, offer.key).state).toBe('transferring');
    expect(network.linksOf('alice')).toHaveLength(2);

    inUse.release();
    await reaches(alice, sent.key, 'complete');
  });
});

describe('waiting', () => {
  it('fails an offer nobody answers and tells the peer it is withdrawn', async () => {
    const alice = peer('alice', { offerTimeoutMs: 5 * MINUTE });
    const bob = peer('bob', { offerTimeoutMs: 10 * MINUTE });
    const sent = await alice.engine.send(fileOf(10), 'bob');
    const offer = await incomingOffer(bob);

    vi.advanceTimersByTime(5 * MINUTE - 1);
    expect(current(alice, sent.key).state).toBe('offered');
    vi.advanceTimersByTime(1);

    expect(errorCode(alice, sent.key)).toBe('timeout');
    await reaches(bob, offer.key, 'cancelled');
    expect(network.linksOf('alice')[0].closed).toBe(true);
  });

  it('fails an unanswered offer whose link goes down', async () => {
    const alice = peer('alice');
    peer('bob');
    const sent = await alice.engine.send(fileOf(10), 'bob');

    network.linksOf('alice')[0].sever();
    await reaches(alice, sent.key, 'failed');

    expect(errorCode(alice, sent.key)).toBe('connection-failed');
    expect(network.linksOf('alice')).toHaveLength(1);
  });

  it('counts a sender link with no progress as down', async () => {
    const alice = peer('alice', { maxReconnects: 0, idleTimeoutMs: 30 * SECOND });
    const bob = peer('bob');
    network.tap = (_link, type) => (type === 'ready' ? 'hold' : 'pass');
    const { sent, offer } = await exchange(alice, bob, fileOf(10));
    await reaches(bob, offer.key, 'transferring');

    vi.advanceTimersByTime(30 * SECOND - 1);
    expect(current(alice, sent.key).state).toBe('connecting');
    vi.advanceTimersByTime(1);

    expect(errorCode(alice, sent.key)).toBe('timeout');
  });

  it('counts a receiver link with no progress as down, and picks the transfer up again', async () => {
    const alice = peer('alice', { idleTimeoutMs: 10 * MINUTE });
    const bob = peer('bob', { idleTimeoutMs: 30 * SECOND });
    const file = fileOf(3 * PIECE_SIZE);
    afterPieces('alice', 1, 'hold');
    const { sent, offer } = await exchange(alice, bob, file);
    await until(() => receivedBytes(bob, offer.key) === PIECE_SIZE, 'bob holds one piece');
    await reaches(alice, sent.key, 'verifying');

    vi.advanceTimersByTime(30 * SECOND);
    expect(current(bob, offer.key).state).toBe('connecting');
    expect(network.linksOf('bob')[0].closed).toBe(true);

    await reaches(alice, sent.key, 'complete');
    expect(states(bob, offer.key)).toEqual([
      'offered',
      'connecting',
      'transferring',
      'connecting',
      'transferring',
      'verifying',
      'complete',
    ]);
    expect(network.linksOf('alice')[1].count('piece')).toBe(2);
  });

  it('keeps the pieces when the sender never comes back, so a later offer resumes from them', async () => {
    const alice = peer('alice', { maxReconnects: 2 });
    const bob = peer('bob', { reconnectWaitMs: MINUTE });
    const file = fileOf(4 * PIECE_SIZE - 100);
    afterPieces('alice', 2, 'hold');
    const { sent, offer } = await exchange(alice, bob, file);
    await until(() => receivedBytes(bob, offer.key) === 2 * PIECE_SIZE, 'bob holds two pieces');

    hub.drop = (signal) => signal.kind === 'offer';
    network.linksOf('alice')[0].sever();
    await reaches(bob, offer.key, 'connecting');
    await reaches(alice, sent.key, 'connecting');
    vi.advanceTimersByTime(MINUTE - 1);
    expect(current(bob, offer.key).state).toBe('connecting');
    vi.advanceTimersByTime(1);

    expect(errorCode(bob, offer.key)).toBe('connection-failed');
    expect(await heldBy(bob, 'alice', sent.id)).toEqual([0, 1]);
    expect(current(alice, sent.key).state).toBe('failed');

    hub.drop = () => false;
    const linksBefore = network.linksOf('alice').length;
    const again = await exchange(alice, bob, file);
    await reaches(alice, again.sent.key, 'complete');

    expect(again.offer.key).not.toBe(offer.key);
    expect(network.linksOf('alice')[linksBefore].count('piece')).toBe(2);
    expect(await contentOf(bob.delivered[0].blob)).toEqual(bytesOf(file.size));
  });
});

describe('storage and delivery', () => {
  it('fails both sides with storage when a piece cannot be stored', async () => {
    const alice = peer('alice');
    const inner = createMemoryTransferStorage();
    const bob = peer('bob', {
      storage: { ...inner, putPiece: () => Promise.reject(new Error('disk full')) },
    });

    const { sent, offer } = await exchange(alice, bob, fileOf(PIECE_SIZE));
    await reaches(alice, sent.key, 'failed');

    expect(errorCode(bob, offer.key)).toBe('storage');
    expect(errorCode(alice, sent.key)).toBe('storage');
    expect(bob.delivered).toEqual([]);
  });

  it('fails with storage when what is held cannot be listed', async () => {
    const alice = peer('alice');
    const inner = createMemoryTransferStorage();
    const bob = peer('bob', {
      storage: { ...inner, heldPieces: () => Promise.reject(new Error('database gone')) },
    });

    const { offer } = await exchange(alice, bob, fileOf(PIECE_SIZE));
    await reaches(bob, offer.key, 'failed');

    expect(errorCode(bob, offer.key)).toBe('storage');
  });

  it('fails with integrity when a stored piece has gone missing', async () => {
    const alice = peer('alice');
    const inner = createMemoryTransferStorage();
    const bob = peer('bob', {
      storage: { ...inner, readPiece: async (key, index) => (index === 1 ? undefined : inner.readPiece(key, index)) },
    });

    const { sent, offer } = await exchange(alice, bob, fileOf(2 * PIECE_SIZE));
    await reaches(alice, sent.key, 'failed');

    expect(errorCode(bob, offer.key)).toBe('integrity');
    expect(errorCode(alice, sent.key)).toBe('integrity');
    expect(bob.delivered).toEqual([]);
  });

  it('ignores stored pieces beyond the end of the file', async () => {
    const alice = peer('alice');
    const bob = peer('bob');
    const file = fileOf(2 * PIECE_SIZE);
    const id = await computeContentId(file);
    await bob.storage.putPiece({ from: 'alice', id }, 7, new ArrayBuffer(3));

    await transfer(alice, bob, file);

    expect(network.linksOf('alice')[0].count('piece')).toBe(2);
    expect(await contentOf(bob.delivered[0].blob)).toEqual(bytesOf(file.size));
  });

  it('fails both sides with delivery when the application cannot take the file', async () => {
    const alice = peer('alice');
    const bob = peer('bob', {
      deliver: () => Promise.reject(new Error('no room')),
    });

    const { sent, offer } = await exchange(alice, bob, fileOf(PIECE_SIZE));
    await reaches(alice, sent.key, 'failed');

    expect(errorCode(bob, offer.key)).toBe('delivery');
    expect(errorCode(alice, sent.key)).toBe('delivery');
    expect(states(alice, sent.key)).not.toContain('complete');
    expect(network.linksOf('bob')[0].sentTypes).toEqual(['ready', 'abort']);
    expect(await heldBy(bob, 'alice', sent.id)).toEqual([]);
  });

  it('fails both sides with delivery when the application throws', async () => {
    const alice = peer('alice');
    const bob = peer('bob', {
      deliver: () => {
        throw new Error('no room');
      },
    });

    const { sent, offer } = await exchange(alice, bob, fileOf(PIECE_SIZE));
    await reaches(alice, sent.key, 'failed');

    expect(errorCode(bob, offer.key)).toBe('delivery');
    expect(errorCode(alice, sent.key)).toBe('delivery');
  });

  it('says complete only after the application has the file and the pieces are gone', async () => {
    const alice = peer('alice');
    let taken!: () => void;
    const bob = peer('bob', { deliver: () => new Promise<void>((resolve) => (taken = resolve)) });

    const { sent, offer } = await exchange(alice, bob, fileOf(PIECE_SIZE));
    await until(() => taken, 'bob is handing the file over');
    await quiet();

    expect(current(bob, offer.key).state).toBe('verifying');
    expect(current(alice, sent.key).state).toBe('verifying');
    expect(network.linksOf('bob')[0].count('complete')).toBe(0);
    expect(await heldBy(bob, 'alice', sent.id)).toEqual([0]);

    taken();
    await reaches(alice, sent.key, 'complete');
    expect(await heldBy(bob, 'alice', sent.id)).toEqual([]);
  });

  describe('once the application has the file', () => {
    /** Runs a transfer up to bob clearing his storage after delivery, and holds that. */
    async function untilDiscarding() {
      const alice = peer('alice');
      const inner = createMemoryTransferStorage();
      let finishDiscard = () => {};
      let discarding = false;
      const bob = peer('bob', {
        storage: {
          ...inner,
          discard: async (key) => {
            discarding = true;
            await new Promise<void>((resolve) => (finishDiscard = resolve));
            return inner.discard(key);
          },
        },
      });
      network.tap = (_link, type) => (type === 'complete' ? 'hold' : 'pass');
      const { sent, offer } = await exchange(alice, bob, fileOf(2 * PIECE_SIZE));
      await until(() => discarding, 'bob is discarding the delivered pieces');
      return { alice, bob, sent, offer, finishDiscard: () => finishDiscard() };
    }

    it('is complete before the stored pieces are gone', async () => {
      const { bob, offer, sent, finishDiscard } = await untilDiscarding();

      expect(current(bob, offer.key).state).toBe('complete');
      expect(await heldBy(bob, 'alice', sent.id)).toEqual([0, 1]);

      finishDiscard();
      await quiet();
      expect(await heldBy(bob, 'alice', sent.id)).toEqual([]);
    });

    it('stays complete when its user cancels right after', async () => {
      const { alice, bob, sent, offer, finishDiscard } = await untilDiscarding();

      bob.engine.cancel(offer.key);
      finishDiscard();
      network.linksOf('bob')[0].release();
      await reaches(alice, sent.key, 'complete');

      expect(current(bob, offer.key).state).toBe('complete');
      expect(hub.sentOf('cancel')).toEqual([]);
      expect(bob.delivered).toHaveLength(1);
    });

    it('stays complete when the sender cancels before hearing of it', async () => {
      const { alice, bob, sent, offer, finishDiscard } = await untilDiscarding();

      alice.engine.cancel(sent.key);
      finishDiscard();
      await quiet();

      expect(current(bob, offer.key).state).toBe('complete');
      expect(current(alice, sent.key).state).toBe('cancelled');
      expect(bob.delivered).toHaveLength(1);
    });
  });

  it('fails both sides with unreadable when the file cannot be read while it is sent', async () => {
    const alice = peer('alice');
    const bob = peer('bob');
    const file = fileOf(3 * PIECE_SIZE);
    const slice = file.slice.bind(file);
    let reads = 0;
    file.slice = (...range) => {
      // Three reads hash the file; the fifth is its second piece being sent.
      if (++reads === 5) return { arrayBuffer: () => Promise.reject(new Error('gone')) } as Blob;
      return slice(...range);
    };

    const { sent, offer } = await exchange(alice, bob, file);
    await reaches(bob, offer.key, 'failed');

    expect(errorCode(alice, sent.key)).toBe('unreadable');
    expect(errorCode(bob, offer.key)).toBe('unreadable');
    expect(await heldBy(bob, 'alice', sent.id)).toEqual([]);
  });

  it('fails a send with unreadable when the file cannot be read to identify it', async () => {
    const alice = peer('alice');
    const file = fileOf(PIECE_SIZE);
    file.slice = () => ({ arrayBuffer: () => Promise.reject(new Error('gone')) }) as Blob;

    await expect(alice.engine.send(file, 'bob')).rejects.toMatchObject({ code: 'unreadable' });

    expect(alice.engine.transfers()[0]).toMatchObject({ state: 'failed', id: '' });
    expect(hub.sent).toEqual([]);
  });

  it('fails with unreadable when the file has shrunk since it was offered', async () => {
    const alice = peer('alice');
    const bob = peer('bob');
    const file = fileOf(2 * PIECE_SIZE);
    const slice = file.slice.bind(file);
    let reads = 0;
    file.slice = (start, end) => (++reads > 2 ? slice(start, (end ?? 0) - 1) : slice(start, end));

    const { sent } = await exchange(alice, bob, file);
    await reaches(alice, sent.key, 'failed');

    expect(errorCode(alice, sent.key)).toBe('unreadable');
  });

  it('handles one frame at a time however slow the storage is', async () => {
    const alice = peer('alice');
    const gate = createGatedStorage(createMemoryTransferStorage());
    const bob = peer('bob', { storage: gate.storage });
    const file = fileOf(4 * PIECE_SIZE - 3);
    gate.gated = true;

    const { sent, offer } = await exchange(alice, bob, file);
    await reaches(alice, sent.key, 'verifying');
    await quiet();
    expect(gate.putsStarted).toEqual([0]);
    expect(receivedBytes(bob, offer.key)).toBe(0);

    gate.releaseNext();
    await until(() => gate.putsStarted.length === 2, 'the second write starts');
    expect(receivedBytes(bob, offer.key)).toBe(PIECE_SIZE);

    gate.releaseAll();
    await reaches(alice, sent.key, 'complete');
    expect(gate.putsStarted).toEqual([0, 1, 2, 3]);
    expect(gate.mostConcurrentPuts).toBe(1);
    expect(await contentOf(bob.delivered[0].blob)).toEqual(bytesOf(file.size));
  });

  it('purges partial transfers older than the retention period when it starts', async () => {
    const purges: number[] = [];
    const storage: TransferStorage = {
      ...createMemoryTransferStorage(),
      discardUntouchedSince: (timestamp) => {
        purges.push(timestamp);
        return Promise.reject(new Error('not now'));
      },
    };
    const day = 24 * 60 * MINUTE;

    const before = Date.now();
    peer('bob', { storage, partialRetentionMs: day });
    peer('carol', { storage });
    const after = Date.now();
    await quiet();

    expect(purges).toHaveLength(2);
    expect(purges[0]).toBeGreaterThanOrEqual(before - day);
    expect(purges[0]).toBeLessThanOrEqual(after - day);
    expect(purges[1]).toBeGreaterThanOrEqual(before - 7 * day);
    expect(purges[1]).toBeLessThanOrEqual(after - 7 * day);
  });
});

describe('history', () => {
  /** Has `of` start and at once withdraw `count` sends, each of which then counts as finished. */
  async function withdrawnSends(of: Peer, count: number, label = 'withdrawn'): Promise<void> {
    for (let n = 0; n < count; n++) {
      const sent = await of.engine.send(fileOf(1, `${label}${n}`, n), 'nobody');
      of.engine.cancel(sent.key);
    }
  }

  it('keeps the 50 transfers that finished last and every live one', async () => {
    const alice = peer('alice');
    const live = await alice.engine.send(fileOf(2, 'live'), 'nobody');

    await withdrawnSends(alice, 60);

    const names = alice.engine.transfers().map((snapshot) => snapshot.name);
    expect(names).toHaveLength(51);
    expect(names.slice(0, 2)).toEqual(['live', 'withdrawn10']);
    expect(names.at(-1)).toBe('withdrawn59');
    expect(lists(alice, live.key)).toBe(true);
  });

  it('forgets by the order of finishing, not of starting', async () => {
    const alice = peer('alice');
    const startedFirst = await alice.engine.send(fileOf(2, 'started first'), 'nobody');
    await withdrawnSends(alice, 50);

    alice.engine.cancel(startedFirst.key);
    await withdrawnSends(alice, 1, 'one more');

    const names = alice.engine.transfers().map((snapshot) => snapshot.name);
    expect(names).toHaveLength(50);
    expect(names[0]).toBe('started first');
    expect(names).not.toContain('withdrawn0');
    expect(names).not.toContain('withdrawn1');
  });

  it('still tells the sender when a transfer completes after 50 later ones finished', async () => {
    const alice = peer('alice');
    const bob = peer('bob');
    afterPieces('alice', 1, 'hold');
    const { sent, offer } = await exchange(alice, bob, fileOf(2 * PIECE_SIZE));
    await until(() => receivedBytes(bob, offer.key) === PIECE_SIZE, 'bob holds one piece');
    await reaches(alice, sent.key, 'verifying');
    await withdrawnSends(bob, 50);
    const [bobLink] = network.linksOf('bob');
    network.tap = (_link, type) => (type === 'complete' ? 'hold' : 'pass');

    network.linksOf('alice')[0].release();
    await reaches(bob, offer.key, 'complete');
    await quiet();
    expect(bobLink.closed).toBe(false);
    bobLink.release();
    await reaches(alice, sent.key, 'complete');

    expect(lists(bob, offer.key)).toBe(true);
    expect(bob.engine.transfers()).toHaveLength(50);
    expect(bob.delivered).toHaveLength(1);
    expect(hub.sentOf('offer').filter((signal) => signal.from === 'alice')).toHaveLength(1);
  });

  it('does not forget a transfer while its link still carries the last word', async () => {
    const alice = peer('alice', { idleTimeoutMs: 10 * MINUTE });
    const bob = peer('bob', { idleTimeoutMs: 30 * SECOND });
    network.tap = (_link, type) => (type === 'complete' ? 'drop' : 'pass');
    const { offer } = await exchange(alice, bob, fileOf(10));
    await reaches(bob, offer.key, 'complete');
    const [kept] = network.linksOf('bob');

    await withdrawnSends(bob, 50);
    expect(lists(bob, offer.key)).toBe(true);
    expect(kept.closed).toBe(false);

    // Alice must not come back for the word: that would give the transfer a link again.
    hub.drop = (signal) => signal.from === 'alice';
    vi.advanceTimersByTime(30 * SECOND);
    expect(kept.closed).toBe(true);
    await withdrawnSends(bob, 1, 'one more');
    expect(lists(bob, offer.key)).toBe(false);
    expect(bob.engine.transfers()).toHaveLength(50);
  });

  it.each([
    ['rejected by the user', (bob: Peer, key: string) => bob.engine.reject(key), 'rejected'],
    ['withdrawn by its sender', (_bob: Peer, _key: string) => hub.peer('mallory').sendCancel('bob', idOf(1)), 'cancelled'],
    ['left to expire', () => vi.advanceTimersByTime(5 * MINUTE), 'failed'],
  ] as const)('publishes the end of an offer %s and then does not keep it', async (_how, end, state) => {
    const bob = peer('bob');
    hub.peer('mallory').sendOffer('bob', { id: idOf(1), name: 'unwanted', size: 5 }, SOME_OFFER, 'first');
    const offer = await incomingOffer(bob);

    end(bob, offer.key);
    await until(() => current(bob, offer.key).state === state, `the offer is ${state}`);

    expect(states(bob, offer.key)).toEqual(['offered', state]);
    expect(bob.engine.transfers()).toEqual([]);
    expect(() => bob.engine.cancel(offer.key)).toThrow(expect.objectContaining({ code: 'unknown-transfer' }));
  });

  it('does not let offers nobody accepted push real transfers out', async () => {
    const alice = peer('alice');
    const bob = peer('bob');
    const { offer } = await transfer(alice, bob, fileOf(10));
    const mallory = hub.peer('mallory');

    for (let n = 0; n < 60; n++) {
      mallory.sendOffer('bob', { id: idOf(n), name: `spam${n}`, size: 5 }, SOME_OFFER, 'first');
      mallory.sendCancel('bob', idOf(n));
    }
    await quiet();

    expect(bob.engine.transfers().map((snapshot) => snapshot.key)).toEqual([offer.key]);
    expect(bob.changes.filter((snapshot) => snapshot.state === 'cancelled')).toHaveLength(60);
  });
});

describe('a sender that keeps offering', () => {
  it('ends a live transfer once the sender has offered it again too often without sending a piece', async () => {
    const alice = peer('alice');
    const bob = peer('bob', { maxReconnects: 3 });
    afterPieces('alice', 1, 'hold');
    const { sent, offer } = await exchange(alice, bob, fileOf(2 * PIECE_SIZE));
    await until(() => receivedBytes(bob, offer.key) === PIECE_SIZE, 'bob holds one piece');
    const flood = hub.peer('alice');
    // Only the flood gets through, not what alice's engine offers when her link closes.
    hub.drop = (signal) => signal.kind === 'offer' && signal.description !== SOME_OFFER;

    for (let n = 0; n < 4; n++) flood.sendOffer('bob', hubOffer(0).offer, SOME_OFFER, 'resume');
    await quiet();
    expect(current(bob, offer.key).state).toBe('connecting');
    expect(network.linksOf('bob')).toHaveLength(1 + 4);

    for (let n = 0; n < 300; n++) flood.sendOffer('bob', hubOffer(0).offer, SOME_OFFER, 'resume');
    await quiet();

    // Not a lost link, which a later resume could mend: every further offer is turned down
    // unseen, and what was stored is dropped.
    expect(errorCode(bob, offer.key)).toBe('protocol');
    expect(network.linksOf('bob')).toHaveLength(1 + 4);
    expect(network.linksOf('bob').every((link) => link.closed)).toBe(true);
    expect(hub.sentOf('reject')).toHaveLength(300);
    expect(await heldBy(bob, 'alice', sent.id)).toEqual([]);
    expect(undecided(bob)).toEqual([]);
  });

  it('confirms a delivered file only so many times, then rejects', async () => {
    const alice = peer('alice');
    const bob = peer('bob', { maxReconnects: 3 });
    const { sent } = await transfer(alice, bob, fileOf(10));
    await quiet();
    const flood = hub.peer('alice');
    const linksBefore = network.linksOf('bob').length;

    for (let n = 0; n < 300; n++) flood.sendOffer('bob', hubOffer(0).offer, SOME_OFFER, 'resume');
    await quiet();

    expect(network.linksOf('bob')).toHaveLength(linksBefore + 4);
    expect(hub.sentOf('reject').filter((signal) => signal.id === sent.id)).toHaveLength(296);
    expect(undecided(bob)).toEqual([]);
    expect(bob.delivered).toHaveLength(1);
  });
});

describe('flow control', () => {
  it('keeps a fast sender within the window while the receiver stores slowly', async () => {
    const alice = peer('alice');
    const gate = createGatedStorage(createMemoryTransferStorage());
    const bob = peer('bob', { storage: gate.storage });
    const pieces = 3 * SEND_WINDOW + 5;
    const file = fileOf(pieces * PIECE_SIZE - 9);
    gate.gated = true;

    const { sent } = await exchange(alice, bob, file);
    const [aliceLink] = network.linksOf('alice');
    const [bobLink] = network.linksOf('bob');
    await until(() => aliceLink.count('piece') === SEND_WINDOW, 'alice has filled the window');
    await quiet();
    expect(aliceLink.count('piece')).toBe(SEND_WINDOW);
    expect(gate.putsStarted).toEqual([0]);

    let mostUnprocessed = 0;
    while (current(alice, sent.key).state !== 'complete') {
      mostUnprocessed = Math.max(mostUnprocessed, bobLink.countReceived('piece') - gate.putsFinished);
      gate.releaseNext();
      await turn();
    }

    expect(mostUnprocessed).toBe(SEND_WINDOW);
    expect(aliceLink.count('piece')).toBe(pieces);
    expect(bobLink.sentTypes.filter((type) => type === 'stored')).toHaveLength(
      Math.floor(pieces / STORED_REPORT_INTERVAL),
    );
    expect(sameBytes(await contentOf(bob.delivered[0].blob), bytesOf(file.size))).toBe(true);
  });

  it('counts pieces the receiver already held towards the window', async () => {
    const alice = peer('alice');
    const bob = peer('bob');
    const pieces = 2 * SEND_WINDOW;
    const file = fileOf(pieces * PIECE_SIZE);
    // Alice is told that bob holds nothing, though he holds every piece but the last.
    network.tap = (link, type) =>
      link.owner === 'bob' && type === 'ready' ? encodeFrame({ type: 'ready', have: [] }) : 'pass';
    const id = await computeContentId(file);
    const content = bytesOf(file.size);
    for (let index = 0; index < pieces - 1; index++) {
      const piece = content.slice(index * PIECE_SIZE, (index + 1) * PIECE_SIZE);
      await bob.storage.putPiece({ from: 'alice', id }, index, piece.buffer);
    }

    const { sent } = await transfer(alice, bob, file);

    expect(network.linksOf('alice')[0].count('piece')).toBe(pieces);
    expect(current(alice, sent.key).state).toBe('complete');
    expect(sameBytes(await contentOf(bob.delivered[0].blob), content)).toBe(true);
  });

  it('fails a sender that overruns the window, before its pieces pile up', async () => {
    const alice = peer('alice');
    const gate = createGatedStorage(createMemoryTransferStorage());
    const bob = peer('bob', { storage: gate.storage });
    gate.gated = true;
    const { sent, offer } = await exchange(alice, bob, fileOf(2 * SEND_WINDOW * PIECE_SIZE));
    const [bobLink] = network.linksOf('bob');
    await until(() => bobLink.countReceived('piece') === SEND_WINDOW, 'the window is full at bob');
    await quiet();
    expect(current(bob, offer.key).state).toBe('transferring');

    const beyond = encodeFrame({ type: 'piece', index: SEND_WINDOW, bytes: new ArrayBuffer(PIECE_SIZE) });
    bobLink.inject(beyond);

    expect(errorCode(bob, offer.key)).toBe('protocol');
    await reaches(alice, sent.key, 'failed');
    expect(errorCode(alice, sent.key)).toBe('protocol');
    expect(gate.putsStarted).toEqual([0]);
  });

  it.each([
    ['more pieces than were sent', 2],
    ['fewer pieces than it reported before', STORED_REPORT_INTERVAL - 1],
  ])('fails with protocol when the receiver reports %s', async (_label, count) => {
    const alice = peer('alice');
    const bob = peer('bob');
    // Either one piece is out and unreported, or seventeen are out and sixteen reported.
    afterPieces('alice', count === 2 ? 0 : STORED_REPORT_INTERVAL, 'stall');
    const { sent } = await exchange(alice, bob, fileOf(2 * STORED_REPORT_INTERVAL * PIECE_SIZE));
    const [aliceLink] = network.linksOf('alice');
    const reports = count === 2 ? 0 : 1;
    await until(
      () => aliceLink.countReceived('stored') === reports && aliceLink.count('piece') > reports * 16,
      'alice is mid-transfer',
    );
    await quiet();

    aliceLink.inject(encodeFrame({ type: 'stored', count }));
    await reaches(alice, sent.key, 'failed');

    expect(errorCode(alice, sent.key)).toBe('protocol');
  });

  it('fails a receiver that is sent a stored frame', async () => {
    const alice = peer('alice');
    const bob = peer('bob');
    afterPieces('alice', 0, 'stall');
    const { offer } = await exchange(alice, bob, fileOf(PIECE_SIZE));
    await reaches(bob, offer.key, 'transferring');

    network.linksOf('bob')[0].inject(encodeFrame({ type: 'stored', count: 0 }));
    await reaches(bob, offer.key, 'failed');

    expect(errorCode(bob, offer.key)).toBe('protocol');
  });
});

describe('a listener that throws', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('is reported, and neither the other listeners nor the transfer notice', async () => {
    const reportError = vi.fn();
    vi.stubGlobal('reportError', reportError);
    const alice = peer('alice');
    const bob = peer('bob');
    const broken = new Error('listener bug');
    const seenAfterwards: TransferState[] = [];
    alice.engine.on('change', () => {
      throw broken;
    });
    alice.engine.on('change', (snapshot) => seenAfterwards.push(snapshot.state));

    const { sent } = await transfer(alice, bob, fileOf(PIECE_SIZE + 1));

    expect(current(alice, sent.key).state).toBe('complete');
    expect(seenAfterwards).toEqual(alice.changes.map((snapshot) => snapshot.state));
    expect(reportError).toHaveBeenCalledTimes(alice.changes.length);
    expect(reportError).toHaveBeenCalledWith(broken);
    expect(await contentOf(bob.delivered[0].blob)).toEqual(bytesOf(PIECE_SIZE + 1));
  });

  it('is rethrown out of band where there is no reportError', async () => {
    const alice = peer('alice');
    const broken = new Error('listener bug');
    let thrown = false;
    alice.engine.on('change', () => {
      if (thrown) return;
      thrown = true;
      throw broken;
    });
    const later: Array<() => void> = [];
    vi.stubGlobal('reportError', undefined);
    vi.stubGlobal('queueMicrotask', (task: () => void) => later.push(task));

    const sending = alice.engine.send(fileOf(10), 'bob');
    vi.unstubAllGlobals();

    expect(later).toHaveLength(1);
    expect(later[0]).toThrow(broken);
    expect((await sending).state).toBe('offered');
  });
});

describe('the fake link', () => {
  async function linkedPair() {
    const received: ArrayBuffer[] = [];
    const quietly = { onCandidate: () => {}, onOpen: () => {}, onDown: () => {} };
    const near = network.factory('near')({ ...quietly, onFrame: () => {} }) as FakeLink;
    const far = network.factory('far')({ ...quietly, onFrame: (frame) => received.push(frame) });
    await near.acceptAnswer(await far.acceptOffer(await near.createOffer()));
    await quiet();
    return { near, received };
  }

  it('loses a frame sent just before it is closed, even one whose send has settled', async () => {
    const { near, received } = await linkedPair();

    await near.send(encodeFrame({ type: 'complete' })).then(() => near.close());
    await quiet();

    expect(received).toEqual([]);
  });

  it('holds only so many candidates before it knows its far end, as a real link does', async () => {
    const link = network.factory('near')({
      onCandidate: () => {},
      onOpen: () => {},
      onFrame: () => {},
      onDown: () => {},
    }) as FakeLink;
    await link.createOffer();

    for (let n = 0; n < MAX_HELD_CANDIDATES + 10; n++) await link.addCandidate({ candidate: `c${n}` });

    expect(MAX_HELD_CANDIDATES).toBe(64);
    expect(link.candidates).toHaveLength(MAX_HELD_CANDIDATES);
  });

  it('carries such a frame when told that closing loses nothing', async () => {
    network.closeLosesFramesInFlight = false;
    const { near, received } = await linkedPair();

    await near.send(encodeFrame({ type: 'complete' })).then(() => near.close());
    await quiet();

    expect(received).toHaveLength(1);
  });
});

describe('dispose', () => {
  it('stops mid-transfer without signalling, leaving timers or publishing', async () => {
    const alice = peer('alice');
    const bob = peer('bob');
    afterPieces('alice', 1, 'stall');
    const { sent, offer } = await exchange(alice, bob, fileOf(3 * PIECE_SIZE));
    await until(() => receivedBytes(bob, offer.key) === PIECE_SIZE, 'bob holds one piece');
    await alice.engine.send(fileOf(10, 'pending.bin', 3), 'bob');
    await incomingOffer(bob, 'pending.bin');
    const signals = hub.sent.length;
    const changes = [alice.changes.length, bob.changes.length];
    expect(vi.getTimerCount()).toBeGreaterThan(0);

    alice.engine.dispose();
    bob.engine.dispose();
    const timersLeft = vi.getTimerCount();
    network.linksOf('alice')[0].release();
    await quiet();

    expect(timersLeft).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
    expect(hub.sent).toHaveLength(signals);
    expect([alice.changes.length, bob.changes.length]).toEqual(changes);
    expect(network.links.every((link) => link.closed)).toBe(true);
    expect(await heldBy(bob, 'alice', sent.id)).toEqual([0]);
  });

  it('closes the storage and stops listening for signals', async () => {
    const storage = createMemoryTransferStorage();
    const close = vi.spyOn(storage, 'close');
    const bob = peer('bob', { storage });

    bob.engine.dispose();
    hub.peer('mallory').sendOffer('bob', { id: idOf(1), name: 'a', size: 1 }, SOME_OFFER, 'first');
    await quiet();

    expect(close).toHaveBeenCalledTimes(1);
    expect(bob.changes).toEqual([]);
  });

  it('forgets its transfers and refuses further use', async () => {
    const alice = peer('alice');
    peer('bob');
    const sent = await alice.engine.send(fileOf(10), 'bob');

    alice.engine.dispose();
    alice.engine.dispose();

    expect(alice.engine.transfers()).toEqual([]);
    await expect(alice.engine.send(fileOf(10), 'bob')).rejects.toThrow(/disposed/);
    await expect(alice.engine.accept(sent.key)).rejects.toMatchObject({ code: 'unknown-transfer' });
    expect(() => alice.engine.cancel(sent.key)).toThrow(expect.objectContaining({ code: 'unknown-transfer' }));
    expect(() => alice.engine.reject(sent.key)).toThrow(expect.objectContaining({ code: 'unknown-transfer' }));
  });

  it('abandons a send that was still preparing', async () => {
    const alice = peer('alice');
    peer('bob');

    const sending = alice.engine.send(fileOf(3 * PIECE_SIZE), 'bob');
    alice.engine.dispose();
    const result = await sending;
    await quiet();

    expect(result.state).toBe('preparing');
    expect(hub.sent).toEqual([]);
    expect(network.links).toEqual([]);
  });

  it('swallows the rejection of an answer still being made', async () => {
    const alice = peer('alice');
    const bob = peer('bob');
    await alice.engine.send(fileOf(10), 'bob');
    const offer = await incomingOffer(bob);
    const proceed = network.holdNegotiation();

    const accepting = bob.engine.accept(offer.key);
    bob.engine.dispose();
    proceed();

    await expect(accepting).resolves.toBeUndefined();
    expect(hub.sentOf('answer')).toEqual([]);
  });
});
