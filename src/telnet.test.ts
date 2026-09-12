import { describe, expect, it, vi } from 'vitest';
import { Stream, TelnetCommand, TelnetOption, TelnetParser, WebSocketStream } from './telnet';

it('normalizes binary WebSocket messages to native byte arrays', () => {
  const socket = { binaryType: 'blob', onmessage: undefined as unknown, send: vi.fn() };
  const stream = new WebSocketStream(socket as unknown as WebSocket);
  const receive = vi.fn();
  stream.on('data', receive);
  (socket.onmessage as (event: { data: ArrayBuffer }) => void)({ data: new Uint8Array([65, 66]).buffer });
  expect(socket.binaryType).toBe('arraybuffer');
  expect(receive).toHaveBeenCalledWith(new Uint8Array([65, 66]));
  const backing = new Uint8Array([0, 65, 66, 0]);
  stream.write(backing.subarray(1, 3));
  expect(socket.send).toHaveBeenCalledWith(new Uint8Array([65, 66]));
});

// Mock Stream

class MockStream implements Stream {
  public data: Uint8Array[] = [];
  public callback!: (data: Uint8Array) => void;

  public on(event: string, callback: (data: Uint8Array) => void) {
    this.callback = callback;
  }

  public emit(event: string, data: Uint8Array) {
    this.callback(data);
  }

  public write(data: Uint8Array) {
    this.data.push(data);
    this.emit('data', data);
  }
}

const createTestSubject = () => {
  const stream = new MockStream();
  const telnet = new TelnetParser(stream);
  return { stream, telnet };
};

const testEvent = async (eventName: string, data: Uint8Array, expected: any[]) => {
  const { telnet } = createTestSubject();
  const promise = new Promise<void>((resolve) => {
    telnet.on(eventName, (...args) => {
      expect(args.length).toEqual(expected.length); // Ensure same number of arguments
      expect(args).toEqual(expected);
      resolve();
    });
  });
  telnet.parse(data);
  await promise;
};

