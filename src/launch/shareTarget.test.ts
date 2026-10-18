import { File as NodeFile } from 'node:buffer';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  LAUNCH_ITEM_LIFETIME_MS,
  LaunchInboxError,
  MAX_INBOX_BYTES,
  MAX_INBOX_ITEMS,
  MAX_SHARE_BYTES,
  MAX_SHARED_FILE_BYTES,
  MAX_SHARED_FILES,
  discardLaunchItem,
  pruneLaunchItems,
  putLaunchItem,
  takeLaunchItem,
} from './launchInbox';
import { MAX_LAUNCH_TEXT } from './launchText';
import { SHARE_PARAM } from './launchUrls';
import { handleShareTarget, sharedDraft } from './shareTarget';

const ORIGIN = 'https://client.mongoose.world';
const MIB = 1024 * 1024;

// A File survives IndexedDB in a browser, but not here: jsdom's comes back as a
// plain object and Node's as a nameless Blob. These tests check what is kept and
// how many files; that a file arrives whole is checked against a built preview
// in a real browser (see agent-notes). Node's File gives the handler a real
// size; TypeScript keeps the two File types apart.
function file(contents: string, name: string, type = ''): File {
  return new NodeFile([contents], name, { type }) as unknown as File;
}

/** A file that only claims its size, so limits can be tested without allocating them. */
function sized(size: number, name = 'big.bin'): File {
  return { name, size, type: '' } as unknown as File;
}

/** The fields a browser's share sheet posts, as the handler reads them. */
function post(fields: Record<string, string>, files: File[] = [], contentLength?: number) {
  const formData = vi.fn(async () => ({
    get: (name: string) => fields[name] ?? null,
    getAll: (name: string) => (name === 'files' ? files : []),
  }));
  const headers = { get: (name: string) => (name === 'Content-Length' && contentLength !== undefined ? String(contentLength) : null) };
  return { headers, formData };
}

function shareId(response: Response): string | null {
  expect(response.status).toBe(303);
  const location = new URL(response.headers.get('Location') ?? '');
  expect(location.origin + location.pathname).toBe(`${ORIGIN}/`);
  return location.searchParams.get(SHARE_PARAM);
}

beforeEach(async () => {
  await new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase('mongoose-launch');
    request.onsuccess = resolve;
    request.onerror = reject;
  });
});

describe('launch inbox', () => {
  it('hands an item over once', async () => {
    const id = await putLaunchItem({ kind: 'share', text: 'hello', files: [] });
    expect(await takeLaunchItem(id)).toEqual({ kind: 'share', text: 'hello', files: [] });
    expect(await takeLaunchItem(id)).toBeUndefined();
  });

  it('ignores and discards abandoned items', async () => {
    const now = Date.now();
    const old = await putLaunchItem({ kind: 'share', text: 'old', files: [] }, now);
    expect(await takeLaunchItem(old, now + LAUNCH_ITEM_LIFETIME_MS)).toBeUndefined();

    const stale = await putLaunchItem({ kind: 'share', text: 'stale', files: [] }, now);
    await pruneLaunchItems(now + LAUNCH_ITEM_LIFETIME_MS);
    // Gone, so even a reader with an older clock finds nothing.
    expect(await takeLaunchItem(stale, now)).toBeUndefined();
  });

  it(`keeps at most ${MAX_INBOX_ITEMS} items`, async () => {
    for (let i = 0; i < MAX_INBOX_ITEMS; i++) await putLaunchItem({ kind: 'share', text: `share ${i}`, files: [] });
    await expect(putLaunchItem({ kind: 'share', text: 'one more', files: [] })).rejects.toEqual(new LaunchInboxError('inbox-full'));
  });

  it('keeps no more bytes than its budget, counting what is already kept', async () => {
    await putLaunchItem({ kind: 'database', file: sized(MAX_INBOX_BYTES - MIB) });
    await expect(putLaunchItem({ kind: 'database', file: sized(2 * MIB) })).rejects.toEqual(new LaunchInboxError('inbox-full'));
    await expect(putLaunchItem({ kind: 'database', file: sized(MAX_INBOX_BYTES + 1) })).rejects.toEqual(new LaunchInboxError('too-large'));
  });

  it('frees the budget of expired and discarded items', async () => {
    const now = Date.now();
    for (let i = 0; i < MAX_INBOX_ITEMS - 1; i++) await putLaunchItem({ kind: 'share', text: `old ${i}`, files: [] }, now);
    const last = await putLaunchItem({ kind: 'share', text: 'last', files: [] }, now);
    await discardLaunchItem(last);
    await putLaunchItem({ kind: 'share', text: 'room again', files: [] }, now);
    // The rest expire; a later put prunes them in its own transaction.
    await putLaunchItem({ kind: 'share', text: 'later', files: [] }, now + LAUNCH_ITEM_LIFETIME_MS);
    for (let i = 0; i < MAX_INBOX_ITEMS - 1; i++) {
      await putLaunchItem({ kind: 'share', text: `fresh ${i}`, files: [] }, now + LAUNCH_ITEM_LIFETIME_MS);
    }
  });
});

