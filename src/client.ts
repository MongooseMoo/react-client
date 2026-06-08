import { type Stream, TelnetCommand, TelnetOption, TelnetParser, WebSocketStream } from './telnet';

import { Buffer } from 'buffer';
import { EventEmitter } from 'eventemitter3';
import stripAnsi from 'strip-ansi';
import { EditorManager } from './EditorManager';
import { GMCPChar, GMCPClientFileTransfer } from './gmcp';
import {
  encodeGmcpPayload,
  parseGmcpMessageAddress,
  parseGmcpPayload,
  resolveGmcpMessageHandler,
} from './gmcp/codec';
import type { GMCPPackage } from './gmcp/package';
import type { GMCPHandlerMap, KnownGMCPPackageMap, KnownGMCPPackageName } from './gmcp/types';
import { type MCPPackage, type McpPackageContext, McpSession } from './mcp';

import { MediaService } from './audio/MediaService';
import { AutoreadMode, usePreferences } from './stores/preferencesStore';
import { WebRTCService } from './WebRTCService';
import FileTransferManager from './FileTransferManager.js';
import { useRoomStore } from './stores/roomStore';
import { useSpatialStore } from './stores/spatialStore';

function resetMidiIntentionalDisconnectFlags(): void {
  if (!usePreferences.getState().midi.enabled) return;

  import('./MidiService')
    .then(({ midiService }) => {
      midiService.resetIntentionalDisconnectFlags();
    })
    .catch((error) => {
      console.error('Failed to reset MIDI disconnect flags:', error);
    });
}

class MudClient extends EventEmitter {
  private ws!: WebSocket;
  private decoder = new TextDecoder('utf8');
  private telnet!: TelnetParser;
  private _connected: boolean = false;
  private _gmcpReady: boolean = false;
  private _sessionReady: boolean = false;
  private intentionalDisconnect: boolean = false;
  private localMode: boolean = false;
  private localStream?: Stream;

  get connected(): boolean {
    return this._connected;
  }

  get gmcpReady(): boolean {
    return this._gmcpReady;
  }

  get sessionReady(): boolean {
    return this._sessionReady;
  }

  private host: string;
  private port: number;
  private telnetBuffer: string = '';
  public gmcpHandlers: GMCPHandlerMap = {};
  public readonly mcpSession: McpSession;
  public gmcp_char: GMCPChar;
  public gmcp_fileTransfer: GMCPClientFileTransfer;
  public media: MediaService;
  public editors: EditorManager;
  public webRTCService: WebRTCService;
  public fileTransferManager: FileTransferManager;
  private _autosay: boolean = false;
  private connectionCleanupComplete: boolean = true;
  private shutdownComplete: boolean = false;

  get autosay(): boolean {
    return this._autosay;
  }

  set autosay(value: boolean) {
    this._autosay = value;
    this.emit('autosayChanged', value);
  }

  constructor(host: string, port: number) {
    super();
    this.host = host;
    this.port = port;
    this.mcpSession = new McpSession({
      emit: (event, ...args) => this.emit(event, ...args),
      openEditorSession: (session) => this.editors.openEditorWindow(session),
      sendLine: (line) => this.send(`${line}\r\n`),
    });
    this.gmcp_char = this.registerGMCPPackage(GMCPChar);
    this.gmcp_fileTransfer = this.registerGMCPPackage(GMCPClientFileTransfer);
    this.media = new MediaService();
    this.editors = new EditorManager(this);
    this.webRTCService = new WebRTCService();
    this.fileTransferManager = new FileTransferManager(this.webRTCService, this.gmcp_fileTransfer);
  }

  registerGMCPPackage<P extends GMCPPackage>(p: new (_: MudClient) => P): P {
    const gmcpPackage = new p(this);
    this.gmcpHandlers[gmcpPackage.packageName] = gmcpPackage;
    console.log('Registered GMCP Package:', gmcpPackage.packageName);
    return gmcpPackage;
  }

  requireGMCPPackage<K extends KnownGMCPPackageName>(packageName: K): KnownGMCPPackageMap[K] {
    const gmcpPackage = this.gmcpHandlers[packageName] as KnownGMCPPackageMap[K] | undefined;
    if (!gmcpPackage) {
      throw new Error(`Required GMCP package is not registered: ${packageName}`);
    }
    return gmcpPackage;
  }

  registerMcpPackage<P extends MCPPackage>(p: new (_: McpPackageContext) => P): P {
    return this.mcpSession.registerPackage(p);
  }

