// @ts-expect-error This import is virtually resolved
import CommitHash from 'virtual:commit-hash';
import React, { useEffect, useRef, useState } from "react";
import Preferences from "./preferences";
import "./PreferencesDialog.css";

export type PreferencesDialogRef = {
  open: () => void;
  close: () => void;
};

const PreferencesDialog = React.forwardRef<PreferencesDialogRef>((_, ref) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  React.useImperativeHandle(ref, () => ({
    open() {
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

  // Sync React state when the dialog closes natively (e.g. Escape), so isOpen
  // stays in step with the dialog's real open state.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    const handleClose = () => {
      setIsOpen(false);
    };
    dialog.addEventListener("close", handleClose);
    return () => {
      dialog.removeEventListener("close", handleClose);
    };
  }, []);

  // Redundant once the native modal handles Escape, but left in place on purpose
  // (its removal is tracked as a separate finding). setIsOpen(false) twice is harmless.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <dialog
      className="preferences-dialog"
      ref={dialogRef}
      tabIndex={-1}
      aria-labelledby="preferences-dialog-title"
    >
      <h2 id="preferences-dialog-title" style={{
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
      {isOpen && <Preferences />}
      <button type="button" onClick={() => setIsOpen(false)}>Close</button>
      <br />
      <span id="commit-hash">
        Version: {CommitHash}
      </span>

    </dialog>
  );
});

export default PreferencesDialog;
