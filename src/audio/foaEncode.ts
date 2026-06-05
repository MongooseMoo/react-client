/**
 * First-order ambisonic (FOA) encoding gains for a mono point source.
 *
 * omnitone's FOARenderer (DEFAULT channel map `[0,1,2,3]`) expects **ACN channel
 * order** `[W, Y, Z, X]` with **SN3D** normalization (ambiX) — verified against
 * `omnitone.esm.js` (`FOARouter.ChannelMap.FUMA = [0,3,1,2]` maps FuMa→ACN, so
 * DEFAULT is ACN). Under SN3D, a unit-amplitude planewave from a unit direction
 * `d` encodes to first order as simply:
 *
 *   W = 1,  Y = d_y,  Z = d_z,  X = d_x
 *
 * i.e. W omnidirectional plus the direction cosines on the first-order channels.
 * This function is the convention-INDEPENDENT core: it takes a direction already
 * expressed in the ambisonic frame (x = front, y = left, z = up) and returns the
 * ACN-ordered gains. The mapping FROM the server's `scaled_position()` vector
 * INTO that ambisonic frame is a separate, integration-validated step
 * ({@link ambisonicDirectionFromWorld}) — that axis binding must be confirmed
 * empirically (it is jointly constrained with omnitone's rotation), so it is kept
 * apart from this math.
 */
export type AcnFoaGains = [number, number, number, number]; // [W, Y, Z, X]

const EPSILON = 1e-9;

export function foaEncodeGainsACN(directionAmbisonic: [number, number, number]): AcnFoaGains {
  const [x, y, z] = normalize(directionAmbisonic);
  return [1, y, z, x];
}

/**
 * Map a Web-Audio-frame vector (x = right, y = up, z = back / −forward) to the
 * ambisonic frame (x = front, y = left, z = up):
 *
 *   front = −z_wa,  left = −x_wa,  up = y_wa
 *
 * This is the DEFAULT assumption for a `scaled_position()` already expressed in
 * the client's Web Audio world frame. If the sensor sphere uses a different frame
 * (e.g. nautical +x forward), swap this mapping — it is the single axis-convention
 * seam, and MUST be confirmed against the live renderer (a contact at a known
 * bearing audibly/deterministically at that bearing) before shipping.
 */
export function ambisonicDirectionFromWorld(
  worldVector: [number, number, number],
): [number, number, number] {
  const [x, y, z] = worldVector;
  return [-z, -x, y];
}

function normalize(v: [number, number, number]): [number, number, number] {
  const [x, y, z] = v;
  const len = Math.hypot(x, y, z);
  if (len < EPSILON) {
    // Degenerate direction (contact at the listener): encode as omnidirectional
    // only — no directional bias.
    return [0, 0, 0];
  }
  return [x / len, y / len, z / len];
}
