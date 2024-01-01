import React from 'react';
import { FaDownload, FaSave, FaUndo } from "react-icons/fa";
interface ToolbarProps {
    onSave: (event: React.MouseEvent<HTMLButtonElement>) => void;
    onRevert: (event: React.MouseEvent<HTMLButtonElement>) => void;
    onDownload: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function EditorToolbar({ onSave, onRevert, onDownload }: ToolbarProps) {
    return (
        <div
            className="toolbar"
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0 1rem",
                height: "10vh",
                backgroundColor: "#f5f5f5",
                borderBottom: "1px solid #e8e8e8",
            }}
        >
            <form onSubmit={(event) => event.preventDefault()}>
                <button onClick={onSave} accessKey="s">
                    <FaSave />
                    Save
                </button>
                <button onClick={onRevert} accessKey="r">
                    <FaUndo />
                    Revert
                </button>
                <button onClick={onDownload} accessKey="d">
                    <FaDownload />
                    Download
                </button>
            </form>
        </div>
    );
}
