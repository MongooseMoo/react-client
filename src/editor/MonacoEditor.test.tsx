import { act, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import MonacoEditor from './MonacoEditor';

const mock = vi.hoisted(() => {
  const subscription = { dispose: vi.fn() };
  const model = {
    getValue: vi.fn(() => 'newer typing'), dispose: vi.fn(),
    onDidChangeContent: vi.fn((_callback: () => void) => subscription),
  };
  const editor = { dispose: vi.fn(), updateOptions: vi.fn(), getModel: () => model,
    getDomNode: vi.fn() };
  const api = {
    Uri: { parse: (path: string) => path },
    editor: { create: vi.fn(() => editor), createModel: vi.fn(() => model), setModelLanguage: vi.fn(), setTheme: vi.fn() },
  };
  return { subscription, model, editor, api, init: vi.fn(), cancel: vi.fn() };
});
vi.mock('@monaco-editor/loader', () => ({ default: { init: mock.init, config: vi.fn() } }));

const props = () => ({
  defaultValue: 'initial', path: 'moo://test', language: 'moo', theme: 'dark', height: '80vh',
  options: {}, ariaDescribedBy: 'status',
  beforeMount: vi.fn(), onMount: vi.fn(), onChange: vi.fn(),
});

beforeEach(() => {
  vi.clearAllMocks();
  mock.init.mockImplementation(() => Object.assign(Promise.resolve(mock.api), { cancel: mock.cancel }));
  mock.api.editor.create.mockImplementation((container: HTMLElement) => {
    const textbox = document.createElement('div');
    textbox.className = 'native-edit-context';
    textbox.setAttribute('role', 'textbox');
    textbox.setAttribute('aria-label', 'Code');
    textbox.tabIndex = 0;
    container.appendChild(textbox);
    mock.editor.getDomNode.mockReturnValue(container);
    return mock.editor;
  });
});

it('describes the actual DIV textbox and newly created input surfaces with concise context', async () => {
  const initial = props();
  const view = render(<><p id="status">Saved, 1 error</p><MonacoEditor {...initial} /></>);
  await waitFor(() => expect(screen.getByRole('textbox', { name: 'Code' })).toHaveAccessibleDescription('Saved, 1 error'));
  const root = mock.editor.getDomNode();
  const old = screen.getByRole('textbox', { name: 'Code' });
  await act(async () => {
    old.remove();
    const textarea = document.createElement('textarea');
    textarea.className = 'inputarea';
    textarea.setAttribute('aria-label', 'Code');
    root.appendChild(textarea);
  });
  expect(screen.getByRole('textbox', { name: 'Code' })).toHaveAccessibleDescription('Saved, 1 error');
  view.unmount();
});

it('preserves native descriptions and leaves Find input context alone', async () => {
  const initial = props();
  const view = render(<><p id="status">Saved</p><p id="native-help">Code help</p><p id="find-help">Find help</p><MonacoEditor {...initial} /></>);
  await waitFor(() => expect(initial.onMount).toHaveBeenCalledOnce());
  const code = screen.getByRole('textbox', { name: 'Code' });
  const find = document.createElement('textarea');
  find.setAttribute('aria-label', 'Find');
  find.setAttribute('aria-describedby', 'find-help');
  await act(async () => {
    code.setAttribute('aria-describedby', 'native-help status');
    mock.editor.getDomNode().appendChild(find);
    find.focus();
  });
  expect(find).toHaveAccessibleDescription('Find help');
  expect(code).toHaveAccessibleDescription('Code help Saved');
  view.rerender(<><p id="next-status">Modified</p><p id="native-help">Code help</p><p id="find-help">Find help</p><MonacoEditor {...initial} ariaDescribedBy="next-status" /></>);
  expect(code).toHaveAccessibleDescription('Code help Modified');
  expect(find).toHaveAccessibleDescription('Find help');
});

it('reports model changes without writing render snapshots back into the model', async () => {
  const initial = props();
  const view = render(<MonacoEditor {...initial} />);
  await waitFor(() => expect(initial.onMount).toHaveBeenCalledOnce());
  const onChange = vi.fn();
  view.rerender(<MonacoEditor {...initial} defaultValue="stale echo" onChange={onChange} />);
  const listener = mock.model.onDidChangeContent.mock.calls[0][0] as () => void;
  act(listener);
  expect(onChange).toHaveBeenCalledWith('newer typing');
  expect(mock.api.editor.createModel).toHaveBeenCalledOnce();
  expect(mock.api.editor.createModel).toHaveBeenCalledWith('initial', 'moo', 'moo://test');
  view.unmount();
  expect(mock.subscription.dispose).toHaveBeenCalledOnce();
  expect(mock.editor.dispose).toHaveBeenCalledOnce();
  expect(mock.model.dispose).toHaveBeenCalledOnce();
});

it('does not create an editor when loading finishes after unmount', async () => {
  let finish!: (api: typeof mock.api) => void;
  mock.init.mockReturnValue(Object.assign(new Promise((resolve) => { finish = resolve; }), { cancel: mock.cancel }));
  const view = render(<MonacoEditor {...props()} />);
  view.unmount();
  await act(async () => finish(mock.api));
  expect(mock.cancel).toHaveBeenCalledOnce();
  expect(mock.api.editor.createModel).not.toHaveBeenCalled();
});

it('disposes the previous document before creating another model', async () => {
  const initial = props();
  const view = render(<MonacoEditor {...initial} />);
  await waitFor(() => expect(initial.onMount).toHaveBeenCalledOnce());
  view.rerender(<MonacoEditor {...initial} path="moo://second" defaultValue="second" />);
  await waitFor(() => expect(mock.api.editor.createModel).toHaveBeenCalledTimes(2));
  expect(mock.model.dispose).toHaveBeenCalledOnce();
  expect(mock.api.editor.createModel).toHaveBeenLastCalledWith('second', 'moo', 'moo://second');
  expect(mock.model.dispose.mock.invocationCallOrder[0]).toBeLessThan(mock.api.editor.createModel.mock.invocationCallOrder[1]);
});
