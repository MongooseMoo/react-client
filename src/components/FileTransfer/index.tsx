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

  // Event handlers remain the same as in the original component
  // ... (copy all the event handlers from the original component)

  useEffect(() => {
    // Event listeners setup remains the same as in the original component
    // ... (copy the useEffect from the original component)
  }, [/* dependencies */]);

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
        <ProgressBar progress={sendProgress > 0 ? sendProgress : receiveProgress} />
      )}

      {pendingOffers.map((offer) => (
        <PendingTransfer
          key={`${offer.sender}-${offer.filename}`}
          offer={offer}
          onAccept={handleAcceptTransfer}
          onReject={handleRejectTransfer}
          onCancel={handleCancelTransfer}
        />
      ))}

      <History history={transferHistory} />
    </div>
  );
};

export default FileTransferUI;
