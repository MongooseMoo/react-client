import { beforeEach, describe, expect, it } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';
import {
  acceptAwayEnvelope, closeAwayStream, disableAwayRecipient, readAwayStream,
  registerAwayRecipient, takeAwayLines, type AwayEnvelope, type BrowserRecipient,
} from './awayV2';

const a: BrowserRecipient = { serverKey: 'https://game.example', installationId: 'installation',
  playerUuid: 'a', playerRef: '#10', bindingId: 'binding-a', revision: 1 };
const b: BrowserRecipient = { ...a, playerUuid: 'b', playerRef: '#11', bindingId: 'binding-b' };
function envelope(recipient = a, overrides: Partial<AwayEnvelope> = {}): AwayEnvelope {
  return { ...recipient, version: 2, streamId: 'stream-1', streamOrder: 1,
    firstAvailable: 1, from: 1, to: 2, lines: [[1, 'one'], [2, 'two']], ...overrides };
}
async function register(recipient = a) {
  return registerAwayRecipient({ ...recipient, version: 2, token: 'synthetic-private', expires_at: Date.now() / 1000 + 3600, sessionId: 'tab-1' }, recipient);
}

describe('recipient and stream owned away storage', () => {
  beforeEach(() => { globalThis.indexedDB = new IDBFactory(); });

  it('keeps identical sequence/stream values separate for two players and renders independently per tab', async () => {
    await register(a);
    await register(b);
    await acceptAwayEnvelope(envelope(a));
    await acceptAwayEnvelope(envelope(b, { lines: [[1, 'private b'], [2, 'other b']] }));
    expect((await takeAwayLines(a, 'tab-1')).lines).toEqual([[1, 'one'], [2, 'two']]);
    expect((await takeAwayLines(a, 'tab-2')).lines).toEqual([[1, 'one'], [2, 'two']]);
    expect((await takeAwayLines(a, 'tab-1')).lines).toEqual([]);
    expect((await takeAwayLines(b, 'tab-1')).lines).toEqual([[1, 'private b'], [2, 'other b']]);
  });

  it('does not acknowledge gaps and reports retention loss before advancing the contiguous receipt', async () => {
    await register();
    expect(await acceptAwayEnvelope(envelope(a, { from: 2, lines: [[2, 'two']] }))).toEqual({ accepted: true, highest: 0, gap: true });
    expect((await takeAwayLines(a, 'tab-1')).lines).toEqual([]);
    expect(await acceptAwayEnvelope(envelope(a, { lines: [[1, 'one']] }))).toEqual({ accepted: true, highest: 2, gap: false });
    expect((await takeAwayLines(a, 'tab-1')).lines).toEqual([[1, 'one'], [2, 'two']]);
    await acceptAwayEnvelope(envelope(a, { firstAvailable: 5, from: 5, to: 5, lines: [[5, 'five']] }));
    expect(await takeAwayLines(a, 'tab-1')).toEqual({ lines: [[5, 'five']], missingBefore: 2 });
  });

  it('rejects delayed older streams and rejects a stale closure of a newer stream', async () => {
    await register();
    await acceptAwayEnvelope(envelope());
    const old = await readAwayStream(a);
    await acceptAwayEnvelope(envelope(a, { streamId: 'stream-2', streamOrder: 2, from: 1, to: 1, lines: [[1, 'new stream']] }));
    await closeAwayStream(a, old?.id ?? 'missing');
    expect((await acceptAwayEnvelope(envelope())).accepted).toBe(false);
    expect((await takeAwayLines(a, 'tab-1')).lines).toEqual([[1, 'new stream']]);
    await closeAwayStream(a, 'stream-2');
    expect((await acceptAwayEnvelope(envelope(a, { streamId: 'stream-2', streamOrder: 2 }))).accepted).toBe(false);
  });

  it('keeps revocation ahead of late registration and does not close or disable another recipient', async () => {
    await register(a);
    await register(b);
    await acceptAwayEnvelope(envelope(b));
    await disableAwayRecipient(a);
    expect(await register(a)).toBe(false);
    expect((await acceptAwayEnvelope(envelope(a))).accepted).toBe(false);
    expect((await takeAwayLines(b, 'tab-1')).lines).toEqual([[1, 'one'], [2, 'two']]);
    const renewed = { ...a, revision: 2 };
    expect(await register(renewed)).toBe(true);
    expect((await acceptAwayEnvelope(envelope(a))).accepted).toBe(false);
    expect((await acceptAwayEnvelope(envelope(renewed))).accepted).toBe(true);
    await closeAwayStream(a, 'stream-1');
    expect((await takeAwayLines(renewed, 'tab-1')).lines).toEqual([[1, 'one'], [2, 'two']]);
  });

  it('never attributes unregistered or malformed input to the current player', async () => {
    await register(a);
    expect((await acceptAwayEnvelope(envelope(b))).accepted).toBe(false);
    expect((await acceptAwayEnvelope(envelope(a, { lines: [[-1, 'invalid']] }))).accepted).toBe(false);
    expect((await takeAwayLines(a, 'tab-1')).lines).toEqual([]);
  });
});
