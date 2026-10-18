// Per-voice occlusion: how much of a sound's direct path is obstructed, 0 (clear)
// to 1 (fully occluded). The server decides the amount; Cacophony renders it in
// a stage of its own inside each Playback, ahead of the panner, so it is
// independent of volume, fades, distance gain, sends and effect routing.

/** How long a live voice takes to reach a new amount (a door opening or closing mid-sound). */
export const OCCLUSION_GLIDE_MS = 150;

/** A voice whose engine renders occlusion (Cacophony >= 0.34 `Playback`). */
export interface OcclusionVoice {
  setOcclusion(amount: number, durationMs?: number): void;
}

/** Whether this voice (or a voice prototype) has the engine's occlusion stage. */
export function hasOcclusion(voice: unknown): voice is OcclusionVoice {
  return (
    typeof voice === 'object' &&
    voice !== null &&
    typeof (voice as Partial<OcclusionVoice>).setOcclusion === 'function'
  );
}
