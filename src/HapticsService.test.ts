import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import EventEmitter from "eventemitter3";
import { HapticsService } from "./HapticsService";
import type {
  HapticsActuator,
  HapticsActuatorType,
  HapticsBackend,
  HapticsBackendEvents,
  HapticsDeviceClass,
  HapticsCommand,
  HapticsSensor,
  HapticsSensorReading,
} from "./haptics/types";

// ---------------------------------------------------------------------------
// Mock Backend Factory
// ---------------------------------------------------------------------------

/**
 * Creates a mock HapticsBackend implementing the full interface.
 * Actuators and sensors can be configured per-test.
 */
function createMockBackend(options: {
  name: string;
  deviceClass: HapticsDeviceClass;
  actuators?: HapticsActuator[];
  sensors?: HapticsSensor[];
}): HapticsBackend & {
  _setActuators: (a: HapticsActuator[]) => void;
  _setSensors: (s: HapticsSensor[]) => void;
  _emitDeviceChanged: () => void;
  _emitSensorReading: (reading: HapticsSensorReading) => void;
  actuate: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
  emergencyStop: ReturnType<typeof vi.fn>;
  subscribeSensor: ReturnType<typeof vi.fn>;
  unsubscribeSensor: ReturnType<typeof vi.fn>;
  connect: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
  scan: ReturnType<typeof vi.fn>;
  stopScan: ReturnType<typeof vi.fn>;
  isConnected: ReturnType<typeof vi.fn>;
} {
  let actuators = options.actuators ?? [];
  let sensors = options.sensors ?? [];

  const emitter = new EventEmitter<HapticsBackendEvents>();

  const backend = {
    name: options.name,
    deviceClass: options.deviceClass,

    // EventEmitter delegation
    on: emitter.on.bind(emitter),
    off: emitter.off.bind(emitter),
    once: emitter.once.bind(emitter),
    emit: emitter.emit.bind(emitter),
    addListener: emitter.addListener.bind(emitter),
    removeListener: emitter.removeListener.bind(emitter),
    removeAllListeners: emitter.removeAllListeners.bind(emitter),
    listeners: emitter.listeners.bind(emitter),
    listenerCount: emitter.listenerCount.bind(emitter),
    eventNames: emitter.eventNames.bind(emitter),

    // Lifecycle
    connect: vi.fn(async () => {}),
    disconnect: vi.fn(async () => {}),
    isConnected: vi.fn(() => true),
    scan: vi.fn(async () => {}),
    stopScan: vi.fn(async () => {}),

    // Capabilities
    getActuators: () => actuators,
    getSensors: () => sensors,

    // Commands
    actuate: vi.fn(async () => {}),
    stop: vi.fn(async () => {}),

    // Sensors
    subscribeSensor: vi.fn(),
    unsubscribeSensor: vi.fn(),

    // Safety
    emergencyStop: vi.fn(async () => {}),

    // Test helpers
    _setActuators: (a: HapticsActuator[]) => {
      actuators = a;
    },
    _setSensors: (s: HapticsSensor[]) => {
      sensors = s;
    },
    _emitDeviceChanged: () => {
      emitter.emit("devicechanged");
    },
    _emitSensorReading: (reading: HapticsSensorReading) => {
      emitter.emit("sensorreading", reading);
    },
  } as unknown as HapticsBackend & {
    _setActuators: (a: HapticsActuator[]) => void;
    _setSensors: (s: HapticsSensor[]) => void;
    _emitDeviceChanged: () => void;
    _emitSensorReading: (reading: HapticsSensorReading) => void;
    actuate: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
    emergencyStop: ReturnType<typeof vi.fn>;
    subscribeSensor: ReturnType<typeof vi.fn>;
    unsubscribeSensor: ReturnType<typeof vi.fn>;
    connect: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
    scan: ReturnType<typeof vi.fn>;
    stopScan: ReturnType<typeof vi.fn>;
    isConnected: ReturnType<typeof vi.fn>;
  };

  return backend;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("HapticsService", () => {
  let service: HapticsService;

  beforeEach(() => {
    vi.useFakeTimers();
    service = new HapticsService();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // -------------------------------------------------------------------------
  // Backend Registration
  // -------------------------------------------------------------------------

  describe("backend registration", () => {
    it("registers a backend", () => {
      const backend = createMockBackend({
        name: "gamepad",
        deviceClass: "gaming",
        actuators: [
          { id: 0, types: ["Vibrate"], steps: 256, deviceClass: "gaming" },
        ],
      });

      service.registerBackend(backend);
      const caps = service.getCapabilities();
      expect(caps.available).toBe(true);
      expect(caps.actuators).toHaveLength(1);
    });

    it("ignores duplicate backend registration", () => {
      const backend = createMockBackend({
        name: "gamepad",
        deviceClass: "gaming",
        actuators: [
          { id: 0, types: ["Vibrate"], steps: 256, deviceClass: "gaming" },
        ],
      });

      service.registerBackend(backend);
      service.registerBackend(backend); // duplicate
      const caps = service.getCapabilities();
      // Should still only have 1 actuator, not 2
      expect(caps.actuators).toHaveLength(1);
    });
  });

  // -------------------------------------------------------------------------
  // Unified ID Assignment
  // -------------------------------------------------------------------------

  describe("unified ID assignment", () => {
    it("assigns globally unique IDs across two backends with overlapping local IDs", () => {
      const gamepad = createMockBackend({
        name: "gamepad",
        deviceClass: "gaming",
        actuators: [
          { id: 0, types: ["Vibrate"], steps: 256, deviceClass: "gaming" },
          { id: 1, types: ["Vibrate"], steps: 256, deviceClass: "gaming" },
        ],
      });
      const buttplug = createMockBackend({
        name: "buttplug",
        deviceClass: "intimate",
        actuators: [
          { id: 0, types: ["Vibrate"], steps: 20, deviceClass: "intimate" },
          { id: 1, types: ["Rotate"], steps: 10, deviceClass: "intimate" },
        ],
      });

      service.registerBackend(gamepad);
      service.registerBackend(buttplug);

      const caps = service.getCapabilities();
      expect(caps.actuators).toHaveLength(4);

      // Global IDs should be 0, 1, 2, 3 in registration order
      const ids = caps.actuators.map((a) => a.id);
      expect(ids).toEqual([0, 1, 2, 3]);

      // First two are gaming, last two are intimate
      expect(caps.actuators[0].deviceClass).toBe("gaming");
      expect(caps.actuators[1].deviceClass).toBe("gaming");
      expect(caps.actuators[2].deviceClass).toBe("intimate");
      expect(caps.actuators[3].deviceClass).toBe("intimate");
    });

    it("assigns globally unique sensor IDs across backends", () => {
      const gamepad = createMockBackend({
        name: "gamepad",
        deviceClass: "gaming",
        sensors: [], // Gamepads have no sensors
      });
      const buttplug = createMockBackend({
        name: "buttplug",
        deviceClass: "intimate",
        sensors: [
          {
            id: 0,
            types: ["Pressure"],
            range: [0, 1] as [number, number],
            deviceClass: "intimate",
          },
          {
            id: 1,
            types: ["Battery"],
            range: [0, 1] as [number, number],
            deviceClass: "intimate",
          },
        ],
      });

      service.registerBackend(gamepad);
      service.registerBackend(buttplug);

      const caps = service.getCapabilities();
      expect(caps.sensors).toHaveLength(2);
      expect(caps.sensors[0].id).toBe(0);
      expect(caps.sensors[1].id).toBe(1);
    });
  });

  // -------------------------------------------------------------------------
  // Capabilities Merging
  // -------------------------------------------------------------------------

  describe("capabilities merging", () => {
    it("returns merged capabilities from all backends with correct deviceClass", () => {
      const gamepad = createMockBackend({
        name: "gamepad",
        deviceClass: "gaming",
        actuators: [
          { id: 0, types: ["Vibrate"], steps: 256, deviceClass: "gaming" },
        ],
      });
      const buttplug = createMockBackend({
        name: "buttplug",
        deviceClass: "intimate",
        actuators: [
          { id: 0, types: ["Vibrate"], steps: 20, deviceClass: "intimate" },
        ],
        sensors: [
          {
            id: 0,
            types: ["Pressure"],
            range: [0, 1] as [number, number],
            deviceClass: "intimate",
          },
        ],
      });

      service.registerBackend(gamepad);
      service.registerBackend(buttplug);

      const caps = service.getCapabilities();
      expect(caps.available).toBe(true);
      expect(caps.actuators).toHaveLength(2);
      expect(caps.sensors).toHaveLength(1);

      // Verify deviceClass is preserved
      expect(caps.actuators[0].deviceClass).toBe("gaming");
      expect(caps.actuators[1].deviceClass).toBe("intimate");
      expect(caps.sensors[0].deviceClass).toBe("intimate");
    });

    it("returns available=false when no devices", () => {
      const backend = createMockBackend({
        name: "empty",
        deviceClass: "gaming",
        actuators: [],
        sensors: [],
      });
      service.registerBackend(backend);

      const caps = service.getCapabilities();
      expect(caps.available).toBe(false);
      expect(caps.actuators).toHaveLength(0);
      expect(caps.sensors).toHaveLength(0);
    });
  });

  // -------------------------------------------------------------------------
  // Actuate Routing
  // -------------------------------------------------------------------------

  describe("actuate routing", () => {
    it("routes actuate command to the correct backend by global ID", () => {
      const gamepad = createMockBackend({
        name: "gamepad",
        deviceClass: "gaming",
        actuators: [
          { id: 0, types: ["Vibrate"], steps: 256, deviceClass: "gaming" },
        ],
      });
      const buttplug = createMockBackend({
        name: "buttplug",
        deviceClass: "intimate",
        actuators: [
          { id: 0, types: ["Vibrate"], steps: 20, deviceClass: "intimate" },
        ],
      });

      service.registerBackend(gamepad);
      service.registerBackend(buttplug);

      // Global ID 0 → gamepad local ID 0
      service.actuate([{ actuator: 0, type: "Vibrate", intensity: 0.5 }]);
      expect(gamepad.actuate).toHaveBeenCalledWith(0, "Vibrate", 0.5, {});
      expect(buttplug.actuate).not.toHaveBeenCalled();

      gamepad.actuate.mockClear();

      // Global ID 1 → buttplug local ID 0
      service.actuate([{ actuator: 1, type: "Vibrate", intensity: 0.7 }]);
      expect(buttplug.actuate).toHaveBeenCalledWith(0, "Vibrate", 0.7, {});
      expect(gamepad.actuate).not.toHaveBeenCalled();
    });

    it("broadcasts to all matching actuators when actuator is null", () => {
      const gamepad = createMockBackend({
        name: "gamepad",
        deviceClass: "gaming",
        actuators: [
          { id: 0, types: ["Vibrate"], steps: 256, deviceClass: "gaming" },
          { id: 1, types: ["Vibrate"], steps: 256, deviceClass: "gaming" },
        ],
      });
      const buttplug = createMockBackend({
        name: "buttplug",
        deviceClass: "intimate",
        actuators: [
          { id: 0, types: ["Vibrate"], steps: 20, deviceClass: "intimate" },
          { id: 1, types: ["Rotate"], steps: 10, deviceClass: "intimate" },
        ],
      });

      service.registerBackend(gamepad);
      service.registerBackend(buttplug);

      // Broadcast Vibrate to all matching — should hit gamepad 0, gamepad 1, buttplug 0
      // but NOT buttplug 1 (Rotate only)
      service.actuate([{ actuator: null, type: "Vibrate", intensity: 0.6 }]);

      expect(gamepad.actuate).toHaveBeenCalledTimes(2);
      expect(gamepad.actuate).toHaveBeenCalledWith(0, "Vibrate", 0.6, {});
      expect(gamepad.actuate).toHaveBeenCalledWith(1, "Vibrate", 0.6, {});
      expect(buttplug.actuate).toHaveBeenCalledTimes(1);
      expect(buttplug.actuate).toHaveBeenCalledWith(0, "Vibrate", 0.6, {});
    });

    it("passes duration and clockwise options through", () => {
      const buttplug = createMockBackend({
        name: "buttplug",
        deviceClass: "intimate",
        actuators: [
          { id: 0, types: ["Position"], steps: 100, deviceClass: "intimate" },
          { id: 1, types: ["Rotate"], steps: 10, deviceClass: "intimate" },
        ],
      });

      service.registerBackend(buttplug);

      service.actuate([
        { actuator: 0, type: "Position", intensity: 0.8, duration: 500 },
      ]);
      expect(buttplug.actuate).toHaveBeenCalledWith(0, "Position", 0.8, {
        duration: 500,
      });

      buttplug.actuate.mockClear();

      service.actuate([
        { actuator: 1, type: "Rotate", intensity: 0.5, clockwise: true },
      ]);
      expect(buttplug.actuate).toHaveBeenCalledWith(1, "Rotate", 0.5, {
        clockwise: true,
      });
    });

    it("ignores actuate for unknown global ID", () => {
      const backend = createMockBackend({
        name: "gamepad",
        deviceClass: "gaming",
        actuators: [
          { id: 0, types: ["Vibrate"], steps: 256, deviceClass: "gaming" },
        ],
      });

      service.registerBackend(backend);

      // Global ID 99 doesn't exist
      service.actuate([{ actuator: 99, type: "Vibrate", intensity: 0.5 }]);
      expect(backend.actuate).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // Intensity Capping
  // -------------------------------------------------------------------------

  describe("intensity capping", () => {
    it("clamps intensity to intensityCap", () => {
      const backend = createMockBackend({
        name: "gamepad",
        deviceClass: "gaming",
        actuators: [
          { id: 0, types: ["Vibrate"], steps: 256, deviceClass: "gaming" },
        ],
      });

      service.registerBackend(backend);
      service.intensityCap = 0.5;

      service.actuate([{ actuator: 0, type: "Vibrate", intensity: 0.8 }]);
      expect(backend.actuate).toHaveBeenCalledWith(0, "Vibrate", 0.5, {});
    });

    it("does not increase intensity below cap", () => {
      const backend = createMockBackend({
        name: "gamepad",
        deviceClass: "gaming",
        actuators: [
          { id: 0, types: ["Vibrate"], steps: 256, deviceClass: "gaming" },
        ],
      });

      service.registerBackend(backend);
      service.intensityCap = 0.8;

      service.actuate([{ actuator: 0, type: "Vibrate", intensity: 0.3 }]);
      expect(backend.actuate).toHaveBeenCalledWith(0, "Vibrate", 0.3, {});
    });

    it("applies intensity cap to broadcast commands", () => {
      const backend = createMockBackend({
        name: "gamepad",
        deviceClass: "gaming",
        actuators: [
          { id: 0, types: ["Vibrate"], steps: 256, deviceClass: "gaming" },
        ],
      });

      service.registerBackend(backend);
      service.intensityCap = 0.4;

      service.actuate([{ actuator: null, type: "Vibrate", intensity: 1.0 }]);
      expect(backend.actuate).toHaveBeenCalledWith(0, "Vibrate", 0.4, {});
    });
  });

  // -------------------------------------------------------------------------
  // Stop Routing
  // -------------------------------------------------------------------------

  describe("stop routing", () => {
    it("routes stop(actuatorId) to the correct backend with local ID", () => {
      const gamepad = createMockBackend({
        name: "gamepad",
        deviceClass: "gaming",
        actuators: [
          { id: 0, types: ["Vibrate"], steps: 256, deviceClass: "gaming" },
        ],
      });
      const buttplug = createMockBackend({
        name: "buttplug",
        deviceClass: "intimate",
        actuators: [
          { id: 0, types: ["Vibrate"], steps: 20, deviceClass: "intimate" },
        ],
      });

      service.registerBackend(gamepad);
      service.registerBackend(buttplug);

      // Global ID 1 → buttplug local ID 0
      service.stop(1);
      expect(buttplug.stop).toHaveBeenCalledWith(0);
      expect(gamepad.stop).not.toHaveBeenCalled();
    });

    it("calls stop() on all backends when no actuatorId given", () => {
      const gamepad = createMockBackend({
        name: "gamepad",
        deviceClass: "gaming",
        actuators: [],
      });
      const buttplug = createMockBackend({
        name: "buttplug",
        deviceClass: "intimate",
        actuators: [],
      });

      service.registerBackend(gamepad);
      service.registerBackend(buttplug);

      service.stop();
      expect(gamepad.stop).toHaveBeenCalledWith();
      expect(buttplug.stop).toHaveBeenCalledWith();
    });
  });

  // -------------------------------------------------------------------------
  // Emergency Stop
  // -------------------------------------------------------------------------

  describe("emergency stop", () => {
    it("calls emergencyStop on all backends", () => {
      const gamepad = createMockBackend({
        name: "gamepad",
        deviceClass: "gaming",
        actuators: [],
      });
      const buttplug = createMockBackend({
        name: "buttplug",
        deviceClass: "intimate",
        actuators: [],
      });

      service.registerBackend(gamepad);
      service.registerBackend(buttplug);

      service.emergencyStop();
      expect(gamepad.emergencyStop).toHaveBeenCalled();
      expect(buttplug.emergencyStop).toHaveBeenCalled();
    });

    it("emits 'stopped' event with reason 'emergency'", () => {
      const listener = vi.fn();
      service.on("stopped", listener);

      service.emergencyStop();
      expect(listener).toHaveBeenCalledWith("emergency");
    });

    it("clears auto-stop timer", () => {
      const backend = createMockBackend({
        name: "gamepad",
        deviceClass: "gaming",
        actuators: [
          { id: 0, types: ["Vibrate"], steps: 256, deviceClass: "gaming" },
        ],
      });
      service.registerBackend(backend);

      // Trigger auto-stop timer via actuate
      service.actuate([{ actuator: 0, type: "Vibrate", intensity: 0.5 }]);

      // Emergency stop should clear it
      service.emergencyStop();
      backend.stop.mockClear();

      // Advance time past auto-stop timeout — should NOT fire
      vi.advanceTimersByTime(60000);
      // stop() should not have been called again after emergency stop
      expect(backend.stop).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // Auto-Stop Timer
  // -------------------------------------------------------------------------

  describe("auto-stop timer", () => {
    it("fires stop after timeout when no actuate received", () => {
      const backend = createMockBackend({
        name: "gamepad",
        deviceClass: "gaming",
        actuators: [
          { id: 0, types: ["Vibrate"], steps: 256, deviceClass: "gaming" },
        ],
      });
      service.registerBackend(backend);

      const stoppedListener = vi.fn();
      service.on("stopped", stoppedListener);

      // Actuate starts the timer
      service.actuate([{ actuator: 0, type: "Vibrate", intensity: 0.5 }]);
      backend.stop.mockClear();

      // Advance time past default gaming timeout (30s)
      vi.advanceTimersByTime(30000);

      expect(backend.stop).toHaveBeenCalled();
      expect(stoppedListener).toHaveBeenCalledWith("auto_stop");
    });

    it("resets timer on each actuate call", () => {
      const backend = createMockBackend({
        name: "gamepad",
        deviceClass: "gaming",
        actuators: [
          { id: 0, types: ["Vibrate"], steps: 256, deviceClass: "gaming" },
        ],
      });
      service.registerBackend(backend);

      // First actuate
      service.actuate([{ actuator: 0, type: "Vibrate", intensity: 0.5 }]);
      backend.stop.mockClear();

      // Advance 25 seconds (still within 30s timeout)
      vi.advanceTimersByTime(25000);
      expect(backend.stop).not.toHaveBeenCalled();

      // Second actuate resets the timer
      service.actuate([{ actuator: 0, type: "Vibrate", intensity: 0.3 }]);
      backend.stop.mockClear();

      // Advance another 25 seconds — still shouldn't fire because timer was reset
      vi.advanceTimersByTime(25000);
      expect(backend.stop).not.toHaveBeenCalled();

      // Advance remaining 5 seconds — now 30s since last actuate
      vi.advanceTimersByTime(5000);
      expect(backend.stop).toHaveBeenCalled();
    });

    it("uses 5s timeout when intimate devices are present", () => {
      const buttplug = createMockBackend({
        name: "buttplug",
        deviceClass: "intimate",
        actuators: [
          { id: 0, types: ["Vibrate"], steps: 20, deviceClass: "intimate" },
        ],
      });
      service.registerBackend(buttplug);

      const stoppedListener = vi.fn();
      service.on("stopped", stoppedListener);

      service.actuate([{ actuator: 0, type: "Vibrate", intensity: 0.5 }]);
      buttplug.stop.mockClear();

      // Should not fire at 4s
      vi.advanceTimersByTime(4000);
      expect(buttplug.stop).not.toHaveBeenCalled();

      // Should fire at 5s
      vi.advanceTimersByTime(1000);
      expect(buttplug.stop).toHaveBeenCalled();
      expect(stoppedListener).toHaveBeenCalledWith("auto_stop");
    });

    it("uses shorter intimate timeout when mixed classes are active", () => {
      const gamepad = createMockBackend({
        name: "gamepad",
        deviceClass: "gaming",
        actuators: [
          { id: 0, types: ["Vibrate"], steps: 256, deviceClass: "gaming" },
        ],
      });
      const buttplug = createMockBackend({
        name: "buttplug",
        deviceClass: "intimate",
        actuators: [
          { id: 0, types: ["Vibrate"], steps: 20, deviceClass: "intimate" },
        ],
      });

      service.registerBackend(gamepad);
      service.registerBackend(buttplug);

      service.actuate([{ actuator: 0, type: "Vibrate", intensity: 0.5 }]);
      gamepad.stop.mockClear();
      buttplug.stop.mockClear();

      // Should fire at 5s (intimate timeout), not 30s
      vi.advanceTimersByTime(5000);
      expect(gamepad.stop).toHaveBeenCalled();
      expect(buttplug.stop).toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // Sensor Subscription Routing
  // -------------------------------------------------------------------------

  describe("sensor subscription routing", () => {
    it("routes subscribeSensor to the correct backend with local ID", () => {
      const buttplug = createMockBackend({
        name: "buttplug",
        deviceClass: "intimate",
        sensors: [
          {
            id: 5,
            types: ["Pressure"],
            range: [0, 1] as [number, number],
            deviceClass: "intimate",
          },
        ],
      });

      service.registerBackend(buttplug);

      // Global sensor ID 0 → buttplug local ID 5
      service.subscribeSensor(0, 10);
      expect(buttplug.subscribeSensor).toHaveBeenCalledWith(5, 10);
    });

    it("routes unsubscribeSensor to the correct backend with local ID", () => {
      const buttplug = createMockBackend({
        name: "buttplug",
        deviceClass: "intimate",
        sensors: [
          {
            id: 5,
            types: ["Pressure"],
            range: [0, 1] as [number, number],
            deviceClass: "intimate",
          },
        ],
      });

      service.registerBackend(buttplug);

      service.unsubscribeSensor(0);
      expect(buttplug.unsubscribeSensor).toHaveBeenCalledWith(5);
    });

    it("ignores subscribe for unknown global sensor ID", () => {
      const buttplug = createMockBackend({
        name: "buttplug",
        deviceClass: "intimate",
        sensors: [],
      });

      service.registerBackend(buttplug);

      // Should not throw
      service.subscribeSensor(99, 10);
      expect(buttplug.subscribeSensor).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // Sensor Reading Forwarding
  // -------------------------------------------------------------------------

  describe("sensor reading forwarding", () => {
    it("remaps local sensor ID to global ID and forwards", () => {
      const gamepad = createMockBackend({
        name: "gamepad",
        deviceClass: "gaming",
        sensors: [], // no sensors
      });
      const buttplug = createMockBackend({
        name: "buttplug",
        deviceClass: "intimate",
        sensors: [
          {
            id: 1000,
            types: ["Pressure"],
            range: [0, 1] as [number, number],
            deviceClass: "intimate",
          },
        ],
      });

      service.registerBackend(gamepad);
      service.registerBackend(buttplug);

      const listener = vi.fn();
      service.on("sensorreading", listener);

      // Backend emits reading with its local sensor ID
      buttplug._emitSensorReading({
        sensor: 1000,
        type: "Pressure",
        value: 0.73,
      });

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith({
        sensor: 0, // Global sensor ID 0 (only sensor across all backends)
        type: "Pressure",
        value: 0.73,
      });
    });

    it("handles multiple sensors across backends", () => {
      const buttplug = createMockBackend({
        name: "buttplug",
        deviceClass: "intimate",
        sensors: [
          {
            id: 0,
            types: ["Pressure"],
            range: [0, 1] as [number, number],
            deviceClass: "intimate",
          },
          {
            id: 1,
            types: ["Battery"],
            range: [0, 1] as [number, number],
            deviceClass: "intimate",
          },
        ],
      });

      service.registerBackend(buttplug);

      const listener = vi.fn();
      service.on("sensorreading", listener);

      buttplug._emitSensorReading({
        sensor: 1, // local ID 1
        type: "Battery",
        value: 0.85,
      });

      expect(listener).toHaveBeenCalledWith({
        sensor: 1, // global ID 1
        type: "Battery",
        value: 0.85,
      });
    });
  });

  // -------------------------------------------------------------------------
  // Device Change → capabilitieschanged
  // -------------------------------------------------------------------------

  describe("device change events", () => {
    it("emits capabilitieschanged when a backend's devices change", () => {
      const backend = createMockBackend({
        name: "gamepad",
        deviceClass: "gaming",
        actuators: [],
      });

      service.registerBackend(backend);

      const listener = vi.fn();
      service.on("capabilitieschanged", listener);

      // Simulate a device connecting
      backend._setActuators([
        { id: 0, types: ["Vibrate"], steps: 256, deviceClass: "gaming" },
      ]);
      backend._emitDeviceChanged();

      expect(listener).toHaveBeenCalledTimes(1);
      const caps = listener.mock.calls[0][0];
      expect(caps.available).toBe(true);
      expect(caps.actuators).toHaveLength(1);
    });

    it("rebuilds global IDs when devices change on one backend", () => {
      const gamepad = createMockBackend({
        name: "gamepad",
        deviceClass: "gaming",
        actuators: [
          { id: 0, types: ["Vibrate"], steps: 256, deviceClass: "gaming" },
        ],
      });
      const buttplug = createMockBackend({
        name: "buttplug",
        deviceClass: "intimate",
        actuators: [
          { id: 0, types: ["Vibrate"], steps: 20, deviceClass: "intimate" },
        ],
      });

      service.registerBackend(gamepad);
      service.registerBackend(buttplug);

      // Initially: gamepad has global 0, buttplug has global 1
      let caps = service.getCapabilities();
      expect(caps.actuators).toHaveLength(2);

      // Add a second actuator to gamepad
      gamepad._setActuators([
        { id: 0, types: ["Vibrate"], steps: 256, deviceClass: "gaming" },
        { id: 1, types: ["Vibrate"], steps: 256, deviceClass: "gaming" },
      ]);
      gamepad._emitDeviceChanged();

      // Now: gamepad has global 0+1, buttplug has global 2
      caps = service.getCapabilities();
      expect(caps.actuators).toHaveLength(3);
      expect(caps.actuators[0].id).toBe(0);
      expect(caps.actuators[0].deviceClass).toBe("gaming");
      expect(caps.actuators[1].id).toBe(1);
      expect(caps.actuators[1].deviceClass).toBe("gaming");
      expect(caps.actuators[2].id).toBe(2);
      expect(caps.actuators[2].deviceClass).toBe("intimate");
    });
  });

  // -------------------------------------------------------------------------
  // Rate Limiting
  // -------------------------------------------------------------------------

  describe("rate limiting", () => {
    it("drops commands that exceed the configured rate per actuator", () => {
      const backend = createMockBackend({
        name: "gamepad",
        deviceClass: "gaming",
        actuators: [
          { id: 0, types: ["Vibrate"], steps: 256, deviceClass: "gaming" },
        ],
      });

      service.registerBackend(backend);
      service.maxCommandRateHz = 10; // max 10 commands/sec = 100ms apart

      // First command goes through
      service.actuate([{ actuator: 0, type: "Vibrate", intensity: 0.5 }]);
      expect(backend.actuate).toHaveBeenCalledTimes(1);

      // Second command immediately after — should be rate limited
      service.actuate([{ actuator: 0, type: "Vibrate", intensity: 0.6 }]);
      expect(backend.actuate).toHaveBeenCalledTimes(1);

      // Advance 100ms — next command should go through
      vi.advanceTimersByTime(100);
      service.actuate([{ actuator: 0, type: "Vibrate", intensity: 0.7 }]);
      expect(backend.actuate).toHaveBeenCalledTimes(2);
    });
  });
});
