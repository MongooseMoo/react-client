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
    // Use a more specific class name to avoid conflicts
    return (
        <div
            aria-live="polite"
            className="editor-statusbar"
            // Remove inline styles, move to editor.css
        >
            <span>{docstate}</span>
            <span aria-hidden="true">|</span>
            <span>{session.reference}</span>
            <span aria-hidden="true">|</span>
            <span>{session.type}</span>
        </div>
    );
}
