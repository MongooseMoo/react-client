/**
 * Exit directions as GMCP Room.Info sends them (IRE style: "n", "ne", "u",
 * "in"), with the long names people read and the grid step each one takes on
 * the drawn map. Screen y grows downward, so north is -1.
 */
export interface DirectionStep {
  dx: number;
  dy: number;
  dz: number;
}

interface DirectionInfo {
  name: string;
  step: DirectionStep | null;
}

const DIRECTIONS: Record<string, DirectionInfo> = {
  n: { name: "north", step: { dx: 0, dy: -1, dz: 0 } },
  ne: { name: "northeast", step: { dx: 1, dy: -1, dz: 0 } },
  e: { name: "east", step: { dx: 1, dy: 0, dz: 0 } },
  se: { name: "southeast", step: { dx: 1, dy: 1, dz: 0 } },
  s: { name: "south", step: { dx: 0, dy: 1, dz: 0 } },
  sw: { name: "southwest", step: { dx: -1, dy: 1, dz: 0 } },
  w: { name: "west", step: { dx: -1, dy: 0, dz: 0 } },
  nw: { name: "northwest", step: { dx: -1, dy: -1, dz: 0 } },
  u: { name: "up", step: { dx: 0, dy: 0, dz: 1 } },
  d: { name: "down", step: { dx: 0, dy: 0, dz: -1 } },
  in: { name: "in", step: null },
  out: { name: "out", step: null },
};

const SHORT_BY_LONG: Record<string, string> = Object.fromEntries(
  Object.entries(DIRECTIONS).map(([short, info]) => [info.name, short]),
);

/** The short key for a direction ("north" and "n" both give "n"); any other exit name comes back lower-cased. */
export function normalizeDirection(key: string): string {
  const lower = key.trim().toLowerCase();
  return SHORT_BY_LONG[lower] ?? lower;
}

/** The name to show or speak for an exit key: "n" reads "north", "hatch" stays "hatch". */
export function directionLabel(key: string): string {
  const short = normalizeDirection(key);
  return DIRECTIONS[short]?.name ?? short;
}

/** The grid step for an exit key, or null for in, out and named exits. */
export function directionStep(key: string): DirectionStep | null {
  return DIRECTIONS[normalizeDirection(key)]?.step ?? null;
}

/** Compass and vertical directions first in their usual order, then everything else alphabetically. */
export function compareDirections(a: string, b: string): number {
  const order = Object.keys(DIRECTIONS);
  const ia = order.indexOf(normalizeDirection(a));
  const ib = order.indexOf(normalizeDirection(b));
  if (ia !== -1 || ib !== -1) {
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  }
  return a.localeCompare(b);
}
