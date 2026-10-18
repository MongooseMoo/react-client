import { describe, expect, it, vi } from 'vitest';

import type MudClient from '../../client';
import type { TelnetParser } from '../../telnet';
import { GmcpSession } from '../session';
import { GMCPClientFileTransfer } from './FileTransfer';

function createFileTransferPackage(load = () => Promise.resolve({})) {
  const client = {
    emit: vi.fn(),
    registerDisconnectReset: vi.fn(),
    getFileTransfers: vi.fn(load),
  } as unknown as MudClient;
  const session = new GmcpSession(client);
  (client as MudClient).gmcp = session;
  const telnet = {
    sendGmcp: vi.fn(),
  } as unknown as TelnetParser;
  session.attachTransport(telnet);

  return {
    fileTransfer: session.register(GMCPClientFileTransfer),
    session,
    telnet,
  };
}

describe('GMCPClientFileTransfer', () => {
  it('emits inbound file transfer messages through package events', async () => {
    const { fileTransfer, session } = createFileTransferPackage();
    const offers: unknown[] = [];

    fileTransfer.on('offer', (offer) => offers.push(offer));
    session.receive(
      'Client.FileTransfer.Offer',
      JSON.stringify({
        sender: 'Alice',
        filename: 'notes.txt',
        filesize: 12,
        offerSdp: '{}',
        hash: 'hash-1',
      }),
    );

    await vi.waitFor(() => expect(offers).toEqual([
      {
        sender: 'Alice',
        filename: 'notes.txt',
        filesize: 12,
        offerSdp: '{}',
        hash: 'hash-1',
      },
    ]));
  });

  it('generates typed outbound send methods from the message registry', () => {
    const { fileTransfer, telnet } = createFileTransferPackage();

    fileTransfer.sendOffer({
      recipient: 'Alice',
      filename: 'notes.txt',
      filesize: 12,
      offerSdp: '{}',
      hash: 'hash-1',
    });
    fileTransfer.sendCancel({ recipient: 'Alice', hash: 'hash-1' });

    expect(telnet.sendGmcp).toHaveBeenCalledWith(
      'Client.FileTransfer.Offer',
      '{"recipient":"Alice","filename":"notes.txt","filesize":12,"offerSdp":"{}","hash":"hash-1"}',
    );
    expect(telnet.sendGmcp).toHaveBeenCalledWith(
      'Client.FileTransfer.Cancel',
      '{"recipient":"Alice","hash":"hash-1"}',
    );
  });

  it('has no way to ask for a resend: a lost link is resumed by a new offer', () => {
    const { fileTransfer } = createFileTransferPackage();

    expect('sendRequestResend' in fileTransfer).toBe(false);
  });

  it('removes package event listeners through off', async () => {
    const { fileTransfer, session } = createFileTransferPackage();
    const listener = vi.fn();

    fileTransfer.on('cancel', listener);
    fileTransfer.off('cancel', listener);
    session.receive(
      'Client.FileTransfer.Cancel',
      JSON.stringify({ sender: 'Alice', hash: 'hash-1' }),
    );

    await Promise.resolve();
    expect(listener).not.toHaveBeenCalled();
  });

  it('retains wire order while loading and drops messages invalidated by reset', async () => {
    let finish!: (value: object) => void;
    const loading = new Promise<object>((resolve) => { finish = resolve; });
    const { fileTransfer } = createFileTransferPackage(() => loading);
    const received: string[] = [];
    fileTransfer.on('offer', () => received.push('offer'));
    fileTransfer.on('cancel', () => received.push('cancel'));
    fileTransfer.receiveRegisteredMessage('Offer', {});
    fileTransfer.receiveRegisteredMessage('Cancel', {});
    expect(received).toEqual([]);
    finish({});
    await vi.waitFor(() => expect(received).toEqual(['offer', 'cancel']));

    fileTransfer.receiveRegisteredMessage('Offer', {});
    fileTransfer.reset();
    await Promise.resolve();
    expect(received).toEqual(['offer', 'cancel']);
  });

  describe('when something goes wrong', () => {
    it('says that file transfer could not be loaded when it could not', async () => {
      const logged = vi.spyOn(console, 'error').mockImplementation(() => {});
      const unavailable = new Error('chunk missing');
      const { fileTransfer } = createFileTransferPackage(() => Promise.reject(unavailable));
      const listener = vi.fn();
      fileTransfer.on('offer', listener);

      fileTransfer.receiveRegisteredMessage('Offer', {});

      await vi.waitFor(() =>
        expect(logged.mock.calls).toEqual([['Failed to load file transfer:', unavailable]]),
      );
      expect(listener).not.toHaveBeenCalled();
      logged.mockRestore();
    });

    it('says that a handler failed when one threw, not that loading failed', async () => {
      const logged = vi.spyOn(console, 'error').mockImplementation(() => {});
      const bug = new Error('handler bug');
      const { fileTransfer } = createFileTransferPackage();
      fileTransfer.on('offer', () => {
        throw bug;
      });

      fileTransfer.receiveRegisteredMessage('Offer', {});

      await vi.waitFor(() =>
        expect(logged.mock.calls).toEqual([
          ['A handler of Client.FileTransfer.Offer failed:', bug],
        ]),
      );
      logged.mockRestore();
    });

    it('reports neither once the session was reset', async () => {
      const logged = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { fileTransfer } = createFileTransferPackage(() => Promise.reject(new Error('late')));

      fileTransfer.receiveRegisteredMessage('Offer', {});
      fileTransfer.reset();
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(logged).not.toHaveBeenCalled();
      logged.mockRestore();
    });
  });
});
