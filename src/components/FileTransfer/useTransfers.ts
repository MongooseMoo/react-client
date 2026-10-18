import { useLayoutEffect, useState } from 'react';
import type { FileTransfers, TransferSnapshot } from '../../fileTransfer/types';

/** Every transfer the engine knows, oldest first, kept current as they change. */
export function useTransfers(transfers: FileTransfers): TransferSnapshot[] {
  const [snapshots, setSnapshots] = useState<TransferSnapshot[]>([]);

  // A layout effect reads the transfers and subscribes before the browser paints, so the
  // panel is never shown without them.
  useLayoutEffect(() => {
    const refresh = () => setSnapshots(transfers.transfers());
    refresh();
    transfers.on('change', refresh);
    return () => {
      transfers.off('change', refresh);
    };
  }, [transfers]);

  return snapshots;
}
