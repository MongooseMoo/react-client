import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  autoLogEntriesToHtml,
  autoLogEntriesToText,
  autoLogEntryToPlainText,
  buildAutoLogFilename,
  downloadAutoLog,
} from "../logging/AutoLogExport";
import { autoLogStore } from "../logging/AutoLogStore";
import type { AutoLogEntry, AutoLogSession } from "../logging/AutoLogTypes";
import AccessibleList from './AccessibleList';
import "./AutoLogDialog.css";

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

// A pending destructive action awaiting confirmation: either deleting a single
// session, or deleting every session.
type PendingDelete =
  | { kind: "session"; session: AutoLogSession }
  | { kind: "all"; count: number };

export default function AutoLogDialogContent({ isOpen, onReady }: { isOpen: boolean; onReady?: () => void }) {
  const confirmDialogRef = useRef<HTMLDialogElement | null>(null);
  const [sessions, setSessions] = useState<AutoLogSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<AutoLogSession | null>(null);
  const [entries, setEntries] = useState<AutoLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const viewerHeadingRef = useRef<HTMLHeadingElement>(null);
  const selectedSessionRef = useRef(selectedSession);
  selectedSessionRef.current = selectedSession;
  const entriesRequest = useRef(0);
  const focusAfterDelete = useRef(false);
  const [sessionsReady, setSessionsReady] = useState(false);

  const refreshSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const nextSessions = await autoLogStore.listSessions();
      setSessions(nextSessions);
      const current = selectedSessionRef.current;
      if (current && !nextSessions.some((session) => session.id === current.id)) {
        entriesRequest.current++;
        setSelectedSession(null);
        setEntries([]);
      }
      return nextSessions;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load autolog sessions.");
    } finally {
      setIsLoading(false);
      setSessionsReady(true);
    }
  }, []);

  const loadSessionEntries = useCallback(async (session: AutoLogSession) => {
    const request = ++entriesRequest.current;
    setSelectedSession(session);
    setEntries([]);
    setIsLoading(true);
    setError(null);
    try {
      const nextEntries = await autoLogStore.getEntries(session.id);
      if (request === entriesRequest.current) setEntries(nextEntries);
    } catch (err) {
      if (request === entriesRequest.current) setError(err instanceof Error ? err.message : "Failed to load autolog entries.");
    } finally {
      if (request === entriesRequest.current) setIsLoading(false);
    }
  }, []);

  const handleDelete = useCallback(async (session: AutoLogSession) => {
    setIsLoading(true);
    setError(null);
    try {
      await autoLogStore.deleteSession(session.id);
      const previousIndex = sessions.findIndex(item => item.id === session.id);
      if (selectedSession?.id === session.id) {
        setSelectedSession(null);
        setEntries([]);
      }
      const nextSessions = await refreshSessions();
      const successor = nextSessions?.[Math.min(previousIndex, nextSessions.length - 1)];
      if (successor) await loadSessionEntries(successor);
      focusAfterDelete.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete autolog session.");
    } finally {
      setIsLoading(false);
    }
  }, [refreshSessions, selectedSession, sessions, loadSessionEntries]);

  const handleDeleteAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await autoLogStore.deleteAll();
      entriesRequest.current++;
      setSelectedSession(null);
      setEntries([]);
      await refreshSessions();
      focusAfterDelete.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete autolog sessions.");
    } finally {
      setIsLoading(false);
    }
  }, [refreshSessions]);

  useEffect(() => {
    if (isOpen && !isLoading && focusAfterDelete.current) {
      focusAfterDelete.current = false;
      document.getElementById(sessions.length ? 'autolog-session-selector' : 'autolog-refresh')?.focus();
    }
  }, [isOpen, isLoading, sessions]);

  useEffect(() => {
    if (isOpen && sessionsReady) onReady?.();
  }, [isOpen, sessionsReady, onReady]);

  // Destructive triggers open the confirmation alertdialog instead of deleting
  // immediately, gating handleDelete / handleDeleteAll behind a confirm step.
  const requestDelete = useCallback((session: AutoLogSession) => {
    setPendingDelete({ kind: "session", session });
  }, []);

  const requestDeleteAll = useCallback(() => {
    setPendingDelete({ kind: "all", count: sessions.length });
  }, [sessions.length]);

  const cancelDelete = useCallback(() => {
    setPendingDelete(null);
  }, []);

  const confirmDelete = useCallback(async () => {
    const pending = pendingDelete;
    setPendingDelete(null);
    if (!pending) {
      return;
    }
    if (pending.kind === "session") {
      await handleDelete(pending.session);
    } else {
      await handleDeleteAll();
    }
  }, [pendingDelete, handleDelete, handleDeleteAll]);

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

  useEffect(() => {
    if (isOpen) {
      refreshSessions();
    }
  }, [isOpen, refreshSessions]);

  // Drive the confirmation alertdialog from pendingDelete, same showModal()
  // approach as the main dialog. showModal() traps focus and closes on Escape;
  // the dialog's "close" event (Escape or Cancel) clears pendingDelete without
  // deleting.
  useEffect(() => {
    const dialog = confirmDialogRef.current;
    if (!dialog) {
      return;
    }
    if (pendingDelete) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [pendingDelete]);

  useEffect(() => {
    const dialog = confirmDialogRef.current;
    if (!dialog) {
      return;
    }
    const handleClose = () => {
      setPendingDelete(null);
    };
    dialog.addEventListener("close", handleClose);
    return () => {
      dialog.removeEventListener("close", handleClose);
    };
  }, []);

  const totalBytes = useMemo(
    () => sessions.reduce((total, session) => total + session.byteEstimate, 0),
    [sessions]
  );

  const confirmMessage = pendingDelete
    ? pendingDelete.kind === "session"
      ? `Delete the autolog "${pendingDelete.session.title}"? This permanently removes the session and cannot be undone.`
      : `Delete all ${pendingDelete.count} autolog sessions? This permanently removes them and cannot be undone.`
    : "";

  return (
    <>
      {isOpen && (
        <>
          <div className="autolog-dialog-toolbar">
            <span>{sessions.length} sessions, {formatBytes(totalBytes)}</span>
            <button id="autolog-refresh" type="button" onClick={() => { if (!isLoading) void refreshSessions(); }} aria-disabled={isLoading}>Refresh</button>
            <button type="button" onClick={requestDeleteAll} disabled={isLoading || sessions.length === 0}>Delete All</button>
          </div>

          {error && <div className="autolog-dialog-error" role="alert">{error}</div>}

          <div className="autolog-dialog-body">
            <section className="autolog-session-list" aria-label="Autolog sessions">
              <h3 id="autolog-sessions-title">Autolog sessions</h3>
              {sessions.length === 0 && !isLoading && (
                <p className="autolog-empty">No autolog sessions have been saved.</p>
              )}
              {sessions.length > 0 && <AccessibleList
                listId="autolog-session-selector" labelledBy="autolog-sessions-title" items={sessions}
                renderItem={session => <><span className="autolog-session-title">{session.title}</span>{' '}
                  <span className="autolog-session-meta">{formatSessionDate(session.startedAt)}</span></>}
                getItemTextValue={session => session.title.toLowerCase()}
                onSelectedIndexChange={index => {
                  const session = sessions[index];
                  if (session && session.id !== selectedSessionRef.current?.id) void loadSessionEntries(session);
                }}
                onActivate={() => viewerHeadingRef.current?.focus()}
              />}
            </section>

            <section className="autolog-entry-viewer" aria-label="Autolog entries" aria-busy={isLoading}>
              {selectedSession ? (
                <>
                  <h3 ref={viewerHeadingRef} tabIndex={-1}>{selectedSession.title}</h3>
                  <div className="autolog-entry-meta">
                    {formatSessionDate(selectedSession.startedAt)} · {getSessionDuration(selectedSession)} · {selectedSession.lineCount} lines · {formatBytes(selectedSession.byteEstimate)} · {selectedSession.sanitizedUrl}
                  </div>
                  <div className="autolog-session-actions">
                    <button type="button" onClick={() => viewerHeadingRef.current?.focus()}>View entries</button>
                    <button type="button" aria-disabled={isLoading} aria-label={`Download "${selectedSession.title}" as plain text`} onClick={() => { if (!isLoading) void handleDownload(selectedSession, "text"); }}>TXT</button>
                    <button type="button" aria-disabled={isLoading} aria-label={`Download "${selectedSession.title}" as HTML`} onClick={() => { if (!isLoading) void handleDownload(selectedSession, "html"); }}>HTML</button>
                    <button type="button" aria-disabled={isLoading} aria-label={`Delete log "${selectedSession.title}"`} onClick={() => { if (!isLoading) requestDelete(selectedSession); }}>Delete</button>
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
        </>
      )}
    <dialog
      className="autolog-confirm-dialog"
      ref={confirmDialogRef}
      role="alertdialog"
      aria-labelledby="autolog-confirm-title"
      aria-describedby="autolog-confirm-message"
    >
      {pendingDelete && (
        <>
          <h2 id="autolog-confirm-title">
            {pendingDelete.kind === "session" ? "Delete autolog" : "Delete all autologs"}
          </h2>
          <p id="autolog-confirm-message">{confirmMessage}</p>
          <div className="autolog-confirm-actions">
            <button type="button" autoFocus onClick={cancelDelete}>Cancel</button>
            <button type="button" onClick={confirmDelete}>Delete</button>
          </div>
        </>
      )}
    </dialog>
    </>
  );
}
