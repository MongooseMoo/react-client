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

  const owner = { version: 2 as const, purpose: 'owner' as const, token: 'synthetic-session',
    sessionId: 'tab-a', installationId: 'installation-a', playerUuid: 'player-a',
    playerRef: '#101', expires_at: 1791936600, requestId: 'original' };

  it('accepts only the correlated session enrollment reply for the captured owner', async () => {
    const pending = handler.requestSessionToken(owner);
    const request = JSON.parse(client.gmcp.send.mock.calls[0][1]);
    const reply = { ...owner, requestId: request.requestId, serverKey: 'https://mongoose.world',
      token: 'synthetic-enrollment', expires_at: Date.now() / 1000 + 300 };
    const settled = vi.fn();
    void pending.then(settled);
    for (const mismatch of [{ playerUuid: 'player-b' }, { playerRef: '#102' },
      { sessionId: 'tab-b' }, { installationId: 'installation-b' }, { requestId: 'late' },
      { expires_at: Date.now() / 1000 - 1 }]) {
      handler.receiveRegisteredMessage('SessionToken', { ...reply, ...mismatch });
      await Promise.resolve();
      expect(settled).not.toHaveBeenCalled();
    }
    handler.receiveRegisteredMessage('SessionToken', reply);
    await expect(pending).resolves.toMatchObject({ playerUuid: 'player-a', token: 'synthetic-enrollment' });
    expect(vi.getTimerCount()).toBe(0);
  });

  it('cancels session requests on reset and ignores their later replies', async () => {
    const pending = handler.requestSessionToken(owner);
    const request = JSON.parse(client.gmcp.send.mock.calls[0][1]);
    handler.reset();
    await expect(pending).resolves.toBeUndefined();
    handler.receiveRegisteredMessage('SessionToken', { ...owner, requestId: request.requestId,
      serverKey: 'https://mongoose.world', expires_at: Date.now() / 1000 + 300 });
    expect(vi.getTimerCount()).toBe(0);
  });

  it('removes the session request listener and timeout when transport send fails', async () => {
    client.gmcp.send.mockImplementation(() => { throw new Error('synthetic transport failure'); });
    await expect(handler.requestSessionToken(owner)).rejects.toThrow('synthetic transport failure');
    expect(vi.getTimerCount()).toBe(0);
    handler.reset();
  });
});
