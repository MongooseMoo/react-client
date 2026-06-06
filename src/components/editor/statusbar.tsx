import type React from 'react';

interface Session {
  reference: string;
  type: string;
}

interface EditorStatusBarProps {
  diagnosticsSummary?: string;
  docstate: string;
  session: Session;
}

export const EditorStatusBar: React.FC<EditorStatusBarProps> = ({
  diagnosticsSummary,
  docstate,
  session,
}) => {
  return (
    <div aria-live="polite" className="editor-statusbar">
      <span>{docstate}</span>
      <span aria-hidden="true">|</span>
      <span>{session.reference}</span>
      <span aria-hidden="true">|</span>
      <span>{session.type}</span>
      {diagnosticsSummary ? (
        <>
          <span aria-hidden="true">|</span>
          <span>{diagnosticsSummary}</span>
        </>
      ) : null}
    </div>
  );
};
