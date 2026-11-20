import { TEST_CHARACTERS } from "../avatar/characters.fixture";
import type { LayoutShape, LayoutThing, LayoutVector, RoomLayout } from "../gmcp/Room";

/** Native body-facing fixture data; independent of acoustic listener/gaze state. */
export function withBodyFacings(layout: RoomLayout, facings: Record<string, LayoutVector | undefined>): RoomLayout {
  return { ...layout, things: layout.things.map((thing): LayoutThing => {
    const facing = facings[thing.id];
    const shape = thing.shapes[0];
    if (!facing || !shape || !("box" in shape)) return thing;
    const [[x0, x1], [y0, y1], [z0, z1]] = shape.box;
    const yaw = Math.atan2(facing[0], -facing[1]);
    return { ...thing, pose: { centre_m: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2],
      dimensions_m: [x1 - x0, y1 - y0, z1 - z0], body_quaternion: [Math.cos(yaw / 2), 0, 0, Math.sin(yaw / 2)], box: true } };
  }) };
}

/** A translated native physical record for movement/rendering fixtures. */
export function translateLayoutThing(layout: RoomLayout, id: string, delta: LayoutVector): RoomLayout {
  const add = (point: LayoutVector): LayoutVector => [point[0] + delta[0], point[1] + delta[1], point[2] + delta[2]];
  return { ...layout, things: layout.things.map((thing) => thing.id !== id ? thing : { ...thing,
    pose: thing.pose ? { ...thing.pose, centre_m: add(thing.pose.centre_m) } : undefined,
    shapes: thing.shapes.map((shape): LayoutShape => "sphere" in shape
      ? { sphere: [add(shape.sphere[0]), shape.sphere[1]] }
      : { box: [[shape.box[0][0] + delta[0], shape.box[0][1] + delta[0]],
        [shape.box[1][0] + delta[1], shape.box[1][1] + delta[1]], [shape.box[2][0] + delta[2], shape.box[2][1] + delta[2]]] }),
  }) };
}

/**
 * The living room holding `count` people (#p0, #p1, …), each one of `characters` (the test characters) in turn, in
 * rows of eight, each in a box 0.4 m square or the character's own `box`.
 */
export const crowdLayout = (count: number, characters = TEST_CHARACTERS): RoomLayout => {
  const layout = livingRoomLayout();
  layout.things = Array.from({ length: count }, (_, i) => {
    const ch = characters[i % characters.length];
    const x = -2 + (i % 8) * 0.5;
    const y = -1.5 + Math.floor(i / 8) * 0.7;
    const [w, d] = ch.box ?? [0.4, 0.4];
    return {
      id: `#p${i}`,
      name: ch.name,
      kind: "person" as const,
      fixed: true,
      mounted: false,
      shapes: [{ box: [[x - w / 2, x + w / 2], [y - d / 2, y + d / 2], [0, ch.height]] as [[number, number], [number, number], [number, number]] }],
      appearance: ch.appearance,
    };
  });
  return layout;
};

/**
 * A small living room with the optional classes and material fields, written by hand
 * to cover every drawn form in one small room. 5 x 4 x 2.5 m. Tests only.
 */
export const livingRoomLayout = (): RoomLayout => ({
  num: 25828,
  size: [5, 4, 2.5],
  exits: [
    { name: "south", to: 25827, at: [0, -1.9, 0], width: 0.9 },
    { name: "east", to: 25829, at: [2.4, 1, 0], width: 1.0 },
  ],
  things: [
    {
      id: "#1",
      name: "coffee table",
      kind: "object",
      fixed: false,
      mounted: false,
      shapes: [{ box: [[-0.6, 0.6], [-0.3, 0.3], [0, 0.45]] }],
      classes: ["table", "furniture", "thing"],
      material: [{ species: "wood", fraction: 0.9 }, { species: "metal", fraction: 0.1 }],
    },
    {
      id: "#2",
      name: "sofa",
      kind: "object",
      fixed: false,
      mounted: false,
      shapes: [{ box: [[-1.0, 1.0], [1.1, 2.0], [0, 0.9]] }],
      pose: { centre_m: [0, 1.55, 0.45], dimensions_m: [2, 0.9, 0.9], body_quaternion: [1, 0, 0, 0], box: true },
      front: { axis: [0, -1, 0], yaw: 0, direction: "south" },
      classes: ["furniture", "thing"],
      material: [{ species: "foam", fraction: 0.4 }, { species: "cotton", fraction: 0.5 }, { species: "wood", fraction: 0.1 }],
    },
    {
      id: "#3",
      name: "bookshelf",
      kind: "object",
      fixed: true,
      mounted: false,
      shapes: [{ box: [[-2.5, -2.1], [-1.0, 0.0], [0, 2.0]] }],
      classes: ["bookshelf", "container", "thing"],
      material: [{ species: "wood", fraction: 1 }],
    },
    {
      id: "#4",
      name: "a framed print",
      kind: "object",
      fixed: true,
      mounted: true,
      shapes: [{ box: [[0.2, 0.8], [1.97, 2.0], [1.4, 1.9]] }],
      classes: ["moving_photograph", "thing"],
      material: [{ species: "paper", fraction: 0.7 }, { species: "glass", fraction: 0.3 }],
    },
    {
      id: "#5",
      name: "television",
      kind: "object",
      fixed: false,
      mounted: false,
      shapes: [{ box: [[-0.5, 0.5], [-2.0, -1.9], [0.5, 1.1]] }],
      classes: ["tv", "audio_device", "thing"],
      material: [{ species: "lcd", fraction: 0.5 }, { species: "plastic", fraction: 0.3 }, { species: "circuitboard", fraction: 0.2 }],
    },
    {
      id: "#6",
      name: "door",
      kind: "object",
      fixed: true,
      mounted: false,
      shapes: [{ box: [[2.45, 2.5], [0.5, 1.5], [0, 2.0]] }],
      classes: ["door_leaf", "thing"],
      material: [{ species: "wood", fraction: 1 }],
    },
    {
      id: "#7",
      name: "a paperback",
      kind: "object",
      fixed: false,
      mounted: false,
      shapes: [{ box: [[0.1, 0.3], [-0.1, 0.05], [0.45, 0.48]] }],
      classes: ["book", "thing"],
      material: [{ species: "paper", fraction: 1 }],
    },
    {
      id: "#8",
      name: "robot vacuum",
      kind: "object",
      fixed: false,
      mounted: false,
      shapes: [{ sphere: [[1.5, -1.0, 0.1], 0.15] }],
      classes: ["thing"],
    },
    {
      id: "#99",
      name: "Player 1",
      kind: "player",
      fixed: true,
      mounted: false,
      shapes: [{ box: [[1.4, 1.8], [0.2, 0.6], [0, 1.8]] }],
      origin: [1.6, 0.4, 1.67],
      classes: ["player"],
    },
    {
      id: "#9",
      name: "Person 1",
      kind: "person",
      fixed: true,
      mounted: false,
      shapes: [{ box: [[-1.8, -1.4], [-1.6, -1.2], [0, 1.7]] }],
      origin: [-1.6, -1.4, 1.6],
      classes: ["janet", "wanderer"],
    },
  ],
});

/** The Room.Layout contract's example (docs/room-layout.md), with a body for an invented player. Tests only. */
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
      name: "Ondine",
      kind: "player",
      fixed: true,
      mounted: false,
      shapes: [{ box: [[1.0, 1.4], [-2.0, -1.6], [0.0, 1.8]] }],
      origin: [1.2, -1.8, 1.67],
    },
  ],
});
