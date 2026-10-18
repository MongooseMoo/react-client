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

describe('legacy push quarantine', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('keeps old lines and Stop URLs out of player storage and window messages', async () => {
    vi.resetModules();
    const showNotification = vi.fn(async () => {});
    const postMessage = vi.fn();
    const fetch = vi.fn();
    let push: (event: unknown) => void = () => {};
    vi.stubGlobal('fetch', fetch);
    vi.stubGlobal('self', {
      __WB_MANIFEST: [], skipWaiting: vi.fn(), location: new URL('https://client.mongoose.world/sw.js'),
      registration: { showNotification }, clients: { matchAll: async () => [{ postMessage }] },
      addEventListener: (type: string, listener: (event: unknown) => void) => { if (type === 'push') push = listener; },
    });
    await import('./sw');
    let done: Promise<unknown> = Promise.resolve();
    push({ data: { json: () => ({ title: 'Legacy personal title', body: 'Legacy personal body',
      actions: [{ action: 'stop', title: 'Stop', url: '/api/webpush/stop?t=synthetic' }],
      data: { lines: [[1, 'Legacy speech']], period: 1 } }) }, waitUntil: (work: Promise<unknown>) => { done = work; } });
    await done;
    expect(showNotification).toHaveBeenCalledWith('Mongoose', expect.objectContaining({ tag: 'mongoose-unaddressed' }));
    expect(JSON.stringify(showNotification.mock.calls)).not.toContain('Legacy personal');
    expect(JSON.stringify(showNotification.mock.calls)).not.toContain('/api/webpush/stop');
    expect(fetch).not.toHaveBeenCalled();
    expect(postMessage).not.toHaveBeenCalled();
  });
});
