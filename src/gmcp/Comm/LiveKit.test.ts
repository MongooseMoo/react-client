import { beforeEach, describe, expect, it, vi } from "vitest";

import { GMCPCommLiveKit } from "./LiveKit";

function createMockClient() {
  return {
    emit: vi.fn(),
    gmcp: {
      send: vi.fn(),
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

  it("emits livekitToken when room_token arrives", () => {
    handler.handleroom_token({ token: "token-a" });

    expect(client.emit).toHaveBeenCalledWith("livekitToken", "token-a");
  });

  it("emits livekitLeave when room_leave arrives", () => {
    handler.handleroom_leave({ token: "token-a" });

    expect(client.emit).toHaveBeenCalledWith("livekitLeave", "token-a");
  });
});
