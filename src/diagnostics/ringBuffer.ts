/**
 * In-memory, bounded ring buffer for diagnostics records.
 *
 * Records are never persisted (no localStorage / IndexedDB) — the buffer
 * lives for the tab's lifetime only, per the privacy requirements in
 * issue #100. It is capped by both record count and a rough byte estimate
 * so a burst of large records can't blow past a reasonable memory budget
 * even while under the record-count cap.
 *
 * `record()` is designed to be called from hot paths (console wrapping,
 * store subscriptions). When disabled it returns immediately, before any
 * object is allocated or serialized.
 */

export interface DiagnosticRecord {
  /** Epoch milliseconds when the record was captured. */
  ts: number;
  /** Coarse grouping, e.g. "console.warn", "connection", "counters". */
  category: string;
  /** Structured payload. Keep this JSON-serializable. */
  data: Record<string, unknown>;
}

export const DEFAULT_MAX_RECORDS = 500;
export const DEFAULT_MAX_BYTES = 256 * 1024; // 256 KB

/** Rough byte estimate for a record. Falls back to a fixed guess for data
 * that can't be JSON-serialized (e.g. it contains a circular reference). */
function estimateBytes(record: DiagnosticRecord): number {
  try {
    return JSON.stringify(record).length;
  } catch {
    return 256;
  }
}

interface StoredRecord {
  record: DiagnosticRecord;
  size: number;
}

export class DiagnosticsRingBuffer {
  private entries: StoredRecord[] = [];
  private bytes = 0;
  private enabled = false;

  constructor(
    private readonly maxRecords: number = DEFAULT_MAX_RECORDS,
    private readonly maxBytes: number = DEFAULT_MAX_BYTES,
  ) {}

  isEnabled(): boolean {
    return this.enabled;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Records a structured diagnostics entry. No-op (zero allocation) when
   * disabled, so it's cheap to call unconditionally from hot paths.
   */
  record(category: string, data: Record<string, unknown>): void {
    if (!this.enabled) return;

    const record: DiagnosticRecord = { ts: Date.now(), category, data };
    const size = estimateBytes(record);
    this.entries.push({ record, size });
    this.bytes += size;
    this.evict();
  }

  private evict(): void {
    while (
      this.entries.length > 0 &&
      (this.entries.length > this.maxRecords || this.bytes > this.maxBytes)
    ) {
      const removed = this.entries.shift();
      if (removed) {
        this.bytes -= removed.size;
      }
    }
  }

  /** Returns a snapshot copy of the current records, oldest first. */
  snapshot(): DiagnosticRecord[] {
    return this.entries.map((entry) => entry.record);
  }

  clear(): void {
    this.entries = [];
    this.bytes = 0;
  }
}

/** Shared singleton used by the rest of the app. Tests should construct
 * their own `DiagnosticsRingBuffer` instance rather than relying on this
 * shared, mutable instance. */
export const diagnosticsBuffer = new DiagnosticsRingBuffer();
