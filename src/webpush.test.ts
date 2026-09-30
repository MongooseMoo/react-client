import { afterEach, describe, expect, it, vi } from "vitest";

import type MudClient from "./client";
import { urlBase64ToUint8Array } from "./webpush";

describe("webpush helpers", () => {
  it("decodes URL-safe base64 into bytes", () => {
    const bytes = urlBase64ToUint8Array("AQIDBA");
    expect(Array.from(bytes)).toEqual([1, 2, 3, 4]);
  });
});

describe("webpush API origin", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  function stubClient(): MudClient {
    return {
      gmcp: {
        require: () => ({ requestToken: async () => "token-123" }),
      },
    } as unknown as MudClient;
  }

  function stubServiceWorker(existing: PushSubscription | null): void {
    vi.stubGlobal("Notification", { permission: "granted" });
    vi.stubGlobal("navigator", {
      serviceWorker: {
        ready: Promise.resolve({
          pushManager: { getSubscription: async () => existing },
        }),
      },
      userAgent: "test-agent",
    });
  }

  async function importProductionWebpush() {
    vi.stubEnv("DEV", false);
    vi.stubEnv("VITE_API_ORIGIN", "");
    vi.resetModules();
    return import("./webpush");
  }

  it("fetches the VAPID key from mongoose.world in production", async () => {
    const fetchMock = vi.fn(async () => new Response("not found", { status: 404 }));
    vi.stubGlobal("fetch", fetchMock);
    stubServiceWorker(null);
    const { ensurePushSubscription } = await importProductionWebpush();

    await expect(ensurePushSubscription(stubClient())).rejects.toThrow(
      "HTTP 404 from https://mongoose.world/api/webpush/public_key",
    );
    expect(fetchMock).toHaveBeenCalledWith("https://mongoose.world/api/webpush/public_key", {
      headers: { Authorization: "Bearer token-123" },
      method: "GET",
    });
  });

  it("deletes the subscription on mongoose.world in production", async () => {
    const fetchMock = vi.fn(async () => Response.json({}));
    vi.stubGlobal("fetch", fetchMock);
    const unsubscribe = vi.fn(async () => true);
    stubServiceWorker({
      endpoint: "https://push.example/sub",
      unsubscribe,
    } as unknown as PushSubscription);
    const { unregisterPushSubscription } = await importProductionWebpush();

    await unregisterPushSubscription(stubClient());

    expect(fetchMock).toHaveBeenCalledWith("https://mongoose.world/api/webpush/subscriptions", {
      body: JSON.stringify({ endpoint: "https://push.example/sub" }),
      headers: { Authorization: "Bearer token-123", "Content-Type": "application/json" },
      method: "DELETE",
    });
    expect(unsubscribe).toHaveBeenCalledOnce();
  });
});
