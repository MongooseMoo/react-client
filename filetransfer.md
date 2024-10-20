# File Transfer Implementation for React-based MUD Client

## 1. Architecture Overview

We have implemented a peer-to-peer file transfer system using WebRTC, integrated into our existing React-based MUD client. The system consists of the following main components:

1. WebRTC Service: Handles WebRTC connections and data channels
2. File Transfer Manager: Manages file sending and receiving processes
3. UI Components: For initiating transfers and displaying progress
4. GMCP Integration: To facilitate WebRTC connection establishment and file transfer signaling

## 2. Components/Modules

1. WebRTCService.ts: Manages WebRTC connections and data channels
2. FileTransferManager.ts: Handles file chunking, reassembly, and transfer logic
3. FileTransferUI.tsx: React component for file transfer UI
4. GMCP FileTransfer Package: Manages communication for file transfer signaling

## 3. Protocol Overview

The file transfer protocol uses a combination of GMCP messages for signaling and WebRTC data channels for actual file transfer:

1. Offer/Accept Phase:
   - Sender initiates transfer with a GMCP FileTransfer.Offer message, including WebRTC offer SDP
   - Receiver responds with a GMCP FileTransfer.Accept message, including WebRTC answer SDP
   - ICE candidates are exchanged using GMCP FileTransfer.Signal messages

2. Data Transfer Phase:
   - File data is sent over the WebRTC data channel in encrypted chunks
   - Progress is tracked and reported to the UI

3. Completion/Error Handling:
   - Transfer completion is signaled when all chunks are received and reassembled
   - Errors or cancellations are handled with appropriate GMCP messages

## 4. GMCP Messages

The following GMCP messages are used for file transfer signaling:

1. FileTransfer.Offer
   - sender: string
   - filename: string
   - filesize: number
   - offerSdp: string (WebRTC offer SDP)

2. FileTransfer.Accept
   - sender: string
   - filename: string
   - answerSdp: string (WebRTC answer SDP)

3. FileTransfer.Reject
   - sender: string
   - filename: string

4. FileTransfer.Cancel
   - sender: string
   - filename: string

5. FileTransfer.Signal
   - sender: string
   - signal: string (WebRTC ICE candidate)

## 5. WebRTC Data Channel

The WebRTC data channel is used for the actual file data transfer:

- Channel name: 'fileTransfer'
- Data format: ArrayBuffer containing encrypted file chunks and metadata

## 6. File Transfer Process

1. Sender selects a file and recipient in the UI
2. Sender's client creates a WebRTC offer and sends a FileTransfer.Offer GMCP message
3. Receiver's client displays the offer in the UI
4. If accepted, receiver's client creates a WebRTC answer and sends a FileTransfer.Accept GMCP message
5. Both clients exchange ICE candidates using FileTransfer.Signal GMCP messages
6. WebRTC connection is established
7. File is chunked, encrypted, and sent over the WebRTC data channel
8. Receiver decrypts and reassembles the file chunks
9. Both sides update their UIs with progress information
10. On completion, the file is saved on the receiver's side

## 7. Error Handling and Recovery

- Network interruptions: The WebRTC connection will attempt to reconnect automatically
- Transfer cancellation: Either side can send a FileTransfer.Cancel GMCP message
- Rejection: Receiver can send a FileTransfer.Reject GMCP message to decline the transfer
- Transfer timeout: Implemented to handle stalled transfers

## 8. Security Considerations

- WebRTC provides built-in encryption for data channels
- Additional encryption is applied to file chunks before sending
- User authentication is handled by the existing MUD client authentication system

## 9. Performance Optimizations

- File chunking allows for efficient memory usage and progress tracking
- WebRTC's built-in congestion control helps manage network performance
- Encryption key is sent with each chunk for improved security

## Next Steps

1. Implement file integrity verification using checksums
2. Optimize chunk size for different network conditions
3. Implement transfer resume functionality for interrupted transfers
4. Add support for multiple simultaneous file transfers
5. Enhance error recovery mechanisms

## Future Enhancements

### 1. Encryption

To improve security, we plan to implement end-to-end encryption for file transfers:

- Generate a unique encryption key for each file transfer
- Use a strong encryption algorithm (e.g., AES-256) to encrypt file chunks before sending
- Send the encryption key securely along with the file transfer offer
- Implement decryption on the receiving end

