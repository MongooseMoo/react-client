import { announce } from "@react-aria/live-announcer";
import {
  meterValueAt,
  percentOf,
  useCharacterStatusStore,
  type Effect,
} from "../stores/characterStatusStore";
import { usePreferences } from "../stores/preferencesStore";
import { StatusCues, healthBand, type ToneMaker } from "./statusCues";

// Spoken once each time health falls from at or above the line to below it.
const WARNING_LINES = [50, 25, 10];
// A reserve's tone plays when it moves into another tenth of its max.
const RESERVE_STEP = 10;

/** The lowest warning line health fell below between these two percents, if any. */
export function warningCrossed(before: number, after: number): number | undefined {
  return WARNING_LINES.filter((line) => before >= line && after < line).at(-1);
}

const effectKey = (effect: Effect) => `${effect.section}\u0000${effect.name}\u0000${effect.source}`;

/**
 * Plays the status cues and speaks the health warnings as Char.Vitals,
 * Char.Effects and Char.Target arrive. Only received changes are heard; a
 * meter moving by its rate between updates is silent. Returns the unsubscribe.
 */
export function followStatus(audio: ToneMaker): () => void {
  const cues = new StatusCues(audio);
  return useCharacterStatusStore.subscribe((state, previous) => {
    const prefs = usePreferences.getState().status;

    if (state.meters !== previous.meters) {
      for (const meter of state.meters) {
        const before = previous.meters.find((old) => old.id === meter.id);
        if (!before) continue;
        const was = percentOf(meterValueAt(before, previous.metersAt, state.metersAt), before.max);
        const now = percentOf(meter.value, meter.max);
        if (meter.kind === "health") {
          if (prefs.heartbeat.enabled && healthBand(was) !== healthBand(now)) {
            cues.heartbeat(healthBand(now), prefs.heartbeat.volume);
          }
          const line = warningCrossed(was, now);
          if (prefs.warnings.enabled && line !== undefined) {
            announce(`Health below ${line} percent`, "assertive");
          }
        } else if (prefs.reserveTones.enabled &&
          Math.floor(was / RESERVE_STEP) !== Math.floor(now / RESERVE_STEP)) {
          cues.reserve(now, prefs.reserveTones.volume);
        }
      }
    }

    if (state.effects !== previous.effects && state.effects && previous.effects && prefs.effectEarcons.enabled) {
      const had = new Set(previous.effects.map(effectKey));
      const has = new Set(state.effects.map(effectKey));
      if (state.effects.some((effect) => !had.has(effectKey(effect)))) cues.effect(true, prefs.effectEarcons.volume);
      if (previous.effects.some((effect) => !has.has(effectKey(effect)))) cues.effect(false, prefs.effectEarcons.volume);
    }

    if (state.target && state.target !== previous.target && prefs.targetBlip.enabled &&
      state.target.value !== previous.target?.value) {
      cues.targetBlip(Math.round(state.target.value * 100), prefs.targetBlip.volume);
    }
  });
}
