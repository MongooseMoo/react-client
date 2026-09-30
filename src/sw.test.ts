import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
});
