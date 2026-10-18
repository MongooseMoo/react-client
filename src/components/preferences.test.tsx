import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import Preferences from './preferences';
import { usePreferences } from '../stores/preferencesStore';

vi.mock('../hooks/useVoices', () => ({ useVoices: () => [] }));
vi.mock('./AutoLogDialog', () => ({ default: () => null }));

beforeEach(() => {
  usePreferences.setState(usePreferences.getInitialState(), true);
  vi.stubGlobal('speechSynthesis', { cancel: vi.fn(), getVoices: () => [] });
});
afterEach(() => cleanup());

it('allows clearing and replacing a storage cap, committing only a valid completed edit', async () => {
  render(<Preferences />);
  fireEvent.click(screen.getByRole('tab', { name: 'Logging' }));
  const cap = screen.getByRole('spinbutton', { name: 'Storage Cap (MB):' });
  const original = usePreferences.getState().autologging.maxBytes;
  await act(async () => fireEvent.input(cap, { target: { value: '' } }));
  expect(cap).toHaveValue(null);
  expect(usePreferences.getState().autologging.maxBytes).toBe(original);
  await act(async () => fireEvent.input(cap, { target: { value: '2500' } }));
  fireEvent.blur(cap);
  expect(cap).toHaveAttribute('aria-invalid', 'true');
  expect(cap).toHaveAccessibleDescription(/1.*2048/);
  expect(usePreferences.getState().autologging.maxBytes).toBe(original);
  await act(async () => fireEvent.input(cap, { target: { value: '30' } }));
  fireEvent.keyDown(cap, { key: 'Enter' });
  expect(usePreferences.getState().autologging.maxBytes).toBe(30 * 1024 * 1024);
  expect(cap).not.toHaveAttribute('aria-invalid', 'true');
});

it('retains the valid timeout through an invalid edit and accepts a replacement on blur', async () => {
  usePreferences.getState().setHaptics({ ...usePreferences.getState().haptics, enabled: true });
  render(<Preferences />);
  fireEvent.click(screen.getByRole('tab', { name: 'Haptics' }));
  const timeout = screen.getByRole('spinbutton', { name: 'Auto-Stop Timeout (seconds):' });
  const original = usePreferences.getState().haptics.autoStopTimeout;
  await act(async () => fireEvent.input(timeout, { target: { value: '90' } }));
  fireEvent.blur(timeout);
  expect(timeout).toHaveAttribute('aria-invalid', 'true');
  expect(usePreferences.getState().haptics.autoStopTimeout).toBe(original);
  await act(async () => fireEvent.input(timeout, { target: { value: '30' } }));
  fireEvent.blur(timeout);
  expect(usePreferences.getState().haptics.autoStopTimeout).toBe(30);
});

it('has a Keys section and lists Alt+Shift+K with the keyboard shortcuts', () => {
  render(<Preferences />);
  fireEvent.click(screen.getByRole('tab', { name: 'Keys' }));
  expect(screen.getByText(/No keys yet/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('tab', { name: 'Keyboard' }));
  expect(screen.getByText(/Alt\+Shift\+K turns keys mode on and off/)).toBeInTheDocument();
});

it('uses stable slider names and keeps disabled-feature help references valid', () => {
  render(<Preferences />);
  fireEvent.click(screen.getByRole('tab', { name: 'Speech' }));
  expect(screen.getByRole('slider', { name: 'Rate' })).toBeInTheDocument();
  expect(screen.getByRole('slider', { name: 'Pitch' })).toBeInTheDocument();
  expect(screen.getByRole('slider', { name: 'Volume' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('tab', { name: 'MIDI' }));
  expect(screen.getByRole('checkbox', { name: 'Enable MIDI' })).toHaveAccessibleDescription(/Device selection/);
  fireEvent.click(screen.getByRole('tab', { name: 'Haptics' }));
  expect(screen.getByRole('checkbox', { name: 'Enable Haptics' })).toHaveAccessibleDescription(/Bluetooth/);
});
