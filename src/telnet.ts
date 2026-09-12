import { EventEmitter } from "eventemitter3";

export enum TelnetOption {
  BINARY = 0, // Binary Transmission
  ECHO = 1, // Echo
  RCP = 2, // Reconnection
  SUPPRESS_GO_AHEAD = 3, // Suppress Go Ahead
  APPROX_MESSAGE_SIZE_NEGOTIATION = 4, // Approx Message Size Negotiation
  STATUS = 5, // Status
  TIMING_MARK = 6, // Timing Mark
  REMOTE_CONTROLLED_TRANSMISSION_ECHO = 7, // Remote Controlled Transmission and Echo
  OUTPUT_LINE_WIDTH = 8, // Output Line Width
  OUTPUT_PAGE_SIZE = 9, // Output Page Size
  OUTPUT_CARRIAGE_RETURN_DISPOSITION = 10, // Output Carriage-Return Disposition
  OUTPUT_HORIZONTAL_TAB_STOPS = 11, // Output Horizontal Tab Stops
  OUTPUT_HORIZONTAL_TAB_DISPOSITION = 12, // Output Horizontal Tab Disposition
  OUTPUT_FORMFEED_DISPOSITION = 13, // Output Formfeed Disposition
  OUTPUT_VERTICAL_TAB_STOPS = 14, // Output Vertical Tabstops
  OUTPUT_VERTICAL_TAB_DISPOSITION = 15, // Output Vertical Tab Disposition
  OUTPUT_LINEFEED_DISPOSITION = 16, // Output Linefeed Disposition
  EXTENDED_ASCII = 17, // Extended ASCII
  LOGOUT = 18, // Logout
  BYTE_MACRO = 19, // Byte Macro
  DATA_ENTRY_TERMINAL = 20, // Data Entry Terminal
  SUPDUP = 21, // SUPDUP
  SUPDUP_OUTPUT = 22, // SUPDUP Output
  SEND_LOCATION = 23, // Send Location
  TERMINAL_TYPE = 24, // Terminal Type
  END_OF_RECORD = 25, // End of Record
  TACACS_USER_IDENTIFICATION = 26, // TACACS User Identification
  OUTPUT_MARKING = 27, // Output Marking
  TERMINAL_LOCATION_NUMBER = 28, // Terminal Location Number
  TELNET_3270_REGIME = 29, // Telnet 3270 Regime
  X_3_PAD = 30, // X.3 PAD
  NAWS = 31, // Negotiate About Window Size
  TERMINAL_SPEED = 32, // Terminal Speed
  REMOTE_FLOW_CONTROL = 33, // Remote Flow Control
  LINEMODE = 34, // Linemode
  X_DISPLAY_LOCATION = 35, // X Display Location
  ENVIRONMENT_OPTION = 36, // Environment Option
  AUTHENTICATION_OPTION = 37, // Authentication Option
  ENCRYPTION_OPTION = 38, // Encryption Option
  NEW_ENVIRONMENT_OPTION = 39, // New Environment Option
  TN3270E = 40, // TN3270E
  XAUTH = 41, // XAUTH
  CHARSET = 42, // CHARSET
  RSP = 43, // Telnet Remote Serial Port
  COM_PORT_OPTION = 44, // Telnet Com Port Control Option
  SUPPRESS_LOCAL_ECHO = 45, // Telnet Suppress Local Echo
  START_TLS = 46, // Telnet Start TLS
  KERMIT = 47, // Telnet KERMIT
  SEND_URL = 48, // Telnet SEND-URL
  FORWARD_X = 49, // Telnet FORWARD_X

  PRAGMA_LOGON = 138, // Telnet PRAGMA LOGON
  GMCP = 201, // GMCP
}

export enum TelnetCommand {
  EOR = 239, // End of record.
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
  SB = 250, //  Indicates that what follows is subnegotiation of the indicated option.
  WILL = 251, // Indicates the desire to begin performing, or confirmation that you are now performing, the indicated option.
  WONT = 252, // Indicates the refusal to perform, or continue performing, the indicated option.
  DO = 253, //  Indicates the request that the other party perform, or confirmation that you are expecting the other party to perform, the indicated option.
  DONT = 254, //  Indicates the demand that the other party stop performing, or confirmation that you are no longer expecting the other party to perform, the indicated option.
  IAC = 255, //   "interpret as command"
}

export interface Stream {
  on(event: "data", cb: (data: Uint8Array) => void): void;
  on(event: "close", cb: () => void): void;
  write(data: Uint8Array): void;
}

export class WebSocketStream implements Stream {
  private ws: WebSocket;

  constructor(ws: WebSocket) {
    this.ws = ws;
    ws.binaryType = "arraybuffer";
  }

  on(event: "data", cb: (data: Uint8Array) => void): void;
  on(event: "close", cb: () => void): void;
  on(event: string, cb: (...args: any[]) => void): void {
    if (event === "data") {
      this.ws.onmessage = (e) => {
        cb(new Uint8Array(e.data));
      };
      return;
    }

    const funcname = ("on" + event) as keyof WebSocketStream;
    this[funcname] = cb;
  }

