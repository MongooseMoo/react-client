import { afterEach, beforeEach, describe, expect, it, vi, type Mock, type MockInstance } from 'vitest';

import type MudClient from '../client';
import { GMCPClientFileTransfer } from '../gmcp/Client/FileTransfer';
import { GmcpSession } from '../gmcp/session';
import type { TelnetParser } from '../telnet';
import { createGmcpTransferSignaling } from './gmcpSignaling';
import type { SignalHandlers } from './types';

const ID = 'a'.repeat(64);
const OTHER_ID = 'b'.repeat(64);
const SDP_OFFER: RTCSessionDescriptionInit = { type: 'offer', sdp: 'v=0 offer' };
const SDP_ANSWER: RTCSessionDescriptionInit = { type: 'answer', sdp: 'v=0 answer' };
const ICE: RTCIceCandidateInit = {
  candidate: 'candidate:1 1 udp 2122260223 192.0.2.1 54321 typ host',
  sdpMid: '0',
  sdpMLineIndex: 0,
};

function createSignaling() {
  const client = {
    emit: vi.fn(),
    registerDisconnectReset: vi.fn(),
    getFileTransfers: vi.fn(() => Promise.resolve({})),
  } as unknown as MudClient;
  const session = new GmcpSession(client);
  (client as { gmcp: GmcpSession }).gmcp = session;
  const sendGmcp = vi.fn<[name: string, data: string], void>();
  session.attachTransport({ sendGmcp } as unknown as TelnetParser);
  const gmcp = session.register(GMCPClientFileTransfer);

  return {
    gmcp,
    signaling: createGmcpTransferSignaling(gmcp),
    /** Every message put on the wire so far, as [name, decoded body]. */
    sent: () => sendGmcp.mock.calls.map(([name, data]) => [name, JSON.parse(data)]),
    /** Feeds one message in the way the server does, and waits for its delivery. */
    async receive(kind: string, payload: unknown) {
      session.receive(`Client.FileTransfer.${kind}`, JSON.stringify(payload));
      // The package hands inbound messages to its listeners from a promise callback.
      await new Promise((resolve) => setTimeout(resolve, 0));
    },
  };
}

function createHandlers() {
  return {
    offer: vi.fn(),
    answer: vi.fn(),
    candidate: vi.fn(),
    reject: vi.fn(),
    cancel: vi.fn(),
  } satisfies SignalHandlers;
}

function expectCalledOnceWith(handler: Mock, ...args: unknown[]) {
  expect(handler.mock.calls).toEqual([args]);
}

function expectNothingHandled(handlers: ReturnType<typeof createHandlers>) {
  for (const handler of Object.values(handlers)) expect(handler).not.toHaveBeenCalled();
}

const validOffer = {
  sender: 'Alice',
  filename: 'notes.txt',
  filesize: 12,
  offerSdp: JSON.stringify(SDP_OFFER),
  hash: ID,
};
const validAccept = {
  sender: 'Bob',
  hash: ID,
  filename: 'notes.txt',
  answerSdp: JSON.stringify(SDP_ANSWER),
};
const validCandidate = {
  sender: 'Alice',
  candidate: JSON.stringify({ transfer: ID, candidate: ICE }),
};
const validReject = { sender: 'Bob', hash: ID };
const validCancel = { sender: 'Alice', hash: ID };

