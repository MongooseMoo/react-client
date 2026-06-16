import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Use vi.hoisted to define mocks that are accessible inside vi.mock factories
const { mockHapticsService, mockPreferencesState } = vi.hoisted(() => {
  const mockHapticsService = {
    actuate: vi.fn(),
    stop: vi.fn(),
    getCapabilities: vi.fn().mockReturnValue({
      available: true,
      actuators: [
        { id: 0, types: ["Vibrate"], steps: 20, deviceClass: "intimate" },
      ],
      sensors: [],
    }),
    subscribeSensor: vi.fn(),
    unsubscribeSensor: vi.fn(),
    maxCommandRateHz: 0,
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  };

  const mockPreferencesState = {
    haptics: {
      enabled: false,
      intifaceUrl: "ws://127.0.0.1:12345",
      intensityCap: 1.0,
      autoStopTimeout: 5,
      autoConnect: false,
    },
    midi: { enabled: false },
    general: {
      localEcho: false,
      syncTimezoneToServer: true,
      syncLocationToServer: false,
    },
    speech: { autoreadMode: "off", voice: "", rate: 1, pitch: 1, volume: 1 },
    sound: { muteInBackground: false, volume: 1 },
    editor: { autocompleteEnabled: true, accessibilityMode: true },
  };

  return { mockHapticsService, mockPreferencesState };
});

vi.mock("../../HapticsService", () => ({
  hapticsService: mockHapticsService,
}));

vi.mock("../../stores/preferencesStore", () => ({
  usePreferences: {
    getState: () => mockPreferencesState,
    subscribe: vi.fn(() => () => {}),
  },
}));

import { GMCPClientHaptics } from "./Haptics";
import type {
  HapticsActuateData,
  HapticsStopData,
  HapticsStatusData,
  HapticsSensorSubscribeData,
  HapticsSensorUnsubscribeData,
} from "./Haptics";

// Helper: create a mock client
function createMockClient() {
  return {
    gmcp: {
      send: vi.fn(),
      handlers: {
        "Core.Supports": {
          sendAdd: vi.fn(),
          sendRemove: vi.fn(),
        },
      },
    },
  };
}

function serviceCallback(eventName: string): (...args: unknown[]) => void {
  const calls = mockHapticsService.on.mock.calls as Array<
    [string, (...args: unknown[]) => void]
  >;
  const call = calls.find(([event]) => event === eventName);
  if (!call) {
    throw new Error(`Expected haptics service listener: ${eventName}`);
  }
  return call[1];
}

