import React from "react";
import type { TransferSnapshot } from "../../fileTransfer/types";
import "./ProgressBar.css";

interface TransferProgressBarProps {
  transfer: TransferSnapshot;
  peerLabel: string;
  onCancel: () => void;
}

/**
 * One transfer on its way: what it is, how far it has come, and the way to stop it.
 * Nothing here is a live region: a percentage that changes with every piece would never
 * stop talking. A screen reader reads the bar when the user goes to it.
 */
const ProgressBar: React.FC<TransferProgressBarProps> = ({
  transfer,
  peerLabel,
  onCancel,
}) => {
  const labelId = React.useId();
  const { direction, name, size, transferredBytes, state } = transfer;
  const fraction = size === 0 ? 0 : transferredBytes / size;
  const what =
    direction === "send"
      ? `sending ${name} to ${peerLabel}`
      : `receiving ${name} from ${peerLabel}`;
  // Before and after the bytes move the bar's number says nothing; these words do.
  const phase =
    state === "connecting"
      ? "Connecting…"
      : state === "verifying"
        ? "Verifying…"
        : undefined;

  return (
    // biome-ignore lint/a11y/useSemanticElements: a fieldset needs a legend, and this text is a sentence, not a caption.
    <div className="progress-bar" role="group" aria-labelledby={labelId}>
      <p id={labelId}>{what.charAt(0).toUpperCase() + what.slice(1)}</p>
      <progress
        aria-labelledby={labelId}
        aria-valuetext={phase}
        // Without a value the bar is indeterminate, which is the truth while connecting.
        value={state === "connecting" ? undefined : fraction}
      />
      <span aria-hidden="true">{phase ?? `${Math.floor(fraction * 100)}%`}</span>
      <button
        type="button"
        className="file-transfer-cancel"
        aria-label={`Cancel ${what}`}
        onClick={onCancel}
      >
        Cancel
      </button>
    </div>
  );
};

export default ProgressBar;
