import EventEmitter from "eventemitter3";
import type {
  HapticsActuator,
  HapticsActuatorType,
  HapticsBackend,
  HapticsBackendEvents,
  HapticsSensor,
  HapticsSensorReading,
  HapticsSensorType,
} from "./types";

// ---------------------------------------------------------------------------
// Buttplug type declarations
//
// These mirror the types from buttplug@4.0.0. We declare them locally so that
// this file compiles without the buttplug npm package being installed.
// When buttplug is installed in a later integration step, these will match
// the real library types.
// ---------------------------------------------------------------------------

/** Minimal shape of a DeviceFeature output entry */
export interface ButtplugFeatureOutput {
  Value?: [number, number]; // [min, max] step range
}

/** Minimal shape of a DeviceFeature input entry */
export interface ButtplugFeatureInput {
  Value?: [number, number];
}

/** Minimal shape of a DeviceFeature from the Buttplug device model */
export interface ButtplugDeviceFeature {
  FeatureDescriptor: string;
  FeatureIndex: number;
  Output?: Record<string, ButtplugFeatureOutput>;
  Input?: Record<string, ButtplugFeatureInput>;
}

/** Minimal shape of a ButtplugClientDevice */
export interface ButtplugDevice {
  index: number;
  name: string;
  deviceInfo?: {
    DeviceFeatures: Record<number, ButtplugDeviceFeature>;
  };
  runOutput(output: unknown, featureIndex?: number): Promise<void>;
  stop(): Promise<void>;
  battery(): Promise<number>;
  sensorRead(featureIndex: number): Promise<number[]>;
}

/** Minimal shape of a connector (ButtplugBrowserWebsocketClientConnector) */
export interface ButtplugConnector {
  url: string;
}

/** Minimal shape of a ButtplugClient */
export interface ButtplugClientLike {
  connected: boolean;
  connect(connector: ButtplugConnector): Promise<void>;
  disconnect(): Promise<void>;
  startScanning(): Promise<void>;
  stopScanning(): Promise<void>;
  stopAllDevices(): Promise<void>;
  on(event: string, handler: (...args: unknown[]) => void): void;
}

/**
 * Factory for DeviceOutput commands (e.g. DeviceOutput.Vibrate.percent(0.5)).
 * Each key maps an actuator type to a factory with a `percent` method.
 */
export interface DeviceOutputFactory {
  [type: string]: {
    percent(...args: number[]): unknown;
  };
}

/**
 * Dependencies injected into ButtplugBackend.
 *
 * When the real buttplug package is installed, create this from:
 *   import { ButtplugClient, ButtplugBrowserWebsocketClientConnector, DeviceOutput } from "buttplug";
 *   const deps = {
 *     createClient: (name) => new ButtplugClient(name),
 *     createConnector: (url) => new ButtplugBrowserWebsocketClientConnector(url),
 *     DeviceOutput,
 *   };
 */
