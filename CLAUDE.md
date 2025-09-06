# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands
- `npm start` - Start dev server (opens at http://localhost:5173)
- `npm test` - Run all tests with Vitest
- `npm test src/path/to/file.test.ts` - Run specific test file
- `npm run build` - Build for production
- `npm run serve` - Preview production build

## Project Overview
The Mongoose React Client is a MUD (Multi-User Dungeon) client built specifically for Project Mongoose. It connects to the game server via WebSocket and implements various MUD protocols including Telnet, GMCP (Generic MUD Communication Protocol), and MCP (MUD Client Protocol).

## Architecture Overview

### Core Services
- **MudClient (`src/client.ts`)**: Central service managing WebSocket connection, protocol handling, and feature integration
- **TelnetParser (`src/telnet.ts`)**: Handles low-level Telnet protocol negotiation and stream processing
- **WebRTCService (`src/WebRTCService.ts`)**: Manages voice/video chat via LiveKit
- **FileTransferManager (`src/FileTransferManager.ts`)**: Handles file uploads/downloads
- **EditorManager (`src/EditorManager.ts`)**: External editor integration
- **GMCP System** (`src/gmcp/`): Game protocol handlers for GMCP (Generic MUD Communication Protocol) packages
- **MCP System** (`src/mcp.ts`): MUD Client Protocol handlers for server communication
- **Services**: 
  - `MidiService.ts` & `VirtualMidiService.ts`: MIDI audio support

### Protocol Support

The client supports multiple MUD protocols:
- **GMCP**: For game data exchange (character stats, room info, etc.)
- **MCP**: For MUD Client Protocol features
- **MCMP**: With 3D audio support
- **Telnet**: Base protocol with ANSI color support

### State Management
Uses custom store pattern (not Redux):
- **PreferencesStore**: User settings (volume, TTS, channels)
- **InputStore**: Command input state and management
- **FileTransferStore**: IndexedDB-backed file transfer persistence
- **useClientEvent.ts**: Hook for listening to client events

### GMCP Protocol Structure
Located in `src/gmcp/`, organized hierarchically:
- Base class `GMCPPackage` provides common functionality
- Each package handles specific message types and emits events
- Key packages: Core, Auth, Char/*, Room, Comm/*, Client/*, IRE/*

### Component Communication
- Server → TelnetParser → GMCP/MCP handlers → Event emission → UI components
- Components use custom hooks to subscribe to client events
- User input → CommandInput → MudClient → WebSocket → Server

### Features

- ANSI color rendering with `ansiParser.tsx`
- Text-to-speech with configurable voices
- Desktop notifications
- Session logging
- 3D audio via MCMP
- File transfer between users
- Real-time voice chat via LiveKit
- MIDI music support with virtual synthesizers
- In-game text editor with Monaco Editor

### Key Files

- `src/App.tsx`: Main application component
- `src/client.ts`: Core MudClient implementation
- `src/telnet.ts`: Telnet protocol handling
- `src/components/output.tsx`: Main game output window
- `src/components/input.tsx`: Command input component
- `src/components/sidebar.tsx`: Game info sidebar

### Testing

Uses Vitest with jsdom environment. Test files use `.test.ts` or `.test.tsx` extensions.

## Code Style
- **Formatting**: 2-space indentation, CRLF line endings, UTF-8, trim trailing whitespace
- **Types**: Use explicit TypeScript types & interfaces
- **Components**: Functional components with hooks, props defined with interfaces
- **Naming**:
  - PascalCase: React components & classes
  - camelCase: variables, functions, instances
  - UPPER_SNAKE_CASE: constants
  - Handlers: prefix with "handle" (handleClick)
  - Booleans: prefix with "is" or "has" (isConnected)
- **Imports**: React first, third-party next, local modules last, CSS imports last
- **Error Handling**: Try/catch blocks with console logging and fallback values
- **React Patterns**: Proper effect dependencies, useRef for DOM references, custom hooks
- **Testing**: Vitest with describe/it pattern, descriptive test names
- **Comments**: Avoid redundant comments that state the obvious (e.g., "// Click handler" above a handleClick function)

## Key Dependencies
- React 18 with TypeScript
- Vite for build/dev server
- Monaco Editor for code editing
- LiveKit for WebRTC
- Cacophony for audio playback
- IndexedDB (via idb) for persistence