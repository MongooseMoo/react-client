import React, { forwardRef } from "react";
import "./History.css";

interface TransferHistoryProps {
  history: string[];
}

const History = forwardRef<HTMLDivElement, TransferHistoryProps>(({ history }, ref) => {
  return (
    <div className="transfer-history" aria-live="polite" ref={ref} tabIndex={-1}>
      <h4>Transfer History</h4>
      <ul>
        {history.map((entry, index) => (
          <li key={index}>{entry}</li>
        ))}
      </ul>
    </div>
  );
});

History.displayName = 'History';

export default History;
