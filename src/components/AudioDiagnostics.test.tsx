import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AudioDiagnosticsRing } from '../audio/audioDiagnostics';
import AudioDiagnostics from './AudioDiagnostics';

function rows() {
  const table = screen.getByRole('table', { name: /audio events/i });
  // The first row is the header.
  return within(table).getAllByRole('row').slice(1);
}

describe('AudioDiagnostics view', () => {
  let ring: AudioDiagnosticsRing;
  let clock: number;

  beforeEach(() => {
    vi.useFakeTimers();
    clock = 1000;
    ring = new AudioDiagnosticsRing({ now: () => clock });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const flush = () =>
    act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

  it('is a labelled region with a heading and an empty state', () => {
    render(<AudioDiagnostics diagnostics={ring} />);
    expect(screen.getByRole('region', { name: 'Audio diagnostics' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Audio diagnostics' })).toBeInTheDocument();
    expect(screen.getByText('No audio events recorded.')).toBeInTheDocument();
  });

  it('lists entries newest first in a captioned table with column headers', async () => {
    render(<AudioDiagnostics diagnostics={ring} />);
    ring.record({ stage: 'loading', key: 'door', generation: 1, category: 'effects' });
    clock = 1250;
    ring.record({
      stage: 'loading',
      key: 'door',
      generation: 1,
      category: 'effects',
      error: { code: 'FETCH_FAILED', message: '404' },
    });
    await flush();

    const headers = screen.getAllByRole('columnheader').map((cell) => cell.textContent);
    expect(headers).toEqual(['#', 'Time', 'Stage', 'Key', 'Generation', 'Category', 'Error', 'Details']);
    const [newest, oldest] = rows();
    expect(within(newest).getByRole('rowheader')).toHaveTextContent('2');
    expect(newest).toHaveTextContent('1.250 s');
    expect(newest).toHaveTextContent('FETCH_FAILED: 404');
    expect(within(oldest).getByRole('rowheader')).toHaveTextContent('1');
    expect(screen.getByText('2 entries, 1 error.')).toBeInTheDocument();
  });

  it('shows catalog ids and shared-media timing in details', async () => {
    render(<AudioDiagnostics diagnostics={ring} />);
    ring.record({
      stage: 'started',
      key: 'tv',
      catalog: { soundId: 's1', assetId: 'a2' },
      shared: { revision: 3, rttMs: 80, targetCursorMs: 242000, actualCursorMs: 241900, driftMs: -100, phase: 'audible' },
    });
    await flush();
    const [row] = rows();
    expect(row).toHaveTextContent('sound s1, asset a2');
    expect(row).toHaveTextContent(
      'audible, revision 3, RTT 80 ms, target 242000 ms, actual 241900 ms, drift -100 ms',
    );
  });

  it('pause freezes the table and announces it; resume catches up', async () => {
    render(<AudioDiagnostics diagnostics={ring} />);
    ring.record({ stage: 'received', key: 'a' });
    await flush();

    const pause = screen.getByRole('button', { name: 'Pause' });
    expect(pause).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(pause);
    expect(pause).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('status')).toHaveTextContent(
      'Paused. Showing 1 entry; new events are still recorded.',
    );

    ring.record({ stage: 'validated', key: 'a' });
    await flush();
    expect(rows()).toHaveLength(1);

    fireEvent.click(pause);
    await flush();
    expect(rows()).toHaveLength(2);
    expect(screen.getByRole('status')).toHaveTextContent('Resumed. 2 entries.');
  });

  it('clear empties the ring and announces it', async () => {
    render(<AudioDiagnostics diagnostics={ring} />);
    ring.record({ stage: 'received', key: 'a' });
    await flush();

    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    await flush();

    expect(ring.entries()).toEqual([]);
    expect(screen.getByText('No audio events recorded.')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Cleared.');
  });

  it('copy writes the shown entries as JSON lines and announces the result', async () => {
    const writeText = vi.fn(async () => undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    render(<AudioDiagnostics diagnostics={ring} />);
    ring.record({ stage: 'received', key: 'a' });
    ring.record({ stage: 'validated', key: 'a' });
    await flush();

    fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
    await flush();

    expect(writeText).toHaveBeenCalledTimes(1);
    const lines = (writeText.mock.calls[0] as unknown as [string])[0].split('\n');
    expect(lines.map((line) => JSON.parse(line).stage)).toEqual(['received', 'validated']);
    expect(screen.getByRole('status')).toHaveTextContent('Copied 2 entries.');
  });

  it('announces a copy failure', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn(async () => Promise.reject(new Error('denied'))) },
      configurable: true,
    });
    render(<AudioDiagnostics diagnostics={ring} />);

    fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
    await flush();

    expect(screen.getByRole('status')).toHaveTextContent('Copy failed.');
  });

  it('does not announce individual audio events', async () => {
    render(<AudioDiagnostics diagnostics={ring} />);
    ring.record({ stage: 'received', key: 'a' });
    await flush();
    expect(screen.getByRole('status').textContent).toBe('');
    const table = screen.getByRole('table', { name: /audio events/i });
    expect(table.closest('[aria-live]')).toBeNull();
  });
});
