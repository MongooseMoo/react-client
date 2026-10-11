import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type MudClient from '../client';
import { useLiveKitStore } from '../stores/liveKitStore';
import AudioChat from './audioChat';

const spoken = vi.hoisted(() => vi.fn());
vi.mock('@react-aria/live-announcer', () => ({ announce: spoken }));
vi.mock('../audio/LiveKitSpatialAudioBridge', () => ({
  LiveKitSpatialAudioBridge: class { setRoute() {} syncAll() {} cleanup() {} detachMissing() {} },
}));
vi.mock('@livekit/components-react', () => ({
  LiveKitRoom: (props: { children: unknown; onError?: (error: Error) => void; onMediaDeviceFailure?: () => void; onDisconnected: () => void }) => <div>
    <button onClick={() => props.onError?.(new Error('failed'))}>Simulate connection failure</button>
    <button onClick={() => { props.onError?.(new Error('failed')); props.onDisconnected(); }}>Simulate failed disconnect</button>
    <button onClick={() => props.onMediaDeviceFailure?.()}>Simulate microphone failure</button>
    <button onClick={props.onDisconnected}>Leave call</button>
    {props.children as never}
  </div>,
  LayoutContextProvider: ({ children }: { children: unknown }) => <>{children as never}</>,
  TrackLoop: () => null,
  ParticipantAudioTile: () => null,
  BarVisualizer: () => null,
  ParticipantName: () => null,
  ConnectionQualityIndicator: () => null,
  ControlBar: () => <button>Microphone</button>,
  useTracks: () => [],
}));

afterEach(() => { useLiveKitStore.getState().reset(); spoken.mockClear(); });

it('provides recoverable voice errors and retains the result after leaving', async () => {
  useLiveKitStore.getState().setRoom({ token: 'test-room' });
  render(<AudioChat client={{} as MudClient} />);
  fireEvent.click(screen.getByText('Simulate connection failure'));
  await screen.findByText('Voice chat could not connect. Try again.');
  const retry = screen.getByRole('button', { name: 'Retry voice chat' });
  retry.focus();
  await act(async () => { fireEvent.click(retry); });
  expect(document.activeElement).toBe(screen.getByText('Retrying voice chat.'));
  expect(spoken).toHaveBeenCalledWith('Retrying voice chat.', 'polite');
  fireEvent.click(screen.getByText('Simulate microphone failure'));
  await screen.findByText('Microphone unavailable. Check microphone access, then try the microphone button again.');
  await act(async () => { fireEvent.click(screen.getByText('Leave call')); });
  await screen.findByText('Voice chat disconnected.');
  expect(screen.queryByText('Microphone')).toBeNull();
});

it('retains retry and dismissal when a connection failure also disconnects the room', async () => {
  useLiveKitStore.getState().setRoom({ token: 'test-room' });
  render(<AudioChat client={{} as MudClient} />);
  fireEvent.click(screen.getByText('Simulate failed disconnect'));
  await screen.findByRole('button', { name: 'Retry voice chat' });
  fireEvent.click(screen.getByRole('button', { name: 'Dismiss voice chat' }));
  await screen.findByText('Voice chat disconnected.');
  expect(useLiveKitStore.getState().rooms).toHaveLength(0);
});
