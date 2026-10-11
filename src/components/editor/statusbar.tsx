import type React from 'react';

interface Session {
  reference: string;
  type: string;
}

interface EditorStatusBarProps {
  diagnosticsSummary?: string;
  diagnosticsEnabled?: boolean;
  docstate: string;
  id?: string;
  onDiagnosticsClick?: () => void;
  session: Session;
}

export const EditorStatusBar: React.FC<EditorStatusBarProps> = ({
  diagnosticsSummary,
  diagnosticsEnabled,
  docstate,
  id,
  onDiagnosticsClick,
  session,
}) => {
  return (
    <div className="editor-statusbar">
      <span aria-live="polite" id={id} role="status">
        {docstate}{diagnosticsSummary || diagnosticsEnabled ? ', ' : ''}
        {diagnosticsSummary ? (onDiagnosticsClick ? (
          <button className="editor-statusbar-button" onClick={onDiagnosticsClick}
            title="Go to first MOO problem" type="button">{diagnosticsSummary}</button>
        ) : diagnosticsSummary) : (diagnosticsEnabled ? 'No MOO problems' : '')}
      </span>
      <span aria-hidden="true">|</span>
      <span>{session.reference}</span>
      <span aria-hidden="true">|</span>
      <span>{session.type}</span>
    </div>
  );
};
