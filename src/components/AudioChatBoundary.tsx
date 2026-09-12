import { lazy, Suspense } from 'react';
import type MudClient from '../client';
import { useLiveKitStore } from '../stores/liveKitStore';

const AudioChat = lazy(() => import('./audioChat'));

export default function AudioChatBoundary({ client }: { client: MudClient }) {
  const hasTokens = useLiveKitStore((state) => state.tokens.length > 0);

  // Keep active calls mounted regardless of sidebar or tab visibility.
  if (!hasTokens) return null;

  return (
    <Suspense fallback={null}>
      <AudioChat client={client} />
    </Suspense>
  );
}
