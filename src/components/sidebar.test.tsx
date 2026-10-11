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
  outside.focus();
  act(() => { ref.current?.switchToTab(2); });
  expect(screen.getByRole('tab', { name: 'Users' })).toHaveFocus();
  outside.focus();
  act(() => { ref.current?.switchToTab(2); });
  expect(screen.getByRole('tab', { name: 'Users' })).toHaveFocus();
  act(() => useRoomStore.getState().setRoomInfo({ num: 1, name: 'Room', exits: {} }));
  outside.focus();
  act(() => { ref.current?.switchToTab(2); });
  expect(screen.getByRole('tab', { name: 'Users' })).toHaveFocus();
  expect(screen.getByRole('tab', { name: 'Users' })).toHaveAttribute('aria-keyshortcuts', 'Control+Shift+3');
});
