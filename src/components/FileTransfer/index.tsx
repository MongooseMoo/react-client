import React, { useCallback, useEffect, useState } from "react";
import MudClient from "../../client";
import Controls from "./Controls";
import ProgressBar from "./ProgressBar";
import PendingTransfer from "./PendingTransfer";
import History from "./History";
import { FileTransferEvents } from "../../FileTransferManager";
import "./styles.css";

interface FileTransferUIProps {
  client: MudClient;
  expanded: boolean;
}

interface Transfer {
  filename: string;
  hash: string;
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
  const [outgoingTransfers] = useState<Map<string, Transfer>>(new Map());
  const [incomingTransfers] = useState<Map<string, Transfer>>(new Map());
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
    (data: Parameters<FileTransferEvents["fileTransferCancelled"]>[0]) => {
      const transfer = [...outgoingTransfers.values(), ...incomingTransfers.values()]
        .find(t => t.hash === data.hash);
      if (transfer) {
        addToTransferHistory(
          `File transfer cancelled: ${transfer.filename} from ${data.sender}`
        );
        if (outgoingTransfers.has(data.hash)) {
          setSendProgress(0);
        } else {
          setReceiveProgress(0);
        }
      }
    },
    [addToTransferHistory, outgoingTransfers, incomingTransfers]
  );

  const handleFileTransferRejected = useCallback(
    (data: Parameters<FileTransferEvents["fileTransferRejected"]>[0]) => {
      const offer = pendingOffers.find(o => o.hash === data.hash);
      if (offer) {
        addToTransferHistory(
          `File transfer rejected: ${offer.filename} from ${data.sender}`
        );
      }
    },
    [addToTransferHistory, pendingOffers]
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
    const manager = client.fileTransferManager;
    manager.on("fileTransferOffer", handleFileTransferOffer);
    manager.on("fileTransferAccepted", handleFileTransferAccepted);
    manager.on("fileSendProgress", handleFileSendProgress);
    manager.on("fileReceiveProgress", handleFileReceiveProgress);
    manager.on("fileTransferError", handleFileTransferError);
    manager.on("fileTransferCancelled", handleFileTransferCancelled);
    manager.on("fileTransferRejected", handleFileTransferRejected);
    manager.on("fileSendComplete", handleFileSendComplete);
    manager.on("fileReceiveComplete", handleFileReceiveComplete);

    return () => {
      // Clean up event listeners
      manager.off("fileTransferOffer", handleFileTransferOffer);
      manager.off("fileTransferAccepted", handleFileTransferAccepted);
      client.fileTransferManager.off("fileSendProgress", handleFileSendProgress);
      client.fileTransferManager.off("fileReceiveProgress", handleFileReceiveProgress);
      manager.off("fileTransferError", handleFileTransferError);
      manager.off("fileTransferCancelled", handleFileTransferCancelled);
      manager.off("fileTransferRejected", handleFileTransferRejected);
      manager.off("fileSendComplete", handleFileSendComplete);
      manager.off("fileReceiveComplete", handleFileReceiveComplete);
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
      client.fileTransferManager
        .sendFile(selectedFile, recipient)
        .then(() => {
          addToTransferHistory(`Sending ${selectedFile.name} to ${recipient}`);
        })
        .catch((error) => {
          addToTransferHistory(`Error sending file: ${error.message}`);
        });
    }
  };

  const handleAcceptTransfer = async (sender: string, hash: string) => {
    try {
      await client.fileTransferManager.acceptTransfer(sender, hash);
      const offer = pendingOffers.find((o) => o.hash === hash);
      if (offer) {
        addToTransferHistory(
          `Accepting file transfer: ${offer.filename} from ${sender}`
        );
      }
      setPendingOffers((prevOffers) => prevOffers.filter((o) => o.hash !== hash));
    } catch (error) {
      addToTransferHistory(
        `Error accepting transfer: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  const handleRejectTransfer = async (sender: string, hash: string) => {
    try {
      await client.fileTransferManager.rejectTransfer(sender, hash);
      const offer = pendingOffers.find((o) => o.hash === hash);
      if (offer) {
        addToTransferHistory(
          `Rejected file transfer: ${offer.filename} from ${sender}`
        );
      }
      setPendingOffers((prevOffers) => prevOffers.filter((o) => o.hash !== hash));
    } catch (error) {
      addToTransferHistory(
        `Error rejecting transfer: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  const handleCancelTransfer = (hash: string) => {
    client.fileTransferManager.cancelTransfer(hash);
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
