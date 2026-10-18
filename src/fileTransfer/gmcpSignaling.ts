import type { GMCPClientFileTransfer } from '../gmcp/Client/FileTransfer';
import type {
  FileOffer,
  OfferAttempt,
  PeerAddress,
  SharedFile,
  SharingHandlers,
  SharingSignaling,
  SignalHandlers,
  TransferId,
  TransferSignaling,
} from './types';

type Fields = Record<string, unknown>;

/** A `hash` as the protocol defines it: 64 lower-case hexadecimal characters. */
const CONTENT_ID = /^[0-9a-f]{64}$/;

/**
 * Carries transfer signalling over the `Client.FileTransfer` GMCP package.
 *
 * Everything arriving from the package is untrusted: a message that does not have the
 * expected shape is dropped with a warning and never reaches the handlers.
 */
export function createGmcpTransferSignaling(gmcp: GMCPClientFileTransfer): TransferSignaling {
  return {
    sendOffer(to, offer, description, attempt) {
      gmcp.sendOffer({
        recipient: to,
        filename: offer.name,
        filesize: offer.size,
        offerSdp: JSON.stringify(description),
        hash: offer.id,
        resume: attempt === 'resume',
      });
    },

    // Accept and Reject name the peer they are addressed to in `sender`: it is the
    // sender of the offer being answered.
    sendAnswer(to, offer, description) {
      gmcp.sendAccept({
        sender: to,
        hash: offer.id,
        filename: offer.name,
        answerSdp: JSON.stringify(description),
      });
    },

    // Each transfer has its own peer connection; `hash` keeps the candidates of several
    // transfers with the same peer apart.
    sendCandidate(to, id, candidate) {
      gmcp.sendCandidate({ recipient: to, hash: id, candidate: JSON.stringify(candidate) });
    },

    sendReject(to, id) {
      gmcp.sendReject({ sender: to, hash: id });
    },

    sendCancel(to, id) {
      gmcp.sendCancel({ recipient: to, hash: id });
    },

    sendRequest(to, id) {
      gmcp.sendRequest({ recipient: to, hash: id });
    },

    subscribe(handlers: SignalHandlers) {
      return attach([
        gmcp.on(
          'offer',
          checked('Offer', readOffer, ({ from, offer, description, attempt }) =>
            handlers.offer(from, offer, description, attempt),
          ),
        ),
        gmcp.on(
          'accept',
          checked('Accept', readAnswer, ({ from, id, description }) =>
            handlers.answer(from, id, description),
          ),
        ),
        gmcp.on(
          'candidate',
          checked('Candidate', readCandidate, ({ from, id, candidate }) =>
            handlers.candidate(from, id, candidate),
          ),
        ),
        gmcp.on(
          'reject',
          checked('Reject', readTransferReference, ({ from, id }) => handlers.reject(from, id)),
        ),
        gmcp.on(
          'cancel',
          checked('Cancel', readTransferReference, ({ from, id }) => handlers.cancel(from, id)),
        ),
        gmcp.on(
          'request',
          checked('Request', readTransferReference, ({ from, id }) => handlers.request(from, id)),
        ),
      ]);
    },
  };
}

/**
 * Carries the sharing messages over the same package: Share, Browse, List, Search and
 * Result. Arriving messages are checked as strictly as the transfer signals are.
 */
export function createGmcpSharingSignaling(gmcp: GMCPClientFileTransfer): SharingSignaling {
  return {
    sendShare(sharing) {
      gmcp.sendShare({ sharing });
    },

    sendBrowse(to) {
      gmcp.sendBrowse({ recipient: to });
    },

    sendList(to, files) {
      gmcp.sendList({ recipient: to, files });
    },

    sendSearch(id, query) {
      gmcp.sendSearch({ id, query });
    },

    sendResult(to, id, files) {
      gmcp.sendResult({ recipient: to, id, files });
    },

    subscribe(handlers: SharingHandlers) {
      return attach([
        gmcp.on(
          'browse',
          checked('Browse', readBrowse, ({ from }) => handlers.browse(from)),
        ),
        gmcp.on(
          'list',
          checked('List', readList, ({ from, files }) => handlers.list(from, files)),
        ),
        gmcp.on(
          'search',
          checked('Search', readSearch, ({ from, id, query }) => handlers.search(from, id, query)),
        ),
        gmcp.on(
          'result',
          checked('Result', readResult, ({ from, id, files }) => handlers.result(from, id, files)),
        ),
      ]);
    },
  };
}

