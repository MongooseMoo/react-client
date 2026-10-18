import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type MudClient from '../../client';
import { FileTransferError } from '../../fileTransfer/types';
import type { FileTransfers, TransferSnapshot, TransferState } from '../../fileTransfer/types';
import { useConnectionStore } from '../../stores/connectionStore';
import { discardShares, finishStagedShare, stageNextSharedFile, useLaunchStore } from '../../launch/launchStore';
import type { UserlistPlayer } from '../../mcp';
import { findTransferPeerByAddress, userlistPlayersToTransferPeers } from '../../fileTransferPeers';
import type { TransferPeer } from '../../fileTransferPeers';
import Controls from './Controls';
import ProgressBar from './ProgressBar';
import PendingTransfer from './PendingTransfer';
import OutgoingTransfer from './OutgoingTransfer';
import History from './History';
import { formatFileSize } from './formatFileSize';
import { useFocusRefuge } from './useFocusRefuge';
import { useTransferHistory } from './useTransferHistory';
import { useTransfers } from './useTransfers';
import './styles.css';

interface FileTransferUIProps {
  client: MudClient;
  expanded: boolean;
  users: UserlistPlayer[];
}

const UNDER_WAY: readonly TransferState[] = ['connecting', 'transferring', 'verifying'];

/** A file of ours the peer has not answered for yet. */
const awaitsPeer = ({ direction, state }: TransferSnapshot) =>
  direction === 'send' && (state === 'preparing' || state === 'offered');

/** A peer's file the user has not answered for yet. */
const awaitsUser = ({ direction, state }: TransferSnapshot) =>
  direction === 'receive' && state === 'offered';

const isUnderWay = ({ state }: TransferSnapshot) => UNDER_WAY.includes(state);

