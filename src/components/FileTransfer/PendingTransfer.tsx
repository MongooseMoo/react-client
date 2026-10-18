import React from "react";
import { formatFileSize } from "./formatFileSize";
import "./PendingTransfer.css";

interface PendingTransferProps {
  filename: string;
  /** Size of the offered file in bytes. */
  size: number;
  senderLabel: string;
  onAccept: () => void;
  onReject: () => void;
}

const PendingTransfer: React.FC<PendingTransferProps> = ({
  filename,
  size,
  senderLabel,
  onAccept,
  onReject,
}) => {
  const descriptionId = React.useId();
  const offer = `${filename} from ${senderLabel}`;
  return (
    // Named by its description, so a user who tabs to the buttons also hears the size
    // they are asked to accept.
    // biome-ignore lint/a11y/useSemanticElements: a fieldset needs a legend, and this text is a sentence, not a caption.
    <div className="incoming-transfer" role="group" aria-labelledby={descriptionId}>
      <p id={descriptionId}>
        Incoming file: {filename} ({formatFileSize(size)}) from {senderLabel}
      </p>
      <button type="button" aria-label={`Accept ${offer}`} onClick={onAccept}>
        Accept
      </button>
      <button
        type="button"
        className="reject"
        aria-label={`Reject ${offer}`}
        onClick={onReject}
      >
        Reject
      </button>
    </div>
  );
};

export default PendingTransfer;
