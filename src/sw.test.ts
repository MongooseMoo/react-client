import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { deleteAwayDatabase } from './awayTestHelpers';

const workboxMocks = vi.hoisted(() => ({
  cleanupOutdatedCaches: vi.fn(),
  clientsClaim: vi.fn(),
  precacheAndRoute: vi.fn(),
  registerRoute: vi.fn(),
}));

vi.mock('workbox-core', () => ({
  clientsClaim: workboxMocks.clientsClaim,
}));

vi.mock('workbox-precaching', () => ({
  cleanupOutdatedCaches: workboxMocks.cleanupOutdatedCaches,
  precacheAndRoute: workboxMocks.precacheAndRoute,
}));

vi.mock('workbox-routing', () => ({
  registerRoute: workboxMocks.registerRoute,
}));

vi.mock('workbox-strategies', () => ({
  CacheFirst: vi.fn(),
}));

vi.mock('workbox-expiration', () => ({
  ExpirationPlugin: vi.fn(),
}));

describe('service worker activation', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('activates an installed update without waiting for every tab to close', async () => {
    const skipWaiting = vi.fn();
    vi.stubGlobal('self', {
      __WB_MANIFEST: [],
      addEventListener: vi.fn(),
      skipWaiting,
    });

    await import('./sw');

    expect(skipWaiting).toHaveBeenCalledOnce();
  });

  it('caches same-origin script chunks on demand after checking the precache', async () => {
    vi.stubGlobal('self', {
      __WB_MANIFEST: [],
      addEventListener: vi.fn(),
      skipWaiting: vi.fn(),
      location: new URL('https://client.mongoose.world/sw.js'),
    });
    await import('./sw');

    const audioRequest = {
      url: new URL('https://client.mongoose.world/assets/decoder-hash.js'),
      request: { destination: 'script' },
    };
    const route = workboxMocks.registerRoute.mock.calls.find(([match]) => match(audioRequest));
    expect(route).toBeDefined();
    if (!route) return;
    const [match] = route;
    expect(
      match({ ...audioRequest, url: new URL('https://other.example/assets/decoder-hash.js') }),
    ).toBe(false);
    expect(match({ ...audioRequest, request: { destination: '' } })).toBe(false);
    expect(
      match({ ...audioRequest, url: new URL('https://client.mongoose.world/api/data.js') }),
    ).toBe(false);
    expect(workboxMocks.precacheAndRoute.mock.invocationCallOrder[0]).toBeLessThan(
      workboxMocks.registerRoute.mock.invocationCallOrder[0],
    );
  });
});

