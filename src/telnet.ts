import { EventEmitter } from 'eventemitter3';

export enum TelnetCommand {
  GMCP = 201, // GMCP
  SE = 240, //  End of subnegotiation parameters.
  NOP = 241, //   No operation.
  DM = 242, //  Data mark. The data stream portion of a Synch.
  BRK = 243, // Break.
  IP = 244, // Suspend, interrupt or abort the process to which the NVT is connected.
  AO = 245, //  Abort output. Allows the current process to run to completion but do not send its output to the user.
  AYT = 246, // Are you there?
  EC = 247, // Erase the current Character.
  EL = 248, //  Erase the current line
  GA = 249, //  Go ahead.
  SB = 250,   //  Indicates that what follows is subnegotiation of the indicated option.
  WILL = 251, // Indicates the desire to begin performing, or confirmation that you are now performing, the indicated option.
  WONT = 252, // Indicates the refusal to perform, or continue performing, the indicated option.
  DO = 253, //  Indicates the request that the other party perform, or confirmation that you are expecting the other party to perform, the indicated option.
  DONT = 254, //  Indicates the demand that the other party stop performing, or confirmation that you are no longer expecting the other party to perform, the indicated option.
  IAC = 255, //   "interpret as command"
}

export interface Stream {
  on(event: 'data', cb: (data: Buffer) => void): void;
  on(event: 'close', cb: () => void): void;
  write(data: Buffer): void;
}

export class TelnetParser extends EventEmitter {
  private stream: Stream;

  constructor(stream: Stream) {
    super();
    this.stream = stream;
    this.stream.on('data', (data: Buffer) => this.parse(data));
    this.stream.on('close', () => this.emit('close'));
  }

  sendGMCP(data: string) {
    const buffer = Buffer.alloc(6 + data.length);
    buffer[0] = TelnetCommand.IAC;
    buffer[1] = TelnetCommand.SB;
    buffer[2] = TelnetCommand.GMCP;
    buffer[3] = 1;
    buffer.write(data, 4);
    buffer[buffer.length - 2] = TelnetCommand.IAC;
    buffer[buffer.length - 1] = TelnetCommand.SE;
    this.stream.write(buffer);
  }

  parse(data: Buffer) {
    let i = 0;
    while (i < data.length) {
      if (data[i] === 241) {
        // Command found
        const command = data[i + 1];
        const options = [];
        i += 2;
        while (i < data.length && data[i] !== TelnetCommand.IAC && data[i + 1] !== 2) {
          options.push(data[i]);
          i++;
        }
        this.emit('command', command, options);
      } else if (data[i] === 250) {
        // Subnegotiation found
        const option = data[i + 1];
        const suboptions = data.slice(i + 2, data.indexOf(TelnetCommand.IAC, i));
        if (option === TelnetCommand.GMCP) {
          // GMCP message found
          const gmcp = this.parseGMCP(suboptions);
          this.emit('gmcp', gmcp.module, gmcp.data);
        }
        this.emit('subnegotiation', option, suboptions);
        i = data.indexOf(255, i);
      } else if (data[i] === 242 || data[i] === 243 || data[i] === 244) {
        // Negotiation found
        let type: 'DO' | 'DONT' | 'WILL' | 'WONT';
        switch (data[i]) {
          case 242:
            type = 'DO';
            break;
          case 243:
            type = 'DONT';
            break;
          case 244:
            type = 'WILL';
            break;
          case 245:
            type = 'WONT';
            break;
          default:
            throw new Error('Invalid negotiation type');
        }
        const option = data[i + 1];
        this.emit('negotiation', type, option);
        i += 2;
      } else {
        i++;
      }
    }
  }

  parseGMCP(data: Buffer): any {
    const message = data.toString();
    const [module, json] = message.split(' ');
    return { module, data: JSON.parse(json) };
  }

  sendCommand(command: number, options: number[]) {
    // Construct and send a Telnet command
  }

  sendNegotiation(type: 'DO' | 'DONT' | 'WILL' | 'WONT', option: number) {
    // Construct and send a Telnet negotiation
  }

  send(data: Buffer) {
    this.stream.write(data);
  }
}

export class WebSocketStream implements Stream {
  private ws: WebSocket;

  constructor(ws: WebSocket) {
    this.ws = ws;
  }

  on(event: 'data', cb: (data: Buffer) => void): void;
  on(event: 'close', cb: () => void): void;
  on(event: string, cbg: (...args: any[]) => void): void {
    const funcname = 'on' + event as keyof WebSocketStream;
    this[funcname] = cbg;

  }

  write(data: Buffer): void {
    this.ws.send(data);
  }
}