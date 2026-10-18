import { File as NodeFile } from 'node:buffer';
import { describe, expect, it } from 'vitest';
import { LAUNCH_ITEM_LIFETIME_MS, MAX_SHARED_FILES, putLaunchItem, takeLaunchItem } from './launchInbox';
import { SHARE_PARAM } from './launchUrls';
import { handleShareTarget, sharedDraft } from './shareTarget';

const ORIGIN = 'https://client.mongoose.world';

// A File survives IndexedDB in a browser, but not here: jsdom's comes back as a
// plain object and Node's as a nameless Blob. These tests check what is kept and
// how many files; that a file arrives whole is checked against a built preview
// in a real browser (see agent-notes). Node's File gives the handler a real
// size; TypeScript keeps the two File types apart.
function file(contents: string, name: string, type = ''): File {
  return new NodeFile([contents], name, { type }) as unknown as File;
}

/** The fields a browser's share sheet posts, as the handler reads them. */
function post(fields: Record<string, string>, files: File[] = []) {
  return {
    formData: async () => ({
      get: (name: string) => fields[name] ?? null,
      getAll: (name: string) => (name === 'files' ? files : []),
    }),
  };
}

function shareId(response: Response): string | null {
  expect(response.status).toBe(303);
  const location = new URL(response.headers.get('Location') ?? '');
  expect(location.origin + location.pathname).toBe(`${ORIGIN}/`);
  return location.searchParams.get(SHARE_PARAM);
}

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
    await putLaunchItem({ kind: 'share', text: 'new', files: [] }, now + LAUNCH_ITEM_LIFETIME_MS);
    // Purged by the later put, so even a reader with an older clock finds nothing.
    expect(await takeLaunchItem(stale, now)).toBeUndefined();
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
