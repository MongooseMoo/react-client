import { useState } from 'react';
import { usePreferences } from '../stores/preferencesStore';
import { PROTOCOL_HANDLER_URL, PROTOCOL_SCHEME } from './launchUrls';

/** General-tab settings for how the client sits in the operating system. Shown only where the browser supports them. */
export default function AppIntegrationPreferences() {
  const general = usePreferences((state) => state.general);
  const setGeneral = usePreferences((state) => state.setGeneral);
  const [linkStatus, setLinkStatus] = useState('');
  const canBadge = 'setAppBadge' in navigator;
  const canHandleLinks = typeof navigator.registerProtocolHandler === 'function';

  const handleLinks = () => {
    try {
      navigator.registerProtocolHandler(PROTOCOL_SCHEME, new URL(PROTOCOL_HANDLER_URL, window.location.origin).href);
      setLinkStatus('Asked the browser. If it shows a prompt, allow it to finish.');
    } catch {
      setLinkStatus('This browser refused to open Mongoose links here.');
    }
  };

  return (
    <>
      {canBadge && (
        <>
          <br />
          <label>
            <input
              type="checkbox"
              checked={general.appBadge}
              onChange={(e) => setGeneral({ ...general, appBadge: e.target.checked })}
            />
            Count missed messages on the app icon
          </label>
        </>
      )}
      {canHandleLinks && (
        <p>
          <button type="button" onClick={handleLinks}>Open Mongoose links in this client</button>
          {' '}
          <span role="status">{linkStatus}</span>
        </p>
      )}
    </>
  );
}