describe("GMCPClientHaptics", () => {
  let handler: GMCPClientHaptics;
  let mockClient: ReturnType<typeof createMockClient>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPreferencesState.haptics.enabled = false;
    mockHapticsService.maxCommandRateHz = 0;
    mockClient = createMockClient();
    handler = new GMCPClientHaptics(mockClient);
  });

  afterEach(() => {
    handler.shutdown();
  });

  // -----------------------------------------------------------------
  // Package metadata
  // -----------------------------------------------------------------

  it("has correct packageName", () => {
    expect(handler.packageName).toBe("Client.Haptics");
  });

  it("has packageVersion 1", () => {
    expect(handler.packageVersion).toBe(1);
  });

  // -----------------------------------------------------------------
  // enabled getter
  // -----------------------------------------------------------------

  it("enabled returns false when haptics preference is disabled", () => {
    mockPreferencesState.haptics.enabled = false;
    expect(handler.enabled).toBe(false);
  });

  it("enabled returns true when haptics preference is enabled", () => {
    mockPreferencesState.haptics.enabled = true;
    expect(handler.enabled).toBe(true);
  });

  // -----------------------------------------------------------------
  // handleActuate
  // -----------------------------------------------------------------

  it("forwards actuate commands to hapticsService", () => {
    const data: HapticsActuateData = {
      source: "test_object",
      commands: [
        { actuator: 0, type: "Vibrate", intensity: 0.5, duration: 1000 },
        { actuator: null, type: "Rotate", intensity: 0.8, clockwise: true },
      ],
    };

    handler.handleActuate(data);

    expect(mockHapticsService.actuate).toHaveBeenCalledOnce();
    const commands = mockHapticsService.actuate.mock.calls[0][0];
    expect(commands).toHaveLength(2);
    expect(commands[0]).toEqual({
      actuator: 0,
      type: "Vibrate",
      intensity: 0.5,
      duration: 1000,
      clockwise: undefined,
    });
    expect(commands[1]).toEqual({
      actuator: null,
      type: "Rotate",
      intensity: 0.8,
      duration: undefined,
      clockwise: true,
    });
  });

  it("emits actuate package event", () => {
    const data: HapticsActuateData = {
      source: "test",
      commands: [{ actuator: 0, type: "Vibrate", intensity: 0.5 }],
    };
    const listener = vi.fn();
    handler.on("actuate", listener);

    handler.receiveRegisteredMessage("Actuate", data);

    expect(listener).toHaveBeenCalledWith(data);
  });

  // -----------------------------------------------------------------
  // handleStop
  // -----------------------------------------------------------------

  it("forwards stop with specific actuator to hapticsService", () => {
    const data: HapticsStopData = {
      source: "test",
      actuator: 2,
    };

    handler.handleStop(data);

    expect(mockHapticsService.stop).toHaveBeenCalledWith(2);
  });

  it("forwards stop with null actuator to hapticsService.stop()", () => {
    const data: HapticsStopData = {
      source: "test",
      actuator: null,
    };

    handler.handleStop(data);

    expect(mockHapticsService.stop).toHaveBeenCalledWith();
  });

  it("emits stop package event", () => {
    const data: HapticsStopData = {
      source: "test",
      actuator: null,
    };
    const listener = vi.fn();
    handler.on("stop", listener);

    handler.receiveRegisteredMessage("Stop", data);

    expect(listener).toHaveBeenCalledWith(data);
  });

  // -----------------------------------------------------------------
  // handleStatus
  // -----------------------------------------------------------------

  it("stores server config values", () => {
    const data: HapticsStatusData = {
      enabled: true,
      maxCommandRate: 50,
      maxSensorRate: 10,
      serverVersion: 2,
    };

    handler.handleStatus(data);

    const status = handler.getServerStatus();
    expect(status.enabled).toBe(true);
    expect(status.maxCommandRate).toBe(50);
    expect(status.maxSensorRate).toBe(10);
    expect(status.serverVersion).toBe(2);
  });

  it("applies maxCommandRate to hapticsService when > 0", () => {
    const data: HapticsStatusData = {
      enabled: true,
      maxCommandRate: 25,
      maxSensorRate: 5,
      serverVersion: 1,
    };

    handler.handleStatus(data);

    expect(mockHapticsService.maxCommandRateHz).toBe(25);
  });

  it("stops all devices when server status enabled=false", () => {
    const data: HapticsStatusData = {
      enabled: false,
      maxCommandRate: 0,
      maxSensorRate: 0,
      serverVersion: 1,
    };

    handler.handleStatus(data);

    expect(mockHapticsService.stop).toHaveBeenCalledWith();
  });

  it("does not stop devices when server status enabled=true", () => {
    const data: HapticsStatusData = {
      enabled: true,
      maxCommandRate: 0,
      maxSensorRate: 0,
      serverVersion: 1,
    };

    handler.handleStatus(data);

    expect(mockHapticsService.stop).not.toHaveBeenCalled();
  });

  it("emits status package event", () => {
    const data: HapticsStatusData = {
      enabled: true,
      maxCommandRate: 0,
      maxSensorRate: 0,
      serverVersion: 1,
    };
    const listener = vi.fn();
    handler.on("status", listener);

    handler.receiveRegisteredMessage("Status", data);

    expect(listener).toHaveBeenCalledWith(data);
  });

  // -----------------------------------------------------------------
  // handleSensorSubscribe
  // -----------------------------------------------------------------

  it("subscribes each sensor via hapticsService", () => {
    const data: HapticsSensorSubscribeData = {
      sensors: [0, 2, 5],
      rate: 10,
    };

    handler.handleSensorSubscribe(data);

    expect(mockHapticsService.subscribeSensor).toHaveBeenCalledTimes(3);
    expect(mockHapticsService.subscribeSensor).toHaveBeenCalledWith(0, 10);
    expect(mockHapticsService.subscribeSensor).toHaveBeenCalledWith(2, 10);
    expect(mockHapticsService.subscribeSensor).toHaveBeenCalledWith(5, 10);
  });

  it("emits sensorSubscribe package event", () => {
    const data: HapticsSensorSubscribeData = {
      sensors: [1],
      rate: 5,
    };
    const listener = vi.fn();
    handler.on("sensorSubscribe", listener);

    handler.receiveRegisteredMessage("SensorSubscribe", data);

    expect(listener).toHaveBeenCalledWith(data);
  });

  // -----------------------------------------------------------------
  // handleSensorUnsubscribe
  // -----------------------------------------------------------------

  it("unsubscribes each sensor via hapticsService", () => {
    const data: HapticsSensorUnsubscribeData = {
      sensors: [0, 3],
    };

    handler.handleSensorUnsubscribe(data);

    expect(mockHapticsService.unsubscribeSensor).toHaveBeenCalledTimes(2);
    expect(mockHapticsService.unsubscribeSensor).toHaveBeenCalledWith(0);
    expect(mockHapticsService.unsubscribeSensor).toHaveBeenCalledWith(3);
  });

  it("emits sensorUnsubscribe package event", () => {
    const data: HapticsSensorUnsubscribeData = {
      sensors: [1],
    };
    const listener = vi.fn();
    handler.on("sensorUnsubscribe", listener);

    handler.receiveRegisteredMessage("SensorUnsubscribe", data);

    expect(listener).toHaveBeenCalledWith(data);
  });

  // -----------------------------------------------------------------
  // publishCapabilities
  // -----------------------------------------------------------------

  it("sends correct GMCP capabilities message", () => {
    handler.publishCapabilities();

    expect(mockHapticsService.getCapabilities).toHaveBeenCalledOnce();
    expect(mockClient.gmcp.send).toHaveBeenCalledWith(
      "Client.Haptics.Capabilities",
      JSON.stringify({
        available: true,
        actuators: [
          { id: 0, types: ["Vibrate"], steps: 20, deviceClass: "intimate" },
        ],
        sensors: [],
      })
    );
  });

  // -----------------------------------------------------------------
  // publishStopped
  // -----------------------------------------------------------------

  it("sends correct GMCP stopped message", () => {
    handler.publishStopped("user_stop");

    expect(mockClient.gmcp.send).toHaveBeenCalledWith(
      "Client.Haptics.Stopped",
      JSON.stringify({ reason: "user_stop" })
    );
  });

  it("sends correct GMCP stopped message for auto_stop", () => {
    handler.publishStopped("auto_stop");

    expect(mockClient.gmcp.send).toHaveBeenCalledWith(
      "Client.Haptics.Stopped",
      JSON.stringify({ reason: "auto_stop" })
    );
  });

  // -----------------------------------------------------------------
  // publishSensorReading
  // -----------------------------------------------------------------

  it("sends correct GMCP sensor message", () => {
    handler.publishSensorReading({ sensor: 0, type: "Pressure", value: 0.75 });

    expect(mockClient.gmcp.send).toHaveBeenCalledWith(
      "Client.Haptics.Sensor",
      JSON.stringify({
        readings: [{ sensor: 0, type: "Pressure", value: 0.75 }],
      })
    );
  });

  // -----------------------------------------------------------------
  // Dynamic advertisement
  // -----------------------------------------------------------------

  it("advertises haptics support via Core.Supports.sendAdd", () => {
    handler.advertiseHapticsSupport();

    const coreSupports = mockClient.gmcp.handlers["Core.Supports"];
    expect(coreSupports.sendAdd).toHaveBeenCalledWith(["Client.Haptics 1"]);
  });

  it("does not double-advertise", () => {
    handler.advertiseHapticsSupport();
    handler.advertiseHapticsSupport();

    const coreSupports = mockClient.gmcp.handlers["Core.Supports"];
    expect(coreSupports.sendAdd).toHaveBeenCalledTimes(1);
  });

  it("unadvertises haptics support via Core.Supports.sendRemove", () => {
    handler.advertiseHapticsSupport(); // must advertise first
    handler.unadvertiseHapticsSupport();

    const coreSupports = mockClient.gmcp.handlers["Core.Supports"];
    expect(coreSupports.sendRemove).toHaveBeenCalledWith(["Client.Haptics"]);
  });

  it("does not unadvertise if not advertised", () => {
    handler.unadvertiseHapticsSupport();

    const coreSupports = mockClient.gmcp.handlers["Core.Supports"];
    expect(coreSupports.sendRemove).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------
  // Service event listeners
  // -----------------------------------------------------------------

  it("registers listeners on hapticsService in constructor", () => {
    // The constructor already ran, check that on was called for each event
    expect(mockHapticsService.on).toHaveBeenCalledWith(
      "capabilitieschanged",
      expect.any(Function)
    );
    expect(mockHapticsService.on).toHaveBeenCalledWith(
      "stopped",
      expect.any(Function)
    );
    expect(mockHapticsService.on).toHaveBeenCalledWith(
      "sensorreading",
      expect.any(Function)
    );
  });

  it("cleans up service listeners on shutdown", () => {
    handler.shutdown();

    expect(mockHapticsService.off).toHaveBeenCalledWith(
      "capabilitieschanged",
      expect.any(Function)
    );
    expect(mockHapticsService.off).toHaveBeenCalledWith(
      "stopped",
      expect.any(Function)
    );
    expect(mockHapticsService.off).toHaveBeenCalledWith(
      "sensorreading",
      expect.any(Function)
    );
  });

  it("shutdown stops all devices", () => {
    handler.shutdown();

    expect(mockHapticsService.stop).toHaveBeenCalledWith();
  });

  it("shutdown unsubscribes active sensor subscriptions", () => {
    handler.handleSensorSubscribe({ sensors: [0, 3], rate: 10 });
    mockHapticsService.unsubscribeSensor.mockClear();

    handler.shutdown();

    expect(mockHapticsService.unsubscribeSensor).toHaveBeenCalledTimes(2);
    expect(mockHapticsService.unsubscribeSensor).toHaveBeenCalledWith(0);
    expect(mockHapticsService.unsubscribeSensor).toHaveBeenCalledWith(3);
  });

  // -----------------------------------------------------------------
  // Service event: capabilitieschanged sends capabilities when advertised
  // -----------------------------------------------------------------

  it("sends capabilities on capabilitieschanged when enabled and advertised", () => {
    mockPreferencesState.haptics.enabled = true;

    const capabilitiesChangedCallback = serviceCallback("capabilitieschanged");

    // Advertise first
    handler.advertiseHapticsSupport();
    vi.clearAllMocks();

    // Fire the event
    capabilitiesChangedCallback();

    expect(mockHapticsService.getCapabilities).toHaveBeenCalled();
    expect(mockClient.gmcp.send).toHaveBeenCalledWith(
      "Client.Haptics.Capabilities",
      expect.any(String)
    );
  });

  it("does not send capabilities on capabilitieschanged when not advertised", () => {
    mockPreferencesState.haptics.enabled = true;

    const capabilitiesChangedCallback = serviceCallback("capabilitieschanged");

    vi.clearAllMocks();

    // Fire without advertising first
    capabilitiesChangedCallback();

    expect(mockClient.gmcp.send).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------
  // Service event: stopped forwards to server
  // -----------------------------------------------------------------

  it("sends Stopped to server when service emits stopped", () => {
    const stoppedCallback = serviceCallback("stopped");

    stoppedCallback("auto_stop");

    expect(mockClient.gmcp.send).toHaveBeenCalledWith(
      "Client.Haptics.Stopped",
      JSON.stringify({ reason: "auto_stop" })
    );
  });

  // -----------------------------------------------------------------
  // Service event: sensorreading forwards to server
  // -----------------------------------------------------------------

  it("sends Sensor to server when service emits sensorreading", () => {
    const sensorReadingCallback = serviceCallback("sensorreading");

    sensorReadingCallback({ sensor: 1, type: "Battery", value: 0.85 });

    expect(mockClient.gmcp.send).toHaveBeenCalledWith(
      "Client.Haptics.Sensor",
      JSON.stringify({
        readings: [{ sensor: 1, type: "Battery", value: 0.85 }],
      })
    );
  });
});
