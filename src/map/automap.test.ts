import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const announce = vi.hoisted(() => vi.fn());
vi.mock("@react-aria/live-announcer", () => ({ announce }));
vi.mock("cacophony", () => ({
  Cacophony: class {
    muted = false;
    setGlobalVolume = vi.fn();
  },
}));

import type MudClient from "../client";
import { createConfiguredClient } from "../createConfiguredClient";
import { useMapStore } from "../stores/mapStore";
import type { Stream } from "../telnet";
import { startWalk } from "./walker";

const IAC = 255;
const SB = 250;
const SE = 240;
const GMCP = 201;

function gmcpBytes(message: string, data: unknown): number[] {
  const body = new TextEncoder().encode(`${message} ${JSON.stringify(data)}`);
  return [IAC, SB, GMCP, ...body, IAC, SE];
}

const ROOM_1 = { num: 1, name: "Square", area: "Town", environment: "outdoors", exits: { n: 2 } };
const ROOM_2 = { num: 2, name: "Lane", area: "Town", exits: { s: 1, n: 3 } };
const ROOM_3 = { num: 3, name: "Gate", area: "Town", exits: { s: 2 } };

describe("automap over GMCP", () => {
  let client: MudClient;
  let receive: (message: string, data: unknown) => void;
  let sent: string[];
  let storage: Map<string, string>;

  beforeEach(() => {
    storage = new Map();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    });
    announce.mockClear();
    useMapStore.setState({ owner: "", map: { rooms: {} }, currentRoomId: null, walk: null });

    client = createConfiguredClient();
    let onData: (data: Uint8Array) => void = () => {};
    const stream = {
      on: (event: string, callback: (data: Uint8Array) => void) => {
        if (event === "data") onData = callback;
      },
      write: vi.fn(),
    } as unknown as Stream;
    client.connectLocal(stream);
    receive = (message, data) => onData(new Uint8Array(gmcpBytes(message, data)));
    sent = [];
    vi.spyOn(client, "sendCommand").mockImplementation((command: string) => {
      sent.push(command);
    });
  });

  afterEach(() => {
    client.shutdown();
    vi.unstubAllGlobals();
  });

  function walkTheLane() {
    receive("Char.Name", { name: "Ada", fullname: "Ada" });
    receive("Room.Info", ROOM_1);
    receive("Room.Info", ROOM_2);
    receive("Room.Info", ROOM_3);
  }

  it("learns each room the player enters and keeps it for that character", () => {
    walkTheLane();
    const { map, currentRoomId, owner } = useMapStore.getState();
    expect(currentRoomId).toBe(3);
    expect(Object.keys(map.rooms).sort()).toEqual(["1", "2", "3"]);
    expect(map.rooms["1"]).toEqual({ id: 1, name: "Square", area: "Town", environment: "outdoors", exits: { n: 2 } });

    const stored = JSON.parse(storage.get(`mongoose.map.${owner.toLowerCase()}`)!);
    expect(Object.keys(stored.data.rooms).sort()).toEqual(["1", "2", "3"]);
  });

  it("keeps rooms seen before the character was known", () => {
    receive("Room.Info", ROOM_1);
    receive("Char.Name", { name: "Ada", fullname: "Ada" });
    expect(useMapStore.getState().map.rooms["1"]?.name).toBe("Square");
  });

  it("walks one step per confirmed arrival and announces the end", () => {
    walkTheLane();
    expect(startWalk(client, 1)).toBe("Walking to Square, 2 steps.");
    expect(sent).toEqual(["s"]);
    receive("Room.Info", ROOM_2);
    expect(sent).toEqual(["s", "s"]);
    receive("Room.Info", ROOM_1);
    expect(sent).toEqual(["s", "s"]);
    expect(useMapStore.getState().walk).toBeNull();
    expect(announce).toHaveBeenLastCalledWith("Arrived at Square.", "polite");
  });

  it("stops on Room.WrongDir and sends nothing more", () => {
    walkTheLane();
    startWalk(client, 1);
    receive("Room.WrongDir", "s");
    expect(useMapStore.getState().walk).toBeNull();
    expect(announce).toHaveBeenLastCalledWith("Walk stopped: there is no exit south.", "assertive");
    receive("Room.Info", ROOM_2);
    expect(sent).toEqual(["s"]);
  });

  it("stops when a step arrives somewhere the map did not expect", () => {
    walkTheLane();
    startWalk(client, 1);
    receive("Room.Info", { num: 9, name: "Cellar", area: "Town", exits: {} });
    expect(useMapStore.getState().walk).toBeNull();
    expect(announce).toHaveBeenLastCalledWith(
      "Walk stopped: you are in Cellar, not where the map expected.", "assertive");
    expect(sent).toEqual(["s"]);
  });

  it("says so when no known route exists", () => {
    walkTheLane();
    receive("Room.Info", { num: 9, name: "Cellar", area: "Town", exits: {} });
    expect(startWalk(client, 1)).toBe("No known way to Square.");
    expect(sent).toEqual([]);
  });
});
