import { describe, expect, it, vi } from 'vitest';

vi.mock('./App', () => ({
  default: () => null,
}));

import { routes } from './routes';

describe('application routes', () => {
  it('lazy-loads the Monaco editor route', () => {
    const editorRoute = routes.find((route) => route.path === '/editor');

    expect(editorRoute?.lazy).toEqual(expect.any(Function));
    expect(editorRoute?.element).toBeUndefined();
  });
});
