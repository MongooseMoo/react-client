import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppRoutes, EditorErrorBoundary, isDynamicImportError } from './routes';

vi.mock('./App', () => ({
  default: () => <p>Client page</p>,
}));

vi.mock('./components/editor/editorWindow', () => ({
  default: ({ search }: { search: string }) => <p>Editor query: {search}</p>,
}));

beforeEach(() => window.history.replaceState(null, '', '/'));

function ThrowEditorRoute() {
  throw new Error('Synthetic editor render failure');
}

describe('editor route error handling', () => {
  it('recognizes stale dynamic editor chunk failures', () => {
    expect(
      isDynamicImportError(
        new TypeError(
          'Failed to fetch dynamically imported module: https://client.mongoose.world/assets/editorWindow-old.js',
        ),
      ),
    ).toBe(true);
    expect(isDynamicImportError(new Error('Synthetic editor render failure'))).toBe(false);
  });

  it('renders a visible editor fallback for render failures', async () => {
    render(<EditorErrorBoundary><ThrowEditorRoute /></EditorErrorBoundary>);

    expect(await screen.findByRole('heading', { name: 'Editor failed to load' })).toBeVisible();
    expect(screen.getByText('Synthetic editor render failure')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Reload' })).toBeVisible();
  });

  it('renders the client and responds to browser navigation into and out of the editor', async () => {
    render(<AppRoutes />);
    expect(screen.getByText('Client page')).toBeVisible();
    act(() => {
      window.history.pushState(null, '', '/editor/?reference=%231%3Atest');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(await screen.findByText('Editor query: ?reference=%231%3Atest')).toBeVisible();
    expect(screen.queryByText('Client page')).not.toBeInTheDocument();
    act(() => {
      window.history.replaceState(null, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(screen.getByText('Client page')).toBeVisible();
  });

  it('renders an explicit not-found page for unknown paths', () => {
    window.history.replaceState(null, '', '/missing');
    render(<AppRoutes />);
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  });
});
