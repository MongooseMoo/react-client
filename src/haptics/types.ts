import EventEmitter from "eventemitter3";

// Actuator classes - auto-detected from backend
export type HapticsDeviceClass = "gaming" | "intimate";

// Actuator output types (from Buttplug spec + Gamepad)
export type HapticsActuatorType =
  | "Vibrate"
  | "Rotate"
  | "Oscillate"
  | "Constrict"
  | "Inflate"
  | "Position";

// Sensor input types (from Buttplug spec)
export type HapticsSensorType = "Pressure" | "Button" | "Battery" | "RSSI";

// An abstract actuator as advertised to the server
export interface HapticsActuator {
  id: number; // Client-local opaque ID
  types: HapticsActuatorType[]; // What this actuator can do
  steps: number; // Discrete step count
  deviceClass: HapticsDeviceClass;
}

// An abstract sensor as advertised to the server
export interface HapticsSensor {
  id: number;
  types: HapticsSensorType[];
  range: [number, number]; // [min, max] value range
  deviceClass: HapticsDeviceClass;
}

// A command to send to an actuator
export interface HapticsCommand {
  actuator: number | null; // Actuator ID, or null for "all matching type"
  type: HapticsActuatorType;
  intensity: number; // 0.0 - 1.0
  duration?: number; // For Position type (ms)
  clockwise?: boolean; // For Rotate type
}

// A sensor reading
export interface HapticsSensorReading {
  sensor: number;
  type: HapticsSensorType;
  value: number;
}

// Capability report (what the client sends to the server)
export interface HapticsCapabilities {
  available: boolean;
  actuators: HapticsActuator[];
  sensors: HapticsSensor[];
}

// Events emitted by a HapticsBackend
export interface HapticsBackendEvents {
  devicechanged: () => void; // Devices connected/disconnected
  sensorreading: (reading: HapticsSensorReading) => void;
}

// The backend interface that all haptics backends implement
export interface HapticsBackend extends EventEmitter<HapticsBackendEvents> {
  readonly name: string; // e.g., "gamepad", "buttplug"
  readonly deviceClass: HapticsDeviceClass; // Auto-detected class for this backend

  // Lifecycle
  connect(options?: Record<string, unknown>): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;

  // Device discovery
  scan(): Promise<void>;
  stopScan(): Promise<void>;

  // Capabilities
  getActuators(): HapticsActuator[];
  getSensors(): HapticsSensor[];

  // Commands
  actuate(
    actuatorId: number,
    type: HapticsActuatorType,
    intensity: number,
    options?: { duration?: number; clockwise?: boolean }
  ): Promise<void>;
  stop(actuatorId?: number): Promise<void>;

  // Sensors
  subscribeSensor(sensorId: number, rateHz: number): void;
  unsubscribeSensor(sensorId: number): void;

  // Safety
  emergencyStop(): Promise<void>;
}
