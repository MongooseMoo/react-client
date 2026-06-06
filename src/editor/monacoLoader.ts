import { loader } from '@monaco-editor/react';
import monacoEditorPackage from 'monaco-editor/package.json';

let isConfigured = false;

export const MONACO_LOADER_VS_PATH = `https://cdn.jsdelivr.net/npm/monaco-editor@${monacoEditorPackage.version}/min/vs`;

export function configureMonacoLoader() {
  if (isConfigured) {
    return;
  }

  loader.config({
    paths: {
      vs: MONACO_LOADER_VS_PATH,
    },
  });
  isConfigured = true;
}