describe('service worker push notifications', () => {
  type Listener = (event: unknown) => void;

  let listeners: Record<string, Listener>;
  let showNotification: ReturnType<typeof vi.fn>;
  let openWindow: ReturnType<typeof vi.fn>;
  let matchAll: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv('DEV', false);
    vi.stubEnv('VITE_API_ORIGIN', '');
    listeners = {};
    showNotification = vi.fn(async () => undefined);
    openWindow = vi.fn(async () => null);
    matchAll = vi.fn(async () => []);
    vi.stubGlobal('self', {
      __WB_MANIFEST: [],
      addEventListener: (type: string, listener: Listener) => {
        listeners[type] = listener;
      },
      clients: { matchAll, openWindow },
      location: new URL('https://client.mongoose.world/sw.js'),
      registration: { showNotification },
      skipWaiting: vi.fn(),
    });
    await import('./sw');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  function dispatchPush(payload: unknown): Promise<unknown> {
    let pending: Promise<unknown> = Promise.resolve();
    listeners.push({
      data: { json: () => payload, text: () => JSON.stringify(payload) },
      waitUntil: (promise: Promise<unknown>) => {
        pending = promise;
      },
    });
    return pending;
  }

  function dispatchClick(action: string, data: unknown): Promise<unknown> {
    let pending: Promise<unknown> = Promise.resolve();
    listeners.notificationclick({
      action,
      notification: { close: vi.fn(), data },
      waitUntil: (promise: Promise<unknown>) => {
        pending = promise;
      },
    });
    return pending;
  }

  it('shows well-formed actions and keeps their URLs in notification data', async () => {
    await dispatchPush({
      actions: [
        { action: 'stop', title: 'Stop these', url: '/api/webpush/stop?t=abc' },
        { action: 'nourl', title: 'No URL' },
        { action: 7, title: 'Bad action' },
        { action: 'notitle' },
        null,
        'stop',
      ],
      body: 'Hello',
      title: 'Page',
      url: '/play',
    });

    expect(showNotification).toHaveBeenCalledWith('Page', {
      actions: [
        { action: 'stop', title: 'Stop these' },
        { action: 'nourl', title: 'No URL' },
      ],
      body: 'Hello',
      data: {
        actionUrls: { stop: '/api/webpush/stop?t=abc' },
        url: '/play',
      },
      tag: 'mongoose-push',
    });
  });

  it('shows no actions when the payload has none', async () => {
    await dispatchPush({ title: 'Page' });

    expect(showNotification).toHaveBeenCalledWith('Page', {
      actions: [],
      body: '',
      data: { actionUrls: {}, url: '/' },
      tag: 'mongoose-push',
    });
  });

  it('opens a relative stop URL on the API origin', async () => {
    await dispatchClick('stop', {
      actionUrls: { stop: '/api/webpush/stop?t=abc' },
      url: '/play',
    });

    expect(openWindow).toHaveBeenCalledWith('https://mongoose.world/api/webpush/stop?t=abc');
    expect(matchAll).not.toHaveBeenCalled();
  });

  it('opens an absolute stop URL unchanged', async () => {
    await dispatchClick('stop', {
      actionUrls: { stop: 'https://mongoose.world/api/webpush/stop?t=abc' },
      url: '/play',
    });

    expect(openWindow).toHaveBeenCalledWith('https://mongoose.world/api/webpush/stop?t=abc');
  });

  it('opens the notification URL on the client origin for a body click', async () => {
    await dispatchClick('', {
      actionUrls: { stop: '/api/webpush/stop?t=abc' },
      url: '/play',
    });

    expect(matchAll).toHaveBeenCalledWith({ includeUncontrolled: true, type: 'window' });
    expect(openWindow).toHaveBeenCalledWith('https://client.mongoose.world/play');
  });

  it('focuses an open window already at the notification URL', async () => {
    const focus = vi.fn();
    matchAll.mockResolvedValue([{ focus, url: 'https://client.mongoose.world/play' }]);

    await dispatchClick('', { url: '/play' });

    expect(focus).toHaveBeenCalledOnce();
    expect(openWindow).not.toHaveBeenCalled();
  });

  it('falls back to the notification URL for an action without a URL', async () => {
    await dispatchClick('nourl', { actionUrls: {}, url: '/play' });

    expect(openWindow).toHaveBeenCalledWith('https://client.mongoose.world/play');
  });

  describe('away lines', () => {
    const LINES_URL = 'https://mongoose.world/api/away/lines';
    let postMessage: ReturnType<typeof vi.fn>;
    let fetchMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      postMessage = vi.fn();
      matchAll.mockResolvedValue([{ postMessage }]);
      fetchMock = vi.fn(async () => Response.json({ connected: 0, lines: [], seq: 0 }));
      vi.stubGlobal('fetch', fetchMock);
    });

    afterEach(async () => {
      vi.restoreAllMocks();
      await deleteAwayDatabase();
    });

    function roomPush(lines: Array<[number, string]>, extra: Record<string, unknown> = {}) {
      return {
        body: lines[lines.length - 1][1],
        data: { from: lines[0][0], lines, to: lines[lines.length - 1][0] },
        tag: 'mongoose-room',
        title: 'The Lounge',
        url: '/',
        ...extra,
      };
    }

    async function storeToken(): Promise<void> {
      const { storeAwayToken } = await import('./away');
      await storeAwayToken({ expiresAt: Math.floor(Date.now() / 1000) + 86400 * 30, token: 'away-1' });
    }

    // Everything stored and not yet shown on a page, which in these tests is
    // everything stored for the current away period.
    async function storedLines() {
      const { takeUnshownAwayLines } = await import('./away');
      return takeUnshownAwayLines();
    }

    it('stores the lines, messages every window, and shows an alerting notification', async () => {
      const otherWindow = { postMessage: vi.fn() };
      matchAll.mockResolvedValue([{ postMessage }, otherWindow]);

      await dispatchPush(
        roomPush([
          [1, 'Bob waves.'],
          [2, 'Bob says, "hi"'],
        ]),
      );

      const lines = [
        { seq: 1, text: 'Bob waves.' },
        { seq: 2, text: 'Bob says, "hi"' },
      ];
      expect(matchAll).toHaveBeenCalledWith({ includeUncontrolled: true, type: 'window' });
      expect(postMessage).toHaveBeenCalledWith({ lines, type: 'away-lines' });
      expect(otherWindow.postMessage).toHaveBeenCalledWith({ lines, type: 'away-lines' });
      expect(showNotification).toHaveBeenCalledWith('The Lounge', {
        actions: [],
        body: 'Bob says, "hi"',
        data: { actionUrls: {}, url: '/' },
        renotify: true,
        tag: 'mongoose-room',
      });
      expect(fetchMock).not.toHaveBeenCalled();
      expect(await storedLines()).toEqual(lines);
    });

    it('shows a silent notification without renotify when the payload says silent', async () => {
      await dispatchPush(roomPush([[1, 'Bob waves.']], { silent: 1 }));

      expect(showNotification).toHaveBeenCalledWith('The Lounge', {
        actions: [],
        body: 'Bob waves.',
        data: { actionUrls: {}, url: '/' },
        silent: true,
        tag: 'mongoose-room',
      });
    });

    it('keeps the actions of a push that carries lines', async () => {
      await dispatchPush(
        roomPush([[1, 'Bob waves.']], {
          actions: [{ action: 'stop', title: 'Stop these', url: '/api/webpush/stop?t=abc' }],
        }),
      );

      expect(showNotification).toHaveBeenCalledWith(
        'The Lounge',
        expect.objectContaining({
          actions: [{ action: 'stop', title: 'Stop these' }],
          data: { actionUrls: { stop: '/api/webpush/stop?t=abc' }, url: '/' },
        }),
      );
    });

    it('leaves a push without data alone: nothing stored, no message, no fetch', async () => {
      await storeToken();

      await dispatchPush({ body: 'Hello', tag: 'mongoose-page', title: 'Page' });

      expect(showNotification).toHaveBeenCalledWith('Page', {
        actions: [],
        body: 'Hello',
        data: { actionUrls: {}, url: '/' },
        tag: 'mongoose-page',
      });
      expect(postMessage).not.toHaveBeenCalled();
      expect(fetchMock).not.toHaveBeenCalled();
      expect(await storedLines()).toEqual([]);
    });

    it('repairs a gap with exactly one fetch and merges the result', async () => {
      await storeToken();
      await dispatchPush(
        roomPush([
          [1, 'one'],
          [2, 'two'],
        ]),
      );
      postMessage.mockClear();
      fetchMock.mockResolvedValue(
        Response.json({
          connected: 0,
          lines: [
            { seq: 3, text: 'three' },
            { seq: 4, text: 'four' },
            { seq: 5, text: 'five' },
          ],
          seq: 5,
        }),
      );

      await dispatchPush(roomPush([[5, 'five']]));

      expect(fetchMock).toHaveBeenCalledOnce();
      expect(fetchMock).toHaveBeenCalledWith(`${LINES_URL}?after=2`, {
        headers: { Authorization: 'Bearer away-1' },
        method: 'GET',
      });
      expect(postMessage).toHaveBeenCalledWith({
        lines: [
          { seq: 3, text: 'three' },
          { seq: 4, text: 'four' },
          { seq: 5, text: 'five' },
        ],
        type: 'away-lines',
      });
      expect((await storedLines()).map((line) => line.seq)).toEqual([1, 2, 3, 4, 5]);
      expect(showNotification).toHaveBeenCalledTimes(2);
    });

    it('does not fetch when the next push follows on directly', async () => {
      await storeToken();
      await dispatchPush(roomPush([[1, 'one']]));

      await dispatchPush(roomPush([[2, 'two']]));

      expect(fetchMock).not.toHaveBeenCalled();
      expect((await storedLines()).map((line) => line.seq)).toEqual([1, 2]);
    });

    it('does not fetch for a gap when no away token is stored', async () => {
      await dispatchPush(roomPush([[1, 'one']]));

      await dispatchPush(roomPush([[4, 'four']]));

      expect(fetchMock).not.toHaveBeenCalled();
      expect((await storedLines()).map((line) => line.seq)).toEqual([1, 4]);
    });

    it.each([
      ['the request rejects', () => Promise.reject(new TypeError('Failed to fetch'))],
      ['the server answers 500', async () => new Response('nope', { status: 500 })],
    ])('keeps what the push carried when the gap fetch fails because %s', async (_label, respond) => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      await storeToken();
      await dispatchPush(roomPush([[1, 'one']]));
      postMessage.mockClear();
      fetchMock.mockImplementation(respond);

      await dispatchPush(roomPush([[4, 'four']]));

      expect(fetchMock).toHaveBeenCalledOnce();
      expect(postMessage).toHaveBeenCalledWith({
        lines: [{ seq: 4, text: 'four' }],
        type: 'away-lines',
      });
      expect((await storedLines()).map((line) => line.seq)).toEqual([1, 4]);
      expect(showNotification).toHaveBeenCalledTimes(2);
    });

    it('discards the stored lines when a new away period starts at seq 1', async () => {
      await dispatchPush(
        roomPush([
          [1, 'old one'],
          [2, 'old two'],
          [3, 'old three'],
        ]),
      );
      expect(await storedLines()).toHaveLength(3);
      postMessage.mockClear();

      await dispatchPush(roomPush([[1, 'new one']]));

      expect(postMessage).toHaveBeenCalledWith({
        lines: [{ seq: 1, text: 'new one' }],
        type: 'away-lines',
      });
      expect(await storedLines()).toEqual([{ seq: 1, text: 'new one' }]);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('still shows the notification when the lines cannot be stored', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      vi.spyOn(indexedDB, 'open').mockImplementation(() => {
        throw new Error('IndexedDB unavailable');
      });

      await dispatchPush(roomPush([[1, 'one']]));

      expect(showNotification).toHaveBeenCalledOnce();
      expect(console.error).toHaveBeenCalled();
    });
  });
});
