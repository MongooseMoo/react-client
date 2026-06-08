import { beforeEach, describe, expect, it, vi } from "vitest";

import { GMCPClientWebPush } from "./WebPush";

function createMockClient() {
  return {
    emit: vi.fn(),
    gmcp: {
      send: vi.fn(),
    },
    off: vi.fn(),
    on: vi.fn(),
  };
}

describe("GMCPClientWebPush", () => {
  let client: ReturnType<typeof createMockClient>;
  let handler: GMCPClientWebPush;

  beforeEach(() => {
    vi.clearAllMocks();
    client = createMockClient();
    handler = new GMCPClientWebPush(client as never);
  });

  it("stores token payloads and emits token events", () => {
    handler.handleToken({ expires_at: 12345, token: "token-a" });

    expect(client.emit).toHaveBeenCalledWith("webpushToken", {
      expiresAt: 12345,
      token: "token-a",
    });
  });

  it("returns a cached token without sending another request", async () => {
    handler.handleToken({ token: "token-a" });

    await expect(handler.requestToken()).resolves.toBe("token-a");
    expect(client.gmcp.send).not.toHaveBeenCalled();
  });

  it("requests a token over GMCP when none is cached", async () => {
    const listeners = new Map<string, (payload: { token: string | null }) => void>();
    client.on.mockImplementation((event: string, callback: (payload: { token: string | null }) => void) => {
      listeners.set(event, callback);
    });
    client.off.mockImplementation((event: string) => {
      listeners.delete(event);
    });

    const tokenPromise = handler.requestToken();

    expect(client.gmcp.send).toHaveBeenCalledWith("Client.WebPush.Request", "{}");
    listeners.get("webpushToken")?.({ token: "token-b" });

    await expect(tokenPromise).resolves.toBe("token-b");
  });
});
