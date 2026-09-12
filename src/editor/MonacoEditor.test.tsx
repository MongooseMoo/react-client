import { act, render, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import MonacoEditor from './MonacoEditor';

const mock = vi.hoisted(() => {
  const subscription = { dispose: vi.fn() };
  const model = {
    getValue: vi.fn(() => 'newer typing'), dispose: vi.fn(),
    onDidChangeContent: vi.fn((_callback: () => void) => subscription),
  };
  const editor = { dispose: vi.fn(), updateOptions: vi.fn(), getModel: () => model };
  const api = {
    Uri: { parse: (path: string) => path },
    editor: { create: vi.fn(() => editor), createModel: vi.fn(() => model), setModelLanguage: vi.fn(), setTheme: vi.fn() },
  };
  return { subscription, model, editor, api, init: vi.fn(), cancel: vi.fn() };
});
vi.mock('@monaco-editor/loader', () => ({ default: { init: mock.init, config: vi.fn() } }));

const props = () => ({
  defaultValue: 'initial', path: 'moo://test', language: 'moo', theme: 'dark', height: '80vh',
  options: {}, wrapperProps: { 'aria-describedby': 'status' },
  beforeMount: vi.fn(), onMount: vi.fn(), onChange: vi.fn(),
});

beforeEach(() => {
  vi.clearAllMocks();
  mock.init.mockImplementation(() => Object.assign(Promise.resolve(mock.api), { cancel: mock.cancel }));
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
