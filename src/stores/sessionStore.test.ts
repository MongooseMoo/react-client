import { beforeEach, describe, expect, it } from "vitest";

import { useSessionStore } from "./sessionStore";

describe("sessionStore", () => {
  beforeEach(() => {
    useSessionStore.getState().reset();
  });

  it("starts empty", () => {
    const state = useSessionStore.getState();
    expect(state.playerId).toBe("");
    expect(state.playerName).toBe("");
    expect(state.roomId).toBe("");
  });

  it("setPlayer sets id and name", () => {
    useSessionStore.getState().setPlayer("q", "Q the Mongoose");

    const state = useSessionStore.getState();
    expect(state.playerId).toBe("q");
    expect(state.playerName).toBe("Q the Mongoose");
  });

  it("setRoomId sets the room without touching the player", () => {
    useSessionStore.getState().setPlayer("q", "Q");
    useSessionStore.getState().setRoomId("101");

    const state = useSessionStore.getState();
    expect(state.roomId).toBe("101");
    expect(state.playerId).toBe("q");
  });

  it("reset clears everything", () => {
    useSessionStore.getState().setPlayer("q", "Q");
    useSessionStore.getState().setRoomId("101");
    useSessionStore.getState().reset();

    const state = useSessionStore.getState();
    expect(state.playerId).toBe("");
    expect(state.playerName).toBe("");
    expect(state.roomId).toBe("");
  });
});
