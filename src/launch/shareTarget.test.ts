import { File as NodeFile } from 'node:buffer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  LAUNCH_ITEM_LIFETIME_MS,
  LaunchInboxError,
  MAX_FILE_NAME_LENGTH,
  MAX_FILE_TYPE_LENGTH,
  MAX_INBOX_BYTES,
  MAX_INBOX_ITEMS,
  MAX_SHARE_BYTES,
  MAX_SHARED_FILE_BYTES,
  MAX_SHARED_FILES,
  boundedLaunchItem,
  discardLaunchItem,
  launchItemBytes,
  pruneLaunchItems,
  putLaunchItem,
  takeLaunchItem,
} from './launchInbox';
import { MAX_LAUNCH_TEXT } from './launchText';
import { SHARE_PARAM } from './launchUrls';
import {
  MAX_SHARE_BODY_BYTES,
  MAX_WAITING_SHARES,
  SHARE_WAIT_LIMIT_MS,
  boundedBody,
  handleShareTarget,
  keepParsedShare,
  sharedDraft,
} from './shareTarget';

const ORIGIN = 'https://client.mongoose.world';
const MIB = 1024 * 1024;
const BOUNDARY = 'share-test-boundary';
const encoder = new TextEncoder();

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

/** A parsed form as the post-parse checks read it. */
function form(fields: Record<string, string>, files: File[] = []) {
  return {
    get: (name: string) => fields[name] ?? null,
    getAll: (name: string) => (name === 'files' ? files : []),
  };
}

/** A multipart/form-data body as a share sheet posts it. */
function multipart(fields: Record<string, string>, files: { name: string; type?: string; contents: string }[] = []): Uint8Array {
  let text = '';
  for (const [name, value] of Object.entries(fields)) {
    text += `--${BOUNDARY}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`;
  }
  for (const shared of files) {
    text += `--${BOUNDARY}\r\nContent-Disposition: form-data; name="files"; filename="${shared.name}"\r\n`;
    text += `Content-Type: ${shared.type ?? 'application/octet-stream'}\r\n\r\n${shared.contents}\r\n`;
  }
  return encoder.encode(`${text}--${BOUNDARY}--\r\n`);
}

function streamOf(bytes: Uint8Array): ReadableStream<Uint8Array> {
  return new ReadableStream({ start(controller) { controller.enqueue(bytes); controller.close(); } });
}

/** A posted share. With no `contentLength` the request says nothing of its size, as a streamed one does not. */
function post(body: ReadableStream<Uint8Array> | null, contentLength?: number) {
  const headers: Record<string, string> = { 'Content-Type': `multipart/form-data; boundary=${BOUNDARY}` };
  if (contentLength !== undefined) headers['Content-Length'] = String(contentLength);
  return { headers: { get: (name: string) => headers[name] ?? null }, body };
}

/** A body that streams `megabytes` of one text field and records how far it was read. */
function endlessText(megabytes: number) {
  const chunk = new Uint8Array(MIB).fill(120);
  const seen = { bytes: 0, cancelled: false };
  let sent = -1;
  const body = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (sent === -1) controller.enqueue(encoder.encode(`--${BOUNDARY}\r\nContent-Disposition: form-data; name="text"\r\n\r\n`));
      else if (sent < megabytes) { seen.bytes += chunk.byteLength; controller.enqueue(chunk); }
      else { controller.enqueue(encoder.encode(`\r\n--${BOUNDARY}--\r\n`)); controller.close(); }
      sent += 1;
    },
    cancel() { seen.cancelled = true; },
  });
  return { body, seen };
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

  it('cuts file names and types a sender made overlong, and counts what is left', () => {
    const long = file('x', `${'n'.repeat(65_540)}.bin`, `application/${'t'.repeat(500)}`);
    const kept = boundedLaunchItem({ kind: 'share', text: '', files: [long] });
    expect(kept.kind === 'share' && kept.files[0].name).toHaveLength(MAX_FILE_NAME_LENGTH);
    expect(kept.kind === 'share' && kept.files[0].type.length).toBeLessThanOrEqual(MAX_FILE_TYPE_LENGTH);
    expect(boundedLaunchItem({ kind: 'database', file: long }).kind === 'database').toBe(true);
  });

  it('counts names, types and text in an item\'s bytes', () => {
    const named = { name: 'n'.repeat(10), type: 't'.repeat(5), size: 100 } as unknown as File;
    expect(launchItemBytes({ kind: 'share', text: 'abc', files: [named] })).toBe(3 * 2 + 100 + (10 + 5) * 2);
    expect(launchItemBytes({ kind: 'database', file: named })).toBe(100 + (10 + 5) * 2);
  });
});

