import type MudClient from '../client';
import type { TelnetParser } from '../telnet';
import {
  encodeGmcpPayload,
  parseGmcpMessageAddress,
  parseGmcpPayload,
} from './codec';
import type { GMCPPackage } from './package';
import type { GMCPHandlerMap, KnownGMCPPackageMap, KnownGMCPPackageName } from './types';

export type GMCPPackageConstructor<P extends GMCPPackage = GMCPPackage> = new (_: MudClient) => P;

export class GmcpSession {
  private readonly packageHandlers: GMCPHandlerMap = {};
  private telnet: TelnetParser | null = null;
  private _ready = false;
  private _sessionReady = false;

  constructor(private readonly client: MudClient) {}

  get handlers(): GMCPHandlerMap {
    return this.packageHandlers;
  }

  get ready(): boolean {
    return this._ready;
  }

  get sessionReady(): boolean {
    return this._sessionReady;
  }

  attachTransport(telnet: TelnetParser): void {
    this.telnet = telnet;
  }

  register<P extends GMCPPackage>(PackageConstructor: GMCPPackageConstructor<P>): P {
    const gmcpPackage = new PackageConstructor(this.client);
    this.packageHandlers[gmcpPackage.packageName] = gmcpPackage;
    console.log('Registered GMCP Package:', gmcpPackage.packageName);
    return gmcpPackage;
  }

  require<K extends KnownGMCPPackageName>(packageName: K): KnownGMCPPackageMap[K] {
    const gmcpPackage = this.packageHandlers[packageName] as KnownGMCPPackageMap[K] | undefined;
    if (!gmcpPackage) {
      throw new Error(`Required GMCP package is not registered: ${packageName}`);
    }
    return gmcpPackage;
  }

  start(): void {
    this.require('Core').sendHello({ client: 'Mongoose Client', version: '0.1' });
    const coreSupports = this.require('Core.Supports');
    coreSupports.sendSet(coreSupports.advertisedModules());
    this.require('Auth.Autologin').sendStoredLogin();
    this.require('Client.Media').publishEffectsSupport();
    this.markReady();
  }

  markReady(): void {
    if (this._ready) return;
    this._ready = true;
    this.client.emit('gmcpReady');
  }

  markSessionReady(): void {
    if (this._sessionReady) return;
    this._sessionReady = true;
    this.client.emit('sessionReady');
  }

  receive(gmcpPackage: string, gmcpMessage: string | undefined): void {
    const address = parseGmcpMessageAddress(gmcpPackage);
    if (!address) {
      console.log('Invalid GMCP package:', gmcpPackage);
      return;
    }

    console.log('GMCP Message:', address.packageName, address.messageType, gmcpMessage);
    const handler = this.packageHandlers[address.packageName];
    if (!handler) {
      console.log('No handler for GMCP package:', address.packageName);
      return;
    }

    const payload = parseGmcpPayload(gmcpMessage);
    if (handler.receiveRegisteredMessage(address.messageType, payload)) {
      return;
    }

    console.log('No registered GMCP message:', address.packageName, address.messageType);
  }

  send(packageName: string, data?: unknown): void {
    if (!this.telnet) {
      throw new Error(`Cannot send GMCP before a transport is attached: ${packageName}`);
    }
    console.log('Sending GMCP:', packageName, data);
    this.telnet.sendGmcp(packageName, encodeGmcpPayload(data));
  }

  reset(): void {
    this._ready = false;
    this._sessionReady = false;
    this.telnet = null;
  }

  shutdown(): void {
    Object.values(this.packageHandlers).forEach((handler) => {
      handler?.shutdown();
    });
  }
}
