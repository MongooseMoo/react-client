import React from "react";
import "./PendingTransfer.css";

interface PendingOffer {
  sender: string;
  filename: string;
  filesize: number;
  hash: string;
}

interface PendingTransferProps {
  offer: PendingOffer;
  onAccept: (sender: string, hash: string) => void;
  onReject: (sender: string, hash: string) => void;
}

const PendingTransfer: React.FC<PendingTransferProps> = ({
  offer,
  onAccept,
  onReject,
}) => {
  return (
    <div className="incoming-transfer">
      <p>
        Incoming file: {offer.filename} from {offer.sender}
      </p>
      <button onClick={() => onAccept(offer.sender, offer.hash)}>
        Accept
      </button>
      <button onClick={() => onReject(offer.sender, offer.hash)}>
        Reject
      </button>
    </div>
  );
};

export default PendingTransfer;
