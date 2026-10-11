import React from "react";
import type { HistoryEntry } from "./useTransferHistory";
import "./History.css";

interface TransferHistoryProps {
  history: HistoryEntry[];
}

/**
 * What happened, for reading back. Not a live region: its tab panel is hidden while
 * another tab shows, and a hidden live region says nothing. Each line is spoken as it is
 * written instead, by `useTransferHistory`.
 */
const History: React.FC<TransferHistoryProps> = ({ history }) => {
  const headingId = React.useId();
  return (
    <div className="transfer-history">
      <h4 id={headingId}>Transfer History</h4>
      <ul aria-labelledby={headingId}>
        {history.map((entry) => (
          <li key={entry.id}>{entry.text}</li>
        ))}
      </ul>
    </div>
  );
};

export default History;
