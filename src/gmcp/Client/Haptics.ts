import type MudClient from "../../client";
import { inbound, outbound } from "../../protocol/messages";
import { GMCPPackage } from "../package";
import { hapticsService } from "../../HapticsService";
import { usePreferences } from "../../stores/preferencesStore";
import type { HapticsCommand, HapticsSensorReading } from "../../haptics/types";
import { gmcpJsonMessage } from "../messages";

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

interface HapticsSensorPayload {
  readings: HapticsSensorReading[];
}

interface HapticsStoppedPayload {
  reason: string;
}

const hapticsActuate = gmcpJsonMessage<"Actuate", HapticsActuateData>("Actuate");
const hapticsStop = gmcpJsonMessage<"Stop", HapticsStopData>("Stop");
const hapticsStatus = gmcpJsonMessage<"Status", HapticsStatusData>("Status");
const hapticsSensorSubscribe = gmcpJsonMessage<
  "SensorSubscribe",
  HapticsSensorSubscribeData
>("SensorSubscribe");
const hapticsSensorUnsubscribe = gmcpJsonMessage<
  "SensorUnsubscribe",
  HapticsSensorUnsubscribeData
>("SensorUnsubscribe");
const hapticsCapabilities = gmcpJsonMessage<
  "Capabilities",
  never,
  ReturnType<typeof hapticsService.getCapabilities>
>("Capabilities");
const hapticsSensor = gmcpJsonMessage<"Sensor", never, HapticsSensorPayload>("Sensor");
const hapticsStopped = gmcpJsonMessage<"Stopped", never, HapticsStoppedPayload>("Stopped");

const GMCPClientHapticsBase = GMCPPackage.with({
  packageName: "Client.Haptics",
  messages: [
    inbound(hapticsActuate),
    inbound(hapticsStop),
    inbound(hapticsStatus),
    inbound(hapticsSensorSubscribe),
    inbound(hapticsSensorUnsubscribe),
    outbound(hapticsCapabilities),
    outbound(hapticsSensor),
    outbound(hapticsStopped),
  ] as const,
});

// ---------------------------------------------------------------------------
// GMCPClientHaptics
// ---------------------------------------------------------------------------

export class GMCPClientHaptics extends GMCPClientHapticsBase {
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
    return usePreferences.getState().haptics.enabled;
  }

  constructor(client: MudClient) {
    super(client);
    this.on("actuate", (data) => this.handleActuate(data));
    this.on("stop", (data) => this.handleStop(data));
    this.on("status", (data) => this.handleStatus(data));
    this.on("sensorSubscribe", (data) => this.handleSensorSubscribe(data));
    this.on("sensorUnsubscribe", (data) => this.handleSensorUnsubscribe(data));
    this.setupServiceListeners();
  }

  // -------------------------------------------------------------------
  // Service event integration
  // -------------------------------------------------------------------

  private setupServiceListeners(): void {
    const onCapabilitiesChanged = (): void => {
      if (this.enabled && this.isAdvertised) {
        this.publishCapabilities();
      }
    };
    hapticsService.on("capabilitieschanged", onCapabilitiesChanged);
    this.serviceCleanup.push(() =>
      hapticsService.off("capabilitieschanged", onCapabilitiesChanged)
    );

    const onStopped = (reason: string): void => {
      this.publishStopped(reason);
    };
    hapticsService.on("stopped", onStopped);
    this.serviceCleanup.push(() =>
      hapticsService.off("stopped", onStopped)
    );

    const onSensorReading = (reading: HapticsSensorReading): void => {
      this.publishSensorReading(reading);
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
  }

  handleStop(data: HapticsStopData): void {
    if (data.actuator !== null && data.actuator !== undefined) {
      hapticsService.stop(data.actuator);
    } else {
      hapticsService.stop();
    }
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
  }

  handleSensorSubscribe(data: HapticsSensorSubscribeData): void {
    for (const sensorId of data.sensors) {
      this.sensorSubscriptions.get(sensorId)?.();
      hapticsService.subscribeSensor(sensorId, data.rate);
      this.sensorSubscriptions.set(sensorId, () => {
        hapticsService.unsubscribeSensor(sensorId);
      });
    }
  }

  handleSensorUnsubscribe(data: HapticsSensorUnsubscribeData): void {
    for (const sensorId of data.sensors) {
      const cleanup = this.sensorSubscriptions.get(sensorId);
      if (cleanup) {
        cleanup();
        this.sensorSubscriptions.delete(sensorId);
      } else {
        hapticsService.unsubscribeSensor(sensorId);
      }
    }
  }

  // -------------------------------------------------------------------
  // Client -> Server senders
  // -------------------------------------------------------------------

  publishCapabilities(): void {
    const capabilities = hapticsService.getCapabilities();
    this.sendCapabilities(capabilities);
  }

  publishSensorReading(reading: HapticsSensorReading): void {
    this.sendSensor({ readings: [reading] });
  }

  publishStopped(reason: string): void {
    this.sendStopped({ reason });
  }

  // -------------------------------------------------------------------
  // Dynamic advertisement (following MIDI pattern)
  // -------------------------------------------------------------------

  advertiseHapticsSupport(): void {
    if (!this.isAdvertised) {
      const coreSupports = this.client.gmcp.handlers["Core.Supports"];
      if (coreSupports) {
        coreSupports.sendAdd([`Client.Haptics ${this.packageVersion || 1}`]);
        this.isAdvertised = true;
      }
    }
  }

  unadvertiseHapticsSupport(): void {
    if (this.isAdvertised) {
      const coreSupports = this.client.gmcp.handlers["Core.Supports"];
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
    for (const cleanup of this.sensorSubscriptions.values()) {
      cleanup();
    }
    this.sensorSubscriptions.clear();

    // Stop all devices
    hapticsService.stop();
  }
}
