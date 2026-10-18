import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import Sidebar, { type SidebarRef } from './sidebar';
import type MudClient from '../client';
import { useRoomStore } from '../stores/roomStore';
import { useItemsStore } from '../stores/itemsStore';
import { usePreferences } from '../stores/preferencesStore';

vi.mock('./AudioChatBoundary', () => ({ default: () => <span>Audio controls</span> }));
vi.mock('./ServerFeaturesPanel', () => ({ default: () => <span>Server information</span> }));
vi.mock('./AudioDiagnostics', () => ({ default: () => <span>Diagnostics</span> }));
vi.mock('./HelpPanel', () => ({ default: () => <span>Help contents</span> }));
vi.mock('./TimersPanel', () => ({ default: () => <span>Timer contents</span> }));
vi.mock('./MapPanel', () => ({ default: () => <span>Map contents</span> }));
vi.mock('./SharedMediaPanel', () => ({ default: () => <span>Shared media contents</span> }));
vi.mock('./MusicComposer', () => ({ default: () => <span>Music composer contents</span> }));

beforeEach(() => {
  useRoomStore.getState().reset();
  useItemsStore.getState().reset();
  usePreferences.setState({ midi: { enabled: false }, haptics: { enabled: false, intensityCap: 1, autoStopTimeout: 30 } });
});

it('reaches active destinations repeatedly and keeps shortcut positions stable as tabs arrive', () => {
  const ref = React.createRef<SidebarRef>();
  const client = { connected: false, gmcp: { handlers: {} }, media: { diagnostics: {} }, onFileTransferOffer: () => () => {} } as unknown as MudClient;
  render(<><button type="button">Elsewhere</button><Sidebar ref={ref} client={client} collapsed={false} onToggleCollapse={vi.fn()} /></>);
  expect(screen.getByRole('tablist', { name: 'Sidebar' })).toBeTruthy();
  const outside = screen.getByRole('button', { name: 'Elsewhere' });
  const usersPanel = () => screen.getByRole('tabpanel', { name: 'Users' });
  outside.focus();
  act(() => { ref.current?.switchToTab(2); });
  expect(usersPanel()).toContainElement(document.activeElement as HTMLElement);
  outside.focus();
  act(() => { ref.current?.switchToTab(2); });
  expect(usersPanel()).toContainElement(document.activeElement as HTMLElement);
  act(() => useRoomStore.getState().setRoomInfo({ num: 1, name: 'Room', exits: {} }));
  outside.focus();
  act(() => { ref.current?.switchToTab(2); });
  expect(usersPanel()).toContainElement(document.activeElement as HTMLElement);
  expect(screen.getByRole('tab', { name: 'Users' })).toHaveAttribute('aria-keyshortcuts', 'Control+Shift+3');
});

it('keeps Map and Help shortcut positions and appends Timers, Media and Music without number shortcuts', async () => {
  const client = { connected: false, gmcp: { handlers: {} }, media: { diagnostics: {} }, onFileTransferOffer: () => () => {} } as unknown as MudClient;
  act(() => useRoomStore.getState().setRoomInfo({ num: 1, name: 'Room', exits: {} }));
  render(<Sidebar client={client} collapsed={false} onToggleCollapse={vi.fn()} />);
  expect(screen.getByRole('tab', { name: 'Map', exact: true })).toHaveAttribute('aria-keyshortcuts', 'Control+Shift+0');
  for (const name of ['Help', 'Timers', 'Media', 'Music']) expect(screen.getByRole('tab', { name, exact: true })).not.toHaveAttribute('aria-keyshortcuts');
  expect(screen.queryByText('Music composer contents')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('tab', { name: 'Help', exact: true }));
  expect(await screen.findByText('Help contents')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('tab', { name: 'Timers', exact: true }));
  expect(await screen.findByText('Timer contents')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('tab', { name: 'Media', exact: true }));
  expect(await screen.findByText('Shared media contents')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('tab', { name: 'Music', exact: true }));
  expect(await screen.findByText('Music composer contents')).toBeInTheDocument();
});
