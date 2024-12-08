import React, { useState, useEffect, useCallback } from "react";
import MudClient from "../client";
import "./FileTransferUI.css";

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
  const [recipient, setRecipient] = useState<string>("");
  const [sendProgress, setSendProgress] = useState<number>(0);
  const [receiveProgress, setReceiveProgress] = useState<number>(0);
  const [pendingOffers, setPendingOffers] = useState<PendingOffer[]>([]);
  const [transferHistory, setTransferHistory] = useState<string[]>([]);

  const addToTransferHistory = useCallback((message: string) => {
    setTransferHistory((prevHistory) => [...prevHistory, message].slice(-10));
  }, []);

  const handleFileSendProgress = useCallback(
    (data: { filename: string; sentBytes: number; totalBytes: number }) => {
      const progress = (data.sentBytes / data.totalBytes) * 100;
      setSendProgress(progress);
    },
    []
  );

  const handleFileReceiveProgress = useCallback(
    (data: { filename: string; receivedBytes: number; totalBytes: number }) => {
      const progress = (data.receivedBytes / data.totalBytes) * 100;
      setReceiveProgress(progress);
    },
    []
  );

  const handleFileSendComplete = useCallback((filename: string) => {
    addToTransferHistory(`File sent successfully: ${filename}`);
    setSendProgress(0);
  }, [addToTransferHistory]);

  const handleFileReceiveComplete = useCallback(
    (data: { filename: string; file: Blob }) => {
      addToTransferHistory(`File received successfully: ${data.filename}`);
      setReceiveProgress(0);
      // Optionally handle the received file blob here (e.g., prompt download)
    },
    [addToTransferHistory]
  );

  const handleFileTransferError = useCallback(
    (data: { filename: string; direction: "send" | "receive"; error: string }) => {
      addToTransferHistory(`Error ${data.direction}ing file ${data.filename}: ${data.error}`);
      if (data.direction === "send") {
        setSendProgress(0);
      } else {
        setReceiveProgress(0);
      }
    },
    [addToTransferHistory]
  );

  const handleFileTransferCancelled = useCallback(
    (data: { filename: string; direction: "send" | "receive" }) => {
      addToTransferHistory(`File transfer cancelled: ${data.filename} (${data.direction})`);
      if (data.direction === "send") {
        setSendProgress(0);
      } else {
        setReceiveProgress(0);
      }
    },
    [addToTransferHistory]
  );

  const handleFileTransferRejected = useCallback(
    (data: { sender: string; filename: string }) => {
      addToTransferHistory(`File transfer rejected: ${data.filename} from ${data.sender}`);
    },
    [addToTransferHistory]
  );

  const handleFileTransferAccepted = useCallback(
    (data: { sender: string; filename: string }) => {
      // Just log acceptance; actual sending is handled internally by FileTransferManager.
      addToTransferHistory(`File transfer accepted: ${data.filename} by ${data.sender}`);
    },
    [addToTransferHistory]
  );

  const handleFileTransferOffer = useCallback(
    (data: PendingOffer) => {
      setPendingOffers((prevOffers) => [...prevOffers, data]);
      addToTransferHistory(`Incoming file offer: ${data.filename} from ${data.sender}`);
    },
    [addToTransferHistory]
  );

  useEffect(() => {
    // Set up event listeners
    client.on("fileTransferOffer", handleFileTransferOffer);
    client.on("fileTransferAccepted", handleFileTransferAccepted);
    client.on("fileSendProgress", handleFileSendProgress);
    client.on("fileReceiveProgress", handleFileReceiveProgress);
    client.on("fileTransferError", handleFileTransferError);
    client.on("fileTransferCancelled", handleFileTransferCancelled);
    client.on("fileTransferRejected", handleFileTransferRejected);
    client.on("fileSendComplete", handleFileSendComplete);
    client.on("fileReceiveComplete", handleFileReceiveComplete);

    return () => {
      // Clean up event listeners
      client.off("fileTransferOffer", handleFileTransferOffer);
      client.off("fileTransferAccepted", handleFileTransferAccepted);
      client.off("fileSendProgress", handleFileSendProgress);
      client.off("fileReceiveProgress", handleFileReceiveProgress);
      client.off("fileTransferError", handleFileTransferError);
      client.off("fileTransferCancelled", handleFileTransferCancelled);
      client.off("fileTransferRejected", handleFileTransferRejected);
      client.off("fileSendComplete", handleFileSendComplete);
      client.off("fileReceiveComplete", handleFileReceiveComplete);
    };
  }, [
    client,
    handleFileTransferOffer,
    handleFileTransferAccepted,
    handleFileSendProgress,
    handleFileReceiveProgress,
    handleFileTransferError,
    handleFileTransferCancelled,
    handleFileTransferRejected,
    handleFileSendComplete,
    handleFileReceiveComplete,
  ]);

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
      client
        .sendFile(selectedFile, recipient)
        .then(() => {
          addToTransferHistory(`Sending ${selectedFile.name} to ${recipient}`);
        })
        .catch((error) => {
          addToTransferHistory(`Error sending file: ${error.message}`);
        });
    }
  };

  const handleAcceptTransfer = (sender: string, filename: string) => {
    // Accepting an offer triggers FileTransferManager to handle the rest
    client.acceptTransfer(sender, filename);
    addToTransferHistory(`Accepting file transfer: ${filename} from ${sender}`);
    // Remove the offer from pendingOffers
    setPendingOffers((prevOffers) => prevOffers.filter((o) => o.filename !== filename || o.sender !== sender));
  };

  const handleRejectTransfer = (sender: string, filename: string) => {
    client.rejectTransfer(sender, filename);
    addToTransferHistory(`Rejected file transfer: ${filename} from ${sender}`);
    setPendingOffers((prevOffers) => prevOffers.filter((o) => o.filename !== filename || o.sender !== sender));
  };

  const handleCancelTransfer = (filename: string) => {
    client.cancelTransfer(filename);
    setPendingOffers((prevOffers) => prevOffers.filter((o) => o.filename !== filename));
  };

  return (
    <div className={`file-transfer-ui ${expanded ? "expanded" : "collapsed"}`}>
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
          <progress
            value={sendProgress > 0 ? sendProgress : receiveProgress}
            max="100"
          />
          <span>
            {(sendProgress > 0 ? sendProgress : receiveProgress).toFixed(2)}%
          </span>
        </div>
      )}
      {pendingOffers.map((offer) => (
        <div
          key={`${offer.sender}-${offer.filename}`}
          className="incoming-transfer"
        >
          <p>
            Incoming file: {offer.filename} from {offer.sender}
          </p>
          <button
            onClick={() => handleAcceptTransfer(offer.sender, offer.filename)}
          >
            Accept
          </button>
          <button
            onClick={() => handleRejectTransfer(offer.sender, offer.filename)}
          >
            Reject
          </button>
          <button onClick={() => handleCancelTransfer(offer.filename)}>
            Cancel
          </button>
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
