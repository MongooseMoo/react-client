import { openIndexedDatabase, requestToPromise, transactionDone } from '../persistence';
import { compileComposition, type CompositionDraft, type PatternPart } from './model';
import { validateScore } from '../midi/score';
export interface SavedComposition {
  id: string;
  name: string;
  updatedAt: number;
  bytes: number;
}
const MAX_DRAFT_BYTES = 2 * 1048576;
const MAX_TOTAL_BYTES = 16 * 1048576;
const MAX_DRAFTS = 16;
/** Evict bounded raw take history; the edited pattern's notes remain untouched. */
export function retainCaptureHistory(draft: CompositionDraft): {
  draft: CompositionDraft;
  evictedTakes: number;
} {
  let takes = [...draft.takes],
    inputs = takes.reduce((sum, take) => sum + take.events.length, 0),
    evictedTakes = 0;
  while (
    takes.length &&
    (takes.length > 64 ||
      inputs > 20000 ||
      new TextEncoder().encode(JSON.stringify({ ...draft, takes })).byteLength > MAX_DRAFT_BYTES)
  ) {
    inputs -= takes[0].events.length;
    takes = takes.slice(1);
    evictedTakes++;
  }
  return { draft: { ...draft, takes }, evictedTakes };
}
export function validateDraft(value: unknown): CompositionDraft {
  if (!value || typeof value !== 'object') throw new TypeError('Invalid composition draft');
  const draft = value as CompositionDraft;
  if (
    draft.version !== 1 ||
    typeof draft.id !== 'string' ||
    !draft.id ||
    draft.id.length > 128 ||
    (draft.revisionId !== undefined &&
      (typeof draft.revisionId !== 'string' ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
          draft.revisionId,
        ))) ||
    typeof draft.name !== 'string' ||
    draft.name.length > 256 ||
    !Number.isFinite(draft.updatedAt) ||
    !Number.isInteger(draft.key) ||
    Math.abs(draft.key) > 7 ||
    typeof draft.minor !== 'boolean' ||
    !Array.isArray(draft.takes) ||
    draft.takes.length > 64 ||
    !Array.isArray(draft.patterns) ||
    draft.patterns.length > 64 ||
    !Array.isArray(draft.parts) ||
    draft.parts.length > 16 ||
    !Array.isArray(draft.sections) ||
    draft.sections.length > 256
  )
    throw new TypeError('Invalid composition structure');
  const validId = (id: unknown) => typeof id === 'string' && id.length > 0 && id.length <= 128;
  const boundedMidi = (number: unknown) =>
    typeof number === 'number' && Number.isInteger(number) && number >= 0 && number <= 127;
  if (
    !draft.patterns.length ||
    (draft.sourceFormat !== undefined && draft.sourceFormat !== 0 && draft.sourceFormat !== 1)
  )
    throw new TypeError('Invalid composition format');
  for (const part of draft.parts)
    if (
      !part ||
      !validId(part.id) ||
      typeof part.name !== 'string' ||
      part.name.length > 256 ||
      !boundedMidi(part.gain) ||
      !boundedMidi(part.pan) ||
      typeof part.mute !== 'boolean' ||
      typeof part.solo !== 'boolean'
    )
      throw new TypeError('Invalid composition part');
  const patternIds = new Set<string>();
  for (const pattern of draft.patterns) {
    if (
      !pattern ||
      !validId(pattern.id) ||
      patternIds.has(pattern.id) ||
      typeof pattern.name !== 'string' ||
      pattern.name.length > 256 ||
      !Array.isArray(pattern.parts) ||
      pattern.parts.length > draft.parts.length
    )
      throw new TypeError('Invalid or duplicate pattern');
    patternIds.add(pattern.id);
    const materialIds = new Set<string>();
    for (const material of pattern.parts) {
      if (
        !material ||
        materialIds.has(material.partId) ||
        !draft.parts.some((part) => part.id === material.partId)
      )
        throw new TypeError('Invalid or duplicate pattern part');
      materialIds.add(material.partId);
    }
    const checked = validateScore({
      version: 1,
      contentId: draft.id,
      ppq: 960,
      durationTicks: pattern.durationTicks,
      tempos: [{ tick: 0, bpm: 120 }],
      meters: [{ tick: 0, numerator: 4, denominator: 4 }],
      parts: draft.parts.map((part) => ({
        ...part,
        ...(pattern.parts.find((material: PatternPart) => material.partId === part.id) ?? {
          notes: [],
          controls: [],
          programs: [],
        }),
        id: part.id,
      })),
    });
    if (!checked.ok) throw new TypeError(checked.error);
  }
  const sectionIds = new Set<string>();
  for (const section of draft.sections) {
    if (!section || !validId(section.id) || sectionIds.has(section.id))
      throw new TypeError('Invalid or duplicate arrangement section');
    sectionIds.add(section.id);
  }
  let inputs = 0;
  for (const take of draft.takes) {
    if (
      !take ||
      !Array.isArray(take.events) ||
      !Array.isArray(take.unquantizedNotes) ||
      take.events.length > 20000 ||
      take.unquantizedNotes.length > 20000 ||
      !Number.isFinite(take.startPerformanceMs) ||
      !Number.isFinite(take.endPerformanceMs) ||
      take.endPerformanceMs < take.startPerformanceMs ||
      typeof take.partId !== 'string' ||
      typeof take.patternId !== 'string'
    )
      throw new TypeError('Invalid captured take');
    inputs += take.events.length;
    if (inputs > 20000) throw new RangeError('Captured event history exceeds 20000 inputs');
    for (const input of take.events)
      if (
        !Number.isFinite(input.performanceTimeMs) ||
        !Array.isArray(input.data) ||
        input.data.length < 2 ||
        input.data.length > 3 ||
        input.data.some(
          (byte: unknown) =>
            typeof byte !== 'number' || !Number.isInteger(byte) || byte < 0 || byte > 255,
        )
      )
        throw new TypeError('Invalid captured input');
  }
  if (new TextEncoder().encode(JSON.stringify(draft)).byteLength > MAX_DRAFT_BYTES)
    throw new RangeError('Composition draft exceeds 2 MiB');
  for (const pattern of draft.patterns) compileComposition(draft, pattern.id, false);
  compileComposition(draft, undefined, false);
  return draft;
}
/** Immutable account/runtime owner scope, matching existing personal data storage policy. */
export class CompositionStorage {
  constructor(private readonly owner: string) {
    if (!owner || owner.length > 2048) throw new TypeError('Composition storage needs an owner');
  }
  private open() {
    return openIndexedDatabase({
      name: `mongoose-compositions-v1:${this.owner}`,
      version: 1,
      upgrade(database) {
        database.createObjectStore('drafts');
        database.createObjectStore('index', { keyPath: 'id' });
      },
    });
  }
  async list(): Promise<SavedComposition[]> {
    const database = await this.open();
    try {
      const transaction = database.transaction('index', 'readonly');
      const [records] = await Promise.all([
        requestToPromise<SavedComposition[]>(
          transaction.objectStore('index').getAll(undefined, MAX_DRAFTS + 1),
        ),
        transactionDone(transaction),
      ]);
      if (records.length > MAX_DRAFTS) throw new RangeError('Composition index exceeds its limit');
      return records.sort((a, b) => b.updatedAt - a.updatedAt);
    } finally {
      database.close();
    }
  }
  async save(draft: CompositionDraft): Promise<void> {
    validateDraft(draft);
    const bytes = new TextEncoder().encode(JSON.stringify(draft)).byteLength;
    const database = await this.open();
    try {
      const transaction = database.transaction(['drafts', 'index'], 'readwrite');
      const done = transactionDone(transaction);
      await Promise.all([
        (async () => {
          const index = transaction.objectStore('index');
          const previous = await requestToPromise<SavedComposition[]>(
            index.getAll(undefined, MAX_DRAFTS + 1),
          );
          const rest = previous.filter((record) => record.id !== draft.id);
          if (
            rest.length >= MAX_DRAFTS ||
            rest.reduce((sum, record) => sum + record.bytes, bytes) > MAX_TOTAL_BYTES
          ) {
            transaction.abort();
            throw new RangeError(
              'Local compositions reached the 16-draft or 16-MiB limit; delete a saved draft first',
            );
          }
          transaction.objectStore('drafts').put(draft, draft.id);
          index.put({ id: draft.id, name: draft.name, updatedAt: draft.updatedAt, bytes });
        })(),
        done,
      ]);
    } finally {
      database.close();
    }
  }
  async load(id: string): Promise<CompositionDraft | undefined> {
    const database = await this.open();
    try {
      const transaction = database.transaction('drafts', 'readonly');
      const [draft] = await Promise.all([
        requestToPromise<unknown>(transaction.objectStore('drafts').get(id)),
        transactionDone(transaction),
      ]);
      return draft === undefined ? undefined : validateDraft(draft);
    } finally {
      database.close();
    }
  }
  async remove(id: string): Promise<void> {
    const database = await this.open();
    try {
      const transaction = database.transaction(['drafts', 'index'], 'readwrite');
      transaction.objectStore('drafts').delete(id);
      transaction.objectStore('index').delete(id);
      await transactionDone(transaction);
    } finally {
      database.close();
    }
  }
}
