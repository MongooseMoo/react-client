import CommitHash from 'virtual:commit-hash';
import React, { lazy, Suspense, useEffect, useRef, useState } from "react";
import "./PreferencesDialog.css";

const Preferences = lazy(() => import('./preferences'));

function ReadyPreferences({ onReady }: { onReady: () => void }) {
  useEffect(onReady, [onReady]);
  return <Preferences />;
}

export type PreferencesDialogRef = {
  open: () => void;
  close: () => void;
};

const PreferencesDialog = React.forwardRef<PreferencesDialogRef>((_, ref) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const initialFocusPending = useRef(false);
  const interacted = useRef(false);
  const [contentReady, setContentReady] = useState(false);
  const markReady = React.useCallback(() => setContentReady(true), []);

  React.useImperativeHandle(ref, () => ({
    open() {
      initialFocusPending.current = true;
      interacted.current = false;
      setContentReady(false);
      setIsOpen(true);
    },
    close() {
      setIsOpen(false);
    },
  }));

  // Drive the native modal dialog from React state. showModal() puts the dialog
  // in the top layer, traps focus, makes the background inert, renders a
  // ::backdrop, closes on Escape, and restores focus to the previously-focused
  // element on close — so the react-focus-lock wrapper is no longer needed.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (isOpen) {
      // showModal() throws if the dialog is already open.
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && contentReady && initialFocusPending.current) {
      initialFocusPending.current = false;
      if (!interacted.current) {
        dialogRef.current?.querySelector<HTMLButtonElement>('[role="tab"][aria-selected="true"]')?.focus();
      }
    }
  }, [isOpen, contentReady]);

  // Sync React state when the dialog closes natively (e.g. Escape), so isOpen
  // stays in step with the dialog's real open state.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    const handleClose = () => {
      // `close` arrives a task after the dialog closed; if it was opened again
      // meanwhile, this event is about the earlier showing and changes nothing.
      if (!dialog.open) setIsOpen(false);
    };
    dialog.addEventListener("close", handleClose);
    return () => {
      dialog.removeEventListener("close", handleClose);
    };
  }, []);

  return (
    <dialog
      className="preferences-dialog"
      ref={dialogRef}
      aria-labelledby="preferences-dialog-title"
      onKeyDownCapture={() => { interacted.current = true; }}
      onPointerDownCapture={() => { interacted.current = true; }}
    >
      <h2 id="preferences-dialog-title" tabIndex={-1} autoFocus style={{
        color: "white",
        textAlign: "center",
        fontSize: "1.5em",
        padding: "0.5em",
        margin: "0.5em",
        border: "1px solid black",
        borderRadius: "0.5em",
        backgroundColor: "black"
      }
      }  >Preferences</h2>
      {isOpen && <Suspense fallback={<p role="status">Loading preferences…</p>}><ReadyPreferences onReady={markReady} /></Suspense>}
      <button type="button" onClick={() => setIsOpen(false)}>Close</button>
      <br />
      <span id="commit-hash">
        Version: {CommitHash}
      </span>

    </dialog>
  );
});

export default PreferencesDialog;
