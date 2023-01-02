import { EventEmitter } from 'eventemitter3';
import { GMCPPackage } from './gmcp';

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
        this.ws = new window.WebSocket(`ws://${this.host}:${this.port}`, "binary");

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
        if (typeof data === 'string') {
            if (this.telnetNegotiation) {
                this.telnetBuffer += data;
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
                            case 251: { // WILL
                                const optionCode = command.charCodeAt(1);
                                this.send(`\xFF\xFB${optionCode}`); // DO
                                break;
                            }
                            case 252: { // WON'T
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
            } else if (data.startsWith('\xFF\xFA\xC9') && data.endsWith('\xFF\xF0')) {
                // GMCP data
                const gmcpData = data.substring(3, data.length - 2);
                // packagename space data
                const spaceIndex = gmcpData.indexOf(' ');
                const gmcpPackage = gmcpData.substring(0, spaceIndex);
                // the last period separates the package name from the message type
                const lastPeriodIndex = gmcpPackage.lastIndexOf('.');
                const [packageName, messageType] = [gmcpPackage.substring(0, lastPeriodIndex), gmcpPackage.substring(lastPeriodIndex + 1)];
                const gmcpMessage = gmcpData.substring(spaceIndex + 1);

                const handler = this.gmcpHandlers[packageName];
                const messageHandler = handler['handle' + messageType];
                if (handler) {
                    messageHandler && messageHandler.call(handler, JSON.parse(gmcpMessage));
                }
            }
            else if (data.startsWith('\xFF')) {
                // Telnet negotiation
                this.telnetNegotiation = true;
                this.telnetBuffer = data;
            } else {
                this.emit('message', data);
            }
        }
    }
}
export default MudClient;