### 2. Transfer Resume Functionality

To handle interrupted transfers, we'll implement a resume feature:

- Add a unique transfer ID for each file transfer
- Store transfer progress and metadata persistently
- Implement a protocol to negotiate resuming from the last successfully transferred chunk
- Update the UI to show resume options for interrupted transfers

### 3. Multiple Simultaneous Transfers

To support multiple file transfers at once:

- Refactor FileTransferManager to handle multiple transfer sessions
- Implement a queue system for managing multiple transfers
- Update the UI to display and manage multiple ongoing transfers
- Ensure proper resource allocation and throttling to maintain performance

These enhancements will significantly improve the robustness, security, and usability of our file transfer feature.
import React, { useState, useEffect } from 'react';
import MudClient from '../client';
import { GMCPMessageClientFileTransferOffer, GMCPMessageClientFileTransferAccept, GMCPMessageClientFileTransferReject, GMCPMessageClientFileTransferCancel } from '../gmcp/Client/FileTransfer';
import { FileTransferError, FileTransferErrorCodes } from '../FileTransferManager';
import './FileTransferUI.css';

interface FileTransferUIProps {
  client: MudClient;
}

interface TransferHistoryItem {
  filename: string;
  sender: string;
  recipient: string;
  status: 'completed' | 'cancelled' | 'rejected' | 'failed';
  timestamp: Date;
}

