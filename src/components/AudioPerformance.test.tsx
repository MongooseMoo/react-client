import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { readAudioPerformance } from '../audio/audioPerformance';
import AudioPerformance from './AudioPerformance';

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

it('records on request, bounds the report, marks crackles, and stops on unmount', async () => {
  vi.useFakeTimers();
  const writeText = vi.fn(async () => {});
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  const read = vi.fn(() => readAudioPerformance({}, []));
  const { unmount } = render(<AudioPerformance read={read} />);
  expect(read).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Start recording' }));
  await act(async () => {
    await vi.advanceTimersByTimeAsync(125000);
  });
  fireEvent.click(screen.getByRole('button', { name: 'Mark crackle' }));
  fireEvent.click(screen.getByRole('button', { name: 'Stop recording' }));
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Copy performance report' }));
    await vi.advanceTimersByTimeAsync(500);
  });
  const report = JSON.parse(writeText.mock.calls[0][0]);
  expect(report.samples).toHaveLength(120);
  expect(report.baseline.underrunEvents).toBeNull();
  expect(report.crackleTimes).toHaveLength(1);
  expect(screen.getByRole('status')).toHaveTextContent('Performance report copied.');
  fireEvent.click(screen.getByRole('button', { name: 'Start recording' }));
  unmount();
  const count = read.mock.calls.length;
  await vi.advanceTimersByTimeAsync(3000);
  expect(read).toHaveBeenCalledTimes(count);
});

it('shows underrun increases from the capture baseline', async () => {
  vi.useFakeTimers();
  let events = 10;
  const read = () => readAudioPerformance({ playbackStats: { underrunEvents: events } }, []);
  render(<AudioPerformance read={read} />);
  fireEvent.click(screen.getByRole('button', { name: 'Start recording' }));
  events = 14;
  await act(async () => {
    await vi.advanceTimersByTimeAsync(1000);
  });
  expect(
    screen.getByText('Underruns since recording started').nextElementSibling,
  ).toHaveTextContent('4');
});
