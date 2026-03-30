import React, { useEffect, useState } from "react";
import MudClient from "../client";
import { hapticsService } from "../HapticsService";
import { usePreferences } from "../hooks/usePreferences";
import type { HapticsCapabilities, HapticsActuator } from "../haptics/types";

interface HapticsStatusProps {
  client: MudClient;
}

const HapticsStatus: React.FC<HapticsStatusProps> = ({ client }) => {
  const [preferences] = usePreferences();
  const [capabilities, setCapabilities] = useState<HapticsCapabilities>(
    hapticsService.getCapabilities()
  );
  const [backendStatus, setBackendStatus] = useState<
    Map<string, boolean>
  >(new Map());

  // Subscribe to capabilitieschanged
  useEffect(() => {
    const onCapabilities = (caps: HapticsCapabilities): void => {
      setCapabilities(caps);
    };
    hapticsService.on("capabilitieschanged", onCapabilities);
    return () => {
      hapticsService.off("capabilitieschanged", onCapabilities);
    };
  }, []);

  // Subscribe to connectionchanged
  useEffect(() => {
    const onConnection = (backendName: string, connected: boolean): void => {
      setBackendStatus((prev) => {
        const next = new Map(prev);
        next.set(backendName, connected);
        return next;
      });
    };
    hapticsService.on("connectionchanged", onConnection);
    return () => {
      hapticsService.off("connectionchanged", onConnection);
    };
  }, []);

  const handleEmergencyStop = (): void => {
    hapticsService.emergencyStop();
  };

  const [isScanning, setIsScanning] = useState(false);

  const handleScan = async (): Promise<void> => {
    setIsScanning(true);
    try {
      await hapticsService.scan();
    } catch (err) {
      console.error("Scan failed:", err);
    } finally {
      setIsScanning(false);
    }
  };

  if (!preferences.haptics.enabled) {
    return (
      <div style={{ padding: "10px" }}>
        <p>Haptics is disabled. Enable it in preferences to use haptics features.</p>
      </div>
    );
  }

  const gamepadConnected = backendStatus.get("gamepad") ?? false;
  const gamepadActuators = capabilities.actuators.filter(
    (a) => a.deviceClass === "gaming"
  );
  return (
    <div style={{ padding: "10px" }}>
      <h3>Haptics Status</h3>

      {/* Gamepad Status */}
      <div style={{ marginBottom: "15px" }}>
        <div style={{ marginBottom: "8px" }}>
          <strong>Gamepad</strong>
        </div>
        {gamepadConnected || gamepadActuators.length > 0 ? (
          <div>
            <span style={{ color: "green" }}>Connected (automatic)</span>
            {gamepadActuators.length > 0 ? (
              <div style={{ marginTop: "5px", fontSize: "0.9em", color: "#666" }}>
                {gamepadActuators.length} actuator{gamepadActuators.length !== 1 ? "s" : ""} available
              </div>
            ) : (
              <div style={{ marginTop: "5px", fontSize: "0.9em", color: "#666" }}>
                No gamepads detected. Connect a controller to use gamepad haptics.
              </div>
            )}
          </div>
        ) : (
          <div>
            <span style={{ color: "#666", fontSize: "0.9em" }}>
              Listening for gamepads... Connect a controller to use gamepad haptics.
            </span>
          </div>
        )}
      </div>

      {/* Bluetooth Devices */}
      <div style={{ marginBottom: "15px" }}>
        <div style={{ marginBottom: "8px" }}>
          <strong>Bluetooth Devices</strong>
        </div>
        {typeof navigator !== "undefined" && (navigator as any).bluetooth ? (
          <div>
            <button
              onClick={handleScan}
              disabled={isScanning}
              style={{
                padding: "6px 16px",
                fontSize: "0.9em",
                cursor: isScanning ? "not-allowed" : "pointer",
              }}
            >
              {isScanning ? "Scanning..." : "Scan for Devices"}
            </button>
            <div style={{ marginTop: "5px", fontSize: "0.85em", color: "#666" }}>
              Opens the browser device picker. Your device must be in pairing mode.
            </div>
          </div>
        ) : (
          <div style={{ fontSize: "0.9em", color: "#999" }}>
            WebBluetooth is not supported in this browser. Use Chrome or Edge.
          </div>
        )}
      </div>

      {/* Device List */}
      <div style={{ marginBottom: "15px" }}>
        <div style={{ marginBottom: "8px" }}>
          <strong>Devices</strong>
        </div>
        {capabilities.actuators.length === 0 && capabilities.sensors.length === 0 ? (
          <div style={{ color: "#666", fontSize: "0.9em" }}>
            No haptic devices connected.
          </div>
        ) : (
          <div>
            {capabilities.actuators.length > 0 && (
              <div style={{ marginBottom: "8px" }}>
                <div style={{ fontSize: "0.9em", marginBottom: "4px" }}>
                  <strong>Actuators ({capabilities.actuators.length})</strong>
                </div>
                <div
                  style={{
                    maxHeight: "200px",
                    overflow: "auto",
                    fontSize: "0.85em",
                    backgroundColor: "#f9f9f9",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                  }}
                >
                  {capabilities.actuators.map((actuator: HapticsActuator) => (
                    <div
                      key={actuator.id}
                      style={{
                        marginBottom: "4px",
                        paddingBottom: "4px",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      <span style={{ color: "#333" }}>
                        #{actuator.id}
                      </span>{" "}
                      <span>{actuator.types.join(", ")}</span>{" "}
                      <span style={{ color: "#666" }}>
                        ({actuator.deviceClass}, {actuator.steps} steps)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {capabilities.sensors.length > 0 && (
              <div>
                <div style={{ fontSize: "0.9em", marginBottom: "4px" }}>
                  <strong>Sensors ({capabilities.sensors.length})</strong>
                </div>
                <div
                  style={{
                    maxHeight: "150px",
                    overflow: "auto",
                    fontSize: "0.85em",
                    backgroundColor: "#f9f9f9",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                  }}
                >
                  {capabilities.sensors.map((sensor) => (
                    <div
                      key={sensor.id}
                      style={{
                        marginBottom: "4px",
                        paddingBottom: "4px",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      <span style={{ color: "#333" }}>
                        #{sensor.id}
                      </span>{" "}
                      <span>{sensor.types.join(", ")}</span>{" "}
                      <span style={{ color: "#666" }}>
                        ({sensor.deviceClass}, range {sensor.range[0]}-{sensor.range[1]})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Emergency Stop Button */}
      <div style={{ marginBottom: "15px" }}>
        <button
          onClick={handleEmergencyStop}
          style={{
            padding: "10px 20px",
            backgroundColor: "#d32f2f",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "1em",
            width: "100%",
          }}
        >
          EMERGENCY STOP
        </button>
      </div>

      {/* Usage Info */}
      <details>
        <summary><strong>Info</strong></summary>
        <div style={{ padding: "10px 0", fontSize: "0.9em", color: "#666" }}>
          <p>Gamepad haptics are automatic when a compatible controller is connected.</p>
          <p>Bluetooth devices are discovered via in-browser WebBluetooth (Chromium browsers only).</p>
          <p>The server can send haptic commands when the Client.Haptics GMCP package is active.</p>
          <p>Press Escape or use the Emergency Stop button to immediately halt all haptic output.</p>
          <p>Intensity cap: {(preferences.haptics.intensityCap * 100).toFixed(0)}% | Auto-stop: {preferences.haptics.autoStopTimeout}s</p>
        </div>
      </details>
    </div>
  );
};

export default HapticsStatus;