describe('Telnet', () => {
  it('preserves sliced UTF-8 GMCP packets across every possible split, including IAC/SE', () => {
    const body = new TextEncoder().encode('Test.Unicode {"text":"café 🎵"}');
    const packet = new Uint8Array([255, 250, 201, ...body, 255, 240, 79, 75]);
    for (let split = 0; split <= packet.length; split++) {
      const parser = new TelnetParser();
      const messages = vi.fn();
      const trailing: number[] = [];
      parser.on('gmcp', messages);
      parser.on('data', (bytes: Uint8Array) => trailing.push(...bytes));
      const padded = new Uint8Array([9, ...packet, 9]);
      parser.parse(padded.subarray(1, split + 1));
      parser.parse(padded.subarray(split + 1, padded.length - 1));
      expect(messages).toHaveBeenCalledTimes(1);
      expect(messages).toHaveBeenCalledWith('Test.Unicode', '{"text":"café 🎵"}');
      expect(trailing).toEqual([79, 75]);
    }
  });

  it('writes exact UTF-8 GMCP and terminal-type frames using native arrays', () => {
    const stream = { on: vi.fn(), write: vi.fn() };
    const parser = new TelnetParser(stream);
    parser.sendGmcp('Test.Unicode', '"🎵"');
    expect(stream.write).toHaveBeenLastCalledWith(new Uint8Array([
      255, 250, 201, ...new TextEncoder().encode('Test.Unicode "🎵"'), 255, 240,
    ]));
    parser.sendTerminalType('Mongoose');
    expect(stream.write).toHaveBeenLastCalledWith(new Uint8Array([
      255, 250, 24, 0, ...new TextEncoder().encode('Mongoose'), 255, 240,
    ]));
    parser.sendNegotiation(TelnetCommand.DO, TelnetOption.GMCP);
    expect(stream.write).toHaveBeenLastCalledWith(new Uint8Array([255, 253, 201]));
  });

  it('retains the UTF-8 BOM in subnegotiation text, matching the previous decoder', () => {
    const parser = new TelnetParser();
    const messages = vi.fn();
    parser.on('gmcp', messages);
    parser.parse(new Uint8Array([255, 250, 201, ...new TextEncoder().encode('\uFEFFTest {}'), 255, 240]));
    expect(messages).toHaveBeenCalledWith('\uFEFFTest', '{}');
  });

  it('should pass data', async () => {
    await testEvent('data', new TextEncoder().encode('Hello world'), [new Uint8Array(new TextEncoder().encode('Hello world'))]);
  });

  it('should pass commands', async () => {
    await testEvent(
      'command',
      new Uint8Array([TelnetCommand.IAC, TelnetCommand.NOP]),
      [TelnetCommand.NOP]
    );
  });

  it.each([TelnetCommand.GA, TelnetCommand.EOR])(
    'should pass prompt boundary command %i',
    async (command) => {
      await testEvent(
        'command',
        new Uint8Array([TelnetCommand.IAC, command]),
        [command],
      );
    },
  );

  it('should pass subnegotiations', async () => {
    await testEvent(
      'subnegotiation',
      new Uint8Array([TelnetCommand.IAC, TelnetCommand.SB, 1, 2, 3, TelnetCommand.IAC, TelnetCommand.SE]),
      [new Uint8Array([1, 2, 3])]
    );
  });

  it('should handle incomplete subnegotiations', async () => {
    const { telnet } = createTestSubject();
    const subnegotiations: Uint8Array[] = [];
    telnet.on('subnegotiation', (subnegotiation) => {
      subnegotiations.push(subnegotiation);
    });

    // Send the start of a Telnet subnegotiation in the first buffer
    telnet.parse(new Uint8Array([TelnetCommand.IAC, TelnetCommand.SB, 1, 2, 3]));
    // Ensure that no 'subnegotiation' event has been emitted yet
    expect(subnegotiations).toEqual([]);

    // Send the end of the Telnet subnegotiation in the second buffer
    telnet.parse(new Uint8Array([TelnetCommand.IAC, TelnetCommand.SE]));
    // The 'subnegotiation' event should be emitted with the complete subnegotiation data
    // Compare contents after converting received Buffer (subnegotiations[0]) to Uint8Array
    expect(subnegotiations.length).toBe(1);
    expect(new Uint8Array(subnegotiations[0])).toEqual(new Uint8Array([1, 2, 3]));
  });

  it('should pass negotiations', async () => {
    await testEvent(
      'negotiation',
      new Uint8Array([TelnetCommand.IAC, TelnetCommand.DO, 1]),
      [TelnetCommand.DO, 1]
    );
  });
  it('should pass GMCP', async () => {
    const gmcpPackage = 'Test.Gmcp';
    const toSend = { 1: [2, 3] };
    const toSendJSON = JSON.stringify(toSend);
    const gmcpData = new TextEncoder().encode(gmcpPackage + ' ' + toSendJSON);
    const encoded = new Uint8Array([
      TelnetCommand.IAC, TelnetCommand.SB, TelnetOption.GMCP,
      ...gmcpData,
      TelnetCommand.IAC, TelnetCommand.SE,
    ]);
    await testEvent('gmcp', encoded, [gmcpPackage, toSendJSON]);
  });

  it('should handle multiple commands', async () => {
    const { telnet } = createTestSubject();
    const commands: number[] = [];
    telnet.on('command', (command) => {
      commands.push(command);
    });
    telnet.parse(new Uint8Array([TelnetCommand.IAC, TelnetCommand.NOP, TelnetCommand.IAC, TelnetCommand.NOP]));
    expect(commands).toEqual([TelnetCommand.NOP, TelnetCommand.NOP]);
  });

  it('should handle commands split across multiple buffers', async () => {
    const { telnet } = createTestSubject();
    const commands: number[] = [];
    telnet.on('command', (command) => {
      commands.push(command);
    });

    // Send the start of a Telnet NOP command in the first buffer
    telnet.parse(new Uint8Array([TelnetCommand.IAC]));
    // Send the end of the Telnet NOP command in the second buffer
    telnet.parse(new Uint8Array([TelnetCommand.NOP]));

    // The 'command' event should be emitted with TelnetCommand.NOP as the argument
    expect(commands).toEqual([TelnetCommand.NOP]);
  });

});
