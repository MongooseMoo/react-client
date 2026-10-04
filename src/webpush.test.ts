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
      Response.json({ expires_at: expiresAt, player: 42, token: "away-1" }),
    );
    const { ensurePushSubscription, readAwayToken } = await importProduction();

    await ensurePushSubscription(stubClient());

    expect(fetchMock).toHaveBeenCalledWith(AWAY_TOKEN_URL, {
      headers: { Authorization: "Bearer token-123" },
      method: "POST",
    });
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([SUBSCRIPTION_URL, AWAY_TOKEN_URL]);
    expect(await readAwayToken()).toEqual({ expiresAt, player: 42, token: "away-1" });
    expect(callsTo(AWAY_TOKEN_URL)).toHaveLength(1);
  });

  // The page cannot tell which character a stored token belongs to (it knows
  // the character's name, the server reports its object number), so it asks
  // on every registration and compares the answer with what is stored.
  it("keeps the stored lines when the token is for the same character", async () => {
    const expiresAt = nowSeconds() + 30 * DAY_SECONDS;
    const { callsTo } = stubRegisteredBrowser(() =>
      Response.json({ expires_at: expiresAt, player: 42, token: "away-2" }),
    );
    const { ensurePushSubscription, readAwayToken, recordAwayPush, storeAwayToken, takeUnshownAwayLines } =
      await importProduction();
    await storeAwayToken({ expiresAt: nowSeconds() + 20 * DAY_SECONDS, player: 42, token: "away-1" });
    await recordAwayPush({ from: 1, lines: [[1, "one"], [2, "two"]], to: 2 });

    await ensurePushSubscription(stubClient());

    expect(callsTo(AWAY_TOKEN_URL)).toHaveLength(1);
    expect(await readAwayToken()).toEqual({ expiresAt, player: 42, token: "away-2" });
    expect(await takeUnshownAwayLines()).toEqual([
      { seq: 1, text: "one" },
      { seq: 2, text: "two" },
    ]);
  });

  it.each([
    ["a different character", { player: 7, token: "away-1" }],
    ["no known character", { token: "away-1" }],
  ])("replaces the token and discards the stored lines when it was for %s", async (_label, stored) => {
    const expiresAt = nowSeconds() + 30 * DAY_SECONDS;
    const { callsTo } = stubRegisteredBrowser(() =>
      Response.json({ expires_at: expiresAt, player: 42, token: "away-2" }),
    );
    const { ensurePushSubscription, readAwayToken, recordAwayPush, storeAwayToken, takeUnshownAwayLines } =
      await importProduction();
    await storeAwayToken({ expiresAt: nowSeconds() + 20 * DAY_SECONDS, ...stored });
    await recordAwayPush({ from: 1, lines: [[1, "one"], [2, "two"]], to: 2 });

    await ensurePushSubscription(stubClient());

    expect(await readAwayToken()).toEqual({ expiresAt, player: 42, token: "away-2" });
    expect(await takeUnshownAwayLines()).toEqual([]);
    // The highest seq went too: a push at seq 3 is now a gap counted from 0.
    await recordAwayPush({ from: 3, lines: [[3, "three"]], to: 3 });
    expect(callsTo("https://mongoose.world/api/away/lines?after=0")).toHaveLength(1);
  });

  it("discards the stored lines when the server does not say whose token it is", async () => {
    stubRegisteredBrowser(() =>
      Response.json({ expires_at: nowSeconds() + 30 * DAY_SECONDS, token: "away-2" }),
    );
    const { ensurePushSubscription, recordAwayPush, storeAwayToken, takeUnshownAwayLines } =
      await importProduction();
    await storeAwayToken({ expiresAt: nowSeconds() + 20 * DAY_SECONDS, player: 42, token: "away-1" });
    await recordAwayPush({ from: 1, lines: [[1, "one"]], to: 1 });

    await ensurePushSubscription(stubClient());

    expect(await takeUnshownAwayLines()).toEqual([]);
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

  // The stored token may be another character's; when it cannot be replaced
  // it must not stay usable.
  it.each([
    ["the server answers 500", () => new Response("nope", { status: 500 })],
    ["the request cannot be made", () => {
      throw new TypeError("Failed to fetch");
    }],
    ["the response has no token", () => Response.json({ player: 42 })],
  ])("drops the stored token and lines when %s", async (_label, respond) => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { callsTo } = stubRegisteredBrowser(respond);
    const {
      ensurePushSubscription,
      readAwayToken,
      recordAwayPush,
      storeAwayToken,
      takeUnshownAwayLines,
      useOutputStore,
    } = await importProduction();
    useOutputStore.getState().reset();
    await storeAwayToken({ expiresAt: nowSeconds() + 20 * DAY_SECONDS, player: 42, token: "away-1" });
    await recordAwayPush({ from: 1, lines: [[1, "one"]], period: 7, to: 1 });

    await expect(ensurePushSubscription(stubClient())).resolves.toBeUndefined();

    expect(callsTo(SUBSCRIPTION_URL)).toHaveLength(1);
    expect(await readAwayToken()).toBeNull();
    expect(await takeUnshownAwayLines()).toEqual([]);
    await Promise.resolve();
    expect(useOutputStore.getState().entries).toHaveLength(1);
    expect(useOutputStore.getState().entries[0]).toMatchObject({ type: "error" });
  });
});
