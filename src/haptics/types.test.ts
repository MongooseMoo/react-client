import { describe, expect, it, vi } from "vitest";
import EventEmitter from "eventemitter3";
import type {
  HapticsActuator,
  HapticsActuatorType,
  HapticsBackend,
  HapticsBackendEvents,
  HapticsCapabilities,
  HapticsCommand,
  HapticsDeviceClass,
  HapticsSensor,
  HapticsSensorReading,
  HapticsSensorType,
} from "./types";

// A mock backend that satisfies the HapticsBackend interface
class MockBackend
  extends EventEmitter<HapticsBackendEvents>
  implements HapticsBackend
{
  readonly name = "mock";
  readonly deviceClass: HapticsDeviceClass = "gaming";

  private connected = false;

  async connect(): Promise<void> {
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  async scan(): Promise<void> {}
  async stopScan(): Promise<void> {}

  getActuators(): HapticsActuator[] {
    return [
      { id: 0, types: ["Vibrate"], steps: 4, deviceClass: "gaming" },
    ];
  }

  getSensors(): HapticsSensor[] {
    return [
      { id: 0, types: ["Button"], range: [0, 1], deviceClass: "gaming" },
    ];
  }

  async actuate(
    _actuatorId: number,
    _type: HapticsActuatorType,
    _intensity: number,
    _options?: { duration?: number; clockwise?: boolean }
  ): Promise<void> {}

  async stop(_actuatorId?: number): Promise<void> {}

  subscribeSensor(_sensorId: number, _rateHz: number): void {}
  unsubscribeSensor(_sensorId: number): void {}

  async emergencyStop(): Promise<void> {
    this.connected = false;
  }
}

describe("HapticsBackend interface", () => {
  it("can create a mock backend satisfying the interface", () => {
    const backend: HapticsBackend = new MockBackend();
    expect(backend.name).toBe("mock");
    expect(backend.deviceClass).toBe("gaming");
    expect(backend.isConnected()).toBe(false);
  });

  it("lifecycle methods work correctly", async () => {
    const backend: HapticsBackend = new MockBackend();
    expect(backend.isConnected()).toBe(false);

    await backend.connect();
    expect(backend.isConnected()).toBe(true);

    await backend.disconnect();
    expect(backend.isConnected()).toBe(false);
  });

  it("emits devicechanged events", () => {
    const backend: HapticsBackend = new MockBackend();
    const handler = vi.fn();
    backend.on("devicechanged", handler);
    backend.emit("devicechanged");
    expect(handler).toHaveBeenCalledOnce();
  });

  it("emits sensorreading events with correct payload", () => {
    const backend: HapticsBackend = new MockBackend();
    const handler = vi.fn();
    backend.on("sensorreading", handler);

    const reading: HapticsSensorReading = {
      sensor: 0,
      type: "Pressure",
      value: 0.73,
    };
    backend.emit("sensorreading", reading);

    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith(reading);
  });

  it("returns actuators and sensors", () => {
    const backend: HapticsBackend = new MockBackend();
    const actuators = backend.getActuators();
    const sensors = backend.getSensors();

    expect(actuators).toHaveLength(1);
    expect(actuators[0].types).toContain("Vibrate");
    expect(actuators[0].steps).toBe(4);
    expect(actuators[0].deviceClass).toBe("gaming");

    expect(sensors).toHaveLength(1);
    expect(sensors[0].types).toContain("Button");
    expect(sensors[0].range).toEqual([0, 1]);
  });
});

describe("HapticsCommand", () => {
  it("can construct with required fields only", () => {
    const cmd: HapticsCommand = {
      actuator: 0,
      type: "Vibrate",
      intensity: 0.5,
    };
    expect(cmd.actuator).toBe(0);
    expect(cmd.type).toBe("Vibrate");
    expect(cmd.intensity).toBe(0.5);
    expect(cmd.duration).toBeUndefined();
    expect(cmd.clockwise).toBeUndefined();
  });

  it("can construct with null actuator (broadcast)", () => {
    const cmd: HapticsCommand = {
      actuator: null,
      type: "Vibrate",
      intensity: 1.0,
    };
    expect(cmd.actuator).toBeNull();
  });

  it("can construct with duration for Position type", () => {
    const cmd: HapticsCommand = {
      actuator: 1,
      type: "Position",
      intensity: 0.75,
      duration: 500,
    };
    expect(cmd.duration).toBe(500);
  });

  it("can construct with clockwise for Rotate type", () => {
    const cmd: HapticsCommand = {
      actuator: 2,
      type: "Rotate",
      intensity: 0.5,
      clockwise: true,
    };
    expect(cmd.clockwise).toBe(true);
  });
});

describe("HapticsCapabilities", () => {
  it("can assemble from actuators and sensors", () => {
    const actuators: HapticsActuator[] = [
      { id: 0, types: ["Vibrate"], steps: 4, deviceClass: "gaming" },
      {
        id: 1,
        types: ["Vibrate", "Oscillate"],
        steps: 20,
        deviceClass: "intimate",
      },
    ];
    const sensors: HapticsSensor[] = [
      { id: 0, types: ["Pressure"], range: [0.0, 1.0], deviceClass: "intimate" },
      { id: 1, types: ["Button"], range: [0, 1], deviceClass: "gaming" },
    ];

    const caps: HapticsCapabilities = {
      available: true,
      actuators,
      sensors,
    };

    expect(caps.available).toBe(true);
    expect(caps.actuators).toHaveLength(2);
    expect(caps.sensors).toHaveLength(2);
  });

  it("can represent no-device state", () => {
    const caps: HapticsCapabilities = {
      available: false,
      actuators: [],
      sensors: [],
    };

    expect(caps.available).toBe(false);
    expect(caps.actuators).toHaveLength(0);
    expect(caps.sensors).toHaveLength(0);
  });
});

describe("type narrowing", () => {
  it("actuator types cover all expected values", () => {
    const allTypes: HapticsActuatorType[] = [
      "Vibrate",
      "Rotate",
      "Oscillate",
      "Constrict",
      "Inflate",
      "Position",
    ];
    expect(allTypes).toHaveLength(6);
  });

  it("sensor types cover all expected values", () => {
    const allTypes: HapticsSensorType[] = [
      "Pressure",
      "Button",
      "Battery",
      "RSSI",
    ];
    expect(allTypes).toHaveLength(4);
  });

  it("device classes cover all expected values", () => {
    const allClasses: HapticsDeviceClass[] = ["gaming", "intimate"];
    expect(allClasses).toHaveLength(2);
  });

  it("capabilities with mixed device classes", () => {
    const caps: HapticsCapabilities = {
      available: true,
      actuators: [
        { id: 0, types: ["Vibrate"], steps: 4, deviceClass: "gaming" },
        { id: 1, types: ["Vibrate", "Oscillate"], steps: 20, deviceClass: "intimate" },
      ],
      sensors: [
        { id: 0, types: ["Pressure"], range: [0.0, 1.0], deviceClass: "intimate" },
        { id: 1, types: ["Button"], range: [0, 1], deviceClass: "gaming" },
      ],
    };

    const gamingActuators = caps.actuators.filter(
      (a) => a.deviceClass === "gaming"
    );
    const intimateActuators = caps.actuators.filter(
      (a) => a.deviceClass === "intimate"
    );

    expect(gamingActuators).toHaveLength(1);
    expect(intimateActuators).toHaveLength(1);
  });
});
