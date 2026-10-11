import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type MudClient from '../client';
import Toolbar from './toolbar';

describe('sound playback control', () => {
  it('reflects external pause, preserves focus through resume, and allows retry after failure', async () => {
    let paused = false;
    const listeners = new Set<() => void>();
    const client = {
      media: {
        muted: false,
        get paused() { return paused; },
        subscribePlayback: (listener: () => void) => { listeners.add(listener); return () => listeners.delete(listener); },
      },
      pauseAllSounds: vi.fn(async () => { paused = true; for (const listener of listeners) listener(); }),
      resumeAllSounds: vi.fn(async () => { paused = false; for (const listener of listeners) listener(); }),
    } as unknown as MudClient;
    const noop = () => {};
    render(<Toolbar client={client} onClearLog={noop} onSaveLog={noop} onCopyLog={noop} onToggleSidebar={noop} onOpenPrefs={noop} />);
    const button = screen.getByRole('button', { name: 'Pause sounds', exact: true });
    act(() => { paused = true; for (const listener of listeners) listener(); });
    expect(screen.getByRole('button', { name: 'Resume sounds', exact: true })).toBe(button);
    button.focus();
    vi.mocked(client.resumeAllSounds).mockRejectedValueOnce(new Error('Audio unavailable'));
    fireEvent.click(button);
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Could not resume sounds. Try again.'));
    expect(button).toHaveFocus();
    fireEvent.click(button);
    await waitFor(() => expect(button).toHaveAccessibleName('Pause sounds'));
    expect(button).toHaveFocus();
    expect(screen.getByRole('status').textContent).toBe('');
  });
});
