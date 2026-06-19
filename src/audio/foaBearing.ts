// Source bearing for positional first-order ambisonics.
//
// The clean FOA path (encodeMonoToFoaSN3D → FoaDecoder) needs the source's
// direction *relative to the listener's head*: an azimuth (CCW from front,
// + = left) and an elevation (+ = up), matching the convention locked by
// cacophony's `encodeMonoToFoaSN3D` (SN3D/ACN, +x forward, +y left, +z up).
//
// World frame here is the Web Audio listener frame the rest of the client
// already uses: +x = right, +y = up, -z = forward (default listener forward is
// (0,0,-1)), and `MediaService.currentListenerYaw` reads heading as
// `atan2(forward.x, -forward.z)`. We mirror that exactly so a sound's encoded
// bearing agrees with the listener model already in play.
//
// Listener pitch/roll are intentionally ignored: we take heading (yaw) from the
// horizontal forward vector only and read elevation straight from world +y. MOO
// players are upright, so this is exact for our world and keeps the math
// testable; full head-tilt would need the up-vector too.

export type Vec3 = readonly number[];

export interface SourceBearing {
  /** Azimuth in radians, CCW from front, + = left (the `theta` of encodeMonoToFoaSN3D). */
  readonly azimuth: number;
  /** Elevation in radians, + = up (the `phi` of encodeMonoToFoaSN3D). */
  readonly elevation: number;
}

const FRONT: SourceBearing = { azimuth: 0, elevation: 0 };

function isVec3(v: Vec3 | null | undefined): v is Vec3 {
  return !!v && v.length >= 3 && Number.isFinite(v[0]) && Number.isFinite(v[1]) && Number.isFinite(v[2]);
}

/** Normalize an angle to (-π, π]. */
function wrapPi(angle: number): number {
  const twoPi = 2 * Math.PI;
  let a = angle % twoPi;
  if (a <= -Math.PI) {
    a += twoPi;
  } else if (a > Math.PI) {
    a -= twoPi;
  }
  return a;
}

/**
 * Bearing of `sourcePos` relative to a listener at `listenerPos` facing
 * `listenerForward`. Returns front (az=0, el=0) when inputs are missing/short or
 * the source is co-located with the listener (no meaningful direction).
 *
 * Derivation (all in the Web Audio world frame, +x right / +y up / -z forward):
 *   r          = sourcePos - listenerPos
 *   heading θ  = atan2(forward.x, -forward.z)   // listener yaw, 0 = facing -z
 *   sourceφw   = atan2(r.x, -r.z)               // source world heading, same convention
 *   azimuth    = θ - sourceφw                   // CCW, + = left, relative to facing
 *   elevation  = atan2(r.y, hypot(r.x, r.z))    // + = up
 */
export function sourceBearing(
  listenerPos: Vec3 | null | undefined,
  listenerForward: Vec3 | null | undefined,
  sourcePos: Vec3 | null | undefined,
): SourceBearing {
  if (!isVec3(listenerPos) || !isVec3(sourcePos)) {
    return FRONT;
  }
  const rx = sourcePos[0] - listenerPos[0];
  const ry = sourcePos[1] - listenerPos[1];
  const rz = sourcePos[2] - listenerPos[2];

  const horizontal = Math.hypot(rx, rz);
  if (horizontal === 0 && ry === 0) {
    return FRONT;
  }

  const heading = isVec3(listenerForward) ? Math.atan2(listenerForward[0], -listenerForward[2]) : 0;
  const sourceHeading = Math.atan2(rx, -rz);
  const azimuth = wrapPi(heading - sourceHeading);
  const elevation = Math.atan2(ry, horizontal);

  return { azimuth, elevation };
}
