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
  recipientInputRef?: React.Ref<HTMLInputElement>;
}

const Controls: React.FC<FileTransferControlsProps> = ({
  onFileChange,
  onRecipientChange,
  onSendFile,
  selectedFile,
  selectedRecipient,
  recipients,
  recipientInputRef,
}) => {
  const fileInputId = React.useId();
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

  const activeRecipient = matchingRecipients[activeRecipientIndex];
  const optionId = (recipient: TransferPeer) => `${recipientListId}-${recipient.id}`;
  const hasOptions = isRecipientListOpen && matchingRecipients.length > 0;
  const nobody =
    isRecipientListOpen && matchingRecipients.length === 0
      ? recipients.length === 0
        ? "No connected players"
        : "No matching players"
      : "";

  // The highlighted option moves by the arrow keys, which do not scroll the list themselves.
  useEffect(() => {
    if (hasOptions && activeRecipient) {
      document.getElementById(`${recipientListId}-${activeRecipient.id}`)
        ?.scrollIntoView?.({ block: "nearest" });
    }
  }, [hasOptions, activeRecipient, recipientListId]);

  return (
    <div className="file-transfer-controls">
      <label htmlFor={fileInputId} className="sr-only">
        File to send
      </label>
      <input id={fileInputId} type="file" onChange={handleFileChange} />
      <div className="file-transfer-recipient">
        <label htmlFor={recipientInputId} className="sr-only">
          Recipient
        </label>
        <input
          ref={recipientInputRef}
          id={recipientInputId}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={hasOptions}
          aria-controls={recipientListId}
          aria-activedescendant={
            hasOptions && activeRecipient ? optionId(activeRecipient) : undefined
          }
          placeholder="Recipient"
          value={recipientQuery}
          onChange={handleRecipientChange}
          onFocus={() => setIsRecipientListOpen(true)}
          onBlur={() => setIsRecipientListOpen(false)}
          onKeyDown={handleRecipientKeyDown}
        />
        {/* Always in the document, so that `aria-controls` never points at nothing. */}
        <div
          id={recipientListId}
          className="file-transfer-recipient-list"
          role="listbox"
          aria-label="Players"
          hidden={!hasOptions}
        >
          {matchingRecipients.map((recipient, index) => (
            // biome-ignore lint/a11y/useFocusableInteractive: options are reached through aria-activedescendant; focus stays in the input.
            <div
              key={recipient.id}
              id={optionId(recipient)}
              className={
                index === activeRecipientIndex
                  ? "file-transfer-recipient-option active"
                  : "file-transfer-recipient-option"
              }
              role="option"
              // The highlighted option, which is what a screen reader follows; the chosen
              // player is the input's value.
              aria-selected={index === activeRecipientIndex}
              onMouseDown={(event) => {
                event.preventDefault();
                selectRecipient(recipient);
              }}
            >
              <span>{recipient.label}</span>
            </div>
          ))}
        </div>
        {nobody && (
          <div
            className="file-transfer-recipient-list file-transfer-recipient-empty"
            aria-hidden="true"
          >
            {nobody}
          </div>
        )}
        {/* An empty list cannot be heard; this says so. It exists before it has anything
            to say, as a status must to be announced. */}
        <span role="status" className="sr-only">
          {nobody}
        </span>
      </div>
      <button
        type="button"
        onClick={onSendFile}
        disabled={!selectedFile || !selectedRecipient}
      >
        Send File
      </button>
    </div>
  );
};

export default Controls;
