# File Transfer Implementation Plan for React-based MUD Client

## 1. Architecture Overview

We'll implement a peer-to-peer file transfer system using WebRTC, integrated into our existing React-based MUD client. The system will consist of the following main components:

1. WebRTC Service: Handles WebRTC connections and data channels
2. File Transfer Manager: Manages file sending and receiving processes
3. UI Components: For initiating transfers and displaying progress
4. Signaling Server: To facilitate WebRTC connection establishment

## 2. New Components/Modules

1. WebRTCService.ts: Manages WebRTC connections and data channels
2. FileTransferManager.ts: Handles file chunking, reassembly, and transfer logic
3. FileTransferUI.tsx: React component for file transfer UI
4. SignalingService.ts: Manages communication with the signaling server

### Code Snippets for New Components

#### WebRTCService.ts

```typescript
import MudClient from './client';

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private client: MudClient;

  constructor(client: MudClient) {
    this.client = client;
  }

  async createPeerConnection(): Promise<void> {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.client.emit('iceCandidate', event.candidate);
      }
    };

    this.dataChannel = this.peerConnection.createDataChannel('fileTransfer');
    this.setupDataChannel();
  }

  private setupDataChannel(): void {
    if (!this.dataChannel) return;

    this.dataChannel.onopen = () => {
      this.client.emit('dataChannelOpen');
    };

    this.dataChannel.onmessage = (event) => {
      this.client.emit('dataChannelMessage', event.data);
    };
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) throw new Error('Peer connection not initialized');
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    return offer;
  }

  async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) throw new Error('Peer connection not initialized');
    await this.peerConnection.setRemoteDescription(answer);
  }

  async handleIceCandidate(candidate: RTCIceCandidate): Promise<void> {
    if (!this.peerConnection) throw new Error('Peer connection not initialized');
    await this.peerConnection.addIceCandidate(candidate);
  }

  sendData(data: ArrayBuffer): void {
    if (!this.dataChannel) throw new Error('Data channel not initialized');
    this.dataChannel.send(data);
  }
}
```

#### FileTransferManager.ts

```typescript
import { WebRTCService } from './WebRTCService';
import MudClient from './client';

export class FileTransferManager {
  private webRTCService: WebRTCService;
  private client: MudClient;
  private chunkSize: number = 16384; // 16 KB chunks

  constructor(client: MudClient, webRTCService: WebRTCService) {
    this.client = client;
    this.webRTCService = webRTCService;
    this.setupListeners();
  }

  private setupListeners(): void {
    this.client.on('dataChannelMessage', (data: ArrayBuffer) => {
      // Handle incoming file chunks
      this.handleIncomingChunk(data);
    });
  }

  async sendFile(file: File): Promise<void> {
    const fileReader = new FileReader();
    let offset = 0;

    fileReader.onload = (e) => {
      if (e.target?.result instanceof ArrayBuffer) {
        this.webRTCService.sendData(e.target.result);
        offset += e.target.result.byteLength;
        if (offset < file.size) {
          this.readSlice(file, offset);
        }
      }
    };

    this.readSlice(file, 0);
  }

  private readSlice(file: File, offset: number): void {
    const slice = file.slice(offset, offset + this.chunkSize);
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(slice);
  }

  private handleIncomingChunk(chunk: ArrayBuffer): void {
    // Implement logic to reassemble incoming file chunks
    console.log('Received chunk:', chunk.byteLength);
    this.client.emit('fileChunkReceived', chunk);
  }
}
```

#### FileTransferUI.tsx

```tsx
import React, { useState } from 'react';
import { FileTransferManager } from './FileTransferManager';

interface FileTransferUIProps {
  fileTransferManager: FileTransferManager;
}

export const FileTransferUI: React.FC<FileTransferUIProps> = ({ fileTransferManager }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [transferProgress, setTransferProgress] = useState<number>(0);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleSendFile = async () => {
    if (selectedFile) {
      try {
        await fileTransferManager.sendFile(selectedFile);
        // Update UI to show transfer complete
        setTransferProgress(100);
      } catch (error) {
        console.error('File transfer failed:', error);
        // Update UI to show transfer failed
      }
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleSendFile} disabled={!selectedFile}>
        Send File
      </button>
      {transferProgress > 0 && (
        <div>
          <progress value={transferProgress} max="100" />
          <span>{transferProgress}%</span>
        </div>
      )}
    </div>
  );
};
```

#### SignalingService.ts

```typescript
import MudClient from './client';

export class SignalingService {
  private socket: WebSocket;
  private client: MudClient;

  constructor(client: MudClient, url: string) {
    this.client = client;
    this.socket = new WebSocket(url);
    this.setupSocketListeners();
  }

  private setupSocketListeners(): void {
    this.socket.onopen = () => {
      this.client.emit('signalingConnected');
    };

    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.client.emit('signalingMessage', message);
    };

    this.socket.onerror = (error) => {
      this.client.emit('signalingError', error);
    };

    this.socket.onclose = () => {
      this.client.emit('signalingDisconnected');
    };
  }

  sendMessage(type: string, payload: any): void {
    const message = JSON.stringify({ type, payload });
    this.socket.send(message);
  }

  close(): void {
    this.socket.close();
  }
}
```

## 3. Changes to Existing Components

1. MudClient.ts: Add integration with WebRTCService and FileTransferManager
2. App.tsx: Include FileTransferUI component

