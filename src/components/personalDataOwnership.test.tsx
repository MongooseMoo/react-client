import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createRef } from 'react';
import type MudClient from '../client';
import { usePersonalDataStore, personalStorageKey } from '../stores/personalDataStore';
import { useOutputStore } from '../stores/outputStore';
import { useInputStore } from '../stores/inputStore';
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
  usePersonalDataStore.setState({ owner: undefined, visitor: false });
  useOutputStore.getState().reset();
  useInputStore.getState().clear();
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });

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
