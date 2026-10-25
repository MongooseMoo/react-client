import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { announce } from "@react-aria/live-announcer";
import { useCharacterStatusStore, type Effect, type Meter } from "../stores/characterStatusStore";
import { usePreferences } from "../stores/preferencesStore";
import { StatusCues, type ToneMaker } from "./statusCues";
import { followStatus, warningCrossed } from "./statusFeedback";

vi.mock("@react-aria/live-announcer", () => ({ announce: vi.fn() }));

const health = (value: number, rate = 0): Meter =>
  ({ id: "health", kind: "health", label: "Health", value, max: 100, words: "", rate });
const mana = (value: number, rate = 0): Meter =>
  ({ id: "#7", kind: "power", label: "Mana", value, max: 50, rate });
const effect = (name: string): Effect => ({ section: "Spells", name, source: "you", seconds: 30, dismissible: true });

describe("followStatus", () => {
  let stop: () => void;
  const status = () => useCharacterStatusStore.getState();
  const defaults = usePreferences.getState().status;

  beforeEach(() => {
    vi.spyOn(StatusCues.prototype, "heartbeat").mockImplementation(() => {});
    vi.spyOn(StatusCues.prototype, "reserve").mockImplementation(() => {});
    vi.spyOn(StatusCues.prototype, "effect").mockImplementation(() => {});
    vi.spyOn(StatusCues.prototype, "targetBlip").mockImplementation(() => {});
    stop = followStatus({} as ToneMaker);
  });

  afterEach(() => {
    stop();
    status().reset();
    usePreferences.getState().setStatus(defaults);
    vi.restoreAllMocks();
    vi.mocked(announce).mockClear();
  });

  it("is silent for the first vitals, effects and empty target of a session", () => {
    status().setMeters([health(80), mana(25)], 0);
    status().setEffects([effect("Shield")]);
    expect(StatusCues.prototype.heartbeat).not.toHaveBeenCalled();
    expect(StatusCues.prototype.reserve).not.toHaveBeenCalled();
    expect(StatusCues.prototype.effect).not.toHaveBeenCalled();
    expect(announce).not.toHaveBeenCalled();
  });

  it("beats on a band change and warns once for each line crossed on the way down", () => {
    status().setMeters([health(80)], 0);
    status().setMeters([health(60)], 1);
    expect(StatusCues.prototype.heartbeat).toHaveBeenLastCalledWith(1, 0.5);
    expect(announce).not.toHaveBeenCalled();

    status().setMeters([health(20)], 2);
    expect(announce).toHaveBeenCalledWith("Health below 25 percent", "assertive");
    expect(StatusCues.prototype.heartbeat).toHaveBeenLastCalledWith(3, 0.5);

    status().setMeters([health(18)], 3);
    expect(announce).toHaveBeenCalledTimes(1);

    status().setMeters([health(40)], 4);
    status().setMeters([health(24)], 5);
    expect(announce).toHaveBeenCalledTimes(2);
  });

  it("measures the change from where the meter had moved to by its rate", () => {
    // Recovering 1 % a second from 40, it stood at 60 after 20 seconds: 55 is a small fall, not a rise past 50.
    status().setMeters([health(40, 1)], 0);
    status().setMeters([health(55)], 20_000);
    expect(announce).not.toHaveBeenCalled();
    expect(StatusCues.prototype.heartbeat).not.toHaveBeenCalled();
  });

  it("plays a reserve tone when the reserve moves into another tenth", () => {
    status().setMeters([mana(25)], 0);
    status().setMeters([mana(24)], 1);
    expect(StatusCues.prototype.reserve).toHaveBeenLastCalledWith(48, 0.5);
    status().setMeters([mana(23)], 2);
    expect(StatusCues.prototype.reserve).toHaveBeenCalledTimes(1);
  });

  it("plays earcons for effects gained and lost", () => {
    status().setEffects([effect("Shield")]);
    status().setEffects([effect("Shield"), effect("Haste")]);
    expect(StatusCues.prototype.effect).toHaveBeenLastCalledWith(true, 0.5);
    status().setEffects([effect("Haste")]);
    expect(StatusCues.prototype.effect).toHaveBeenLastCalledWith(false, 0.5);
  });

  it("blips when the target's health changes, not when it clears", () => {
    status().setTarget({ name: "a rat", value: 1, words: "unhurt" });
    status().setTarget({ name: "a rat", value: 0.4, words: "hurt" });
    status().setTarget({ name: "a rat", value: 0.4, words: "hurt" });
    status().setTarget(null);
    expect(vi.mocked(StatusCues.prototype.targetBlip).mock.calls).toEqual([[100, 0.5], [40, 0.5]]);
  });

  it("keeps a cue quiet when the player turned it off", () => {
    usePreferences.getState().setStatus({
      ...defaults,
      heartbeat: { enabled: false, volume: 0.5 },
      warnings: { enabled: false },
      reserveTones: { enabled: false, volume: 0.5 },
    });
    status().setMeters([health(80), mana(25)], 0);
    status().setMeters([health(5), mana(2)], 1);
    expect(StatusCues.prototype.heartbeat).not.toHaveBeenCalled();
    expect(StatusCues.prototype.reserve).not.toHaveBeenCalled();
    expect(announce).not.toHaveBeenCalled();
  });
});

describe("warningCrossed", () => {
  it("names the lowest line passed downward and nothing on the way up", () => {
    expect(warningCrossed(60, 49)).toBe(50);
    expect(warningCrossed(60, 5)).toBe(10);
    expect(warningCrossed(50, 50)).toBeUndefined();
    expect(warningCrossed(5, 60)).toBeUndefined();
  });
});
