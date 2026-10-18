import { Component, lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import App from './App';

const EditorWindow = lazy(() => import('./components/editor/editorWindow'));

export function AppRoutes() {
  const [location, setLocation] = useState(() => window.location.href);
  useEffect(() => {
    const update = () => setLocation(window.location.href);
    window.addEventListener('popstate', update);
    return () => window.removeEventListener('popstate', update);
  }, []);
  const url = new URL(location);
  const path = url.pathname.replace(/\/+$/, '').toLowerCase() || '/';
  if (path === '/') return <App />;
  if (path === '/editor') {
    return <EditorErrorBoundary key={url.pathname + url.search}>
      <Suspense fallback={<p role="status">Loading editor…</p>}>
        <EditorWindow search={url.search} />
      </Suspense>
    </EditorErrorBoundary>;
  }
  return <main><h1>Page not found</h1><a href="/">Return to client</a></main>;
}

export class EditorErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean; error: unknown }> {
  state = { failed: false, error: undefined as unknown };
  static getDerivedStateFromError(error: unknown) {
    return { failed: true, error };
  }
  render() {
    return this.state.failed ? <EditorRouteError error={this.state.error} /> : this.props.children;
  }
}

const EDITOR_CHUNK_RELOAD_PREFIX = 'mongoose-editor-chunk-reload';

export function EditorRouteError({ error }: { error: unknown }) {
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
