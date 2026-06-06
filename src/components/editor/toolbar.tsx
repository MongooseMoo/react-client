import type React from 'react';
import { FaDownload, FaSave, FaUndo } from 'react-icons/fa';

interface ToolbarProps {
  onSave: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onRevert: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onDownload: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function EditorToolbar({ onSave, onRevert, onDownload }: ToolbarProps) {
  return (
    <div className="editor-toolbar">
      <form onSubmit={(event) => event.preventDefault()}>
        <button onClick={onSave} title="Save" type="button">
          <FaSave aria-hidden="true" />
          Save
        </button>
        <button onClick={onRevert} title="Revert" type="button">
          <FaUndo aria-hidden="true" />
          Revert
        </button>
        <button onClick={onDownload} title="Download" type="button">
          <FaDownload aria-hidden="true" />
          Download
        </button>
      </form>
    </div>
  );
}
