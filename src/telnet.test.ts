import { describe, expect, it } from 'vitest';
import { Stream, TelnetCommand, TelnetOption, TelnetParser } from './telnet';

// Mock Stream

class MockStream implements Stream {
  public data: Buffer[] = [];
  public callback!: (data: Buffer) => void;

  public on(event: string, callback: (data: Buffer) => void) {
    this.callback = callback;
  }

  public emit(event: string, data: Buffer) {
    this.callback(data);
  }

  public write(data: Buffer) {
    this.data.push(data);
    this.emit('data', data);
  }
}

const createTestSubject = () => {
  const stream = new MockStream();
  const telnet = new TelnetParser(stream);
  return { stream, telnet };
};

const testEvent = async (eventName: string, data: Buffer, expected: any[]) => {
  const { telnet } = createTestSubject();
  const promise = new Promise<void>((resolve) => {
    telnet.on(eventName, (...args) => {
      expect(args.length).toEqual(expected.length); // Ensure same number of arguments
      for (let i = 0; i < args.length; i++) {
        const receivedArg = args[i];
        const expectedArg = expected[i];

        // console.log(`Comparing arg ${i}:`); // Optional Debugging
        // console.log('Expected:', expectedArg); // Optional Debugging
        // console.log('Received:', receivedArg); // Optional Debugging
        // console.log('Received type:', typeof receivedArg); // Optional Debugging
        // if (receivedArg) console.log('Received instanceof Buffer:', receivedArg instanceof Buffer); // Optional Debugging
        // if (receivedArg) console.log('Received instanceof Uint8Array:', receivedArg instanceof Uint8Array); // Optional Debugging


        if (expectedArg instanceof Uint8Array) {
          // If expecting a Uint8Array, *always* try to convert the received argument
          // to a Uint8Array before comparison. The Uint8Array constructor can often
          // handle Buffer-like objects, including the serialized { type: 'Buffer', data: [...] }.
          try {
            let uint8ArrayToCompare: Uint8Array;
            // Prioritize using .data if it looks like the serialized object
            if (receivedArg && typeof receivedArg === 'object' && receivedArg.type === 'Buffer' && Array.isArray(receivedArg.data)) {
              uint8ArrayToCompare = new Uint8Array(receivedArg.data);
            } else {
              // Otherwise, attempt direct conversion (might work for actual Buffers/Uint8Arrays)
              uint8ArrayToCompare = new Uint8Array(receivedArg);
            }
            expect(uint8ArrayToCompare).toEqual(expectedArg);
          } catch (e) {
            // If conversion fails, fall back to direct comparison to get the original Vitest error diff.
            console.error("Uint8Array conversion failed for received argument, falling back to direct comparison:", receivedArg, e);
            expect(receivedArg).toEqual(expectedArg);
          }
        } else {
          // Handle non-Uint8Array expected types (e.g., numbers for commands)
          expect(receivedArg).toEqual(expectedArg);
        }
      }
      resolve();
    });
  });
  telnet.parse(data);
  await promise;
};

describe('Telnet', () => {
  it('should pass data', async () => {
    await testEvent('data', Buffer.from('Hello world'), [new Uint8Array(Buffer.from('Hello world'))]);
  });

  it('should pass commands', async () => {
    await testEvent(
      'command',
      Buffer.from([TelnetCommand.IAC, TelnetCommand.NOP]),
      [TelnetCommand.NOP]
    );
  });

  it('should pass subnegotiations', async () => {
    await testEvent(
      'subnegotiation',
      Buffer.from([TelnetCommand.IAC, TelnetCommand.SB, 1, 2, 3, TelnetCommand.IAC, TelnetCommand.SE]),
      [new Uint8Array([1, 2, 3])]
    );
  });

  it('should handle incomplete subnegotiations', async () => {
    const { telnet } = createTestSubject();
    const subnegotiations: Buffer[] = [];
    telnet.on('subnegotiation', (subnegotiation) => {
      subnegotiations.push(subnegotiation);
    });

    // Send the start of a Telnet subnegotiation in the first buffer
    telnet.parse(Buffer.from([TelnetCommand.IAC, TelnetCommand.SB, 1, 2, 3]));
    // Ensure that no 'subnegotiation' event has been emitted yet
    expect(subnegotiations).toEqual([]);

    // Send the end of the Telnet subnegotiation in the second buffer
    telnet.parse(Buffer.from([TelnetCommand.IAC, TelnetCommand.SE]));
    // The 'subnegotiation' event should be emitted with the complete subnegotiation data
    // Compare contents after converting received Buffer (subnegotiations[0]) to Uint8Array
    expect(subnegotiations.length).toBe(1);
    expect(new Uint8Array(subnegotiations[0])).toEqual(new Uint8Array([1, 2, 3]));
  });

  it('should pass negotiations', async () => {
    await testEvent(
      'negotiation',
      Buffer.from([TelnetCommand.IAC, TelnetCommand.DO, 1]),
      [TelnetCommand.DO, 1]
    );
  });
  it('should pass GMCP', async () => {
    const gmcpPackage = 'Test.Gmcp';
    const toSend = { 1: [2, 3] };
    const toSendJSON = JSON.stringify(toSend);
    const gmcpData = Buffer.from(gmcpPackage + ' ' + toSendJSON);
    const encoded = Buffer.concat([
      Buffer.from([TelnetCommand.IAC, TelnetCommand.SB, TelnetOption.GMCP]),
      gmcpData,
      Buffer.from([TelnetCommand.IAC, TelnetCommand.SE]),
    ]);
    await testEvent('gmcp', encoded, [gmcpPackage, toSendJSON]);
  });

  it('should handle multiple commands', async () => {
    const { telnet } = createTestSubject();
    const commands: number[] = [];
    telnet.on('command', (command) => {
      commands.push(command);
    });
    telnet.parse(Buffer.from([TelnetCommand.IAC, TelnetCommand.NOP, TelnetCommand.IAC, TelnetCommand.NOP]));
    expect(commands).toEqual([TelnetCommand.NOP, TelnetCommand.NOP]);
  });

  it('should handle commands split across multiple buffers', async () => {
    const { telnet } = createTestSubject();
    const commands: number[] = [];
    telnet.on('command', (command) => {
      commands.push(command);
    });

    // Send the start of a Telnet NOP command in the first buffer
    telnet.parse(Buffer.from([TelnetCommand.IAC]));
    // Send the end of the Telnet NOP command in the second buffer
    telnet.parse(Buffer.from([TelnetCommand.NOP]));

    // The 'command' event should be emitted with TelnetCommand.NOP as the argument
    expect(commands).toEqual([TelnetCommand.NOP]);
  });

});
