import { announce } from "@react-aria/live-announcer";
import { URL_REGEX, EMAIL_REGEX } from "./ansiParser";
import { isSafeUrl } from "./isSafeUrl";

export interface ExtractedLink {
  /** The text as it appears in the message (what the user hears/reads). */
  label: string;
  /** Normalized, scheme-allowlisted href suitable for window.open. */
  href: string;
}

// A bare "www.foo.com" match has no scheme; give it https so window.open treats
// it as an absolute URL rather than a relative path.
function normalizeUrl(raw: string): string {
  return /^[a-zA-Z][\w+.-]*:\/\//.test(raw) ? raw : `https://${raw}`;
}

/**
 * Harvest activatable links (http/https URLs and email addresses) from a plain
 * text message. Channel-history messages are stored as plain strings, so this is
 * the only link data available in the Alt+Arrow buffers. Unsafe schemes are
 * dropped via isSafeUrl, and duplicate hrefs are collapsed so the picker never
 * shows the same target twice. Results keep first-seen order.
 */
export function extractLinks(text: string): ExtractedLink[] {
  const links: ExtractedLink[] = [];
  const seen = new Set<string>();

  const push = (label: string, href: string) => {
    if (!isSafeUrl(href) || seen.has(href)) return;
    seen.add(href);
    links.push({ label, href });
  };

  // matchAll clones the regex internally, so the shared /g lastIndex used by
  // ansiParser's exec loops is never disturbed.
  for (const match of text.matchAll(URL_REGEX)) {
    const raw = match[2];
    if (raw) push(raw, normalizeUrl(raw));
  }
  for (const match of text.matchAll(EMAIL_REGEX)) {
    const email = match.groups?.name;
    if (email) push(email, `mailto:${email}`);
  }

  return links;
}

/** Open a harvested link in a new tab and announce it for screen readers. */
export function openLink(link: ExtractedLink): void {
  window.open(link.href, "_blank", "noopener,noreferrer");
  announce(`Opening ${link.label}`, "assertive", 2000);
}
