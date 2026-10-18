import { afterEach, beforeEach, describe, expect, it, vi, type Mock, type MockInstance } from 'vitest';

import type MudClient from '../client';
import { GMCPClientFileTransfer } from '../gmcp/Client/FileTransfer';
import { GmcpSession } from '../gmcp/session';
import type { TelnetParser } from '../telnet';
import { createGmcpSharingSignaling, createGmcpTransferSignaling } from './gmcpSignaling';
import type { SharedFile, SharingHandlers, SignalHandlers } from './types';

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
    sharing: createGmcpSharingSignaling(gmcp),
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
    request: vi.fn(),
  } satisfies SignalHandlers;
}

function createSharingHandlers() {
  return {
    browse: vi.fn(),
    list: vi.fn(),
    search: vi.fn(),
    result: vi.fn(),
  } satisfies SharingHandlers;
}

const FILE: SharedFile = { hash: ID, name: 'map.txt', path: 'maps/old', size: 12345 };
const TOP_LEVEL_FILE: SharedFile = { hash: OTHER_ID, name: 'readme', path: '', size: 0 };

function expectCalledOnceWith(handler: Mock, ...args: unknown[]) {
  expect(handler.mock.calls).toEqual([args]);
}

function expectNothingHandled(handlers: Record<string, Mock>) {
  for (const handler of Object.values(handlers)) expect(handler).not.toHaveBeenCalled();
}

