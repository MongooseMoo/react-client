import { useState } from 'react';
import type { TransferPeer } from '../../fileTransferPeers';
import { browse, download, search, shareFolder, stopSharing, useSharing } from '../../fileTransfer/sharing';
import { formatFileSize } from './formatFileSize';

/** Share a folder, look at what others share, and download from them. */
export default function Sharing({ recipients }: { recipients: TransferPeer[] }) {
  const { folder, listings } = useSharing();
  const [query, setQuery] = useState('');
  const label = (address: string) => recipients.find((r) => r.transferAddress === address)?.label ?? address;
  return (
    <section aria-label="Shared files">
      <p role="status">{folder ? `Sharing ${folder}. Other players can see your IP address when they download.` : 'Not sharing.'}</p>
      {folder ? (
        <button type="button" onClick={stopSharing}>Stop sharing</button>
      ) : (
        <button type="button" onClick={() => void shareFolder()}>Share a folder</button>
      )}
      <form onSubmit={(event) => { event.preventDefault(); search(query); }}>
        <label>Search shared files <input value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <button type="submit">Search</button>
      </form>
      <ul aria-label="Players">
        {recipients.map((r) => (
          <li key={r.id}><button type="button" onClick={() => browse(r.transferAddress)}>Browse {r.label}</button></li>
        ))}
      </ul>
      {Object.entries(listings).map(([peer, files]) => (
        <ul key={peer} aria-label={`Files shared by ${label(peer)}`}>
          {files.map((f) => (
            <li key={f.hash}>
              <button type="button" onClick={() => download(peer, f.hash)}>
                Download {f.path ? `${f.path}/` : ''}{f.name}, {formatFileSize(f.size)}, from {label(peer)}
              </button>
            </li>
          ))}
        </ul>
      ))}
    </section>
  );
}
