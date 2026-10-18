/**
 * Text that arrives from outside the client: a `web+mongoose:` link or a share
 * from another app. It only ever becomes a draft in the command input; nothing
 * here or in its callers sends it.
 *
 * Link grammar: `web+mongoose:` then optionally `//`, then the draft,
 * percent-encoded. `web+mongoose:look%20at%20fountain` drafts "look at fountain";
 * a bare `web+mongoose:` only brings the client forward.
 */

import { PROTOCOL_SCHEME } from './launchUrls';

export const MAX_LAUNCH_TEXT = 1000;

// C0, DEL, C1, and the Unicode line and paragraph separators, with the spaces
// around them. A line break would make one draft two MOO commands, the second
// out of sight.
// biome-ignore lint/complexity/useRegexLiterals: a literal invites raw U+2028/U+2029 into the source, which end a regex literal.
const CONTROL_RUN = new RegExp(' *[\\u0000-\\u001f\\u007f-\\u009f\\u2028\\u2029]+ *', 'g');

export function sanitizeLaunchText(text: string): string {
  return text.replace(CONTROL_RUN, ' ').trim().slice(0, MAX_LAUNCH_TEXT);
}

/** The draft a link carries, or undefined when it is not a well-formed `web+mongoose:` link. */
export function parseProtocolUrl(link: string): string | undefined {
  const prefix = `${PROTOCOL_SCHEME}:`;
  if (link.slice(0, prefix.length).toLowerCase() !== prefix) return undefined;
  const rest = link.slice(prefix.length).replace(/^\/\//, '');
  try {
    return sanitizeLaunchText(decodeURIComponent(rest));
  } catch {
    return undefined;
  }
}
