/**
 * Scheme allowlist guard for server-controlled URLs.
 *
 * A hostile or federated server can supply URLs that reach navigation/anchor
 * sinks (ansiParser hrefs, ServerLinksPanel/File window.open). URL_REGEX only
 * requires "://", so `javascript://%0aalert(1)` slips through and executes.
 * This guard rejects everything outside http/https/mailto.
 */
export function isSafeUrl(url: string): boolean {
  if (typeof url !== 'string') {
    return false;
  }
  const trimmed = url.trim();
  if (trimmed === '') {
    return false;
  }
  let parsed: URL;
  try {
    // Protocol-relative ("//host/...") is classified by its effective scheme:
    // resolving against a dummy https base makes it http/https, while absolute
    // schemes (javascript:, data:, ...) ignore the base and keep their own.
    parsed = new URL(trimmed, 'https://x.invalid');
  } catch {
    return false;
  }
  const protocol = parsed.protocol.toLowerCase();
  return protocol === 'http:' || protocol === 'https:' || protocol === 'mailto:';
}
