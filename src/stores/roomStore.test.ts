import { beforeEach, describe, expect, it } from "vitest";

import { useRoomStore } from "./roomStore";
import type { GMCPMessageRoomInfo, RoomPlayer } from "../gmcp/Room";

const roomInfo = (overrides: Partial<GMCPMessageRoomInfo> = {}): GMCPMessageRoomInfo =>
  ({ num: 1, name: "Room", area: "Area", ...overrides }) as GMCPMessageRoomInfo;

const player = (name: string, fullname: string): RoomPlayer => ({ name, fullname });

describe("roomStore", () => {
  beforeEach(() => {
    useRoomStore.getState().reset();
  });

  it("starts empty", () => {
    const state = useRoomStore.getState();
    expect(state.roomInfo).toBeNull();
    expect(state.roomPlayers).toEqual([]);
  });

  it("setRoomInfo stores info and clears the player list for the new room", () => {
    useRoomStore.setState({ roomPlayers: [player("q", "Q")] });
    useRoomStore.getState().setRoomInfo(roomInfo({ name: "Lab" }));

    expect(useRoomStore.getState().roomInfo?.name).toBe("Lab");
    expect(useRoomStore.getState().roomPlayers).toEqual([]);
  });

  it("setRoomPlayers sorts by fullname without mutating the input", () => {
    const input = [player("b", "Bravo"), player("a", "Alpha")];
    useRoomStore.getState().setRoomPlayers(input);

    expect(useRoomStore.getState().roomPlayers.map((p) => p.name)).toEqual(["a", "b"]);
    // input array untouched (immutable update)
    expect(input.map((p) => p.name)).toEqual(["b", "a"]);
  });

  it("addPlayer inserts, keeps sorted, and de-dupes by name", () => {
    useRoomStore.getState().setRoomPlayers([player("b", "Bravo")]);
    useRoomStore.getState().addPlayer(player("a", "Alpha"));
    useRoomStore.getState().addPlayer(player("b", "Bravo")); // duplicate name

    expect(useRoomStore.getState().roomPlayers.map((p) => p.name)).toEqual(["a", "b"]);
  });

  it("removePlayer drops by name", () => {
    useRoomStore.getState().setRoomPlayers([player("a", "Alpha"), player("b", "Bravo")]);
    useRoomStore.getState().removePlayer("a");

    expect(useRoomStore.getState().roomPlayers.map((p) => p.name)).toEqual(["b"]);
  });

  it("reset clears everything", () => {
    useRoomStore.setState({ roomInfo: roomInfo(), roomPlayers: [player("a", "Alpha")] });
    useRoomStore.getState().reset();

    expect(useRoomStore.getState().roomInfo).toBeNull();
    expect(useRoomStore.getState().roomPlayers).toEqual([]);
  });
});
