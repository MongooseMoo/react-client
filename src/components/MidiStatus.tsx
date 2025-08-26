import React, { useEffect, useState } from "react";
import MudClient from "../client";
import { midiService, MidiDevice } from "../MidiService";
import { usePreferences } from "../hooks/usePreferences";
import { GMCPClientMidi } from "../gmcp/Client/Midi";
import { preferencesStore } from "../PreferencesStore";
import { virtualMidiService } from "../VirtualMidiService";

interface MidiStatusProps {
  client: MudClient;
}

const MidiStatus: React.FC<MidiStatusProps> = ({ client }) => {
  const [preferences] = usePreferences();
  const [midiPackage, setMidiPackage] = useState<GMCPClientMidi | null>(null);
  const [inputDevices, setInputDevices] = useState<MidiDevice[]>([]);
  const [outputDevices, setOutputDevices] = useState<MidiDevice[]>([]);
  const [selectedInputId, setSelectedInputId] = useState("");
  const [selectedOutputId, setSelectedOutputId] = useState("");
  const [connectionState, setConnectionState] = useState(midiService.connectionStatus);
  const [deviceChangeEvents, setDeviceChangeEvents] = useState<Array<{
    timestamp: string;
    message: string;
    type: 'connected' | 'disconnected' | 'reconnect';
  }>>([]);
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
    const midi = client.gmcpHandlers["Client.Midi"] as GMCPClientMidi;
    if (midi) {
      setMidiPackage(midi);
    }
  }, [client]);

  // Load devices when MIDI is enabled
  const loadDevices = async () => {
    if (!preferences.midi.enabled) return;
    
    // Ensure virtual synthesizer is initialized
    if (!virtualMidiService.initialized) {
      await virtualMidiService.initialize();
    }
    
    const inputs = midiService.getInputDevices();
    const outputs = midiService.getOutputDevices();
    setInputDevices(inputs);
    setOutputDevices(outputs);
    
    // Update connection state
    setConnectionState(midiService.connectionStatus);
    
    // Check for reconnectable devices and attempt auto-reconnection
    await updateReconnectableDevices();
  };

  // Update reconnectable device suggestions and attempt auto-reconnection
  const updateReconnectableDevices = async () => {
    const prefs = preferencesStore.getState().midi;
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
              setConnectionState(midiService.connectionStatus);
              setDeviceChangeEvents(prev => [{
                timestamp: new Date().toLocaleTimeString(),
                message: `Auto-reconnected to input: ${device.name}`,
                type: 'reconnect'
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
              setConnectionState(midiService.connectionStatus);
              setDeviceChangeEvents(prev => [{
                timestamp: new Date().toLocaleTimeString(),
                message: `Auto-reconnected to output: ${device.name}`,
                type: 'reconnect'
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
    if (preferences.midi.enabled) {
      // Initialize MIDI if not already done
      if (!midiService.isInitialized && midiPackage) {
        midiPackage.ensureInitialized().then(() => {
          loadDevices();
        });
      } else {
        loadDevices();
      }
      
      // Set up connection state monitoring (poll every 2 seconds to catch auto-reconnections and virtual synth)
      const connectionStateInterval = setInterval(() => {
        loadDevices(); // Always refresh devices to catch virtual synth initialization
        
        const currentState = midiService.connectionStatus;
        if (JSON.stringify(currentState) !== JSON.stringify(connectionState)) {
          setConnectionState(currentState);
        }
      }, 2000);
      
      // Set up device change monitoring
      const unsubscribe = midiService.onDeviceChange((info) => {
        const timestamp = new Date().toLocaleTimeString();
        const events: typeof deviceChangeEvents = [];
        
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
        
        // Refresh devices and connection state
        loadDevices();
      });
      
      return () => {
        clearInterval(connectionStateInterval);
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
  }, [preferences.midi.enabled, midiService.isInitialized]);

  // Update reconnectable devices when connection state or device lists change
  useEffect(() => {
    updateReconnectableDevices();
  }, [connectionState, inputDevices, outputDevices, midiPackage]);
  
  
  const handleConnectInput = async () => {
    if (!midiPackage || !selectedInputId) return;
    const success = await midiPackage.connectInputDevice(selectedInputId);
    if (success) {
      setConnectionState(midiService.connectionStatus);
      setSelectedInputId("");
      loadDevices(); // Refresh to update reconnectable devices
    }
  };
  
  const handleDisconnectInput = () => {
    midiService.disconnectWithIntent('input');
    setConnectionState(midiService.connectionStatus);
    loadDevices(); // Refresh to update reconnectable devices
  };
  
  const handleConnectOutput = async () => {
    if (!midiPackage || !selectedOutputId) return;
    const success = await midiPackage.connectOutputDevice(selectedOutputId);
    if (success) {
      setConnectionState(midiService.connectionStatus);
      setSelectedOutputId("");
      loadDevices(); // Refresh to update reconnectable devices
    }
  };
  
  const handleDisconnectOutput = () => {
    midiService.disconnectWithIntent('output');
    setConnectionState(midiService.connectionStatus);
    loadDevices(); // Refresh to update reconnectable devices
  };

  const handleRefreshDevices = async () => {
    // Refresh JZZ device list
    midiService.refresh();
    
    // Make sure virtual synthesizer is initialized
    if (!virtualMidiService.initialized) {
      await virtualMidiService.initialize();
    }
    
    // Load devices and update connection state
    loadDevices();
    setConnectionState(midiService.connectionStatus);
    
  };

  // Handle reconnection attempts
  const handleReconnectInput = async () => {
    if (!reconnectableDevices.input || !midiPackage) return;
    const success = await midiService.attemptReconnect(reconnectableDevices.input.id, 'input');
    if (success) {
      setConnectionState(midiService.connectionStatus);
      loadDevices();
      setDeviceChangeEvents(prev => [{
        timestamp: new Date().toLocaleTimeString(),
        message: `Reconnected to input: ${reconnectableDevices.input!.name}`,
        type: 'reconnect'
      }, ...prev].slice(0, 10));
    }
  };

  const handleReconnectOutput = async () => {
    if (!reconnectableDevices.output || !midiPackage) return;
    const success = await midiService.attemptReconnect(reconnectableDevices.output.id, 'output');
    if (success) {
      setConnectionState(midiService.connectionStatus);
      loadDevices();
      setDeviceChangeEvents(prev => [{
        timestamp: new Date().toLocaleTimeString(),
        message: `Reconnected to output: ${reconnectableDevices.output!.name}`,
        type: 'reconnect'
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

  // Helper function to get note number from name
  const getNoteNumberFromName = (noteName: string): number => {
    const noteMap: { [key: string]: number } = {
      'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
      'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
    };
    
    const match = noteName.match(/^([A-G]#?)(-?\d+)$/);
    if (!match) return 60; // Default to middle C
    
    const [, note, octave] = match;
    return (parseInt(octave) + 1) * 12 + noteMap[note];
  };

  if (!preferences.midi.enabled) {
    return (
      <div style={{ padding: "10px" }}>
        <p>MIDI is disabled. Enable it in preferences to use MIDI features.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "10px" }}>
      <h3>MIDI Status</h3>
      
      <div style={{ marginBottom: "15px" }}>
        <div style={{ marginBottom: "8px" }}>
          <strong>Input Device:</strong>
        </div>
        {connectionState.inputConnected ? (
          <div style={{ marginBottom: "8px" }}>
            <span style={{ color: "green" }}>✓ {connectionState.inputDeviceName}</span>
            <button 
              onClick={handleDisconnectInput}
              style={{ marginLeft: "10px", padding: "2px 8px", fontSize: "0.8em" }}
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div style={{ marginBottom: "8px" }}>
            {/* Show reconnection option if available */}
            {reconnectableDevices.input && (
              <div style={{ marginBottom: "8px", padding: "8px", backgroundColor: "#e3f2fd", border: "1px solid #2196F3", borderRadius: "4px" }}>
                <div style={{ fontSize: "0.9em", marginBottom: "5px" }}>
                  <span style={{ color: "#1976D2" }}>🔄 Last used device available:</span>
                </div>
                <div>
                  <span>{reconnectableDevices.input.name}</span>
                  <button 
                    onClick={handleReconnectInput}
                    style={{ 
                      marginLeft: "10px", 
                      padding: "2px 8px", 
                      fontSize: "0.8em", 
                      backgroundColor: "#2196F3", 
                      color: "white", 
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
              <span style={{ color: "#666", fontSize: "0.9em" }}>No input devices found</span>
            ) : (
              <>
                <select
                  value={selectedInputId}
                  onChange={(e) => setSelectedInputId(e.target.value)}
                  style={{ marginRight: "10px" }}
                >
                  <option value="">Select input device...</option>
                  {inputDevices.map((device) => (
                    <option key={device.id} value={device.id}>
                      {device.name}
                    </option>
                  ))}
                </select>
                <button 
                  onClick={handleConnectInput}
                  disabled={!selectedInputId}
                  style={{ padding: "2px 8px", fontSize: "0.8em", marginRight: "5px" }}
                >
                  Connect
                </button>
              </>
            )}
          </div>
        )}
      </div>
      
      <div style={{ marginBottom: "15px" }}>
        <div style={{ marginBottom: "8px" }}>
          <strong>Output Device:</strong>
        </div>
        {connectionState.outputConnected ? (
          <div style={{ marginBottom: "8px" }}>
            <span style={{ color: "green" }}>✓ {connectionState.outputDeviceName}</span>
            <button 
              onClick={handleDisconnectOutput}
              style={{ marginLeft: "10px", padding: "2px 8px", fontSize: "0.8em" }}
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div style={{ marginBottom: "8px" }}>
            {/* Show reconnection option if available */}
            {reconnectableDevices.output && (
              <div style={{ marginBottom: "8px", padding: "8px", backgroundColor: "#e8f5e8", border: "1px solid #4CAF50", borderRadius: "4px" }}>
                <div style={{ fontSize: "0.9em", marginBottom: "5px" }}>
                  <span style={{ color: "#2E7D32" }}>🔄 Last used device available:</span>
                </div>
                <div>
                  <span>{reconnectableDevices.output.name}</span>
                  <button 
                    onClick={handleReconnectOutput}
                    style={{ 
                      marginLeft: "10px", 
                      padding: "2px 8px", 
                      fontSize: "0.8em", 
                      backgroundColor: "#4CAF50", 
                      color: "white", 
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
              <span style={{ color: "#666", fontSize: "0.9em" }}>No output devices found</span>
            ) : (
              <>
                <select
                  value={selectedOutputId}
                  onChange={(e) => setSelectedOutputId(e.target.value)}
                  style={{ marginRight: "10px" }}
                >
                  <option value="">Select output device...</option>
                  {outputDevices.map((device) => (
                    <option key={device.id} value={device.id}>
                      {device.name}
                    </option>
                  ))}
                </select>
                <button 
                  onClick={handleConnectOutput}
                  disabled={!selectedOutputId}
                  style={{ padding: "2px 8px", fontSize: "0.8em", marginRight: "5px" }}
                >
                  Connect
                </button>
              </>
            )}
          </div>
        )}
      </div>
      
      <div style={{ marginBottom: "15px" }}>
        <button 
          onClick={handleRefreshDevices}
          style={{ padding: "4px 12px", fontSize: "0.8em" }}
        >
          Refresh Devices
        </button>
      </div>
      
      <div style={{ marginBottom: "15px" }}>
        <button onClick={handleAllNotesOff}>
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
                onChange={(e) => setSelectedNote(parseInt(e.target.value))}
                style={{ width: "60px", marginRight: "10px" }}
              />
              <span style={{ fontSize: "0.9em", color: "#666" }}>
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
                onChange={(e) => setSelectedVelocity(parseInt(e.target.value))}
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
                onChange={(e) => setSelectedChannel(parseInt(e.target.value))}
                style={{ marginRight: "10px" }}
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
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  style={{ width: "80px", marginRight: "10px" }}
                />
                <span style={{ fontSize: "0.9em", color: "#666" }}>ms</span>
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
              onClick={handleSendNote}
              style={{ 
                padding: "8px 16px", 
                backgroundColor: useDuration ? "#2196F3" : (noteOn ? "#4CAF50" : "#f44336"),
                color: "white",
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
              backgroundColor: "#f9f9f9",
              padding: "10px",
              border: "1px solid #ddd",
              marginBottom: "15px"
            }}>
              {deviceChangeEvents.map((event, index) => (
                <div key={index} style={{ 
                  marginBottom: "5px", 
                  paddingBottom: "5px", 
                  borderBottom: index < deviceChangeEvents.length - 1 ? "1px solid #eee" : "none",
                  color: event.type === 'connected' ? '#2E7D32' : event.type === 'disconnected' ? '#D32F2F' : '#1976D2'
                }}>
                  <span style={{ color: "#666" }}>{event.timestamp}</span> - {event.message}
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
            backgroundColor: "#f5f5f5",
            padding: "10px",
            border: "1px solid #ddd",
            marginBottom: "15px"
          }}>
            {midiHistory.length === 0 ? (
              <div style={{ color: "#999" }}>No MIDI messages received yet</div>
            ) : (
              midiHistory.map((entry, index) => (
                <div key={index} style={{ marginBottom: "8px", paddingBottom: "8px", borderBottom: index < midiHistory.length - 1 ? "1px solid #ddd" : "none" }}>
                  <div><strong>MIDI:</strong> {entry.hex} ({entry.type}) <span style={{ color: "#666", fontSize: "0.9em" }}>{entry.timestamp}</span></div>
                  <div><strong>GMCP:</strong> {entry.gmcp}</div>
                </div>
              ))
            )}
            <div style={{ marginTop: "10px", color: "#666", fontSize: "0.9em", borderTop: "1px solid #ddd", paddingTop: "5px" }}>
              Showing last 15 messages • Active Sensing (0xFE) suppressed
            </div>
          </div>
        </div>
      </details>
      
      
      <details>
        <summary><strong>Usage</strong></summary>
        <div style={{ padding: "10px 0", fontSize: "0.9em", color: "#666" }}>
          <p>• Press keys on your MIDI keyboard to send notes to the server</p>
          <p>• Server can send notes back to play on your MIDI device</p>
          <p>• Use manual controls above to test server communication</p>
          <p>• <strong>Duration Mode:</strong> Send Note On with auto Note Off after specified time</p>
          <p>• <strong>Manual Mode:</strong> Send explicit Note On/Off messages</p>
          <p>• Press Escape to stop all sounds and MIDI notes</p>
          <p>• MIDI notes: 0-127 (60 = Middle C, 69 = A4-440Hz)</p>
        </div>
      </details>
    </div>
  );
};

export default MidiStatus;