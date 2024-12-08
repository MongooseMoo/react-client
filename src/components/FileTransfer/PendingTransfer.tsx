import React from "react";
import "./PendingTransfer.css";

interface PendingOffer {
  sender: string;
  filename: string;
  filesize: number;
}

interface PendingTransferProps {
  offer: PendingOffer;
  onAccept: (sender: string, filename: string) => void;
  onReject: (sender: string, filename: string) => void;
  onCancel: (filename: string) => void;
}

const PendingTransfer: React.FC<PendingTransferProps> = ({
  offer,
  onAccept,
  onReject,
  onCancel,
}) => {
  return (
    <div className="incoming-transfer">
      <p>
        Incoming file: {offer.filename} from {offer.sender}
      </p>
      <button onClick={() => onAccept(offer.sender, offer.filename)}>
        Accept
      </button>
      <button onClick={() => onReject(offer.sender, offer.filename)}>
        Reject
      </button>
      <button onClick={() => onCancel(offer.filename)}>Cancel</button>
    </div>
  );
};

export default PendingTransfer;
