import type React from "react";
import { useEffect, useState } from "react";
import type MudClient from "../client";
import { hapticsService } from "../HapticsService";
import { usePreferences } from "../stores/preferencesStore";
import type { HapticsCapabilities, HapticsActuator } from "../haptics/types";

interface HapticsStatusProps {
  client: MudClient;
}

const HapticsStatus: React.FC<HapticsStatusProps> = () => {
  const hapticsPreferences = usePreferences((state) => state.haptics);
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
    setOutcome('Haptics stopped.');
  };

  const [isScanning, setIsScanning] = useState(false);
  const [outcome, setOutcome] = useState('');

  const handleScan = async (): Promise<void> => {
    if (isScanning) return;
    setOutcome('');
    setIsScanning(true);
    try {
      await hapticsService.scan();
      setOutcome('Device scan finished.');
    } catch (err) {
      const name = typeof err === 'object' && err !== null && 'name' in err ? err.name : '';
      setOutcome(name === 'NotFoundError' ? 'No device selected.'
        : name === 'AbortError' ? 'Device scan cancelled.'
        : 'Could not scan for devices. Check Bluetooth access and try again.');
    } finally {
      setIsScanning(false);
    }
  };

  if (!hapticsPreferences.enabled) {
    return (
      <div style={{ padding: "10px", color: "var(--color-text)", overflowWrap: "anywhere" }}>
        <p>Haptics is disabled. Enable it in preferences to use haptics features.</p>
      </div>
    );
  }

  const gamepadConnected = backendStatus.get("gamepad") ?? false;
  const gamepadActuators = capabilities.actuators.filter(
    (a) => a.deviceClass === "gaming"
  );
  return (
    <div style={{ padding: "10px", color: "var(--color-text)", overflowWrap: "anywhere" }}>
      <h3>Haptics Status</h3>
      <p role="status">{outcome}</p>

      {/* Gamepad Status */}
      <div style={{ marginBottom: "15px" }}>
        <div style={{ marginBottom: "8px" }}>
          <strong>Gamepad</strong>
        </div>
        {gamepadConnected || gamepadActuators.length > 0 ? (
          <div>
            <span style={{ color: "var(--color-success)" }}>Connected (automatic)</span>
            {gamepadActuators.length > 0 ? (
              <div style={{ marginTop: "5px", fontSize: "0.9em", color: "var(--color-text-secondary)" }}>
                {gamepadActuators.length} actuator{gamepadActuators.length !== 1 ? "s" : ""} available
              </div>
            ) : (
              <div style={{ marginTop: "5px", fontSize: "0.9em", color: "var(--color-text-secondary)" }}>
                No gamepads detected. Connect a controller to use gamepad haptics.
              </div>
            )}
          </div>
        ) : (
          <div>
            <span style={{ color: "var(--color-text-secondary)", fontSize: "0.9em" }}>
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
              type="button"
              onClick={handleScan}
              aria-disabled={isScanning}
              aria-label="Scan for Devices"
              style={{
                padding: "6px 16px",
                fontSize: "0.9em",
                cursor: isScanning ? "not-allowed" : "pointer",
              }}
            >
              {isScanning ? "Scanning..." : "Scan for Devices"}
            </button>
            <div style={{ marginTop: "5px", fontSize: "0.85em", color: "var(--color-text-secondary)" }}>
              Opens the browser device picker. Your device must be in pairing mode.
            </div>
          </div>
        ) : (
          <div style={{ fontSize: "0.9em", color: "var(--color-text-secondary)" }}>
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
          <div style={{ color: "var(--color-text-secondary)", fontSize: "0.9em" }}>
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
                    backgroundColor: "var(--color-bg-surface)",
                    padding: "8px",
                    border: "1px solid var(--color-border)",
                    borderRadius: "4px",
                  }}
                >
                  {capabilities.actuators.map((actuator: HapticsActuator) => (
                    <div
                      key={actuator.id}
                      style={{
                        marginBottom: "4px",
                        paddingBottom: "4px",
                        borderBottom: "1px solid var(--color-border)",
                      }}
                    >
                      <span style={{ color: "var(--color-text)" }}>
                        #{actuator.id}
                      </span>{" "}
                      <span>{actuator.types.join(", ")}</span>{" "}
                      <span style={{ color: "var(--color-text-secondary)" }}>
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
                    backgroundColor: "var(--color-bg-surface)",
                    padding: "8px",
                    border: "1px solid var(--color-border)",
                    borderRadius: "4px",
                  }}
                >
                  {capabilities.sensors.map((sensor) => (
                    <div
                      key={sensor.id}
                      style={{
                        marginBottom: "4px",
                        paddingBottom: "4px",
                        borderBottom: "1px solid var(--color-border)",
                      }}
                    >
                      <span style={{ color: "var(--color-text)" }}>
                        #{sensor.id}
                      </span>{" "}
                      <span>{sensor.types.join(", ")}</span>{" "}
                      <span style={{ color: "var(--color-text-secondary)" }}>
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
          type="button"
          onClick={handleEmergencyStop}
          style={{
            padding: "10px 20px",
            backgroundColor: "var(--color-danger)",
            color: "var(--color-text-button)",
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
        <div style={{ padding: "10px 0", fontSize: "0.9em", color: "var(--color-text-secondary)" }}>
          <p>Gamepad haptics are automatic when a compatible controller is connected.</p>
          <p>Bluetooth devices are discovered via in-browser WebBluetooth (Chromium browsers only).</p>
          <p>The server can send haptic commands when the Client.Haptics GMCP package is active.</p>
          <p>Press Escape or use the Emergency Stop button to immediately halt all haptic output.</p>
          <p>Intensity cap: {(hapticsPreferences.intensityCap * 100).toFixed(0)}% | Auto-stop: {hapticsPreferences.autoStopTimeout}s</p>
        </div>
      </details>
    </div>
  );
};

export default HapticsStatus;
