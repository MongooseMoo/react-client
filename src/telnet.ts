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


enum TelnetState {
  DATA,
  COMMAND,
  SUBNEGOTIATION,
  NEGOTIATION,
  GMCP
}

export class TelnetParser extends EventEmitter {
  private state: TelnetState;
  private buffer: Buffer;
  private subBuffer: Buffer;
  private gmcpBuffer: Buffer;

  constructor(stream?: Stream) {
    super();
    this.state = TelnetState.DATA;
    this.buffer = Buffer.alloc(0);
    this.subBuffer = Buffer.alloc(0);
    this.gmcpBuffer = Buffer.alloc(0);
    stream && stream.on('data', (data: Buffer) => this.parse(data));
  }

  public parse(data: Buffer) {
    this.buffer = Buffer.concat([this.buffer, data]);

    while (this.buffer.length > 0) {
      switch (this.state) {
        case TelnetState.DATA:
          this.handleData();
          break;
        case TelnetState.COMMAND:
          this.handleCommand();
          break;
        case TelnetState.SUBNEGOTIATION:
          this.handleSubnegotiation();
          break;
        case TelnetState.NEGOTIATION:
          this.handleNegotiation();
          break;
        case TelnetState.GMCP:
          this.handleGmcp();
          break;
      }
    }
  }

  private handleData() {
    const index = this.buffer.indexOf(TelnetCommand.IAC);
    if (index === -1) {
      this.emit('data', this.buffer);
      this.buffer = Buffer.alloc(0);
      return;
    }

    this.emit('data', this.buffer.slice(0, index));
    this.buffer = this.buffer.slice(index);
    this.state = TelnetState.COMMAND;
  }

  private handleCommand() {
    if (this.buffer.length < 2) {
      return;
    }
    const command = this.buffer[1];
    this.buffer = this.buffer.slice(2);

    switch (command) {
      case TelnetCommand.NOP:
        this.emit('command', TelnetCommand.NOP);
        this.state = TelnetState.DATA;
        break;
      case TelnetCommand.SB:
        this.subBuffer = Buffer.alloc(0);
        this.state = TelnetState.SUBNEGOTIATION;
        break;
      case TelnetCommand.DO:
      case TelnetCommand.DONT:
      case TelnetCommand.WILL:
      case TelnetCommand.WONT:
        this.state = TelnetState.NEGOTIATION;
        break;
      case TelnetCommand.GMCP:
        this.gmcpBuffer = Buffer.alloc(0);
        this.state = TelnetState.GMCP;
        break;
      default:
        this.state = TelnetState.DATA;
        break;
    }
  }

  private handleNegotiation() {
    if (this.buffer.length < 2) {
      return;
    }

    const command = this.buffer[0];
    const option = this.buffer[1];
    this.buffer = this.buffer.slice(2);

    this.emit('negotiation', command, option);
    this.state = TelnetState.DATA;
  }
  private handleSubnegotiation() {
    let index = this.buffer.indexOf(TelnetCommand.SE);
    while (index === -1 && this.buffer.length > 0) {
      this.subBuffer = Buffer.concat([this.subBuffer, this.buffer]);
      this.buffer = Buffer.alloc(0);
      index = this.buffer.indexOf(TelnetCommand.SE);
    }

    if (index === -1) {
      return;
    }

    this.subBuffer = Buffer.concat([this.subBuffer, this.buffer.slice(0, index)]);
    this.buffer = this.buffer.slice(index + 1);
    this.emit('subnegotiation', this.subBuffer);
    this.state = TelnetState.DATA;
  }

  private handleGmcp() {
    let index = this.buffer.indexOf(TelnetCommand.SE);
    while (index === -1 && this.buffer.length > 0) {
      this.gmcpBuffer = Buffer.concat([this.gmcpBuffer, this.buffer]);
      this.buffer = Buffer.alloc(0);
      index = this.buffer.indexOf(TelnetCommand.SE);
    }

    if (index === -1) {
      return;
    }

    this.gmcpBuffer = Buffer.concat([this.gmcpBuffer, this.buffer.slice(0, index)]);
    this.buffer = this.buffer.slice(index + 1);

    const gmcpString = this.gmcpBuffer.toString();
    const [gmcpPackage, dataString] = gmcpString.split(' ');
    const data = JSON.parse(dataString);
    this.emit('gmcp', gmcpPackage, data);
    this.state = TelnetState.DATA;
  }

}
