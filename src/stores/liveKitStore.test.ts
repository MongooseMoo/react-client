import { describe, expect, it, beforeEach } from "vitest";
import { useLiveKitStore } from "./liveKitStore";

describe("liveKitStore", () => {
  beforeEach(() => {
    useLiveKitStore.getState().reset();
  });

  it("starts without rooms", () => {
    expect(useLiveKitStore.getState().rooms).toEqual([]);
  });

  it("adds rooms in arrival order", () => {
    useLiveKitStore.getState().setRoom({ token: "token-a" });
    useLiveKitStore.getState().setRoom({ token: "token-b", chain: "room", send: 0.4 });

    expect(useLiveKitStore.getState().rooms).toEqual([
      { token: "token-a" },
      { token: "token-b", chain: "room", send: 0.4 },
    ]);
  });

  it("does not duplicate or replace an unchanged room", () => {
    useLiveKitStore.getState().setRoom({ token: "token-a", chain: "room", send: 0.4 });
    const before = useLiveKitStore.getState().rooms;

    useLiveKitStore.getState().setRoom({ token: "token-a", chain: "room", send: 0.4 });

    expect(useLiveKitStore.getState().rooms).toBe(before);
  });

  it("replaces the chain and send of a token it already holds, in place", () => {
    useLiveKitStore.getState().setRoom({ token: "token-a", chain: "room", send: 0.4 });
    useLiveKitStore.getState().setRoom({ token: "token-b" });

    useLiveKitStore.getState().setRoom({ token: "token-a", chain: "room", send: 0.7 });
    expect(useLiveKitStore.getState().rooms).toEqual([
      { token: "token-a", chain: "room", send: 0.7 },
      { token: "token-b" },
    ]);

    useLiveKitStore.getState().setRoom({ token: "token-a" });
    expect(useLiveKitStore.getState().rooms[0]).toEqual({ token: "token-a" });
  });

  it("removes a room by token", () => {
    useLiveKitStore.getState().setRoom({ token: "token-a" });
    useLiveKitStore.getState().setRoom({ token: "token-b" });

    useLiveKitStore.getState().removeToken("token-a");

    expect(useLiveKitStore.getState().rooms).toEqual([{ token: "token-b" }]);
  });

  it("resets rooms", () => {
    useLiveKitStore.getState().setRoom({ token: "token-a" });

    useLiveKitStore.getState().reset();

    expect(useLiveKitStore.getState().rooms).toEqual([]);
  });
});
