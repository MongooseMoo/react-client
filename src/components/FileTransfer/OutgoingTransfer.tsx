import React from "react";
import "./OutgoingTransfer.css";

interface OutgoingTransferProps {
  filename: string;
  recipientLabel: string;
  onCancel: () => void;
}

/**
 * A file offered and not yet answered. Not a live region: the row appears together with
 * its text, which a screen reader would miss, and the offer is spoken with the history.
 */
const OutgoingTransfer: React.FC<OutgoingTransferProps> = ({
  filename,
  recipientLabel,
  onCancel,
}) => {
  const descriptionId = React.useId();
  return (
    // biome-ignore lint/a11y/useSemanticElements: a fieldset needs a legend, and this text is a sentence, not a caption.
    <div className="outgoing-transfer" role="group" aria-labelledby={descriptionId}>
      <span className="outgoing-transfer-spinner" aria-hidden="true" />
      <p id={descriptionId}>
        Waiting for <strong>{recipientLabel}</strong> to accept{" "}
        <strong>{filename}</strong>&hellip;
      </p>
      <button
        type="button"
        className="file-transfer-cancel"
        aria-label={`Cancel offer of ${filename} to ${recipientLabel}`}
        onClick={onCancel}
      >
        Cancel
      </button>
    </div>
  );
};

export default OutgoingTransfer;
