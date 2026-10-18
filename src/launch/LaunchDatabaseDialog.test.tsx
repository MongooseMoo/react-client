import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LaunchDatabaseDialog from './LaunchDatabaseDialog';
import { useLaunchStore } from './launchStore';

const world = new File(['moo'], 'World.db');
const open = vi.fn();

beforeEach(() => {
  open.mockReset();
  window.open = open;
  useLaunchStore.setState({ database: undefined, confirmedDatabase: undefined, hostWaiting: false });
});

function offer(hostWaiting: boolean) {
  render(<LaunchDatabaseDialog />);
  act(() => useLaunchStore.setState({ database: world, hostWaiting }));
}

describe('LaunchDatabaseDialog', () => {
  it('asks before hosting an opened database', () => {
    offer(true);
    const dialog = screen.getByRole('dialog', { name: 'Host World.db?' });
    expect(dialog).toHaveAttribute('open');
    expect(dialog).toHaveAccessibleDescription(/in this window/);
    expect(useLaunchStore.getState().confirmedDatabase).toBeUndefined();
  });

  it('hosts in this window when it is waiting for a database', () => {
    offer(true);
    fireEvent.click(screen.getByRole('button', { name: 'Host' }));
    expect(useLaunchStore.getState().confirmedDatabase).toBe(world);
    expect(useLaunchStore.getState().database).toBeUndefined();
    expect(open).not.toHaveBeenCalled();
  });

  it('opens a host window otherwise, naming the stored database', async () => {
    open.mockReturnValue({});
    offer(false);
    fireEvent.click(screen.getByRole('button', { name: 'Host' }));
    await waitFor(() => expect(open).toHaveBeenCalledOnce());
    const url = new URL(open.mock.calls[0][0]);
    expect(url.searchParams.get('mode')).toBe('host');
    expect(url.searchParams.get('hostDatabase')).toBeTruthy();
    expect(useLaunchStore.getState().confirmedDatabase).toBeUndefined();
    await waitFor(() => expect(useLaunchStore.getState().database).toBeUndefined());
  });

  it('says so when the new window is blocked', async () => {
    open.mockReturnValue(null);
    offer(false);
    fireEvent.click(screen.getByRole('button', { name: 'Host' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('blocked the new window');
    expect(useLaunchStore.getState().database).toBe(world);
  });

  it('drops the file on Cancel', () => {
    offer(true);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(useLaunchStore.getState().database).toBeUndefined();
    expect(useLaunchStore.getState().confirmedDatabase).toBeUndefined();
  });
});