  public connect() {
    this.intentionalDisconnect = false;
    this.connectionCleanupComplete = false;
    this._gmcpReady = false;
    this._sessionReady = false;
    this.ws = new window.WebSocket(`wss://${this.host}:${this.port}`);
    this.ws.binaryType = 'arraybuffer';
    this.telnet = new TelnetParser(new WebSocketStream(this.ws));
    this.ws.onopen = () => {
      this._connected = true;

      // Reset MIDI intentional disconnect flags when successfully reconnecting to server
      resetMidiIntentionalDisconnectFlags();

      this.emit('connect');
      this.emit('connectionChange', true);
    };

    this.telnet.on('data', (data: ArrayBuffer) => {
      this.handleData(data);
    });

    this.telnet.on('negotiation', (command, option) => {
      // Negotiation that we support GMCP
      if (command === TelnetCommand.WILL && option === TelnetOption.GMCP) {
        console.log('GMCP Negotiation');
        this.telnet.sendNegotiation(TelnetCommand.DO, TelnetOption.GMCP);
        this.requireGMCPPackage('Core').sendHello();
        this.requireGMCPPackage('Core.Supports').sendSet();
        this.requireGMCPPackage('Auth.Autologin').sendLogin();
        // Advertise MCMP effect support so the server only sends what we can render.
        this.requireGMCPPackage('Client.Media').sendEffectsSupport();
        this.markGmcpReady();
      } else if (command === TelnetCommand.DO && option === TelnetOption.TERMINAL_TYPE) {
        console.log('TTYPE Negotiation');
        this.telnet.sendNegotiation(TelnetCommand.WILL, TelnetOption.TERMINAL_TYPE);
        this.telnet.sendTerminalType('Mongoose Client');
        this.telnet.sendTerminalType('ANSI');
        this.telnet.sendTerminalType('PROXY');
      }
    });

    this.telnet.on('gmcp', (packageName, data) => {
      console.log('GMCP Package:', packageName, data);
      try {
        this.handleGmcpData(packageName, data);
      } catch (e) {
        console.error('Calling GMCP:', e);
      }
    });

    this.ws.onclose = () => {
      this.cleanupConnection();
      // Only auto reconnect if it wasn't an intentional disconnect
      if (!this.intentionalDisconnect) {
        setTimeout(() => {
          this.connect();
        }, 10000);
      }
    };

    this.ws.onerror = (error: Event) => {
      this.emit('error', error);
    };
  }

  /**
   * Connect using a local Stream (e.g. WorkerStream for WASM mode).
   * Sets up the telnet parser with the provided stream instead of
   * creating a WebSocket.
   */
  public connectLocal(stream: Stream) {
    this.localMode = true;
    this.localStream = stream;
    this.intentionalDisconnect = false;
    this.connectionCleanupComplete = false;
    this._gmcpReady = false;
    this._sessionReady = false;
    this.telnet = new TelnetParser(stream);

    this.telnet.on('data', (data: ArrayBuffer) => {
      this.handleData(data);
    });

    // The WASM server does not send telnet negotiation (no IAC sequences),
    // so these handlers are unlikely to fire — but wire them up anyway
    // for correctness.
    this.telnet.on('negotiation', (command, option) => {
      if (command === TelnetCommand.WILL && option === TelnetOption.GMCP) {
        console.log('GMCP Negotiation (local)');
        this.telnet.sendNegotiation(TelnetCommand.DO, TelnetOption.GMCP);
        this.requireGMCPPackage('Core').sendHello();
        this.requireGMCPPackage('Core.Supports').sendSet();
        this.requireGMCPPackage('Auth.Autologin').sendLogin();
        // Advertise MCMP effect support so the server only sends what we can render.
        this.requireGMCPPackage('Client.Media').sendEffectsSupport();
        this.markGmcpReady();
      } else if (command === TelnetCommand.DO && option === TelnetOption.TERMINAL_TYPE) {
        console.log('TTYPE Negotiation (local)');
        this.telnet.sendNegotiation(TelnetCommand.WILL, TelnetOption.TERMINAL_TYPE);
        this.telnet.sendTerminalType('Mongoose Client');
        this.telnet.sendTerminalType('ANSI');
        this.telnet.sendTerminalType('PROXY');
      }
    });

    this.telnet.on('gmcp', (packageName, data) => {
      console.log('GMCP Package (local):', packageName, data);
      try {
        this.handleGmcpData(packageName, data);
      } catch (e) {
        console.error('Calling GMCP:', e);
      }
    });

    stream.on('close', () => {
      this.cleanupConnection();
    });

    // Mark as connected immediately — the worker will send the "connected"
    // message once the virtual connection is created.
    this._connected = true;
    resetMidiIntentionalDisconnectFlags();
    this.emit('connect');
    this.emit('connectionChange', true);
    this.markGmcpReady();
  }

  public markGmcpReady(): void {
    if (this._gmcpReady) return;
    this._gmcpReady = true;
    this.emit('gmcpReady');
  }

  public markSessionReady(): void {
    if (this._sessionReady) return;
    this._sessionReady = true;
    this.emit('sessionReady');
  }

  public send(data: string) {
    if (this.localMode && this.localStream) {
      // In local mode, write through the stream (WorkerStream -> Worker)
      this.localStream.write(Buffer.from(data));
    } else {
      this.ws.send(data);
    }
  }

  private cleanupConnection(): void {
    if (this.connectionCleanupComplete) return;
    this.connectionCleanupComplete = true;
    this._connected = false;
    this._gmcpReady = false;
    this._sessionReady = false;
    this.mcpSession.reset();
    this.telnetBuffer = '';
    useRoomStore.getState().reset(); // Reset room info on cleanup
    useSpatialStore.getState().reset(); // Reset spatial scene on cleanup
    this.fileTransferManager.cleanup();

    this.emit('disconnect');
    this.emit('connectionChange', false);
  }

