# Audio loading and offline caching

Cacophony 0.31 loads MediaBunny and each AudioWorklet payload on demand. The
production build identifies optional audio chunks from Rollup's module graph and
omits them from the service worker's precache manifest. Chunks statically required
by an application entry remain precached, including shared dependencies.

The service worker caches same-origin `/assets/` script requests on first use.
Precached scripts retain precedence. Optional audio therefore becomes available
offline after it has been used online; unused effects are not available offline
immediately after installation. The runtime cache retains up to 100 script chunks
for up to 30 days. Hashed filenames distinguish builds.

The existing deployment uploads the complete `dist` directory, so no audio-specific
copy step is required. Excluding a file from precaching does not exclude it from
the deployed build.

Run `npm run test:audio-cache` to build and verify that service worker installation
does not download optional audio, first use fetches a reverb worklet, and a fresh
page can load it offline. Install Playwright Chromium first with
`npx playwright install chromium`. CI runs this check automatically. The smoke
test serves only local production artifacts and does not connect to a MOO.
