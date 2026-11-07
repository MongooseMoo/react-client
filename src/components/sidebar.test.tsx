import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import Sidebar, { type SidebarRef } from './sidebar';
import type MudClient from '../client';
import { useRoomStore } from '../stores/roomStore';
import { useItemsStore } from '../stores/itemsStore';
import { usePreferences } from '../stores/preferencesStore';
import { useTasksStore } from '../stores/tasksStore';
import { useConnectionStore } from '../stores/connectionStore';

vi.mock('./AudioChatBoundary', () => ({ default: () => <span>Audio controls</span> }));
vi.mock('./HelpPanel', () => ({ default: () => <span>Help contents</span> }));
vi.mock('./MapPanel', () => ({ default: () => <span>Map contents</span> }));
vi.mock('./MidiStatus', () => ({ default: () => <span>MIDI contents</span> }));
vi.mock('./inventory', () => ({ default: () => <span>Inventory contents</span> }));
vi.mock('./TasksPanel', () => ({ default: () => <span>Task controls</span> }));

const client = { connected: false, gmcp: { handlers: {} }, onFileTransferOffer: () => () => {} } as unknown as MudClient;

beforeEach(() => {
  useRoomStore.getState().reset();
  useItemsStore.getState().reset();
  useTasksStore.getState().reset();
  useConnectionStore.getState().reset();
  usePreferences.setState({ midi: { enabled: false }, haptics: { enabled: false, intensityCap: 1, autoStopTimeout: 30 } });
});

const shortcuts = () => screen.getAllByRole('tab').map((tab) => [tab.textContent, tab.getAttribute('aria-keyshortcuts')]);

it('offers Tasks after an empty initial list so tasks created later remain discoverable', async () => {
  const sendList = vi.fn();
  const taskClient = { ...client, gmcp: { handlers: { 'Client.Tasks': { sendList } } } } as unknown as MudClient;
  render(<Sidebar client={taskClient} collapsed={false} onToggleCollapse={vi.fn()} />);
  expect(screen.queryByRole('tab', { name: 'Tasks' })).not.toBeInTheDocument();
  act(() => useConnectionStore.getState().setSessionReady(true));
  expect(sendList).toHaveBeenCalledWith({});
  act(() => useTasksStore.getState().setList({ now: 1800000000, total: 0, groups: [] }));
  fireEvent.click(screen.getByRole('tab', { name: 'Tasks' }));
  expect(await screen.findByText('Task controls')).toBeInTheDocument();
});

it('numbers tabs by their place on screen, so a tab that arrives renumbers those after it', () => {
  const ref = React.createRef<SidebarRef>();
  render(<><button type="button">Elsewhere</button><Sidebar ref={ref} client={client} collapsed={false} onToggleCollapse={vi.fn()} /></>);
  expect(screen.getByRole('tablist', { name: 'Sidebar' })).toBeTruthy();
  const outside = screen.getByRole('button', { name: 'Elsewhere' });
  const usersPanel = () => screen.getByRole('tabpanel', { name: 'Users' });
  expect(screen.getByRole('tab', { name: 'Users' })).toHaveAttribute('aria-keyshortcuts', 'Control+Shift+1');
  outside.focus();
  act(() => { ref.current?.switchToTab(0); });
  expect(usersPanel()).toContainElement(document.activeElement as HTMLElement);
  outside.focus();
  act(() => { ref.current?.switchToTab(0); });
  expect(usersPanel()).toContainElement(document.activeElement as HTMLElement);

  act(() => useRoomStore.getState().setRoomInfo({ num: 1, name: 'Room', exits: {} }));
  expect(screen.getByRole('tab', { name: 'Users' })).toHaveAttribute('aria-keyshortcuts', 'Control+Shift+3');
  expect(ref.current?.indexOfTab('users-tab')).toBe(2);
  outside.focus();
  act(() => { ref.current?.switchToTab(2); });
  expect(usersPanel()).toContainElement(document.activeElement as HTMLElement);
  // Room, Map, Users, Help, Voice chat, Files, Photos, Properties, Apps.
  expect(ref.current?.hasTab(6)).toBe(true);
  expect(ref.current?.hasTab(8)).toBe(true);
  expect(ref.current?.hasTab(9)).toBe(false);
  expect(ref.current?.indexOfTab('midi-tab')).toBe(-1);
});

it('orders every tab by purpose and numbers them without gaps', () => {
  usePreferences.setState({ midi: { enabled: true }, haptics: { enabled: true, intensityCap: 1, autoStopTimeout: 30 } });
  useRoomStore.getState().setRoomInfo({ num: 1, name: 'Room', exits: {} });
  useItemsStore.getState().setLocationItems('inv', []);
  render(<Sidebar client={client} collapsed={false} onToggleCollapse={vi.fn()} />);
  expect(shortcuts()).toEqual([
    ['Room', 'Control+Shift+1'],
    ['Map', 'Control+Shift+2'],
    ['Inventory', 'Control+Shift+3'],
    ['Users', 'Control+Shift+4'],
    ['Help', 'Control+Shift+5'],
    ['Voice chat', 'Control+Shift+6'],
    ['Files', 'Control+Shift+7'],
    ['MIDI', 'Control+Shift+8'],
    ['Haptics', 'Control+Shift+9'],
    ['Photos', 'Control+Shift+0'],
    ['Properties', null],
    ['Apps', null],
  ]);
});

it('does not mount the MIDI panel, which initializes Web MIDI, until its tab is selected', async () => {
  usePreferences.setState({ midi: { enabled: true } });
  render(<Sidebar client={client} collapsed={false} onToggleCollapse={vi.fn()} />);
  await act(async () => { await import('./MidiStatus'); });
  expect(screen.queryByText('MIDI contents')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('tab', { name: 'MIDI' }));
  expect(await screen.findByText('MIDI contents')).toBeInTheDocument();
});

it('loads Help when its tab is selected', async () => {
  render(<Sidebar client={client} collapsed={false} onToggleCollapse={vi.fn()} />);
  fireEvent.click(screen.getByRole('tab', { name: 'Help' }));
  expect(await screen.findByText('Help contents')).toBeInTheDocument();
});