const FileTransferUI: React.FC<FileTransferUIProps> = ({ client }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sendProgress, setSendProgress] = useState<number>(0);
  const [receiveProgress, setReceiveProgress] = useState<number>(0);
  const [incomingTransfer, setIncomingTransfer] = useState<GMCPMessageClientFileTransferOffer | null>(null);
  const [transferHistory, setTransferHistory] = useState<TransferHistoryItem[]>([]);
  const [recipient, setRecipient] = useState<string>('');
  const [transferStatus, setTransferStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [webRTCState, setWebRTCState] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setErrorMessage('');
    }
  };

  const handleSendFile = async () => {
    if (selectedFile && recipient) {
      try {
        setTransferStatus('Connecting');
        await client.fileTransferManager.sendFile(selectedFile, recipient);
      } catch (error) {
        console.error('File transfer failed:', error);
        setErrorMessage(`File transfer failed: ${error.message}`);
        setTransferStatus('Failed');
      }
    }
  };

  const handleAcceptTransfer = () => {
    if (incomingTransfer) {
      client.fileTransferManager.acceptTransfer(incomingTransfer.sender, incomingTransfer.filename);
      setIncomingTransfer(null);
      setTransferStatus('Receiving');
    }
  };

  const handleRejectTransfer = () => {
    if (incomingTransfer) {
      client.fileTransferManager.cancelTransfer(incomingTransfer.filename);
      setIncomingTransfer(null);
      setTransferStatus('');
    }
  };

  const handleCancelTransfer = () => {
    if (selectedFile) {
      client.fileTransferManager.cancelTransfer(selectedFile.name);
      setSendProgress(0);
      setSelectedFile(null);
      setTransferStatus('');
    }
  };

  useEffect(() => {
    const handleFileTransferOffer = (data: GMCPMessageClientFileTransferOffer) => {
      setIncomingTransfer(data);
    };

    const handleFileTransferAccepted = (data: GMCPMessageClientFileTransferAccept) => {
      if (selectedFile) {
        client.fileTransferManager.sendFile(selectedFile, data.sender);
        setTransferStatus('Sending');
      }
    };

    const handleFileTransferRejected = (data: GMCPMessageClientFileTransferReject) => {
      setTransferHistory(prev => [...prev, {
        filename: data.filename,
        sender: client.worldData.playerName,
        recipient: data.sender,
        status: 'rejected',
        timestamp: new Date()
      }]);
      setSendProgress(0);
      setSelectedFile(null);
      setTransferStatus('');
    };

    const handleFileTransferCancelled = (data: GMCPMessageClientFileTransferCancel) => {
      setTransferHistory(prev => [...prev, {
        filename: data.filename,
        sender: data.sender,
        recipient: client.worldData.playerName,
        status: 'cancelled',
        timestamp: new Date()
      }]);
      setSendProgress(0);
      setReceiveProgress(0);
      setTransferStatus('');
    };

    const handleFileSendProgress = (data: { filename: string, sentBytes: number, totalBytes: number }) => {
      setSendProgress((data.sentBytes / data.totalBytes) * 100);
    };

    const handleFileReceiveProgress = (data: { filename: string, receivedBytes: number, totalBytes: number }) => {
      setReceiveProgress((data.receivedBytes / data.totalBytes) * 100);
    };

    const handleFileReceiveComplete = (data: { filename: string, file: Blob }) => {
      const url = URL.createObjectURL(data.file);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setTransferHistory(prev => [...prev, {
        filename: data.filename,
        sender: incomingTransfer?.sender || 'Unknown',
        recipient: client.worldData.playerName,
        status: 'completed',
        timestamp: new Date()
      }]);
      setReceiveProgress(0);
      setTransferStatus('Completed');
    };

    const handleFileTransferError = (error: FileTransferError) => {
      setErrorMessage(`Transfer failed: ${error.message} (Code: ${error.code})`);
      setTransferStatus('Failed');
    };

    const handleWebRTCStateChange = (state: string) => {
      setWebRTCState(state);
    };

    client.on('fileTransferOffer', handleFileTransferOffer);
    client.on('fileTransferAccepted', handleFileTransferAccepted);
    client.on('fileTransferRejected', handleFileTransferRejected);
    client.on('fileTransferCancelled', handleFileTransferCancelled);
    client.on('fileSendProgress', handleFileSendProgress);
    client.on('fileReceiveProgress', handleFileReceiveProgress);
    client.on('fileReceiveComplete', handleFileReceiveComplete);
    client.on('fileTransferError', handleFileTransferError);
    client.on('webRTCStateChange', handleWebRTCStateChange);

    return () => {
      client.off('fileTransferOffer', handleFileTransferOffer);
      client.off('fileTransferAccepted', handleFileTransferAccepted);
      client.off('fileTransferRejected', handleFileTransferRejected);
      client.off('fileTransferCancelled', handleFileTransferCancelled);
      client.off('fileSendProgress', handleFileSendProgress);
      client.off('fileReceiveProgress', handleFileReceiveProgress);
      client.off('fileReceiveComplete', handleFileReceiveComplete);
      client.off('fileTransferError', handleFileTransferError);
      client.off('webRTCStateChange', handleWebRTCStateChange);
    };
  }, [client, selectedFile, incomingTransfer]);

  return (
    <div className="file-transfer-ui">
      <h3>File Transfer</h3>
      <div className="file-transfer-controls">
        <input type="file" onChange={handleFileChange} />
        <input
          type="text"
          placeholder="Recipient's name"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />
        <button onClick={handleSendFile} disabled={!selectedFile || !recipient || transferStatus !== ''}>
          Send File
        </button>
      </div>
      {transferStatus && <p>Status: {transferStatus}</p>}
      {webRTCState && <p>WebRTC State: {webRTCState}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {(sendProgress > 0 || receiveProgress > 0) && (
        <div className="progress-bar">
          <p>{sendProgress > 0 ? `Sending file: ${selectedFile?.name}` : `Receiving file: ${incomingTransfer?.filename}`}</p>
          <progress value={sendProgress > 0 ? sendProgress : receiveProgress} max="100" />
          <span>{(sendProgress > 0 ? sendProgress : receiveProgress).toFixed(2)}%</span>
          {sendProgress > 0 && <button onClick={handleCancelTransfer}>Cancel</button>}
        </div>
      )}
      {incomingTransfer && (
        <div className="incoming-transfer">
          <p>Incoming file transfer from {incomingTransfer.sender}: {incomingTransfer.filename} ({incomingTransfer.filesize} bytes)</p>
          <button onClick={handleAcceptTransfer}>Accept</button>
          <button onClick={handleRejectTransfer}>Reject</button>
        </div>
      )}
      <div className="transfer-history">
        <h4>Transfer History</h4>
        <ul>
          {transferHistory.map((item, index) => (
            <li key={index}>
              {item.filename} - {item.sender} to {item.recipient} - {item.status} - {item.timestamp.toLocaleString()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FileTransferUI;
