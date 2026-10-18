import { useEffect } from 'react';

import { headTracking, type HeadYawSink } from '../audio/headTracking';

/** Bind head tracking to the client's media service and its recenter shortcut. */
export function useHeadTracking(media: HeadYawSink | undefined): void {
  useEffect(() => {
    if (!media) {
      return;
    }
    const detach = headTracking.attach(media);
    const handleKeyDown = (event: KeyboardEvent) => headTracking.handleKeyDown(event);
    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      detach();
    };
  }, [media]);
}
