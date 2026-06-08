import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { EditorRouteError, isDynamicImportError } from './routes';

vi.mock('./App', () => ({
  default: () => null,
}));

function ThrowEditorRoute() {
  throw new Error('Synthetic editor render failure');
}

describe('editor route error handling', () => {
  it('recognizes stale dynamic editor chunk failures', () => {
    expect(
      isDynamicImportError(
        new TypeError(
          'Failed to fetch dynamically imported module: https://client.rustytelephone.net/assets/editorWindow-old.js',
        ),
      ),
    ).toBe(true);
    expect(isDynamicImportError(new Error('Synthetic editor render failure'))).toBe(false);
  });

  it('renders a visible editor fallback for render failures', async () => {
    const router = createMemoryRouter(
      [
        {
          path: '/editor',
          element: <ThrowEditorRoute />,
          errorElement: <EditorRouteError />,
        },
      ],
      { initialEntries: ['/editor'] },
    );

    render(<RouterProvider router={router} />);

    expect(await screen.findByRole('heading', { name: 'Editor failed to load' })).toBeVisible();
    expect(screen.getByText('Synthetic editor render failure')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Reload' })).toBeVisible();
  });
});
