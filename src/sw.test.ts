import { beforeEach, describe, expect, it, vi } from 'vitest';

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
