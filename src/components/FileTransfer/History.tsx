import React from "react";
import "./History.css";

interface TransferHistoryProps {
  history: string[];
}

const History: React.FC<TransferHistoryProps> = ({ history }) => {
  return (
    <div className="transfer-history" aria-live="polite">
      <h4>Transfer History</h4>
      <ul>
        {history.map((entry, index) => (
          <li key={index}>{entry}</li>
        ))}
      </ul>
    </div>
  );
};

export default History;
