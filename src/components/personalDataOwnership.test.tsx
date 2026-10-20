import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createRef } from 'react';
import { announce } from '@react-aria/live-announcer';
import type MudClient from '../client';
import { usePersonalDataStore, personalStorageKey } from '../stores/personalDataStore';
import { useOutputStore } from '../stores/outputStore';
import { useInputStore } from '../stores/inputStore';
import { useConnectionStore } from '../stores/connectionStore';
import Output from './output';
import CommandInput from './input';

vi.mock('@react-aria/live-announcer', () => ({ announce: vi.fn() }));
const a = { runtime: 'live:fixture', playerUuid: 'player-a', playerRef: '#101' };
const b = { ...a, playerUuid: 'player-b', playerRef: '#102' };

beforeEach(() => {
  const values = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
    clear: () => values.clear(),
  });
  localStorage.clear();
  usePersonalDataStore.setState({ policyReady: true, owner: undefined, reconnectingOwner: undefined, visitor: false, visitorWindow: false });
  useOutputStore.getState().reset();
  useInputStore.getState().clear();
  useConnectionStore.getState().reset();
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.useRealTimers(); vi.unstubAllGlobals(); });

it('restores the same owner history after repeated reconnects, including queued output', async () => {
  usePersonalDataStore.getState().confirm(a);
  render(<Output client={{} as MudClient} />);
  await act(async () => useOutputStore.getState().addMessage('Before the disconnect'));
  for (let reconnect = 0; reconnect < 2; reconnect++) {
    await act(async () => {
      useOutputStore.getState().addMessage(`Last line ${reconnect}`);
      usePersonalDataStore.getState().clearForConnect();
    });
    expect(screen.queryByText('Before the disconnect')).not.toBeInTheDocument();
    await act(async () => usePersonalDataStore.getState().confirm(a));
    expect(screen.getAllByText('Before the disconnect')).toHaveLength(1);
    expect(screen.getAllByText(`Last line ${reconnect}`)).toHaveLength(1);
  }
});

it('restores a visitor history after reconnect without persisting it', async () => {
  usePersonalDataStore.setState({ visitor: true, visitorWindow: true });
  usePersonalDataStore.getState().confirm(a);
  render(<Output client={{} as MudClient} />);
  await act(async () => useOutputStore.getState().addMessage('Visitor history'));
  await act(async () => usePersonalDataStore.getState().clearForConnect());
  await act(async () => usePersonalDataStore.getState().confirm(a));
  expect(screen.getAllByText('Visitor history')).toHaveLength(1);
  expect(localStorage.getItem(`mongoose:personal:v2:output:${JSON.stringify([a.runtime, a.playerUuid, a.playerRef])}`)).toBeNull();
});

it('restores the same owner history when browser storage is unavailable', async () => {
  vi.spyOn(localStorage, 'setItem').mockImplementation(() => { throw new DOMException('Storage disabled', 'SecurityError'); });
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  usePersonalDataStore.getState().confirm(a);
  render(<Output client={{} as MudClient} />);
  await act(async () => useOutputStore.getState().addMessage('Memory-only history'));
  await act(async () => usePersonalDataStore.getState().clearForConnect());
  await act(async () => usePersonalDataStore.getState().clearForConnect());
  await act(async () => usePersonalDataStore.getState().confirm(a));
  expect(screen.getAllByText('Memory-only history')).toHaveLength(1);
});

it.each([
  ['different player', () => usePersonalDataStore.getState().confirm(b)],
  ['recycled player', () => usePersonalDataStore.getState().confirm({ ...a, playerUuid: 'replacement' })],
  ['different server', () => usePersonalDataStore.getState().confirm({ ...a, runtime: 'other-server' })],
  ['sign-out', () => { usePersonalDataStore.getState().clear(); usePersonalDataStore.getState().confirm(a); }],
  ['visitor transition', () => { usePersonalDataStore.getState().setVisitor(false); usePersonalDataStore.getState().confirm(a); }],
])('discards the reconnect snapshot on %s', async (_label, transition) => {
  usePersonalDataStore.setState({ visitor: true, visitorWindow: true });
  usePersonalDataStore.getState().confirm(a);
  render(<Output client={{} as MudClient} />);
  await act(async () => useOutputStore.getState().addMessage('Private visitor log'));
  await act(async () => usePersonalDataStore.getState().clearForConnect());
  expect(screen.queryByText('Private visitor log')).not.toBeInTheDocument();
  await act(async () => transition());
  expect(screen.queryByText('Private visitor log')).not.toBeInTheDocument();
  // Even selecting A again cannot recover a snapshot discarded by a transition.
  await act(async () => usePersonalDataStore.getState().confirm(a));
  expect(screen.queryByText('Private visitor log')).not.toBeInTheDocument();
});

