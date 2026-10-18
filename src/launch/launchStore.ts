import { create } from 'zustand';

/** Modes a manifest shortcut opens; each runs in a window of its own. */
export type LaunchMode = 'host' | 'local';

/** One shortcut launch; a fresh object each time, so dismissing an old one can never clear a new one. */
export interface ModeRequest {
  mode: LaunchMode;
}

interface LaunchState {
  /** Files shared from another app, oldest first, waiting their turn. */
  sharedFiles: File[];
  /**
   * The shared file now chosen in the file transfer panel. Kept here, not in
   * the panel, because the panel remounts when the connection changes; it
   * stays until the player sends it or chooses another file.
   */
  stagedShare?: File;
  /** Bumped when shared files arrive, asking the window to show the file transfer panel. */
  filesRequest: number;
  /** A database file the OS opened with the client, awaiting the player's answer. */
  database?: File;
  /** A database the player chose to host, for this window's WasmHost to boot. */
  confirmedDatabase?: File;
  /** True while this window's WasmHost is waiting for a database. */
  hostWaiting: boolean;
  /** A shortcut asked for a mode this window is not in, awaiting the player's answer. */
  modeRequest?: ModeRequest;
}

/** Hand-off between launches (links, shares, opened files) and the parts of the client that show them. */
export const useLaunchStore = create<LaunchState>(() => ({
  sharedFiles: [],
  filesRequest: 0,
  hostWaiting: false,
}));

export function offerSharedFiles(files: File[]): void {
  if (files.length === 0) return;
  useLaunchStore.setState((state) => ({
    sharedFiles: [...state.sharedFiles, ...files],
    filesRequest: state.filesRequest + 1,
  }));
}

/** Moves the next waiting shared file to the panel; undefined when one is already there or none waits. */
export function stageNextSharedFile(): File | undefined {
  const { stagedShare, sharedFiles } = useLaunchStore.getState();
  if (stagedShare) return undefined;
  const [next, ...rest] = sharedFiles;
  if (next) useLaunchStore.setState({ stagedShare: next, sharedFiles: rest });
  return next;
}

/** The staged shared file was sent; the next one may take its place. */
export function finishStagedShare(): void {
  useLaunchStore.setState({ stagedShare: undefined });
}

/** The player chose a file of their own: every shared file is set aside. */
export function discardShares(): void {
  useLaunchStore.setState({ stagedShare: undefined, sharedFiles: [] });
}
