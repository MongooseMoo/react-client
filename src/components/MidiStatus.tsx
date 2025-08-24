import React, { useEffect, useState } from "react";
import MudClient from "../client";
import { midiService } from "../MidiService";
import { usePreferences } from "../hooks/usePreferences";
import { GMCPClientMidi } from "../gmcp/Client/Midi";

interface MidiStatusProps {
  client: MudClient;
}

const MidiStatus: React.FC<MidiStatusProps> = ({ client }) => {
  const [preferences] = usePreferences();
  const [inputConnected, setInputConnected] = useState(false);
  const [outputConnected, setOutputConnected] = useState(false);
  const [midiPackage, setMidiPackage] = useState<GMCPClientMidi | null>(null);
  const [inputDevices, setInputDevices] = useState<any[]>([]);
  const [outputDevices, setOutputDevices] = useState<any[]>([]);
  const [selectedInputId, setSelectedInputId] = useState("");
  const [selectedOutputId, setSelectedOutputId] = useState("");
  const [connectedInputName, setConnectedInputName] = useState("");
  const [connectedOutputName, setConnectedOutputName] = useState("");
  
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
    if (!midiPackage || !preferences.midi.enabled) return;
    
    try {
      const inputs = await midiPackage.getInputDevices();
      const outputs = await midiPackage.getOutputDevices();
      setInputDevices(inputs);
      setOutputDevices(outputs);
    } catch (error) {
      console.error("Failed to load MIDI devices:", error);
    }
  };

  useEffect(() => {
    if (preferences.midi.enabled && midiPackage) {
      loadDevices();
    } else {
      // Clear devices and connections when disabled
      setInputDevices([]);
      setOutputDevices([]);
      setInputConnected(false);
      setOutputConnected(false);
      setConnectedInputName("");
      setConnectedOutputName("");
    }
  }, [preferences.midi.enabled, midiPackage]);
  
  
  const handleConnectInput = async () => {
    if (!midiPackage || !selectedInputId) return;
    const success = await midiPackage.connectInputDevice(selectedInputId);
    if (success) {
      setInputConnected(true);
      const device = inputDevices.find(d => d.id === selectedInputId);
      setConnectedInputName(device?.name || "Unknown Device");
    }
  };
  
  const handleDisconnectInput = () => {
    midiService.disconnect();
    setInputConnected(false);
    setConnectedInputName("");
  };
  
  const handleConnectOutput = async () => {
    if (!midiPackage || !selectedOutputId) return;
    const success = await midiPackage.connectOutputDevice(selectedOutputId);
    if (success) {
      setOutputConnected(true);
      const device = outputDevices.find(d => d.id === selectedOutputId);
      setConnectedOutputName(device?.name || "Unknown Device");
    }
  };
  
  const handleDisconnectOutput = () => {
    // Note: this doesn't fully disconnect output in MidiService, but updates our state
    setOutputConnected(false);
    setConnectedOutputName("");
  };

  const handleRefreshDevices = () => {
    loadDevices();
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
        {inputConnected ? (
          <div style={{ marginBottom: "8px" }}>
            <span style={{ color: "green" }}>{connectedInputName}</span>
            <button 
              onClick={handleDisconnectInput}
              style={{ marginLeft: "10px", padding: "2px 8px", fontSize: "0.8em" }}
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div style={{ marginBottom: "8px" }}>
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
        {outputConnected ? (
          <div style={{ marginBottom: "8px" }}>
            <span style={{ color: "green" }}>{connectedOutputName}</span>
            <button 
              onClick={handleDisconnectOutput}
              style={{ marginLeft: "10px", padding: "2px 8px", fontSize: "0.8em" }}
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div style={{ marginBottom: "8px" }}>
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