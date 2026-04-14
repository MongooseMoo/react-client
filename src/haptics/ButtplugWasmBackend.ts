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
// Buttplug v3 type declarations
//
// These mirror the types from buttplug@3.2.2. We declare them locally so that
// this file compiles without importing from the buttplug npm package directly.
// The real v3 API uses these types.
// ---------------------------------------------------------------------------

/** v3 ActuatorType enum values */
export type V3ActuatorType =
  | "Unknown"
  | "Vibrate"
  | "Rotate"
  | "Oscillate"
  | "Constrict"
  | "Inflate"
  | "Position";

/** v3 SensorType enum values */
export type V3SensorType =
  | "Unknown"
  | "Battery"
  | "RSSI"
  | "Button"
  | "Pressure";

/** v3 GenericDeviceMessageAttributes (used in ScalarCmd, RotateCmd, etc.) */
export interface V3GenericDeviceMessageAttributes {
  FeatureDescriptor: string;
  ActuatorType: V3ActuatorType;
  StepCount: number;
  Index: number;
}

/** v3 SensorDeviceMessageAttributes (used in SensorReadCmd) */
export interface V3SensorDeviceMessageAttributes {
  FeatureDescriptor: string;
  SensorType: V3SensorType;
  StepRange: number[];
  Index: number;
}

/** v3 MessageAttributes — the device's capability advertisement */
export interface V3MessageAttributes {
  ScalarCmd?: V3GenericDeviceMessageAttributes[];
  RotateCmd?: V3GenericDeviceMessageAttributes[];
  LinearCmd?: V3GenericDeviceMessageAttributes[];
  SensorReadCmd?: V3SensorDeviceMessageAttributes[];
  StopDeviceCmd: Record<string, never>;
}

/** v3 ScalarSubcommand shape — passed to device.scalar() */
export interface V3ScalarSubcommand {
  Index: number;
  Scalar: number;
  ActuatorType: V3ActuatorType;
}

/** Minimal shape of a v3 ButtplugClientDevice */
export interface V3ButtplugDevice {
  index: number;
  name: string;
  messageAttributes: V3MessageAttributes;

  // Generic scalar command (most direct way to control any actuator)
  scalar(sub: V3ScalarSubcommand | V3ScalarSubcommand[]): Promise<void>;

  // Convenience methods on the v3 ButtplugClientDevice
  vibrate(speed: number | number[]): Promise<void>;
  oscillate(speed: number | number[]): Promise<void>;
  rotate(values: number | [number, boolean][], clockwise?: boolean): Promise<void>;
  linear(values: number | [number, number][], duration?: number): Promise<void>;
  sensorRead(sensorIndex: number, sensorType: V3SensorType): Promise<number[]>;
  battery(): Promise<number>;
  stop(): Promise<void>;
}

/** Minimal shape of the v3 ButtplugClient */
export interface V3ButtplugClientLike {
  connected: boolean;
  devices: V3ButtplugDevice[];
  connect(connector: V3ButtplugConnectorLike): Promise<void>;
  disconnect(): Promise<void>;
  startScanning(): Promise<void>;
  stopScanning(): Promise<void>;
  stopAllDevices(): Promise<void>;
  on(event: string, handler: (...args: unknown[]) => void): void;
}

/** Minimal shape of the v3 IButtplugClientConnector */
export interface V3ButtplugConnectorLike {
  Connected: boolean;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}

// ---------------------------------------------------------------------------
// Dependency Injection
// ---------------------------------------------------------------------------

/**
 * Dependencies injected into ButtplugWasmBackend.
 *
 * When the real packages are installed, create this from:
 *   import { ButtplugClient } from "buttplug"; // v3.2.2
 *   import { ButtplugWasmClientConnector } from "buttplug-wasm/dist/buttplug-wasm.mjs";
 *
 *   const deps: ButtplugWasmDeps = {
 *     createClient: (name) => new ButtplugClient(name),
 *     createWasmConnector: () => new ButtplugWasmClientConnector(),
 *     activateLogging: () => ButtplugWasmClientConnector.activateLogging(),
 *   };
 */
