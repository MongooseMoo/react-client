/**
 * Shared de-zipper for spatial AudioParam writes. Position tweening delivers
 * per-frame steps; smoothing each write with a short exponential ramp
 * (setTargetAtTime) removes the residual staircase and the clicks that raw
 * `param.value =` assignments produce on gain and panner params.
 */

/** Time constant (s): ~63% of the way per tau, settled within ~3·tau (≈90ms). */
export const SPATIAL_PARAM_TAU_S = 0.03;

/**
 * Structural subset of AudioParam accepted here, so tests (and cacophony's
 * wrapper types) can pass plain `{ value }` objects.
 */
export interface SmoothableParam {
  value: number;
  setTargetAtTime?(value: number, startTime: number, timeConstant: number): unknown;
}

/**
 * Ramp `param` toward `value` with an exponential approach starting at
 * `currentTime`. Falls back to a direct assignment when the param cannot
 * schedule (mock nodes, detached contexts).
 */
export function smoothParamTo(
  param: SmoothableParam,
  value: number,
  currentTime: number | undefined,
  tauS: number = SPATIAL_PARAM_TAU_S,
): void {
  if (typeof param.setTargetAtTime === 'function' && Number.isFinite(currentTime)) {
    param.setTargetAtTime(value, currentTime as number, tauS);
  } else {
    param.value = value;
  }
}
