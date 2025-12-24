# MIDI System Documentation

The Mongoose React Client includes a comprehensive MIDI system that enables real-time MIDI input/output, synthesizer engines, and seamless integration with the MUD's GMCP (Generic MUD Communication Protocol) MIDI features.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [MIDI Service](#midi-service)
- [User Interface Components](#user-interface-components)
- [Synthesizer Libraries](#synthesizer-libraries)
- [GMCP MIDI Integration](#gmcp-midi-integration)
- [Configuration and Preferences](#configuration-and-preferences)
- [Usage Examples](#usage-examples)
- [Troubleshooting](#troubleshooting)

## Architecture Overview

The MIDI system is built around several key components:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   MIDI Devices  │────│   MidiService    │────│  Synthesizers   │
│  (Hardware/     │    │ (Core Engine)    │    │ (JZZ/MIDI.js)   │
│   Virtual)      │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌────────────────────┐          │
         └──────────────│   GMCP MIDI        │──────────┘
                        │   Integration      │
                        └────────────────────┘
                                 │
                        ┌────────────────────┐
                        │   UI Components    │
                        │ (Preferences/      │
                        │  Status/Sidebar)   │
                        └────────────────────┘
```

## MIDI Service

### Core Architecture (`src/MidiService.ts`)

The `MidiService` class is the central hub for all MIDI functionality:

#### Key Features:
- **Device Management**: Automatic discovery and connection to MIDI input/output devices
- **Multiple Synthesizers**: Supports JZZ Tiny and MIDI.js engines
- **Auto-reconnection**: Remembers and reconnects to previously used devices
- **Message Processing**: Real-time MIDI message parsing and routing
- **Event System**: Observable device changes and connection status

#### Synthesizer Integration:

```typescript
// Virtual synthesizers are initialized during service startup
async initializeVirtualSynths() {
  // 1. JZZ Tiny Synthesizer (Basic built-in synthesis)
  Tiny(JZZ);
  JZZ.synth.Tiny.register('JZZ Tiny Synthesizer');

  // 2. MIDI.js Synthesizer (Soundfont-based, configurable)
  await this.initializeMIDIjsSynthesizer();
}
```

#### Device State Management:

```typescript
interface ConnectionState {
  inputConnected: boolean;
  outputConnected: boolean;
  inputDeviceId?: string;
  outputDeviceId?: string;
  inputDeviceName?: string;
  outputDeviceName?: string;
}
```

## User Interface Components

### 1. MIDI Tab in Preferences (`src/components/preferences.tsx`)

**Location**: Settings → MIDI Tab

**Features**:
- Enable/disable MIDI functionality
- **MIDI.js Soundfont Selection**:
  - FatBoy (Warm, analog-style sounds)
  - FluidR3 GM (General MIDI standard)
  - MusyngKite (High-quality, default selection)
- Real-time synthesizer reloading when preferences change

**Code Structure**:
```typescript
const MidiTab: React.FC = () => {
  const handleMidiJsSoundfontChange = async (e) => {
    // Updates preferences and reloads MIDI.js synthesizer
    await midiService.reloadSynthesizers();
  };
};
```

### 2. MIDI Tab in Sidebar

**Location**: Sidebar → MIDI Tab (when connected to server)

**Features**:
- **Input Device Selection**: Choose MIDI keyboard/controller
- **Output Device Selection**: Choose destination synthesizer
- **Connection Status**: Real-time connection indicators
- **Device Management**: Connect/disconnect controls
- **Auto-reconnection**: Attempts to reconnect to last used devices

**Components**:
- Device dropdown lists (input/output)
- Connection status indicators
- Manual connect/disconnect buttons
- Device change notifications

### 3. MIDI Status Component (`src/components/MidiStatus.tsx`)

**Purpose**: Provides real-time MIDI activity monitoring and device status

**Features**:
- **Connection Status**: Input/output device connection indicators
- **Message Activity**: Real-time MIDI message display
- **Device Change Notifications**: Alerts when devices are added/removed
- **Reconnection Status**: Shows auto-reconnection attempts
- **Message Filtering**: Displays relevant MIDI data (Note On/Off, CC, PC)

**Message Types Tracked**:
```typescript
interface MidiMessage {
  note?: { note: number; velocity: number; on: boolean; channel?: number };
  controlChange?: { controller: number; value: number; channel: number };
  programChange?: { program: number; channel: number };
  systemMessage?: { type: string; data: number[] };
  raw?: RawMidiMessage;
  rawData: RawMidiMessage; // Always included for debugging
}
```

## Synthesizer Libraries

### 1. JZZ (Jazz-MIDI) - Core MIDI Engine

**Library**: `jzz` npm package
**Role**: Foundation MIDI engine providing cross-platform MIDI I/O

**Why JZZ**:
- **Cross-browser compatibility**: Works in Chrome, Edge, Firefox, Safari
- **Unified API**: Handles both Web MIDI API and virtual devices seamlessly  
- **Plugin Architecture**: Extensible with synthesizer plugins
- **Device Management**: Automatic device discovery and change detection

**Integration**:
```javascript
// JZZ provides the foundation for all MIDI operations
const jzz = await JZZ();
const inputDevice = await jzz.openMidiIn(deviceId);
const outputDevice = await jzz.openMidiOut(deviceId);
```

### 2. JZZ Tiny Synthesizer

**Library**: `jzz-synth-tiny` npm package
**Role**: Lightweight built-in synthesizer for basic MIDI playback

**Features**:
- **No external dependencies**: Pure JavaScript synthesis
- **Low latency**: Minimal processing overhead
- **GM Compatible**: Supports General MIDI instrument mapping
- **Small footprint**: ~50KB total size

**Use Cases**:
- Basic MIDI playback when no other synthesizers are available
- Testing MIDI connections
- Low-resource environments

### 3. MIDI.js with Soundfont Support

**Libraries**: 
- Custom `MIDI.js` (modified version)
- Custom `JZZ.synth.MIDIjs.js` bridge

**Role**: High-quality soundfont-based synthesis with multiple soundfont options

**Features**:
- **Multiple Soundfonts**: FatBoy, FluidR3 GM, MusyngKite
- **Dynamic Instrument Loading**: Loads instruments on-demand
- **High Audio Quality**: PCM-based samples for realistic sound
- **GM Compatibility**: Full General MIDI instrument support
- **Drum Routing**: Channel 10 drums routed to JZZ Tiny for performance

**Soundfont Sources**:
```typescript
const soundfontUrls = {
  'FatBoy': 'https://mongoose.world/sounds/soundfont/FatBoy/',
  'FluidR3': 'https://mongoose.world/sounds/soundfont/FluidR3_GM/',
  'MusyngKite': 'https://mongoose.world/sounds/soundfont/MusyngKite/'
};
```

**Why This Approach**:
- **User Choice**: Different soundfonts suit different musical styles
- **Resource Management**: Only one soundfont loaded at a time
- **Performance**: Configurable quality vs. resource usage

## GMCP MIDI Integration

### GMCP Package: `Client.Midi` (`src/gmcp/Client/Midi.ts`)

The GMCP MIDI package provides server-to-client MIDI communication:

**Supported GMCP Messages**:
- `Client.Midi.Play`: Play MIDI note/sequence
- `Client.Midi.Stop`: Stop current MIDI playback
- `Client.Midi.SetInstrument`: Change MIDI program/instrument
- `Client.Midi.ControlChange`: Send MIDI control change messages

**Integration Flow**:
```
Server GMCP → Client.Midi Handler → MidiService → Active Synthesizer → Audio Output
```

**Example GMCP Message Handling**:
```typescript
// Server sends: Client.Midi.Play {"note": 60, "velocity": 100, "channel": 0}
handlePlay(data: GMCPMessageClientMidiPlay) {
  const midiMessage = [0x90 | data.channel, data.note, data.velocity];
  midiService.sendRawMessage(midiMessage);
}
```

**Bidirectional Communication**:
- **Server → Client**: GMCP messages trigger MIDI playback
- **Client → Server**: MIDI input can send GMCP messages back to server

## Configuration and Preferences

### Preference Structure (`src/PreferencesStore.tsx`)

```typescript
export type MidiPreferences = {
  enabled: boolean;                    // Master MIDI enable/disable
  lastInputDeviceId?: string;          // Remember last input device
  lastOutputDeviceId?: string;         // Remember last output device  
  midiJsSoundfont: string;            // Selected MIDI.js soundfont
};
```

### Default Settings:
- **MIDI Enabled**: `false` (must be explicitly enabled by user)
- **MIDI.js Soundfont**: `MusyngKite` (highest quality)
- **Auto-reconnect**: Enabled (remembers last used devices)

### Preference Persistence:
- Stored in `localStorage` as JSON
- Automatically migrated when preference structure changes
- Changes trigger immediate synthesizer reloading

## Usage Examples

### Basic MIDI Setup:
1. **Enable MIDI**: Settings → MIDI → Enable MIDI ✓
2. **Choose Soundfont**: Select preferred MIDI.js soundfont
3. **Connect**: Sidebar → MIDI → Select input/output devices
4. **Test**: Play notes on MIDI keyboard or via GMCP

### GMCP Integration:
```javascript
// Server LPC code to send MIDI to client:
send_gmcp("Client.Midi.Play", ([ "note": 60, "velocity": 100, "channel": 0 ]));

// Server receives MIDI input from client:
void gmcp_client_midi_input(mapping data) {
  // Process MIDI input from client
  write("You played note " + data["note"]);
}
```

## Troubleshooting

### Common Issues:

**1. No MIDI Devices Found**
- **Browser Support**: Ensure using Chrome, Edge, Opera, or Brave
- **MIDI Permission**: Browser may require user gesture to access MIDI
- **Device Connection**: Check physical MIDI device connections

**2. No Sound from Synthesizers**
- **AudioContext Suspended**: Click anywhere on page to resume audio
- **Browser Audio Policy**: Some browsers block audio until user interaction
- **Soundfont Loading**: Check console for soundfont download errors

**3. MIDI Input Not Detected**
- **Device Permissions**: Browser may prompt for MIDI access permission
- **Device Conflicts**: Another application may be using the MIDI device
- **USB Connection**: Try reconnecting USB MIDI devices

### Debug Information:

The MIDI system provides extensive console logging:
- `✅` Green checkmarks indicate successful operations  
- `❌` Red X marks indicate errors
- Device connection/disconnection events
- MIDI message activity (when input connected)
- Soundfont loading progress

### Performance Considerations:

**MIDI.js Soundfonts**:
- **FatBoy**: ~15MB, warm analog sounds, higher CPU usage
- **FluidR3**: ~10MB, standard GM sounds, moderate CPU usage  
- **MusyngKite**: ~25MB, highest quality, balanced performance

**Recommendations**:
- Use **MusyngKite** for best balance of quality and performance
- Use **JZZ Tiny** for minimal resource usage

---

*This documentation covers the MIDI system as of the current implementation. For the latest updates, check the source code in the respective component files.*