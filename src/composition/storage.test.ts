import { beforeEach, describe, it, expect } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';
import { CompositionStorage, validateDraft } from './storage';
import { newComposition } from './model';
beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
});
describe('owner-scoped composition persistence', () => {
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
