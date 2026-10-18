import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import type { HapticsSensorReading } from "./types";
import {
  ButtplugWasmBackend,
  type ButtplugWasmDeps,
  type V3ButtplugClientLike,
  type V3ButtplugConnectorLike,
  type V3ButtplugDevice,
  type V3MessageAttributes,
} from "./ButtplugWasmBackend";

// ---------------------------------------------------------------------------
// Mock helpers
// ---------------------------------------------------------------------------

/** Creates a mock v3 ButtplugClientDevice */
function createMockDevice(
  index: number,
  name: string,
  attrs: V3MessageAttributes
): V3ButtplugDevice {
  return {
    index,
    name,
    messageAttributes: attrs,
    scalar: vi.fn().mockResolvedValue(undefined),
    vibrate: vi.fn().mockResolvedValue(undefined),
    oscillate: vi.fn().mockResolvedValue(undefined),
    rotate: vi.fn().mockResolvedValue(undefined),
    linear: vi.fn().mockResolvedValue(undefined),
    sensorRead: vi.fn().mockResolvedValue([0.5]),
    battery: vi.fn().mockResolvedValue(0.85),
    stop: vi.fn().mockResolvedValue(undefined),
  };
}

/** Tracks event handlers registered on the mock client */
let clientEventHandlers: Record<string, ((...args: unknown[]) => void)[]>;

function createMockClient(): V3ButtplugClientLike {
  return {
    connected: false,
    devices: [],
    connect: vi.fn().mockImplementation(async function (this: V3ButtplugClientLike) {
      (this as { connected: boolean }).connected = true;
    }),
    disconnect: vi.fn().mockImplementation(async function (this: V3ButtplugClientLike) {
      (this as { connected: boolean }).connected = false;
    }),
    startScanning: vi.fn().mockResolvedValue(undefined),
    stopScanning: vi.fn().mockResolvedValue(undefined),
    stopAllDevices: vi.fn().mockResolvedValue(undefined),
    on: vi.fn().mockImplementation((event: string, handler: (...args: unknown[]) => void) => {
      if (!clientEventHandlers[event]) {
        clientEventHandlers[event] = [];
      }
      clientEventHandlers[event].push(handler);
    }),
  };
}

function createMockConnector(): V3ButtplugConnectorLike {
  return {
    Connected: false,
    connect: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn().mockResolvedValue(undefined),
  };
}

/** Emit an event on the mock client */
function emitClientEvent(event: string, ...args: unknown[]) {
  for (const handler of clientEventHandlers[event] ?? []) {
    handler(...args);
  }
}

/** The mock client instance, captured after createClient is called */
let latestMockClient: V3ButtplugClientLike;

