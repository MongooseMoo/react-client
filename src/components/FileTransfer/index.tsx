import React, { useCallback, useEffect, useMemo, useState } from "react";
import MudClient from "../../client";
import type { UserlistPlayer } from "../../mcp";
import {
  findTransferPeerByAddress,
  userlistPlayersToTransferPeers,
} from "../../fileTransferPeers";
import type { TransferPeer } from "../../fileTransferPeers";
import Controls from "./Controls";
import ProgressBar from "./ProgressBar";
import PendingTransfer from "./PendingTransfer";
import History from "./History";
import "./styles.css";

interface FileTransferUIProps {
  client: MudClient;
  expanded: boolean;
  users: UserlistPlayer[];
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
  users,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedRecipient, setSelectedRecipient] =
    useState<TransferPeer | null>(null);
  const [sendProgress, setSendProgress] = useState<number>(0);
  const [receiveProgress, setReceiveProgress] = useState<number>(0);
  const [pendingOffers, setPendingOffers] = useState<PendingOffer[]>([]);
  const [transferHistory, setTransferHistory] = useState<string[]>([]);
  const recipients = useMemo(
    () => userlistPlayersToTransferPeers(users),
    [users]
  );

  const addToTransferHistory = useCallback((message: string) => {
    setTransferHistory((prevHistory) => [...prevHistory, message].slice(-10));
  }, []);

  const getPeerLabel = useCallback(
    (address: string) =>
      findTransferPeerByAddress(recipients, address)?.label ?? address,
    [recipients]
  );

  useEffect(() => {
    if (
      selectedRecipient &&
      !recipients.some((recipient) => recipient.id === selectedRecipient.id)
    ) {
      setSelectedRecipient(null);
    }
  }, [recipients, selectedRecipient]);

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
        `File transfer rejected: ${data.filename} from ${getPeerLabel(
          data.sender
        )}`
      );
    },
    [addToTransferHistory, getPeerLabel]
  );

  const handleFileTransferAccepted = useCallback(
    (data: { sender: string; filename: string }) => {
      // Just log acceptance; actual sending is handled internally by FileTransferManager.
      addToTransferHistory(
        `File transfer accepted: ${data.filename} by ${getPeerLabel(
          data.sender
        )}`
      );
    },
    [addToTransferHistory, getPeerLabel]
  );

  const handleFileTransferOffer = useCallback(
    (data: PendingOffer) => {
      setPendingOffers((prevOffers) => [...prevOffers, data]);
      addToTransferHistory(
        `Incoming file offer: ${data.filename} from ${getPeerLabel(
          data.sender
        )}`
      );
    },
    [addToTransferHistory, getPeerLabel]
  );

  useEffect(() => {
    // Set up event listeners
    client.on("fileTransferOffer", handleFileTransferOffer);
    client.on("fileTransferAccepted", handleFileTransferAccepted);
    client.fileTransferManager.on("fileSendProgress", handleFileSendProgress);
    client.fileTransferManager.on(
      "fileReceiveProgress",
      handleFileReceiveProgress
    );
    client.on("fileTransferError", handleFileTransferError);
    client.on("fileTransferCancelled", handleFileTransferCancelled);
    client.on("fileTransferRejected", handleFileTransferRejected);
    client.on("fileSendComplete", handleFileSendComplete);
    client.fileTransferManager.on(
      "fileReceiveComplete",
      handleFileReceiveComplete
    );

    return () => {
      // Clean up event listeners
      client.off("fileTransferOffer", handleFileTransferOffer);
      client.off("fileTransferAccepted", handleFileTransferAccepted);
      client.fileTransferManager.off(
        "fileSendProgress",
        handleFileSendProgress
      );
      client.fileTransferManager.off(
        "fileReceiveProgress",
        handleFileReceiveProgress
      );
      client.off("fileTransferError", handleFileTransferError);
      client.off("fileTransferCancelled", handleFileTransferCancelled);
      client.off("fileTransferRejected", handleFileTransferRejected);
      client.off("fileSendComplete", handleFileSendComplete);
      client.fileTransferManager.off(
        "fileReceiveComplete",
        handleFileReceiveComplete
      );
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
    if (selectedFile && selectedRecipient) {
      client
        .sendFile(selectedFile, selectedRecipient.transferAddress)
        .then(() => {
          addToTransferHistory(
            `Sending ${selectedFile.name} to ${selectedRecipient.label}`
          );
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
        `Accepting file transfer: ${offer.filename} from ${getPeerLabel(
          sender
        )}`
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
        `Rejected file transfer: ${offer.filename} from ${getPeerLabel(
          sender
        )}`
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
        onRecipientChange={setSelectedRecipient}
        onSendFile={handleSendFile}
        selectedFile={selectedFile}
        selectedRecipient={selectedRecipient}
        recipients={recipients}
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
