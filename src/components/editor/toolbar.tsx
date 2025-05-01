import React from 'react';
import { FaDownload, FaSave, FaUndo } from "react-icons/fa";
interface ToolbarProps {
    onSave: (event: React.MouseEvent<HTMLButtonElement>) => void;
    onRevert: (event: React.MouseEvent<HTMLButtonElement>) => void;
    onDownload: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function EditorToolbar({ onSave, onRevert, onDownload }: ToolbarProps) {
    // Use a more specific class name to avoid conflicts
    return (
        <div className="editor-toolbar">
            {/* Remove inline styles, move to editor.css */}
            <form onSubmit={(event) => event.preventDefault()}>
                {/* Consider adding aria-labels or improving accessibility */}
                <button onClick={onSave} accessKey="s" title="Save (Alt+S)">
                    <FaSave aria-hidden="true" />
                    Save
                </button>
                <button onClick={onRevert} accessKey="r" title="Revert (Alt+R)">
                    <FaUndo aria-hidden="true" />
                    Revert
                </button>
                <button onClick={onDownload} accessKey="d" title="Download (Alt+D)">
                    <FaDownload aria-hidden="true" />
                    Download
                </button>
            </form>
        </div>
    );
}
