import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import type MudClient from '../client';
import HapticsStatus from './HapticsStatus';

const service = vi.hoisted(() => ({
  scan: vi.fn(), emergencyStop: vi.fn(), on: vi.fn(), off: vi.fn(),
  getCapabilities: () => ({ available: true, actuators: [], sensors: [] }),
}));
vi.mock('../HapticsService', () => ({ hapticsService: service }));
vi.mock('../stores/preferencesStore', () => ({
  usePreferences: (select: (state: unknown) => unknown) => select({ haptics: { enabled: true, intensityCap: 1, autoStopTimeout: 30 } }),
}));
beforeEach(() => {
  service.scan.mockReset();
  Object.defineProperty(navigator, 'bluetooth', { configurable: true, value: {} });
});

it('distinguishes cancelled pairing from failure and keeps the scan action usable', async () => {
  service.scan.mockRejectedValueOnce(new DOMException('No device selected', 'NotFoundError'));
  render(<HapticsStatus client={{} as MudClient} />);
  const button = screen.getByRole('button', { name: 'Scan for Devices' });
  button.focus();
  await act(async () => { fireEvent.click(button); });
  await screen.findByText('No device selected.');
  expect(document.activeElement).toBe(button);
  service.scan.mockRejectedValueOnce(new Error('Hardware failed'));
  fireEvent.click(button);
  await screen.findByText('Could not scan for devices. Check Bluetooth access and try again.');
  expect(document.activeElement).toBe(button);
  service.scan.mockResolvedValueOnce(undefined);
  fireEvent.click(button);
  await screen.findByText('Device scan finished.');
});
