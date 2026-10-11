import loader from '@monaco-editor/loader';
import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { configureMonacoLoader } from './monacoLoader';

type Props = {
  defaultValue: string;
  path: string;
  language: string;
  theme: string;
  height: string;
  options: Monaco.editor.IStandaloneEditorConstructionOptions;
  ariaDescribedBy: string;
  beforeMount: (monaco: typeof Monaco) => void;
  onMount: (editor: Monaco.editor.IStandaloneCodeEditor, monaco: typeof Monaco) => void;
  onChange: (value: string) => void;
};

// Monaco owns live text. Only a new document creates a model; rendering a
// notification of an edit must never write an older snapshot back into it.
export default function MonacoEditor(props: Props) {
  const container = useRef<HTMLDivElement>(null);
  const latest = useRef(props);
  latest.current = props;
  const instance = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const api = useRef<typeof Monaco | null>(null);
  const [failure, setFailure] = useState<Error | null>(null);
  const describeInputs = useRef<(() => void) | null>(null);

  useEffect(() => {
    configureMonacoLoader();
    let cancelled = false;
    let editor: Monaco.editor.IStandaloneCodeEditor | undefined;
    let model: Monaco.editor.ITextModel | undefined;
    let subscription: Monaco.IDisposable | undefined;
    let inputObserver: MutationObserver | undefined;
    let editorRoot: HTMLElement | null = null;
    const syncDescription = () => {
      const surfaces = editorRoot?.querySelectorAll<HTMLElement>('[role="textbox"], textarea') ?? [];
      for (const surface of surfaces) {
        surface.setAttribute('aria-describedby', latest.current.ariaDescribedBy);
      }
      if (editorRoot?.matches('[role="textbox"]')) {
        editorRoot.setAttribute('aria-describedby', latest.current.ariaDescribedBy);
      }
    };
    const dispose = () => {
      inputObserver?.disconnect();
      editorRoot?.removeEventListener('focusin', syncDescription);
      if (describeInputs.current === syncDescription) describeInputs.current = null;
      subscription?.dispose();
      editor?.dispose();
      model?.dispose();
      if (instance.current === editor) instance.current = null;
      subscription = undefined;
      editor = undefined;
      model = undefined;
    };
    const loading = loader.init();
    void loading.then((monaco) => {
      if (cancelled || !container.current) return;
      const current = latest.current;
      api.current = monaco;
      current.beforeMount(monaco);
      model = monaco.editor.createModel(current.defaultValue, current.language,
        monaco.Uri.parse(props.path));
      editor = monaco.editor.create(container.current, {
        ...current.options, automaticLayout: true, model, theme: current.theme,
      });
      instance.current = editor;
      editorRoot = editor.getDomNode();
      describeInputs.current = syncDescription;
      syncDescription();
      if (editorRoot) {
        // Monaco can replace its DIV/textarea focus surface when accessibility
        // support changes. Describe the actual inputs, never a generic wrapper
        // or the complete growing problems list.
        inputObserver = new MutationObserver(syncDescription);
        inputObserver.observe(editorRoot, { childList: true, subtree: true, attributes: true, attributeFilter: ['role'] });
        editorRoot.addEventListener('focusin', syncDescription);
      }
      const ownedModel = model;
      subscription = model.onDidChangeContent(() => latest.current.onChange(ownedModel.getValue()));
      current.onMount(editor, monaco);
    }).catch((error: unknown) => {
      if (cancelled) return;
      dispose();
      setFailure(error instanceof Error ? error : new Error(String(error)));
    });
    return () => {
      cancelled = true;
      loading.cancel();
      dispose();
    };
  }, [props.path]);

  useLayoutEffect(() => {
    instance.current?.updateOptions(props.options);
  }, [props.options]);

  useLayoutEffect(() => { describeInputs.current?.(); }, [props.ariaDescribedBy]);

  useLayoutEffect(() => {
    const model = instance.current?.getModel();
    if (model) api.current?.editor.setModelLanguage(model, props.language);
    if (instance.current) api.current?.editor.setTheme(props.theme);
  }, [props.language, props.theme]);

  if (failure) throw failure;
  return <div ref={container} style={{ height: props.height }} />;
}
