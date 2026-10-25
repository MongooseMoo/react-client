import { create } from "zustand";

/** health is the player's own body; body and power are reserves that abilities draw on. */
export type MeterKind = "health" | "body" | "power";

/** One entry of Char.Vitals. */
export interface Meter {
  id: string;
  kind: MeterKind;
  label: string;
  value: number;
  max: number;
  /** Condition words, such as "slightly bruised"; the server sends them for health. */
  words?: string;
  /** Change per second from the moment the meter arrived; positive is recovery. */
  rate: number;
}

/** One entry of Char.Effects. */
export interface Effect {
  section: string;
  name: string;
  source: string;
  seconds: number;
  dismissible: boolean;
}

/** Char.Target: the player's engaged opponent; value is the fraction remaining. */
export interface Target {
  name: string;
  value: number;
  words: string;
}

interface CharacterStatusState {
  meters: Meter[];
  /** performance.now() when the meters arrived; each moves by its rate from then. */
  metersAt: number;
  /** Null until the first Char.Effects, so the first list is not heard as gains. */
  effects: Effect[] | null;
  target: Target | null;
  setMeters: (meters: Meter[], at: number) => void;
  setEffects: (effects: Effect[]) => void;
  setTarget: (target: Target | null) => void;
  reset: () => void;
}

export const useCharacterStatusStore = create<CharacterStatusState>((set) => ({
  meters: [],
  metersAt: 0,
  effects: null,
  target: null,
  setMeters: (meters, at) => set({ meters, metersAt: at }),
  setEffects: (effects) => set({ effects }),
  setTarget: (target) => set({ target }),
  reset: () => set({ meters: [], metersAt: 0, effects: null, target: null }),
}));

/** The meter's value at `now`, moved by its rate since `at` and kept within 0 and its max. */
export function meterValueAt(meter: Meter, at: number, now: number): number {
  const moved = meter.value + (meter.rate * (now - at)) / 1000;
  return Math.min(Math.max(moved, 0), meter.max);
}

/** Whole percent of max, 0 when max is not positive. */
export function percentOf(value: number, max: number): number {
  if (max <= 0) return 0;
  return Math.round((value / max) * 100);
}

/** Whether any meter is still moving toward 0 or its max at `now`. */
export function metersMoving(meters: readonly Meter[], at: number, now: number): boolean {
  return meters.some((meter) => {
    if (meter.rate === 0) return false;
    const value = meterValueAt(meter, at, now);
    return meter.rate > 0 ? value < meter.max : value > 0;
  });
}
