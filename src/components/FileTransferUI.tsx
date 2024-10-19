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
    client.on('fileTransferOffer', handleFileTransferOffer);
    client.on('fileSendProgress', handleFileSendProgress);
    client.on('fileReceiveProgress', handleFileReceiveProgress);
    client.on('fileTransferError', handleFileTransferError);
    client.on('fileTransferCancelled', handleFileTransferCancelled);

    return () => {
      client.off('fileTransferOffer', handleFileTransferOffer);
      client.off('fileSendProgress', handleFileSendProgress);
      client.off('fileReceiveProgress', handleFileReceiveProgress);
      client.off('fileTransferError', handleFileTransferError);
      client.off('fileTransferCancelled', handleFileTransferCancelled);
    };
  }, [client]);

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
      client.fileTransferManager.sendFile(selectedFile);
      client.gmcp_fileTransfer.sendOffer(recipient, selectedFile.name, selectedFile.size);
      addToTransferHistory(`Sending ${selectedFile.name} to ${recipient}`);
    }
  };

  const handleFileTransferOffer = (data: { sender: string; filename: string; filesize: number }) => {
    setIncomingTransfer(data);
    addToTransferHistory(`Incoming file offer: ${data.filename} from ${data.sender}`);
  };

  const handleAcceptTransfer = () => {
    if (incomingTransfer) {
      client.gmcp_fileTransfer.sendAccept(incomingTransfer.sender, incomingTransfer.filename);
      addToTransferHistory(`Accepted file transfer: ${incomingTransfer.filename} from ${incomingTransfer.sender}`);
      setIncomingTransfer(null);
    }
  };

  const handleRejectTransfer = () => {
    if (incomingTransfer) {
      client.gmcp_fileTransfer.sendReject(incomingTransfer.sender, incomingTransfer.filename);
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