/** The function that removes every listener in `detach`. */
function attach(detach: Array<() => void>): () => void {
  return () => {
    for (const remove of detach) remove();
  };
}

/**
 * Builds a package listener that delivers only what `read` accepts. Only the reading
 * is guarded: an error thrown by `deliver` is the engine's own. It goes on to the
 * package, which logs it as the failure of a handler.
 */
function checked<Signal>(
  kind: string,
  read: (payload: unknown) => Signal,
  deliver: (signal: Signal) => void,
): (payload: unknown) => void {
  return (payload) => {
    let signal: Signal;
    try {
      signal = read(payload);
    } catch (error) {
      console.warn(`[fileTransfer] Dropped malformed Client.FileTransfer.${kind} message:`, error);
      return;
    }
    deliver(signal);
  };
}

function readOffer(payload: unknown): {
  from: PeerAddress;
  offer: FileOffer;
  description: RTCSessionDescriptionInit;
  attempt: OfferAttempt;
} {
  const message = fields(payload, 'payload');
  const resume = message.resume;
  if (typeof resume !== 'boolean') throw new Error('resume is not a boolean');
  return {
    from: text(message, 'sender'),
    offer: { id: text(message, 'hash'), name: text(message, 'filename'), size: size(message, 'filesize') },
    description: description(message, 'offerSdp'),
    attempt: resume ? 'resume' : 'first',
  };
}

function readAnswer(payload: unknown): {
  from: PeerAddress;
  id: TransferId;
  description: RTCSessionDescriptionInit;
} {
  const message = fields(payload, 'payload');
  return {
    from: text(message, 'sender'),
    id: text(message, 'hash'),
    description: description(message, 'answerSdp'),
  };
}

function readCandidate(payload: unknown): {
  from: PeerAddress;
  id: TransferId;
  candidate: RTCIceCandidateInit;
} {
  const message = fields(payload, 'payload');
  return {
    from: text(message, 'sender'),
    id: text(message, 'hash'),
    candidate: fields(JSON.parse(text(message, 'candidate')), 'candidate') as RTCIceCandidateInit,
  };
}

function readTransferReference(payload: unknown): { from: PeerAddress; id: TransferId } {
  const message = fields(payload, 'payload');
  return { from: text(message, 'sender'), id: text(message, 'hash') };
}

function readBrowse(payload: unknown): { from: PeerAddress } {
  return { from: text(fields(payload, 'payload'), 'sender') };
}

function readList(payload: unknown): { from: PeerAddress; files: SharedFile[] } {
  const message = fields(payload, 'payload');
  return { from: text(message, 'sender'), files: sharedFiles(message) };
}

function readSearch(payload: unknown): { from: PeerAddress; id: string; query: string } {
  const message = fields(payload, 'payload');
  return { from: text(message, 'sender'), id: text(message, 'id'), query: text(message, 'query') };
}

function readResult(payload: unknown): { from: PeerAddress; id: string; files: SharedFile[] } {
  const message = fields(payload, 'payload');
  return { from: text(message, 'sender'), id: text(message, 'id'), files: sharedFiles(message) };
}

/** The `files` of a List or Result; one entry out of shape makes the whole message so. */
function sharedFiles(message: Fields): SharedFile[] {
  const files = message.files;
  if (!Array.isArray(files)) throw new Error('files is not a list');
  return files.map((value, index) => {
    const file = fields(value, `files[${index}]`);
    const hash = text(file, 'hash');
    if (!CONTENT_ID.test(hash)) throw new Error(`files[${index}].hash is not a content id`);
    return { hash, name: text(file, 'name'), path: text(file, 'path'), size: size(file, 'size') };
  });
}

function fields(value: unknown, name: string): Fields {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`${name} is not an object`);
  }
  return value as Fields;
}

function text(source: Fields, name: string): string {
  const value = source[name];
  if (typeof value !== 'string') throw new Error(`${name} is not a string`);
  return value;
}

function size(source: Fields, name: string): number {
  const value = source[name];
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${name} is not a non-negative safe integer`);
  }
  return value;
}

function description(source: Fields, name: string): RTCSessionDescriptionInit {
  const parsed = fields(JSON.parse(text(source, name)), name);
  text(parsed, 'type');
  return parsed as unknown as RTCSessionDescriptionInit;
}
