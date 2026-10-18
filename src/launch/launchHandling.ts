import { announce } from '@react-aria/live-announcer';
import { focusCommandInput } from '../inputFocus';
import { MAX_SHARED_FILES, takeLaunchItem } from './launchInbox';
import { offerSharedFiles, useLaunchStore } from './launchStore';
import { parseProtocolUrl } from './launchText';
import { HOST_DATABASE_PARAM, PROTOCOL_PARAM, SHARE_PARAM } from './launchUrls';
import { placeLaunchText } from './placeLaunchText';

const LAUNCH_PARAMS = [PROTOCOL_PARAM, SHARE_PARAM, HOST_DATABASE_PARAM];

function isDatabaseFile(handle: FileSystemHandle): handle is FileSystemFileHandle {
  return handle.kind === 'file' && handle.name.toLowerCase().endsWith('.db');
}

/** Acts on what a launch URL carries. Returns once its launch items are read. */
export async function handleLaunchUrl(url: URL): Promise<void> {
  const link = url.searchParams.get(PROTOCOL_PARAM);
  if (link !== null) {
    const text = parseProtocolUrl(link);
    if (text === undefined) announce('That Mongoose link could not be read, so nothing was put in the command input.', 'polite');
    else if (text) placeLaunchText(text);
    else focusCommandInput();
  }

  const share = url.searchParams.get(SHARE_PARAM);
  if (share === 'too-many') {
    announce(`Nothing was shared: the client takes at most ${MAX_SHARED_FILES} files at a time.`, 'polite');
  } else if (share === 'failed') {
    announce('The share could not be read.', 'polite');
  } else if (share) {
    const item = await takeLaunchItem(share);
    if (item?.kind !== 'share') {
      announce('That share is no longer available. Share it again.', 'polite');
    } else {
      if (item.text) placeLaunchText(item.text);
      offerSharedFiles(item.files);
    }
  }

  const hosted = url.searchParams.get(HOST_DATABASE_PARAM);
  if (hosted) {
    const item = await takeLaunchItem(hosted);
    if (item?.kind === 'database') useLaunchStore.setState({ confirmedDatabase: item.file });
    else announce('That database is no longer available. Open it again.', 'polite');
  }
}

/** Files the OS opened with the client: a MOO database waits for the player to confirm hosting it. */
export async function handleLaunchFiles(handles: readonly FileSystemHandle[]): Promise<void> {
  const database = handles.find(isDatabaseFile);
  if (database) {
    useLaunchStore.setState({ database: await database.getFile() });
    return;
  }
  if (handles.length > 0) announce('The client opens only MOO database (.db) files.', 'polite');
}

let started = false;

/**
 * Handles the launch that loaded this page and every later one the browser
 * routes here (manifest `launch_handler: focus-existing`). Starts once per page.
 */
export function startLaunchHandling(win: Window = window): void {
  if (started) return;
  started = true;
  const initial = new URL(win.location.href);
  const report = (error: unknown) => console.error('Launch could not be handled:', error);

  if (LAUNCH_PARAMS.some((name) => initial.searchParams.has(name))) {
    // A reload must not repeat the launch.
    const cleaned = new URL(initial);
    for (const name of LAUNCH_PARAMS) cleaned.searchParams.delete(name);
    win.history.replaceState(win.history.state, '', cleaned.href);
    void handleLaunchUrl(initial).catch(report);
  }

  let first = true;
  win.launchQueue?.setConsumer((params) => {
    // The browser also queues the launch that loaded the page, handled above.
    const repeat = first && params.targetURL === initial.href;
    first = false;
    if (params.targetURL && !repeat) void handleLaunchUrl(new URL(params.targetURL)).catch(report);
    if (params.files.length > 0) void handleLaunchFiles(params.files).catch(report);
  });
}

export function resetLaunchHandlingForTests(): void {
  started = false;
}
