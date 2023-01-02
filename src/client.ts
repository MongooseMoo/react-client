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
    SE = 240
}
class MudClient extends EventEmitter {
    private ws!: WebSocket;
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


    private handleData(data: string | ArrayBuffer) {
        if (data instanceof ArrayBuffer) {
            const decoder = new TextDecoder();
            const dataString = decoder.decode(data);

            if (this.telnetNegotiation) {
                this.telnetBuffer += dataString;
                if (this.telnetBuffer.endsWith('\xFF\xF0')) {
                    // Telnet negotiation complete
                    this.telnetNegotiation = false;
                    // handle Telnet negotiation
                    const commands = this.telnetBuffer.split('\xFF');
                    commands.forEach(command => {
                        if (command.length === 0) {
                            return;
                        }

                        const commandCode = command.charCodeAt(0);
                        switch (commandCode) {
                            case TELNET_COMMANDS.WILL: {
                                const optionCode = command.charCodeAt(1);
                                this.send(`\xFF\xFB${optionCode}`); // DO
                                break;
                            }
                            case TELNET_COMMANDS.WONT: {
                                const optionCode = command.charCodeAt(1);
                                this.send(`\xFF\xFC${optionCode}`); // DON'T
                                break;
                            }
                            case 253: { // DO
                                const optionCode = command.charCodeAt(1);
                                this.send(`\xFF\xFD${optionCode}`); // WILL
                                break;
                            }
                            case 254: { // DON'T
                                const optionCode = command.charCodeAt(1);
                                this.send(`\xFF\xFE${optionCode}`); // WON'T
                                break;
                            }
                        }
                    });
                    this.telnetBuffer = '';
                }
            } else if (dataString.startsWith('\xFF\xFA\xC9') && dataString.endsWith('\xFF\xF0')) {
                // GMCP data
                const gmcpData = dataString.substring(3, dataString.length - 2);
                // packagename space data
                const spaceIndex = gmcpData.indexOf(' ');
                const gmcpPackage = gmcpData.substring(0, spaceIndex);
                // the last period separates the package name from the message type
                const lastPeriodIndex = gmcpPackage.lastIndexOf('.');
                const [packageName, messageType] = [gmcpPackage.substring(0, lastPeriodIndex), gmcpPackage.substring(lastPeriodIndex + 1)];
                const gmcpMessage = gmcpData.substring(spaceIndex + 1);

                const handler = this.gmcpHandlers[packageName];

                const messageHandler = handler && (handler as any)['handle' + messageType];
                if (handler) {
                    messageHandler && messageHandler.call(handler, JSON.parse(gmcpMessage));
                }
            }
            else if (dataString.startsWith('\xFF')) {
                // Telnet negotiation
                this.telnetNegotiation = true;
                this.telnetBuffer = dataString;
            } else {
                const sanitizedHtml = dataString.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                this.emit('message', sanitizedHtml);
            }
        }
    }
}
export default MudClient;
