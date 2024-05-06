import React from 'react';

interface Session {
    reference: string;
    type: string;
}

interface EditorStatusBarProps {
    docstate: string;
    session: Session;
}

export const EditorStatusBar: React.FC<EditorStatusBarProps> = ({ docstate, session }) => {
    return (
        <div
            aria-live="polite"
            className="statusbar"
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0 1rem",
                height: "10vh",
                backgroundColor: "#f5f5f5",
                borderTop: "1px solid #e8e8e8",
            }}
        >
            <span>{docstate}</span>
            <span>|</span>
            <span>{session.reference}</span>
            <span>|</span>
            <span>{session.type}</span>
        </div>
    );
}
