import { announce } from '@react-aria/live-announcer';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type {
  FileTransfers,
  PeerAddress,
  TransferSnapshot,
  TransferState,
} from '../../fileTransfer/types';

const HISTORY_LENGTH = 10;

export interface HistoryEntry {
  id: number;
  text: string;
}

export interface TransferHistory {
  /** The latest entries, oldest first. */
  entries: HistoryEntry[];
  /** Adds a line about something that is not a change of a transfer. */
  note(text: string): void;
}

/** What to tell the user when a transfer goes from `previous` to its present state. */
function describeTransition(
  { direction, name, state, error }: TransferSnapshot,
  previous: TransferState | undefined,
  peer: string,
): string | undefined {
  const sending = direction === 'send';
  switch (state) {
    case 'offered':
      return sending
        ? `Offered ${name} to ${peer} — waiting for accept…`
        : `Incoming file offer: ${name} from ${peer}`;
    case 'connecting':
      if (previous !== 'offered') return `Connection lost, reconnecting: ${name} (${direction})`;
      return sending
        ? `File transfer accepted: ${name} by ${peer}`
        : `Accepting file transfer: ${name} from ${peer}`;
    case 'complete':
      return sending ? `File sent successfully: ${name}` : `File received successfully: ${name}`;
    case 'rejected':
      return sending
        ? `File transfer rejected: ${name} by ${peer}`
        : `Rejected file transfer: ${name} from ${peer}`;
    case 'cancelled':
      return `File transfer cancelled: ${name} (${direction})`;
    case 'failed':
      return `Error ${sending ? 'sending' : 'receiving'} file ${name}: ${error?.message}`;
    default:
      // Preparing, transferring and verifying show in the transfer's own row.
      return undefined;
  }
}

function statesOf(transfers: FileTransfers): Map<string, TransferState> {
  return new Map(transfers.transfers().map(({ key, state }) => [key, state]));
}

/**
 * The last few things that happened to the engine's transfers since the panel opened,
 * one line for each change of state.
 */
export function useTransferHistory(
  transfers: FileTransfers,
  labelOf: (peer: PeerAddress) => string,
): TransferHistory {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const entriesAdded = useRef(0);
  // A line names the peer as the user list had it when the line was written.
  const currentLabelOf = useRef(labelOf);
  currentLabelOf.current = labelOf;

  // Written and, unless it was `alreadySaid`, spoken. Speaking goes through the client's
  // announcer and not a live region here, which would be silent whenever another tab shows.
  const note = useCallback((text: string, alreadySaid = false) => {
    entriesAdded.current += 1;
    const entry = { id: entriesAdded.current, text };
    setEntries((earlier) => [...earlier, entry].slice(-HISTORY_LENGTH));
    if (!alreadySaid) announce(text, 'polite');
  }, []);

  // A layout effect, like the one that reads the transfers to show: the history starts
  // where that reading was taken, and no change falls between the two.
  useLayoutEffect(() => {
    let states = statesOf(transfers);
    const onChange = (transfer: TransferSnapshot) => {
      const previous = states.get(transfer.key);
      states = statesOf(transfers);
      // Progress is a change too, but not one of state.
      if (previous === transfer.state) return;
      const line = describeTransition(transfer, previous, currentLabelOf.current(transfer.peer));
      // A newly offered file is told to the user by `useFileTransferNotifications`.
      const alreadySaid = transfer.direction === 'receive' && transfer.state === 'offered';
      if (line) note(line, alreadySaid);
    };
    transfers.on('change', onChange);
    return () => {
      transfers.off('change', onChange);
    };
  }, [transfers, note]);

  return { entries, note };
}