function createMockDeps(): ButtplugWasmDeps {
  return {
    createClient: vi.fn((_name: string) => {
      latestMockClient = createMockClient();
      return latestMockClient;
    }),
    createWasmConnector: vi.fn(() => createMockConnector()),
    activateLogging: vi.fn().mockResolvedValue(undefined),
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ButtplugWasmBackend", () => {
  let backend: ButtplugWasmBackend;
  let deps: ButtplugWasmDeps;

  beforeEach(() => {
    clientEventHandlers = {};
    deps = createMockDeps();
    backend = new ButtplugWasmBackend(deps);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ---- Backend properties ----

  describe("backend properties", () => {
    it("has name 'buttplug-wasm'", () => {
      expect(backend.name).toBe("buttplug-wasm");
    });

    it("has deviceClass 'intimate'", () => {
      expect(backend.deviceClass).toBe("intimate");
    });
  });

  // ---- Connection ----

  describe("connect/disconnect", () => {
    it("connects via WASM connector (no URL)", async () => {
      await backend.connect();
      expect(backend.isConnected()).toBe(true);
      expect(deps.createClient).toHaveBeenCalledWith("Mongoose Haptics WASM");
      expect(deps.createWasmConnector).toHaveBeenCalled();
      expect(deps.activateLogging).toHaveBeenCalled();
    });

    it("throws a clear error when connection fails", async () => {
      deps.createClient = vi.fn(() => {
        const client = createMockClient();
        client.connect = vi.fn().mockRejectedValue(new Error("WASM load failed"));
        latestMockClient = client;
        return client;
      });
      const freshBackend = new ButtplugWasmBackend(deps);

      await expect(freshBackend.connect()).rejects.toThrow(
        /failed to connect WASM server.*WASM load failed/
      );
      expect(freshBackend.isConnected()).toBe(false);
    });

    it("disconnects and clears device maps", async () => {
      await backend.connect();
      expect(backend.isConnected()).toBe(true);

      await backend.disconnect();
      expect(backend.isConnected()).toBe(false);
      expect(backend.getActuators()).toHaveLength(0);
      expect(backend.getSensors()).toHaveLength(0);
    });

    it("stops all devices on disconnect", async () => {
      await backend.connect();
      await backend.disconnect();
      expect(latestMockClient.stopAllDevices).toHaveBeenCalled();
    });

    it("disconnect is idempotent when not connected", async () => {
      await backend.disconnect();
    });

    it("works without activateLogging", async () => {
      const depsNoLog: ButtplugWasmDeps = {
        createClient: vi.fn(() => {
          latestMockClient = createMockClient();
          return latestMockClient;
        }),
        createWasmConnector: vi.fn(() => createMockConnector()),
      };
      const b = new ButtplugWasmBackend(depsNoLog);
      await b.connect();
      expect(b.isConnected()).toBe(true);
    });
  });

  // ---- Device Discovery ----

  describe("device discovery", () => {
    it("calls startScanning on the client", async () => {
      await backend.connect();
      await backend.scan();
      expect(latestMockClient.startScanning).toHaveBeenCalled();
    });

    it("calls stopScanning on the client", async () => {
      await backend.connect();
      await backend.stopScan();
      expect(latestMockClient.stopScanning).toHaveBeenCalled();
    });

    it("auto-connects when scanning while not connected", async () => {
      expect(backend.isConnected()).toBe(false);
      await backend.scan();
      expect(backend.isConnected()).toBe(true);
      expect(deps.createClient).toHaveBeenCalledWith("Mongoose Haptics WASM");
      expect(latestMockClient.startScanning).toHaveBeenCalled();
    });

    it("maps a deviceadded event with ScalarCmd to actuators", async () => {
      await backend.connect();

      const handler = vi.fn();
      backend.on("devicechanged", handler);

      const device = createMockDevice(0, "TestVibe", {
        ScalarCmd: [
          { FeatureDescriptor: "Main Motor", ActuatorType: "Vibrate", StepCount: 20, Index: 0 },
        ],
        StopDeviceCmd: {},
      });

      emitClientEvent("deviceadded", device);

      expect(handler).toHaveBeenCalledOnce();
      const actuators = backend.getActuators();
      expect(actuators).toHaveLength(1);
      expect(actuators[0].id).toBe(0); // deviceIndex=0, featureIndex=0
      expect(actuators[0].types).toEqual(["Vibrate"]);
      expect(actuators[0].steps).toBe(20);
      expect(actuators[0].deviceClass).toBe("intimate");
    });

    it("maps RotateCmd features to actuators", async () => {
      await backend.connect();

      const device = createMockDevice(1, "Rotator", {
        RotateCmd: [
          { FeatureDescriptor: "Rotator", ActuatorType: "Rotate", StepCount: 10, Index: 0 },
        ],
        StopDeviceCmd: {},
      });

      emitClientEvent("deviceadded", device);

      const actuators = backend.getActuators();
      expect(actuators).toHaveLength(1);
      expect(actuators[0].types).toEqual(["Rotate"]);
      expect(actuators[0].id).toBe(1000); // device 1, feature 0
    });

    it("maps LinearCmd features to actuators as Position type", async () => {
      await backend.connect();

      const device = createMockDevice(2, "Stroker", {
        LinearCmd: [
          { FeatureDescriptor: "Linear", ActuatorType: "Position", StepCount: 100, Index: 0 },
        ],
        StopDeviceCmd: {},
      });

      emitClientEvent("deviceadded", device);

      const actuators = backend.getActuators();
      expect(actuators).toHaveLength(1);
      expect(actuators[0].types).toEqual(["Position"]);
      expect(actuators[0].id).toBe(2000);
    });

    it("maps SensorReadCmd features to sensors", async () => {
      await backend.connect();

      const device = createMockDevice(1, "SensorDevice", {
        SensorReadCmd: [
          { FeatureDescriptor: "Battery", SensorType: "Battery", StepRange: [0, 100], Index: 0 },
          { FeatureDescriptor: "Pressure Pad", SensorType: "Pressure", StepRange: [0, 1], Index: 1 },
        ],
        StopDeviceCmd: {},
      });

      emitClientEvent("deviceadded", device);

      const sensors = backend.getSensors();
      expect(sensors).toHaveLength(2);

      const battery = sensors.find((s) => s.types[0] === "Battery");
      expect(battery).toBeDefined();
      expect(battery!.id).toBe(1000);
      expect(battery!.range).toEqual([0.0, 1.0]);

      const pressure = sensors.find((s) => s.types[0] === "Pressure");
      expect(pressure).toBeDefined();
      expect(pressure!.id).toBe(1001);
    });

    it("maps a multi-feature device", async () => {
      await backend.connect();

      const device = createMockDevice(3, "MultiDevice", {
        ScalarCmd: [
          { FeatureDescriptor: "Vibrator", ActuatorType: "Vibrate", StepCount: 20, Index: 0 },
          { FeatureDescriptor: "Oscillator", ActuatorType: "Oscillate", StepCount: 15, Index: 1 },
        ],
        StopDeviceCmd: {},
      });

      emitClientEvent("deviceadded", device);

      const actuators = backend.getActuators();
      expect(actuators).toHaveLength(2);

      const vibe = actuators.find((a) => a.types[0] === "Vibrate");
      expect(vibe!.id).toBe(3000);
      expect(vibe!.steps).toBe(20);

      const osc = actuators.find((a) => a.types[0] === "Oscillate");
      expect(osc!.id).toBe(3001);
      expect(osc!.steps).toBe(15);
    });

    it("removes actuators and sensors on deviceremoved", async () => {
      await backend.connect();

      const device = createMockDevice(4, "Removable", {
        ScalarCmd: [
          { FeatureDescriptor: "Motor", ActuatorType: "Vibrate", StepCount: 20, Index: 0 },
        ],
        SensorReadCmd: [
          { FeatureDescriptor: "Battery", SensorType: "Battery", StepRange: [0, 100], Index: 1 },
        ],
        StopDeviceCmd: {},
      });

      emitClientEvent("deviceadded", device);
      expect(backend.getActuators()).toHaveLength(1);
      expect(backend.getSensors()).toHaveLength(1);

      const handler = vi.fn();
      backend.on("devicechanged", handler);

      emitClientEvent("deviceremoved", device);

      expect(handler).toHaveBeenCalledOnce();
      expect(backend.getActuators()).toHaveLength(0);
      expect(backend.getSensors()).toHaveLength(0);
    });

    it("ignores unsupported actuator types", async () => {
      await backend.connect();

      const device = createMockDevice(5, "UnknownDevice", {
        ScalarCmd: [
          { FeatureDescriptor: "Unknown", ActuatorType: "Unknown", StepCount: 20, Index: 0 },
        ],
        StopDeviceCmd: {},
      });

      emitClientEvent("deviceadded", device);
      expect(backend.getActuators()).toHaveLength(0);
    });
  });

  // ---- Actuate ----

  describe("actuate", () => {
    let device: V3ButtplugDevice;

    beforeEach(async () => {
      await backend.connect();

      device = createMockDevice(0, "TestDevice", {
        ScalarCmd: [
          { FeatureDescriptor: "Vibrator", ActuatorType: "Vibrate", StepCount: 20, Index: 0 },
          { FeatureDescriptor: "Constrictor", ActuatorType: "Constrict", StepCount: 10, Index: 1 },
        ],
        RotateCmd: [
          { FeatureDescriptor: "Rotator", ActuatorType: "Rotate", StepCount: 10, Index: 2 },
        ],
        LinearCmd: [
          { FeatureDescriptor: "Linear", ActuatorType: "Position", StepCount: 100, Index: 3 },
        ],
        StopDeviceCmd: {},
      });

      emitClientEvent("deviceadded", device);
    });

    it("sends a Vibrate command via scalar()", async () => {
      await backend.actuate(0, "Vibrate", 0.5);

      expect(device.scalar).toHaveBeenCalledWith({
        Index: 0,
        Scalar: 0.5,
        ActuatorType: "Vibrate",
      });
    });

    it("sends a Constrict command via scalar()", async () => {
      await backend.actuate(1, "Constrict", 0.3);

      expect(device.scalar).toHaveBeenCalledWith({
        Index: 1,
        Scalar: 0.3,
        ActuatorType: "Constrict",
      });
    });

    it("sends a Rotate command via rotate()", async () => {
      await backend.actuate(2, "Rotate", 0.7, { clockwise: true });

      expect(device.rotate).toHaveBeenCalledWith([[0.7, true]]);
    });

    it("sends a Rotate command with default clockwise", async () => {
      await backend.actuate(2, "Rotate", 0.5);

      expect(device.rotate).toHaveBeenCalledWith([[0.5, true]]);
    });

    it("sends a Position command via linear() with duration", async () => {
      await backend.actuate(3, "Position", 0.9, { duration: 500 });

      expect(device.linear).toHaveBeenCalledWith([[0.9, 500]]);
    });

    it("sends a Position command with default duration", async () => {
      await backend.actuate(3, "Position", 0.3);

      expect(device.linear).toHaveBeenCalledWith([[0.3, 500]]);
    });

    it("throws for an unknown actuator ID", async () => {
      await expect(backend.actuate(9999, "Vibrate", 0.5)).rejects.toThrow(
        "unknown actuator 9999"
      );
    });
  });

  // ---- Stop ----

  describe("stop", () => {
    let device: V3ButtplugDevice;

    beforeEach(async () => {
      await backend.connect();

      device = createMockDevice(0, "TestDevice", {
        ScalarCmd: [
          { FeatureDescriptor: "Motor", ActuatorType: "Vibrate", StepCount: 20, Index: 0 },
        ],
        StopDeviceCmd: {},
      });

      emitClientEvent("deviceadded", device);
    });

    it("stops a specific device when actuatorId is provided", async () => {
      await backend.stop(0);
      expect(device.stop).toHaveBeenCalled();
    });

    it("stops all devices when no actuatorId is provided", async () => {
      await backend.stop();
      expect(latestMockClient.stopAllDevices).toHaveBeenCalled();
    });

    it("silently ignores an unknown actuator ID", async () => {
      await expect(backend.stop(9999)).resolves.toBeUndefined();
    });
  });

  // ---- Emergency Stop ----

  describe("emergencyStop", () => {
    it("calls stopAllDevices on the client", async () => {
      await backend.connect();
      await backend.emergencyStop();
      expect(latestMockClient.stopAllDevices).toHaveBeenCalled();
    });

    it("does nothing if not connected", async () => {
      await backend.emergencyStop();
    });
  });

  // ---- Sensors ----

  describe("sensor subscription", () => {
    let device: V3ButtplugDevice;

    beforeEach(async () => {
      await backend.connect();

      device = createMockDevice(0, "SensorDevice", {
        SensorReadCmd: [
          { FeatureDescriptor: "Battery", SensorType: "Battery", StepRange: [0, 100], Index: 0 },
          { FeatureDescriptor: "Pressure Pad", SensorType: "Pressure", StepRange: [0, 1], Index: 1 },
        ],
        StopDeviceCmd: {},
      });

      emitClientEvent("deviceadded", device);
    });

    it("polls battery sensor and emits sensorreading events", async () => {
      const handler = vi.fn();
      backend.on("sensorreading", handler);

      backend.subscribeSensor(0, 10); // 10Hz = 100ms

      await vi.advanceTimersByTimeAsync(100);

      expect(device.battery).toHaveBeenCalled();
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          sensor: 0,
          type: "Battery",
          value: 0.85,
        } satisfies HapticsSensorReading)
      );
    });

    it("polls non-battery sensors via sensorRead", async () => {
      const handler = vi.fn();
      backend.on("sensorreading", handler);

      backend.subscribeSensor(1, 5); // 5Hz = 200ms

      await vi.advanceTimersByTimeAsync(200);

      expect(device.sensorRead).toHaveBeenCalledWith(1, "Pressure");
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          sensor: 1,
          type: "Pressure",
          value: 0.5,
        } satisfies HapticsSensorReading)
      );
    });

    it("unsubscribes and stops polling", async () => {
      const handler = vi.fn();
      backend.on("sensorreading", handler);

      backend.subscribeSensor(0, 10);
      await vi.advanceTimersByTimeAsync(100);
      expect(handler).toHaveBeenCalledTimes(1);

      backend.unsubscribeSensor(0);

      handler.mockClear();
      await vi.advanceTimersByTimeAsync(500);
      expect(handler).not.toHaveBeenCalled();
    });

    it("re-subscribing replaces the previous subscription", async () => {
      const handler = vi.fn();
      backend.on("sensorreading", handler);

      backend.subscribeSensor(0, 10); // 100ms
      backend.subscribeSensor(0, 2); // 500ms, replaces previous

      await vi.advanceTimersByTimeAsync(100);
      expect(handler).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(400);
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("throws for unknown sensor ID", () => {
      expect(() => backend.subscribeSensor(9999, 10)).toThrow(
        "unknown sensor 9999"
      );
    });

    it("silently handles sensor read failures", async () => {
      (device.battery as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error("device disconnected")
      );

      const handler = vi.fn();
      backend.on("sensorreading", handler);

      backend.subscribeSensor(0, 10);
      await vi.advanceTimersByTimeAsync(100);

      expect(handler).not.toHaveBeenCalled();
    });
  });

  // ---- Device disconnect handling ----

  describe("device disconnect mid-operation", () => {
    it("removes device from maps on deviceremoved and cleans up subscriptions", async () => {
      await backend.connect();

      const device = createMockDevice(5, "DisconnectingDevice", {
        ScalarCmd: [
          { FeatureDescriptor: "Motor", ActuatorType: "Vibrate", StepCount: 20, Index: 0 },
        ],
        SensorReadCmd: [
          { FeatureDescriptor: "Battery", SensorType: "Battery", StepRange: [0, 100], Index: 1 },
        ],
        StopDeviceCmd: {},
      });

      emitClientEvent("deviceadded", device);
      expect(backend.getActuators()).toHaveLength(1);

      backend.subscribeSensor(5001, 10);

      emitClientEvent("deviceremoved", device);

      expect(backend.getActuators()).toHaveLength(0);
      expect(backend.getSensors()).toHaveLength(0);

      const handler = vi.fn();
      backend.on("sensorreading", handler);
      await vi.advanceTimersByTimeAsync(500);
      expect(handler).not.toHaveBeenCalled();
    });
  });

  // ---- ID scheme ----

  describe("actuator/sensor ID scheme", () => {
    it("assigns IDs as deviceIndex * 1000 + featureIndex", async () => {
      await backend.connect();

      const device = createMockDevice(3, "IDTestDevice", {
        ScalarCmd: [
          { FeatureDescriptor: "Motor A", ActuatorType: "Vibrate", StepCount: 20, Index: 0 },
          { FeatureDescriptor: "Motor B", ActuatorType: "Oscillate", StepCount: 15, Index: 5 },
        ],
        StopDeviceCmd: {},
      });

      emitClientEvent("deviceadded", device);

      const actuators = backend.getActuators();
      const ids = actuators.map((a) => a.id).sort((a, b) => a - b);
      expect(ids).toEqual([3000, 3005]);
    });
  });
});
