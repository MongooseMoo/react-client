import { TelnetParser, WebSocketStream } from './telnet';
import { EventEmitter } from 'eventemitter3';
import { GMCPPackage } from './gmcp';

class MudClient extends EventEmitter {
    private ws!: WebSocket;
    private decoder = new TextDecoder('utf8');
    private telnet!: TelnetParser;

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
        this.telnet = new TelnetParser(new WebSocketStream(this.ws));
        this.ws.onopen = () => {
            this.emit('connect');
        };

        this.telnet.on('data', (data) => {
            this.handleData(data);
        });

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

    public close() {
        this.ws.close();
    }

    public sendCommand(command: string) {
        this.send(command + '\r\n');
    }

    private handleData(data: ArrayBuffer) {
        // convert data to something telnet can handle
        this.emitMessage(this.decoder.decode(data));

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