const FileTransferUI = ({ transfers, expanded, users }: FileTransferUIProps & { transfers: FileTransfers }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedRecipient, setSelectedRecipient] = useState<TransferPeer | null>(null);
  const recipients = useMemo(() => userlistPlayersToTransferPeers(users), [users]);

  const getPeerLabel = useCallback(
    (address: string) => findTransferPeerByAddress(recipients, address)?.label ?? address,
    [recipients],
  );

  const snapshots = useTransfers(transfers);
  const history = useTransferHistory(transfers, getPeerLabel);

  const panel = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  useFocusRefuge(panel, heading);

  // Files shared from another app, one at a time: each waits as the chosen
  // file until the player picks a recipient and sends it. Nothing goes by itself.
  // The staged one lives in the launch store, so a remount (the connection
  // changed) finds it again instead of losing it.
  const queuedShares = useLaunchStore((state) => state.sharedFiles);
  const sharedFile = useLaunchStore((state) => state.stagedShare) ?? null;
  const recipientInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (sharedFile || queuedShares.length === 0) return;
    // A newly staged file is what the player came for; a restaged one after a remount is not news.
    if (stageNextSharedFile()) recipientInput.current?.focus();
  }, [queuedShares, sharedFile]);
  useEffect(() => {
    if (sharedFile) setSelectedFile(sharedFile);
  }, [sharedFile]);

  const chooseFile = (file: File) => {
    // Choosing a file of one's own sets the shared files aside.
    if (sharedFile || queuedShares.length > 0) discardShares();
    setSelectedFile(file);
  };

  useEffect(() => {
    if (
      selectedRecipient &&
      !recipients.some((recipient) => recipient.id === selectedRecipient.id)
    ) {
      setSelectedRecipient(null);
    }
  }, [recipients, selectedRecipient]);

  /**
   * Runs something the user asked of the engine. A failure that ended a transfer is in
   * the history through that transfer; any other is noted here, as `failure`.
   */
  const attempt = async (failure: string, action: () => unknown) => {
    try {
      await action();
    } catch (error) {
      if (transfers.transfers().some((transfer) => transfer.error === error)) return;
      history.note(`${failure}: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleSendFile = () => {
    if (selectedFile && selectedRecipient) {
      void attempt(`Error sending file ${selectedFile.name}`, () =>
        transfers.send(selectedFile, selectedRecipient.transferAddress),
      );
      // The next shared file, if any, takes its place.
      if (selectedFile === sharedFile) finishStagedShare();
    }
  };

  const accept = ({ key, name }: TransferSnapshot) =>
    void attempt(`Error accepting file ${name}`, () => transfers.accept(key));

  /** Turning down what the peer has just withdrawn is no failure: the row was a moment stale. */
  const unlessGone = (action: () => void) => () => {
    try {
      action();
    } catch (error) {
      if (!(error instanceof FileTransferError && error.code === 'unknown-transfer')) throw error;
    }
  };

  const reject = ({ key, name }: TransferSnapshot) =>
    void attempt(`Error rejecting file ${name}`, unlessGone(() => transfers.reject(key)));

  const cancel = ({ key, name }: TransferSnapshot) =>
    void attempt(`Error cancelling file ${name}`, unlessGone(() => transfers.cancel(key)));

  return (
    <div ref={panel} className={`file-transfer-ui ${expanded ? 'expanded' : 'collapsed'}`}>
      {/* Focusable from code only: where focus goes when the row that held it is gone. */}
      <h3 ref={heading} tabIndex={-1}>File Transfer</h3>

      {/* Present before it has anything to say, so that what it says is announced. */}
      <p role="status" className="file-transfer-shared">
        {sharedFile
          ? `Shared file ready: ${sharedFile.name}, ${formatFileSize(sharedFile.size)}. Choose a recipient, then Send.` +
            (queuedShares.length > 0 ? ` ${queuedShares.length} more shared after this one.` : '')
          : ''}
      </p>

      <Controls
        onFileChange={chooseFile}
        onRecipientChange={setSelectedRecipient}
        onSendFile={handleSendFile}
        selectedFile={selectedFile}
        selectedRecipient={selectedRecipient}
        recipients={recipients}
        recipientInputRef={recipientInput}
      />

      {snapshots.filter(awaitsPeer).map((transfer) => (
        <OutgoingTransfer
          key={transfer.key}
          filename={transfer.name}
          recipientLabel={getPeerLabel(transfer.peer)}
          onCancel={() => cancel(transfer)}
        />
      ))}

      {snapshots.filter(awaitsUser).map((offer) => (
        <PendingTransfer
          key={offer.key}
          filename={offer.name}
          size={offer.size}
          senderLabel={getPeerLabel(offer.peer)}
          onAccept={() => accept(offer)}
          onReject={() => reject(offer)}
        />
      ))}

      {snapshots.filter(isUnderWay).map((transfer) => (
        <ProgressBar
          key={transfer.key}
          transfer={transfer}
          peerLabel={getPeerLabel(transfer.peer)}
          onCancel={() => cancel(transfer)}
        />
      ))}

      <History history={history.entries} />
    </div>
  );
};

export default function FileTransferPanel(props: FileTransferUIProps) {
  const [transfers, setTransfers] = useState<FileTransfers | null>(null);
  const [error, setError] = useState<string | null>(null);
  const connected = useConnectionStore((state) => state.connected);
  // biome-ignore lint/correctness/useExhaustiveDependencies: Disconnect replaces the engine without changing client identity.
  useEffect(() => {
    let cancelled = false;
    setTransfers(null);
    setError(null);
    void props.client.getFileTransfers().then((loaded) => {
      if (!cancelled) setTransfers(loaded);
    }).catch((error) => {
      if (!cancelled) setError(error instanceof Error ? error.message : 'Unable to load file transfers');
    });
    return () => { cancelled = true; };
  }, [props.client, connected]);
  if (error) return <p role="alert">{error}</p>;
  if (!transfers) return <p role="status">Loading file transfers…</p>;
  return <FileTransferUI {...props} transfers={transfers} />;
}
