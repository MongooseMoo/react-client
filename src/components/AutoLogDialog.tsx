import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import './AutoLogDialog.css';

const Content = lazy(() => import('./AutoLogDialogContent'));

export type AutoLogDialogRef = { open: () => void; close: () => void };

const AutoLogDialog = React.forwardRef<AutoLogDialogRef>((_, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  React.useImperativeHandle(ref, () => ({
    open() { setHasOpened(true); setIsOpen(true); },
    close() { setIsOpen(false); },
  }));

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    else if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <dialog className="autolog-dialog" ref={dialogRef} aria-label="Autologs"
      onClose={(event) => {
        if (event.target === event.currentTarget) setIsOpen(false);
      }}>
      <div className="autolog-dialog-header">
        <h2>Autologs</h2>
        <button type="button" onClick={() => setIsOpen(false)}>Close</button>
      </div>
      {hasOpened && <Suspense fallback={<p role="status">Loading logs…</p>}>
        <Content isOpen={isOpen} />
      </Suspense>}
    </dialog>
  );
});

export default AutoLogDialog;
