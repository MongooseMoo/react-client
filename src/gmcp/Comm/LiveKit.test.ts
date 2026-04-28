import { beforeEach, describe, expect, it, vi } from "vitest";

import { GMCPCommLiveKit } from "./LiveKit";

function createMockClient() {
  return {
    emit: vi.fn(),
    sendGmcp: vi.fn(),
    worldData: {
      liveKitTokens: [] as string[],
    },
  };
}

describe("GMCPCommLiveKit", () => {
  let client: ReturnType<typeof createMockClient>;
  let handler: GMCPCommLiveKit;

  beforeEach(() => {
    vi.clearAllMocks();
    client = createMockClient();
    handler = new GMCPCommLiveKit(client as any);
  });

  it("adds tokens and emits when room_token arrives", () => {
    handler.handleroom_token({ token: "token-a" });

    expect(client.worldData.liveKitTokens).toEqual(["token-a"]);
    expect(client.emit).toHaveBeenCalledWith("livekitToken", "token-a");
  });

  it("removes tokens and emits when room_leave arrives", () => {
    client.worldData.liveKitTokens = ["token-a", "token-b"];

    handler.handleroom_leave({ token: "token-a" });

    expect(client.worldData.liveKitTokens).toEqual(["token-b"]);
    expect(client.emit).toHaveBeenCalledWith("livekitLeave", "token-a");
  });
});
