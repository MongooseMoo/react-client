import { GMCPPackage } from "../package";
import { hapticsService } from "../../HapticsService";
import { preferencesStore } from "../../PreferencesStore";
import type { HapticsCommand, HapticsSensorReading } from "../../haptics/types";

// ---------------------------------------------------------------------------
// Server -> Client message types
// ---------------------------------------------------------------------------

export interface HapticsActuateData {
  source: string;
  commands: Array<{
    actuator: number | null;
    type: string;
    intensity: number;
    duration?: number;
    clockwise?: boolean;
  }>;
}

export interface HapticsStopData {
  source: string;
  actuator: number | null;
}

export interface HapticsStatusData {
  enabled: boolean;
  maxCommandRate: number;
  maxSensorRate: number;
  serverVersion: number;
}

export interface HapticsSensorSubscribeData {
  sensors: number[];
  rate: number;
}

export interface HapticsSensorUnsubscribeData {
  sensors: number[];
}

// ---------------------------------------------------------------------------
// GMCPClientHaptics
// ---------------------------------------------------------------------------

export class GMCPClientHaptics extends GMCPPackage {
  public packageName: string = "Client.Haptics";
  public packageVersion?: number = 1;

  private isAdvertised: boolean = false;

  // Server status (stored from handleStatus)
  private serverEnabled: boolean = false;
  private serverMaxCommandRate: number = 0;
  private serverMaxSensorRate: number = 0;
  private serverVersion: number = 0;

  // Sensor subscription cleanup functions
  private sensorSubscriptions: Map<number, () => void> = new Map();

  // Service event listener cleanup
  private serviceCleanup: Array<() => void> = [];

  get enabled(): boolean {
    return preferencesStore.getState().haptics.enabled;
  }

  constructor(client: any) {
    super(client);
    this.setupServiceListeners();
  }

  // -------------------------------------------------------------------
  // Service event integration
  // -------------------------------------------------------------------

  private setupServiceListeners(): void {
    const onCapabilitiesChanged = (): void => {
      if (this.enabled && this.isAdvertised) {
        this.sendCapabilities();
      }
    };
    hapticsService.on("capabilitieschanged", onCapabilitiesChanged);
    this.serviceCleanup.push(() =>
      hapticsService.off("capabilitieschanged", onCapabilitiesChanged)
    );

    const onStopped = (reason: string): void => {
      this.sendStopped(reason);
    };
    hapticsService.on("stopped", onStopped);
    this.serviceCleanup.push(() =>
      hapticsService.off("stopped", onStopped)
    );

    const onSensorReading = (reading: HapticsSensorReading): void => {
      this.sendSensor(reading);
    };
    hapticsService.on("sensorreading", onSensorReading);
    this.serviceCleanup.push(() =>
      hapticsService.off("sensorreading", onSensorReading)
    );
  }

  // -------------------------------------------------------------------
  // Server -> Client handlers
  // -------------------------------------------------------------------

  handleActuate(data: HapticsActuateData): void {
    const commands: HapticsCommand[] = data.commands.map((cmd) => ({
      actuator: cmd.actuator,
      type: cmd.type as HapticsCommand["type"],
      intensity: cmd.intensity,
      duration: cmd.duration,
      clockwise: cmd.clockwise,
    }));
    hapticsService.actuate(commands);
    this.client.emit("hapticsActuate", data);
  }

  handleStop(data: HapticsStopData): void {
    if (data.actuator !== null && data.actuator !== undefined) {
      hapticsService.stop(data.actuator);
    } else {
      hapticsService.stop();
    }
    this.client.emit("hapticsStop", data);
  }

  handleStatus(data: HapticsStatusData): void {
    this.serverEnabled = data.enabled;
    this.serverMaxCommandRate = data.maxCommandRate;
    this.serverMaxSensorRate = data.maxSensorRate;
    this.serverVersion = data.serverVersion;

    // Apply server's rate limit if provided
    if (data.maxCommandRate > 0) {
      hapticsService.maxCommandRateHz = data.maxCommandRate;
    }

    // If server says disabled, stop all devices
    if (!data.enabled) {
      hapticsService.stop();
    }

    this.client.emit("hapticsStatus", data);
  }

  handleSensorSubscribe(data: HapticsSensorSubscribeData): void {
    for (const sensorId of data.sensors) {
      hapticsService.subscribeSensor(sensorId, data.rate);
    }
    this.client.emit("hapticsSensorSubscribe", data);
  }

  handleSensorUnsubscribe(data: HapticsSensorUnsubscribeData): void {
    for (const sensorId of data.sensors) {
      hapticsService.unsubscribeSensor(sensorId);
    }
    this.client.emit("hapticsSensorUnsubscribe", data);
  }

  // -------------------------------------------------------------------
  // Client -> Server senders
  // -------------------------------------------------------------------

  sendCapabilities(): void {
    const capabilities = hapticsService.getCapabilities();
    this.sendData("Capabilities", capabilities);
  }

  sendSensor(reading: HapticsSensorReading): void {
    this.sendData("Sensor", { readings: [reading] });
  }

  sendStopped(reason: string): void {
    this.sendData("Stopped", { reason });
  }

  // -------------------------------------------------------------------
  // Dynamic advertisement (following MIDI pattern)
  // -------------------------------------------------------------------

  advertiseHapticsSupport(): void {
    if (!this.isAdvertised) {
      const coreSupports = this.client.gmcpHandlers["Core.Supports"];
      if (coreSupports) {
        coreSupports.sendAdd([
          { name: "Client.Haptics", version: this.packageVersion || 1 },
        ]);
        this.isAdvertised = true;
      }
    }
  }

  unadvertiseHapticsSupport(): void {
    if (this.isAdvertised) {
      const coreSupports = this.client.gmcpHandlers["Core.Supports"];
      if (coreSupports) {
        coreSupports.sendRemove(["Client.Haptics"]);
        this.isAdvertised = false;
      }
    }
  }

  // -------------------------------------------------------------------
  // Accessors for stored server status
  // -------------------------------------------------------------------

  getServerStatus(): {
    enabled: boolean;
    maxCommandRate: number;
    maxSensorRate: number;
    serverVersion: number;
  } {
    return {
      enabled: this.serverEnabled,
      maxCommandRate: this.serverMaxCommandRate,
      maxSensorRate: this.serverMaxSensorRate,
      serverVersion: this.serverVersion,
    };
  }

  // -------------------------------------------------------------------
  // Shutdown
  // -------------------------------------------------------------------

  shutdown(): void {
    // Clean up service event listeners
    for (const cleanup of this.serviceCleanup) {
      cleanup();
    }
    this.serviceCleanup = [];

    // Clean up sensor subscriptions
    this.sensorSubscriptions.clear();

    // Stop all devices
    hapticsService.stop();
  }
}
