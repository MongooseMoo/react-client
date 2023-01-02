import { TelnetCommand, TelnetParser, Stream } from './telnet';

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
    console.log('data', data);
    telnet.parse(data);
    await promise;
};

describe('Telnet', () => {
    it('should pass data', async () => {
        await testEvent('data', Buffer.from('Hello world'), [Buffer.from('Hello world')]);
    }, 1000);

    it('should pass commands', async () => {
        await testEvent(
            'command',
            Buffer.from([TelnetCommand.IAC, TelnetCommand.NOP]),
            [TelnetCommand.NOP]
        );
    }, 1000);

    it('should pass subnegotiations', async () => {
        await testEvent(
            'subnegotiation',
            Buffer.from([TelnetCommand.IAC, TelnetCommand.SB, 1, 2, 3, TelnetCommand.IAC, TelnetCommand.SE]),
            [1, 2, 3]
        );
    }, 1000);

    it('should pass negotiations', async () => {
        await testEvent(
            'negotiation',
            Buffer.from([TelnetCommand.IAC, TelnetCommand.DO, 1]),
            ['DO', 1]
        );
    });
    it('should pass GMCP', async () => {
        const gmcpPackage = 'Test.Gmcp';
        const toSend = { 1: [2, 3] };
        const gmcpData = Buffer.from(gmcpPackage + ' ' + JSON.stringify(toSend));
        const encoded = Buffer.concat([
            Buffer.from([TelnetCommand.IAC, TelnetCommand.SB, TelnetCommand.GMCP]),
            gmcpData,
            Buffer.from([TelnetCommand.IAC, TelnetCommand.SE]),
        ]);
        await testEvent('gmcp', encoded, [gmcpPackage, { 1: [2, 3] }]);
    }, 1000);

    it('should handle multiple commands', async () => {
        const { telnet } = createTestSubject();
        const commands: number[] = [];
        telnet.on('command', (command) => {
            commands.push(command);
        });
        telnet.parse(Buffer.from([TelnetCommand.IAC, TelnetCommand.NOP, TelnetCommand.IAC, TelnetCommand.DO]));
        expect(commands).toEqual([TelnetCommand.NOP, TelnetCommand.DO]);
    }, 1000);

});