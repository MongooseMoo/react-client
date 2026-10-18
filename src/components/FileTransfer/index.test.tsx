import { announce } from '@react-aria/live-announcer';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type MudClient from '../../client';
import {
  FileTransferEngine,
  type FileTransferEngineOptions,
} from '../../fileTransfer/FileTransferEngine';
import { createMemoryTransferStorage } from '../../fileTransfer/storage';
import {
  type FakeLink,
  LinkNetwork,
  polyfillBlobArrayBuffer,
  SignalingHub,
} from '../../fileTransfer/testHarness';
import { FileTransferError } from '../../fileTransfer/types';
import type { ReceivedFile, TransferState } from '../../fileTransfer/types';
import { PIECE_SIZE } from '../../fileTransfer/wire';
import type { UserlistPlayer } from '../../mcp';
import { offerSharedFiles, useLaunchStore } from '../../launch/launchStore';
import FileTransferPanel from './index';

vi.mock('@react-aria/live-announcer', () => ({ announce: vi.fn() }));

polyfillBlobArrayBuffer();

// The panel under test belongs to the player at ME; Alice and Bob are in the user list.
const ME = '#1';
const ALICE = '#2';
const BOB = '#3';
const users: UserlistPlayer[] = [
  { Object: ALICE, Name: 'Alice', Icon: 0, away: false, idle: false },
  { Object: BOB, Name: 'Bob', Icon: 0, away: false, idle: false },
];

let hub: SignalingHub;
let network: LinkNetwork;
let engines: FileTransferEngine[];
let delivered: ReceivedFile[];

beforeEach(() => {
  hub = new SignalingHub();
  network = new LinkNetwork();
  engines = [];
  delivered = [];
  vi.mocked(announce).mockClear();
});

afterEach(() => {
  for (const engine of engines) engine.dispose();
});

/** A real engine at `address`, joined to the others by in-memory signalling and links. */
function player(
  address: string,
  options: Partial<FileTransferEngineOptions> = {},
): FileTransferEngine {
  const engine = new FileTransferEngine({
    signaling: hub.peer(address),
    createLink: network.factory(address),
    storage: createMemoryTransferStorage(),
    deliver: (file) => {
      delivered.push(file);
    },
    ...options,
  });
  engines.push(engine);
  return engine;
}

async function openPanel(transfers: FileTransferEngine) {
  const client = { getFileTransfers: async () => transfers } as unknown as MudClient;
  const view = render(<FileTransferPanel client={client} expanded users={users} />);
  await screen.findByRole('button', { name: 'Send File' });
  return view;
}

function fileOf(pieces: number, name: string): File {
  return new File([new Uint8Array(pieces * PIECE_SIZE).fill(7)], name);
}

function sendThroughPanel(file: File, recipient: string): void {
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
  fireEvent.change(fileInput, { target: { files: [file] } });
  fireEvent.focus(screen.getByLabelText('Recipient'));
  fireEvent.mouseDown(screen.getByRole('option', { name: recipient }));
  fireEvent.click(screen.getByRole('button', { name: 'Send File' }));
}

/** Lets each link carry `count` pieces and keeps the rest back until `releasePieces()`. */
function holdPiecesAfter(count: number): void {
  const carried = new Map<FakeLink, number>();
  network.tap = (link, type) => {
    if (type !== 'piece') return 'pass';
    const before = carried.get(link) ?? 0;
    carried.set(link, before + 1);
    return before < count ? 'pass' : 'hold';
  };
}

function releasePieces(): void {
  network.tap = () => 'pass';
  for (const link of network.links) link.release();
}

function statesOf(engine: FileTransferEngine): TransferState[] {
  return engine.transfers().map((transfer) => transfer.state);
}

function reaches(engine: FileTransferEngine, ...states: TransferState[]): Promise<void> {
  return waitFor(() => expect(statesOf(engine)).toEqual(states));
}

function history(): string[] {
  const list = screen.getByRole('list', { name: 'Transfer History' });
  return within(list)
    .queryAllByRole('listitem')
    .map((line) => line.textContent ?? '');
}

function progressOf(name: string): Promise<HTMLProgressElement> {
  return screen.findByRole('progressbar', { name }) as Promise<HTMLProgressElement>;
}

