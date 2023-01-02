import { TelnetCommand, TelnetParser, Stream } from './telnet';
// Tests for the Telnet    class
// using react testrunner / testing infrastructure


// Mock Stream

class MockStream implements Stream {
    public data: Buffer[] = [];
    public on(event: string, callback: (data: Buffer) => void) {
        // Do nothing
    }
    public write(data: Buffer) {
        this.data.push(data);
    }
}

describe('Telnet', () => {

    it('should be a class', () => {
        expect(TelnetParser).toBeInstanceOf(Function);
    });

    it('should be constructable', () => {
        expect(new TelnetParser(new MockStream())).toBeInstanceOf(TelnetParser);
    });

    // actual important tests:

    // Does it pass data?

    it('should pass data', (done) => {
        const stream = new MockStream();
        const telnet = new TelnetParser(stream);
        const data = Buffer.from('Hello world');
        telnet.on('data', (buffer) => {
            expect(buffer).toEqual(data);
            done();
        });
        stream.write(data);
    });

    // Does it pass commands?

    it('should pass commands', (done) => {
        const stream = new MockStream();
        const telnet = new TelnetParser(stream);
        // const data = Buffer.from([255, 241, 1, 2, 3, 255]);
        const data = Buffer.from([TelnetCommand.IAC, TelnetCommand.NOP, 1, 2, 3, TelnetCommand.IAC]);
        telnet.on('command', (command, options) => {
            expect(command).toEqual(1);
            expect(options).toEqual([2, 3]);
            done();
        });
        stream.write(data);
    });


    // Does it pass subnegotiations?

    it('should pass subnegotiations', (done) => {
        const stream = new MockStream();
        const telnet = new TelnetParser(stream);
        const data = Buffer.from([TelnetCommand.IAC, TelnetCommand.SB, 1, 2, 3, TelnetCommand.IAC, TelnetCommand.SE]);
        telnet.on('subnegotiation', (option, suboptions) => {
            expect(option).toEqual(1);
            expect(suboptions).toEqual([2, 3]);
            done();
        });
        stream.write(data);
    });

    // Does it pass negotiations?

    it('should pass negotiations', (done) => {
        const stream = new MockStream();
        const telnet = new TelnetParser(stream);
        const data = Buffer.from([TelnetCommand.IAC, TelnetCommand.DO, 1]);
        telnet.on('negotiation', (type, option) => {
            expect(type).toEqual('DO');
            expect(option).toEqual(1);
            done();
        });
        stream.write(data);
    });


    // Does it pass GMCP?

    it('should pass GMCP', (done) => {
        const stream = new MockStream();
        const telnet = new TelnetParser(stream);
        const gmcpPackage = "Test.Gmcp";
        const toSend = { 1: [2, 3] };
        const gmcpData = Buffer.from(gmcpPackage + " " + JSON.stringify(toSend));
        const encoded = Buffer.concat([
            Buffer.from([TelnetCommand.IAC, TelnetCommand.SB, TelnetCommand.GMCP]),
            gmcpData,
            Buffer.from([TelnetCommand.IAC, TelnetCommand.SE]),
        ]);
        telnet.on('gmcp', (pkg, data) => {
            expect(data).toEqual({ 1: [2, 3] });
            expect(pkg).toEqual(gmcpPackage);
            done();
        });
        stream.write(encoded);
    });


});  // Tests for the TelnetParser class     