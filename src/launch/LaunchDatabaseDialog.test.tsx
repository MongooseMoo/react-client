import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LaunchDatabaseDialog from './LaunchDatabaseDialog';
import type { LaunchItem } from './launchInbox';
import { useLaunchStore } from './launchStore';

const inbox = vi.hoisted(() => ({
  put: vi.fn<(item: LaunchItem) => Promise<string>>(),
  discard: vi.fn<(id: string) => Promise<void>>(),
}));
vi.mock('./launchInbox', () => ({
  putLaunchItem: (item: LaunchItem) => inbox.put(item),
  discardLaunchItem: (id: string) => inbox.discard(id),
}));

const world = new File(['moo'], 'World.db');
const open = vi.fn();

/** Holds the next database hand-off write until `finish` is called, as a slow IndexedDB would. */
function holdNextWrite() {
  let finish: (id: string) => void = () => {};
  inbox.put.mockImplementationOnce(() => new Promise<string>((resolve) => { finish = resolve; }));
  return (id: string) => act(async () => { finish(id); });
}

beforeEach(() => {
  inbox.put.mockReset().mockResolvedValue('stored-id');
  inbox.discard.mockReset().mockResolvedValue();
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

  it('opens nothing when Cancel comes while the hand-off is still being stored', async () => {
    open.mockReturnValue({});
    const finish = holdNextWrite();
    offer(false);
    fireEvent.click(screen.getByRole('button', { name: 'Host' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await finish('abandoned-id');
    expect(open).not.toHaveBeenCalled();
    expect(inbox.discard).toHaveBeenCalledWith('abandoned-id');
  });

  it('opens nothing for an offer replaced while its hand-off was being stored, and keeps the new one', async () => {
    open.mockReturnValue({});
    const finish = holdNextWrite();
    offer(false);
    fireEvent.click(screen.getByRole('button', { name: 'Host' }));
    const other = new File(['moo'], 'Other.db');
    act(() => useLaunchStore.setState({ database: other }));
    await finish('abandoned-id');
    expect(open).not.toHaveBeenCalled();
    expect(inbox.discard).toHaveBeenCalledWith('abandoned-id');
    expect(useLaunchStore.getState().database).toBe(other);
    expect(screen.getByRole('dialog', { name: 'Host Other.db?' })).toHaveAttribute('open');
  });

  it('opens nothing when the dialog goes away while the hand-off is being stored', async () => {
    open.mockReturnValue({});
    const finish = holdNextWrite();
    render(<LaunchDatabaseDialog />);
    act(() => useLaunchStore.setState({ database: world, hostWaiting: false }));
    fireEvent.click(screen.getByRole('button', { name: 'Host' }));
    cleanup();
    await finish('abandoned-id');
    expect(open).not.toHaveBeenCalled();
    expect(inbox.discard).toHaveBeenCalledWith('abandoned-id');
  });

  it('opens nothing when Escape comes while the hand-off is still being stored', async () => {
    open.mockReturnValue({});
    const finish = holdNextWrite();
    offer(false);
    fireEvent.click(screen.getByRole('button', { name: 'Host' }));
    const dialog = screen.getByRole('dialog', { name: 'Host World.db?' });
    // A browser fires `cancel`, then closes, then fires `close` in a later task.
    fireEvent(dialog, new Event('cancel'));
    dialog.close();
    await finish('abandoned-id');
    expect(open).not.toHaveBeenCalled();
    expect(inbox.discard).toHaveBeenCalledWith('abandoned-id');
  });

  it('keeps a newer offer that arrives before the cancelled one has finished closing', async () => {
    offer(false);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    const other = new File(['moo'], 'Other.db');
    act(() => useLaunchStore.setState({ database: other }));
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
    expect(useLaunchStore.getState().database).toBe(other);
    expect(screen.getByRole('dialog', { name: 'Host Other.db?' })).toHaveAttribute('open');
  });

  it('discards the stored hand-off when the new window is blocked', async () => {
    open.mockReturnValue(null);
    offer(false);
    fireEvent.click(screen.getByRole('button', { name: 'Host' }));
    await screen.findByRole('alert');
    expect(inbox.discard).toHaveBeenCalledWith('stored-id');
  });
});
