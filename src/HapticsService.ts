import EventEmitter from "eventemitter3";
import type {
  HapticsActuator,
  HapticsActuatorType,
  HapticsBackend,
  HapticsCapabilities,
  HapticsCommand,
  HapticsDeviceClass,
  HapticsSensor,
  HapticsSensorReading,
} from "./haptics/types";

// ---------------------------------------------------------------------------
// Events emitted by HapticsService
// ---------------------------------------------------------------------------

export interface HapticsServiceEvents {
  capabilitieschanged: (capabilities: HapticsCapabilities) => void;
  sensorreading: (reading: HapticsSensorReading) => void;
  stopped: (reason: string) => void;
  connectionchanged: (backendName: string, connected: boolean) => void;
}

// ---------------------------------------------------------------------------
// Internal mapping: global ID → backend + local ID
// ---------------------------------------------------------------------------

interface ActuatorEntry {
  backend: HapticsBackend;
  localId: number;
  actuator: HapticsActuator;
}

interface SensorEntry {
  backend: HapticsBackend;
  localId: number;
  sensor: HapticsSensor;
}

// ---------------------------------------------------------------------------
// HapticsService
// ---------------------------------------------------------------------------

/**
 * HapticsService orchestrates multiple HapticsBackend instances, providing:
 * - Unified actuator/sensor ID space across all backends
 * - Command routing to the correct backend by global actuator ID
 * - Safety: intensity capping, auto-stop timer, rate limiting
 * - Merged capability reporting
 *
 * Follows the MidiService singleton pattern: exported as a module-level const.
 *
 * Global ID assignment scheme:
 *   Backends are assigned contiguous ID blocks in registration order.
 *   When devices change on any backend, the full map is rebuilt:
 *     - Iterate backends in registration order
 *     - For each backend, iterate its actuators/sensors in the order returned
 *     - Assign sequential global IDs starting from 0
 *   This means global IDs can change when devices connect/disconnect.
 *   The service emits 'capabilitieschanged' whenever this happens so
 *   consumers (the GMCP handler) can re-advertise.
 */
export class HapticsService extends EventEmitter<HapticsServiceEvents> {
  private backends: HapticsBackend[] = [];

  // Unified maps: globalId → entry
  private actuatorMap = new Map<number, ActuatorEntry>();
  private sensorMap = new Map<number, SensorEntry>();

  // Safety
  private _intensityCap: number = 1.0;
  private _autoStopTimeoutSecs: number = 30;
  private autoStopTimer: ReturnType<typeof setTimeout> | null = null;

  // Rate limiting: per-actuator timestamps of last command
  private _maxCommandRateHz: number = 0; // 0 = unlimited
  private lastCommandTime = new Map<number, number>();

  // Sensor event listeners per backend (for cleanup)
  private sensorListeners = new Map<
    HapticsBackend,
    (reading: HapticsSensorReading) => void
  >();

  // Device-changed listeners per backend (for cleanup)
  private deviceChangedListeners = new Map<HapticsBackend, () => void>();

  // -----------------------------------------------------------------------
  // Configuration
  // -----------------------------------------------------------------------

  get intensityCap(): number {
    return this._intensityCap;
  }

  set intensityCap(value: number) {
    this._intensityCap = Math.max(0, Math.min(1, value));
  }

  get autoStopTimeoutSecs(): number {
    return this._autoStopTimeoutSecs;
  }

  set autoStopTimeoutSecs(value: number) {
    this._autoStopTimeoutSecs = Math.max(0, value);
  }

  get maxCommandRateHz(): number {
    return this._maxCommandRateHz;
  }

  set maxCommandRateHz(value: number) {
    this._maxCommandRateHz = Math.max(0, value);
  }

  // -----------------------------------------------------------------------
  // Backend Registration
  // -----------------------------------------------------------------------

  registerBackend(backend: HapticsBackend): void {
    if (this.backends.includes(backend)) return;
    this.backends.push(backend);

    // Listen for device changes → rebuild maps
    const onDeviceChanged = (): void => {
      this.rebuildMaps();
      this.emit("capabilitieschanged", this.getCapabilities());
    };
    this.deviceChangedListeners.set(backend, onDeviceChanged);
    backend.on("devicechanged", onDeviceChanged);

    // Listen for sensor readings → remap and forward
    const onSensorReading = (reading: HapticsSensorReading): void => {
      this.handleBackendSensorReading(backend, reading);
    };
    this.sensorListeners.set(backend, onSensorReading);
    backend.on("sensorreading", onSensorReading);

    // Rebuild maps to include any devices this backend already has
    this.rebuildMaps();
  }

  // -----------------------------------------------------------------------
  // Capabilities
  // -----------------------------------------------------------------------

  getCapabilities(): HapticsCapabilities {
    const actuators: HapticsActuator[] = [];
    const sensors: HapticsSensor[] = [];

    for (const entry of this.actuatorMap.values()) {
      actuators.push(entry.actuator);
    }
    for (const entry of this.sensorMap.values()) {
      sensors.push(entry.sensor);
    }

    return {
      available: actuators.length > 0 || sensors.length > 0,
      actuators,
      sensors,
    };
  }

  // -----------------------------------------------------------------------
  // Actuate
  // -----------------------------------------------------------------------

  actuate(commands: HapticsCommand[]): void {
    for (const command of commands) {
      const cappedIntensity = Math.min(command.intensity, this._intensityCap);

      if (command.actuator === null) {
        // Broadcast: send to all actuators matching the given type
        for (const [globalId, entry] of this.actuatorMap) {
          if (entry.actuator.types.includes(command.type)) {
            this.sendToBackend(globalId, entry, command.type, cappedIntensity, command);
          }
        }
      } else {
        // Targeted: look up by global ID
        const entry = this.actuatorMap.get(command.actuator);
        if (entry) {
          this.sendToBackend(command.actuator, entry, command.type, cappedIntensity, command);
        }
      }
    }

    // Reset auto-stop timer on every actuate call
    this.resetAutoStopTimer();
  }

