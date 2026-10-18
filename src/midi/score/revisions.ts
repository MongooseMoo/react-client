export interface SourceVersion {
  readonly clockId: string;
  readonly sourceId: string;
  readonly revision: number;
  readonly contentId: string;
}
export interface PendingSourceVersion extends SourceVersion {
  readonly replaceFromTick: number;
  readonly effectiveServerMs: number;
}
export type RevisionDecision =
  | 'replace'
  | 'unchanged'
  | 'active'
  | 'pending'
  | 'late-replacement'
  | 'stale'
  | 'rejected';

const valid = (version: SourceVersion): boolean =>
  [version.clockId, version.sourceId, version.contentId].every(
    (id) => typeof id === 'string' && id.length > 0 && id.length <= 128,
  ) &&
  Number.isSafeInteger(version.revision) &&
  version.revision >= 0;
const copy = (version: SourceVersion): SourceVersion =>
  Object.freeze({
    clockId: version.clockId,
    sourceId: version.sourceId,
    revision: version.revision,
    contentId: version.contentId,
  });

/** One gate per granted media key. Cached content alone must never construct a grant. */
export class SourceRevisionGate {
  private current?: SourceVersion;
  private future?: PendingSourceVersion;

  get active(): SourceVersion | undefined {
    return this.current;
  }
  get pending(): PendingSourceVersion | undefined {
    return this.future;
  }

  reset(): void {
    this.current = undefined;
    this.future = undefined;
  }

  play(version: SourceVersion, currentClockId: string): RevisionDecision {
    if (!valid(version) || version.clockId !== currentClockId) return 'rejected';
    if (
      !this.current ||
      version.clockId !== this.current.clockId ||
      version.sourceId !== this.current.sourceId
    ) {
      this.current = copy(version);
      this.future = undefined;
      return 'replace';
    }
    // Repeated Play is a snapshot, not a second start or permission to replace content.
    return this.update(version);
  }

  update(version: SourceVersion): RevisionDecision {
    const decision = this.check(version);
    if (decision) return decision;
    if (version.contentId !== this.current?.contentId) return 'rejected';
    this.current = copy(version);
    // A newer immediate pause/seek supersedes an earlier future edit.
    this.future = undefined;
    return 'active';
  }

  replaceFuture(version: PendingSourceVersion, serverNowMs: number): RevisionDecision {
    if (
      !Number.isSafeInteger(version.replaceFromTick) ||
      version.replaceFromTick < 0 ||
      !Number.isFinite(version.effectiveServerMs) ||
      version.effectiveServerMs < 0 ||
      !Number.isFinite(serverNowMs) ||
      serverNowMs < 0
    )
      return 'rejected';
    const decision = this.check(version);
    if (decision) {
      if (
        decision === 'unchanged' &&
        this.future &&
        (this.future.replaceFromTick !== version.replaceFromTick ||
          this.future.effectiveServerMs !== version.effectiveServerMs)
      )
        return 'rejected';
      return decision;
    }
    this.future = Object.freeze({
      ...copy(version),
      replaceFromTick: version.replaceFromTick,
      effectiveServerMs: version.effectiveServerMs,
    });
    return version.effectiveServerMs <= serverNowMs ? 'late-replacement' : 'pending';
  }

  /** Caller cancels the replaced suffix and changes render ownership at this boundary. */
  advance(serverNowMs: number): boolean {
    if (
      !Number.isFinite(serverNowMs) ||
      !this.future ||
      serverNowMs < this.future.effectiveServerMs
    )
      return false;
    this.current = copy(this.future);
    this.future = undefined;
    return true;
  }

  accepts(version: SourceVersion, onsetTick: number): boolean {
    if (!valid(version) || !Number.isSafeInteger(onsetTick) || onsetTick < 0) return false;
    const expected =
      this.future && onsetTick >= this.future.replaceFromTick ? this.future : this.current;
    return (
      expected !== undefined &&
      version.clockId === expected.clockId &&
      version.sourceId === expected.sourceId &&
      version.revision === expected.revision &&
      version.contentId === expected.contentId
    );
  }

  private check(version: SourceVersion): 'rejected' | 'stale' | 'unchanged' | undefined {
    if (
      !valid(version) ||
      !this.current ||
      version.clockId !== this.current.clockId ||
      version.sourceId !== this.current.sourceId
    )
      return 'rejected';
    const newest = this.future ?? this.current;
    if (version.revision < newest.revision) return 'stale';
    if (version.revision === newest.revision)
      return version.contentId === newest.contentId ? 'unchanged' : 'rejected';
    return undefined;
  }
}
