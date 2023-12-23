import { it, describe, expect } from 'vitest';
import { TelnetCommand, TelnetOption, TelnetParser, Stream } from './telnet';

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

const testEvent = async (eventName: string, data: Buffer, expected: any) => {
    const { telnet } = createTestSubject();
    const promise = new Promise<void>((resolve) => {
        telnet.on(eventName, (...args) => {
            expect(args).toEqual(expected);
            resolve();
        });
    });
    telnet.parse(data);
    await promise;
};

describe('Telnet', () => {
    it('should pass data', async () => {
        await testEvent('data', Buffer.from('Hello world'), [Buffer.from('Hello world')]);
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
            [Buffer.from([1, 2, 3])]
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
        expect(subnegotiations).toEqual([Buffer.from([1, 2, 3])]);
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