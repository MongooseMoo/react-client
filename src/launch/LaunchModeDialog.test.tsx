import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LaunchModeDialog from './LaunchModeDialog';
import { useLaunchStore } from './launchStore';

const open = vi.fn();

beforeEach(() => {
  open.mockReset();
  window.open = open;
  useLaunchStore.setState({ modeRequest: undefined });
});

function request(mode: 'host' | 'local') {
  render(<LaunchModeDialog />);
  act(() => useLaunchStore.setState({ modeRequest: mode }));
}

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
    expect(useLaunchStore.getState().modeRequest).toBe('local');
  });

  it('opens nothing on Cancel', () => {
    request('host');
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(open).not.toHaveBeenCalled();
    expect(useLaunchStore.getState().modeRequest).toBeUndefined();
  });
});
