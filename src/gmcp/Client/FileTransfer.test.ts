import { describe, expect, it, vi } from 'vitest';

import type MudClient from '../../client';
import type { TelnetParser } from '../../telnet';
import { GmcpSession } from '../session';
import { GMCPClientFileTransfer } from './FileTransfer';

function createFileTransferPackage() {
  const client = {
    emit: vi.fn(),
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
  it('emits inbound file transfer messages through package events', () => {
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

    expect(offers).toEqual([
      {
        sender: 'Alice',
        filename: 'notes.txt',
        filesize: 12,
        offerSdp: '{}',
        hash: 'hash-1',
      },
    ]);
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
    fileTransfer.sendRequestResend({ sender: 'Alice', hash: 'hash-1' });

    expect(telnet.sendGmcp).toHaveBeenCalledWith(
      'Client.FileTransfer.Offer',
      '{"recipient":"Alice","filename":"notes.txt","filesize":12,"offerSdp":"{}","hash":"hash-1"}',
    );
    expect(telnet.sendGmcp).toHaveBeenCalledWith(
      'Client.FileTransfer.RequestResend',
      '{"sender":"Alice","hash":"hash-1"}',
    );
  });

  it('removes package event listeners through off', () => {
    const { fileTransfer, session } = createFileTransferPackage();
    const listener = vi.fn();

    fileTransfer.on('cancel', listener);
    fileTransfer.off('cancel', listener);
    session.receive(
      'Client.FileTransfer.Cancel',
      JSON.stringify({ sender: 'Alice', hash: 'hash-1' }),
    );

    expect(listener).not.toHaveBeenCalled();
  });
});
