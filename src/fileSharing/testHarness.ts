import type { WirePort } from './protocol';
/** The existing v1 testHarness pattern: asynchronous hub and transport seams, runner-independent. */
export class MemoryPort<I, O> implements WirePort<I,O> {
  readonly sent: { kind: keyof O; data: O[keyof O] & Record<string, unknown> }[] = [];
  private readonly listeners = new Map<keyof I, Set<(v: unknown) => void>>();
  post?: (kind: keyof O, data: O[keyof O]) => void;
  send<K extends keyof O & string>(kind: K, data: O[K]): void { this.sent.push({ kind, data: data as O[keyof O] & Record<string, unknown> }); this.post?.(kind,data); }
  on<K extends keyof I & string>(kind: K, fn: (v: I[K]) => void): () => void { const set = this.listeners.get(kind) ?? new Set(); this.listeners.set(kind,set); set.add(fn as (v: unknown) => void); return () => { set.delete(fn as (v: unknown) => void); }; }
  deliver<K extends keyof I & string>(kind: K, data: I[K]): void { for (const fn of this.listeners.get(kind) ?? []) fn(data); }
}
