import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type MudClient from '../client';
import { GMCPCharStatusTimers } from '../gmcp/Char/Status/Timers';
import { AutoreadMode, usePreferences } from '../stores/preferencesStore';
import { SharedClock } from '../timing/SharedClock';
import TimersPanel from './TimersPanel';

const { announce } = vi.hoisted(() => ({ announce: vi.fn() }));
vi.mock('@react-aria/live-announcer', () => ({ announce }));

describe('timer presentation', () => {
  let cleanup = () => {};
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
    announce.mockClear();
  });

  function setup(autoreadMode = AutoreadMode.Off) {
    vi.useFakeTimers();
    let now = 1000;
    vi.spyOn(performance, 'now').mockImplementation(() => now);
    usePreferences.getState().setSpeech({ ...usePreferences.getState().speech, autoreadMode });
    const sharedClock = new SharedClock(vi.fn(), () => now);
    sharedClock.setLocalMapping({ clockId: 'runtime', serverNowMs: 1000, performanceNowMs: 1000 });
    const send = vi.fn();
    const client = {
      sharedClock,
      gmcp: { ready: true, sessionReady: true, generation: 1, send, require: () => handler },
    } as unknown as MudClient;
    const handler = new GMCPCharStatusTimers(client);
    const view = render(<TimersPanel client={client} />);
    cleanup = () => {
      view.unmount();
      handler.shutdown();
      sharedClock.shutdown();
    };
    const advance = (ms: number) =>
      act(() => {
        now += ms;
        vi.advanceTimersByTime(ms);
      });
    return { handler, sharedClock, send, advance };
  }

  it('shows a readable linear countdown and waits for authoritative completion at zero', () => {
    const { handler, send, advance } = setup();
    act(() =>
      handler.handleUpdate({
        clockId: 'runtime',
        revision: 1,
        timers: [{ id: 'run', label: 'Deliver the parcel', deadlineServerMs: 3500 }],
      }),
    );
    expect(screen.getByRole('list', { name: 'Active timers' })).toHaveTextContent(
      'Deliver the parcel: 3 sec remaining',
    );
    advance(3000);
    expect(screen.getByRole('list')).toHaveTextContent('Time elapsed; waiting for the server.');
    // Neither time passing nor rendering sends a gameplay completion message.
    expect(send.mock.calls.every(([name]) => name === 'Char.Status.Timers.Request')).toBe(true);
    expect(announce).not.toHaveBeenCalled();
    act(() => handler.handleUpdate({ clockId: 'runtime', revision: 2, timers: [] }));
    expect(screen.getByText('No active timers.')).toBeInTheDocument();
  });

  it('announces expiry once when reading is enabled, without a live countdown region', () => {
    const { handler, advance } = setup(AutoreadMode.All);
    act(() =>
      handler.handleUpdate({
        clockId: 'runtime',
        revision: 1,
        timers: [{ id: 'run', label: 'Quest', deadlineServerMs: 2000 }],
      }),
    );
    expect(screen.getByRole('list').closest('[aria-live]')).toBeNull();
    advance(1000);
    advance(5000);
    expect(announce).toHaveBeenCalledOnce();
    expect(announce).toHaveBeenCalledWith('Quest: time elapsed; waiting for the server.', 'polite');
  });

  it('shows synchronization rather than a guessed time and clears on identity reset', () => {
    const { handler, sharedClock, advance } = setup();
    act(() => sharedClock.setNetworkReady(false));
    act(() =>
      handler.handleUpdate({
        clockId: 'runtime',
        revision: 1,
        timers: [{ id: 'run', label: 'Quest', deadlineServerMs: 2000 }],
      }),
    );
    expect(screen.getByRole('list')).toHaveTextContent('Synchronizing time…');
    advance(1000);
    fireEvent.click(screen.getByRole('button', { name: 'Refresh timers' }));
    act(() => handler.reset());
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.getByText('Waiting for timer information…')).toBeInTheDocument();
  });
});
