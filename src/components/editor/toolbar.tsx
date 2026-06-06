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
      {/*
        These editor shortcuts (Alt+S save, Alt+R revert, Alt+D download) are
        relied on for keyboard-only editing, so the accessKey attributes stay
        despite the general a11y guidance against them.
      */}
      <form onSubmit={(event) => event.preventDefault()}>
        {/* biome-ignore lint/a11y/noAccessKey: intentional Alt+S save shortcut. */}
        <button accessKey="s" onClick={onSave} title="Save (Alt+S)" type="button">
          <FaSave aria-hidden="true" />
          Save
        </button>
        {/* biome-ignore lint/a11y/noAccessKey: intentional Alt+R revert shortcut. */}
        <button accessKey="r" onClick={onRevert} title="Revert (Alt+R)" type="button">
          <FaUndo aria-hidden="true" />
          Revert
        </button>
        {/* biome-ignore lint/a11y/noAccessKey: intentional Alt+D download shortcut. */}
        <button accessKey="d" onClick={onDownload} title="Download (Alt+D)" type="button">
          <FaDownload aria-hidden="true" />
          Download
        </button>
      </form>
    </div>
  );
}
