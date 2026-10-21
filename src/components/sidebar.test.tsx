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
vi.mock('./MapPanel', () => ({ default: () => <span>Map contents</span> }));
vi.mock('./MidiStatus', () => ({ default: () => <span>MIDI contents</span> }));

const client = { connected: false, gmcp: { handlers: {} }, media: { diagnostics: {} }, onFileTransferOffer: () => () => {} } as unknown as MudClient;

beforeEach(() => {
  useRoomStore.getState().reset();
  useItemsStore.getState().reset();
  usePreferences.setState({ midi: { enabled: false }, haptics: { enabled: false, intensityCap: 1, autoStopTimeout: 30 } });
});

it('reaches active destinations repeatedly and keeps shortcut positions stable as tabs arrive', () => {
  const ref = React.createRef<SidebarRef>();
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

it('does not mount the MIDI panel, which initializes Web MIDI, until its tab is selected', async () => {
  usePreferences.setState({ midi: { enabled: true } });
  render(<Sidebar client={client} collapsed={false} onToggleCollapse={vi.fn()} />);
  await act(async () => { await import('./MidiStatus'); });
  expect(screen.queryByText('MIDI contents')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('tab', { name: 'MIDI' }));
  expect(await screen.findByText('MIDI contents')).toBeInTheDocument();
});

it('puts Help last, after Map, with no number shortcut of its own', async () => {
  act(() => useRoomStore.getState().setRoomInfo({ num: 1, name: 'Room', exits: {} }));
  render(<Sidebar client={client} collapsed={false} onToggleCollapse={vi.fn()} />);
  const tabs = screen.getAllByRole('tab');
  expect(tabs.at(-2)).toHaveAttribute('aria-keyshortcuts', 'Control+Shift+0');
  expect(tabs.at(-1)).toHaveAccessibleName('Help');
  expect(tabs.at(-1)).not.toHaveAttribute('aria-keyshortcuts');
  fireEvent.click(tabs.at(-1) as HTMLElement);
  expect(await screen.findByText('Help contents')).toBeInTheDocument();
});
