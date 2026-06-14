import { beforeEach, describe, expect, it, vi } from "vitest";

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
    vi.clearAllMocks();
    client = createMockClient();
    handler = new GMCPClientWebPush(client as never);
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
});
