import { afterEach, describe, expect, it, vi } from "vitest";

import { deleteAwayDatabase } from "./awayTestHelpers";
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

describe("away token after push registration", () => {
  const AWAY_TOKEN_URL = "https://mongoose.world/api/away/token";
  const SUBSCRIPTION_URL = "https://mongoose.world/api/webpush/subscriptions";
  const DAY_SECONDS = 24 * 60 * 60;

  afterEach(async () => {
    await deleteAwayDatabase();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.resetModules();
  });

  function stubClient(): MudClient {
    return {
      gmcp: {
        require: () => ({ requestToken: async () => "token-123" }),
      },
    } as unknown as MudClient;
  }

  function nowSeconds(): number {
    return Math.floor(Date.now() / 1000);
  }

  // A browser that already holds a push subscription, and a server answering
  // the away token route with `awayResponse`.
  function stubRegisteredBrowser(awayResponse: () => Response) {
    const fetchMock = vi.fn(async (url: string, _init?: RequestInit) =>
      url === AWAY_TOKEN_URL ? awayResponse() : Response.json({}),
    );
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("Notification", { permission: "granted" });
    vi.stubGlobal("navigator", {
      serviceWorker: {
        ready: Promise.resolve({
          pushManager: {
            getSubscription: async () => ({ toJSON: () => ({ endpoint: "https://push.example/sub" }) }),
          },
        }),
      },
      userAgent: "test-agent",
    });
    const callsTo = (url: string) => fetchMock.mock.calls.filter(([called]) => called === url);
    return { callsTo, fetchMock };
  }

  async function importProduction() {
    vi.stubEnv("DEV", false);
    vi.stubEnv("VITE_API_ORIGIN", "");
    vi.resetModules();
    const webpush = await import("./webpush");
    const away = await import("./away");
    const { useOutputStore } = await import("./stores/outputStore");
    return { ...webpush, ...away, useOutputStore };
  }

  it("fetches an away token with the push token once registration has succeeded", async () => {
    const expiresAt = nowSeconds() + 30 * DAY_SECONDS;
    const { callsTo, fetchMock } = stubRegisteredBrowser(() =>
      Response.json({ expires_at: expiresAt, token: "away-1" }),
    );
    const { ensurePushSubscription, readAwayToken } = await importProduction();

    await ensurePushSubscription(stubClient());

    expect(fetchMock).toHaveBeenCalledWith(AWAY_TOKEN_URL, {
      headers: { Authorization: "Bearer token-123" },
      method: "POST",
    });
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([SUBSCRIPTION_URL, AWAY_TOKEN_URL]);
    expect(await readAwayToken()).toEqual({ expiresAt, token: "away-1" });
    expect(callsTo(AWAY_TOKEN_URL)).toHaveLength(1);
  });

  it("reuses a stored away token that is more than 7 days from expiry", async () => {
    const { callsTo } = stubRegisteredBrowser(() =>
      Response.json({ expires_at: nowSeconds() + 30 * DAY_SECONDS, token: "away-1" }),
    );
    const { ensurePushSubscription, readAwayToken } = await importProduction();

    await ensurePushSubscription(stubClient());
    await ensurePushSubscription(stubClient());

    expect(callsTo(AWAY_TOKEN_URL)).toHaveLength(1);
    expect(callsTo(SUBSCRIPTION_URL)).toHaveLength(2);
    expect((await readAwayToken())?.token).toBe("away-1");
  });

  it("replaces a stored away token that is within 7 days of expiry", async () => {
    const expiresAt = nowSeconds() + 30 * DAY_SECONDS;
    const { callsTo } = stubRegisteredBrowser(() =>
      Response.json({ expires_at: expiresAt, token: "away-2" }),
    );
    const { ensurePushSubscription, readAwayToken, storeAwayToken } = await importProduction();
    await storeAwayToken({ expiresAt: nowSeconds() + 6 * DAY_SECONDS, token: "away-old" });

    await ensurePushSubscription(stubClient());

    expect(callsTo(AWAY_TOKEN_URL)).toHaveLength(1);
    expect(await readAwayToken()).toEqual({ expiresAt, token: "away-2" });
  });

  it("keeps push registration working and reports the error when the away token fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { callsTo } = stubRegisteredBrowser(() => new Response("nope", { status: 500 }));
    const { ensurePushSubscription, readAwayToken, useOutputStore } = await importProduction();
    useOutputStore.getState().reset();

    await expect(ensurePushSubscription(stubClient())).resolves.toBeUndefined();

    expect(callsTo(SUBSCRIPTION_URL)).toHaveLength(1);
    expect(await readAwayToken()).toBeNull();
    await Promise.resolve();
    expect(useOutputStore.getState().entries).toEqual([
      {
        error: new Error(
          `Away messages couldn't be enabled: HTTP 500 from ${AWAY_TOKEN_URL}`,
        ),
        id: 1,
        type: "error",
      },
    ]);
    expect(console.error).toHaveBeenCalled();
  });
});
