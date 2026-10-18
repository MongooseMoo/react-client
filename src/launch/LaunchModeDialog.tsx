import { useCallback, useEffect, useState } from 'react';
import { type LaunchMode, type ModeRequest, useLaunchStore } from './launchStore';
import { HOST_URL, LOCAL_URL } from './launchUrls';
import { useOfferDialog } from './useOfferDialog';
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
  const request = useLaunchStore((state) => state.modeRequest);
  const clearOffer = useCallback((shown: ModeRequest) => {
    useLaunchStore.setState((state) => (state.modeRequest === shown ? { modeRequest: undefined } : {}));
  }, []);
  const { dialogRef, dismiss } = useOfferDialog(request, clearOffer);
  const [error, setError] = useState('');

  // biome-ignore lint/correctness/useExhaustiveDependencies: a new request starts with no error.
  useEffect(() => setError(''), [request]);

  const open = () => {
    if (!request) return;
    const url = new URL(request.mode === 'host' ? HOST_URL : LOCAL_URL, window.location.origin);
    if (window.open(url.href, '_blank')) clearOffer(request);
    else setError('The browser blocked the new window. Allow pop-ups for this site, then choose Open again.');
  };

  return (
    <dialog
      ref={dialogRef}
      className="launch-database-dialog"
      aria-labelledby="launch-mode-title"
      aria-describedby="launch-mode-description"
    >
      <h2 id="launch-mode-title">{request ? TITLES[request.mode] : ''}</h2>
      <p id="launch-mode-description">{request ? `${DESCRIPTIONS[request.mode]} This window stays as it is.` : ''}</p>
      {error && <p role="alert" className="launch-database-error">{error}</p>}
      <div className="launch-database-actions">
        <button type="button" onClick={open}>Open</button>
        <button type="button" onClick={dismiss}>Cancel</button>
      </div>
    </dialog>
  );
}
