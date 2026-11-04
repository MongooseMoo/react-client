import { resolveApiUrl } from "./apiOrigin";

/**
 * One request to the MOO's WebDAV upload folders (/dav/photos/, /dav/sounds/),
 * with the push token. Caddy writes the file to disk and the MOO only authorizes
 * it, so uploads never pass through the game. Only Authorization and, with a
 * body, Content-Type are sent: the two headers the CORS preflight allows.
 */
export function davRequest(
  method: "PUT" | "MKCOL",
  path: string,
  token: string,
  body?: Blob,
  contentType?: string,
): Promise<Response> {
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  if (body && contentType) headers["Content-Type"] = contentType;
  return fetch(resolveApiUrl(path), { method, headers, body });
}

/**
 * Why an upload was refused: the MOO says so in plain text (for example
 * "Uploading photos and sounds is for builders."); Caddy's size refusal (413)
 * is named with tooLarge.
 */
export async function refusal(response: Response, tooLarge: string): Promise<string> {
  if (response.status === 413) return tooLarge;
  if (response.headers.get("Content-Type")?.startsWith("text/plain")) {
    const text = (await response.text()).trim();
    if (text) return text;
  }
  return `the server answered ${response.status}`;
}