export interface ButtplugWasmDeps {
  createClient: (name: string) => V3ButtplugClientLike;
  createWasmConnector: () => V3ButtplugConnectorLike;
  activateLogging?: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Features per device in ID space (deviceIndex * ID_MULTIPLIER + featureIndex) */
const ID_MULTIPLIER = 1000;

/**
 * Maps a v3 ActuatorType string to our HapticsActuatorType.
 * Returns undefined for types we don't support.
 */
function mapActuatorType(actuatorType: V3ActuatorType): HapticsActuatorType | undefined {
  const map: Record<string, HapticsActuatorType> = {
    Vibrate: "Vibrate",
    Rotate: "Rotate",
    Oscillate: "Oscillate",
    Constrict: "Constrict",
    Inflate: "Inflate",
    Position: "Position",
  };
  return map[actuatorType];
}

/**
 * Maps a v3 SensorType string to our HapticsSensorType.
 * Returns undefined for types we don't support.
 */
function mapSensorType(sensorType: V3SensorType): HapticsSensorType | undefined {
  const map: Record<string, HapticsSensorType> = {
    Battery: "Battery",
    RSSI: "RSSI",
    Button: "Button",
    Pressure: "Pressure",
  };
  return map[sensorType];
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

/** Internal record mapping an actuator ID to its v3 device + feature */
interface ActuatorMapping {
  device: V3ButtplugDevice;
  featureIndex: number;
  actuatorType: V3ActuatorType;
  steps: number;
}

/** Internal record mapping a sensor ID to its v3 device + feature */
interface SensorMapping {
  device: V3ButtplugDevice;
  featureIndex: number;
  v3SensorType: V3SensorType;
  sensorType: HapticsSensorType;
}

// ---------------------------------------------------------------------------
// ButtplugWasmBackend
// ---------------------------------------------------------------------------

/**
 * ButtplugWasmBackend implements HapticsBackend using buttplug v3 + buttplug-wasm.
 *
 * It runs an embedded Buttplug server inside the browser via WebAssembly.
 * Device communication uses WebBluetooth (Chromium-only, requires user gesture).
 *
 * No external server (Intiface Central) is required.
 *
 * Actuator/Sensor ID scheme:
 *   id = deviceIndex * 1000 + featureIndex
 * This allows up to 1000 features per device while keeping IDs globally unique.
 *
 * Dependencies (ButtplugClient, WASM connector) are injected via the constructor
 * so the class can be tested without loading real WASM.
 */
export class ButtplugWasmBackend
  extends EventEmitter<HapticsBackendEvents>
  implements HapticsBackend
{
  readonly name = "buttplug-wasm";
  readonly deviceClass = "intimate" as const;

  private deps: ButtplugWasmDeps;
  private client: V3ButtplugClientLike | null = null;

  /** Maps actuator ID -> device + feature info */
  private actuatorMap = new Map<number, ActuatorMapping>();
  /** Maps sensor ID -> device + feature info */
  private sensorMap = new Map<number, SensorMapping>();
  /** Maps sensor ID -> polling interval handle */
  private sensorSubscriptions = new Map<number, ReturnType<typeof setInterval>>();
  /** Maps actuator ID -> pending auto-stop timer (for server-specified durations) */
  private actuatorStopTimers = new Map<number, ReturnType<typeof setTimeout>>();

  constructor(deps: ButtplugWasmDeps) {
    super();
    this.deps = deps;
  }

  // --- Lifecycle ---

  async connect(): Promise<void> {
    this.client = this.deps.createClient("Mongoose Haptics WASM");

    // Listen for device events
    this.client.on("deviceadded", (device: unknown) => {
      this.addDevice(device as V3ButtplugDevice);
      this.emit("devicechanged");
    });

    this.client.on("deviceremoved", (device: unknown) => {
      this.removeDevice(device as V3ButtplugDevice);
      this.emit("devicechanged");
    });

    // Optionally activate WASM logging
    if (this.deps.activateLogging) {
      try {
        await this.deps.activateLogging();
      } catch {
        // Logging activation is best-effort
      }
    }

    const connector = this.deps.createWasmConnector();

    try {
      await this.client.connect(connector);
    } catch (err: unknown) {
      this.client = null;
      const message =
        err instanceof Error ? err.message : "Connection failed";
      throw new Error(
        `ButtplugWasmBackend: failed to connect WASM server: ${message}`
      );
    }
  }

  async disconnect(): Promise<void> {
    if (!this.client) return;

    // Cancel any pending auto-stop timers
    this.clearAllActuatorStopTimers();

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
    // Auto-connect if needed. connect() just initializes the embedded WASM
    // server — no user gesture required. Only startScanning() below triggers
    // the WebBluetooth device picker (which does need a user gesture).
    if (!this.client) {
      await this.connect();
    }
    await this.client!.startScanning();
  }

  async stopScan(): Promise<void> {
    if (!this.client) {
      throw new Error("ButtplugWasmBackend: not connected");
    }
    await this.client.stopScanning();
  }

  // --- Capabilities ---

  getActuators(): HapticsActuator[] {
    const actuators: HapticsActuator[] = [];
    for (const [id, mapping] of this.actuatorMap) {
      const type = mapActuatorType(mapping.actuatorType);
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
      throw new Error(`ButtplugWasmBackend: unknown actuator ${actuatorId}`);
    }

    const { device, featureIndex, actuatorType } = mapping;

    // Any new command cancels a pending duration-driven auto-stop
    this.clearActuatorStopTimer(actuatorId);

    // Route commands through the appropriate v3 API:
    // - Scalar types (Vibrate, Oscillate, Constrict, Inflate) use device.scalar()
    //   with explicit Index and ActuatorType to target exact features
    // - Rotate uses device.rotate() with [speed, clockwise] tuples
    // - Position uses device.linear() with [position, duration] tuples
    switch (type) {
      case "Vibrate":
      case "Oscillate":
      case "Constrict":
      case "Inflate": {
        await device.scalar({
          Index: featureIndex,
          Scalar: intensity,
          ActuatorType: actuatorType,
        });
        break;
      }
      case "Rotate": {
        const clockwise = options?.clockwise ?? true;
        await device.rotate([[intensity, clockwise]]);
        break;
      }
      case "Position": {
        const duration = options?.duration ?? 500;
        await device.linear([[intensity, duration]]);
        break;
      }
    }

    // For continuous (non-Position) actuators, honor server-specified duration
    // by scheduling a stop after the given ms. Position encodes duration as the
    // movement time, so it's excluded here.
    if (
      type !== "Position" &&
      options?.duration !== undefined &&
      options.duration > 0 &&
      intensity > 0
    ) {
      const handle = setTimeout(() => {
        this.actuatorStopTimers.delete(actuatorId);
        // Best-effort stop; swallow errors if device is gone
        void device.stop().catch(() => {});
      }, options.duration);
      this.actuatorStopTimers.set(actuatorId, handle);
    }
  }

  private clearActuatorStopTimer(actuatorId: number): void {
    const t = this.actuatorStopTimers.get(actuatorId);
    if (t !== undefined) {
      clearTimeout(t);
      this.actuatorStopTimers.delete(actuatorId);
    }
  }

  private clearAllActuatorStopTimers(): void {
    for (const t of this.actuatorStopTimers.values()) {
      clearTimeout(t);
    }
    this.actuatorStopTimers.clear();
  }

  async stop(actuatorId?: number): Promise<void> {
    if (actuatorId != null) {
      this.clearActuatorStopTimer(actuatorId);
      const mapping = this.actuatorMap.get(actuatorId);
      if (!mapping) return;
      await mapping.device.stop();
    } else {
      this.clearAllActuatorStopTimers();
      // No client yet (lazy-registered backend not connected) → nothing to stop
      if (!this.client) return;
      await this.client.stopAllDevices();
    }
  }

  // --- Sensors ---

  subscribeSensor(sensorId: number, rateHz: number): void {
    const mapping = this.sensorMap.get(sensorId);
    if (!mapping) {
      throw new Error(`ButtplugWasmBackend: unknown sensor ${sensorId}`);
    }

    // Unsubscribe if already subscribed
    if (this.sensorSubscriptions.has(sensorId)) {
      this.unsubscribeSensor(sensorId);
    }

    const intervalMs = Math.max(1, Math.round(1000 / rateHz));

    const handle = setInterval(async () => {
      try {
        let value: number;
        if (mapping.v3SensorType === "Battery") {
          value = await mapping.device.battery();
        } else {
          const readings = await mapping.device.sensorRead(
            mapping.featureIndex,
            mapping.v3SensorType
          );
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
    this.clearAllActuatorStopTimers();
    if (!this.client) return;
    await this.client.stopAllDevices();
  }

  // --- Internal Device Management ---

  /**
   * Adds a device to the actuator/sensor maps using the v3 MessageAttributes model.
   *
   * v3 device model:
   *   device.messageAttributes.ScalarCmd[] — each has ActuatorType, StepCount, Index
   *   device.messageAttributes.RotateCmd[] — each has ActuatorType (always Rotate), StepCount, Index
   *   device.messageAttributes.LinearCmd[] — each has ActuatorType (always Position), StepCount, Index
   *   device.messageAttributes.SensorReadCmd[] — each has SensorType, StepRange, Index
   */
  private addDevice(device: V3ButtplugDevice): void {
    const deviceIndex = device.index;
    const attrs = device.messageAttributes;

    // Map ScalarCmd features to actuators (Vibrate, Oscillate, Constrict, Inflate)
    if (attrs.ScalarCmd) {
      for (const attr of attrs.ScalarCmd) {
        const mapped = mapActuatorType(attr.ActuatorType);
        if (mapped) {
          const id = deviceIndex * ID_MULTIPLIER + attr.Index;
          this.actuatorMap.set(id, {
            device,
            featureIndex: attr.Index,
            actuatorType: attr.ActuatorType,
            steps: attr.StepCount,
          });
        }
      }
    }

    // Map RotateCmd features to actuators
    if (attrs.RotateCmd) {
      for (const attr of attrs.RotateCmd) {
        const id = deviceIndex * ID_MULTIPLIER + attr.Index;
        this.actuatorMap.set(id, {
          device,
          featureIndex: attr.Index,
          actuatorType: "Rotate",
          steps: attr.StepCount,
        });
      }
    }

    // Map LinearCmd features to actuators (Position)
    if (attrs.LinearCmd) {
      for (const attr of attrs.LinearCmd) {
        const id = deviceIndex * ID_MULTIPLIER + attr.Index;
        this.actuatorMap.set(id, {
          device,
          featureIndex: attr.Index,
          actuatorType: "Position",
          steps: attr.StepCount,
        });
      }
    }

    // Map SensorReadCmd features to sensors
    if (attrs.SensorReadCmd) {
      for (const attr of attrs.SensorReadCmd) {
        const mapped = mapSensorType(attr.SensorType);
        if (mapped) {
          const id = deviceIndex * ID_MULTIPLIER + attr.Index;
          this.sensorMap.set(id, {
            device,
            featureIndex: attr.Index,
            v3SensorType: attr.SensorType,
            sensorType: mapped,
          });
        }
      }
    }
  }

  /**
   * Removes a device from the actuator/sensor maps.
   * Also cleans up any active sensor subscriptions for this device.
   */
  private removeDevice(device: V3ButtplugDevice): void {
    const deviceIndex = device.index;

    for (const [id, mapping] of this.actuatorMap) {
      if (mapping.device.index === deviceIndex) {
        this.actuatorMap.delete(id);
      }
    }

    for (const [id, mapping] of this.sensorMap) {
      if (mapping.device.index === deviceIndex) {
        this.unsubscribeSensor(id);
        this.sensorMap.delete(id);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Default dependencies (real imports)
// ---------------------------------------------------------------------------

/**
 * Creates the real ButtplugWasmDeps using the installed packages.
 * This is a lazy factory — the WASM module (~5MB) is only loaded when called.
 */
export async function createRealWasmDeps(): Promise<ButtplugWasmDeps> {
  const { ButtplugClient } = await import("buttplug");
  // buttplug-wasm has no exports field in package.json — must import from dist path
  const { ButtplugWasmClientConnector } = await import(
    /* @vite-ignore */ "buttplug-wasm/dist/buttplug-wasm.mjs"
  );

  return {
    createClient: (name: string) => new ButtplugClient(name),
    createWasmConnector: () => new ButtplugWasmClientConnector(),
    activateLogging: () => ButtplugWasmClientConnector.activateLogging(),
  };
}
