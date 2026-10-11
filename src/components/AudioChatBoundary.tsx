import { lazy, Suspense, useRef } from 'react';
import type MudClient from '../client';
import { useLiveKitStore } from '../stores/liveKitStore';

const AudioChat = lazy(() => import('./audioChat'));

export default function AudioChatBoundary({ client }: { client: MudClient }) {
  const hasTokens = useLiveKitStore((state) => state.rooms.length > 0);
  const activated = useRef(false);
  if (hasTokens) activated.current = true;

  // Keep active calls mounted regardless of sidebar or tab visibility.
  // Retain the visible result of a finished/failed call after its room is removed.
  if (!activated.current) return null;

  return (
    <Suspense fallback={null}>
      <AudioChat client={client} />
    </Suspense>
  );
}
