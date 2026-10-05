import { beforeEach, describe, expect, it, vi } from "vitest";

import type MudClient from "../../client";
import { useLiveKitStore } from "../../stores/liveKitStore";
import { decodeRoomToken, GMCPCommLiveKit } from "./LiveKit";

function createMockClient() {
  return {
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
    useLiveKitStore.getState().reset();
    client = createMockClient();
    handler = new GMCPCommLiveKit(client as unknown as MudClient);
  });

  it("stores and emits roomToken when room_token arrives", () => {
    const listener = vi.fn();
    handler.on("roomToken", listener);

    handler.receiveRegisteredMessage("room_token", { token: "token-a" });

    expect(useLiveKitStore.getState().rooms).toEqual([{ token: "token-a" }]);
    expect(listener).toHaveBeenCalledWith({ token: "token-a" });
  });

  it("stores the room's chain and send, and replaces them when the token is sent again", () => {
    handler.receiveRegisteredMessage("room_token", { token: "token-a", chain: "room", send: 0.4 });
    expect(useLiveKitStore.getState().rooms).toEqual([{ token: "token-a", chain: "room", send: 0.4 }]);

    handler.receiveRegisteredMessage("room_token", { token: "token-a", chain: "room", send: 0.8 });
    expect(useLiveKitStore.getState().rooms).toEqual([{ token: "token-a", chain: "room", send: 0.8 }]);

    handler.receiveRegisteredMessage("room_token", { token: "token-a" });
    expect(useLiveKitStore.getState().rooms).toEqual([{ token: "token-a" }]);
  });

  it("removes and emits roomLeave when room_leave arrives", () => {
    const listener = vi.fn();
    handler.on("roomLeave", listener);
    useLiveKitStore.getState().setRoom({ token: "token-a" });

    handler.receiveRegisteredMessage("room_leave", { token: "token-a" });

    expect(useLiveKitStore.getState().rooms).toEqual([]);
    expect(listener).toHaveBeenCalledWith({ token: "token-a" });
  });
});

describe("decodeRoomToken", () => {
  it("accepts a bare token, a primary chain, and a chain with a send", () => {
    expect(decodeRoomToken({ token: "t" })).toEqual({ token: "t" });
    expect(decodeRoomToken({ token: "t", chain: "room" })).toEqual({ token: "t", chain: "room" });
    expect(decodeRoomToken({ token: "t", chain: "room", send: 0 })).toEqual({
      token: "t",
      chain: "room",
      send: 0,
    });
  });

  it("accepts the room_token captured from the MOO fixture (token redacted)", () => {
    const captured = JSON.parse('{"token":"<redacted>","chain":"room","send":0.285866666666667}');
    expect(decodeRoomToken(captured)).toEqual({
      token: "<redacted>",
      chain: "room",
      send: 0.285866666666667,
    });
  });

  it("treats an empty chain as none and drops unknown fields", () => {
    expect(decodeRoomToken({ token: "t", chain: "", extra: 1 })).toEqual({ token: "t" });
  });

  it.each([
    ["no payload", null],
    ["a missing token", { chain: "room" }],
    ["a non-string token", { token: 7 }],
    ["a non-string chain", { token: "t", chain: ["room"] }],
    ["a send without a chain", { token: "t", send: 0.4 }],
    ["a send with an empty chain", { token: "t", chain: "", send: 0.4 }],
    ["a send above 1", { token: "t", chain: "room", send: 1.5 }],
    ["a negative send", { token: "t", chain: "room", send: -0.1 }],
    ["a non-numeric send", { token: "t", chain: "room", send: "0.4" }],
    ["a NaN send", { token: "t", chain: "room", send: Number.NaN }],
  ])("rejects %s", (_label, payload) => {
    expect(() => decodeRoomToken(payload)).toThrow(TypeError);
  });
});
