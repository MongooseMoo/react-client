import { beforeEach, describe, expect, it } from 'vitest';
import { useServerLinksStore } from './serverLinksStore';

describe('serverLinksStore', () => {
  beforeEach(() => {
    useServerLinksStore.getState().reset();
  });

  it('stores home and help links', () => {
    useServerLinksStore.getState().setServerInfo({
      homeUrl: 'https://example.test/',
      helpUrl: 'https://example.test/help',
    });

    expect(useServerLinksStore.getState().homeUrl).toBe('https://example.test/');
    expect(useServerLinksStore.getState().helpUrl).toBe('https://example.test/help');
  });

  it('keeps recent server-sent URLs newest first and de-duped', () => {
    useServerLinksStore.getState().addRecentUrl('https://example.test/one', 1);
    useServerLinksStore.getState().addRecentUrl('https://example.test/two', 2);
    useServerLinksStore.getState().addRecentUrl('https://example.test/one', 3);

    expect(useServerLinksStore.getState().recentUrls.map((entry) => entry.url)).toEqual([
      'https://example.test/one',
      'https://example.test/two',
    ]);
    expect(useServerLinksStore.getState().recentUrls[0].receivedAt).toBe(3);
  });
});
