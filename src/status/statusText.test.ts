import { describe, expect, it } from "vitest";
import type { Meter } from "../stores/characterStatusStore";
import { describeMeter, statusReadout } from "./statusText";

const health: Meter = { id: "health", kind: "health", label: "Health", value: 72, max: 100, words: "slightly bruised", rate: 0 };
const qi: Meter = { id: "#149602", kind: "body", label: "Qi", value: 25, max: 50, rate: 0 };
const mana: Meter = { id: "#2", kind: "power", label: "Mana", value: 10, max: 40, rate: 2 };
const psi: Meter = { id: "#3", kind: "power", label: "Psi", value: 0, max: 0, rate: 0 };

describe("statusReadout", () => {
  const status = { meters: [health, qi, mana, psi], metersAt: 1000, target: null };

  it("reads health with its words, the body reserve, and every power meter", () => {
    expect(statusReadout("health", status, 1000)).toBe("Health 72%, slightly bruised");
    expect(statusReadout("body", status, 1000)).toBe("Qi 50%");
    expect(statusReadout("power", status, 1000)).toBe("Mana 25%. Psi 0%");
  });

  it("moves a meter by its rate since it arrived, within 0 and max", () => {
    expect(statusReadout("power", status, 6000)).toBe("Mana 50%. Psi 0%");
    expect(describeMeter(mana, 1000, 1000 + 60_000)).toBe("Mana 100%");
    expect(describeMeter({ ...mana, rate: -5 }, 1000, 1000 + 60_000)).toBe("Mana 0%");
  });

  it("reads the target, and says when there is nothing to read", () => {
    expect(statusReadout("target", { ...status, target: { name: "a rat", value: 0.3, words: "badly hurt" } }, 0))
      .toBe("a rat 30%, badly hurt");
    const empty = { meters: [], metersAt: 0, target: null };
    expect(statusReadout("health", empty, 0)).toBe("No health reading");
    expect(statusReadout("power", empty, 0)).toBe("No power reserves");
    expect(statusReadout("body", empty, 0)).toBe("No body reserve");
    expect(statusReadout("target", empty, 0)).toBe("No target");
  });
});