  // -----------------------------------------------------------------------
  // Stop
  // -----------------------------------------------------------------------

  stop(actuatorId?: number): void {
    if (actuatorId !== undefined) {
      const entry = this.actuatorMap.get(actuatorId);
      if (entry) {
        entry.backend.stop(entry.localId);
      }
    } else {
      // Stop all backends
      for (const backend of this.backends) {
        backend.stop();
      }
    }
    this.clearAutoStopTimer();
  }

  // -----------------------------------------------------------------------
  // Emergency Stop
  // -----------------------------------------------------------------------

  emergencyStop(): void {
    // Fire emergency stop on all backends simultaneously
    const promises: Promise<void>[] = [];
    for (const backend of this.backends) {
      promises.push(backend.emergencyStop());
    }
    // Don't await — fire and forget for maximum speed
    void Promise.all(promises);

    this.clearAutoStopTimer();
    this.emit("stopped", "emergency");
  }

  // -----------------------------------------------------------------------
  // Sensor Subscription
  // -----------------------------------------------------------------------

  subscribeSensor(globalSensorId: number, rateHz: number): void {
    const entry = this.sensorMap.get(globalSensorId);
    if (!entry) return;
    entry.backend.subscribeSensor(entry.localId, rateHz);
  }

  unsubscribeSensor(globalSensorId: number): void {
    const entry = this.sensorMap.get(globalSensorId);
    if (!entry) return;
    entry.backend.unsubscribeSensor(entry.localId);
  }

  // -----------------------------------------------------------------------
  // Internal: Map Rebuilding
  // -----------------------------------------------------------------------

  /**
   * Rebuilds the unified actuator/sensor maps from all registered backends.
   * Global IDs are assigned sequentially starting from 0, iterating backends
   * in registration order and then actuators/sensors in the order each
   * backend returns them.
   */
  private rebuildMaps(): void {
    this.actuatorMap.clear();
    this.sensorMap.clear();

    let nextActuatorId = 0;
    let nextSensorId = 0;

    // Determine effective auto-stop timeout based on device classes present
    const deviceClasses = new Set<HapticsDeviceClass>();

    for (const backend of this.backends) {
      // Actuators
      const actuators = backend.getActuators();
      for (const actuator of actuators) {
        const globalId = nextActuatorId++;
        deviceClasses.add(actuator.deviceClass);
        this.actuatorMap.set(globalId, {
          backend,
          localId: actuator.id,
          actuator: {
            ...actuator,
            id: globalId, // Replace local ID with global ID
          },
        });
      }

      // Sensors
      const sensors = backend.getSensors();
      for (const sensor of sensors) {
        const globalId = nextSensorId++;
        this.sensorMap.set(globalId, {
          backend,
          localId: sensor.id,
          sensor: {
            ...sensor,
            id: globalId, // Replace local ID with global ID
          },
        });
      }
    }

    // Auto-stop timeout: use shorter timeout if intimate devices are present
    if (deviceClasses.has("intimate")) {
      this._autoStopTimeoutSecs = 5;
    } else if (deviceClasses.has("gaming")) {
      this._autoStopTimeoutSecs = 30;
    }
  }

  // -----------------------------------------------------------------------
  // Internal: Command Dispatch
  // -----------------------------------------------------------------------

  private sendToBackend(
    globalId: number,
    entry: ActuatorEntry,
    type: HapticsActuatorType,
    intensity: number,
    command: HapticsCommand
  ): void {
    // Rate limiting
    if (this._maxCommandRateHz > 0) {
      const now = Date.now();
      const lastTime = this.lastCommandTime.get(globalId) ?? 0;
      const minInterval = 1000 / this._maxCommandRateHz;
      if (now - lastTime < minInterval) {
        return; // Skip this command — rate limited
      }
      this.lastCommandTime.set(globalId, now);
    }

    const options: { duration?: number; clockwise?: boolean } = {};
    if (command.duration !== undefined) options.duration = command.duration;
    if (command.clockwise !== undefined) options.clockwise = command.clockwise;

    entry.backend.actuate(entry.localId, type, intensity, options);
  }

  // -----------------------------------------------------------------------
  // Internal: Sensor Reading Forwarding
  // -----------------------------------------------------------------------

  private handleBackendSensorReading(
    backend: HapticsBackend,
    reading: HapticsSensorReading
  ): void {
    // Find the global sensor ID for this backend's local sensor ID
    for (const [globalId, entry] of this.sensorMap) {
      if (entry.backend === backend && entry.localId === reading.sensor) {
        this.emit("sensorreading", {
          sensor: globalId,
          type: reading.type,
          value: reading.value,
        });
        return;
      }
    }
  }

  // -----------------------------------------------------------------------
  // Internal: Auto-Stop Timer
  // -----------------------------------------------------------------------

  private resetAutoStopTimer(): void {
    this.clearAutoStopTimer();
    if (this._autoStopTimeoutSecs > 0) {
      this.autoStopTimer = setTimeout(() => {
        this.stop();
        this.emit("stopped", "auto_stop");
      }, this._autoStopTimeoutSecs * 1000);
    }
  }

  private clearAutoStopTimer(): void {
    if (this.autoStopTimer !== null) {
      clearTimeout(this.autoStopTimer);
      this.autoStopTimer = null;
    }
  }
}

export const hapticsService = new HapticsService();
