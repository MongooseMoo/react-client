import React, { useCallback, useEffect, useMemo, useState } from "react";
import FocusLock from "react-focus-lock";
import {
  autoLogEntriesToHtml,
  autoLogEntriesToText,
  autoLogEntryToPlainText,
  buildAutoLogFilename,
  downloadAutoLog,
} from "../logging/AutoLogExport";
import { autoLogStore } from "../logging/AutoLogStore";
import { AutoLogEntry, AutoLogSession } from "../logging/AutoLogTypes";
import "./AutoLogDialog.css";

export type AutoLogDialogRef = {
  open: () => void;
  close: () => void;
};

function formatBytes(value: number): string {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function formatSessionDate(value: number): string {
  return new Date(value).toLocaleString();
}

function getSessionDuration(session: AutoLogSession): string {
  if (!session.endedAt) {
    return "In progress";
  }

  const seconds = Math.max(0, Math.round((session.endedAt - session.startedAt) / 1000));
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
}

const AutoLogDialog = React.forwardRef<AutoLogDialogRef>((_, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [sessions, setSessions] = useState<AutoLogSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<AutoLogSession | null>(null);
  const [entries, setEntries] = useState<AutoLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const nextSessions = await autoLogStore.listSessions();
      setSessions(nextSessions);
      if (selectedSession && !nextSessions.some((session) => session.id === selectedSession.id)) {
        setSelectedSession(null);
        setEntries([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load autolog sessions.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedSession]);

  const loadSessionEntries = useCallback(async (session: AutoLogSession) => {
    setSelectedSession(session);
    setIsLoading(true);
    setError(null);
    try {
      setEntries(await autoLogStore.getEntries(session.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load autolog entries.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDelete = useCallback(async (session: AutoLogSession) => {
    setIsLoading(true);
    setError(null);
    try {
      await autoLogStore.deleteSession(session.id);
      if (selectedSession?.id === session.id) {
        setSelectedSession(null);
        setEntries([]);
      }
      await refreshSessions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete autolog session.");
    } finally {
      setIsLoading(false);
    }
  }, [refreshSessions, selectedSession]);

  const handleDeleteAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await autoLogStore.deleteAll();
      setSelectedSession(null);
      setEntries([]);
      await refreshSessions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete autolog sessions.");
    } finally {
      setIsLoading(false);
    }
  }, [refreshSessions]);

  const handleDownload = useCallback(async (session: AutoLogSession, format: "text" | "html") => {
    setIsLoading(true);
    setError(null);
    try {
      const sessionEntries = selectedSession?.id === session.id ? entries : await autoLogStore.getEntries(session.id);
      const content = format === "html"
        ? autoLogEntriesToHtml(session, sessionEntries)
        : autoLogEntriesToText(sessionEntries);
      downloadAutoLog(content, buildAutoLogFilename(session, format), format);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to download autolog session.");
    } finally {
      setIsLoading(false);
    }
  }, [entries, selectedSession]);

  React.useImperativeHandle(ref, () => ({
    open() {
      setIsOpen(true);
    },
    close() {
      setIsOpen(false);
    },
  }));

  useEffect(() => {
    if (isOpen) {
      refreshSessions();
    }
  }, [isOpen, refreshSessions]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const totalBytes = useMemo(
    () => sessions.reduce((total, session) => total + session.byteEstimate, 0),
    [sessions]
  );

  if (!isOpen) {
    return null;
  }

  return (
    <FocusLock>
      <dialog className="autolog-dialog" open aria-label="Autologs">
        <div className="autolog-dialog-header">
          <h1>Autologs</h1>
          <button onClick={() => setIsOpen(false)}>Close</button>
        </div>

        <div className="autolog-dialog-toolbar">
          <span>{sessions.length} sessions, {formatBytes(totalBytes)}</span>
          <button onClick={refreshSessions} disabled={isLoading}>Refresh</button>
          <button onClick={handleDeleteAll} disabled={isLoading || sessions.length === 0}>Delete All</button>
        </div>

        {error && <div className="autolog-dialog-error" role="alert">{error}</div>}

        <div className="autolog-dialog-body">
          <section className="autolog-session-list" aria-label="Autolog sessions">
            {sessions.length === 0 && !isLoading && (
              <p className="autolog-empty">No autolog sessions have been saved.</p>
            )}
            {sessions.map((session) => (
              <article
                key={session.id}
                className={`autolog-session-row ${selectedSession?.id === session.id ? "selected" : ""}`}
              >
                <button className="autolog-session-main" onClick={() => loadSessionEntries(session)}>
                  <span className="autolog-session-title">{session.title}</span>
                  <span className="autolog-session-meta">
                    {formatSessionDate(session.startedAt)} · {getSessionDuration(session)} · {session.lineCount} lines · {formatBytes(session.byteEstimate)}
                  </span>
                </button>
                <div className="autolog-session-actions">
                  <button onClick={() => handleDownload(session, "text")}>TXT</button>
                  <button onClick={() => handleDownload(session, "html")}>HTML</button>
                  <button onClick={() => handleDelete(session)}>Delete</button>
                </div>
              </article>
            ))}
          </section>

          <section className="autolog-entry-viewer" aria-label="Autolog entries">
            {selectedSession ? (
              <>
                <h2>{selectedSession.title}</h2>
                <div className="autolog-entry-meta">
                  {formatSessionDate(selectedSession.startedAt)} · {selectedSession.sanitizedUrl}
                </div>
                <div className="autolog-entry-list">
                  {entries.map((entry) => (
                    <pre key={`${entry.sessionId}-${entry.sequence}`} className={`autolog-entry autolog-entry-${entry.type}`}>
                      <span className="autolog-entry-time">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                      {autoLogEntryToPlainText(entry)}
                    </pre>
                  ))}
                  {entries.length === 0 && !isLoading && <p className="autolog-empty">No entries in this session.</p>}
                </div>
              </>
            ) : (
              <p className="autolog-empty">Select a session to view its entries.</p>
            )}
          </section>
        </div>
      </dialog>
    </FocusLock>
  );
});

export default AutoLogDialog;
