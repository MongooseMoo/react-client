// The web client is served from GitHub Pages; the /api endpoints live on the MOO.
// In dev the Vite server proxies /api, so relative paths keep working there.
const PRODUCTION_API_ORIGIN = "https://mongoose.world";

export function apiOrigin(): string {
  const override = import.meta.env.VITE_API_ORIGIN;
  if (typeof override === "string" && override !== "") {
    return override;
  }
  return import.meta.env.DEV ? "" : PRODUCTION_API_ORIGIN;
}

// Absolute URLs pass through; /api/ paths and /dav/ (the MOO's WebDAV drive, where
// /dav/photos/ is a builder's upload folder) are prefixed with the API origin.
export function resolveApiUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith("/api/") || pathOrUrl.startsWith("/dav/")) {
    return `${apiOrigin()}${pathOrUrl}`;
  }
  return pathOrUrl;
}
