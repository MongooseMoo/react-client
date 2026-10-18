import { create } from 'zustand';

interface LaunchState {
  /** Files shared from another app, oldest first, for the file transfer panel to offer. */
  sharedFiles: File[];
  /** Bumped when shared files arrive, asking the window to show the file transfer panel. */
  filesRequest: number;
  /** A database file the OS opened with the client, awaiting the player's answer. */
  database?: File;
  /** A database the player chose to host, for this window's WasmHost to boot. */
  confirmedDatabase?: File;
  /** True while this window's WasmHost is waiting for a database. */
  hostWaiting: boolean;
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

/** The next shared file, removed from the queue. */
export function takeSharedFile(): File | undefined {
  const [next, ...rest] = useLaunchStore.getState().sharedFiles;
  if (next) useLaunchStore.setState({ sharedFiles: rest });
  return next;
}
