import { describe, expect, it, beforeEach } from "vitest";
import { useLiveKitStore } from "./liveKitStore";

describe("liveKitStore", () => {
  beforeEach(() => {
    useLiveKitStore.getState().reset();
  });

  it("starts without tokens", () => {
    expect(useLiveKitStore.getState().tokens).toEqual([]);
  });

  it("adds tokens in arrival order", () => {
    useLiveKitStore.getState().addToken("token-a");
    useLiveKitStore.getState().addToken("token-b");

    expect(useLiveKitStore.getState().tokens).toEqual(["token-a", "token-b"]);
  });

  it("does not duplicate an existing token", () => {
    useLiveKitStore.getState().addToken("token-a");
    useLiveKitStore.getState().addToken("token-a");

    expect(useLiveKitStore.getState().tokens).toEqual(["token-a"]);
  });

  it("removes a token", () => {
    useLiveKitStore.getState().addToken("token-a");
    useLiveKitStore.getState().addToken("token-b");

    useLiveKitStore.getState().removeToken("token-a");

    expect(useLiveKitStore.getState().tokens).toEqual(["token-b"]);
  });

  it("resets tokens", () => {
    useLiveKitStore.getState().addToken("token-a");

    useLiveKitStore.getState().reset();

    expect(useLiveKitStore.getState().tokens).toEqual([]);
  });
});
