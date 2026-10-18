import { GMCPPackage } from '../gmcp/package';
import { strictJson, check, knownInbound } from './protocol';
/** Typed package port. Raw parsing in GmcpSession preserves duplicate-key detection. */
export abstract class SharingPackage<I, O> extends GMCPPackage {
  private readonly listeners = new Map<keyof I, Set<(v: unknown) => void>>();
  abstract validate<K extends keyof I & string>(kind: K, data: unknown): I[K];
  override get enabled(): boolean {
    return this.client.fileSharingV2Enabled;
  }
  send<K extends keyof O & string>(kind: K, data: O[K]): void {
    check(this.enabled);
    const raw = JSON.stringify(data);
    strictJson(raw);
    this.sendData(kind, data);
  }
  on<K extends keyof I & string>(kind: K, fn: (data: I[K]) => void): () => void {
    const set = this.listeners.get(kind) ?? new Set();
    this.listeners.set(kind, set);
    set.add(fn as (v: unknown) => void);
    return () => {
      set.delete(fn as (v: unknown) => void);
    };
  }
  override receiveRegisteredMessage(kind: string, payload: unknown): boolean {
    if (!this.enabled) return false;
    if (!knownInbound(this.packageName, kind)) {
      this.client.fileSharingProtocolError();
      return true;
    }
    const data = this.validate(kind as keyof I & string, payload);
    for (const fn of this.listeners.get(kind as keyof I) ?? []) {
      try {
        fn(data);
      } catch {
        this.client.fileSharingProtocolError();
      }
    }
    return true;
  }
}
