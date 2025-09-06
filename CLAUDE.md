# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Serve production build
npm serve
```

## Architecture Overview

This is the Mongoose React Client - a specialized MUD (Multi-User Dungeon) client built with React, TypeScript, and Vite. It connects exclusively to Project Mongoose servers.

### Key Components

- **MudClient** (`src/client.ts`): Core client class that manages WebSocket connections, telnet protocol parsing, and protocol handlers
- **GMCP System** (`src/gmcp/`): Game protocol handlers for GMCP (Generic MUD Communication Protocol) packages
- **MCP System** (`src/mcp.ts`): MUD Client Protocol handlers for server communication
- **React Components** (`src/components/`): UI components for the client interface
- **Services**: 
  - `WebRTCService.ts`: Handles real-time communication
  - `MidiService.ts` & `VirtualMidiService.ts`: MIDI audio support
  - `FileTransferManager.ts`: P2P file transfers

### Protocol Support

The client supports multiple MUD protocols:
- **GMCP**: For game data exchange (character stats, room info, etc.)
- **MCP**: For MUD Client Protocol features
- **MCMP**: With 3D audio support
- **Telnet**: Base protocol with ANSI color support

### State Management

- **PreferencesStore.tsx**: Global preferences using Zustand-like pattern
- **InputStore.ts**: Command input history and management
- **useClientEvent.ts**: Hook for listening to client events

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