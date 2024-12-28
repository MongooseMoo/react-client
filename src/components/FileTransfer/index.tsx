import React, { useCallback, useEffect, useState } from "react";
import MudClient from "../../client";
import Controls from "./Controls";
import ProgressBar from "./ProgressBar";
import PendingTransfer from "./PendingTransfer";
import History from "./History";
import "./styles.css";

interface FileTransferUIProps {
  client: MudClient;
  expanded: boolean;
}

interface PendingOffer {
  sender: string;
  filename: string;
  filesize: number;
  hash: string;
}

const FileTransferUI: React.FC<FileTransferUIProps> = ({
  client,
  expanded,
}) => {
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

  const handleFileSendComplete = useCallback(
    (data: { filename: string; hash: string }) => {
      addToTransferHistory(`File sent successfully: ${data.filename}`);
      setSendProgress(0);
    },
    [addToTransferHistory]
  );

  const handleFileReceiveComplete = useCallback(
    (data: { filename: string; file: Blob }) => {
      addToTransferHistory(`File received successfully: ${data.filename}`);
      setReceiveProgress(0);
      // Optionally handle the received file blob here (e.g., prompt download)
    },
    [addToTransferHistory]
  );

  const handleFileTransferError = useCallback(
    (data: {
      filename: string;
      direction: "send" | "receive";
      error: string;
    }) => {
      addToTransferHistory(
        `Error ${data.direction}ing file ${data.filename}: ${data.error}`
      );
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
      addToTransferHistory(
        `File transfer cancelled: ${data.filename} (${data.direction})`
      );
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
      addToTransferHistory(
        `File transfer rejected: ${data.filename} from ${data.sender}`
      );
    },
    [addToTransferHistory]
  );

  const handleFileTransferAccepted = useCallback(
    (data: { sender: string; filename: string }) => {
      // Just log acceptance; actual sending is handled internally by FileTransferManager.
      addToTransferHistory(
        `File transfer accepted: ${data.filename} by ${data.sender}`
      );
    },
    [addToTransferHistory]
  );

  const handleFileTransferOffer = useCallback(
    (data: PendingOffer) => {
      setPendingOffers((prevOffers) => [...prevOffers, data]);
      addToTransferHistory(
        `Incoming file offer: ${data.filename} from ${data.sender}`
      );
    },
    [addToTransferHistory]
  );

  useEffect(() => {
    // Set up event listeners
    client.on("fileTransferOffer", handleFileTransferOffer);
    client.on("fileTransferAccepted", handleFileTransferAccepted);
    client.fileTransferManager.on("fileSendProgress", handleFileSendProgress);
    client.fileTransferManager.on("fileReceiveProgress", handleFileReceiveProgress);
    client.on("fileTransferError", handleFileTransferError);
    client.on("fileTransferCancelled", handleFileTransferCancelled);
    client.on("fileTransferRejected", handleFileTransferRejected);
    client.on("fileSendComplete", handleFileSendComplete);
    client.on("fileReceiveComplete", handleFileReceiveComplete);

    return () => {
      // Clean up event listeners
      client.off("fileTransferOffer", handleFileTransferOffer);
      client.off("fileTransferAccepted", handleFileTransferAccepted);
      client.fileTransferManager.off("fileSendProgress", handleFileSendProgress);
      client.fileTransferManager.off("fileReceiveProgress", handleFileReceiveProgress);
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

  const handleAcceptTransfer = (sender: string, hash: string) => {
    // Accepting an offer triggers FileTransferManager to handle the rest
    client.acceptTransfer(sender, hash);
    const offer = pendingOffers.find((o) => o.hash === hash);
    if (offer) {
      addToTransferHistory(
        `Accepting file transfer: ${offer.filename} from ${sender}`
      );
    }
    // Remove the offer from pendingOffers
    setPendingOffers((prevOffers) => prevOffers.filter((o) => o.hash !== hash));
  };

  const handleRejectTransfer = (sender: string, hash: string) => {
    client.rejectTransfer(sender, hash);
    const offer = pendingOffers.find((o) => o.hash === hash);
    if (offer) {
      addToTransferHistory(
        `Rejected file transfer: ${offer.filename} from ${sender}`
      );
    }
    setPendingOffers((prevOffers) => prevOffers.filter((o) => o.hash !== hash));
  };

  const handleCancelTransfer = (hash: string) => {
    client.cancelTransfer(hash);
    setPendingOffers((prevOffers) => prevOffers.filter((o) => o.hash !== hash));
  };

  return (
    <div className={`file-transfer-ui ${expanded ? "expanded" : "collapsed"}`}>
      <h3>File Transfer</h3>

      <Controls
        onFileChange={setSelectedFile}
        onRecipientChange={setRecipient}
        onSendFile={handleSendFile}
        selectedFile={selectedFile}
        recipient={recipient}
      />

      {(sendProgress > 0 || receiveProgress > 0) && (
        <ProgressBar
          progress={sendProgress > 0 ? sendProgress : receiveProgress}
        />
      )}

      {pendingOffers.map((offer) => (
        <PendingTransfer
          key={`${offer.sender}-${offer.filename}`}
          offer={offer}
          onAccept={handleAcceptTransfer}
          onReject={handleRejectTransfer}
        />
      ))}

      <History history={transferHistory} />
    </div>
  );
};

export default FileTransferUI;
