import type React from "react";
import { useEffect, useId, useRef, useState } from "react";
import { useFocusRefuge } from './FileTransfer/useFocusRefuge';
import type MudClient from "../client";
import { midiService, type MidiDevice } from "../MidiService";
import { usePreferences } from "../stores/preferencesStore";
import type { GMCPClientMidi } from "../gmcp/Client/Midi";
import { virtualMidiService } from "../VirtualMidiService";

interface MidiStatusProps {
  client: MudClient;
}

type DeviceChangeEventType = 'connected' | 'disconnected' | 'reconnect';

interface DeviceChangeEvent {
  timestamp: string;
  message: string;
  type: DeviceChangeEventType;
}

type MidiConnectionState = typeof midiService.connectionStatus;

// Shallow field-by-field compare, avoiding JSON.stringify allocations.
function connectionStatesEqual(a: MidiConnectionState, b: MidiConnectionState): boolean {
  return (
    a.inputConnected === b.inputConnected &&
    a.outputConnected === b.outputConnected &&
    a.inputDeviceId === b.inputDeviceId &&
    a.outputDeviceId === b.outputDeviceId &&
    a.inputDeviceName === b.inputDeviceName &&
    a.outputDeviceName === b.outputDeviceName
  );
}

const MidiStatus: React.FC<MidiStatusProps> = ({ client }) => {
  const inputId = useId();
  const outputId = useId();
  const inputGroup = useRef<HTMLDivElement>(null);
  const outputGroup = useRef<HTMLDivElement>(null);
  const inputAction = useRef<HTMLButtonElement>(null);
  const outputAction = useRef<HTMLButtonElement>(null);
  useFocusRefuge(inputGroup, inputAction);
  useFocusRefuge(outputGroup, outputAction);
  const [outcome, setOutcome] = useState('');
  const operation = async (label: string, action: () => Promise<boolean>) => {
    setOutcome('');
    try {
      const success = await action();
      setOutcome(success ? label : `${label.split(' ')[0]} device could not connect. Try another device or refresh devices.`);
      return success;
    } catch {
      setOutcome(`${label.split(' ')[0]} device could not connect. Try another device or refresh devices.`);
      return false;
    }
  };
  const midiPreferences = usePreferences((state) => state.midi);
  const [midiPackage, setMidiPackage] = useState<GMCPClientMidi | null>(null);
  const [inputDevices, setInputDevices] = useState<MidiDevice[]>([]);
  const [outputDevices, setOutputDevices] = useState<MidiDevice[]>([]);
  const [selectedInputId, setSelectedInputId] = useState("");
  const [selectedOutputId, setSelectedOutputId] = useState("");
  const [connectionState, setConnectionState] = useState(midiService.connectionStatus);
  const [deviceChangeEvents, setDeviceChangeEvents] = useState<DeviceChangeEvent[]>([]);
  const [reconnectableDevices, setReconnectableDevices] = useState<{
    input?: { id: string, name: string };
    output?: { id: string, name: string };
  }>({});
  
  // Manual note controls
  const [selectedNote, setSelectedNote] = useState(60); // Middle C
  const [selectedVelocity, setSelectedVelocity] = useState(64); // Medium velocity
  const [noteOn, setNoteOn] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState(0);
  const [useDuration, setUseDuration] = useState(false);
  const [duration, setDuration] = useState(1000); // 1 second default
  
  // Debug display state - keep history of last 5 messages
  const [midiHistory, setMidiHistory] = useState<Array<{
    hex: string;
    type: string;
    gmcp: string;
    timestamp: string;
  }>>([]);

  useEffect(() => {
    // Get MIDI package reference
    const midi = client.gmcp.handlers["Client.Midi"];
    if (midi) {
      setMidiPackage(midi);
    }
  }, [client]);

  // Refresh connection state from midiService, only triggering a re-render
  // when a field actually changed (avoids stale-closure issues by always
  // comparing against the latest state via the functional setState form).
  const refreshConnectionState = () => {
    setConnectionState(prev => {
      const next = midiService.connectionStatus;
      return connectionStatesEqual(prev, next) ? prev : next;
    });
  };

  // Load devices when MIDI is enabled
  const loadDevices = async () => {
    if (!midiPreferences.enabled) return;

    // Ensure virtual synthesizer is initialized
    if (!virtualMidiService.initialized) {
      await virtualMidiService.initialize();
    }

    const inputs = midiService.getInputDevices();
    const outputs = midiService.getOutputDevices();
    setInputDevices(inputs);
    setOutputDevices(outputs);

    // Update connection state
    refreshConnectionState();

    // Check for reconnectable devices and attempt auto-reconnection
    await updateReconnectableDevices();
  };

  // Update reconnectable device suggestions and attempt auto-reconnection
  const updateReconnectableDevices = async () => {
    const prefs = usePreferences.getState().midi;
    const intentionalFlags = midiService.intentionalDisconnectStatus;
    const newReconnectables: { input?: { id: string, name: string }; output?: { id: string, name: string } } = {};
    
    
    // Check if last input device is available but not connected
    if (prefs.lastInputDeviceId && !connectionState.inputConnected) {
      const device = inputDevices.find(d => d.id === prefs.lastInputDeviceId);
      
      if (device && midiService.canReconnectToDevice(prefs.lastInputDeviceId, 'input')) {
        newReconnectables.input = device;
        
        // Only auto-reconnect if not intentionally disconnected
        if (midiPackage && !intentionalFlags.input) {
          try {
            const success = await midiPackage.connectInputDevice(prefs.lastInputDeviceId);
            if (success) {
              refreshConnectionState();
              setDeviceChangeEvents(prev => [{
                timestamp: new Date().toLocaleTimeString(),
                message: `Auto-reconnected to input: ${device.name}`,
                type: 'reconnect' as const
              }, ...prev].slice(0, 10));
              return; // Don't show reconnectable if we successfully reconnected
            }
          } catch (error) {
            console.error('Error during input auto-reconnection:', error);
          }
        } else if (intentionalFlags.input) {
          console.log(`Skipping input auto-reconnect due to intentional disconnect`);
        }
      }
    }
    
    // Check if last output device is available but not connected  
    if (prefs.lastOutputDeviceId && !connectionState.outputConnected) {
      const device = outputDevices.find(d => d.id === prefs.lastOutputDeviceId);
      
      if (device && midiService.canReconnectToDevice(prefs.lastOutputDeviceId, 'output')) {
        newReconnectables.output = device;
        
        // Only auto-reconnect if not intentionally disconnected
        if (midiPackage && !intentionalFlags.output) {
          try {
            const success = await midiPackage.connectOutputDevice(prefs.lastOutputDeviceId);
            if (success) {
              refreshConnectionState();
              setDeviceChangeEvents(prev => [{
                timestamp: new Date().toLocaleTimeString(),
                message: `Auto-reconnected to output: ${device.name}`,
                type: 'reconnect' as const
              }, ...prev].slice(0, 10));
              return; // Don't show reconnectable if we successfully reconnected
            }
          } catch (error) {
            console.error('Error during output auto-reconnection:', error);
          }
        } else if (intentionalFlags.output) {
          console.log(`Skipping output auto-reconnect due to intentional disconnect`);
        }
      }
    }
    
    setReconnectableDevices(newReconnectables);
  };

  useEffect(() => {
    if (midiPreferences.enabled) {
      // Initialize MIDI if not already done
      if (!midiService.isInitialized && midiPackage) {
        midiPackage.ensureInitialized().then(() => {
          loadDevices();
        });
      } else {
        loadDevices();
      }
      
      // Set up device change monitoring
      const unsubscribe = midiService.onDeviceChange((info) => {
        const timestamp = new Date().toLocaleTimeString();
        const events: DeviceChangeEvent[] = [];
        
        // Log device additions
        info.inputs.added.forEach(device => {
          events.push({
            timestamp,
            message: `Input device connected: ${device.name}`,
            type: 'connected'
          });
        });
        
        info.outputs.added.forEach(device => {
          events.push({
            timestamp,
            message: `Output device connected: ${device.name}`,
            type: 'connected'
          });
        });
        
        // Log device removals
        info.inputs.removed.forEach(device => {
          events.push({
            timestamp,
            message: `Input device disconnected: ${device.name}`,
            type: 'disconnected'
          });
        });
        
        info.outputs.removed.forEach(device => {
          events.push({
            timestamp,
            message: `Output device disconnected: ${device.name}`,
            type: 'disconnected'
          });
        });
        
        if (events.length > 0) {
          setDeviceChangeEvents(prev => [...events, ...prev].slice(0, 10)); // Keep last 10 events
        }

        // Refresh connection state right away (e.g. auto-reconnect status),
        // then refresh devices and reconnectable-device suggestions.
        refreshConnectionState();
        loadDevices();
      });

      return () => {
        unsubscribe();
      };
    } else {
      // Clear devices and connections when disabled
      setInputDevices([]);
      setOutputDevices([]);
      setConnectionState({
        inputConnected: false,
        outputConnected: false
      });
      setReconnectableDevices({});
    }
  }, [midiPreferences.enabled, midiService.isInitialized]);

  // Update reconnectable devices when connection state or device lists change
  useEffect(() => {
    updateReconnectableDevices();
  }, [connectionState, inputDevices, outputDevices, midiPackage]);
  
  
  const handleConnectInput = async () => {
    if (!midiPackage || !selectedInputId) return;
    const success = await operation('Input device connected.', () => midiPackage.connectInputDevice(selectedInputId));
    if (success) {
      refreshConnectionState();
      loadDevices(); // Refresh to update reconnectable devices
    }
  };
  
  const handleDisconnectInput = () => {
    midiService.disconnectWithIntent('input');
    setOutcome('Input device disconnected.');
    refreshConnectionState();
    loadDevices(); // Refresh to update reconnectable devices
  };
  
  const handleConnectOutput = async () => {
    if (!midiPackage || !selectedOutputId) return;
    const success = await operation('Output device connected.', () => midiPackage.connectOutputDevice(selectedOutputId));
    if (success) {
      refreshConnectionState();
      loadDevices(); // Refresh to update reconnectable devices
    }
  };
  
  const handleDisconnectOutput = () => {
    midiService.disconnectWithIntent('output');
    setOutcome('Output device disconnected.');
    refreshConnectionState();
    loadDevices(); // Refresh to update reconnectable devices
  };

  const handleRefreshDevices = async () => {
    setOutcome('');
    try {
    // Refresh hardware device list
    midiService.refresh();
    
    // Make sure virtual synthesizer is initialized
    if (!virtualMidiService.initialized) {
      await virtualMidiService.initialize();
    }
    
    // Load devices and update connection state
    await loadDevices();
    refreshConnectionState();
    setOutcome('Devices refreshed.');
    } catch {
      setOutcome('Could not refresh devices. Check device access and try again.');
    }
    
  };

  // Handle reconnection attempts
  const handleReconnectInput = async () => {
    if (!reconnectableDevices.input || !midiPackage) return;
    const success = await operation('Input device reconnected.', () => midiService.attemptReconnect(reconnectableDevices.input!.id, 'input'));
    if (success) {
      refreshConnectionState();
      loadDevices();
      setDeviceChangeEvents(prev => [{
        timestamp: new Date().toLocaleTimeString(),
        message: `Reconnected to input: ${reconnectableDevices.input!.name}`,
        type: 'reconnect' as const
      }, ...prev].slice(0, 10));
    }
  };

  const handleReconnectOutput = async () => {
    if (!reconnectableDevices.output || !midiPackage) return;
    const success = await operation('Output device reconnected.', () => midiService.attemptReconnect(reconnectableDevices.output!.id, 'output'));
    if (success) {
      refreshConnectionState();
      loadDevices();
      setDeviceChangeEvents(prev => [{
        timestamp: new Date().toLocaleTimeString(),
        message: `Reconnected to output: ${reconnectableDevices.output!.name}`,
        type: 'reconnect' as const
      }, ...prev].slice(0, 10));
    }
  };
  
  // Set up debug callback for MIDI input monitoring
  useEffect(() => {
    if (!midiPackage) return;
    
    // Set debug callback to capture MIDI input and GMCP output
    midiPackage.setDebugCallback((hex: string, type: string, gmcpMessage: string) => {
      const timestamp = new Date().toLocaleTimeString();
      const newEntry = { hex, type, gmcp: gmcpMessage, timestamp };
      
      setMidiHistory(prev => {
        const updated = [newEntry, ...prev];
        // Keep only last 15 entries
        return updated.slice(0, 15);
      });
    });
    
    return () => {
      // Clean up callback on unmount
      midiPackage.setDebugCallback(() => {});
    };
  }, [midiPackage]);


  const handleAllNotesOff = () => {
    if (midiPackage) {
      midiPackage.sendAllNotesOff();
      setOutcome('All notes stopped.');
    }
  };

  const handleSendNote = () => {
    if (!midiPackage) return;
    
    // Send note to server with proper duration handling
    const noteDuration = useDuration && noteOn ? duration : undefined;
    
    midiPackage.sendManualNote(
      selectedNote,
      selectedVelocity,
      noteOn,
      selectedChannel,
      noteDuration
    );
  };

  // Helper function to get note name from MIDI number
  const getNoteNameFromNumber = (noteNumber: number): string => {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(noteNumber / 12) - 1;
    const noteName = noteNames[noteNumber % 12];
    return `${noteName}${octave}`;
  };

  if (!midiPreferences.enabled) {
    return (
      <div style={{ padding: "10px", color: "var(--color-text)", overflowWrap: "anywhere" }}>
        <p>MIDI is disabled. Enable it in preferences to use MIDI features.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "10px", color: "var(--color-text)", overflowWrap: "anywhere" }}>
      <h3>MIDI Status</h3>
      <p role="status">{outcome}</p>
      
      <div ref={inputGroup} style={{ marginBottom: "15px" }}>
        <div style={{ marginBottom: "8px" }}>
          <label htmlFor={inputId}>Input device</label>
        </div>
        {connectionState.inputConnected ? (
          <div style={{ marginBottom: "8px" }}>
            <span style={{ color: "var(--color-success)" }}>✓ {connectionState.inputDeviceName}</span>
          </div>
        ) : (
          <div style={{ marginBottom: "8px" }}>
            {/* Show reconnection option if available */}
            {reconnectableDevices.input && (
              <div style={{ marginBottom: "8px", padding: "8px", backgroundColor: "var(--color-info-subtle)", border: "1px solid var(--color-info)", borderRadius: "4px" }}>
                <div style={{ fontSize: "0.9em", marginBottom: "5px" }}>
                  <span style={{ color: "var(--color-info)" }}>🔄 Last used device available:</span>
                </div>
                <div>
                  <span>{reconnectableDevices.input.name}</span>
                  <button
                    type="button"
                    aria-label="Reconnect input device"
                    onClick={handleReconnectInput}
                    style={{ 
                      marginLeft: "10px", 
                      padding: "2px 8px", 
                      fontSize: "0.8em", 
                      backgroundColor: "var(--color-info)", 
                      color: "var(--color-text-button)", 
                      border: "none", 
                      borderRadius: "2px",
                      cursor: "pointer"
                    }}
                  >
                    Reconnect
                  </button>
                </div>
              </div>
            )}
            
            {inputDevices.length === 0 ? (
              <span style={{ color: "var(--color-text-secondary)", fontSize: "0.9em" }}>No input devices found</span>
            ) : (
              <>
                <select
                  id={inputId}
                  value={selectedInputId}
                  onChange={(e) => setSelectedInputId(e.target.value)}
                  style={{ marginRight: "10px", maxWidth: "100%" }}
                >
                  <option value="">Select input device...</option>
                  {inputDevices.map((device) => (
                    <option key={device.id} value={device.id}>
                      {device.name}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
        )}
        <button
          ref={inputAction}
          type="button"
          aria-label={connectionState.inputConnected ? 'Disconnect input device' : 'Connect input device'}
          onClick={connectionState.inputConnected ? handleDisconnectInput : handleConnectInput}
          disabled={!connectionState.inputConnected && !selectedInputId}
        >
          {connectionState.inputConnected ? 'Disconnect' : 'Connect'}
        </button>
      </div>
      
      <div ref={outputGroup} style={{ marginBottom: "15px" }}>
        <div style={{ marginBottom: "8px" }}>
          <label htmlFor={outputId}>Output device</label>
        </div>
        {connectionState.outputConnected ? (
          <div style={{ marginBottom: "8px" }}>
            <span style={{ color: "var(--color-success)" }}>✓ {connectionState.outputDeviceName}</span>
          </div>
        ) : (
          <div style={{ marginBottom: "8px" }}>
            {/* Show reconnection option if available */}
            {reconnectableDevices.output && (
              <div style={{ marginBottom: "8px", padding: "8px", backgroundColor: "var(--color-success-subtle)", border: "1px solid var(--color-success)", borderRadius: "4px" }}>
                <div style={{ fontSize: "0.9em", marginBottom: "5px" }}>
                  <span style={{ color: "var(--color-success)" }}>🔄 Last used device available:</span>
                </div>
                <div>
                  <span>{reconnectableDevices.output.name}</span>
                  <button
                    type="button"
                    aria-label="Reconnect output device"
                    onClick={handleReconnectOutput}
                    style={{ 
                      marginLeft: "10px", 
                      padding: "2px 8px", 
                      fontSize: "0.8em", 
                      backgroundColor: "var(--color-success)", 
                      color: "var(--color-text-button)", 
                      border: "none", 
                      borderRadius: "2px",
                      cursor: "pointer"
                    }}
                  >
                    Reconnect
                  </button>
                </div>
              </div>
            )}
            
            {outputDevices.length === 0 ? (
              <span style={{ color: "var(--color-text-secondary)", fontSize: "0.9em" }}>No output devices found</span>
            ) : (
              <>
                <select
                  id={outputId}
                  value={selectedOutputId}
                  onChange={(e) => setSelectedOutputId(e.target.value)}
                  style={{ marginRight: "10px", maxWidth: "100%" }}
                >
                  <option value="">Select output device...</option>
                  {outputDevices.map((device) => (
                    <option key={device.id} value={device.id}>
                      {device.name}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
        )}
        <button
          ref={outputAction}
          type="button"
          aria-label={connectionState.outputConnected ? 'Disconnect output device' : 'Connect output device'}
          onClick={connectionState.outputConnected ? handleDisconnectOutput : handleConnectOutput}
          disabled={!connectionState.outputConnected && !selectedOutputId}
        >
          {connectionState.outputConnected ? 'Disconnect' : 'Connect'}
        </button>
      </div>
      
      <div style={{ marginBottom: "15px" }}>
        <button
          type="button"
          onClick={handleRefreshDevices}
          style={{ padding: "4px 12px", fontSize: "0.8em" }}
        >
          Refresh Devices
        </button>
      </div>
      
      <div style={{ marginBottom: "15px" }}>
        <button type="button" onClick={handleAllNotesOff}>
          All Notes Off
        </button>
      </div>


      <details>
        <summary><strong>Manual Note Controls</strong></summary>
        <div style={{ padding: "10px 0" }}>
          <div style={{ marginBottom: "10px" }}>
            <label>
              <strong>Note:</strong>{" "}
              <input
                type="number"
                min="0"
                max="127"
                value={selectedNote}
                onChange={(e) => setSelectedNote(parseInt(e.target.value, 10))}
                style={{ width: "60px", marginRight: "10px" }}
              />
              <span style={{ fontSize: "0.9em", color: "var(--color-text-secondary)" }}>
                ({getNoteNameFromNumber(selectedNote)})
              </span>
            </label>
          </div>
          
          <div style={{ marginBottom: "10px" }}>
            <label>
              <strong>Velocity:</strong>{" "}
              <input
                type="range"
                min="1"
                max="127"
                value={selectedVelocity}
                onChange={(e) => setSelectedVelocity(parseInt(e.target.value, 10))}
                style={{ width: "100px", marginRight: "10px" }}
              />
              <span style={{ fontSize: "0.9em" }}>{selectedVelocity}</span>
            </label>
          </div>
          
          <div style={{ marginBottom: "10px" }}>
            <label>
              <strong>Channel:</strong>{" "}
              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(parseInt(e.target.value, 10))}
                style={{ marginRight: "10px", maxWidth: "100%" }}
              >
                {Array.from({ length: 16 }, (_, i) => (
                  <option key={i} value={i}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </label>
          </div>
          
          <div style={{ marginBottom: "10px" }}>
            <label>
              <input
                type="checkbox"
                checked={useDuration}
                onChange={(e) => setUseDuration(e.target.checked)}
                style={{ marginRight: "8px" }}
              />
              <strong>Use Duration</strong> (auto Note Off)
            </label>
          </div>

          {useDuration ? (
            <div style={{ marginBottom: "10px" }}>
              <label>
                <strong>Duration:</strong>{" "}
                <input
                  type="number"
                  min="100"
                  max="10000"
                  step="100"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                  style={{ width: "80px", marginRight: "10px" }}
                />
                <span style={{ fontSize: "0.9em", color: "var(--color-text-secondary)" }}>ms</span>
              </label>
            </div>
          ) : (
            <div style={{ marginBottom: "10px" }}>
              <label>
                <input
                  type="checkbox"
                  checked={noteOn}
                  onChange={(e) => setNoteOn(e.target.checked)}
                  style={{ marginRight: "8px" }}
                />
                <strong>Note On</strong> (unchecked = Note Off)
              </label>
            </div>
          )}
          
          <div style={{ marginBottom: "15px" }}>
            <button
              type="button"
              onClick={handleSendNote}
              style={{ 
                padding: "8px 16px", 
                backgroundColor: useDuration ? "var(--color-info)" : (noteOn ? "var(--color-success)" : "var(--color-danger)"),
                color: "var(--color-text-button)",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              {useDuration 
                ? `Send Note (${duration}ms duration)` 
                : `Send ${noteOn ? "Note On" : "Note Off"} to Server`
              }
            </button>
          </div>
        </div>
      </details>

      
      {deviceChangeEvents.length > 0 && (
        <details>
          <summary><strong>Device Connection Events</strong></summary>
          <div style={{ padding: "10px 0" }}>
            <div style={{
              maxHeight: "200px",
              overflow: "auto",
              fontFamily: "monospace",
              fontSize: "0.8em",
              backgroundColor: "var(--color-bg-surface)",
              padding: "10px",
              border: "1px solid var(--color-border)",
              marginBottom: "15px"
            }}>
              {deviceChangeEvents.map((event, index) => (
                <div key={index} style={{ 
                  marginBottom: "5px", 
                  paddingBottom: "5px", 
                  borderBottom: index < deviceChangeEvents.length - 1 ? "1px solid var(--color-border)" : "none",
                  color: event.type === 'connected' ? 'var(--color-success)' : event.type === 'disconnected' ? 'var(--color-danger)' : 'var(--color-info)'
                }}>
                  <span style={{ color: "var(--color-text-secondary)" }}>{event.timestamp}</span> - {event.message}
                </div>
              ))}
            </div>
          </div>
        </details>
      )}

      <details>
        <summary><strong>MIDI Debug Monitor</strong></summary>
        <div style={{ padding: "10px 0" }}>
          <div style={{
            maxHeight: "300px",
            overflow: "auto",
            fontFamily: "monospace",
            fontSize: "0.8em",
            backgroundColor: "var(--color-bg-surface)",
            padding: "10px",
            border: "1px solid var(--color-border)",
            marginBottom: "15px"
          }}>
            {midiHistory.length === 0 ? (
              <div style={{ color: "var(--color-text-secondary)" }}>No MIDI messages received yet</div>
            ) : (
              midiHistory.map((entry, index) => (
                <div key={index} style={{ marginBottom: "8px", paddingBottom: "8px", borderBottom: index < midiHistory.length - 1 ? "1px solid var(--color-border)" : "none" }}>
                  <div><strong>MIDI:</strong> {entry.hex} ({entry.type}) <span style={{ color: "var(--color-text-secondary)", fontSize: "0.9em" }}>{entry.timestamp}</span></div>
                  <div><strong>GMCP:</strong> {entry.gmcp}</div>
                </div>
              ))
            )}
            <div style={{ marginTop: "10px", color: "var(--color-text-secondary)", fontSize: "0.9em", borderTop: "1px solid var(--color-border)", paddingTop: "5px" }}>
              Showing last 15 messages • Active Sensing (0xFE) suppressed
            </div>
          </div>
        </div>
      </details>
      
      
      <details>
        <summary><strong>Usage</strong></summary>
        <div style={{ padding: "10px 0", fontSize: "0.9em", color: "var(--color-text-secondary)" }}>
          <p>• Press keys on your MIDI keyboard to send notes to the server</p>
          <p>• Server can send notes back to play on your MIDI device</p>
          <p>• Use manual controls above to test server communication</p>
          <p>• <strong>Duration Mode:</strong> Send Note On with auto Note Off after specified time</p>
          <p>• <strong>Manual Mode:</strong> Send explicit Note On/Off messages</p>
          <p>• Escape pauses client audio. Use Resume sounds in the toolbar to continue.</p>
          <p>• MIDI notes: 0-127 (60 = Middle C, 69 = A4-440Hz)</p>
        </div>
      </details>
    </div>
  );
};

export default MidiStatus;
