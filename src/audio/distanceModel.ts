// Spatial distance attenuation shared by the HRTF panner (Web Audio PannerNode,
// configured in MediaService.applySoundState) and the ambisonic gain path
// (AmbisonicRenderer's pre-encoder distance gain). One source of truth so the two
// spatialization routes fall off identically for the same meter-scale world.
//
// Mirrors the Web Audio 'inverse' distance model with the tuned parameters from
// `fix(audio): tune 3D panner distance falloff for meter-scale world`.

export type DistanceModel = {
  /** Full volume within this radius (metres). */
  readonly refDistance: number;
  /** Falloff steepness beyond refDistance. */
  readonly rolloffFactor: number;
  /** Distance is clamped here, so far sources settle to a constant floor. */
  readonly maxDistance: number;
};

export const SPATIAL_DISTANCE_MODEL: DistanceModel = {
  refDistance: 4,
  rolloffFactor: 0.5,
  maxDistance: 200,
};

/**
 * Web Audio 'inverse' distance gain (0..1), matching the PannerNode config so an
 * ambisonic source attenuates exactly like an HRTF-panned one. At/inside
 * refDistance the gain is 1; beyond it falls as refDistance / (refDistance +
 * rolloffFactor * (clamp(distance, refDistance, maxDistance) - refDistance)).
 */
export function inverseDistanceGain(
  distance: number,
  model: DistanceModel = SPATIAL_DISTANCE_MODEL,
): number {
  const { refDistance, rolloffFactor, maxDistance } = model;
  if (!Number.isFinite(distance) || distance <= refDistance) {
    return 1;
  }
  const clamped = Math.min(distance, maxDistance);
  return refDistance / (refDistance + rolloffFactor * (clamped - refDistance));
}

/** Euclidean distance between two 3D positions; missing/short vectors → 0 (co-located). */
export function distanceBetween(
  a?: readonly number[] | null,
  b?: readonly number[] | null,
): number {
  if (!a || !b || a.length < 3 || b.length < 3) {
    return 0;
  }
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
