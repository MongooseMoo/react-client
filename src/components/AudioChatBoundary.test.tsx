import { act, render, screen, waitFor } from '@testing-library/react';
import { useEffect } from 'react';
import { expect, it, vi } from 'vitest';
import type MudClient from '../client';
import { useLiveKitStore } from '../stores/liveKitStore';
import AudioChatBoundary from './AudioChatBoundary';

const chat = vi.hoisted(() => ({ loaded: vi.fn(), mounted: vi.fn(), disconnected: vi.fn() }));

vi.mock('./audioChat', () => {
  chat.loaded();
  return {
    default: function Chat() {
      useEffect(() => {
        chat.mounted();
        return chat.disconnected;
      }, []);
      return <div>Active call</div>;
    },
  };
});

it('loads on the first token, keeps hidden calls mounted, and unmounts when tokens are cleared', async () => {
  useLiveKitStore.getState().reset();
  const client = {} as MudClient;
  const view = render(<div hidden><AudioChatBoundary client={client} /></div>);
  expect(chat.loaded).not.toHaveBeenCalled();

  act(() => useLiveKitStore.getState().addToken('first'));
  await screen.findByText('Active call');
  expect(chat.loaded).toHaveBeenCalledOnce();
  await waitFor(() => expect(chat.mounted).toHaveBeenCalledOnce());

  view.rerender(<div><AudioChatBoundary client={client} /></div>);
  view.rerender(<div hidden><AudioChatBoundary client={client} /></div>);
  act(() => useLiveKitStore.getState().addToken('second'));
  act(() => useLiveKitStore.getState().removeToken('first'));
  expect(chat.disconnected).not.toHaveBeenCalled();
  expect(chat.mounted).toHaveBeenCalledOnce();

  act(() => useLiveKitStore.getState().reset());
  await waitFor(() => expect(chat.disconnected).toHaveBeenCalledOnce());
  expect(screen.queryByText('Active call')).not.toBeInTheDocument();
});
