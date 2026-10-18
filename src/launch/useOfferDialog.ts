import { useCallback, useEffect, useRef } from 'react';

/**
 * A native modal dialog that puts one launch offer (an opened database, a
 * shortcut's mode) to the player.
 *
 * Dismissal is decided at once, not when the `close` event comes: browsers
 * fire `close` in a later task, and by then a pending step of the dismissed
 * offer may have finished, or a newer offer may be on show. So Cancel and
 * Escape (`cancel`) revoke the offer synchronously, and a late `close` from an
 * earlier showing is ignored.
 *
 * `generation` changes whenever the offer on show changes or is revoked, and
 * when the dialog unmounts; an async step remembers it and stops if it moved.
 */
export function useOfferDialog<T>(offer: T | undefined, clearOffer: (shown: T) => void) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const generation = useRef(0);
  const shown = useRef<T | undefined>(undefined);
  const showing = useRef(0);
  const dismissedShowing = useRef(0);

  const revoke = useCallback(() => {
    dismissedShowing.current = showing.current;
    generation.current += 1;
    const dismissed = shown.current;
    shown.current = undefined;
    if (dismissed !== undefined) clearOffer(dismissed);
  }, [clearOffer]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    generation.current += 1;
    if (offer !== undefined) {
      if (shown.current === undefined) showing.current += 1;
      shown.current = offer;
      if (!dialog.open) dialog.showModal();
    } else {
      shown.current = undefined;
      dismissedShowing.current = showing.current;
      if (dialog.open) dialog.close();
    }
  }, [offer]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onCancel = () => revoke();
    // Only a close nobody decided on above (none is known today) dismisses here,
    // and only while that same showing is the one closed.
    const onClose = () => {
      if (!dialog.open && dismissedShowing.current !== showing.current) revoke();
    };
    dialog.addEventListener('cancel', onCancel);
    dialog.addEventListener('close', onClose);
    return () => {
      generation.current += 1;
      dialog.removeEventListener('cancel', onCancel);
      dialog.removeEventListener('close', onClose);
    };
  }, [revoke]);

  /** Cancel: revoke now, then close. */
  const dismiss = useCallback(() => {
    revoke();
    dialogRef.current?.close();
  }, [revoke]);

  return { dialogRef, generation, dismiss };
}
