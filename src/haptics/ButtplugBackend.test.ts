import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import type { HapticsSensorReading } from "./types";
import {
  ButtplugBackend,
  type ButtplugClientLike,
  type ButtplugConnector,
  type ButtplugDeps,
  type ButtplugDevice,
  type ButtplugDeviceFeature,
  type DeviceOutputFactory,
} from "./ButtplugBackend";

// ---------------------------------------------------------------------------
// Mock helpers
// ---------------------------------------------------------------------------

/** Simulates a ButtplugClientDevice */
function createMockDevice(
  index: number,
  name: string,
  features: Record<number, ButtplugDeviceFeature>
): ButtplugDevice {
  return {
    index,
    name,
    deviceInfo: { DeviceFeatures: features },
    runOutput: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn().mockResolvedValue(undefined),
    battery: vi.fn().mockResolvedValue(0.85),
    sensorRead: vi.fn().mockResolvedValue([0.5]),
  };
}

/** Tracks event handlers registered on the mock client */
let clientEventHandlers: Record<string, ((...args: unknown[]) => void)[]>;

function createMockClient(): ButtplugClientLike {
  return {
    connected: false,
    connect: vi.fn().mockImplementation(async function (this: ButtplugClientLike) {
      (this as { connected: boolean }).connected = true;
    }),
    disconnect: vi.fn().mockImplementation(async function (this: ButtplugClientLike) {
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

/** Emit an event on the mock client */
function emitClientEvent(event: string, ...args: unknown[]) {
  for (const handler of clientEventHandlers[event] ?? []) {
    handler(...args);
  }
}

/** The mock client instance, captured after createClient is called */
let latestMockClient: ButtplugClientLike;

/** Mock DeviceOutput factories */
const mockDeviceOutput: DeviceOutputFactory = {
  Vibrate: {
    percent: vi.fn((intensity: number) => ({ type: "Vibrate", intensity })),
  },
  Rotate: {
    percent: vi.fn((...args: number[]) => ({
      type: "Rotate",
      intensity: args[0],
      clockwise: args[1],
    })),
  },
  Oscillate: {
    percent: vi.fn((intensity: number) => ({ type: "Oscillate", intensity })),
  },
  Constrict: {
    percent: vi.fn((intensity: number) => ({ type: "Constrict", intensity })),
  },
  Inflate: {
    percent: vi.fn((intensity: number) => ({ type: "Inflate", intensity })),
  },
  Position: {
    percent: vi.fn((intensity: number) => ({ type: "Position", intensity })),
  },
  PositionWithDuration: {
    percent: vi.fn((...args: number[]) => ({
      type: "PositionWithDuration",
      intensity: args[0],
      duration: args[1],
    })),
  },
};

function createMockDeps(): ButtplugDeps {
  return {
    createClient: vi.fn((_name: string) => {
      latestMockClient = createMockClient();
      return latestMockClient;
    }),
    createConnector: vi.fn((url: string): ButtplugConnector => ({ url })),
    DeviceOutput: mockDeviceOutput,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ButtplugBackend", () => {
  let backend: ButtplugBackend;
  let deps: ButtplugDeps;

  beforeEach(() => {
    clientEventHandlers = {};
    deps = createMockDeps();
    backend = new ButtplugBackend(deps);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ---- Connection ----

  describe("connect/disconnect", () => {
    it("connects to default URL when no options provided", async () => {
      await backend.connect();
      expect(backend.isConnected()).toBe(true);
      expect(deps.createConnector).toHaveBeenCalledWith("ws://127.0.0.1:12345");
    });

    it("connects to a custom URL from options", async () => {
      await backend.connect({ url: "ws://10.0.0.1:9999" });
      expect(deps.createConnector).toHaveBeenCalledWith("ws://10.0.0.1:9999");
      expect(backend.isConnected()).toBe(true);
    });

    it("throws a clear error when connection fails", async () => {
      deps.createClient = vi.fn(() => {
        const client = createMockClient();
        client.connect = vi.fn().mockRejectedValue(new Error("Connection refused"));
        latestMockClient = client;
        return client;
      });
      const freshBackend = new ButtplugBackend(deps);

      await expect(freshBackend.connect()).rejects.toThrow(
        /failed to connect.*Connection refused/
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
      // Should not throw
      await backend.disconnect();
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

    it("throws when scanning while not connected", async () => {
      await expect(backend.scan()).rejects.toThrow("not connected");
    });

    it("maps a deviceadded event to actuators and emits devicechanged", async () => {
      await backend.connect();

      const handler = vi.fn();
      backend.on("devicechanged", handler);

      const device = createMockDevice(0, "TestVibe", {
        0: {
          FeatureDescriptor: "Main Motor",
          FeatureIndex: 0,
          Output: {
            Vibrate: { Value: [0, 20] },
          },
        },
      });

      emitClientEvent("deviceadded", device);

      expect(handler).toHaveBeenCalledOnce();
      const actuators = backend.getActuators();
      expect(actuators).toHaveLength(1);
      expect(actuators[0].id).toBe(0); // deviceIndex=0, featureIndex=0 => 0*1000+0 = 0
      expect(actuators[0].types).toEqual(["Vibrate"]);
      expect(actuators[0].steps).toBe(20);
      expect(actuators[0].deviceClass).toBe("intimate");
    });

    it("maps input features to sensors", async () => {
      await backend.connect();

      const device = createMockDevice(1, "SensorDevice", {
        0: {
          FeatureDescriptor: "Battery",
          FeatureIndex: 0,
          Input: {
            Battery: { Value: [0, 100] },
          },
        },
        1: {
          FeatureDescriptor: "Pressure Sensor",
          FeatureIndex: 1,
          Input: {
            Pressure: { Value: [0, 1] },
          },
        },
      });

      emitClientEvent("deviceadded", device);

      const sensors = backend.getSensors();
      expect(sensors).toHaveLength(2);

      // Battery sensor: device 1, feature 0 => id = 1000
      const battery = sensors.find((s) => s.types[0] === "Battery");
      expect(battery).toBeDefined();
      expect(battery!.id).toBe(1000);
      expect(battery!.range).toEqual([0.0, 1.0]);
      expect(battery!.deviceClass).toBe("intimate");

      // Pressure sensor: device 1, feature 1 => id = 1001
      const pressure = sensors.find((s) => s.types[0] === "Pressure");
      expect(pressure).toBeDefined();
      expect(pressure!.id).toBe(1001);
      expect(pressure!.range).toEqual([0.0, 1.0]);
    });

    it("maps multiple output types on a device with multiple features", async () => {
      await backend.connect();

      const device = createMockDevice(2, "MultiFeatureDevice", {
        0: {
          FeatureDescriptor: "Vibrator",
          FeatureIndex: 0,
          Output: {
            Vibrate: { Value: [0, 20] },
          },
        },
        1: {
          FeatureDescriptor: "Rotator",
          FeatureIndex: 1,
          Output: {
            Rotate: { Value: [0, 10] },
          },
        },
      });

      emitClientEvent("deviceadded", device);

      const actuators = backend.getActuators();
      expect(actuators).toHaveLength(2);

      const vibrator = actuators.find((a) => a.types[0] === "Vibrate");
      expect(vibrator).toBeDefined();
      expect(vibrator!.id).toBe(2000); // device 2, feature 0
      expect(vibrator!.steps).toBe(20);

      const rotator = actuators.find((a) => a.types[0] === "Rotate");
      expect(rotator).toBeDefined();
      expect(rotator!.id).toBe(2001); // device 2, feature 1
      expect(rotator!.steps).toBe(10);
    });

    it("removes actuators and sensors on deviceremoved", async () => {
      await backend.connect();

      const device = createMockDevice(3, "RemovableDevice", {
        0: {
          FeatureDescriptor: "Motor",
          FeatureIndex: 0,
          Output: { Vibrate: { Value: [0, 20] } },
          Input: { Battery: { Value: [0, 100] } },
        },
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

    it("ignores unsupported output types (Temperature, Spray, Led)", async () => {
      await backend.connect();

      const device = createMockDevice(4, "LedDevice", {
        0: {
          FeatureDescriptor: "LED",
          FeatureIndex: 0,
          Output: {
            Led: { Value: [0, 255] },
          },
        },
      });

      emitClientEvent("deviceadded", device);
      expect(backend.getActuators()).toHaveLength(0);
    });
  });

  // ---- Actuate ----

  describe("actuate", () => {
    let device: ButtplugDevice;

    beforeEach(async () => {
      await backend.connect();

      device = createMockDevice(0, "TestDevice", {
        0: {
          FeatureDescriptor: "Vibrator",
          FeatureIndex: 0,
          Output: { Vibrate: { Value: [0, 20] } },
        },
        1: {
          FeatureDescriptor: "Rotator",
          FeatureIndex: 1,
          Output: { Rotate: { Value: [0, 10] } },
        },
        2: {
          FeatureDescriptor: "Linear",
          FeatureIndex: 2,
          Output: { Position: { Value: [0, 100] } },
        },
      });

      emitClientEvent("deviceadded", device);
    });

    it("sends a Vibrate command with correct intensity", async () => {
      await backend.actuate(0, "Vibrate", 0.5);

      expect(mockDeviceOutput.Vibrate.percent).toHaveBeenCalledWith(0.5);
      expect(device.runOutput).toHaveBeenCalledWith(
        { type: "Vibrate", intensity: 0.5 },
        0 // featureIndex
      );
    });

    it("sends a Rotate command with clockwise parameter", async () => {
      await backend.actuate(1, "Rotate", 0.7, { clockwise: true });

      expect(mockDeviceOutput.Rotate.percent).toHaveBeenCalledWith(0.7, 1);
      expect(device.runOutput).toHaveBeenCalledWith(
        { type: "Rotate", intensity: 0.7, clockwise: 1 },
        1
      );
    });

    it("sends a PositionWithDuration command when duration is provided", async () => {
      await backend.actuate(2, "Position", 0.9, { duration: 500 });

      expect(mockDeviceOutput.PositionWithDuration.percent).toHaveBeenCalledWith(
        0.9,
        500
      );
      expect(device.runOutput).toHaveBeenCalledWith(
        { type: "PositionWithDuration", intensity: 0.9, duration: 500 },
        2
      );
    });

    it("sends a Position command without duration", async () => {
      await backend.actuate(2, "Position", 0.3);

      expect(mockDeviceOutput.Position.percent).toHaveBeenCalledWith(0.3);
      expect(device.runOutput).toHaveBeenCalledWith(
        { type: "Position", intensity: 0.3 },
        2
      );
    });

    it("throws for an unknown actuator ID", async () => {
      await expect(backend.actuate(9999, "Vibrate", 0.5)).rejects.toThrow(
        "unknown actuator 9999"
      );
    });
  });

  // ---- Stop ----

  describe("stop", () => {
    let device: ButtplugDevice;

    beforeEach(async () => {
      await backend.connect();

      device = createMockDevice(0, "TestDevice", {
        0: {
          FeatureDescriptor: "Motor",
          FeatureIndex: 0,
          Output: { Vibrate: { Value: [0, 20] } },
        },
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

    it("throws for an unknown actuator ID", async () => {
      await expect(backend.stop(9999)).rejects.toThrow("unknown actuator 9999");
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
      // Should not throw
      await backend.emergencyStop();
    });
  });

  // ---- Sensors ----

  describe("sensor subscription", () => {
    let device: ButtplugDevice;

    beforeEach(async () => {
      await backend.connect();

      device = createMockDevice(0, "SensorDevice", {
        0: {
          FeatureDescriptor: "Battery",
          FeatureIndex: 0,
          Input: { Battery: { Value: [0, 100] } },
        },
        1: {
          FeatureDescriptor: "Pressure Pad",
          FeatureIndex: 1,
          Input: { Pressure: { Value: [0, 1] } },
        },
      });

      emitClientEvent("deviceadded", device);
    });

    it("polls battery sensor and emits sensorreading events", async () => {
      const handler = vi.fn();
      backend.on("sensorreading", handler);

      // Subscribe at 10Hz = 100ms interval
      backend.subscribeSensor(0, 10);

      // Advance timer past one interval
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

      expect(device.sensorRead).toHaveBeenCalledWith(1); // featureIndex
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

      // Advance further -- no more events
      handler.mockClear();
      await vi.advanceTimersByTimeAsync(500);
      expect(handler).not.toHaveBeenCalled();
    });

    it("re-subscribing replaces the previous subscription", async () => {
      const handler = vi.fn();
      backend.on("sensorreading", handler);

      backend.subscribeSensor(0, 10); // 100ms
      backend.subscribeSensor(0, 2); // 500ms, replaces previous

      // After 100ms: old sub would fire, but it was replaced
      await vi.advanceTimersByTimeAsync(100);
      expect(handler).not.toHaveBeenCalled();

      // After 500ms total: new sub fires
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

      // Should not throw or emit on failure
      expect(handler).not.toHaveBeenCalled();
    });
  });

  // ---- Device disconnect handling ----

  describe("device disconnect mid-operation", () => {
    it("removes device from maps on deviceremoved and cleans up subscriptions", async () => {
      await backend.connect();

      const device = createMockDevice(5, "DisconnectingDevice", {
        0: {
          FeatureDescriptor: "Motor",
          FeatureIndex: 0,
          Output: { Vibrate: { Value: [0, 20] } },
          Input: { Battery: { Value: [0, 100] } },
        },
      });

      emitClientEvent("deviceadded", device);
      expect(backend.getActuators()).toHaveLength(1);

      // Subscribe to the sensor
      backend.subscribeSensor(5000, 10);

      // Now device disconnects
      emitClientEvent("deviceremoved", device);

      expect(backend.getActuators()).toHaveLength(0);
      expect(backend.getSensors()).toHaveLength(0);

      // Sensor subscription should be cleaned up -- no events after timer advance
      const handler = vi.fn();
      backend.on("sensorreading", handler);
      await vi.advanceTimersByTimeAsync(500);
      expect(handler).not.toHaveBeenCalled();
    });
  });

  // ---- Backend properties ----

  describe("backend properties", () => {
    it("has name 'buttplug'", () => {
      expect(backend.name).toBe("buttplug");
    });

    it("has deviceClass 'intimate'", () => {
      expect(backend.deviceClass).toBe("intimate");
    });
  });

  // ---- ID scheme ----

  describe("actuator/sensor ID scheme", () => {
    it("assigns IDs as deviceIndex * 1000 + featureIndex", async () => {
      await backend.connect();

      // Device at index 3 with features at indices 0 and 5
      const device = createMockDevice(3, "IDTestDevice", {
        0: {
          FeatureDescriptor: "Motor A",
          FeatureIndex: 0,
          Output: { Vibrate: { Value: [0, 20] } },
        },
        5: {
          FeatureDescriptor: "Motor B",
          FeatureIndex: 5,
          Output: { Oscillate: { Value: [0, 15] } },
        },
      });

      emitClientEvent("deviceadded", device);

      const actuators = backend.getActuators();
      const ids = actuators.map((a) => a.id).sort((a, b) => a - b);
      expect(ids).toEqual([3000, 3005]);
    });
  });
});