describe('FileTransferPanel', () => {
  it('shows an offer that arrived before the panel was opened', async () => {
    const me = player(ME);
    await player(ALICE).send(fileOf(1, 'notes.txt'), ME);
    await reaches(me, 'offered');

    await openPanel(me);

    expect(await screen.findByText('Incoming file: notes.txt (16.0 KB) from Alice')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Accept notes.txt from Alice' })).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Reject notes.txt from Alice' })).not.toBeNull();
    expect(history()).toEqual([]);
  });

  it('receives an accepted file, showing its progress and then its completion', async () => {
    const me = player(ME);
    const alice = player(ALICE);
    holdPiecesAfter(1);
    await openPanel(me);
    await alice.send(fileOf(2, 'notes.bin'), ME);

    fireEvent.click(await screen.findByRole('button', { name: 'Accept notes.bin from Alice' }));

    const progress = await progressOf('Receiving notes.bin from Alice');
    await waitFor(() => expect(progress.value).toBe(0.5));
    expect(screen.getByText('50%')).not.toBeNull();
    expect(screen.queryByText(/^Incoming file: notes\.bin/)).toBeNull();

    releasePieces();

    await waitFor(() =>
      expect(history()).toEqual([
        'Incoming file offer: notes.bin from Alice',
        'Accepting file transfer: notes.bin from Alice',
        'File received successfully: notes.bin',
      ]),
    );
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(delivered.map((file) => file.name)).toEqual(['notes.bin']);
    await reaches(alice, 'complete');
  });

  it('gives each of several transfers its own progress', async () => {
    const me = player(ME);
    holdPiecesAfter(1);
    await openPanel(me);
    await player(ALICE).send(fileOf(2, 'two.bin'), ME);
    await player(BOB).send(fileOf(4, 'four.bin'), ME);

    fireEvent.click(await screen.findByRole('button', { name: 'Accept two.bin from Alice' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Accept four.bin from Bob' }));

    const two = await progressOf('Receiving two.bin from Alice');
    const four = await progressOf('Receiving four.bin from Bob');
    await waitFor(() => expect([two.value, four.value]).toEqual([0.5, 0.25]));
    expect(screen.getAllByRole('progressbar')).toHaveLength(2);

    releasePieces();

    await waitFor(() => expect(screen.queryByRole('progressbar')).toBeNull());
    expect(history().slice(-2).sort()).toEqual([
      'File received successfully: four.bin',
      'File received successfully: two.bin',
    ]);
  });

  it('rejects an offer', async () => {
    const me = player(ME);
    const alice = player(ALICE);
    await openPanel(me);
    await alice.send(fileOf(1, 'notes.txt'), ME);

    fireEvent.click(await screen.findByRole('button', { name: 'Reject notes.txt from Alice' }));

    await waitFor(() =>
      expect(history()).toEqual([
        'Incoming file offer: notes.txt from Alice',
        'Rejected file transfer: notes.txt from Alice',
      ]),
    );
    expect(screen.queryByText(/^Incoming file: notes\.txt/)).toBeNull();
    await reaches(alice, 'rejected');
  });

  it('notes no error when the offer it rejects has just been withdrawn', async () => {
    const me = player(ME);
    await openPanel(me);
    await player(ALICE).send(fileOf(1, 'notes.txt'), ME);
    const reject = vi.spyOn(me, 'reject').mockImplementation(() => {
      throw new FileTransferError('unknown-transfer', 'There is no transfer "1"');
    });

    fireEvent.click(await screen.findByRole('button', { name: 'Reject notes.txt from Alice' }));

    await waitFor(() => expect(reject).toHaveBeenCalled());
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(history()).toEqual(['Incoming file offer: notes.txt from Alice']);
  });

  it('notes any other failure to reject', async () => {
    const me = player(ME);
    await openPanel(me);
    await player(ALICE).send(fileOf(1, 'notes.txt'), ME);
    vi.spyOn(me, 'reject').mockImplementation(() => {
      throw new Error('boom');
    });

    fireEvent.click(await screen.findByRole('button', { name: 'Reject notes.txt from Alice' }));

    await waitFor(() =>
      expect(history()).toEqual([
        'Incoming file offer: notes.txt from Alice',
        'Error rejecting file notes.txt: boom',
      ]),
    );
  });

  it('offers a file, waits for the answer, and can cancel the wait', async () => {
    const me = player(ME);
    const alice = player(ALICE);
    await openPanel(me);

    sendThroughPanel(fileOf(1, 'notes.txt'), 'Alice');

    await waitFor(() =>
      expect(history()).toEqual(['Offered notes.txt to Alice — waiting for accept…']),
    );
    const waiting = screen.getByRole('group', {
      name: /^Waiting for Alice to accept notes\.txt ?…$/,
    });
    await reaches(alice, 'offered');

    fireEvent.click(
      within(waiting).getByRole('button', { name: 'Cancel offer of notes.txt to Alice' }),
    );

    await waitFor(() => expect(history()).toContain('File transfer cancelled: notes.txt (send)'));
    expect(screen.queryByText(/^Waiting for/)).toBeNull();
    // Alice never accepted the offer, so its withdrawal leaves nothing in her list.
    await reaches(alice);
  });

  it('sends a file the peer accepted and says when the peer has it', async () => {
    const me = player(ME);
    const alice = player(ALICE);
    holdPiecesAfter(0);
    await openPanel(me);
    sendThroughPanel(fileOf(2, 'notes.bin'), 'Alice');
    await reaches(alice, 'offered');

    await alice.accept(alice.transfers()[0].key);

    const progress = await progressOf('Sending notes.bin to Alice');
    await screen.findByText('Verifying…');
    expect(progress.value).toBe(1);
    // A full bar would read as "100%"; a screen reader is told what is really going on.
    expect(progress.getAttribute('aria-valuetext')).toBe('Verifying…');
    expect(screen.queryByText(/^Waiting for/)).toBeNull();

    releasePieces();

    await waitFor(() =>
      expect(history()).toEqual([
        'Offered notes.bin to Alice — waiting for accept…',
        'File transfer accepted: notes.bin by Alice',
        'File sent successfully: notes.bin',
      ]),
    );
  });

  it('cancels a transfer that is under way', async () => {
    const me = player(ME);
    const alice = player(ALICE);
    holdPiecesAfter(1);
    await openPanel(me);
    await alice.send(fileOf(2, 'notes.bin'), ME);
    fireEvent.click(await screen.findByRole('button', { name: 'Accept notes.bin from Alice' }));
    await progressOf('Receiving notes.bin from Alice');

    fireEvent.click(
      screen.getByRole('button', { name: 'Cancel receiving notes.bin from Alice' }),
    );

    await waitFor(() =>
      expect(history()).toContain('File transfer cancelled: notes.bin (receive)'),
    );
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(delivered).toEqual([]);
    await reaches(alice, 'cancelled');
  });

  it('says that a lost connection is being re-established, not that the file was accepted again', async () => {
    const me = player(ME);
    const alice = player(ALICE);
    holdPiecesAfter(1);
    await openPanel(me);
    await alice.send(fileOf(2, 'notes.bin'), ME);
    fireEvent.click(await screen.findByRole('button', { name: 'Accept notes.bin from Alice' }));
    const progress = await progressOf('Receiving notes.bin from Alice');
    await waitFor(() => expect(progress.value).toBe(0.5));

    network.tap = () => 'pass';
    network.linksOf(ME)[0].sever();

    await waitFor(() =>
      expect(history()).toEqual([
        'Incoming file offer: notes.bin from Alice',
        'Accepting file transfer: notes.bin from Alice',
        'Connection lost, reconnecting: notes.bin (receive)',
        'File received successfully: notes.bin',
      ]),
    );
  });

  it("puts a failed transfer's message in the history, once", async () => {
    const me = player(ME, { offerTimeoutMs: 20 });
    player(ALICE);
    await openPanel(me);

    sendThroughPanel(fileOf(1, 'notes.txt'), 'Alice');

    await reaches(me, 'failed');
    await waitFor(() =>
      expect(history()).toEqual([
        'Offered notes.txt to Alice — waiting for accept…',
        'Error sending file notes.txt: The peer did not answer the offer',
      ]),
    );
    expect(screen.queryByText(/^Waiting for/)).toBeNull();
  });

  it('speaks each line of history as it is written, but not an offer the client announces itself', async () => {
    const me = player(ME);
    const alice = player(ALICE);
    await openPanel(me);
    await alice.send(fileOf(1, 'notes.bin'), ME);

    fireEvent.click(await screen.findByRole('button', { name: 'Accept notes.bin from Alice' }));

    await waitFor(() => expect(history()).toContain('File received successfully: notes.bin'));
    expect(vi.mocked(announce).mock.calls).toEqual([
      ['Accepting file transfer: notes.bin from Alice', 'polite'],
      ['File received successfully: notes.bin', 'polite'],
    ]);
    // Nothing in the panel is a live region of its own: it would speak the lines twice
    // while the tab shows, and not at all while it is hidden.
    expect(document.querySelector('.file-transfer-ui [aria-live]')).toBeNull();
  });

  it('shows nothing in the bar while connecting, and says so', async () => {
    const me = player(ME);
    const alice = player(ALICE);
    await openPanel(me);
    await alice.send(fileOf(1, 'notes.bin'), ME);
    // The answer never arrives, so the transfer stays connecting.
    hub.drop = (signal) => signal.kind === 'answer';

    fireEvent.click(await screen.findByRole('button', { name: 'Accept notes.bin from Alice' }));

    const progress = await progressOf('Receiving notes.bin from Alice');
    expect(progress.hasAttribute('value')).toBe(false);
    expect(progress.getAttribute('aria-valuetext')).toBe('Connecting…');
  });

  it('moves focus to the panel heading when the row whose button was pressed is gone', async () => {
    const me = player(ME);
    await openPanel(me);
    await player(ALICE).send(fileOf(1, 'notes.txt'), ME);
    const reject = await screen.findByRole('button', { name: 'Reject notes.txt from Alice' });
    reject.focus();

    fireEvent.click(reject);

    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole('heading', { name: 'File Transfer' })),
    );
  });

  it('moves focus to the heading when the peer withdraws the offer whose button had it', async () => {
    const me = player(ME);
    const alice = player(ALICE);
    await openPanel(me);
    const offered = await alice.send(fileOf(1, 'notes.txt'), ME);
    (await screen.findByRole('button', { name: 'Accept notes.txt from Alice' })).focus();

    alice.cancel(offered.key);

    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole('heading', { name: 'File Transfer' })),
    );
  });

  it('leaves focus where the user has since put it', async () => {
    const me = player(ME);
    const alice = player(ALICE);
    await openPanel(me);
    const offered = await alice.send(fileOf(1, 'notes.txt'), ME);
    (await screen.findByRole('button', { name: 'Accept notes.txt from Alice' })).focus();
    const send = screen.getByRole('button', { name: 'Send File' });
    send.removeAttribute('disabled');
    send.focus();

    alice.cancel(offered.key);

    await waitFor(() => expect(screen.queryByText(/^Incoming file: notes\.txt/)).toBeNull());
    expect(document.activeElement).toBe(send);
  });

  it('puts a send that never became a transfer in the history', async () => {
    const me = player(ME, { maxFileSize: PIECE_SIZE });
    await openPanel(me);

    sendThroughPanel(fileOf(2, 'big.bin'), 'Alice');

    await waitFor(() =>
      expect(history()).toEqual([
        `Error sending file big.bin: The file is larger than ${PIECE_SIZE} bytes`,
      ]),
    );
    expect(me.transfers()).toEqual([]);
  });

  it('keeps only the last ten lines of history', async () => {
    const me = player(ME, { maxFileSize: 0 });
    await openPanel(me);

    for (let n = 1; n <= 12; n++) sendThroughPanel(fileOf(1, `file-${n}.bin`), 'Alice');

    await waitFor(() => expect(history().at(-1)).toMatch(/^Error sending file file-12\.bin/));
    expect(history()).toHaveLength(10);
    expect(history()[0]).toMatch(/^Error sending file file-3\.bin/);
  });

  it('stops listening to the engine when it is closed', async () => {
    const me = player(ME);
    const on = vi.spyOn(me, 'on');
    const off = vi.spyOn(me, 'off');
    const view = await openPanel(me);
    const added = on.mock.calls.map(([, listener]) => listener);
    expect(added.length).toBeGreaterThan(0);

    view.unmount();

    const removed = off.mock.calls.map(([, listener]) => listener);
    for (const listener of added) expect(removed).toContain(listener);
  });

  it('says why when file transfers cannot be loaded', async () => {
    const client = {
      getFileTransfers: async () => {
        throw new Error('Client has shut down');
      },
    } as unknown as MudClient;

    render(<FileTransferPanel client={client} expanded users={users} />);

    expect((await screen.findByRole('alert')).textContent).toBe('Client has shut down');
  });
});

