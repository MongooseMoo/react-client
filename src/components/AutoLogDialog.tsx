import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import './AutoLogDialog.css';

const Content = lazy(() => import('./AutoLogDialogContent'));

export type AutoLogDialogRef = { open: () => void; close: () => void };

const AutoLogDialog = React.forwardRef<AutoLogDialogRef>((_, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [contentReady, setContentReady] = useState(false);
  const initialFocusPending = useRef(false);
  const interacted = useRef(false);
  const markReady = React.useCallback(() => setContentReady(true), []);

  React.useImperativeHandle(ref, () => ({
    open() {
      initialFocusPending.current = true;
      interacted.current = false;
      setContentReady(false);
      setHasOpened(true);
      setIsOpen(true);
    },
    close() { setIsOpen(false); },
  }));

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    else if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && contentReady && initialFocusPending.current) {
      initialFocusPending.current = false;
      if (!interacted.current) {
        dialogRef.current?.querySelector<HTMLElement>('[role="listbox"], #autolog-refresh')?.focus();
      }
    }
  }, [isOpen, contentReady]);

  return (
    <dialog className="autolog-dialog" ref={dialogRef} aria-label="Autologs"
      onKeyDownCapture={() => { interacted.current = true; }}
      onPointerDownCapture={() => { interacted.current = true; }}
      onClose={(event) => {
        if (event.target === event.currentTarget) setIsOpen(false);
      }}>
      <div className="autolog-dialog-header">
        <h2>Autologs</h2>
        <button type="button" onClick={() => setIsOpen(false)}>Close</button>
      </div>
      {hasOpened && <Suspense fallback={<p role="status">Loading logs…</p>}>
        <Content isOpen={isOpen} onReady={markReady} />
      </Suspense>}
    </dialog>
  );
});

export default AutoLogDialog;
