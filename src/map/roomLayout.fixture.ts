import type { RoomLayout } from "../gmcp/Room";

/** The Room.Layout contract's example (docs/room-layout.md), with a body for Q. Tests only. */
export const sampleLayout = (): RoomLayout => ({
  num: 1234,
  size: [3.81, 5.13, 2.44],
  exits: [{ name: "west", to: 1235, at: [-1.905, -1.282, 0.0], width: 0.9 }],
  things: [
    {
      id: "#5678",
      name: "oak table",
      kind: "object",
      fixed: false,
      mounted: false,
      shapes: [{ box: [[-0.5, 0.5], [0.2, 1.0], [0.0, 0.75]] }, { sphere: [[0.1, 0.4, 0.9], 0.15] }],
      origin: [0.0, 0.6, 0.375],
    },
    {
      id: "#99",
      name: "Q",
      kind: "player",
      fixed: true,
      mounted: false,
      shapes: [{ box: [[1.0, 1.4], [-2.0, -1.6], [0.0, 1.8]] }],
      origin: [1.2, -1.8, 1.67],
    },
  ],
});
