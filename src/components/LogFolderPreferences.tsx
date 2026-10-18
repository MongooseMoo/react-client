import React from "react";
import { useStore } from "zustand";
import { type AutoLogFolder, autoLogFolder, type LogFolderStatus } from "../logging/AutoLogFolder";
import { usePreferences } from "../stores/preferencesStore";
import { useFocusRefuge } from "./FileTransfer/useFocusRefuge";
import "./LogFolderPreferences.css";

type Tone = "on" | "off" | "warn" | "error";

function describe(status: LogFolderStatus, loggingOn: boolean): { tone: Tone; text: string } {
  switch (status.kind) {
    case "ready":
      return loggingOn
        ? { tone: "on", text: status.filePath ? "Writing" : "Connected. A file starts with the next line logged." }
        : { tone: "off", text: "Connected. Turn on autologging to write files." };
    case "needs-permission":
      return { tone: "warn", text: "Disconnected. The browser needs your permission again." };
    case "error":
      return { tone: "error", text: `Could not write: ${status.message}. It tries again with each new line.` };
    case "none":
      return { tone: "off", text: "No folder chosen." };
    default:
      return { tone: "off", text: "Checking…" };
  }
}

/**
 * The "Save logs to a folder" section of the Logging preferences. Renders
 * nothing where the browser has no folder access; status changes are spoken
 * by the folder sink itself, so this section has no live region of its own.
 */
type FolderControls = Pick<AutoLogFolder, "state" | "syncOwner" | "choose" | "reconnect" | "stopUsing">;

const LogFolderPreferences: React.FC<{ folder?: FolderControls }> = ({ folder = autoLogFolder }) => {
  const status = useStore(folder.state, (state) => state.status);
  const loggingOn = usePreferences((state) => state.autologging.enabled);
  const sectionRef = React.useRef<HTMLElement>(null);
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  // A ref, not disabled buttons: disabling the focused button drops focus.
  const busy = React.useRef(false);

  React.useEffect(() => {
    void folder.syncOwner();
  }, [folder]);

  // Stop or a successful Reconnect removes the button that was pressed. Only
  // then, and only if focus fell to the page, it goes to the heading; focus
  // the player has moved elsewhere is left alone.
  useFocusRefuge(sectionRef, headingRef);

  if (status.kind === "unsupported") return null;

  // Each action starts in the click handler itself: the picker and the
  // permission prompt both need the player's gesture.
  const run = (action: () => Promise<void>) => () => {
    if (busy.current) return;
    busy.current = true;
    void action().finally(() => { busy.current = false; });
  };

  const hasFolder = status.kind === "ready" || status.kind === "needs-permission" || status.kind === "error";
  const { tone, text } = describe(status, loggingOn);

  return (
    <section className="log-folder" aria-labelledby="log-folder-heading" ref={sectionRef}>
      <h3 id="log-folder-heading" tabIndex={-1} ref={headingRef}>Save logs to a folder</h3>
      <p className="log-folder-help" id="log-folder-help">
        Each session is also written as a text file, line by line, in a folder you choose on this
        computer, with a separate folder for each character. Logs are always kept in the browser as well.
      </p>
      {status.kind === "unavailable" ? (
        <p className="log-folder-help">Sign in to a character to choose a log folder.</p>
      ) : (
        <>
          <dl className="log-folder-status" data-tone={tone}>
            {hasFolder && (
              <div>
                <dt>Folder</dt>
                <dd className="log-folder-name">{status.folderName}</dd>
              </div>
            )}
            <div>
              <dt>Status</dt>
              <dd><span className="log-folder-dot" aria-hidden="true" />{text}</dd>
            </div>
            {status.kind === "ready" && status.filePath && loggingOn && (
              <div>
                <dt>Current file</dt>
                <dd className="log-folder-path">{status.filePath}</dd>
              </div>
            )}
          </dl>
          <div className="log-folder-actions">
            {status.kind === "needs-permission" && (
              <button type="button" className="btn-primary" onClick={run(() => folder.reconnect())}>
                Reconnect {status.folderName}
              </button>
            )}
            {status.kind === "error" && (
              <button type="button" className="btn-primary" onClick={run(() => folder.reconnect())}>
                Try again
              </button>
            )}
            <button
              type="button"
              className={hasFolder ? undefined : "btn-primary"}
              disabled={status.kind === "loading"}
              aria-describedby="log-folder-help"
              onClick={run(() => folder.choose())}
            >
              {hasFolder ? "Choose a different folder…" : "Choose folder…"}
            </button>
            {hasFolder && (
              <button type="button" onClick={run(() => folder.stopUsing())}>
                Stop using folder
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
};

export default LogFolderPreferences;
