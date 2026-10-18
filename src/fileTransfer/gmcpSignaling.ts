import type { GMCPClientFileTransfer } from '../gmcp/Client/FileTransfer';
import type {
  FileOffer,
  OfferAttempt,
  PeerAddress,
  SignalHandlers,
  TransferId,
  TransferSignaling,
} from './types';

type Fields = Record<string, unknown>;

/**
 * Carries transfer signalling over the `Client.FileTransfer` GMCP package.
 *
 * Everything arriving from the package is untrusted: a message that does not have the
 * expected shape is dropped with a warning and never reaches the handlers.
 */
export function createGmcpTransferSignaling(gmcp: GMCPClientFileTransfer): TransferSignaling {
  return {
    // Offer has no field for the attempt and the server relays `offerSdp` opaquely, so
    // a resume is marked inside it, beside the description's own keys.
    sendOffer(to, offer, description, attempt) {
      gmcp.sendOffer({
        recipient: to,
        filename: offer.name,
        filesize: offer.size,
        offerSdp: JSON.stringify(
          attempt === 'resume' ? { ...description, resume: true } : description,
        ),
        hash: offer.id,
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

    // Candidate has no hash field and the server relays `candidate` opaquely, so the
    // transfer id travels inside it. That is what keeps the candidates of several
    // transfers with the same peer apart.
    sendCandidate(to, id, candidate) {
      gmcp.sendCandidate({
        recipient: to,
        candidate: JSON.stringify({ transfer: id, candidate }),
      });
    },

    sendReject(to, id) {
      gmcp.sendReject({ sender: to, hash: id });
    },

    sendCancel(to, id) {
      gmcp.sendCancel({ recipient: to, hash: id });
    },

    subscribe(handlers: SignalHandlers) {
      const detach = [
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
      ];

      return () => {
        for (const remove of detach) remove();
      };
    },
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
  const size = message.filesize;
  if (typeof size !== 'number' || !Number.isSafeInteger(size) || size < 0) {
    throw new Error('filesize is not a non-negative safe integer');
  }
  const { resume, ...described } = description(message, 'offerSdp') as RTCSessionDescriptionInit & {
    resume?: unknown;
  };
  return {
    from: text(message, 'sender'),
    offer: { id: text(message, 'hash'), name: text(message, 'filename'), size },
    description: described,
    attempt: resume === true ? 'resume' : 'first',
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
  // A client on the old build sends the bare candidate here, without a transfer tag.
  const tagged = fields(JSON.parse(text(message, 'candidate')), 'candidate');
  return {
    from: text(message, 'sender'),
    id: text(tagged, 'transfer'),
    candidate: fields(tagged.candidate, 'candidate.candidate') as RTCIceCandidateInit,
  };
}

function readTransferReference(payload: unknown): { from: PeerAddress; id: TransferId } {
  const message = fields(payload, 'payload');
  return { from: text(message, 'sender'), id: text(message, 'hash') };
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

function description(source: Fields, name: string): RTCSessionDescriptionInit {
  const parsed = fields(JSON.parse(text(source, name)), name);
  text(parsed, 'type');
  return parsed as unknown as RTCSessionDescriptionInit;
}
