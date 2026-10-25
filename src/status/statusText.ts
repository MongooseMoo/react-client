import {
  meterValueAt,
  percentOf,
  type Meter,
  type MeterKind,
  type Target,
} from "../stores/characterStatusStore";

/** What each status key reads: Alt+H health, Alt+M power, Alt+V body, Alt+T target. */
export type StatusReadout = "health" | "power" | "body" | "target";

/** "Health 72%, slightly bruised": the percent and words, as shown and as spoken. */
export function describeMeter(meter: Meter, at: number, now: number): string {
  const percent = percentOf(meterValueAt(meter, at, now), meter.max);
  return `${meter.label} ${percent}%${meter.words ? `, ${meter.words}` : ""}`;
}

export function describeTarget(target: Target): string {
  return `${target.name} ${Math.round(target.value * 100)}%${target.words ? `, ${target.words}` : ""}`;
}

const NONE: Record<StatusReadout, string> = {
  health: "No health reading",
  power: "No power reserves",
  body: "No body reserve",
  target: "No target",
};

const KIND: Record<Exclude<StatusReadout, "target">, MeterKind> = {
  health: "health",
  power: "power",
  body: "body",
};

/** The sentence a status key speaks. */
export function statusReadout(
  readout: StatusReadout,
  status: { meters: readonly Meter[]; metersAt: number; target: Target | null },
  now: number,
): string {
  if (readout === "target") return status.target ? describeTarget(status.target) : NONE.target;
  const meters = status.meters.filter((meter) => meter.kind === KIND[readout]);
  if (meters.length === 0) return NONE[readout];
  return meters.map((meter) => describeMeter(meter, status.metersAt, now)).join(". ");
}
