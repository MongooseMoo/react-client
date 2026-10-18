import { useEffect, useRef, useState } from 'react';
import { type LaunchMode, useLaunchStore } from './launchStore';
import { HOST_URL, LOCAL_URL } from './launchUrls';
import './LaunchDatabaseDialog.css';

const TITLES: Record<LaunchMode, string> = {
  host: 'Host a MOO server?',
  local: 'Play a local MOO?',
};
const DESCRIPTIONS: Record<LaunchMode, string> = {
  host: 'This opens a new window where you choose a database to host.',
  local: 'This opens a new window running the built-in minimal database.',
};

/**
 * A manifest shortcut reached a window that is already running something
 * else (launch_handler focus-existing). Switching modes in place would end
 * this window's session, so the shortcut's mode opens in a new window, and
 * only on the player's say-so: the click is what lets the window open.
 */
export default function LaunchModeDialog() {
  const mode = useLaunchStore((state) => state.modeRequest);
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (mode) {
      setError('');
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [mode]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const dismiss = () => useLaunchStore.setState({ modeRequest: undefined });
    dialog.addEventListener('close', dismiss);
    return () => dialog.removeEventListener('close', dismiss);
  }, []);

  const open = () => {
    if (!mode) return;
    const url = new URL(mode === 'host' ? HOST_URL : LOCAL_URL, window.location.origin);
    if (window.open(url.href, '_blank')) useLaunchStore.setState({ modeRequest: undefined });
    else setError('The browser blocked the new window. Allow pop-ups for this site, then choose Open again.');
  };

  return (
    <dialog
      ref={dialogRef}
      className="launch-database-dialog"
      aria-labelledby="launch-mode-title"
      aria-describedby="launch-mode-description"
    >
      <h2 id="launch-mode-title">{mode ? TITLES[mode] : ''}</h2>
      <p id="launch-mode-description">{mode ? `${DESCRIPTIONS[mode]} This window stays as it is.` : ''}</p>
      {error && <p role="alert" className="launch-database-error">{error}</p>}
      <div className="launch-database-actions">
        <button type="button" onClick={open}>Open</button>
        <button type="button" onClick={() => dialogRef.current?.close()}>Cancel</button>
      </div>
    </dialog>
  );
}
