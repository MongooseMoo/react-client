import React from "react";
import "./OutgoingTransfer.css";

interface OutgoingTransferProps {
  filename: string;
  recipientLabel: string;
}

const OutgoingTransfer: React.FC<OutgoingTransferProps> = ({
  filename,
  recipientLabel,
}) => {
  return (
    <div className="outgoing-transfer" role="status" aria-live="polite">
      <span className="outgoing-transfer-spinner" aria-hidden="true" />
      <p>
        Waiting for <strong>{recipientLabel}</strong> to accept{" "}
        <strong>{filename}</strong>&hellip;
      </p>
    </div>
  );
};

export default OutgoingTransfer;
