// Spatial distance attenuation shared by the HRTF panner (Web Audio PannerNode,
// configured in MediaService.applySoundState) and the ambisonic gain path
// (AmbisonicRenderer's pre-encoder distance gain). One source of truth so the two
// spatialization routes fall off identically for the same meter-scale world.
//
// Mirrors the Web Audio 'inverse' distance model with free-field attenuation:
// pressure amplitude falls as 1 / distance, so acoustic intensity falls as
// 1 / distance².

export type DistanceModel = {
  /** Full volume within this radius (metres). */
  readonly refDistance: number;
  /** Falloff steepness beyond refDistance. */
  readonly rolloffFactor: number;
  /** Distance is clamped here, so far sources settle to a constant floor. */
  readonly maxDistance: number;
};

export const SPATIAL_DISTANCE_MODEL: DistanceModel = {
  // Web Audio's inverse model with these values is exactly 1 / distance beyond
  // the 1 m near-field clamp. The distant clamp matches the Web Audio default.
  refDistance: 1,
  rolloffFactor: 1,
  maxDistance: 10000,
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

/** Distance curves a per-sound `spatial` profile may name (catalog `logarithmic` arrives as inverse). */
export const SPATIAL_MODELS = ['inverse', 'linear', 'none'] as const;
export type SpatialModel = (typeof SPATIAL_MODELS)[number];

/**
 * A per-sound `spatial` profile from `Client.Media.Play`
 * (sounds-todo/contracts.md § Spatial profiles). Angles in degrees.
 */
export interface SpatialProfile {
  readonly model: SpatialModel;
  readonly refDistance: number;
  readonly maxDistance: number;
  readonly rolloff: number;
  readonly coneInnerAngle: number;
  readonly coneOuterAngle: number;
  readonly coneOuterGain: number;
}

/** The curve for positioned sounds that carry no `spatial` profile (the pre-profile behaviour). */
export const DEFAULT_SPATIAL_PROFILE: SpatialProfile = {
  model: 'inverse',
  refDistance: SPATIAL_DISTANCE_MODEL.refDistance,
  maxDistance: SPATIAL_DISTANCE_MODEL.maxDistance,
  rolloff: SPATIAL_DISTANCE_MODEL.rolloffFactor,
  coneInnerAngle: 360,
  coneOuterAngle: 360,
  coneOuterGain: 1,
};

/**
 * Distance gain for a profile. With r = refDistance, m = maxDistance and
 * d' = clamp(d, r, m): inverse r / (r + rolloff (d' - r)), linear
 * max(0, 1 - rolloff (d' - r) / (m - r)), none 1. Max distance is a clamp,
 * not a cutoff.
 */
export function profileDistanceGain(distance: number, profile: SpatialProfile): number {
  const { model, refDistance, maxDistance, rolloff } = profile;
  if (model === 'none' || !Number.isFinite(distance) || distance <= refDistance) {
    return 1;
  }
  const clamped = Math.min(distance, maxDistance);
  if (model === 'linear') {
    return Math.max(0, 1 - (rolloff * (clamped - refDistance)) / (maxDistance - refDistance));
  }
  return refDistance / (refDistance + rolloff * (clamped - refDistance));
}

/**
 * The most a reverb send is raised to undo a source's distance gain (32 x is
 * +30 dB). The engine takes a send after the source's gain and accepts any
 * finite send gain, so it sets no limit of its own, and the curves give none
 * that is usable: the default one floors at 1 / 10 000 and a linear one
 * reaches 0, where the tap is silent and no boost can recover it. So this is a
 * choice: under the default curve a room's reverberant level is even out to
 * 32 m, and past that it falls with the direct sound. It is a cap on the
 * boost, not on the send, so that distance is the same whatever the send.
 */
export const MAX_SEND_DISTANCE_BOOST = 32;

/**
 * The gain to give a send that is tapped after `distanceGain`, so that what
 * reaches the reverb is `send` times the undistanced sound: send / distanceGain,
 * with the boost capped at {@link MAX_SEND_DISTANCE_BOOST}. The direct sound
 * still falls with distance, so the direct-to-reverb ratio does too.
 */
export function distanceCompensatedSend(send: number, distanceGain: number): number {
  const boost = distanceGain > 0 ? Math.min(1 / distanceGain, MAX_SEND_DISTANCE_BOOST) : MAX_SEND_DISTANCE_BOOST;
  return send * boost;
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
