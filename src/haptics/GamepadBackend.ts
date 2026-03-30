import EventEmitter from "eventemitter3";
import type {
  HapticsActuator,
  HapticsActuatorType,
  HapticsBackend,
  HapticsBackendEvents,
  HapticsDeviceClass,
  HapticsSensor,
} from "./types";

/**
 * Actuator ID scheme:
 *   gamepadIndex * 4 + motorOffset
 *
 * motorOffset:
 *   0 = strong (low-freq body motor, maps to strongMagnitude)
 *   1 = weak   (high-freq body motor, maps to weakMagnitude)
 *   2 = leftTrigger  (only if trigger-rumble supported)
 *   3 = rightTrigger (only if trigger-rumble supported)
 *
 * Example: gamepad index 0 → actuator IDs 0,1 (or 0,1,2,3 with trigger-rumble)
 *          gamepad index 1 → actuator IDs 4,5 (or 4,5,6,7 with trigger-rumble)
 */

interface TrackedGamepad {
  gamepadIndex: number;
  hasTriggerRumble: boolean;
  // Current target intensities per motor offset (0-3)
  intensities: [number, number, number, number];
  // The setInterval ID for the vibration loop
  loopInterval: ReturnType<typeof setInterval> | null;
}

export class GamepadBackend
  extends EventEmitter<HapticsBackendEvents>
  implements HapticsBackend
{
  readonly name = "gamepad";
  readonly deviceClass: HapticsDeviceClass = "gaming";

  private connected = false;
  private gamepads = new Map<number, TrackedGamepad>();

  private onGamepadConnected = (e: GamepadEvent): void => {
    this.registerGamepad(e.gamepad);
  };

  private onGamepadDisconnected = (e: GamepadEvent): void => {
    this.unregisterGamepad(e.gamepad.index);
  };

  // --- Lifecycle ---

  async connect(): Promise<void> {
    if (this.connected) return;
    this.connected = true;

    window.addEventListener("gamepadconnected", this.onGamepadConnected);
    window.addEventListener("gamepaddisconnected", this.onGamepadDisconnected);

    // Enumerate already-connected gamepads
    this.enumerateGamepads();
  }

  async disconnect(): Promise<void> {
    if (!this.connected) return;

    window.removeEventListener("gamepadconnected", this.onGamepadConnected);
    window.removeEventListener(
      "gamepaddisconnected",
      this.onGamepadDisconnected
    );

    // Stop all vibration and clear state
    await this.stop();
    this.gamepads.clear();
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  // --- Device discovery ---

  async scan(): Promise<void> {
    this.enumerateGamepads();
  }

  async stopScan(): Promise<void> {
    // No-op: gamepads are event-driven, not scanned
  }

  // --- Capabilities ---

  getActuators(): HapticsActuator[] {
    const actuators: HapticsActuator[] = [];
    for (const tracked of this.gamepads.values()) {
      const base = tracked.gamepadIndex * 4;
      // Strong motor (low-freq)
      actuators.push({
        id: base + 0,
        types: ["Vibrate"],
        steps: 256,
        deviceClass: "gaming",
      });
      // Weak motor (high-freq)
      actuators.push({
        id: base + 1,
        types: ["Vibrate"],
        steps: 256,
        deviceClass: "gaming",
      });
      if (tracked.hasTriggerRumble) {
        // Left trigger
        actuators.push({
          id: base + 2,
          types: ["Vibrate"],
          steps: 256,
          deviceClass: "gaming",
        });
        // Right trigger
        actuators.push({
          id: base + 3,
          types: ["Vibrate"],
          steps: 256,
          deviceClass: "gaming",
        });
      }
    }
    return actuators;
  }

  getSensors(): HapticsSensor[] {
    // Gamepads have no sensors relevant to the haptics system
    return [];
  }

  // --- Commands ---

  async actuate(
    actuatorId: number,
    type: HapticsActuatorType,
    intensity: number,
    _options?: { duration?: number; clockwise?: boolean }
  ): Promise<void> {
    if (type !== "Vibrate") return;

    const gamepadIndex = Math.floor(actuatorId / 4);
    const motorOffset = actuatorId % 4;
    const tracked = this.gamepads.get(gamepadIndex);
    if (!tracked) return;

    // Validate motor offset for this gamepad
    if (motorOffset >= 2 && !tracked.hasTriggerRumble) return;
    if (motorOffset > 3) return;

    // Update the target intensity
    tracked.intensities[motorOffset] = Math.max(0, Math.min(1, intensity));

    // Start the vibration loop if not already running and any intensity > 0
    this.ensureLoop(tracked);
  }

  async stop(actuatorId?: number): Promise<void> {
    if (actuatorId === undefined) {
      // Stop all motors on all gamepads
      for (const tracked of this.gamepads.values()) {
        tracked.intensities = [0, 0, 0, 0];
        this.clearLoop(tracked);
        await this.resetGamepad(tracked.gamepadIndex);
      }
    } else {
      const gamepadIndex = Math.floor(actuatorId / 4);
      const motorOffset = actuatorId % 4;
      const tracked = this.gamepads.get(gamepadIndex);
      if (!tracked) return;

      tracked.intensities[motorOffset] = 0;

      // If all intensities are zero, stop the loop and reset
      if (tracked.intensities.every((v) => v === 0)) {
        this.clearLoop(tracked);
        await this.resetGamepad(tracked.gamepadIndex);
      }
    }
  }

  // --- Sensors (no-op for gamepads) ---

  subscribeSensor(_sensorId: number, _rateHz: number): void {
    // Gamepads have no sensors relevant to the haptics system
  }

  unsubscribeSensor(_sensorId: number): void {
    // Gamepads have no sensors relevant to the haptics system
  }

  // --- Safety ---

  async emergencyStop(): Promise<void> {
    // Immediately clear all intervals and reset all gamepads
    for (const tracked of this.gamepads.values()) {
      tracked.intensities = [0, 0, 0, 0];
      this.clearLoop(tracked);
      await this.resetGamepad(tracked.gamepadIndex);
    }
  }

  // --- Private helpers ---

  private enumerateGamepads(): void {
    if (typeof navigator === "undefined") return;
    const gamepads = navigator.getGamepads();
    if (!gamepads) return;

    let changed = false;
    for (const gp of gamepads) {
      if (!gp) continue;
      if (!this.gamepads.has(gp.index)) {
        if (this.registerGamepad(gp)) {
          changed = true;
        }
      }
    }
    // Only emit once if we found new gamepads during enumeration
    // (registerGamepad already emits per-gamepad, so we don't double-emit here)
    // Actually, registerGamepad emits individually. For scan(), that's fine.
    void changed; // suppress unused warning; emission is in registerGamepad
  }

  private registerGamepad(gamepad: Gamepad): boolean {
    // Only register gamepads with vibrationActuator support
    const actuator = (gamepad as GamepadWithVibration).vibrationActuator;
    if (!actuator) return false;

    const effects = actuator.effects ?? [];
    if (!effects.includes("dual-rumble")) return false;

    const hasTriggerRumble = effects.includes("trigger-rumble");

    this.gamepads.set(gamepad.index, {
      gamepadIndex: gamepad.index,
      hasTriggerRumble,
      intensities: [0, 0, 0, 0],
      loopInterval: null,
    });

    this.emit("devicechanged");
    return true;
  }

  private unregisterGamepad(gamepadIndex: number): void {
    const tracked = this.gamepads.get(gamepadIndex);
    if (!tracked) return;

    tracked.intensities = [0, 0, 0, 0];
    this.clearLoop(tracked);
    this.gamepads.delete(gamepadIndex);
    this.emit("devicechanged");
  }

  private ensureLoop(tracked: TrackedGamepad): void {
    // If all zero, no need for a loop
    if (tracked.intensities.every((v) => v === 0)) {
      this.clearLoop(tracked);
      return;
    }

    // If loop already running, it will pick up new intensities
    if (tracked.loopInterval !== null) return;

    // Fire immediately, then every 80ms
    this.fireEffect(tracked);
    tracked.loopInterval = setInterval(() => {
      // If all zero, stop the loop
      if (tracked.intensities.every((v) => v === 0)) {
        this.clearLoop(tracked);
        return;
      }
      this.fireEffect(tracked);
    }, 80);
  }

  private fireEffect(tracked: TrackedGamepad): void {
    if (typeof navigator === "undefined") return;
    const gamepads = navigator.getGamepads();
    const gp = gamepads?.[tracked.gamepadIndex] as
      | GamepadWithVibration
      | null
      | undefined;
    if (!gp?.vibrationActuator) return;

    const [strong, weak, leftTrigger, rightTrigger] = tracked.intensities;

    if (tracked.hasTriggerRumble) {
      gp.vibrationActuator
        .playEffect("trigger-rumble", {
          startDelay: 0,
          duration: 100,
          strongMagnitude: strong,
          weakMagnitude: weak,
          leftTrigger,
          rightTrigger,
        })
        .catch(() => {
          // Gamepad may have disconnected or document hidden
        });
    } else {
      gp.vibrationActuator
        .playEffect("dual-rumble", {
          startDelay: 0,
          duration: 100,
          strongMagnitude: strong,
          weakMagnitude: weak,
        })
        .catch(() => {
          // Gamepad may have disconnected or document hidden
        });
    }
  }

  private clearLoop(tracked: TrackedGamepad): void {
    if (tracked.loopInterval !== null) {
      clearInterval(tracked.loopInterval);
      tracked.loopInterval = null;
    }
  }

  private async resetGamepad(gamepadIndex: number): Promise<void> {
    if (typeof navigator === "undefined") return;
    const gamepads = navigator.getGamepads();
    const gp = gamepads?.[gamepadIndex] as
      | GamepadWithVibration
      | null
      | undefined;
    if (!gp?.vibrationActuator) return;

    try {
      await gp.vibrationActuator.reset();
    } catch {
      // Gamepad may have disconnected or document hidden
    }
  }
}

// TypeScript doesn't include vibrationActuator on the Gamepad type natively.
// We extend it for our internal use.
interface GamepadHapticActuatorExtended {
  readonly effects: string[];
  playEffect(
    type: string,
    params?: {
      startDelay?: number;
      duration?: number;
      strongMagnitude?: number;
      weakMagnitude?: number;
      leftTrigger?: number;
      rightTrigger?: number;
    }
  ): Promise<string>;
  reset(): Promise<string>;
}

type GamepadWithVibration = Gamepad & {
  vibrationActuator: GamepadHapticActuatorExtended | null;
};
