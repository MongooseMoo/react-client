import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LaunchModeDialog from './LaunchModeDialog';
import { type LaunchMode, useLaunchStore } from './launchStore';

const open = vi.fn();

beforeEach(() => {
  open.mockReset();
  window.open = open;
  useLaunchStore.setState({ modeRequest: undefined });
});

function request(mode: LaunchMode) {
  render(<LaunchModeDialog />);
  act(() => useLaunchStore.setState({ modeRequest: { mode } }));
}

/** Lets the dialog's `close` event, which comes in a later task, arrive. */
const closeEventsArrive = () => act(() => new Promise((resolve) => setTimeout(resolve, 0)));

describe('LaunchModeDialog', () => {
  it('asks before opening a shortcut mode, and opens it in a new window', () => {
    open.mockReturnValue({});
    request('host');
    const dialog = screen.getByRole('dialog', { name: 'Host a MOO server?' });
    expect(dialog).toHaveAccessibleDescription(/new window.*This window stays as it is/);
    expect(open).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(new URL(open.mock.calls[0][0]).search).toBe('?mode=host');
    expect(useLaunchStore.getState().modeRequest).toBeUndefined();
  });

  it('opens local mode for the Local shortcut', () => {
    open.mockReturnValue({});
    request('local');
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(new URL(open.mock.calls[0][0]).search).toBe('?mode=local');
  });

  it('says so when the window is blocked, and keeps asking', () => {
    open.mockReturnValue(null);
    request('local');
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('alert')).toHaveTextContent('blocked the new window');
    expect(useLaunchStore.getState().modeRequest).toEqual({ mode: 'local' });
  });

  it('opens nothing on Cancel', async () => {
    request('host');
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(useLaunchStore.getState().modeRequest).toBeUndefined();
    await closeEventsArrive();
    expect(open).not.toHaveBeenCalled();
  });

  it('keeps a newer shortcut that arrives before the cancelled one has finished closing', async () => {
    request('host');
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    act(() => useLaunchStore.setState({ modeRequest: { mode: 'local' } }));
    await closeEventsArrive();
    expect(useLaunchStore.getState().modeRequest).toEqual({ mode: 'local' });
    expect(screen.getByRole('dialog', { name: 'Play a local MOO?' })).toHaveAttribute('open');
  });

  it('dismisses at once on Escape, before the dialog has closed', async () => {
    request('host');
    const dialog = screen.getByRole('dialog', { name: 'Host a MOO server?' });
    fireEvent(dialog, new Event('cancel'));
    expect(useLaunchStore.getState().modeRequest).toBeUndefined();
    act(() => useLaunchStore.setState({ modeRequest: { mode: 'local' } }));
    await closeEventsArrive();
    expect(useLaunchStore.getState().modeRequest).toEqual({ mode: 'local' });
  });
});