  public close(): void {
    this.intentionalDisconnect = true;
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)
    ) {
      this.ws.close();
    }
    const closableStream = this.localStream as
      | (Stream & { close?: () => void; disconnect?: () => void })
      | undefined;
    closableStream?.close?.();
    closableStream?.disconnect?.();
    this.cleanupConnection();
  }

  public sendCommand(command: string): void {
    const localEchoEnabled = usePreferences.getState().general.localEcho;
    if (localEchoEnabled) {
      this.emit('command', command);
    }
    if (this.autosay && !command.startsWith('-') && !command.startsWith("'")) {
      command = `say ${command}`;
    }
    this.send(`${command}\r\n`);
    console.log(`> ${command}`);
  }

  /*
<message> ::= <message-start>
           | <message-continue>
           | <message-end>
<message-start> ::= <message-name> <space> <auth-key> <keyvals>
An MCP message consists of three parts: the name of the message, the authentication key, and a set of keywords and their associated values. The message name indicates what action is to be performed; if the given message name is unknown, the message should be ignored. The authentication key is generated at the beginning of the session; if it is incorrect, the message should be ignored. The keyword-value pairs specify the arguments to the message. These arguments may occur in any order, and the ordering of the arguments does not affect the semantics of the message. There is no limit on the number of keyword-value pairs which may appear in a message, or on the lengths of message names, keywords, or values.
*/

  private handleData(data: ArrayBuffer) {
    this.telnetBuffer += this.decoder.decode(data);
    const lines = this.telnetBuffer.split('\n');
    this.telnetBuffer = lines.pop() ?? '';

    for (const line of lines) {
      this.handleTextLine(line.replace(/\r$/, ''));
    }

    if (this.telnetBuffer && !this.telnetBuffer.startsWith('#$#')) {
      this.emitMessage(this.telnetBuffer);
      this.telnetBuffer = '';
    }
  }

  private handleTextLine(line: string): void {
    if (line?.startsWith('#$#')) {
      this.handleMcp(line);
      return;
    }

    this.emitMessage(line);
  }

  private handleMcp(decoded: string) {
    this.mcpSession.receiveLine(decoded);
  }

  private handleGmcpData(gmcpPackage: string, gmcpMessage: string) {
    const address = parseGmcpMessageAddress(gmcpPackage);
    if (!address) {
      console.log('Invalid GMCP package:', gmcpPackage);
      return;
    }

    console.log('GMCP Message:', address.packageName, address.messageType, gmcpMessage);
    const handler = this.gmcpHandlers[address.packageName];
    if (!handler) {
      console.log('No handler for GMCP package:', address.packageName);
      return;
    }

    const messageHandler = resolveGmcpMessageHandler(handler, address.messageType);
    if (!messageHandler) {
      console.log('No handler on package:', address.packageName, address.messageType);
      return;
    }

    try {
      messageHandler.call(handler, parseGmcpPayload(gmcpMessage));
    } catch (error) {
      console.error(
        `Error dispatching GMCP message for ${address.packageName}.${address.messageType}:`,
        error,
      );
    }
  }

  private emitMessage(dataString: string) {
    const autoreadMode = usePreferences.getState().speech.autoreadMode;
    if (autoreadMode === AutoreadMode.All) {
      this.speak(dataString);
    }
    if (autoreadMode === AutoreadMode.Unfocused && !document.hasFocus()) {
      this.speak(dataString);
    }
    this.emit('message', dataString);
  }

  sendGmcp(packageName: string, data?: unknown) {
    console.log('Sending GMCP:', packageName, data);
    this.telnet.sendGmcp(packageName, encodeGmcpPayload(data));
  }

  shutdown() {
    if (this.shutdownComplete) return;
    this.shutdownComplete = true;

    this.mcpSession.shutdown();
    Object.values(this.gmcpHandlers).forEach((handler) => {
      handler?.shutdown();
    });
    this.media.shutdown();
    this.editors.shutdown();
    this.close();
  }

  requestNotificationPermission() {
    // handle notifications
    // may not be available in all browsers
    if (!('Notification' in window)) {
      console.log('This browser does not support desktop notification');
      return;
    }
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  sendNotification(title: string, body: string) {
    if (!('Notification' in window)) {
      console.log('This browser does not support desktop notification');
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  }

  speak(text: string) {
    if (!('speechSynthesis' in window)) {
      console.log('This browser does not support speech synthesis');
      return;
    }
    const utterance = new SpeechSynthesisUtterance(stripAnsi(text));
    utterance.lang = 'en-US';
    const { rate, pitch, voice, volume } = usePreferences.getState().speech;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    const voices = speechSynthesis.getVoices();
    const selectedVoice = voices.find((v) => v.name === voice);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    speechSynthesis.speak(utterance);
  }

  cancelSpeech() {
    speechSynthesis.cancel();
  }

  stopAllSounds() {
    this.media.stopAllSounds();
  }
}

export default MudClient;
