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
  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.focus();
    }
  }, [isOpen]);

  return (
    <dialog
      className="preferences-dialog"
      open={isOpen}
      ref={dialogRef}
      tabIndex={-1}
    >
      {isOpen && <Preferences />}
      <button onClick={() => setIsOpen(false)}>Close</button>
    </dialog>
  );
});

export default PreferencesDialog;
