import { afterEach, describe, expect, it, vi } from 'vitest';
import { OfferTable } from './offers';
import { SessionPool } from './sessionPool';
import { StorageDatabase } from './storageDatabase';
import { Phase1Hub, RtcNetwork } from './testHarness';
import { chooseTransport } from './transportChoice';
import { polyfillBlobArrayBuffer } from '../fileTransfer/testHarness';
import type { TransferSnapshot } from '../fileTransfer/types';
import { IDBFactory } from 'fake-indexeddb';
import { check } from './protocol';
polyfillBlobArrayBuffer();
const cleanups: (() => void | Promise<void>)[] = [];
function present<T>(value: T | undefined): T {
  check(value !== undefined);
  return value;
}
afterEach(async () => {
  for (const f of cleanups.splice(0)) await f();
});
async function until(check: () => boolean): Promise<void> {
  await vi.waitFor(() => expect(check()).toBe(true), { timeout: 2500, interval: 10 });
}
async function pair(persistent = false) {
  if (persistent) globalThis.indexedDB = new IDBFactory();
  const hub = new Phase1Hub();
  const rtc = new RtcNetwork();
  const a = hub.peer('#1');
  const b = hub.peer('#2');
  for (const p of [a, b])
    p.peer.send('Hello', {
      req: crypto.randomUUID().replaceAll('-', ''),
      endpoint: crypto.randomUUID().replaceAll('-', ''),
      peer: 1,
      files: 1,
      data: 1,
      features: ['base'],
      maxReceiveSize: 104857600,
    });
  await until(() => Boolean(a.ready && b.ready));
  const client = async (p: typeof a) => {
    const db = new StorageDatabase(p.player, persistent);
    await db.open();
    const changes: TransferSnapshot[] = [];
    const ready = p.ready;
    check(ready);
    const table = new OfferTable({
      self: ready,
      files: p.files,
      storage: db,
      live: () => Boolean(p.ready),
      change: (s) => changes.push(s),
      changed: () => {},
    });
    const pool = new SessionPool(
      p.peer,
      ready,
      () => Boolean(p.ready),
      {
        authorized: (p, o) => table.authorized(p, o),
        control: (s, m) => table.control(s, m),
        channel: (s, c) => table.channel(s, c),
        established: (s) => table.established(s),
        lost: (s, r) => table.lost(s, r),
      },
      rtc.create,
    );
    table.attach(pool);
    cleanups.push(() => {
      table.dispose();
      pool.dispose();
      return db.close();
    });
    return { table, pool, db, changes, port: p, ready };
  };
  return { hub, rtc, a: await client(a), b: await client(b), connect: client };
}
describe('Phase 1 direct sends against the independent hub contract', () => {
  it.each([
    'rate',
    'busy',
  ])('G: retains a verified receipt and retries Outcome after %s until acknowledged', async (code) => {
    const { hub, a, b } = await pair();
    hub.outcomeErrors = [code as 'rate' | 'busy'];
    await a.table.send(new File(['received'], 'outcome.txt'), b.ready.self, 104857600);
    await until(() => b.table.snapshots().length === 1);
    await b.table.accept(b.table.snapshots()[0].key);
    await until(() => b.table.details()[0].outcome === 'verified');
    expect(b.table.snapshots()[0].state).toBe('complete');
    await until(() => [...hub.offers.values()][0].state === 'received');
    expect(b.port.files.sent.filter((m) => m.kind === 'Outcome')).toHaveLength(2);
    expect(b.table.snapshots()[0].state).toBe('complete');
  });
  it.each([
    'verify',
    'saveReceipt',
  ] as const)('commits verification and sends Outcome after session loss during %s', async (method) => {
    const { hub, rtc, a, b } = await pair();
    const original = b.db[method].bind(b.db);
    // Sever the data session after the storage work completes but before its caller resumes.
    const spy = vi.spyOn(b.db, method).mockImplementation((async (...args: never[]) => {
      const result = await (original as (...args: never[]) => Promise<unknown>)(...args);
      rtc.pcs[0].sever();
      return result;
    }) as never);
    await a.table.send(new File(['verified once'], 'loss.txt'), b.ready.self, 104857600);
    await until(() => b.table.snapshots().length === 1);
    await b.table.accept(b.table.snapshots()[0].key);
    await until(() => b.table.details()[0].outcome === 'verified');
    await until(() => [...hub.offers.values()][0].state === 'received');
    expect(b.table.snapshots()[0].state).toBe('complete');
    expect(spy).toHaveBeenCalledTimes(1);
  });
  it('keeps Save available and retained bytes after a browser download handoff', async () => {
    const { a, b } = await pair();
    vi.stubGlobal(
      'URL',
      Object.assign(URL, { createObjectURL: vi.fn(() => 'blob:test'), revokeObjectURL: vi.fn() }),
    );
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    try {
      await a.table.send(new File(['retry save'], 'save.txt'), b.ready.self, 104857600);
      await until(() => b.table.snapshots().length === 1);
      const key = b.table.snapshots()[0].key;
      await b.table.accept(key);
      await until(() => b.table.details()[0].canSave);
      await b.table.save(key);
      expect(b.table.details()[0].canSave).toBe(true);
      await b.table.save(key);
      expect(click).toHaveBeenCalledTimes(2);
      expect(b.table.details()[0].saveError).toBeUndefined();
    } finally {
      click.mockRestore();
      vi.unstubAllGlobals();
    }
  });
  it('pauses receive credits when the owner bucket is exhausted', async () => {
    const { a, b } = await pair();
    // biome-ignore lint/complexity/useLiteralKeys: exercise the private receive bucket without changing the public API.
    const bucket = b.table['ownerDownload'];
    const take = vi.spyOn(bucket, 'take').mockReturnValueOnce(false).mockReturnValueOnce(false);
    await a.table.send(new File(['backpressure'], 'paced.txt'), b.ready.self, 104857600);
    await until(() => b.table.snapshots().length === 1);
    await b.table.accept(b.table.snapshots()[0].key);
    await until(() => b.table.snapshots()[0].state === 'complete');
    expect(take.mock.calls.length).toBeGreaterThan(2);
    expect(b.changes.some((s) => s.state === 'failed')).toBe(false);
  });
  it('an unreadable upload and a refused storage reservation each fail only their operation', async () => {
    const { a, b } = await pair();
    const bad = new File(['unreadable'], 'bad.txt');
    await a.table.send(bad, b.ready.self, 104857600);
    await a.table.send(new File(['healthy'], 'good.txt'), b.ready.self, 104857600);
    await until(() => b.table.snapshots().length === 2);
    vi.spyOn(bad, 'slice').mockImplementation(() => {
      throw new Error('NotReadableError');
    });
    await Promise.all(b.table.snapshots().map((s) => b.table.accept(s.key)));
    await until(() => b.table.snapshots().find((s) => s.name === 'good.txt')?.state === 'complete');
    expect(a.table.snapshots().find((s) => s.name === 'bad.txt')?.state).toBe('failed');
    expect(a.table.snapshots().find((s) => s.name === 'good.txt')?.state).toBe('complete');
  });
  it('a storage error accepting one push leaves its session and another operation alive', async () => {
    const { a, b } = await pair();
    await a.table.send(new File(['one'], 'one.txt'), b.ready.self, 104857600);
    await a.table.send(new File(['two'], 'two.txt'), b.ready.self, 104857600);
    await until(() => b.table.snapshots().length === 2);
    const reserve = b.db.reserve.bind(b.db);
    const counts = new Map<string, number>();
    vi.spyOn(b.db, 'reserve').mockImplementation(async (binding) => {
      const count = (counts.get(binding.offer) ?? 0) + 1;
      counts.set(binding.offer, count);
      if (binding.meta.name === 'one.txt' && count === 2) throw new Error('Disk full');
      return reserve(binding);
    });
    await Promise.all(b.table.snapshots().map((s) => b.table.accept(s.key)));
    await until(() => b.table.snapshots().find((s) => s.name === 'two.txt')?.state === 'complete');
    expect(a.pool.forPeer(b.ready.self)?.live).toBe(true);
  });
  it('Revoke alone stops the referenced work', async () => {
    const { rtc, a, b } = await pair();
    rtc.tap = (_c, data) =>
      data instanceof ArrayBuffer && new Uint8Array(data)[0] === 1 ? 'hold' : 'pass';
    await a.table.send(new File(['private'], 'revoke.txt'), b.ready.self, 104857600);
    await until(() => b.table.snapshots().length === 1);
    await b.table.accept(b.table.snapshots()[0].key);
    await until(() => b.table.snapshots()[0].state === 'transferring');
    b.port.files.deliver('Revoke', {
      event: crypto.randomUUID().replaceAll('-', ''),
      peer: a.ready.self,
      scope: 'offer',
      offer: present(b.port.files.sent.find((m) => m.kind === 'Respond')).data.offer,
      reason: 'policy',
    });
    rtc.release();
    await until(() => b.table.snapshots()[0].state === 'cancelled');
    expect((await b.db.receipts()).some((r) => r.state === 'received')).toBe(false);
  });
  it('asks again after reload, then adopts same-sender partials without restoring old consent', async () => {
    const { hub, rtc, a, b, connect } = await pair(true);
    const file = new File([new Uint8Array(3 * 16384)], 'reload.bin');
    rtc.tap = (_c, data) =>
      data instanceof ArrayBuffer &&
      new Uint8Array(data)[0] === 1 &&
      new DataView(data).getUint32(1) >= 1
        ? 'hold'
        : 'pass';
    await a.table.send(file, b.ready.self, 104857600);
    await until(() => b.table.snapshots().length === 1);
    await b.table.accept(b.table.snapshots()[0].key);
    await until(() => b.table.snapshots()[0].transferredBytes === 16384);
    hub.end(b.port, 'shutdown');
    b.table.dispose();
    b.pool.dispose();
    await b.db.close();
    const port = hub.peer('#2');
    port.peer.send('Hello', {
      req: crypto.randomUUID().replaceAll('-', ''),
      endpoint: crypto.randomUUID().replaceAll('-', ''),
      peer: 1,
      files: 1,
      data: 1,
      features: ['base'],
      maxReceiveSize: 104857600,
    });
    await until(() => Boolean(port.ready));
    const reloaded = await connect(port);
    rtc.tap = () => 'pass';
    await a.table.send(file, reloaded.ready.self, 104857600);
    await until(() => reloaded.table.snapshots().length === 1);
    expect(reloaded.table.snapshots()[0].state).toBe('offered');
    await reloaded.table.accept(reloaded.table.snapshots()[0].key);
    await until(() => reloaded.table.snapshots()[0].state === 'complete');
    const frames = rtc.sent.filter(
      (m) => m.data instanceof ArrayBuffer && new Uint8Array(m.data)[0] === 2,
    );
    const last = new DataView(present(frames.at(-1)).data as ArrayBuffer);
    expect(last.getUint16(2)).toBe(1);
    expect(last.getUint32(8)).toBe(1);
  });
  it('does not disclose SDP before consent; binds, verifies, receipts, and waits for explicit Save', async () => {
    const { hub, rtc, a, b } = await pair();
    await a.table.send(new File(['private bytes'], 'test.txt'), b.ready.self, 104857600);
    await until(() => b.table.snapshots().length === 1);
    expect(rtc.pcs).toHaveLength(0);
    const key = b.table.snapshots()[0].key;
    await b.table.accept(key);
    await until(() => b.table.snapshots()[0].state === 'complete');
    await until(() => a.table.snapshots()[0].state === 'complete');
    expect([...hub.offers.values()][0].state).toBe('received');
    expect(b.table.details()[0]).toMatchObject({ outcome: 'verified', canSave: true });
    const data = rtc.sent.filter((m) => m.channel.label.startsWith('t:'));
    expect(JSON.parse(data[0].data as string).op).toBe('bind');
    expect(JSON.parse(data[1].data as string).op).toBe('bound');
    expect(new Uint8Array(data[2].data as ArrayBuffer)[0]).toBe(2);
    const receipt = await b.db.receipts();
    expect(receipt[0].state).toBe('received');
    for (const client of [a, b]) {
      const candidates = client.port.peer.sent.filter((m) => m.kind === 'Candidate');
      expect(candidates.filter((m) => m.data.end === true)).toHaveLength(1);
      expect(candidates.some((m) => 'candidate' in m.data)).toBe(true);
    }
    expect(rtc.pcs.every((pc) => pc.ice.length === 2)).toBe(true);
  });
  it('multiplexes distinct same-content decisions on one PC per pair, and cancellation is scoped', async () => {
    const { rtc, a, b } = await pair();
    rtc.tap = (_c, data) =>
      data instanceof ArrayBuffer && new Uint8Array(data)[0] === 1 ? 'hold' : 'pass';
    const file = new File([new Uint8Array(20000)], 'same.txt');
    await a.table.send(file, b.ready.self, 104857600);
    await a.table.send(file, b.ready.self, 104857600);
    await until(() => b.table.snapshots().length === 2);
    await b.table.accept(b.table.snapshots()[0].key);
    await b.table.accept(b.table.snapshots()[1].key);
    await until(
      () =>
        rtc.sent.filter((m) => m.data instanceof ArrayBuffer && new Uint8Array(m.data)[0] === 1)
          .length >= 2,
    );
    a.table.cancel(a.table.snapshots()[0].key);
    rtc.tap = () => 'pass';
    rtc.release();
    await until(() => b.table.snapshots()[1].state === 'complete');
    expect(b.table.snapshots()[0].state).toBe('cancelled');
    expect(rtc.pcs).toHaveLength(2);
  });
  it('handles zero bytes and simultaneous opposite sends with one reserved pair', async () => {
    const { hub, rtc, a, b } = await pair();
    await Promise.all([
      a.table.send(new File([], 'empty'), b.ready.self, 104857600),
      b.table.send(new File([], 'other empty'), a.ready.self, 104857600),
    ]);
    await until(() => a.table.snapshots().length === 2 && b.table.snapshots().length === 2);
    await Promise.all([
      a.table.accept(present(a.table.snapshots().find((s) => s.direction === 'receive')).key),
      b.table.accept(present(b.table.snapshots().find((s) => s.direction === 'receive')).key),
    ]);
    await until(() =>
      [...a.table.snapshots(), ...b.table.snapshots()].every((s) => s.state === 'complete'),
    );
    expect(hub.sessions.size).toBe(1);
    expect(rtc.pcs).toHaveLength(2);
  });
  it('uses explicit legacyV1 discovery and never downgrades after a failed operation', async () => {
    const { hub, a, b } = await pair();
    hub.peer('#3', true);
    expect((await chooseTransport(a.port.peer, '#3')).transport).toBe('v1');
    expect((await chooseTransport(a.port.peer, '#2')).transport).toBe('v2');
    hub.gag('#1', '#2');
    await expect(chooseTransport(a.port.peer, '#2')).rejects.toThrow('unavailable');
    expect(b.table.snapshots()).toEqual([]);
  });
  it('gag revokes established work before further pieces are committed', async () => {
    const { hub, rtc, a, b } = await pair();
    rtc.tap = (_c, data) =>
      data instanceof ArrayBuffer && new Uint8Array(data)[0] === 1 ? 'hold' : 'pass';
    await a.table.send(new File(['private'], 'secret.txt'), b.ready.self, 104857600);
    await until(() => b.table.snapshots().length === 1);
    await b.table.accept(b.table.snapshots()[0].key);
    await until(() =>
      rtc.sent.some((m) => m.data instanceof ArrayBuffer && new Uint8Array(m.data)[0] === 1),
    );
    hub.gag('#2', '#1');
    rtc.release();
    await until(() => b.table.snapshots()[0].state === 'cancelled');
    expect((await b.db.receipts()).filter((r) => r.state === 'received')).toEqual([]);
  });
  it('reconnects on a fresh session with stable t, increasing a, and retained-piece have', async () => {
    const { rtc, a, b } = await pair();
    rtc.tap = (_c, data) =>
      data instanceof ArrayBuffer &&
      new Uint8Array(data)[0] === 1 &&
      new DataView(data).getUint32(1) >= 1
        ? 'hold'
        : 'pass';
    await a.table.send(
      new File([new Uint8Array(3 * 16384)], 'resume.bin'),
      b.ready.self,
      104857600,
    );
    await until(() => b.table.snapshots().length === 1);
    await b.table.accept(b.table.snapshots()[0].key);
    await until(() => b.table.snapshots()[0].transferredBytes === 16384);
    const first = rtc.sent
      .filter((m) => typeof m.data === 'string')
      .map((m) => JSON.parse(m.data as string))
      .find((m) => m.op === 'push');
    rtc.pcs[0].sever();
    rtc.tap = () => 'pass';
    await until(() => b.table.snapshots()[0].state === 'complete');
    const pushes = rtc.sent
      .filter((m) => typeof m.data === 'string')
      .map((m) => JSON.parse(m.data as string))
      .filter((m) => m.op === 'push');
    expect(pushes).toHaveLength(2);
    expect(pushes[1]).toMatchObject({ t: first.t, a: 2 });
    expect(rtc.pcs).toHaveLength(4);
    const ready = present(
      rtc.sent
        .filter((m) => m.data instanceof ArrayBuffer && new Uint8Array(m.data)[0] === 2)
        .at(-1),
    ).data as ArrayBuffer;
    expect(new DataView(ready).getUint16(2)).toBe(1);
    expect(new DataView(ready).getUint32(8)).toBe(1);
  });
  it('returns its recorded outcome after a lost complete, without a second channel or export', async () => {
    const { hub, rtc, a, b } = await pair();
    hub.dropOutcome = true;
    rtc.tap = (_c, data) =>
      data instanceof ArrayBuffer && new Uint8Array(data)[0] === 3 ? 'drop' : 'pass';
    await a.table.send(new File(['received'], 'once.txt'), b.ready.self, 104857600);
    await until(() => b.table.snapshots().length === 1);
    await b.table.accept(b.table.snapshots()[0].key);
    await until(() => b.table.snapshots()[0].state === 'complete');
    rtc.pcs[0].sever();
    rtc.tap = () => 'pass';
    await until(() => a.table.snapshots()[0].state === 'complete');
    const binds = rtc.sent.filter(
      (m) => typeof m.data === 'string' && JSON.parse(m.data).op === 'bind',
    );
    expect(binds).toHaveLength(1);
    expect(b.table.details()[0].outcome).toBe('verified');
    expect(await b.db.receipts()).toHaveLength(1);
  });
});
