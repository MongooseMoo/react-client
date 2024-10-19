import React, { useState, useEffect } from 'react';
import MudClient from '../client';
import './FileTransferUI.css';

interface FileTransferUIProps {
  client: MudClient;
}

const FileTransferUI: React.FC<FileTransferUIProps> = ({ client }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [recipient, setRecipient] = useState<string>('');
  const [sendProgress, setSendProgress] = useState<number>(0);
  const [receiveProgress, setReceiveProgress] = useState<number>(0);
  const [incomingTransfer, setIncomingTransfer] = useState<{ sender: string; filename: string; filesize: number } | null>(null);
  const [transferHistory, setTransferHistory] = useState<string[]>([]);

  useEffect(() => {
    console.log('[FileTransferUI] Setting up event listeners');
    client.on('fileTransferOffer', handleFileTransferOffer);
    client.on('fileSendProgress', handleFileSendProgress);
    client.on('fileReceiveProgress', handleFileReceiveProgress);
    client.on('fileTransferError', handleFileTransferError);
    client.on('fileTransferCancelled', handleFileTransferCancelled);
    client.on('fileTransferRejected', handleFileTransferRejected);

    return () => {
      console.log('[FileTransferUI] Removing event listeners');
      client.off('fileTransferOffer', handleFileTransferOffer);
      client.off('fileSendProgress', handleFileSendProgress);
      client.off('fileReceiveProgress', handleFileReceiveProgress);
      client.off('fileTransferError', handleFileTransferError);
      client.off('fileTransferCancelled', handleFileTransferCancelled);
      client.off('fileTransferRejected', handleFileTransferRejected);
    };
  }, [client]);

  useEffect(() => {
    console.log('[FileTransferUI] incomingTransfer state updated:', incomingTransfer);
  }, [incomingTransfer]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleRecipientChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRecipient(event.target.value);
  };

  const handleSendFile = () => {
    if (selectedFile && recipient) {
      client.fileTransferManager.sendFile(selectedFile, recipient)
        .then(() => {
          addToTransferHistory(`Sending ${selectedFile.name} to ${recipient}`);
        })
        .catch(error => {
          addToTransferHistory(`Error sending file: ${error.message}`);
        });
    }
  };

  const handleFileTransferOffer = (data: { sender: string; filename: string; filesize: number }) => {
    console.log('[FileTransferUI] Received fileTransferOffer event:', data);
    setIncomingTransfer(data);
    addToTransferHistory(`Incoming file offer: ${data.filename} from ${data.sender}`);
    console.log('[FileTransferUI] Updated incomingTransfer state and transfer history');
  };

  const handleAcceptTransfer = async () => {
    if (incomingTransfer) {
      try {
        await client.fileTransferManager.acceptTransfer(incomingTransfer.sender, incomingTransfer.filename);
        addToTransferHistory(`Accepted file transfer: ${incomingTransfer.filename} from ${incomingTransfer.sender}`);
      } catch (error) {
        addToTransferHistory(`Error accepting file transfer: ${error.message}`);
      }
      setIncomingTransfer(null);
    }
  };

  const handleRejectTransfer = () => {
    if (incomingTransfer) {
      client.fileTransferManager.rejectTransfer(incomingTransfer.sender, incomingTransfer.filename);
      addToTransferHistory(`Rejected file transfer: ${incomingTransfer.filename} from ${incomingTransfer.sender}`);
      setIncomingTransfer(null);
    }
  };

  const handleFileSendProgress = (data: { filename: string; sentBytes: number; totalBytes: number }) => {
    const progress = (data.sentBytes / data.totalBytes) * 100;
    setSendProgress(progress);
    if (progress === 100) {
      addToTransferHistory(`File sent successfully: ${data.filename}`);
    }
  };

  const handleFileReceiveProgress = (data: { filename: string; receivedBytes: number; totalBytes: number }) => {
    const progress = (data.receivedBytes / data.totalBytes) * 100;
    setReceiveProgress(progress);
    if (progress === 100) {
      addToTransferHistory(`File received successfully: ${data.filename}`);
    }
  };

  const handleFileTransferError = (data: { filename: string; error: string }) => {
    addToTransferHistory(`Error transferring file ${data.filename}: ${data.error}`);
  };

  const handleFileTransferCancelled = (data: { filename: string; direction: 'send' | 'receive' }) => {
    addToTransferHistory(`File transfer cancelled: ${data.filename} (${data.direction})`);
    setSendProgress(0);
    setReceiveProgress(0);
  };

  const handleFileTransferRejected = (data: { filename: string }) => {
    addToTransferHistory(`File transfer rejected: ${data.filename}`);
  };

  const handleCancelTransfer = () => {
    if (incomingTransfer) {
      client.fileTransferManager.cancelTransfer(incomingTransfer.filename);
      setIncomingTransfer(null);
    }
  };

  const addToTransferHistory = (message: string) => {
    setTransferHistory(prevHistory => [...prevHistory, message].slice(-10));
  };

  return (
    <div className="file-transfer-ui">
      <h3>File Transfer</h3>
      <div className="file-transfer-controls">
        <input type="file" onChange={handleFileChange} />
        <input
          type="text"
          placeholder="Recipient"
          value={recipient}
          onChange={handleRecipientChange}
        />
        <button onClick={handleSendFile} disabled={!selectedFile || !recipient}>
          Send File
        </button>
      </div>
      {(sendProgress > 0 || receiveProgress > 0) && (
        <div className="progress-bar">
          <progress value={sendProgress > 0 ? sendProgress : receiveProgress} max="100" />
        </div>
      )}
      {incomingTransfer && (
        <div className="incoming-transfer">
          <p>Incoming file: {incomingTransfer.filename} from {incomingTransfer.sender}</p>
          <button onClick={handleAcceptTransfer}>Accept</button>
          <button onClick={handleRejectTransfer}>Reject</button>
          <button onClick={handleCancelTransfer}>Cancel</button>
        </div>
      )}
      <div className="transfer-history">
        <h4>Transfer History</h4>
        <ul>
          {transferHistory.map((entry, index) => (
            <li key={index}>{entry}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FileTransferUI;