### Code Snippets for Existing Component Changes

#### MudClient.ts

Add the following properties and methods to the MudClient class:

```typescript
import { WebRTCService } from './WebRTCService';
import { FileTransferManager } from './FileTransferManager';
import { SignalingService } from './SignalingService';

export class MudClient extends EventEmitter {
  // ... existing properties

  private webRTCService: WebRTCService;
  private fileTransferManager: FileTransferManager;
  private signalingService: SignalingService;

  constructor(host: string, port: number) {
    // ... existing constructor code

    this.webRTCService = new WebRTCService();
    this.fileTransferManager = new FileTransferManager(this.webRTCService);
    this.signalingService = new SignalingService(`wss://${host}:${port}/signaling`);

    this.setupSignalingListeners();
  }

  private setupSignalingListeners(): void {
    this.signalingService.on('message', async (message: any) => {
      switch (message.type) {
        case 'offer':
          await this.webRTCService.handleOffer(message.payload);
          const answer = await this.webRTCService.createAnswer();
          this.signalingService.sendMessage('answer', answer);
          break;
        case 'answer':
          await this.webRTCService.handleAnswer(message.payload);
          break;
        case 'ice-candidate':
          await this.webRTCService.handleIceCandidate(message.payload);
          break;
      }
    });
  }

  // ... existing methods
}
```

#### App.tsx

Update the App component to include the FileTransferUI:

```tsx
import React from 'react';
import { FileTransferUI } from './components/FileTransferUI';
import MudClient from './client';

function App() {
  // ... existing code

  return (
    <div className="App">
      {/* ... existing components */}
      <FileTransferUI fileTransferManager={client.fileTransferManager} />
    </div>
  );
}

export default App;
```

## 4. Implementation Roadmap

1. Set up WebRTC Service
   - Implement peer connection creation
   - Handle data channel setup

2. Develop File Transfer Manager
   - Implement file chunking and reassembly
   - Create methods for sending and receiving file chunks

3. Create UI Components
   - Design and implement file selection and transfer progress UI

4. Integrate with Signaling Server
   - Implement signaling logic for WebRTC connection establishment

5. Integrate New Components with Existing MUD Client
   - Add file transfer functionality to MudClient class
   - Update App component to include file transfer UI

6. Implement Error Handling and Recovery
   - Add error checking and recovery mechanisms

7. Optimize Performance
   - Implement chunked file transfer with progress tracking

8. Security Enhancements
   - Add encryption for file transfers
   - Implement authentication for file transfer requests

## 5. Potential Challenges and Solutions

1. Challenge: Large file transfers
   Solution: Implement chunked file transfer with progress tracking

2. Challenge: Network interruptions
   Solution: Implement resume functionality for interrupted transfers

3. Challenge: Browser compatibility
   Solution: Use a WebRTC library with broad browser support and fallback options

## 6. Testing Strategies

1. Unit Tests: For WebRTCService, FileTransferManager, and SignalingService
2. Integration Tests: Test the interaction between components
3. End-to-End Tests: Simulate complete file transfers in various scenarios
4. Performance Tests: Measure transfer speeds and resource usage
5. Compatibility Tests: Test across different browsers and devices

## 7. Performance Considerations

1. Use efficient chunking algorithms to optimize memory usage
2. Implement throttling to prevent overwhelming slow connections
3. Use Web Workers for file processing to keep the UI responsive

## 8. Security Considerations

1. Implement end-to-end encryption for file transfers
2. Use secure WebRTC configurations (e.g., proper TURN server setup)
3. Implement user authentication for file transfer requests
4. Sanitize and validate all user inputs and received files

## Next Steps

1. Begin implementation of WebRTCService.ts
2. Create basic structure for FileTransferManager.ts
3. Set up SignalingService.ts
4. Develop initial version of FileTransferUI.tsx
5. Start integration of new components with MudClient.ts and App.tsx

Once these initial steps are completed, we can proceed with implementing the detailed file transfer logic, error handling, and optimizations.
import React, { useState } from 'react';
import MudClient from '../client';

interface FileTransferUIProps {
  client: MudClient;
}

const FileTransferUI: React.FC<FileTransferUIProps> = ({ client }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [transferProgress, setTransferProgress] = useState<number>(0);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleSendFile = async () => {
    if (selectedFile) {
      try {
        await client.fileTransferManager.sendFile(selectedFile);
        // Update UI to show transfer complete
        setTransferProgress(100);
      } catch (error) {
        console.error('File transfer failed:', error);
        // Update UI to show transfer failed
      }
    }
  };

  React.useEffect(() => {
    const handleFileChunkReceived = (chunk: ArrayBuffer) => {
      // Update progress based on received chunks
      // This is a simplified example; you'll need to implement proper progress tracking
      setTransferProgress((prev) => Math.min(prev + 10, 100));
    };

    client.on('fileChunkReceived', handleFileChunkReceived);

    return () => {
      client.off('fileChunkReceived', handleFileChunkReceived);
    };
  }, [client]);

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleSendFile} disabled={!selectedFile}>
        Send File
      </button>
      {transferProgress > 0 && (
        <div>
          <progress value={transferProgress} max="100" />
          <span>{transferProgress}%</span>
        </div>
      )}
    </div>
  );
};

export default FileTransferUI;
