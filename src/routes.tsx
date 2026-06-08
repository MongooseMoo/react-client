import { useEffect } from 'react';
import type { RouteObject } from 'react-router-dom';
import { useRouteError } from 'react-router-dom';
import App from './App';

export const routes: RouteObject[] = [
  { path: '/', element: <App /> },
  {
    path: '/editor',
    errorElement: <EditorRouteError />,
    lazy: async () => {
      const { default: EditorWindow } = await import('./components/editor/editorWindow');

      return { Component: EditorWindow };
    },
  },
];

const EDITOR_CHUNK_RELOAD_PREFIX = 'mongoose-editor-chunk-reload';

export function EditorRouteError() {
  const error = useRouteError();
  const message = routeErrorMessage(error);
  const shouldReload = isDynamicImportError(error);

  useEffect(() => {
    if (!shouldReload) {
      return;
    }

    const reloadKey = `${EDITOR_CHUNK_RELOAD_PREFIX}:${window.location.pathname}`;
    if (sessionStorage.getItem(reloadKey) === '1') {
      return;
    }

    sessionStorage.setItem(reloadKey, '1');
    window.location.reload();
  }, [shouldReload]);

  return (
    <main aria-labelledby="editor-error-title" className="route-error route-error-editor">
      <h1 id="editor-error-title">{shouldReload ? 'Updating editor' : 'Editor failed to load'}</h1>
      <p>
        {shouldReload
          ? 'The editor bundle changed while this browser tab was open.'
          : 'The editor stopped before it could finish rendering.'}
      </p>
      {!shouldReload ? <pre>{message}</pre> : null}
      <div className="route-error-actions">
        <button type="button" onClick={() => window.location.reload()}>
          Reload
        </button>
        <button type="button" onClick={() => window.close()}>
          Close
        </button>
      </div>
    </main>
  );
}

export function isDynamicImportError(error: unknown): boolean {
  const message = routeErrorMessage(error).toLowerCase();

  return (
    message.includes('failed to fetch dynamically imported module') ||
    message.includes('error loading dynamically imported module') ||
    message.includes('importing a module script failed') ||
    message.includes('loading chunk') ||
    message.includes('chunkloaderror')
  );
}

function routeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Unknown editor error';
}
