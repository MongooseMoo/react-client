import { beforeEach, describe, expect, it, vi } from "vitest";

const workboxMocks = vi.hoisted(() => ({
  cleanupOutdatedCaches: vi.fn(),
  clientsClaim: vi.fn(),
  precacheAndRoute: vi.fn(),
  registerRoute: vi.fn(),
}));

vi.mock("workbox-core", () => ({
  clientsClaim: workboxMocks.clientsClaim,
}));

vi.mock("workbox-precaching", () => ({
  cleanupOutdatedCaches: workboxMocks.cleanupOutdatedCaches,
  precacheAndRoute: workboxMocks.precacheAndRoute,
}));

vi.mock("workbox-routing", () => ({
  registerRoute: workboxMocks.registerRoute,
}));

vi.mock("workbox-strategies", () => ({
  CacheFirst: vi.fn(),
}));

vi.mock("workbox-expiration", () => ({
  ExpirationPlugin: vi.fn(),
}));

describe("service worker activation", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("activates an installed update without waiting for every tab to close", async () => {
    const skipWaiting = vi.fn();
    vi.stubGlobal("self", {
      __WB_MANIFEST: [],
      addEventListener: vi.fn(),
      skipWaiting,
    });

    await import("./sw");

    expect(skipWaiting).toHaveBeenCalledOnce();
  });
});