export interface ButtplugDeps {
  createClient: (name: string) => ButtplugClientLike;
  createConnector: (url: string) => ButtplugConnector;
  DeviceOutput: DeviceOutputFactory;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Default WebSocket URL for Intiface Central */
const DEFAULT_URL = "ws://127.0.0.1:12345";

/** Features per device in ID space (deviceIndex * ID_MULTIPLIER + featureIndex) */
const ID_MULTIPLIER = 1000;

/**
 * Maps a Buttplug OutputType string to our HapticsActuatorType.
 * Returns undefined for types we don't support (Temperature, Spray, Led).
 */
function mapOutputType(outputType: string): HapticsActuatorType | undefined {
  const map: Record<string, HapticsActuatorType> = {
    Vibrate: "Vibrate",
    Rotate: "Rotate",
    Oscillate: "Oscillate",
    Constrict: "Constrict",
    Inflate: "Inflate",
    Position: "Position",
    HwPositionWithDuration: "Position",
  };
  return map[outputType];
}

/**
 * Maps a Buttplug InputType string to our HapticsSensorType.
 * Returns undefined for types we don't support (Depth, Position).
 */
function mapInputType(inputType: string): HapticsSensorType | undefined {
  const map: Record<string, HapticsSensorType> = {
    Battery: "Battery",
    RSSI: "RSSI",
    Button: "Button",
    Pressure: "Pressure",
  };
  return map[inputType];
}

/** Returns the default sensor range for a given sensor type */
function sensorRange(type: HapticsSensorType): [number, number] {
  switch (type) {
    case "Battery":
      return [0.0, 1.0];
    case "Button":
      return [0, 1];
    case "Pressure":
      return [0.0, 1.0];
    case "RSSI":
      return [-128, 0];
  }
}

// ---------------------------------------------------------------------------
// Internal mapping types
// ---------------------------------------------------------------------------

/** Internal record mapping an actuator ID to its Buttplug device + feature */
interface ActuatorMapping {
  device: ButtplugDevice;
  featureIndex: number;
  outputType: string; // The original Buttplug output type string
  steps: number;
}

/** Internal record mapping a sensor ID to its Buttplug device + feature */
interface SensorMapping {
  device: ButtplugDevice;
  featureIndex: number;
  inputType: string; // The original Buttplug input type string
  sensorType: HapticsSensorType;
}

// ---------------------------------------------------------------------------
// ButtplugBackend
// ---------------------------------------------------------------------------

/**
 * ButtplugBackend implements HapticsBackend for Buttplug/Intiface Central.
 *
 * It connects to Intiface Central via WebSocket, discovers devices,
 * and maps their features to the abstract HapticsActuator/HapticsSensor model.
 *
 * Actuator/Sensor ID scheme:
 *   id = deviceIndex * 1000 + featureIndex
 * This allows up to 1000 features per device while keeping IDs globally unique.
 *
 * Dependencies (ButtplugClient, connector, DeviceOutput) are injected via
 * the constructor so the class can be tested and compiled without the
 * buttplug npm package being installed.
 */
export class ButtplugBackend
  extends EventEmitter<HapticsBackendEvents>
  implements HapticsBackend
{
  readonly name = "buttplug";
  readonly deviceClass = "intimate" as const;

  private deps: ButtplugDeps;
  private client: ButtplugClientLike | null = null;
  private url: string = DEFAULT_URL;

  /** Maps actuator ID -> device + feature info */
  private actuatorMap = new Map<number, ActuatorMapping>();
  /** Maps sensor ID -> device + feature info */
  private sensorMap = new Map<number, SensorMapping>();
  /** Maps sensor ID -> polling interval handle */
  private sensorSubscriptions = new Map<number, ReturnType<typeof setInterval>>();

  constructor(deps: ButtplugDeps) {
    super();
    this.deps = deps;
  }

  // --- Lifecycle ---

  async connect(options?: Record<string, unknown>): Promise<void> {
    if (options?.url && typeof options.url === "string") {
      this.url = options.url;
    }

    this.client = this.deps.createClient("Mongoose Haptics");

    // Listen for device events
    this.client.on("deviceadded", (device: unknown) => {
      this.addDevice(device as ButtplugDevice);
      this.emit("devicechanged");
    });

    this.client.on("deviceremoved", (device: unknown) => {
      this.removeDevice(device as ButtplugDevice);
      this.emit("devicechanged");
    });

    const connector = this.deps.createConnector(this.url);

    try {
      await this.client.connect(connector);
    } catch (err: unknown) {
      this.client = null;
      const message =
        err instanceof Error ? err.message : "Connection failed";
      throw new Error(`ButtplugBackend: failed to connect to ${this.url}: ${message}`);
    }
  }

  async disconnect(): Promise<void> {
    if (!this.client) return;

    // Stop all sensor subscriptions
    for (const [id] of this.sensorSubscriptions) {
      this.unsubscribeSensor(id);
    }

    try {
      await this.client.stopAllDevices();
    } catch {
      // Best-effort stop on disconnect
    }

    try {
      await this.client.disconnect();
    } catch {
      // Best-effort disconnect
    }

    this.client = null;
    this.actuatorMap.clear();
    this.sensorMap.clear();
  }

  isConnected(): boolean {
    return this.client?.connected ?? false;
  }

  // --- Device Discovery ---

  async scan(): Promise<void> {
    if (!this.client) {
      throw new Error("ButtplugBackend: not connected");
    }
    await this.client.startScanning();
  }

  async stopScan(): Promise<void> {
    if (!this.client) {
      throw new Error("ButtplugBackend: not connected");
    }
    await this.client.stopScanning();
  }

  // --- Capabilities ---

  getActuators(): HapticsActuator[] {
    const actuators: HapticsActuator[] = [];
    for (const [id, mapping] of this.actuatorMap) {
      const type = mapOutputType(mapping.outputType);
      if (type) {
        actuators.push({
          id,
          types: [type],
          steps: mapping.steps,
          deviceClass: "intimate",
        });
      }
    }
    return actuators;
  }

  getSensors(): HapticsSensor[] {
    const sensors: HapticsSensor[] = [];
    for (const [id, mapping] of this.sensorMap) {
      sensors.push({
        id,
        types: [mapping.sensorType],
        range: sensorRange(mapping.sensorType),
        deviceClass: "intimate",
      });
    }
    return sensors;
  }

  // --- Commands ---

  async actuate(
    actuatorId: number,
    type: HapticsActuatorType,
    intensity: number,
    options?: { duration?: number; clockwise?: boolean }
  ): Promise<void> {
    const mapping = this.actuatorMap.get(actuatorId);
    if (!mapping) {
      throw new Error(`ButtplugBackend: unknown actuator ${actuatorId}`);
    }

    const { device, featureIndex } = mapping;
    const DO = this.deps.DeviceOutput;

    // Build the output command based on type
    if (type === "Position" && options?.duration != null) {
      // Use PositionWithDuration for position commands with a duration
      await device.runOutput(
        DO.PositionWithDuration.percent(intensity, options.duration),
        featureIndex
      );
    } else if (type === "Rotate" && options?.clockwise != null) {
      // Rotate with direction
      await device.runOutput(
        DO.Rotate.percent(intensity, options.clockwise ? 1 : 0),
        featureIndex
      );
    } else {
      // Generic output: Vibrate, Oscillate, Constrict, Inflate, Position (no duration), Rotate (no direction)
      const outputFactory = DO[type];
      if (!outputFactory) {
        throw new Error(`ButtplugBackend: unsupported output type ${type}`);
      }
      await device.runOutput(outputFactory.percent(intensity), featureIndex);
    }
  }

  async stop(actuatorId?: number): Promise<void> {
    if (actuatorId != null) {
      // Stop a specific actuator's device
      const mapping = this.actuatorMap.get(actuatorId);
      if (!mapping) {
        throw new Error(`ButtplugBackend: unknown actuator ${actuatorId}`);
      }
      await mapping.device.stop();
    } else {
      // Stop all devices
      if (!this.client) {
        throw new Error("ButtplugBackend: not connected");
      }
      await this.client.stopAllDevices();
    }
  }

  // --- Sensors ---

  subscribeSensor(sensorId: number, rateHz: number): void {
    const mapping = this.sensorMap.get(sensorId);
    if (!mapping) {
      throw new Error(`ButtplugBackend: unknown sensor ${sensorId}`);
    }

    // Unsubscribe if already subscribed
    if (this.sensorSubscriptions.has(sensorId)) {
      this.unsubscribeSensor(sensorId);
    }

    const intervalMs = Math.max(1, Math.round(1000 / rateHz));

    const handle = setInterval(async () => {
      try {
        let value: number;
        if (mapping.inputType === "Battery") {
          // Battery has a convenience method
          value = await mapping.device.battery();
        } else {
          // For other sensors, use sensorRead with the feature index
          const readings = await mapping.device.sensorRead(mapping.featureIndex);
          value = readings[0] ?? 0;
        }

        const reading: HapticsSensorReading = {
          sensor: sensorId,
          type: mapping.sensorType,
          value,
        };
        this.emit("sensorreading", reading);
      } catch {
        // Sensor read failed (device may have disconnected); silently skip
      }
    }, intervalMs);

    this.sensorSubscriptions.set(sensorId, handle);
  }

  unsubscribeSensor(sensorId: number): void {
    const handle = this.sensorSubscriptions.get(sensorId);
    if (handle != null) {
      clearInterval(handle);
      this.sensorSubscriptions.delete(sensorId);
    }
  }

  // --- Safety ---

  async emergencyStop(): Promise<void> {
    if (!this.client) return;
    await this.client.stopAllDevices();
  }

  // --- Internal Device Management ---

  /**
   * Adds a device to the actuator/sensor maps.
   * Each output feature becomes an actuator, each input feature becomes a sensor.
   */
  private addDevice(device: ButtplugDevice): void {
    const deviceIndex = device.index;
    const features: Record<number, ButtplugDeviceFeature> =
      device.deviceInfo?.DeviceFeatures ?? {};

    for (const [featureIdxStr, feature] of Object.entries(features)) {
      const featureIndex = Number(featureIdxStr);
      const id = deviceIndex * ID_MULTIPLIER + featureIndex;

      // Map output features to actuators
      if (feature.Output) {
        for (const [outputType, output] of Object.entries(feature.Output)) {
          const mappedType = mapOutputType(outputType);
          if (mappedType) {
            // Extract step count from the output's Value range [min, max]
            const steps = output.Value?.[1] ?? 20;
            this.actuatorMap.set(id, {
              device,
              featureIndex,
              outputType,
              steps,
            });
          }
        }
      }

      // Map input features to sensors
      if (feature.Input) {
        for (const [inputType] of Object.entries(feature.Input)) {
          const mappedType = mapInputType(inputType);
          if (mappedType) {
            this.sensorMap.set(id, {
              device,
              featureIndex,
              inputType,
              sensorType: mappedType,
            });
          }
        }
      }
    }
  }

  /**
   * Removes a device from the actuator/sensor maps.
   * Also cleans up any active sensor subscriptions for this device.
   */
  private removeDevice(device: ButtplugDevice): void {
    const deviceIndex = device.index;

    // Remove actuators belonging to this device
    for (const [id, mapping] of this.actuatorMap) {
      if (mapping.device.index === deviceIndex) {
        this.actuatorMap.delete(id);
      }
    }

    // Remove sensors and their subscriptions belonging to this device
    for (const [id, mapping] of this.sensorMap) {
      if (mapping.device.index === deviceIndex) {
        this.unsubscribeSensor(id);
        this.sensorMap.delete(id);
      }
    }
  }
}
