import type { ManifestOptions } from 'vite-plugin-pwa';
import {
  FILE_HANDLER_URL,
  HOST_URL,
  LOCAL_URL,
  PROTOCOL_HANDLER_URL,
  PROTOCOL_SCHEME,
  SHARE_TARGET_PATH,
} from '../launch/launchUrls';

/**
 * The installed app's manifest, the only one the page links (vite-plugin-pwa
 * injects it). Every launch it promises lands in the client as a draft, an
 * offered file, or a question; none sends anything by itself.
 */
export const webAppManifest: Partial<ManifestOptions> = {
  id: '/',
  name: 'Mongoose',
  short_name: 'Mongoose',
  description: 'Play Project Mongoose and other MOOs, built for screen readers.',
  lang: 'en',
  start_url: '/',
  scope: '/',
  display: 'standalone',
  // The page background, so launch shows no flash of another colour.
  background_color: '#0f0f14',
  theme_color: '#0f254c',
  categories: ['games', 'entertainment', 'social'],
  icons: [
    { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
  ],
  shortcuts: [
    { name: 'Host a MOO server', short_name: 'Host', url: HOST_URL, description: 'Start a MOO from a database file and let others join.' },
    { name: 'Play a local MOO', short_name: 'Local', url: LOCAL_URL, description: 'Run the built-in minimal database in a window of its own.' },
  ],
  protocol_handlers: [{ protocol: PROTOCOL_SCHEME, url: PROTOCOL_HANDLER_URL }],
  file_handlers: [{ action: FILE_HANDLER_URL, accept: { 'application/x-moo-database': ['.db'] } }],
  share_target: {
    action: SHARE_TARGET_PATH,
    method: 'POST',
    enctype: 'multipart/form-data',
    params: { title: 'title', text: 'text', url: 'url', files: [{ name: 'files', accept: ['*/*'] }] },
  },
  // Links, opened files and shortcuts go to the open window (through
  // window.launchQueue) instead of reloading it or opening another connection.
  // A shortcut for another mode asks there before opening a window of its own.
  launch_handler: { client_mode: 'focus-existing' },
};
