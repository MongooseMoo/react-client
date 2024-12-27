import React from "react";
import "./Controls.css";

interface FileTransferControlsProps {
  onFileChange: (file: File) => void;
  onRecipientChange: (recipient: string) => void;
  onSendFile: () => void;
  selectedFile: File | null;
  recipient: string;
}

const Controls: React.FC<FileTransferControlsProps> = ({
  onFileChange,
  onRecipientChange,
  onSendFile,
  selectedFile,
  recipient,
}) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onFileChange(event.target.files[0]);
    }
  };

  const handleRecipientChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onRecipientChange(event.target.value);
  };

  return (
    <div className="file-transfer-controls">
      <input type="file" onChange={handleFileChange} />
      <input
        type="text"
        placeholder="Recipient"
        value={recipient}
        onChange={handleRecipientChange}
      />
      <button onClick={onSendFile} disabled={!selectedFile || !recipient}>
        Send File
      </button>
    </div>
  );
};

export default Controls;