describe('files shared from another app', () => {
  afterEach(() => useLaunchStore.setState({ sharedFiles: [], filesRequest: 0 }));

  it('waits as the chosen file until the player picks a recipient and sends it', async () => {
    const me = player(ME);
    const alice = player(ALICE);
    offerSharedFiles([fileOf(1, 'map.png'), fileOf(1, 'notes.txt')]);
    await openPanel(me);

    expect(await screen.findByText(
      'Shared file ready: map.png, 16.0 KB. Choose a recipient, then Send. 1 more shared after this one.',
    )).not.toBeNull();
    expect(document.activeElement).toBe(screen.getByLabelText('Recipient'));
    expect(statesOf(me)).toEqual([]);

    fireEvent.focus(screen.getByLabelText('Recipient'));
    fireEvent.mouseDown(screen.getByRole('option', { name: 'Alice' }));
    fireEvent.click(screen.getByRole('button', { name: 'Send File' }));
    await reaches(alice, 'offered');
    expect(alice.transfers()[0].name).toBe('map.png');
    expect(await screen.findByText(/^Shared file ready: notes\.txt/)).not.toBeNull();
  });

  it('sets the remaining shared files aside when the player chooses a file of their own', async () => {
    offerSharedFiles([fileOf(1, 'map.png'), fileOf(1, 'notes.txt')]);
    await openPanel(player(ME));
    await screen.findByText(/^Shared file ready: map\.png/);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [fileOf(1, 'mine.txt')] } });

    await waitFor(() => expect(screen.queryByText(/^Shared file ready/)).toBeNull());
    expect(useLaunchStore.getState().sharedFiles).toEqual([]);
  });
});
