import React, { useEffect, useMemo, useState } from "react";
import type { TransferPeer } from "../../fileTransferPeers";
import "./Controls.css";

interface FileTransferControlsProps {
  onFileChange: (file: File) => void;
  onRecipientChange: (recipient: TransferPeer | null) => void;
  onSendFile: () => void;
  selectedFile: File | null;
  selectedRecipient: TransferPeer | null;
  recipients: TransferPeer[];
}

const Controls: React.FC<FileTransferControlsProps> = ({
  onFileChange,
  onRecipientChange,
  onSendFile,
  selectedFile,
  selectedRecipient,
  recipients,
}) => {
  const recipientInputId = React.useId();
  const recipientListId = React.useId();
  const [recipientQuery, setRecipientQuery] = useState("");
  const [isRecipientListOpen, setIsRecipientListOpen] = useState(false);
  const [activeRecipientIndex, setActiveRecipientIndex] = useState(0);

  const matchingRecipients = useMemo(() => {
    const normalizedQuery = recipientQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return recipients;
    }

    return recipients.filter((recipient) =>
      recipient.label.toLowerCase().includes(normalizedQuery)
    );
  }, [recipientQuery, recipients]);

  useEffect(() => {
    setRecipientQuery(selectedRecipient?.label ?? "");
  }, [selectedRecipient]);

  useEffect(() => {
    if (activeRecipientIndex >= matchingRecipients.length) {
      setActiveRecipientIndex(0);
    }
  }, [activeRecipientIndex, matchingRecipients.length]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onFileChange(event.target.files[0]);
    }
  };

  const selectRecipient = (recipient: TransferPeer) => {
    onRecipientChange(recipient);
    setRecipientQuery(recipient.label);
    setIsRecipientListOpen(false);
  };

  const handleRecipientChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const nextQuery = event.target.value;
    const exactMatch =
      recipients.find(
        (recipient) =>
          recipient.label.toLowerCase() === nextQuery.trim().toLowerCase()
      ) ?? null;

    setRecipientQuery(nextQuery);
    onRecipientChange(exactMatch);
    setIsRecipientListOpen(true);
    setActiveRecipientIndex(0);
  };

  const handleRecipientKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsRecipientListOpen(true);
      setActiveRecipientIndex((index) =>
        matchingRecipients.length === 0
          ? 0
          : (index + 1) % matchingRecipients.length
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setIsRecipientListOpen(true);
      setActiveRecipientIndex((index) =>
        matchingRecipients.length === 0
          ? 0
          : (index - 1 + matchingRecipients.length) %
            matchingRecipients.length
      );
    } else if (event.key === "Enter" && isRecipientListOpen) {
      const activeRecipient = matchingRecipients[activeRecipientIndex];
      if (activeRecipient) {
        event.preventDefault();
        selectRecipient(activeRecipient);
      }
    } else if (event.key === "Escape") {
      setIsRecipientListOpen(false);
    }
  };

  return (
    <div className="file-transfer-controls">
      <input type="file" onChange={handleFileChange} />
      <div className="file-transfer-recipient">
        <label htmlFor={recipientInputId} className="sr-only">
          Recipient
        </label>
        <input
          id={recipientInputId}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isRecipientListOpen}
          aria-controls={recipientListId}
          aria-activedescendant={
            isRecipientListOpen && matchingRecipients[activeRecipientIndex]
              ? `${recipientListId}-${matchingRecipients[activeRecipientIndex].id}`
              : undefined
          }
          placeholder="Recipient"
          value={recipientQuery}
          onChange={handleRecipientChange}
          onFocus={() => setIsRecipientListOpen(true)}
          onBlur={() => setIsRecipientListOpen(false)}
          onKeyDown={handleRecipientKeyDown}
        />
        {isRecipientListOpen && (
          <ul
            id={recipientListId}
            className="file-transfer-recipient-list"
            role="listbox"
          >
            {matchingRecipients.length === 0 ? (
              <li className="file-transfer-recipient-empty">
                No connected players
              </li>
            ) : (
              matchingRecipients.map((recipient, index) => (
                <li
                  key={recipient.id}
                  id={`${recipientListId}-${recipient.id}`}
                  className={
                    index === activeRecipientIndex
                      ? "file-transfer-recipient-option active"
                      : "file-transfer-recipient-option"
                  }
                  role="option"
                  aria-selected={selectedRecipient?.id === recipient.id}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    selectRecipient(recipient);
                  }}
                >
                  <span>{recipient.label}</span>
                  {(recipient.away || recipient.idle) && (
                    <span className="file-transfer-recipient-status">
                      {[recipient.away ? "away" : "", recipient.idle ? "idle" : ""]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  )}
                </li>
              ))
            )}
          </ul>
        )}
      </div>
      <button
        onClick={onSendFile}
        disabled={!selectedFile || !selectedRecipient}
      >
        Send File
      </button>
    </div>
  );
};

export default Controls;
