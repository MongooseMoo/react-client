import { EventEmitter } from 'eventemitter3';
import { GMCPPackage } from './gmcp';

export enum TELNET_OPTIONS {
    ECHO = 1,
    SUPPRESS_GO_AHEAD = 3,
    STATUS = 5,
    TIMING_MARK = 6,
    TERMINAL_TYPE = 24,
    NAWS = 31,
    CHARSET = 42,
    GMCP = 201
}

export enum TELNET_COMMANDS {
    WILL = 251,
    WONT = 252,
    DO = 253,
    DONT = 254,
    SB = 250,
    SE = 240,
    IAC = 255,
}
class MudClient extends EventEmitter {
    private ws!: WebSocket;
    private decoder = new TextDecoder();
    private host: string;
    private port: number;
    private telnetNegotiation: boolean = false;
    private telnetBuffer: string = '';
    private gmcpHandlers: { [key: string]: GMCPPackage } = {};

    constructor(host: string, port: number) {
        super();
        this.host = host;
        this.port = port;
    }

    registerGMCPPackage(p: typeof GMCPPackage) {
        const gmcpPackage = new p(this);
        this.gmcpHandlers[gmcpPackage.packageName] = gmcpPackage;
    }



    public connect() {
        this.ws = new window.WebSocket(`ws://${this.host}:${this.port}`);
        this.ws.binaryType = 'arraybuffer';
        this.ws.onopen = () => {
            this.emit('connect');
        };

        this.ws.onmessage = (event: MessageEvent) => {
            this.handleData(event.data);
        };

        this.ws.onclose = () => {
            this.emit('disconnect');
        };

        this.ws.onerror = (error: Event) => {
            this.emit('error', error);
        };
    }

    public send(data: string) {
        this.ws.send(data);
    }

    public sendGmcp(gmcpModule: string, message: any) {
        const gmcpData = JSON.stringify({ [gmcpModule]: message });
        this.send(`\xFF\xFA\xC9${gmcpData.length}\xFF\xF0${gmcpData}`);
    }

    public close() {
        this.ws.close();
    }

    public sendCommand(command: string) {
        this.send(command + '\r\n');
    }

    private handleData(data: ArrayBuffer) {
        const dataString = this.decoder.decode(data);

        if (this.telnetNegotiation) {
            this.telnetBuffer += dataString;
            this.handleTelnetNegotiation();
        } else if (this.isGmcpData(dataString)) {
            this.handleGmcpData(dataString);
        } else if (this.isTelnetNegotiation(dataString)) {
            this.telnetBuffer += dataString;
            this.handleTelnetNegotiation();
        } else {
            this.emitMessage(dataString);
        }
    }

    private handleTelnetNegotiation() {
        // Check if the telnet buffer contains a complete negotiation sequence
        const index = this.telnetBuffer.indexOf('\xFF\xF0');
        if (index >= 0) {
            const dataString = this.telnetBuffer.substring(0, index);
            this.telnetBuffer = this.telnetBuffer.substring(index + 2);
            this.telnetNegotiation = false;
            this.processTelnetCommands(dataString);
        }
    }

    private processTelnetCommands(dataString: string) {
        console.log("Telnet Commands:", dataString);

        let pos = 0;
        while (pos < dataString.length) {
            if (dataString[pos] !== '\xFF') {
                console.log("Unexpected data in telnet buffer:", dataString.substring(pos));
                break;
            }

            // Parse the next telnet command
            const commandCode = dataString.charCodeAt(pos + 1);
            const optionCode = dataString.charCodeAt(pos + 2);

            switch (commandCode) {
                case TELNET_COMMANDS.WILL:
                    console.log("Received WILL", optionCode);
                    this.send(`\xFF\xFB${optionCode}`); // DO
                    break;
                case TELNET_COMMANDS.WONT:
                    this.send(`\xFF\xFC${optionCode}`); // DON'T
                    break;
                case TELNET_COMMANDS.DO: {
                    this.send(`\xFF\xFD${optionCode}`); // WILL
                    break;
                }
                case TELNET_COMMANDS.DONT: {
                    this.send(`\xFF\xFE${optionCode}`); // WON'T
                    break;
                }
                case TELNET_COMMANDS.IAC: {
                    // IAC command escape
                    console.log("Received IAC command escape");
                    pos += 1;
                    break;
                }
                case TELNET_COMMANDS.SB: {
                    // Start of subnegotiation
                    console.log("Received start of subnegotiation");
                    this.telnetNegotiation = true;
                    break;
                }
                case TELNET_COMMANDS.SE: {
                    // End of subnegotiation
                    console.log("Received end of subnegotiation");
                    break;
                }
                default: {
                    console.log("Unrecognized telnet command:", commandCode);
                    break;
                }
            }

            pos += 3;
        }
    }

    private handleGmcpData(dataString: string) {
        const gmcpData = dataString.substring(3, dataString.length - 2);
        const spaceIndex = gmcpData.indexOf(' ');
        const gmcpPackage = gmcpData.substring(0, spaceIndex);
        const lastPeriodIndex = gmcpPackage.lastIndexOf('.');
        const [packageName, messageType] = [gmcpPackage.substring(0, lastPeriodIndex), gmcpPackage.substring(lastPeriodIndex + 1)];
        const gmcpMessage = gmcpData.substring(spaceIndex + 1);
        console.log("GMCP Message:", packageName, messageType, gmcpMessage);
        const handler = this.gmcpHandlers[packageName];
        const messageHandler = handler && (handler as any)['handle' + messageType];
        if (handler) {
            messageHandler && messageHandler.call(handler, JSON.parse(gmcpMessage));
        }
    }

    private emitMessage(dataString: string) {
        const sanitizedHtml = dataString.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br />');
        this.emit('message', sanitizedHtml);
    }

    private isGmcpData(dataString: string) {
        return dataString.startsWith('\xFF\xFA\xC9') && dataString.endsWith('\xFF\xF0');
    }

    private isTelnetNegotiation(dataString: string) {
        return dataString.startsWith('\xFF');
    }

}
export default MudClient;