const validOffer = {
  sender: 'Alice',
  filename: 'notes.txt',
  filesize: 12,
  offerSdp: JSON.stringify(SDP_OFFER),
  hash: ID,
  resume: false,
};
const validAccept = {
  sender: 'Bob',
  hash: ID,
  filename: 'notes.txt',
  answerSdp: JSON.stringify(SDP_ANSWER),
};
const validCandidate = {
  sender: 'Alice',
  hash: ID,
  candidate: JSON.stringify(ICE),
};
const validReject = { sender: 'Bob', hash: ID };
const validCancel = { sender: 'Alice', hash: ID };
const validRequest = { sender: '#456', hash: ID };
const validBrowse = { sender: '#456' };
const validList = { sender: '#123', files: [FILE, TOP_LEVEL_FILE] };
const validSearch = { sender: '#456', id: 'search-1', query: 'map' };
const validResult = { sender: '#123', id: 'search-1', files: [FILE] };

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
            resume: false,
          },
        ],
      ]);
    });

    it('marks an offer that resumes a transfer in its own resume field, not in the description', () => {
      const { signaling, sent } = createSignaling();

      signaling.sendOffer('Bob', { id: ID, name: 'notes.txt', size: 12 }, SDP_OFFER, 'resume');

      const [[, payload]] = sent() as Array<[string, { offerSdp: string; resume: unknown }]>;
      expect(payload.resume).toBe(true);
      expect(JSON.parse(payload.offerSdp)).toEqual(SDP_OFFER);
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

    it('sends a candidate with its transfer id in the hash field and the bare candidate as a JSON string', () => {
      const { signaling, sent } = createSignaling();

      signaling.sendCandidate('Bob', ID, ICE);

      expect(sent()).toEqual([
        [
          'Client.FileTransfer.Candidate',
          { recipient: 'Bob', hash: ID, candidate: JSON.stringify(ICE) },
        ],
      ]);
    });

    it('sends a request for a file to the sharer', () => {
      const { signaling, sent } = createSignaling();

      signaling.sendRequest('#123', ID);

      expect(sent()).toEqual([['Client.FileTransfer.Request', { recipient: '#123', hash: ID }]]);
    });

    it('turns sharing on and off with Share', () => {
      const { sharing, sent } = createSignaling();

      sharing.sendShare(true);
      sharing.sendShare(false);

      expect(sent()).toEqual([
        ['Client.FileTransfer.Share', { sharing: true }],
        ['Client.FileTransfer.Share', { sharing: false }],
      ]);
    });

    it('asks a sharer for their list with Browse', () => {
      const { sharing, sent } = createSignaling();

      sharing.sendBrowse('#123');

      expect(sent()).toEqual([['Client.FileTransfer.Browse', { recipient: '#123' }]]);
    });

    it('answers a browse with List, carrying every file', () => {
      const { sharing, sent } = createSignaling();

      sharing.sendList('#456', [FILE, TOP_LEVEL_FILE]);

      expect(sent()).toEqual([
        ['Client.FileTransfer.List', { recipient: '#456', files: [FILE, TOP_LEVEL_FILE] }],
      ]);
    });

    it('sends a search to the server with its id and query, naming no recipient', () => {
      const { sharing, sent } = createSignaling();

      sharing.sendSearch('search-1', 'map');

      expect(sent()).toEqual([['Client.FileTransfer.Search', { id: 'search-1', query: 'map' }]]);
    });

    it('answers a search with Result under the search id', () => {
      const { sharing, sent } = createSignaling();

      sharing.sendResult('#456', 'search-1', [FILE]);

      expect(sent()).toEqual([
        ['Client.FileTransfer.Result', { recipient: '#456', id: 'search-1', files: [FILE] }],
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

    it('hands on an offer whose resume field is true as a resume', async () => {
      const { signaling, receive } = createSignaling();
      const handlers = createHandlers();
      signaling.subscribe(handlers);

      await receive('Offer', { ...validOffer, resume: true });

      expectCalledOnceWith(
        handlers.offer,
        'Alice',
        { id: ID, name: 'notes.txt', size: 12 },
        SDP_OFFER,
        'resume',
      );
    });

    it('reads nothing into a resume key inside the description', async () => {
      const { signaling, receive } = createSignaling();
      const handlers = createHandlers();
      signaling.subscribe(handlers);

      await receive('Offer', {
        ...validOffer,
        offerSdp: JSON.stringify({ ...SDP_OFFER, resume: true }),
      });

      const [[, , description, attempt]] = handlers.offer.mock.calls;
      expect(attempt).toBe('first');
      expect(description).toEqual({ ...SDP_OFFER, resume: true });
    });

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
      await receive('Candidate', { ...validCandidate, hash: OTHER_ID });

      expect(handlers.candidate.mock.calls).toEqual([
        ['Alice', ID, ICE],
        ['Alice', OTHER_ID, ICE],
      ]);
    });

    it('hands a request to the request handler', async () => {
      const { signaling, receive } = createSignaling();
      const handlers = createHandlers();
      signaling.subscribe(handlers);

      await receive('Request', validRequest);

      expectCalledOnceWith(handlers.request, '#456', ID);
    });

    it('hands a browse to the browse handler', async () => {
      const { sharing, receive } = createSignaling();
      const handlers = createSharingHandlers();
      sharing.subscribe(handlers);

      await receive('Browse', validBrowse);

      expectCalledOnceWith(handlers.browse, '#456');
    });

    it('hands a list to the list handler, top-level files included', async () => {
      const { sharing, receive } = createSignaling();
      const handlers = createSharingHandlers();
      sharing.subscribe(handlers);

      await receive('List', validList);
      await receive('List', { sender: '#123', files: [] });

      expect(handlers.list.mock.calls).toEqual([
        ['#123', [FILE, TOP_LEVEL_FILE]],
        ['#123', []],
      ]);
    });

    it('hands a search to the search handler', async () => {
      const { sharing, receive } = createSignaling();
      const handlers = createSharingHandlers();
      sharing.subscribe(handlers);

      await receive('Search', validSearch);

      expectCalledOnceWith(handlers.search, '#456', 'search-1', 'map');
    });

    it('hands a result to the result handler', async () => {
      const { sharing, receive } = createSignaling();
      const handlers = createSharingHandlers();
      sharing.subscribe(handlers);

      await receive('Result', validResult);

      expectCalledOnceWith(handlers.result, '#123', 'search-1', [FILE]);
    });

    it('passes on only the described fields of a shared file', async () => {
      const { sharing, receive } = createSignaling();
      const handlers = createSharingHandlers();
      sharing.subscribe(handlers);

      await receive('List', { sender: '#123', files: [{ ...FILE, extra: 'ignored' }] });

      expectCalledOnceWith(handlers.list, '#123', [FILE]);
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
      await receive('Request', validRequest);

      expect(warn).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();
    });

    it('reports nothing for well-formed sharing messages', async () => {
      const { sharing, receive } = createSignaling();
      sharing.subscribe(createSharingHandlers());

      await receive('Browse', validBrowse);
      await receive('List', validList);
      await receive('Search', validSearch);
      await receive('Result', validResult);

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
      ['Offer', 'a missing resume field', { ...validOffer, resume: undefined }],
      ['Offer', 'a string resume field', { ...validOffer, resume: 'true' }],
      ['Offer', 'a numeric resume field', { ...validOffer, resume: 1 }],
      ['Offer', 'a null resume field', { ...validOffer, resume: null }],
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
      ['Candidate', 'a candidate that is a JSON array', { ...validCandidate, candidate: '[]' }],
      ['Candidate', 'a candidate that is a JSON string', { ...validCandidate, candidate: '"c"' }],
      ['Candidate', 'a missing hash', { ...validCandidate, hash: undefined }],
      ['Candidate', 'a non-string hash', { ...validCandidate, hash: 7 }],
      ['Request', 'a payload that is not an object', 'request'],
      ['Request', 'a non-string sender', { ...validRequest, sender: 456 }],
      ['Request', 'a missing hash', { ...validRequest, hash: undefined }],
      ['Browse', 'a payload that is not an object', null],
      ['Browse', 'a non-string sender', { sender: 456 }],
      ['List', 'a payload that is not an object', []],
      ['List', 'a non-string sender', { ...validList, sender: null }],
      ['List', 'files that are not a list', { ...validList, files: FILE }],
      ['List', 'a file that is not an object', { ...validList, files: [FILE, 'map.txt'] }],
      ['List', 'a file with a non-string hash', { ...validList, files: [{ ...FILE, hash: 7 }] }],
      ['List', 'a file whose hash is not a content id', { ...validList, files: [{ ...FILE, hash: 'ABC' }] }],
      [
        'List',
        'a file whose hash is upper-case hexadecimal',
        { ...validList, files: [{ ...FILE, hash: ID.toUpperCase().replace(/A/g, 'F') }] },
      ],
      ['List', 'a file with a non-string name', { ...validList, files: [{ ...FILE, name: 3 }] }],
      ['List', 'a file with a missing path', { ...validList, files: [{ ...FILE, path: undefined }] }],
      ['List', 'a file with a string size', { ...validList, files: [{ ...FILE, size: '12' }] }],
      ['List', 'a file with a negative size', { ...validList, files: [{ ...FILE, size: -1 }] }],
      ['List', 'a file with a fractional size', { ...validList, files: [{ ...FILE, size: 0.5 }] }],
      ['Search', 'a payload that is not an object', 7],
      ['Search', 'a non-string sender', { ...validSearch, sender: [] }],
      ['Search', 'a non-string id', { ...validSearch, id: 1 }],
      ['Search', 'a non-string query', { ...validSearch, query: null }],
      ['Result', 'a payload that is not an object', 'result'],
      ['Result', 'a non-string sender', { ...validResult, sender: 1 }],
      ['Result', 'a non-string id', { ...validResult, id: undefined }],
      ['Result', 'files that are not a list', { ...validResult, files: undefined }],
      ['Result', 'a file with a non-string path', { ...validResult, files: [{ ...FILE, path: 1 }] }],
      ['Reject', 'a payload that is not an object', null],
      ['Reject', 'a non-string sender', { ...validReject, sender: 7 }],
      ['Reject', 'a non-string hash', { ...validReject, hash: undefined }],
      ['Cancel', 'a payload that is not an object', []],
      ['Cancel', 'a non-string sender', { ...validCancel, sender: undefined }],
      ['Cancel', 'a non-string hash', { ...validCancel, hash: { id: ID } }],
    ];

    it.each(cases)('drops %s with %s, warning once', async (kind, _problem, payload) => {
      const { signaling, sharing, receive } = createSignaling();
      const handlers = createHandlers();
      const sharingHandlers = createSharingHandlers();
      signaling.subscribe(handlers);
      sharing.subscribe(sharingHandlers);

      await receive(kind, payload);

      expectNothingHandled(handlers);
      expectNothingHandled(sharingHandlers);
      expect(warn).toHaveBeenCalledOnce();
      expect(warn.mock.calls[0][0]).toContain(`Client.FileTransfer.${kind}`);
      // The package logs whatever a listener throws; nothing may have been thrown.
      expect(error).not.toHaveBeenCalled();
    });

    it.each(cases)('does not throw out of the %s listener for %s', (kind, _problem, payload) => {
      const { gmcp, signaling, sharing } = createSignaling();
      signaling.subscribe(createHandlers());
      sharing.subscribe(createSharingHandlers());

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
      await receive('Request', validRequest);

      expectNothingHandled(handlers);
    });

    it('delivers no sharing message once the sharing subscription is removed', async () => {
      const { sharing, receive } = createSignaling();
      const handlers = createSharingHandlers();
      const unsubscribe = sharing.subscribe(handlers);

      unsubscribe();
      await receive('Browse', validBrowse);
      await receive('List', validList);
      await receive('Search', validSearch);
      await receive('Result', validResult);

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
