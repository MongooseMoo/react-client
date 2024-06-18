// @ts-expect-error This import is virtually resolved
import CommitHash from 'virtual:commit-hash';
import React, { useEffect, useRef, useState } from "react";
import Preferences from "./preferences";
import "./PreferencesDialog.css";
import FocusLock from "react-focus-lock";

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

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.focus();
    }
  }, [isOpen]);

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
    <FocusLock disabled={!isOpen}>
      <dialog
        className="preferences-dialog"
        open={isOpen}
        ref={dialogRef}
        tabIndex={-1}
        aria-label="Preferences"
      >
        <h1 style={{
          color: "white",
          textAlign: "center",
          fontSize: "1.5em",
          padding: "0.5em",
          margin: "0.5em",
          border: "1px solid black",
          borderRadius: "0.5em",
          backgroundColor: "black"
        }
        }  >Preferences</h1>
        {isOpen && <Preferences />}
        <button onClick={() => setIsOpen(false)}>Close</button>
        <br />
        <span id="commit-hash">
          Version: {CommitHash}
        </span>

      </dialog>
    </FocusLock >
  );
});

export default PreferencesDialog;
