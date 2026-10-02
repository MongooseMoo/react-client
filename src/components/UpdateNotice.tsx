import { announce } from '@react-aria/live-announcer';
import { useEffect, useState } from 'react';
import commitHash from 'virtual:commit-hash';

import { watchClientUpdates } from '../clientUpdate';
import './UpdateNotice.css';

interface UpdateNoticeProps {
  container?: ServiceWorkerContainer;
  /** Build this page is running. */
  build?: string;
  reload?: () => void;
}

const UpdateNotice = ({
  container = typeof navigator === 'undefined' ? undefined : navigator.serviceWorker,
  build = commitHash,
  reload = () => window.location.reload(),
}: UpdateNoticeProps) => {
  const [updated, setUpdated] = useState(false);

  useEffect(
    () =>
      watchClientUpdates(container, () => {
        setUpdated(true);
        announce('Client updated. Reload to use the new version.', 'assertive');
      }),
    [container],
  );

  if (!updated) {
    return null;
  }

  return (
    <section className="update-notice" aria-label="Client update">
      <p>
        A new version of the client is ready; you are running build {build.slice(0, 7)}. Reload to use the new
        version.
      </p>
      <button type="button" onClick={reload}>
        Reload now
      </button>
    </section>
  );
};

export default UpdateNotice;
