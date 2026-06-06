import type { RouteObject } from 'react-router-dom';
import App from './App';

export const routes: RouteObject[] = [
  { path: '/', element: <App /> },
  {
    path: '/editor',
    lazy: async () => {
      const { default: EditorWindow } = await import('./components/editor/editorWindow');

      return { Component: EditorWindow };
    },
  },
];
