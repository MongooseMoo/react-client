/**
 * The URLs the web app manifest promises and the client answers. Kept free of
 * browser globals: vite.config.ts imports it to build the manifest.
 */

export const PROTOCOL_SCHEME = 'web+mongoose';
/** Query parameter the browser fills with the whole link (manifest `protocol_handlers`). */
export const PROTOCOL_PARAM = 'protocol';
export const PROTOCOL_HANDLER_URL = `/?${PROTOCOL_PARAM}=%s`;

/** Manifest `share_target.action`; the service worker answers POSTs to it. */
export const SHARE_TARGET_PATH = '/share-target';
/** Query parameter of the page a share opens, naming its launch item. */
export const SHARE_PARAM = 'share';

/** Manifest `file_handlers.action`: host mode, which waits for a database. */
export const FILE_HANDLER_URL = '/?mode=host';
/** Names the confirmed database a window opened to host it. */
export const HOST_DATABASE_PARAM = 'hostDatabase';
