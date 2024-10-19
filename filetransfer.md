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

The file transfer protocol uses a combination of GMCP messages and WebRTC data channels:

1. Offer/Accept Phase:
   - Sender initiates transfer with a GMCP FileTransfer.Offer message
   - Receiver responds with a GMCP FileTransfer.Accept message
   - WebRTC connection is established using the SDP information in these messages

2. Data Transfer Phase:
   - File data is sent over the WebRTC data channel in chunks
   - Progress is tracked and reported to the UI

3. Completion/Error Handling:
   - Transfer completion is signaled when all chunks are received
   - Errors or cancellations are handled with appropriate GMCP messages

## 4. GMCP Messages

The following GMCP messages are used for file transfer signaling:

1. FileTransfer.Offer
   - sender: string
   - filename: string
   - filesize: number

2. FileTransfer.Accept
   - sender: string
   - filename: string

3. FileTransfer.Reject
   - sender: string
   - filename: string

4. FileTransfer.Cancel
   - sender: string
   - filename: string

## 5. WebRTC Data Channel and Signaling

WebRTC signaling (offer, answer, and ICE candidates) is handled directly through the WebRTCService, separate from GMCP messages.

The WebRTC data channel is used for the actual file data transfer:

- Channel name: 'fileTransfer'
- Data format: ArrayBuffer containing file chunks

## 6. File Transfer Process

1. Sender selects a file and recipient in the UI
2. Sender's client sends a FileTransfer.Offer GMCP message
3. Receiver's client displays the offer in the UI
4. If accepted, receiver's client sends a FileTransfer.Accept GMCP message
5. WebRTC connection is established using the exchanged SDP information
6. File is chunked and sent over the WebRTC data channel
7. Receiver reassembles the file chunks
8. Both sides update their UIs with progress information
9. On completion, the file is saved on the receiver's side

## 7. Error Handling and Recovery

- Network interruptions: The WebRTC connection will attempt to reconnect automatically
- Transfer cancellation: Either side can send a FileTransfer.Cancel GMCP message
- Rejection: Receiver can send a FileTransfer.Reject GMCP message to decline the transfer

## 8. Security Considerations

- WebRTC provides built-in encryption for data channels
- File integrity should be verified after transfer (e.g., using checksums)
- User authentication is handled by the existing MUD client authentication system

## 9. Performance Optimizations

- File chunking allows for efficient memory usage and progress tracking
- WebRTC's built-in congestion control helps manage network performance

## Next Steps

1. Implement robust error handling and recovery mechanisms
2. Add file integrity verification
3. Optimize chunk size for different network conditions
4. Implement transfer resume functionality for interrupted transfers
5. Add support for multiple simultaneous file transfers
import React, { useState, useEffect } from 'react';
import MudClient from '../client';
import { GMCPMessageClientFileTransferOffer, GMCPMessageClientFileTransferAccept, GMCPMessageClientFileTransferReject, GMCPMessageClientFileTransferCancel } from '../gmcp/Client/FileTransfer';
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
        await client.gmcp_fileTransfer.sendOffer(recipient, selectedFile.name, selectedFile.size);
      } catch (error) {
        console.error('File transfer failed:', error);
        setErrorMessage(`File transfer failed: ${error.message}`);
        setTransferStatus('Failed');
      }
    }
  };

  const handleAcceptTransfer = () => {
    if (incomingTransfer) {
      client.gmcp_fileTransfer.sendAccept(incomingTransfer.sender, incomingTransfer.filename);
      setIncomingTransfer(null);
      setTransferStatus('Receiving');
    }
  };

  const handleRejectTransfer = () => {
    if (incomingTransfer) {
      client.gmcp_fileTransfer.sendReject(incomingTransfer.sender, incomingTransfer.filename);
      setIncomingTransfer(null);
      setTransferStatus('');
    }
  };

  const handleCancelTransfer = () => {
    if (selectedFile) {
      client.gmcp_fileTransfer.sendCancel(recipient, selectedFile.name);
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
        client.fileTransferManager.sendFile(selectedFile);
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

    const handleFileTransferError = (error: Error) => {
      setErrorMessage(`Transfer failed: ${error.message}`);
      setTransferStatus('Failed');
    };

    client.on('fileTransferOffer', handleFileTransferOffer);
    client.on('fileTransferAccepted', handleFileTransferAccepted);
    client.on('fileTransferRejected', handleFileTransferRejected);
    client.on('fileTransferCancelled', handleFileTransferCancelled);
    client.on('fileSendProgress', handleFileSendProgress);
    client.on('fileReceiveProgress', handleFileReceiveProgress);
    client.on('fileReceiveComplete', handleFileReceiveComplete);
    client.on('fileTransferError', handleFileTransferError);

    return () => {
      client.off('fileTransferOffer', handleFileTransferOffer);
      client.off('fileTransferAccepted', handleFileTransferAccepted);
      client.off('fileTransferRejected', handleFileTransferRejected);
      client.off('fileTransferCancelled', handleFileTransferCancelled);
      client.off('fileSendProgress', handleFileSendProgress);
      client.off('fileReceiveProgress', handleFileReceiveProgress);
      client.off('fileReceiveComplete', handleFileReceiveComplete);
      client.off('fileTransferError', handleFileTransferError);
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
