import type { LayoutThing, LayoutVector, RoomLayout } from "../gmcp/Room";

/** What the layout preview (`layoutPreview.ts`, `scripts/preview-layout.mjs`) draws and from where. */

/** Where each view looks from, as a direction from the things' middle (x east, y north, z up). */
export const PREVIEW_VIEWS: Readonly<Record<string, LayoutVector>> = {
  front: [0, -1, 0.3],
  "three-quarter": [0.8, -1, 0.7],
  side: [1, 0, 0.3],
  back: [0, 1, 0.3],
  top: [0, 0, 1],
};

const record = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const box = (value: unknown): value is LayoutVector =>
  Array.isArray(value) && value.length === 3 && value.every((n) => typeof n === "number" && Number.isFinite(n) && n > 0);

/**
 * A Room.Layout to draw: `input` itself when it is one (it has `size` and `things`), else one thing: its box
 * `{"size": [w, d, h]}` in metres, standing on the floor in the middle of a room three times its width, with every
 * other key taken as that Room.Layout thing's own (`form_parts`, `material`, `name`, and any later one, such as a
 * person's `kind` and `appearance`), so a key the game adds needs no change here.
 */
export function previewLayout(input: unknown): RoomLayout {
  if (record(input) && Array.isArray(input.things) && box(input.size)) return input as unknown as RoomLayout;
  if (!record(input) || !box(input.size)) {
    throw new Error('The input must be a Room.Layout ({"size": [w, d, h], "things": [...]}) or one thing ({"size": [w, d, h], "form_parts": [...], ...}), sizes in metres above 0.');
  }
  const { size, ...own } = input;
  const [w, d, h] = size;
  const thing = {
    id: "#1",
    name: "preview",
    kind: "object",
    fixed: true,
    mounted: false,
    lifetime: "preview",
    shapes: [{ box: [[-w / 2, w / 2], [-d / 2, d / 2], [0, h]] }],
    pose: { centre_m: [0, 0, h / 2], dimensions_m: [w, d, h], body_quaternion: [1, 0, 0, 0], box: true },
    ...own,
  } as LayoutThing;
  const across = Math.max(3, 3 * Math.max(w, d));
  return { num: 0, size: [across, across, Math.max(2.5, h * 1.5)], exits: [], things: [thing] };
}
