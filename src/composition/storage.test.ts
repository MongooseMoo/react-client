import { beforeEach, describe, it, expect } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';
import { CompositionStorage, validateDraft, retainCaptureHistory } from './storage';
import { newComposition } from './model';
import { createComposerStore } from '../stores/composerStore';
beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
});
describe('owner-scoped composition persistence', () => {
  it('evicts the oldest raw takes before committing a newer recording without removing pattern notes', () => {
    const draft = newComposition(),
      partId = draft.parts[0].id,
      patternId = draft.patterns[0].id;
    const take = (id: string, count: number, note: number) => ({
      id,
      partId,
      patternId,
      startPerformanceMs: 0,
      endPerformanceMs: 1000,
      startTick: 0,
      events: Array.from({ length: count }, () => ({
        performanceTimeMs: 50.125,
        data: [0xb0, 1, 100],
      })),
      unquantizedNotes: [[0, 960, note, 100] as const],
    });
    const notes = [
      [0, 960, 60, 100],
      [960, 960, 64, 100],
    ] as const;
    const retained = retainCaptureHistory({
      ...draft,
      takes: [take('old', 12000, 60), take('new', 9000, 64)],
      patterns: [{ ...draft.patterns[0], parts: [{ ...draft.patterns[0].parts[0], notes }] }],
    });
    expect(retained.evictedTakes).toBe(1);
    expect(retained.draft.takes.map((take) => take.id)).toEqual(['new']);
    expect(retained.draft.patterns[0].parts[0].notes).toEqual(notes);
    const store = createComposerStore();
    store.getState().replaceDraft(draft);
    store.getState().edit(() => retained.draft);
    expect(store.getState().error).toBe('');
    expect(store.getState().history.present.patterns[0].parts[0].notes).toEqual(notes);
  });
  it('persists drafts only under their confirmed owner and supports bounded list/delete', async () => {
    const alice = new CompositionStorage('server:alice'),
      bob = new CompositionStorage('server:bob');
    const draft = newComposition();
    await alice.save(draft);
    expect(await alice.load(draft.id)).toEqual(draft);
    expect(await bob.load(draft.id)).toBeUndefined();
    expect(await bob.list()).toEqual([]);
    expect(await alice.list()).toMatchObject([{ id: draft.id, name: draft.name }]);
    await alice.remove(draft.id);
    expect(await alice.list()).toEqual([]);
  });
  it('rejects invalid unused patterns and keeps the previously saved version', async () => {
    const storage = new CompositionStorage('owner'),
      draft = newComposition();
    await storage.save(draft);
    const bad = {
      ...draft,
      patterns: [
        ...draft.patterns,
        {
          ...draft.patterns[0],
          id: 'unused',
          parts: [{ ...draft.patterns[0].parts[0], notes: [[0, 960, 200, 100] as const] }],
        },
      ],
    };
    expect(() => validateDraft(bad)).toThrow();
    await expect(storage.save(bad)).rejects.toThrow();
    expect(await storage.load(draft.id)).toEqual(draft);
  });
});