it('saves restored output for reload without replaying or reannouncing history', async () => {
  usePersonalDataStore.getState().confirm(a);
  const view = render(<Output client={{} as MudClient} />);
  await act(async () => {
    for (let line = 0; line < Output.LIVE_WINDOW_SIZE + 5; line++) {
      useOutputStore.getState().addMessage(`Retained line ${line}`);
    }
    useOutputStore.getState().addMessage('Provisional away line', true);
  });
  vi.mocked(announce).mockClear();
  await act(async () => usePersonalDataStore.getState().clearForConnect());
  await act(async () => usePersonalDataStore.getState().confirm(a));
  await act(async () => useConnectionStore.getState().setSessionReady(true));
  expect(screen.queryByText('Provisional away line')).not.toBeInTheDocument();
  expect(announce).not.toHaveBeenCalled();
  await act(async () => useOutputStore.getState().addMessage('Authoritative away line'));
  expect(announce).toHaveBeenCalledTimes(1);
  expect(screen.getAllByText('Retained line 0')).toHaveLength(1);
  expect(screen.getAllByText('Authoritative away line')).toHaveLength(1);
  view.unmount();
  useOutputStore.getState().reset();
  usePersonalDataStore.getState().clearForConnect();
  usePersonalDataStore.getState().confirm(a);
  vi.mocked(announce).mockClear();
  render(<Output client={{} as MudClient} />);
  expect(screen.getAllByText('Retained line 0')).toHaveLength(1);
  expect(screen.getAllByText('Authoritative away line')).toHaveLength(1);
  expect(screen.queryByText('Provisional away line')).not.toBeInTheDocument();
  expect(announce).not.toHaveBeenCalled();
});

it('does not restore a visitor log explicitly cleared during reconnect', async () => {
  usePersonalDataStore.setState({ visitor: true, visitorWindow: true });
  usePersonalDataStore.getState().confirm(a);
  const output = createRef<Output>();
  render(<Output client={{} as MudClient} ref={output} />);
  await act(async () => useOutputStore.getState().addMessage('Explicitly cleared visitor log'));
  await act(async () => usePersonalDataStore.getState().clearForConnect());
  await act(async () => output.current?.clearLog());
  await act(async () => usePersonalDataStore.getState().confirm(a));
  expect(screen.queryByText('Explicitly cleared visitor log')).not.toBeInTheDocument();
});

it('clears persisted owner history during reconnect without touching another owner', async () => {
  vi.useFakeTimers();
  usePersonalDataStore.getState().confirm(b);
  const output = createRef<Output>();
  const view = render(<Output client={{} as MudClient} ref={output} />);
  await act(async () => useOutputStore.getState().addMessage('B saved log'));
  await act(async () => usePersonalDataStore.getState().confirm(a));
  const bKey = personalStorageKey('output', b) ?? '';
  const aKey = personalStorageKey('output', a) ?? '';
  await act(async () => useOutputStore.getState().addMessage('A explicitly cleared log'));
  await act(async () => usePersonalDataStore.getState().clearForConnect());
  expect(localStorage.getItem(aKey)).toContain('A explicitly cleared log');
  await act(async () => output.current?.clearLog());
  await act(async () => vi.advanceTimersByTime(600));
  await act(async () => usePersonalDataStore.getState().confirm(a));
  expect(screen.queryByText('A explicitly cleared log')).not.toBeInTheDocument();
  expect(localStorage.getItem(aKey) ?? '').not.toContain('A explicitly cleared log');
  expect(localStorage.getItem(bKey)).toContain('B saved log');
  await act(async () => usePersonalDataStore.getState().confirm(b));
  expect(screen.getAllByText('B saved log')).toHaveLength(1);
  await act(async () => usePersonalDataStore.getState().confirm(a));
  view.unmount();
  useOutputStore.getState().reset();
  usePersonalDataStore.getState().clearForConnect();
  usePersonalDataStore.getState().confirm(a);
  render(<Output client={{} as MudClient} />);
  expect(screen.queryByText('A explicitly cleared log')).not.toBeInTheDocument();
  expect(screen.queryByText('B saved log')).not.toBeInTheDocument();
});