  write(data: Uint8Array): void {
    this.ws.send(new Uint8Array(data));
  }
}

enum TelnetState {
  DATA,
  COMMAND,
  SUBNEGOTIATION,
  NEGOTIATION,
}

export class TelnetParser extends EventEmitter {
  private state: TelnetState;
  private buffer: Uint8Array;
  private iacSEBuffer = new Uint8Array([TelnetCommand.IAC, TelnetCommand.SE]);
  private negotiationByte = 0;
  stream: Stream | undefined;

  constructor(stream?: Stream) {
    super();
    this.state = TelnetState.DATA;
    this.buffer = new Uint8Array(0);
    stream && stream.on("data", (data: Uint8Array) => this.parse(data));
    this.stream = stream;
  }

  public parse(data: Uint8Array) {
    this.buffer = concatBytes(this.buffer, data);

    while (this.buffer.length > 0) {
      let done: boolean | undefined;
      switch (this.state) {
        case TelnetState.DATA:
          this.handleData();
          break;
        case TelnetState.COMMAND:
          done = this.handleCommand();
          if (done) {
            return;
          }
          break;
        case TelnetState.SUBNEGOTIATION:
          done = this.handleSubnegotiation();
          if (done) {
            return;
          }
          break;
        case TelnetState.NEGOTIATION:
          done = this.handleNegotiation();
          if (done) {
            return;
          }
          break;
      }
    }
  }

  private handleData() {
    const index = this.buffer.indexOf(TelnetCommand.IAC);
    if (index === -1) {
      this.emit("data", this.buffer);
      this.buffer = new Uint8Array(0);
      return;
    }

    this.emit("data", this.buffer.subarray(0, index));
    this.buffer = this.buffer.subarray(index);
    this.state = TelnetState.COMMAND;
  }

  private handleCommand(): boolean {
    if (this.buffer.length < 2) {
      return true;
    }
    const command = this.buffer[1];
    this.buffer = this.buffer.subarray(2);

    switch (command) {
      case TelnetCommand.NOP:
      case TelnetCommand.GA:
      case TelnetCommand.EOR:
        this.emit("command", command);
        this.state = TelnetState.DATA;
        break;
      case TelnetCommand.SB:
        this.state = TelnetState.SUBNEGOTIATION;
        break;
      case TelnetCommand.DO:
      case TelnetCommand.DONT:
      case TelnetCommand.WILL:
      case TelnetCommand.WONT:
        this.negotiationByte = command;
        this.state = TelnetState.NEGOTIATION;
        break;
      default:
        this.state = TelnetState.DATA;
        break;
    }
    return false;
  }

  private handleNegotiation(): boolean {
    if (this.buffer.length < 1) {
      return true;
    }

    const command = this.negotiationByte;
    const option = this.buffer[0];
    this.buffer = this.buffer.subarray(1);

    this.emit("negotiation", command, option);
    this.state = TelnetState.DATA;
    return false;
  }

  private handleSubnegotiation(): boolean {
    let index = -1;
    for (let i = 0; i + 1 < this.buffer.length; i++) {
      if (this.buffer[i] === TelnetCommand.IAC && this.buffer[i + 1] === TelnetCommand.SE) {
        index = i;
        break;
      }
    }
    if (index === -1) {
      return true;
    }

    this.state = TelnetState.DATA;
    let sb = this.buffer.subarray(0, index);
    if (sb[0] === TelnetOption.GMCP) {
      this.handleGmcp(sb.subarray(1));
    } else {
      this.emit("subnegotiation", sb);
    }
    this.buffer = this.buffer.subarray(index + 2);
    return false;
  }

  private handleGmcp(data: Uint8Array) {
    const gmcpString = new TextDecoder("utf-8", { ignoreBOM: true }).decode(data);
    const [gmcpPackage, dataString] = gmcpString.split(/ +(.+?)$/, 2);
    this.emit("gmcp", gmcpPackage, dataString);
  }

  sendNegotiation(command: TelnetCommand, option: TelnetOption) {
    this.stream!.write(new Uint8Array([TelnetCommand.IAC, command, option]));
  }

  sendGmcp(gmcpPackage: string, data: string) {
    const gmcpString = gmcpPackage + " " + data;
    const gmcpBuffer = new TextEncoder().encode(gmcpString);
    const buffer = concatBytes(
      new Uint8Array([TelnetCommand.IAC, TelnetCommand.SB]),
      new Uint8Array([TelnetOption.GMCP]),
      gmcpBuffer,
      this.iacSEBuffer,
    );
    this.stream!.write(buffer);
  }

  sendTerminalType(terminalType: string) {
    const gmcpBuffer = new TextEncoder().encode(terminalType);
    const buffer = concatBytes(
      new Uint8Array([TelnetCommand.IAC, TelnetCommand.SB]),
      new Uint8Array([TelnetOption.TERMINAL_TYPE, TelnetOption.BINARY]),
      gmcpBuffer,
      this.iacSEBuffer,
    );
    this.stream!.write(buffer);
  }
}

function concatBytes(...parts: Uint8Array[]): Uint8Array<ArrayBuffer> {
  const result = new Uint8Array(parts.reduce((size, part) => size + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }
  return result;
}
