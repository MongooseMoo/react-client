import { useCallback, useEffect, useState } from 'react';
import { formatFileSize } from '../components/FileTransfer/formatFileSize';
import { discardLaunchItem, putLaunchItem } from './launchInbox';
import { useLaunchStore } from './launchStore';
import { FILE_HANDLER_URL, HOST_DATABASE_PARAM } from './launchUrls';
import { useOfferDialog } from './useOfferDialog';
import './LaunchDatabaseDialog.css';

/**
 * Asks before hosting a database the OS opened with the client. Hosting runs
 * the database's code in this browser and, in host mode, lets guests join, so
 * an opened file never boots by itself. Native showModal() gives focus
 * containment, the inert page behind, Escape, and focus restoration.
 */
export default function LaunchDatabaseDialog() {
  const database = useLaunchStore((state) => state.database);
  const hostWaiting = useLaunchStore((state) => state.hostWaiting);
  const clearOffer = useCallback((shown: File) => {
    useLaunchStore.setState((state) => (state.database === shown ? { database: undefined } : {}));
  }, []);
  // Each Host press belongs to the offer on show; once that is revoked or
  // replaced, the press may neither open a window nor touch the offer.
  const { dialogRef, generation, dismiss } = useOfferDialog(database, clearOffer);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: a new offer starts with no error and no Host pending.
  useEffect(() => {
    setError('');
    setBusy(false);
  }, [database]);

  const host = async () => {
    if (!database || busy) return;
    if (hostWaiting) {
      useLaunchStore.setState({ confirmedDatabase: database, database: undefined });
      return;
    }
    const mine = generation.current;
    const current = () => generation.current === mine && useLaunchStore.getState().database === database;
    setBusy(true);
    let id: string | undefined;
    try {
      // Stored first so a failure leaves no empty window behind; the click's
      // activation, which window.open needs, outlasts one IndexedDB write.
      id = await putLaunchItem({ kind: 'database', file: database });
      if (!current()) return;
      const url = new URL(FILE_HANDLER_URL, window.location.origin);
      url.searchParams.set(HOST_DATABASE_PARAM, id);
      if (window.open(url.href, '_blank')) {
        id = undefined; // The new window reads it.
        useLaunchStore.setState({ database: undefined });
      } else {
        setError('The browser blocked the new window. Allow pop-ups for this site, then choose Host again.');
      }
    } catch {
      if (current()) setError('The database could not be handed to a new window. Try again.');
    } finally {
      if (id) void discardLaunchItem(id).catch(() => {});
      if (generation.current === mine) setBusy(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="launch-database-dialog"
      aria-labelledby="launch-database-title"
      aria-describedby="launch-database-description"
    >
      <h2 id="launch-database-title">Host {database?.name ?? 'database'}?</h2>
      <p id="launch-database-description">
        {database ? `${database.name}, ${formatFileSize(database.size)}. ` : ''}
        {hostWaiting
          ? 'Hosting starts a MOO server from this file in this window.'
          : 'Hosting starts a MOO server from this file in a new window. This window stays as it is.'}
      </p>
      {error && <p role="alert" className="launch-database-error">{error}</p>}
      <div className="launch-database-actions">
        <button type="button" aria-disabled={busy} onClick={() => void host()}>
          Host
        </button>
        <button type="button" onClick={dismiss}>
          Cancel
        </button>
      </div>
    </dialog>
  );
}
