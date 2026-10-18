import { resolveApiUrl } from './apiOrigin';
import type { SessionGrant } from './tabSession';

/** The pinned tab grant also revokes its server authority without a socket. */
export async function revokeBrowserSession(grant: SessionGrant): Promise<void> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(resolveApiUrl('/api/webpush/browser_logout'), {
      method: 'POST',
      keepalive: true,
      signal: controller.signal,
      headers: { Authorization: `Bearer ${grant.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: grant.sessionId,
        playerUuid: grant.playerUuid,
        installationId: grant.installationId,
      }),
    });
    // A simultaneous GMCP sign-out may have already consumed this grant.
    if (!response.ok && response.status !== 401)
      throw new Error('Server sign-out could not be confirmed');
  } finally {
    clearTimeout(timeout);
  }
}