describe('share target', () => {
  it('drafts shared text and keeps shared files for the page it opens', async () => {
    const request = post(
      { title: 'Fountain', text: 'look at\nfountain', url: 'https://example.com/f' },
      [file('abc', 'map.png', 'image/png'), file('', 'empty.txt')],
    );
    const id = shareId(await handleShareTarget(request, ORIGIN));
    expect(id).toBeTruthy();
    const item = await takeLaunchItem(id ?? '');
    expect(item?.kind).toBe('share');
    if (item?.kind !== 'share') return;
    expect(item.text).toBe('Fountain look at fountain https://example.com/f');
    // The empty file is dropped.
    expect(item.files).toHaveLength(1);
  });

  it('opens the client without a launch item when nothing was shared', async () => {
    expect(shareId(await handleShareTarget(post({}), ORIGIN))).toBeNull();
  });

  it('refuses a share with too many files', async () => {
    const files = Array.from({ length: MAX_SHARED_FILES + 1 }, (_, i) => file('x', `f${i}.txt`));
    expect(shareId(await handleShareTarget(post({}, files), ORIGIN))).toBe('too-many');
  });

  it('refuses a file larger than a transfer allows', async () => {
    expect(shareId(await handleShareTarget(post({}, [sized(MAX_SHARED_FILE_BYTES + 1)]), ORIGIN))).toBe('too-large');
  });

  it('refuses files that together exceed a share', async () => {
    const files = [sized(MAX_SHARED_FILE_BYTES, 'a'), sized(MAX_SHARED_FILE_BYTES, 'b'), sized(1, 'c')];
    expect(files.reduce((sum, f) => sum + f.size, 0)).toBeGreaterThan(MAX_SHARE_BYTES);
    expect(shareId(await handleShareTarget(post({}, files), ORIGIN))).toBe('too-large');
  });

  it('refuses a body declared too large without reading it', async () => {
    const request = post({ text: 'hi' }, [], MAX_SHARE_BYTES + 2 * MIB);
    expect(shareId(await handleShareTarget(request, ORIGIN))).toBe('too-large');
    expect(request.formData).not.toHaveBeenCalled();
  });

  it('says the inbox is full when shares keep arriving unopened', async () => {
    for (let i = 0; i < MAX_INBOX_ITEMS; i++) shareId(await handleShareTarget(post({ text: `spam ${i}` }), ORIGIN));
    expect(shareId(await handleShareTarget(post({ text: 'one more' }), ORIGIN))).toBe('inbox-full');
  });

  it('bounds the text it keeps', async () => {
    const id = shareId(await handleShareTarget(post({ text: 'x'.repeat(5 * MIB) }), ORIGIN));
    const item = await takeLaunchItem(id ?? '');
    expect(item?.kind === 'share' && item.text.length).toBe(MAX_LAUNCH_TEXT);
  });

  it('reports a body that is not a form', async () => {
    const request = { formData: async (): Promise<FormData> => { throw new TypeError('Could not parse content as FormData.'); } };
    expect(shareId(await handleShareTarget(request, ORIGIN))).toBe('failed');
  });
});

describe('sharedDraft', () => {
  it('drops a part another part already contains', () => {
    expect(sharedDraft('', 'Read this https://example.com/a', 'https://example.com/a')).toBe('Read this https://example.com/a');
  });
});
