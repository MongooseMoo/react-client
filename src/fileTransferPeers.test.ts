import { describe, expect, it } from "vitest";
import type { UserlistPlayer } from "./mcp";
import {
  findTransferPeerByAddress,
  userlistPlayersToTransferPeers,
} from "./fileTransferPeers";

const players: UserlistPlayer[] = [
  {
    Object: "#100",
    Name: "Quinn",
    Icon: 1,
    away: false,
    idle: true,
  },
  {
    Object: "#200",
    Name: "Riley",
    Icon: 2,
    away: true,
    idle: false,
  },
];

describe("file transfer peers", () => {
  it("maps connected userlist players into selectable transfer peers", () => {
    expect(userlistPlayersToTransferPeers(players)).toEqual([
      {
        id: "#100",
        label: "Quinn",
        transferAddress: "Quinn",
        away: false,
        idle: true,
      },
      {
        id: "#200",
        label: "Riley",
        transferAddress: "Riley",
        away: true,
        idle: false,
      },
    ]);
  });

  it("resolves incoming transfer addresses by name or object id", () => {
    const peers = userlistPlayersToTransferPeers(players);

    expect(findTransferPeerByAddress(peers, "quinn")?.label).toBe("Quinn");
    expect(findTransferPeerByAddress(peers, "#200")?.label).toBe("Riley");
    expect(findTransferPeerByAddress(peers, "unknown")).toBeNull();
  });
});
