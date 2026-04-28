import React from "react";
import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EventEmitter } from "eventemitter3";

import RoomInfoDisplay from "./RoomInfoDisplay";

function createMockClient() {
  const emitter = new EventEmitter();

  return Object.assign(emitter, {
    currentRoomInfo: {
      num: 101,
      name: "Codex's Lab",
      area: "Daystrom Annex",
      exits: { west: 100, northeast: 102 },
    },
    gmcpHandlers: {
      "Char.Items": {
        sendRoomRequest: vi.fn(),
      },
    },
    sendCommand: vi.fn(),
    worldData: {
      liveKitTokens: [],
      playerId: "codex",
      playerName: "codex",
      roomId: "101",
      roomPlayers: [
        {
          name: "q",
          fullname: "Q",
        },
      ],
      spatialEntities: {
        codex: {
          id: "codex",
          position: [1, 1, 0],
        },
      },
      spatialEmitters: {
        "radio-1": {
          id: "radio-1",
          binding: "entity",
          sourceEntity: "codex",
        },
      },
      listenerEntityId: "codex",
      listenerPosition: [1, 1, 0],
      listenerOrientation: {
        forward: [0, 1, 0],
        up: [0, 0, 1],
      },
    },
  });
}

describe("RoomInfoDisplay", () => {
  it("still renders room, players, and items with spatial scene state present", () => {
    const client = createMockClient();

    render(<RoomInfoDisplay client={client as any} />);

    act(() => {
      client.emit("itemsList", {
        location: "room",
        items: [{ id: "lantern", name: "Lantern", location: "room" }],
      });
    });

    expect(screen.getByText("Codex's Lab")).toBeTruthy();
    expect(screen.getByText("Area: Daystrom Annex")).toBeTruthy();
    expect(screen.getByText("Q")).toBeTruthy();
    expect(screen.getByText("Lantern")).toBeTruthy();
  });
});
