import type { Position } from 'cacophony';

export type CoordinateVector = readonly [number, number, number];

export interface CoordinateOrientation {
  forward?: CoordinateVector | null;
  up?: CoordinateVector | null;
}

// Mongoose world space is east=+x, north=+y, up=+z.
// Web Audio/Cacophony space is right=+x, up=+y, forward=-z.
export function mongooseToWebAudioVector(
  vector: CoordinateVector | Position | null | undefined,
): Position | null {
  if (!vector || vector.length < 3) {
    return null;
  }
  const [east, north, up] = vector;
  return [east, up, north];
}

export function mongooseToWebAudioOrientation<T extends CoordinateOrientation | null | undefined>(
  orientation: T,
): { forward?: Position | null; up?: Position | null } | null | undefined {
  if (!orientation) {
    return orientation;
  }
  return {
    forward: mongooseToWebAudioVector(orientation.forward),
    up: mongooseToWebAudioVector(orientation.up),
  };
}
