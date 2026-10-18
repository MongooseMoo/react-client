import type MudClient from '../client';
import type { GMCPClientFileTransfer } from '../gmcp/Client/FileTransfer';
import type { FileTransfers, FileTransferEvents, TransferSnapshot } from '../fileTransfer/types';
import { ownerKey, usePersonalDataStore } from '../stores/personalDataStore';
import { useSessionStore } from '../stores/sessionStore';
import { createLegacyService } from './legacyService';
import { EndpointController } from './endpoint';
import { check, player, randomId, type Ready } from './protocol';
import { StorageOwner } from './storage';
import { SessionPool } from './sessionPool';
import { OfferTable, type OfferDetails } from './offers';
import { chooseTransport } from './transportChoice';

/** One captured personal-data owner; game socket/login are owned exclusively by MudClient. */
export class OwnerService implements FileTransfers {
  readonly fileSharingV2 = true;
  private legacy?: FileTransfers;
  private endpoint?: EndpointController;
  private pool?: SessionPool;
  private offers?: OfferTable;
  private storage?: StorageOwner;
  private releaseStorage?: () => void;
  private storageLock?: Promise<void>;
  private persistent = false;
  private currentKey = '';
  private identityRevision = 0;
  private disposed = false;
  private generation = 0;
  private nonce = randomId();
  private lifecycle = Promise.resolve();
  private requestAbort = new AbortController();
  private statusText = '';
  private readonly watchers = new Set<(t: TransferSnapshot) => void>();
  private readonly statusWatchers = new Set<() => void>();
  private readonly subscriptions: (() => void)[];
  constructor(
    private readonly client: MudClient,
    private readonly gmcp: GMCPClientFileTransfer,
  ) {
    this.legacy = createLegacyService(gmcp);
    this.legacy.on('change', this.change);
    this.subscriptions = [
      client.gmcp.require('Client.Files').on('Error', () => this.endpoint?.reportError()),
      usePersonalDataStore.subscribe(() => this.sync()),
      useSessionStore.subscribe(() => this.sync()),
    ];
    this.sync();
  }
  private change = (t: TransferSnapshot): void => {
    if (!this.disposed) for (const f of this.watchers) f(t);
  };
  private changed = (): void => {
    if (!this.disposed) for (const f of this.statusWatchers) f();
  };
  get status(): string {
    return this.endpoint?.status || this.statusText;
  }
  get durable(): boolean {
    return this.persistent;
  }
  get evictionRisk(): boolean {
    return Boolean(this.storage?.persistenceDenied);
  }
  get retentionNotice(): string {
    return this.offers?.retentionNotice ?? '';
  }
  subscribeStatus(f: () => void): () => void {
    this.statusWatchers.add(f);
    return () => {
      this.statusWatchers.delete(f);
    };
  }
  details(): OfferDetails[] {
    return this.offers?.details() ?? [];
  }
  private eligible(): boolean {
    const policy = usePersonalDataStore.getState();
    const session = useSessionStore.getState();
    return (
      !this.disposed &&
      this.client.connected &&
      this.client.gmcp.ready &&
      policy.policyReady &&
      player(session.playerId) &&
      this.client.gmcp.confirmedPlayer === session.playerId &&
      (policy.visitor ||
        Boolean(
          policy.owner &&
            policy.owner.playerRef === session.playerId &&
            policy.owner.playerUuid === session.playerUuid,
        ))
    );
  }
  private sync(): void {
    const policy = usePersonalDataStore.getState();
    const session = useSessionStore.getState();
    const key = this.eligible()
      ? policy.visitor
        ? JSON.stringify(['ephemeral', session.playerId, this.nonce])
        : ownerKey(policy.owner as NonNullable<typeof policy.owner>)
      : '';
    if (
      key === this.currentKey &&
      !(
        this.endpoint?.awaitingIdentity && this.client.gmcp.identityRevision > this.identityRevision
      )
    )
      return;
    this.currentKey = key;
    this.identityRevision = this.client.gmcp.identityRevision;
    this.lifecycle = this.lifecycle
      .then(async () => {
        if (this.endpoint) await this.endpoint.stop();
        this.endpoint = undefined;
        if (!key || key !== this.currentKey || !this.eligible()) return;
        const endpoint = new EndpointController({
          peer: this.client.gmcp.require('Client.Peer'),
          owner: key,
          player: session.playerId,
          acquire: async (digest, locks) => {
            this.persistent = locks && !policy.visitor;
            if (locks) {
              let acquired!: () => void;
              let failed!: (e: Error) => void;
              const ready = new Promise<void>((resolve, reject) => {
                acquired = resolve;
                failed = reject;
              });
              this.storageLock = navigator.locks
                .request(
                  `file-sharing-v2:${digest}`,
                  { mode: 'exclusive', ifAvailable: true },
                  async (lock) => {
                    if (!lock) {
                      failed(new Error('File storage is already in use'));
                      return;
                    }
                    acquired();
                    await new Promise<void>((resolve) => {
                      this.releaseStorage = resolve;
                    });
                  },
                )
                .then(() => undefined);
              await ready;
            }
            await this.openStorage(key);
          },
          ready: (r) => this.ready(r),
          parked: () => {
            this.client.fileSharingParked = true;
          },
          lost: async (reason) => {
            if (endpoint.parked) this.client.fileSharingParked = true;
            try {
              await this.fence(Boolean(this.offers || this.pool));
            } finally {
              if (this.eligible()) this.restoreLegacy();
              if (!this.eligible() || ['superseded', 'stopped'].includes(reason)) {
                this.releaseStorage?.();
                this.releaseStorage = undefined;
                await this.storageLock;
                this.storageLock = undefined;
                this.persistent = false;
              }
            }
            if (this.eligible() && !['superseded', 'stopped'].includes(reason))
              await this.openStorage(key);
          },
          changed: this.changed,
        });
        endpoint.parked = this.client.fileSharingParked;
        this.endpoint = endpoint;
        await endpoint.start();
      })
      .catch((error) => {
        this.statusText = `File transfers unavailable: ${error instanceof Error ? error.message : String(error)}`;
        this.changed();
      });
  }
  private async openStorage(key: string): Promise<void> {
    if (this.disposed || this.storage) return;
    const storage = new StorageOwner(key, ++this.generation, this.persistent);
    this.storage = storage;
    try {
      await storage.ready;
    } catch (error) {
      this.storage = undefined;
      await storage.close().catch(() => {});
      throw error;
    }
  }
  private restoreLegacy(): void {
    if (this.legacy || this.disposed) return;
    this.legacy = createLegacyService(this.gmcp);
    this.legacy.on('change', this.change);
  }
  private ready(r: Ready): void {
    if (!this.eligible() || !this.storage) return;
    if (!this.persistent)
      this.storage.adoptEphemeral(JSON.stringify(['ephemeral', r.hub, r.self.epoch, this.nonce]));
    this.statusText = '';
    this.restoreLegacy();
    const offers = new OfferTable({
      self: r,
      files: this.client.gmcp.require('Client.Files'),
      storage: this.storage,
      live: () => this.eligible() && Boolean(this.endpoint?.valid),
      change: this.change,
      changed: this.changed,
    });
    const pool = new SessionPool(
      this.client.gmcp.require('Client.Peer'),
      r,
      () => this.eligible() && Boolean(this.endpoint?.valid),
      {
        authorized: (p, o) => offers.authorized(p, o),
        reservationFailed: (offer, reason) => offers.reservationFailed(offer, reason),
        control: (s, m) => offers.control(s, m),
        channel: (s, c) => offers.channel(s, c),
        established: (s) => offers.established(s),
        lost: (s, retry) => offers.lost(s, retry),
      },
    );
    offers.attach(pool);
    this.offers = offers;
    this.pool = pool;
    this.changed();
  }
  private async fence(disposeLegacy = true): Promise<void> {
    this.requestAbort.abort();
    this.requestAbort = new AbortController();
    this.generation++;
    this.offers?.dispose();
    this.offers = undefined;
    this.pool?.dispose();
    this.pool = undefined;
    if (disposeLegacy) {
      this.legacy?.dispose();
      this.legacy = undefined;
    }
    const storage = this.storage;
    this.storage = undefined;
    await storage?.close();
    this.changed();
  }
  async activateThisTab(): Promise<void> {
    this.client.fileSharingParked = false;
    await this.endpoint?.activateThisTab();
  }
  async send(file: File, to: string): Promise<TransferSnapshot> {
    check(
      this.endpoint?.valid && this.offers && this.eligible(),
      'File transfers are not ready; try again when the connection is available',
    );
    const generation = this.generation;
    const choice = await chooseTransport(
      this.client.gmcp.require('Client.Peer'),
      to,
      this.requestAbort.signal,
    );
    check(
      this.generation === generation && this.endpoint.valid && this.eligible(),
      'File endpoint changed; please send again',
    );
    if (choice.transport === 'v1') {
      check(this.legacy && file.size <= 104857600);
      return this.legacy.send(file, to);
    }
    check(choice.target);
    return this.offers.send(file, choice.target, choice.maxReceiveSize);
  }
  accept(key: string): Promise<void> {
    if (key.startsWith('v2:')) {
      check(this.offers);
      return this.offers.accept(key);
    }
    check(this.legacy);
    return this.legacy.accept(key);
  }
  reject(key: string): void {
    if (key.startsWith('v2:')) this.offers?.reject(key);
    else this.legacy?.reject(key);
  }
  cancel(key: string): void {
    if (key.startsWith('v2:')) this.offers?.cancel(key);
    else this.legacy?.cancel(key);
  }
  save(key: string): Promise<void> {
    check(this.offers);
    return this.offers.save(key);
  }
  discard(key: string): Promise<void> {
    check(this.offers);
    return this.offers.discard(key);
  }
  retry(key: string): void {
    check(this.offers);
    this.offers.retry(key);
  }
  protocolFailure(): void {
    this.endpoint?.reportError();
  }
  transfers(): TransferSnapshot[] {
    return [...(this.legacy?.transfers() ?? []), ...(this.offers?.snapshots() ?? [])];
  }
  on<E extends keyof FileTransferEvents>(_event: E, fn: FileTransferEvents[E]): this {
    this.watchers.add(fn);
    return this;
  }
  off<E extends keyof FileTransferEvents>(_event: E, fn: FileTransferEvents[E]): this {
    this.watchers.delete(fn);
    return this;
  }
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.currentKey = '';
    this.requestAbort.abort();
    this.offers?.dispose();
    this.pool?.dispose();
    this.legacy?.dispose();
    for (const off of this.subscriptions) off();
    void this.lifecycle
      .then(async () => {
        await this.endpoint?.stop();
        await this.fence();
        this.releaseStorage?.();
      })
      .catch((error) => console.error('File storage shutdown:', error));
    this.watchers.clear();
    this.statusWatchers.clear();
  }
}
export function createOwnerService(client: MudClient, gmcp: GMCPClientFileTransfer): FileTransfers {
  return new OwnerService(client, gmcp);
}