it('leaves legacy output and login commands unattributed before authentication', async () => {
  localStorage.setItem('outputLog', JSON.stringify({ version: 2, data: [{
    type: 'serverMessage', sourceType: 'plain', sourceContent: 'Legacy speech',
  }] }));
  localStorage.setItem('command_history', JSON.stringify(['Legacy command']));
  const originalOutput = localStorage.getItem('outputLog');
  render(<><Output client={{} as MudClient} /><CommandInput onSend={() => {}} inputRef={createRef()} /></>);
  expect(screen.queryByText('Legacy speech')).not.toBeInTheDocument();
  const input = screen.getByRole('textbox', { name: 'Command' });
  fireEvent.input(input, { target: { value: 'authentication input' } });
  fireEvent.keyDown(input, { key: 'Enter' });
  fireEvent.keyDown(input, { key: 'ArrowUp' });
  expect(input).toHaveValue('');
  expect(localStorage.getItem('command_history')).toBe(JSON.stringify(['Legacy command']));
  await act(async () => usePersonalDataStore.getState().confirm(a));
  expect(screen.queryByText('Legacy speech')).not.toBeInTheDocument();
  expect(localStorage.getItem('outputLog')).toBe(originalOutput);
});

it('fences pending saves and restores only the selected character output', async () => {
  vi.useFakeTimers();
  usePersonalDataStore.getState().confirm(a);
  render(<Output client={{} as MudClient} />);
  await act(async () => useOutputStore.getState().addMessage('Owned by A'));
  await act(async () => usePersonalDataStore.getState().confirm(b));
  expect(screen.queryByText('Owned by A')).not.toBeInTheDocument();
  await act(async () => useOutputStore.getState().addMessage('Owned by B'));
  await act(async () => vi.advanceTimersByTime(600));
  expect(localStorage.getItem(personalStorageKey('output', a) ?? '')).toContain('Owned by A');
  expect(localStorage.getItem(personalStorageKey('output', b) ?? '')).not.toContain('Owned by A');
  await act(async () => usePersonalDataStore.getState().confirm(a));
  expect(screen.getByText('Owned by A')).toBeInTheDocument();
  expect(screen.queryByText('Owned by B')).not.toBeInTheDocument();
});

it('partitions recall and keeps visitor commands out of saved history', async () => {
  usePersonalDataStore.getState().confirm(a);
  render(<CommandInput onSend={() => {}} inputRef={createRef()} />);
  const input = screen.getByRole('textbox', { name: 'Command' });
  const send = (value: string) => {
    fireEvent.input(input, { target: { value } });
    fireEvent.keyDown(input, { key: 'Enter' });
  };
  send('look as A');
  await act(async () => usePersonalDataStore.getState().confirm(b));
  fireEvent.keyDown(input, { key: 'ArrowUp' });
  expect(input).toHaveValue('');
  send('look as B');
  const bKey = personalStorageKey('commands', b) ?? '';
  await act(async () => usePersonalDataStore.getState().setVisitor(true));
  send('visitor command');
  expect(localStorage.getItem(bKey)).toContain('look as B');
  expect(localStorage.getItem(bKey)).not.toContain('visitor command');
  await act(async () => usePersonalDataStore.getState().setVisitor(false));
  await act(async () => usePersonalDataStore.getState().confirm(a));
  fireEvent.keyDown(input, { key: 'ArrowUp' });
  expect(input).toHaveValue('look as A');
});