describe('share target', () => {
  it('drafts shared text and keeps shared files for the page it opens', async () => {
    const body = multipart(
      { title: 'Fountain', text: 'look at\nfountain', url: 'https://example.com/f' },
      [{ name: 'map.png', type: 'image/png', contents: 'abc' }, { name: 'empty.txt', contents: '' }],
    );
    const id = shareId(await handleShareTarget(post(streamOf(body), body.byteLength), ORIGIN));
    expect(id).toBeTruthy();
    const item = await takeLaunchItem(id ?? '');
    expect(item?.kind).toBe('share');
    if (item?.kind !== 'share') return;
    expect(item.text).toBe('Fountain look at fountain https://example.com/f');
    // The empty file is dropped.
    expect(item.files).toHaveLength(1);
  });

  it('opens the client without a launch item when nothing was shared', async () => {
    expect(shareId(await handleShareTarget(post(streamOf(multipart({}))), ORIGIN))).toBeNull();
  });

  it('refuses a body declared too large without reading it', async () => {
    const { body, seen } = endlessText(1);
    expect(shareId(await handleShareTarget(post(body, MAX_SHARE_BODY_BYTES + 1), ORIGIN))).toBe('too-large');
    expect(seen.bytes).toBe(0);
  });

  it('stops reading a body of unstated size once it passes the limit', async () => {
    const { body, seen } = endlessText(Math.ceil(MAX_SHARE_BODY_BYTES / MIB) + 1);
    expect(shareId(await handleShareTarget(post(body), ORIGIN))).toBe('too-large');
    expect(seen.cancelled).toBe(true);
    expect(seen.bytes).toBeLessThanOrEqual(MAX_SHARE_BODY_BYTES + MIB);
  });

  it('accepts two shares posted at once, reading them in turn', async () => {
    const [first, second] = await Promise.all([
      handleShareTarget(post(streamOf(multipart({ text: 'first' }))), ORIGIN),
      handleShareTarget(post(streamOf(multipart({ text: 'second' }))), ORIGIN),
    ]);
    const texts = await Promise.all([first, second].map(async (response) => {
      const item = await takeLaunchItem(shareId(response) ?? '');
      return item?.kind === 'share' ? item.text : undefined;
    }));
    expect(texts).toEqual(['first', 'second']);
  });

  describe('while a body is being read', () => {
    let release: () => void = () => {};
    let first: Promise<Response>;
    beforeEach(() => {
      const held = new ReadableStream<Uint8Array>({
        start(controller) {
          let released = false;
          release = () => {
            if (released) return;
            released = true;
            controller.enqueue(multipart({ text: 'first' }));
            controller.close();
          };
        },
      });
      first = handleShareTarget(post(held), ORIGIN);
    });
    afterEach(async () => {
      vi.useRealTimers();
      release();
      await first;
    });

    it(`lets ${MAX_WAITING_SHARES} more wait their turn and turns away the next as busy`, async () => {
      const queued = Array.from({ length: MAX_WAITING_SHARES }, (_, i) =>
        handleShareTarget(post(streamOf(multipart({ text: `waiting ${i}` }))), ORIGIN));
      const overflow = shareId(await handleShareTarget(post(streamOf(multipart({ text: 'one too many' }))), ORIGIN));
      expect(overflow).toBe('busy');
      release();
      expect(shareId(await first)).toMatch(/^[0-9a-f-]{36}$/);
      for (const waiting of queued) expect(shareId(await waiting)).toMatch(/^[0-9a-f-]{36}$/);
    });

    it('turns a waiting share away as busy once it has waited too long', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      const waiting = handleShareTarget(post(streamOf(multipart({ text: 'patient' }))), ORIGIN);
      await vi.advanceTimersByTimeAsync(SHARE_WAIT_LIMIT_MS);
      expect(shareId(await waiting)).toBe('busy');
    });
  });

  it('says the inbox is full when shares keep arriving unopened', async () => {
    for (let i = 0; i < MAX_INBOX_ITEMS; i++) shareId(await handleShareTarget(post(streamOf(multipart({ text: `spam ${i}` }))), ORIGIN));
    expect(shareId(await handleShareTarget(post(streamOf(multipart({ text: 'one more' }))), ORIGIN))).toBe('inbox-full');
  });

  it('bounds the text it keeps', async () => {
    const id = shareId(await handleShareTarget(post(streamOf(multipart({ text: 'x'.repeat(5 * MIB) }))), ORIGIN));
    const item = await takeLaunchItem(id ?? '');
    expect(item?.kind === 'share' && item.text.length).toBe(MAX_LAUNCH_TEXT);
  });

  it('reports a body that is not a form', async () => {
    const request = { headers: { get: () => 'text/plain' }, body: streamOf(encoder.encode('nope')) };
    expect(shareId(await handleShareTarget(request, ORIGIN))).toBe('failed');
  });
});

describe('limits on a parsed share', () => {
  it('refuses too many files', async () => {
    const files = Array.from({ length: MAX_SHARED_FILES + 1 }, (_, i) => file('x', `f${i}.txt`));
    expect(await keepParsedShare(form({}, files))).toBe('too-many');
  });

  it('refuses a file larger than a transfer allows', async () => {
    expect(await keepParsedShare(form({}, [sized(MAX_SHARED_FILE_BYTES + 1)]))).toBe('too-large');
  });

  it('refuses files that together exceed a share', async () => {
    const files = [sized(MAX_SHARED_FILE_BYTES, 'a'), sized(MAX_SHARED_FILE_BYTES, 'b'), sized(1, 'c')];
    expect(files.reduce((sum, f) => sum + f.size, 0)).toBeGreaterThan(MAX_SHARE_BYTES);
    expect(await keepParsedShare(form({}, files))).toBe('too-large');
  });
});

describe('boundedBody', () => {
  it('passes the whole body when it fits', async () => {
    const body = boundedBody(streamOf(encoder.encode('hello')), 5);
    expect(await new Response(body.stream).text()).toBe('hello');
    expect(body.overflowed()).toBe(false);
  });

  it('fails one byte past the limit and cancels the source', async () => {
    let cancelled = false;
    const source = new ReadableStream<Uint8Array>({
      pull(controller) { controller.enqueue(encoder.encode('hello!')); },
      cancel() { cancelled = true; },
    });
    const body = boundedBody(source, 5);
    await expect(new Response(body.stream).text()).rejects.toThrow();
    expect(body.overflowed()).toBe(true);
    await vi.waitFor(() => expect(cancelled).toBe(true));
  });
});

describe('sharedDraft', () => {
  it('drops a part another part already contains', () => {
    expect(sharedDraft('', 'Read this https://example.com/a', 'https://example.com/a')).toBe('Read this https://example.com/a');
  });
});
