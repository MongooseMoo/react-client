import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { requestToPromise } from './persistence';
import { getBrowserInstallationId } from './browserInstallation';

describe('browser installation', () => {
  beforeEach(async () => {
    await requestToPromise(indexedDB.deleteDatabase('mongoose-browser'));
  });

  it('creates one canonical installation across concurrent callers', async () => {
    const ids = await Promise.all(Array.from({ length: 8 }, () => getBrowserInstallationId()));
    expect(new Set(ids).size).toBe(1);
    expect(ids[0]).toMatch(/^[0-9a-f-]{36}$/);
    await expect(getBrowserInstallationId()).resolves.toBe(ids[0]);
  });
});
