import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GamepadBackend } from "./GamepadBackend";
import type { HapticsBackend } from "./types";

// --- Mock Gamepad API helpers ---

interface MockVibrationActuator {
  effects: string[];
  playEffect: ReturnType<typeof vi.fn>;
  reset: ReturnType<typeof vi.fn>;
}

interface MockGamepad {
  index: number;
  id: string;
  connected: boolean;
  vibrationActuator: MockVibrationActuator | null;
  // Required Gamepad interface members (stubs)
  buttons: GamepadButton[];
  axes: number[];
  mapping: GamepadMappingType;
  timestamp: number;
  hapticActuators: GamepadHapticActuator[];
}

function createMockGamepad(
  index: number,
  options: {
    hasVibration?: boolean;
    hasTriggerRumble?: boolean;
    id?: string;
  } = {}
): MockGamepad {
  const {
    hasVibration = true,
    hasTriggerRumble = false,
    id = `Mock Gamepad ${index}`,
  } = options;

  const effects = hasVibration ? ["dual-rumble"] : [];
  if (hasTriggerRumble) effects.push("trigger-rumble");

  return {
    index,
    id,
    connected: true,
    vibrationActuator: hasVibration
      ? {
          effects,
          playEffect: vi.fn().mockResolvedValue("complete"),
          reset: vi.fn().mockResolvedValue("complete"),
        }
      : null,
    buttons: [],
    axes: [],
    mapping: "" as GamepadMappingType,
    timestamp: 0,
    hapticActuators: [],
  };
}

// Track gamepad state for navigator.getGamepads() mock
let mockGamepadSlots: (MockGamepad | null)[];

function setMockGamepads(gamepads: (MockGamepad | null)[]): void {
  // Ensure array has 4 slots (standard gamepad slot count)
  mockGamepadSlots = [null, null, null, null];
  for (let i = 0; i < gamepads.length; i++) {
    mockGamepadSlots[i] = gamepads[i];
  }
}

function fireGamepadConnected(gamepad: MockGamepad): void {
  const event = new Event("gamepadconnected") as GamepadEvent;
  Object.defineProperty(event, "gamepad", { value: gamepad });
  window.dispatchEvent(event);
}

function fireGamepadDisconnected(gamepad: MockGamepad): void {
  const event = new Event("gamepaddisconnected") as GamepadEvent;
  Object.defineProperty(event, "gamepad", { value: gamepad });
  window.dispatchEvent(event);
}

// --- Tests ---

