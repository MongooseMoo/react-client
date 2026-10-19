import { create } from 'zustand';
import type { GMCPClientFileTransfer } from '../gmcp/Client/FileTransfer';
import { computeContentId } from './contentId';
import { createGmcpSharingSignaling } from './gmcpSignaling';
import type { FileTransfers, PeerAddress, SharedFile, TransferSnapshot } from './types';

type Entry = { kind: 'file' | 'directory'; name: string; getFile(): Promise<File>; values(): AsyncIterable<Entry> };

/** The folder this player shares, and the files other players listed for them. */
export const useSharing = create<{ folder: string | null; listings: Record<PeerAddress, SharedFile[]> }>(() => ({
  folder: null,
  listings: {},
}));

const shared = new Map<string, File>();
const files: SharedFile[] = [];
const requested = new Set<string>();
let gmcp: GMCPClientFileTransfer | undefined;

export const sharedFile = (hash: string) => shared.get(hash);

const listed = (from: PeerAddress, found: SharedFile[]) =>
  useSharing.setState((state) => ({ listings: { ...state.listings, [from]: found } }));

/** Answers Browse and Search, and accepts the offers this player asked for. */
export function attachSharing(package_: GMCPClientFileTransfer, transfers: FileTransfers): void {
  gmcp = package_;
  const signaling = createGmcpSharingSignaling(package_);
  signaling.subscribe({
    browse: (from) => signaling.sendList(from, files),
    search: (from, id, query) => {
      const words = query.toLowerCase().split(/\s+/).filter(Boolean);
      const hits = files.filter((f) => words.every((w) => `${f.path}/${f.name}`.toLowerCase().includes(w)));
      if (hits.length) signaling.sendResult(from, id, hits.slice(0, 100));
    },
    list: listed,
    result: (from, _id, found) => listed(from, found),
  });
  transfers.on('change', (t: TransferSnapshot) => {
    if (t.direction === 'receive' && t.state === 'offered' && requested.delete(`${t.peer} ${t.id}`)) void transfers.accept(t.key);
  });
  if (files.length) gmcp.sendShare({ sharing: true });
}

async function* walk(directory: Entry, path: string): AsyncGenerator<[string, File]> {
  for await (const entry of directory.values()) {
    if (entry.kind === 'file') yield [path, await entry.getFile()];
    else yield* walk(entry, path ? `${path}/${entry.name}` : entry.name);
  }
}

export async function shareFolder(): Promise<void> {
  const directory = await (window as unknown as { showDirectoryPicker(): Promise<Entry> }).showDirectoryPicker();
  shared.clear();
  files.length = 0;
  for await (const [path, file] of walk(directory, '')) {
    const hash = await computeContentId(file);
    shared.set(hash, file);
    files.push({ hash, name: file.name, path, size: file.size });
  }
  useSharing.setState({ folder: directory.name });
  gmcp?.sendShare({ sharing: true });
}

export function stopSharing(): void {
  shared.clear();
  files.length = 0;
  useSharing.setState({ folder: null });
  gmcp?.sendShare({ sharing: false });
}

export const browse = (peer: PeerAddress) => gmcp?.sendBrowse({ recipient: peer });
export const search = (query: string) => gmcp?.sendSearch({ id: crypto.randomUUID(), query });

export function download(peer: PeerAddress, hash: string): void {
  requested.add(`${peer} ${hash}`);
  gmcp?.sendRequest({ recipient: peer, hash });
}
