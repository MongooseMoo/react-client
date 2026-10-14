import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GMCPClientWebPush } from "./WebPush";

function createMockClient() {
  return {
    gmcp: {
      send: vi.fn(),
    },
  };
}

describe("GMCPClientWebPush", () => {
  let client: ReturnType<typeof createMockClient>;
  let handler: GMCPClientWebPush;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-14T00:00:00Z"));
    vi.clearAllMocks();
    client = createMockClient();
    handler = new GMCPClientWebPush(client as never);
  });

  afterEach(() => {
    handler.shutdown();
    vi.useRealTimers();
  });

  it("stores token payloads and emits package token events", () => {
    const listener = vi.fn();
    handler.on("token", listener);

    handler.receiveRegisteredMessage("Token", { expires_at: 12345, token: "token-a" });

    expect(listener).toHaveBeenCalledWith({ expires_at: 12345, token: "token-a" });
  });

  it("returns a cached token without sending another request", async () => {
    handler.handleToken({ token: "token-a" });

    await expect(handler.requestToken()).resolves.toBe("token-a");
    expect(client.gmcp.send).not.toHaveBeenCalled();
  });

  it("requests a token over GMCP when none is cached", async () => {
    const tokenPromise = handler.requestToken();

    expect(client.gmcp.send).toHaveBeenCalledWith("Client.WebPush.Request", "{}");
    handler.receiveRegisteredMessage("Token", { token: "token-b" });

    await expect(tokenPromise).resolves.toBe("token-b");
  });

  it("requests a fresh token after disconnect reset", async () => {
    handler.handleToken({ token: "token-a" });
    handler.reset();

    const tokenPromise = handler.requestToken();

    expect(client.gmcp.send).toHaveBeenCalledWith("Client.WebPush.Request", "{}");
    handler.receiveRegisteredMessage("Token", { token: "token-b" });
    await expect(tokenPromise).resolves.toBe("token-b");
  });

  it("uses Unix seconds expiry and renews within the margin", async () => {
    handler.handleToken({ token: "valid", expires_at: Date.now() / 1000 + 300 });
    await expect(handler.requestToken()).resolves.toBe("valid");
    expect(client.gmcp.send).not.toHaveBeenCalled();
    vi.advanceTimersByTime(271_000);
    const renewed = handler.requestToken();
    expect(client.gmcp.send).toHaveBeenCalledOnce();
    handler.receiveRegisteredMessage("Token", { token: "renewed", expires_at: Date.now() / 1000 + 300 });
    await expect(renewed).resolves.toBe("renewed");
  });

  it("cancels all pending listeners on reset", async () => {
    const removeListener = vi.spyOn(handler, "off");
    const first = handler.requestToken();
    const second = handler.requestToken();
    handler.reset();
    await expect(first).resolves.toBeNull();
    await expect(second).resolves.toBeNull();
    handler.receiveRegisteredMessage("Token", { token: "late" });
    expect(removeListener).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(0);
  });
});
