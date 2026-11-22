import { describe, expect, it } from "vitest";
import { drawableLayout, formPartProblem, formPartsProblem } from "../gmcp/Room";
import { placeThings } from "../map/roomLayout";
import { buildRoomScene, disposeRoomScene } from "../map/roomScene";
import { previewLayout } from "./previewInput";

const blade = { shape: "extrude", role: "blade", label: "blade", center: [0, 0, 0], size: [0.05, 0.8, 0.007], outline: [[0, 0], [1, 0], [0.5, 1]] };

describe("the layout preview's input", () => {
  it("stands one thing's parts in an empty room, keeping every other key as the thing's own", () => {
    const layout = previewLayout({ size: [0.2, 0.05, 1.1], name: "sword", form_parts: [blade], material: [{ species: "steel", fraction: 1 }], classes: ["weapon"] });
    expect(layout.things).toHaveLength(1);
    const [thing] = layout.things;
    expect(thing).toMatchObject({ name: "sword", kind: "object", form_parts: [blade], material: [{ species: "steel", fraction: 1 }], classes: ["weapon"] });
    expect(thing.pose).toMatchObject({ centre_m: [0, 0, 0.55], dimensions_m: [0.2, 0.05, 1.1], box: true });
    expect(layout.size[0]).toBeGreaterThanOrEqual(3);
    // It draws through the same scene code as the 3D views.
    const scene = buildRoomScene({ layout, placed: placeThings(layout), youId: "" });
    expect(scene.things.get("#1")?.children.length).toBe(1);
    disposeRoomScene(scene);
  });

  it("draws a person from the keys a person has, with no change to the preview", () => {
    const layout = previewLayout({ size: [0.5, 0.3, 1.75], kind: "player", name: "Ada", appearance: { skin: { name: "light", hex: "#e8c4a8" } } });
    const scene = buildRoomScene({ layout, placed: placeThings(layout), youId: "" });
    expect(scene.things.get("#1")?.userData.form).toBe("person");
    disposeRoomScene(scene);
  });

  it("passes a whole Room.Layout through, and says what it needs otherwise", () => {
    const room = { num: 1, size: [4, 3, 2.5], exits: [], things: [] };
    expect(previewLayout(room)).toBe(room);
    // A Room.Layout holding a person draws their figure.
    const person = {
      id: "#10", name: "Ada", kind: "player", fixed: false, mounted: false, shapes: [{ box: [[-0.25, 0.25], [-0.15, 0.15], [0, 1.75]] }],
      pose: { centre_m: [0, 0, 0.875], dimensions_m: [0.5, 0.3, 1.75], body_quaternion: [1, 0, 0, 0], box: true },
      appearance: { skin: { name: "deep brown", hex: "#5a3825" } },
    };
    const layout = previewLayout({ ...room, things: [person] });
    const scene = buildRoomScene({ layout, placed: placeThings(layout), youId: "" });
    expect(scene.things.get("#10")?.userData.form).toBe("person");
    disposeRoomScene(scene);
    for (const bad of [null, [], { form_parts: [blade] }, { size: [1, 0, 1], form_parts: [] }]) {
      expect(() => previewLayout(bad)).toThrow(/The input must be a Room.Layout .* or one thing/);
    }
  });
});

describe("the decoder's reasons", () => {
  it("names the first part it rejects, by number and role, and why", () => {
    expect(formPartsProblem([blade])).toBeUndefined();
    expect(formPartsProblem([blade, { ...blade, role: "edge", label: "edge", outline: [[0, 0], [0.5, 1], [1, 0]] }]))
      .toBe('part 1 (edge): "outline" must run anticlockwise (it runs clockwise or has no area)');
    expect(formPartsProblem([{ ...blade, shape: "torus" }])).toMatch(/^part 0 \(blade\): "shape" "torus" is not one the client draws/);
    expect(formPartsProblem("blade")).toBe('"form_parts" must be a list');
  });

  it("says why for each kind of field", () => {
    const base = { center: [0, 0, 0], size: [0.1, 0.1, 0.2] };
    const square = [[0, 0], [1, 0], [1, 1], [0, 1]];
    const cases: Array<[unknown, RegExp]> = [
      [{ ...base, shape: "box", round: 0.06 }, /"round" .* at most half the box's shortest side \(0.05\)/],
      [{ ...base, shape: "cylinder", round: 0.01 }, /"round" is only for a box, not a cylinder/],
      [{ ...base, shape: "box", arc: [0, 1] }, /"arc" is only for .* not a box/],
      // Anticlockwise overall, but its fourth corner rests on its first edge.
      [{ ...base, shape: "extrude", outline: [[0, 0], [1, 0], [1, 1], [0.5, 0], [0, 1]] }, /"outline" crosses or touches itself/],
      [{ ...base, shape: "extrude", outline: [[0, 0], [1, 0], [0.5, 1]], bevel: [0.01, 0.15] }, /depth at most half the height \(0.1\)/],
      [{ ...base, shape: "sweep", path: [[0, 0.5, 0.5], [1, 0.5, 0.5]], radius: [0.02] }, /one positive number of metres per path point \(2\)/],
      [{ ...base, shape: "sweep", path: [[0, 0.5, 0.5], [1, 0.5, 0.5]], radius: [0.02, 0.02], wall: [0.01, 0.01, 0.01] }, /solid: it takes no "wall"/],
      [{ ...base, shape: "loft", sections: [{ z: 0, outline: square }, { z: 1, outline: square.slice(0, 3) }] }, /section 1 has 3 points; every section must have 4/],
      [{ ...base, shape: "loft", sections: [{ z: 0.5, outline: square }, { z: 0.5, outline: square }] }, /section 1's z \(0.5\) must be above section 0's \(0.5\)/],
      [{ ...base, shape: "loft", sections: [{ z: 0, outline: square }, { z: 1, outline: [...square].reverse() }] }, /section 1's outline runs clockwise/],
      [{ ...base, shape: "loft", sections: [{ z: 0, outline: square }, { z: 1, outline: square }], holes: [[0, 2, 0, 1]] }, /each of "holes" .* s1 <= 1/],
      [{ ...base, shape: "cone" }, /a cone needs "top"/],
      [{ ...base, shape: "box", wall: [0.05, 0.01, 0.01] }, /"wall" must .* leaving room inside/],
      [{ ...base, shape: "box", role: "lid" }, /needs both/],
    ];
    for (const [part, reason] of cases) expect(formPartProblem(part)).toMatch(reason);
  });

  it("drops exactly the lists it gives a reason for", () => {
    const layout = previewLayout({ size: [0.2, 0.05, 1.1], form_parts: [blade, { ...blade, shape: "torus" }] });
    expect(drawableLayout(layout).things[0].form_parts).toBeUndefined();
    expect(drawableLayout(previewLayout({ size: [0.2, 0.05, 1.1], form_parts: [blade] })).things[0].form_parts).toEqual([blade]);
  });
});
