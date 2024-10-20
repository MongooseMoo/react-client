import React, { useState, useEffect, useCallback } from 'react';
import MudClient from '../client';
import './FileTransferUI.css';

interface FileTransferUIProps {
  client: MudClient;
  expanded: boolean;
}

interface PendingOffer {
  sender: string;
  filename: string;
  filesize: number;
}

const FileTransferUI: React.FC<FileTransferUIProps> = ({ client, expanded }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [recipient, setRecipient] = useState<string>('');
  const [sendProgress, setSendProgress] = useState<number>(0);
  const [receiveProgress, setReceiveProgress] = useState<number>(0);
  const [pendingOffers, setPendingOffers] = useState<PendingOffer[]>([]);
  const [transferHistory, setTransferHistory] = useState<string[]>([]);

  const handleFileTransferOffer = useCallback((data: PendingOffer) => {
    setPendingOffers(prevOffers => [...prevOffers, data]);
    addToTransferHistory(`Incoming file offer: ${data.filename} from ${data.sender}`);
  }, []);

  const handleFileSendProgress = useCallback((data: { filename: string; sentBytes: number; totalBytes: number }) => {
    const progress = (data.sentBytes / data.totalBytes) * 100;
    setSendProgress(progress);
  }, []);

  const handleFileReceiveProgress = useCallback((data: { filename: string; receivedBytes: number; totalBytes: number }) => {
    const progress = (data.receivedBytes / data.totalBytes) * 100;
    setReceiveProgress(progress);
  }, []);

  const handleFileSendComplete = useCallback((filename: string) => {
    addToTransferHistory(`File sent successfully: ${filename}`);
    setSendProgress(0);
  }, []);

  const handleFileReceiveComplete = useCallback((data: { filename: string, file: Blob }) => {
    addToTransferHistory(`File received successfully: ${data.filename}`);
    setReceiveProgress(0);
    // You can add code here to save or display the received file
  }, []);

  const handleFileTransferError = useCallback((data: { filename: string; direction: 'send' | 'receive'; error: string }) => {
    addToTransferHistory(`Error ${data.direction}ing file ${data.filename}: ${data.error}`);
    if (data.direction === 'send') {
      setSendProgress(0);
    } else {
      setReceiveProgress(0);
    }
  }, []);

  const handleFileTransferCancelled = useCallback((data: { filename: string; direction: 'send' | 'receive' }) => {
    addToTransferHistory(`File transfer cancelled: ${data.filename} (${data.direction})`);
    if (data.direction === 'send') {
      setSendProgress(0);
    } else {
      setReceiveProgress(0);
    }
  }, []);

  const handleFileTransferRejected = useCallback((data: { sender: string, filename: string }) => {
    addToTransferHistory(`File transfer rejected: ${data.filename} from ${data.sender}`);
  }, []);

  useEffect(() => {
    console.log('[FileTransferUI] Setting up event listeners');
    client.on('fileTransferOffer', handleFileTransferOffer);
    client.on('fileSendProgress', handleFileSendProgress);
    client.on('fileReceiveProgress', handleFileReceiveProgress);
    client.on('fileTransferError', handleFileTransferError);
    client.on('fileTransferCancelled', handleFileTransferCancelled);
    client.on('fileTransferRejected', handleFileTransferRejected);
    client.on('fileSendComplete', handleFileSendComplete);
    client.on('fileReceiveComplete', handleFileReceiveComplete);

    return () => {
      console.log('[FileTransferUI] Removing event listeners');
      client.off('fileTransferOffer', handleFileTransferOffer);
      client.off('fileSendProgress', handleFileSendProgress);
      client.off('fileReceiveProgress', handleFileReceiveProgress);
      client.off('fileTransferError', handleFileTransferError);
      client.off('fileTransferCancelled', handleFileTransferCancelled);
      client.off('fileTransferRejected', handleFileTransferRejected);
      client.off('fileSendComplete', handleFileSendComplete);
      client.off('fileReceiveComplete', handleFileReceiveComplete);
    };
  }, [client, handleFileTransferOffer, handleFileSendProgress, handleFileReceiveProgress, handleFileTransferError, handleFileTransferCancelled, handleFileTransferRejected, handleFileSendComplete, handleFileReceiveComplete]);

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
      client.sendFile(selectedFile, recipient)
        .then(() => {
          addToTransferHistory(`Sending ${selectedFile.name} to ${recipient}`);
        })
        .catch(error => {
          addToTransferHistory(`Error sending file: ${error.message}`);
        });
    }
  };

  const handleFileTransferOffer = (data: PendingOffer) => {
    console.log('[FileTransferUI] Received fileTransferOffer event:', data);
    setPendingOffers(prevOffers => [...prevOffers, data]);
    addToTransferHistory(`Incoming file offer: ${data.filename} from ${data.sender}`);
    console.log('[FileTransferUI] Updated pendingOffers state and transfer history');
  };

  const handleAcceptTransfer = (sender: string, filename: string) => {
    client.acceptTransfer(sender, filename);
    addToTransferHistory(`Accepted file transfer: ${filename} from ${sender}`);
    setPendingOffers(prevOffers => prevOffers.filter(o => o.filename !== filename || o.sender !== sender));
  };

  const handleRejectTransfer = (sender: string, filename: string) => {
    client.rejectTransfer(sender, filename);
    addToTransferHistory(`Rejected file transfer: ${filename} from ${sender}`);
    setPendingOffers(prevOffers => prevOffers.filter(o => o.filename !== filename || o.sender !== sender));
  };


  const handleCancelTransfer = (filename: string) => {
    client.cancelTransfer(filename);
    setPendingOffers(prevOffers => prevOffers.filter(o => o.filename !== filename));
  };

  const addToTransferHistory = (message: string) => {
    setTransferHistory(prevHistory => [...prevHistory, message].slice(-10));
  };

  return (
    <div className={`file-transfer-ui ${expanded ? 'expanded' : 'collapsed'}`}>
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
          <span>{(sendProgress > 0 ? sendProgress : receiveProgress).toFixed(2)}%</span>
        </div>
      )}
      {pendingOffers.map((offer) => (
        <div key={`${offer.sender}-${offer.filename}`} className="incoming-transfer">
          <p>Incoming file: {offer.filename} from {offer.sender}</p>
          <button onClick={() => handleAcceptTransfer(offer.sender, offer.filename)}>Accept</button>
          <button onClick={() => handleRejectTransfer(offer.sender, offer.filename)}>Reject</button>
          <button onClick={() => handleCancelTransfer(offer.filename)}>Cancel</button>
        </div>
      ))}
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
