import commitHash from 'virtual:commit-hash';
import { usePersonalDataStore } from '../stores/personalDataStore';

import type MudClient from '../client';
import type { TelnetParser } from '../telnet';
import {
  encodeGmcpPayload,
  parseGmcpMessageAddress,
  parseGmcpPayload,
} from './codec';
import type { GMCPPackage } from './package';
import type { GMCPHandlerMap, KnownGMCPPackageMap, KnownGMCPPackageName } from './types';
import { validSupportRequestPayload } from './playbackSupport';

export type GMCPPackageConstructor<P extends GMCPPackage = GMCPPackage> = new (_: MudClient) => P;

export class GmcpSession {
  private readonly packageHandlers: GMCPHandlerMap = {};
  private telnet: TelnetParser | null = null;
  private _ready = false;
  private _sessionReady = false;
  private identity = '';
  private _generation = 0;
  private supportRequestTransport: number | undefined;
  private readonly recentSupportRequests = new Set<string>();

  get generation(): number { return this._generation; }

  confirmIdentity(playerRef: string, playerUuid: string): boolean {
    const identity = JSON.stringify([playerRef, playerUuid]);
    if (identity === this.identity) return false;
    const changed = this.identity !== '';
    this.identity = identity;
    this._generation++;
    if (changed) {
      for (const handler of Object.values(this.packageHandlers)) {
        if (handler && !['Char', 'Core', 'Core.Supports'].includes(handler.packageName)) handler.reset();
      }
      this.client.resetIdentityState();
    }
    return true;
  }

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
    this.client.registerDisconnectReset(() => gmcpPackage.reset());
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

  start(): boolean {
    this.require('Core').sendHello({ client: 'Mongoose Client', version: commitHash });
    const coreSupports = this.require('Core.Supports');
    coreSupports.sendSet(coreSupports.advertisedModules());
    this.require('Auth.Autologin').sendStoredLogin();
    this.require('Client.Media').publishEffectsSupport();
    this.require('Client.Media').sendPlaybackSupport();
    return this.markReady();
  }

  markReady(): boolean {
    if (this._ready) return false;
    this._ready = true;
    this.client.sharedClock?.setNetworkReady(!this.client.localConnection);
    return true;
  }

  markSessionReady(): boolean {
    if (this._sessionReady) return false;
    this._sessionReady = true;
    return true;
  }

  respondToSupportRequest(requestId: string): void {
    if (!this._ready || !this.telnet || !this.client.connected || this.client.localConnection) return;
    const transport = this.client.currentTransportGeneration;
    if (this.supportRequestTransport !== transport) {
      this.recentSupportRequests.clear();
      this.supportRequestTransport = transport;
    }
    if (this.recentSupportRequests.has(requestId)) return;
    // Validation precedes both the Set and consuming this request's response.
    const supports = this.require('Core.Supports');
    supports.advertisedModules();
    this.recentSupportRequests.add(requestId);
    const oldest = this.recentSupportRequests.values().next().value;
    if (this.recentSupportRequests.size > 64 && oldest !== undefined)
      this.recentSupportRequests.delete(oldest);
    supports.refreshCurrentSupport(requestId);
  }

  receive(gmcpPackage: string, gmcpMessage: string | undefined): void {
    const address = parseGmcpMessageAddress(gmcpPackage);
    if (!address) {
      console.log('Invalid GMCP package:', gmcpPackage);
      return;
    }

    const policy = usePersonalDataStore.getState();
    const supportRequest = address.packageName === 'Client.Media' && address.messageType === 'SupportRequest';
    if (supportRequest && !validSupportRequestPayload(gmcpMessage)) return;
    if (policy.visitor && !policy.visitorWindow && !supportRequest &&
        !['Auth.Autologin', 'Char', 'Core', 'Core.Supports'].includes(address.packageName)) return;

    console.log('GMCP Message:', address.packageName, address.messageType);
    const handler = this.packageHandlers[address.packageName];
    if (!handler) {
      console.log('No handler for GMCP package:', address.packageName);
      return;
    }

    let handled: boolean;
    try {
      const payload = parseGmcpPayload(gmcpMessage);
      handled = handler.receiveRegisteredMessage(address.messageType, payload);
    } catch {
      console.error(
        `Error dispatching GMCP message for ${address.packageName}.${address.messageType}:`,
      );
      return;
    }

    if (handled) {
      return;
    }

    console.log('No registered GMCP message:', address.packageName, address.messageType);
  }

  send(packageName: string, data?: unknown): void {
    if (!this.telnet) {
      throw new Error(`Cannot send GMCP before a transport is attached: ${packageName}`);
    }
    console.log('Sending GMCP:', packageName);
    this.telnet.sendGmcp(packageName, encodeGmcpPayload(data));
  }

  reset(): void {
    this._generation++;
    this.identity = '';
    this._ready = false;
    this._sessionReady = false;
    this.telnet = null;
    this.client.sharedClock?.setNetworkReady(false);
  }

  shutdown(): void {
    this.recentSupportRequests.clear();
    Object.values(this.packageHandlers).forEach((handler) => {
      handler?.shutdown();
    });
  }
}