describe('createGmcpTransferSignaling', () => {
  let warn: MockInstance<Parameters<typeof console.warn>, void>;
  let error: MockInstance<Parameters<typeof console.error>, void>;

  beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    error = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('outbound', () => {
    it('sends an offer to its recipient with the description as a JSON string', () => {
      const { signaling, sent } = createSignaling();

      signaling.sendOffer('Bob', { id: ID, name: 'notes.txt', size: 12 }, SDP_OFFER, 'first');

      expect(sent()).toEqual([
        [
          'Client.FileTransfer.Offer',
          {
            recipient: 'Bob',
            filename: 'notes.txt',
            filesize: 12,
            offerSdp: JSON.stringify(SDP_OFFER),
            hash: ID,
          },
        ],
      ]);
    });

    it('marks an offer that resumes a transfer inside the description string', () => {
      const { signaling, sent } = createSignaling();

      signaling.sendOffer('Bob', { id: ID, name: 'notes.txt', size: 12 }, SDP_OFFER, 'resume');

      const [[, payload]] = sent() as Array<[string, { offerSdp: string }]>;
      expect(JSON.parse(payload.offerSdp)).toEqual({ ...SDP_OFFER, resume: true });
    });

    it('sends an answer as Accept, naming the target peer in the sender field', () => {
      const { signaling, sent } = createSignaling();

      signaling.sendAnswer('Alice', { id: ID, name: 'notes.txt', size: 12 }, SDP_ANSWER);

      expect(sent()).toEqual([
        [
          'Client.FileTransfer.Accept',
          {
            sender: 'Alice',
            hash: ID,
            filename: 'notes.txt',
            answerSdp: JSON.stringify(SDP_ANSWER),
          },
        ],
      ]);
    });

    it('sends a candidate tagged with its transfer id inside the candidate string', () => {
      const { signaling, sent } = createSignaling();

      signaling.sendCandidate('Bob', ID, ICE);

      expect(sent()).toEqual([
        [
          'Client.FileTransfer.Candidate',
          { recipient: 'Bob', candidate: JSON.stringify({ transfer: ID, candidate: ICE }) },
        ],
      ]);
    });

    it('sends a reject, naming the target peer in the sender field', () => {
      const { signaling, sent } = createSignaling();

      signaling.sendReject('Alice', ID);

      expect(sent()).toEqual([['Client.FileTransfer.Reject', { sender: 'Alice', hash: ID }]]);
    });

    it('sends a cancel to its recipient', () => {
      const { signaling, sent } = createSignaling();

      signaling.sendCancel('Bob', ID);

      expect(sent()).toEqual([['Client.FileTransfer.Cancel', { recipient: 'Bob', hash: ID }]]);
    });
  });

  describe('inbound', () => {
    it('hands an offer to the offer handler', async () => {
      const { signaling, receive } = createSignaling();
      const handlers = createHandlers();
      signaling.subscribe(handlers);

      await receive('Offer', validOffer);

      expectCalledOnceWith(
        handlers.offer,
        'Alice',
        { id: ID, name: 'notes.txt', size: 12 },
        SDP_OFFER,
        'first',
      );
    });

    it('hands on an offer marked as resuming as a resume, without the mark in its description', async () => {
      const { signaling, receive } = createSignaling();
      const handlers = createHandlers();
      signaling.subscribe(handlers);

      await receive('Offer', {
        ...validOffer,
        offerSdp: JSON.stringify({ ...SDP_OFFER, resume: true }),
      });

      expectCalledOnceWith(
        handlers.offer,
        'Alice',
        { id: ID, name: 'notes.txt', size: 12 },
        SDP_OFFER,
        'resume',
      );
    });

    it.each([['true'], [1], [false], [null]])(
      'takes an offer whose resume mark is %j as a first offer and drops the mark',
      async (mark) => {
        const { signaling, receive } = createSignaling();
        const handlers = createHandlers();
        signaling.subscribe(handlers);

        await receive('Offer', {
          ...validOffer,
          offerSdp: JSON.stringify({ ...SDP_OFFER, resume: mark }),
        });

        expectCalledOnceWith(
          handlers.offer,
          'Alice',
          { id: ID, name: 'notes.txt', size: 12 },
          SDP_OFFER,
          'first',
        );
      },
    );

    it('accepts an offer for an empty file', async () => {
      const { signaling, receive } = createSignaling();
      const handlers = createHandlers();
      signaling.subscribe(handlers);

      await receive('Offer', { ...validOffer, filesize: 0 });

      expectCalledOnceWith(
        handlers.offer,
        'Alice',
        { id: ID, name: 'notes.txt', size: 0 },
        SDP_OFFER,
        'first',
      );
    });

    it('hands an Accept to the answer handler', async () => {
      const { signaling, receive } = createSignaling();
      const handlers = createHandlers();
      signaling.subscribe(handlers);

      await receive('Accept', validAccept);

      expectCalledOnceWith(handlers.answer, 'Bob', ID, SDP_ANSWER);
    });

    it('hands a candidate to the candidate handler under its transfer id', async () => {
      const { signaling, receive } = createSignaling();
      const handlers = createHandlers();
      signaling.subscribe(handlers);

      await receive('Candidate', validCandidate);
      await receive('Candidate', {
        sender: 'Alice',
        candidate: JSON.stringify({ transfer: OTHER_ID, candidate: ICE }),
      });

      expect(handlers.candidate.mock.calls).toEqual([
        ['Alice', ID, ICE],
        ['Alice', OTHER_ID, ICE],
      ]);
    });

    it('hands a reject to the reject handler', async () => {
      const { signaling, receive } = createSignaling();
      const handlers = createHandlers();
      signaling.subscribe(handlers);

      await receive('Reject', validReject);

      expectCalledOnceWith(handlers.reject, 'Bob', ID);
    });

    it('hands a cancel to the cancel handler', async () => {
      const { signaling, receive } = createSignaling();
      const handlers = createHandlers();
      signaling.subscribe(handlers);

      await receive('Cancel', validCancel);

      expectCalledOnceWith(handlers.cancel, 'Alice', ID);
    });

    it('reports nothing for well-formed messages', async () => {
      const { signaling, receive } = createSignaling();
      signaling.subscribe(createHandlers());

      await receive('Offer', validOffer);
      await receive('Accept', validAccept);
      await receive('Candidate', validCandidate);
      await receive('Reject', validReject);
      await receive('Cancel', validCancel);

      expect(warn).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();
    });
  });

  describe('malformed inbound messages', () => {
    const cases: [kind: string, problem: string, payload: unknown][] = [
      ['Offer', 'a payload that is not an object', null],
      ['Offer', 'a non-string sender', { ...validOffer, sender: 7 }],
      ['Offer', 'a missing sender', { ...validOffer, sender: undefined }],
      ['Offer', 'a non-string hash', { ...validOffer, hash: 7 }],
      ['Offer', 'a non-string filename', { ...validOffer, filename: ['notes.txt'] }],
      ['Offer', 'a string filesize', { ...validOffer, filesize: '12' }],
      ['Offer', 'a negative filesize', { ...validOffer, filesize: -1 }],
      ['Offer', 'a fractional filesize', { ...validOffer, filesize: 1.5 }],
      ['Offer', 'a filesize beyond the safe integers', { ...validOffer, filesize: 2 ** 53 }],
      ['Offer', 'a description that is not JSON', { ...validOffer, offerSdp: 'v=0' }],
      ['Offer', 'a description that is not a string', { ...validOffer, offerSdp: SDP_OFFER }],
      ['Offer', 'a description that is JSON null', { ...validOffer, offerSdp: 'null' }],
      ['Offer', 'a description that is a JSON array', { ...validOffer, offerSdp: '[]' }],
      ['Offer', 'a description that is not an object', { ...validOffer, offerSdp: '"offer"' }],
      ['Offer', 'a description without a type', { ...validOffer, offerSdp: '{"sdp":"v=0"}' }],
      ['Offer', 'a description with a non-string type', { ...validOffer, offerSdp: '{"type":1}' }],
      ['Accept', 'a payload that is not an object', 'accept'],
      ['Accept', 'a non-string sender', { ...validAccept, sender: null }],
      ['Accept', 'a non-string hash', { ...validAccept, hash: 7 }],
      ['Accept', 'a description that is not JSON', { ...validAccept, answerSdp: '{' }],
      ['Accept', 'a missing description', { ...validAccept, answerSdp: undefined }],
      ['Accept', 'a description without a type', { ...validAccept, answerSdp: '{}' }],
      ['Candidate', 'a payload that is not an object', 3],
      ['Candidate', 'a non-string sender', { ...validCandidate, sender: {} }],
      ['Candidate', 'a candidate that is not JSON', { ...validCandidate, candidate: 'candidate:1' }],
      ['Candidate', 'a candidate that is not a string', { ...validCandidate, candidate: ICE }],
      ['Candidate', 'a candidate that is JSON null', { ...validCandidate, candidate: 'null' }],
      [
        'Candidate',
        'the untagged candidate a client on the old build sends',
        { ...validCandidate, candidate: JSON.stringify(ICE) },
      ],
      [
        'Candidate',
        'a non-string transfer tag',
        { ...validCandidate, candidate: JSON.stringify({ transfer: 7, candidate: ICE }) },
      ],
      [
        'Candidate',
        'a tagged candidate that is not an object',
        { ...validCandidate, candidate: JSON.stringify({ transfer: ID, candidate: 'candidate:1' }) },
      ],
      [
        'Candidate',
        'a tagged candidate that is null',
        { ...validCandidate, candidate: JSON.stringify({ transfer: ID, candidate: null }) },
      ],
      [
        'Candidate',
        'a tagged candidate that is an array',
        { ...validCandidate, candidate: JSON.stringify({ transfer: ID, candidate: [] }) },
      ],
      ['Reject', 'a payload that is not an object', null],
      ['Reject', 'a non-string sender', { ...validReject, sender: 7 }],
      ['Reject', 'a non-string hash', { ...validReject, hash: undefined }],
      ['Cancel', 'a payload that is not an object', []],
      ['Cancel', 'a non-string sender', { ...validCancel, sender: undefined }],
      ['Cancel', 'a non-string hash', { ...validCancel, hash: { id: ID } }],
    ];

    it.each(cases)('drops %s with %s, warning once', async (kind, _problem, payload) => {
      const { signaling, receive } = createSignaling();
      const handlers = createHandlers();
      signaling.subscribe(handlers);

      await receive(kind, payload);

      expectNothingHandled(handlers);
      expect(warn).toHaveBeenCalledOnce();
      expect(warn.mock.calls[0][0]).toContain(`Client.FileTransfer.${kind}`);
      // The package logs whatever a listener throws; nothing may have been thrown.
      expect(error).not.toHaveBeenCalled();
    });

    it.each(cases)('does not throw out of the %s listener for %s', (kind, _problem, payload) => {
      const { gmcp, signaling } = createSignaling();
      signaling.subscribe(createHandlers());

      // Straight into the package's dispatch, bypassing the promise that would hide a throw.
      expect(() => gmcp.receive(kind, payload)).not.toThrow();
    });

    it('keeps delivering after a dropped message', async () => {
      const { signaling, receive } = createSignaling();
      const handlers = createHandlers();
      signaling.subscribe(handlers);

      await receive('Cancel', { sender: 'Alice' });
      await receive('Cancel', validCancel);

      expectCalledOnceWith(handlers.cancel, 'Alice', ID);
    });
  });

  describe('subscribe', () => {
    it('delivers nothing once unsubscribed', async () => {
      const { signaling, receive } = createSignaling();
      const handlers = createHandlers();
      const unsubscribe = signaling.subscribe(handlers);

      unsubscribe();
      await receive('Offer', validOffer);
      await receive('Accept', validAccept);
      await receive('Candidate', validCandidate);
      await receive('Reject', validReject);
      await receive('Cancel', validCancel);

      expectNothingHandled(handlers);
    });

    it('serves two subscriptions and detaches each on its own', async () => {
      const { signaling, receive } = createSignaling();
      const first = createHandlers();
      const second = createHandlers();
      const unsubscribeFirst = signaling.subscribe(first);
      const unsubscribeSecond = signaling.subscribe(second);

      await receive('Reject', validReject);
      expect(first.reject).toHaveBeenCalledTimes(1);
      expect(second.reject).toHaveBeenCalledTimes(1);

      unsubscribeFirst();
      await receive('Reject', validReject);
      expect(first.reject).toHaveBeenCalledTimes(1);
      expect(second.reject).toHaveBeenCalledTimes(2);

      unsubscribeSecond();
      await receive('Reject', validReject);
      expect(first.reject).toHaveBeenCalledTimes(1);
      expect(second.reject).toHaveBeenCalledTimes(2);
    });

    it('leaves listeners attached by others in place', async () => {
      const { gmcp, signaling, receive } = createSignaling();
      const foreign = vi.fn();
      gmcp.on('cancel', foreign);

      signaling.subscribe(createHandlers())();
      await receive('Cancel', validCancel);

      expectCalledOnceWith(foreign, validCancel);
    });

    it('lets a handler error surface instead of reporting a malformed message', () => {
      const { gmcp, signaling } = createSignaling();
      const handlers = createHandlers();
      handlers.cancel.mockImplementation(() => {
        throw new Error('engine bug');
      });
      signaling.subscribe(handlers);

      expect(() => gmcp.receive('Cancel', validCancel)).toThrow('engine bug');
      expect(warn).not.toHaveBeenCalled();
    });
  });
});