describe("GamepadBackend", () => {
  let backend: GamepadBackend;

  beforeEach(() => {
    vi.useFakeTimers();
    backend = new GamepadBackend();
    mockGamepadSlots = [null, null, null, null];

    // Mock navigator.getGamepads
    Object.defineProperty(navigator, "getGamepads", {
      value: vi.fn(() => [...mockGamepadSlots]),
      writable: true,
      configurable: true,
    });
  });

  afterEach(async () => {
    if (backend.isConnected()) {
      await backend.disconnect();
    }
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // --- Interface conformance ---

  it("satisfies the HapticsBackend interface", () => {
    const asInterface: HapticsBackend = backend;
    expect(asInterface.name).toBe("gamepad");
    expect(asInterface.deviceClass).toBe("gaming");
  });

  // --- Lifecycle ---

  describe("connect/disconnect", () => {
    it("starts disconnected", () => {
      expect(backend.isConnected()).toBe(false);
    });

    it("connects and sets isConnected to true", async () => {
      await backend.connect();
      expect(backend.isConnected()).toBe(true);
    });

    it("disconnect sets isConnected to false", async () => {
      await backend.connect();
      await backend.disconnect();
      expect(backend.isConnected()).toBe(false);
    });

    it("connect is idempotent", async () => {
      await backend.connect();
      await backend.connect();
      expect(backend.isConnected()).toBe(true);
    });

    it("disconnect is idempotent", async () => {
      await backend.connect();
      await backend.disconnect();
      await backend.disconnect();
      expect(backend.isConnected()).toBe(false);
    });

    it("enumerates already-connected gamepads on connect", async () => {
      const gp = createMockGamepad(0);
      setMockGamepads([gp]);

      const handler = vi.fn();
      backend.on("devicechanged", handler);

      await backend.connect();

      expect(handler).toHaveBeenCalledOnce();
      expect(backend.getActuators()).toHaveLength(2);
    });
  });

  // --- Gamepad connection detection ---

  describe("gamepad connection events", () => {
    it("detects gamepad connection via gamepadconnected event", async () => {
      await backend.connect();

      const handler = vi.fn();
      backend.on("devicechanged", handler);

      const gp = createMockGamepad(0);
      setMockGamepads([gp]);
      fireGamepadConnected(gp);

      expect(handler).toHaveBeenCalledOnce();
      expect(backend.getActuators()).toHaveLength(2);
    });

    it("detects gamepad disconnection via gamepaddisconnected event", async () => {
      await backend.connect();

      const gp = createMockGamepad(0);
      setMockGamepads([gp]);
      fireGamepadConnected(gp);

      const handler = vi.fn();
      backend.on("devicechanged", handler);

      setMockGamepads([null]);
      fireGamepadDisconnected(gp);

      expect(handler).toHaveBeenCalledOnce();
      expect(backend.getActuators()).toHaveLength(0);
    });

    it("does not listen for gamepad events when disconnected", async () => {
      const handler = vi.fn();
      backend.on("devicechanged", handler);

      const gp = createMockGamepad(0);
      fireGamepadConnected(gp);

      expect(handler).not.toHaveBeenCalled();
      expect(backend.getActuators()).toHaveLength(0);
    });

    it("stops listening for gamepad events after disconnect", async () => {
      await backend.connect();
      await backend.disconnect();

      const handler = vi.fn();
      backend.on("devicechanged", handler);

      const gp = createMockGamepad(0);
      fireGamepadConnected(gp);

      expect(handler).not.toHaveBeenCalled();
    });
  });

  // --- Actuator enumeration ---

  describe("actuator enumeration", () => {
    it("exposes 2 actuators for a dual-rumble gamepad", async () => {
      await backend.connect();
      const gp = createMockGamepad(0);
      setMockGamepads([gp]);
      fireGamepadConnected(gp);

      const actuators = backend.getActuators();
      expect(actuators).toHaveLength(2);

      // Strong motor
      expect(actuators[0]).toEqual({
        id: 0,
        types: ["Vibrate"],
        steps: 256,
        deviceClass: "gaming",
      });
      // Weak motor
      expect(actuators[1]).toEqual({
        id: 1,
        types: ["Vibrate"],
        steps: 256,
        deviceClass: "gaming",
      });
    });

    it("exposes 4 actuators for a trigger-rumble gamepad", async () => {
      await backend.connect();
      const gp = createMockGamepad(0, { hasTriggerRumble: true });
      setMockGamepads([gp]);
      fireGamepadConnected(gp);

      const actuators = backend.getActuators();
      expect(actuators).toHaveLength(4);

      expect(actuators[0].id).toBe(0); // strong
      expect(actuators[1].id).toBe(1); // weak
      expect(actuators[2].id).toBe(2); // left trigger
      expect(actuators[3].id).toBe(3); // right trigger
    });

    it("assigns correct IDs for multiple gamepads", async () => {
      await backend.connect();

      const gp0 = createMockGamepad(0);
      const gp1 = createMockGamepad(1);
      setMockGamepads([gp0, gp1]);
      fireGamepadConnected(gp0);
      fireGamepadConnected(gp1);

      const actuators = backend.getActuators();
      expect(actuators).toHaveLength(4);

      // Gamepad 0: IDs 0, 1
      expect(actuators[0].id).toBe(0);
      expect(actuators[1].id).toBe(1);
      // Gamepad 1: IDs 4, 5
      expect(actuators[2].id).toBe(4);
      expect(actuators[3].id).toBe(5);
    });

    it("returns no sensors (gamepads have none)", () => {
      expect(backend.getSensors()).toEqual([]);
    });
  });

  // --- Graceful handling of gamepads without vibrationActuator ---

  describe("gamepads without vibration", () => {
    it("ignores gamepads without vibrationActuator", async () => {
      await backend.connect();

      const gp = createMockGamepad(0, { hasVibration: false });
      setMockGamepads([gp]);
      fireGamepadConnected(gp);

      expect(backend.getActuators()).toHaveLength(0);
    });

    it("does not emit devicechanged for non-vibration gamepads", async () => {
      await backend.connect();

      const handler = vi.fn();
      backend.on("devicechanged", handler);

      const gp = createMockGamepad(0, { hasVibration: false });
      fireGamepadConnected(gp);

      expect(handler).not.toHaveBeenCalled();
    });
  });

  // --- Actuate command ---

  describe("actuate", () => {
    it("maps strong motor to correct playEffect parameters", async () => {
      await backend.connect();
      const gp = createMockGamepad(0);
      setMockGamepads([gp]);
      fireGamepadConnected(gp);

      await backend.actuate(0, "Vibrate", 0.75);

      // The immediate fireEffect call should have happened
      expect(gp.vibrationActuator!.playEffect).toHaveBeenCalledWith(
        "dual-rumble",
        expect.objectContaining({
          duration: 100,
          strongMagnitude: 0.75,
          weakMagnitude: 0,
        })
      );
    });

    it("maps weak motor to correct playEffect parameters", async () => {
      await backend.connect();
      const gp = createMockGamepad(0);
      setMockGamepads([gp]);
      fireGamepadConnected(gp);

      await backend.actuate(1, "Vibrate", 0.5);

      expect(gp.vibrationActuator!.playEffect).toHaveBeenCalledWith(
        "dual-rumble",
        expect.objectContaining({
          duration: 100,
          strongMagnitude: 0,
          weakMagnitude: 0.5,
        })
      );
    });

    it("maps trigger motors to trigger-rumble effect", async () => {
      await backend.connect();
      const gp = createMockGamepad(0, { hasTriggerRumble: true });
      setMockGamepads([gp]);
      fireGamepadConnected(gp);

      // Left trigger = actuator ID 2
      await backend.actuate(2, "Vibrate", 0.6);

      expect(gp.vibrationActuator!.playEffect).toHaveBeenCalledWith(
        "trigger-rumble",
        expect.objectContaining({
          duration: 100,
          strongMagnitude: 0,
          weakMagnitude: 0,
          leftTrigger: 0.6,
          rightTrigger: 0,
        })
      );
    });

    it("clamps intensity to [0, 1]", async () => {
      await backend.connect();
      const gp = createMockGamepad(0);
      setMockGamepads([gp]);
      fireGamepadConnected(gp);

      await backend.actuate(0, "Vibrate", 1.5);
      expect(gp.vibrationActuator!.playEffect).toHaveBeenCalledWith(
        "dual-rumble",
        expect.objectContaining({ strongMagnitude: 1 })
      );

      gp.vibrationActuator!.playEffect.mockClear();
      await backend.actuate(0, "Vibrate", -0.5);
      // Intensity 0 should stop the loop, but the fireEffect still fires once
      // with the clamped value
      expect(gp.vibrationActuator!.playEffect).not.toHaveBeenCalled();
    });

    it("ignores non-Vibrate actuator types", async () => {
      await backend.connect();
      const gp = createMockGamepad(0);
      setMockGamepads([gp]);
      fireGamepadConnected(gp);

      await backend.actuate(0, "Rotate", 0.5);
      expect(gp.vibrationActuator!.playEffect).not.toHaveBeenCalled();
    });

    it("ignores actuate for unknown gamepad", async () => {
      await backend.connect();
      // No gamepads registered
      await backend.actuate(0, "Vibrate", 0.5);
      // No error thrown
    });

    it("sustains vibration via setInterval loop", async () => {
      await backend.connect();
      const gp = createMockGamepad(0);
      setMockGamepads([gp]);
      fireGamepadConnected(gp);

      await backend.actuate(0, "Vibrate", 0.8);

      // Initial call
      expect(gp.vibrationActuator!.playEffect).toHaveBeenCalledTimes(1);

      // Advance timer by 80ms — should fire again
      vi.advanceTimersByTime(80);
      expect(gp.vibrationActuator!.playEffect).toHaveBeenCalledTimes(2);

      // Advance another 80ms
      vi.advanceTimersByTime(80);
      expect(gp.vibrationActuator!.playEffect).toHaveBeenCalledTimes(3);
    });

    it("updates intensity on subsequent actuate calls", async () => {
      await backend.connect();
      const gp = createMockGamepad(0);
      setMockGamepads([gp]);
      fireGamepadConnected(gp);

      await backend.actuate(0, "Vibrate", 0.3);
      expect(gp.vibrationActuator!.playEffect).toHaveBeenLastCalledWith(
        "dual-rumble",
        expect.objectContaining({ strongMagnitude: 0.3 })
      );

      // Update to new intensity — loop is already running, so the new
      // value is picked up on the next tick (not immediately)
      await backend.actuate(0, "Vibrate", 0.9);

      // Advance timer so the loop fires with the updated intensity
      vi.advanceTimersByTime(80);
      expect(gp.vibrationActuator!.playEffect).toHaveBeenLastCalledWith(
        "dual-rumble",
        expect.objectContaining({ strongMagnitude: 0.9 })
      );
    });
  });

  // --- Stop ---

  describe("stop", () => {
    it("stop(actuatorId) sets that motor intensity to 0", async () => {
      await backend.connect();
      const gp = createMockGamepad(0);
      setMockGamepads([gp]);
      fireGamepadConnected(gp);

      await backend.actuate(0, "Vibrate", 0.5);
      await backend.stop(0);

      // Should have called reset since all intensities are now 0
      expect(gp.vibrationActuator!.reset).toHaveBeenCalled();
    });

    it("stop() stops all motors on all gamepads", async () => {
      await backend.connect();

      const gp0 = createMockGamepad(0);
      const gp1 = createMockGamepad(1);
      setMockGamepads([gp0, gp1]);
      fireGamepadConnected(gp0);
      fireGamepadConnected(gp1);

      await backend.actuate(0, "Vibrate", 0.5);
      await backend.actuate(4, "Vibrate", 0.7);

      await backend.stop();

      expect(gp0.vibrationActuator!.reset).toHaveBeenCalled();
      expect(gp1.vibrationActuator!.reset).toHaveBeenCalled();
    });

    it("stop() clears vibration loops", async () => {
      await backend.connect();
      const gp = createMockGamepad(0);
      setMockGamepads([gp]);
      fireGamepadConnected(gp);

      await backend.actuate(0, "Vibrate", 0.5);
      const callCountBeforeStop = gp.vibrationActuator!.playEffect.mock.calls.length;

      await backend.stop();

      // Advance time — should NOT fire more effects
      vi.advanceTimersByTime(300);
      expect(gp.vibrationActuator!.playEffect.mock.calls.length).toBe(
        callCountBeforeStop
      );
    });
  });

  // --- Emergency stop ---

  describe("emergencyStop", () => {
    it("clears all intervals and resets all gamepads", async () => {
      await backend.connect();

      const gp0 = createMockGamepad(0);
      const gp1 = createMockGamepad(1);
      setMockGamepads([gp0, gp1]);
      fireGamepadConnected(gp0);
      fireGamepadConnected(gp1);

      await backend.actuate(0, "Vibrate", 1.0);
      await backend.actuate(4, "Vibrate", 1.0);

      await backend.emergencyStop();

      // Both gamepads should have been reset
      expect(gp0.vibrationActuator!.reset).toHaveBeenCalled();
      expect(gp1.vibrationActuator!.reset).toHaveBeenCalled();

      // No more effects should fire
      gp0.vibrationActuator!.playEffect.mockClear();
      gp1.vibrationActuator!.playEffect.mockClear();
      vi.advanceTimersByTime(300);
      expect(gp0.vibrationActuator!.playEffect).not.toHaveBeenCalled();
      expect(gp1.vibrationActuator!.playEffect).not.toHaveBeenCalled();
    });
  });

  // --- Scan ---

  describe("scan", () => {
    it("discovers new gamepads from navigator.getGamepads()", async () => {
      await backend.connect();

      const gp = createMockGamepad(0);
      setMockGamepads([gp]);

      const handler = vi.fn();
      backend.on("devicechanged", handler);

      await backend.scan();

      expect(handler).toHaveBeenCalledOnce();
      expect(backend.getActuators()).toHaveLength(2);
    });

    it("does not re-register already-known gamepads", async () => {
      await backend.connect();

      const gp = createMockGamepad(0);
      setMockGamepads([gp]);
      fireGamepadConnected(gp);

      const handler = vi.fn();
      backend.on("devicechanged", handler);

      await backend.scan();

      expect(handler).not.toHaveBeenCalled();
    });

    it("stopScan is a no-op", async () => {
      // Should not throw
      await backend.stopScan();
    });
  });

  // --- Multiple gamepads simultaneously ---

  describe("multiple gamepads", () => {
    it("handles two gamepads with independent motors", async () => {
      await backend.connect();

      const gp0 = createMockGamepad(0);
      const gp1 = createMockGamepad(1, { hasTriggerRumble: true });
      setMockGamepads([gp0, gp1]);
      fireGamepadConnected(gp0);
      fireGamepadConnected(gp1);

      // Gamepad 0: 2 actuators (dual-rumble), Gamepad 1: 4 actuators (trigger-rumble)
      expect(backend.getActuators()).toHaveLength(6);

      // Actuate strong motor on gamepad 0
      await backend.actuate(0, "Vibrate", 0.4);
      expect(gp0.vibrationActuator!.playEffect).toHaveBeenCalledWith(
        "dual-rumble",
        expect.objectContaining({ strongMagnitude: 0.4 })
      );

      // Actuate right trigger on gamepad 1 (ID = 1*4 + 3 = 7)
      await backend.actuate(7, "Vibrate", 0.9);
      expect(gp1.vibrationActuator!.playEffect).toHaveBeenCalledWith(
        "trigger-rumble",
        expect.objectContaining({ rightTrigger: 0.9 })
      );
    });

    it("disconnecting one gamepad does not affect the other", async () => {
      await backend.connect();

      const gp0 = createMockGamepad(0);
      const gp1 = createMockGamepad(1);
      setMockGamepads([gp0, gp1]);
      fireGamepadConnected(gp0);
      fireGamepadConnected(gp1);

      expect(backend.getActuators()).toHaveLength(4);

      // Disconnect gamepad 0
      fireGamepadDisconnected(gp0);

      const actuators = backend.getActuators();
      expect(actuators).toHaveLength(2);
      // Remaining actuators should be from gamepad 1
      expect(actuators[0].id).toBe(4);
      expect(actuators[1].id).toBe(5);
    });
  });
});
