import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import type MudClient from '../client';
import SharedMediaPanel from './SharedMediaPanel';
import { useSharedMediaStore, updateSharedMediaPresentation } from '../stores/sharedMediaStore';
import { usePreferences, AutoreadMode } from '../stores/preferencesStore';
const { announce } = vi.hoisted(() => ({ announce: vi.fn() }));
vi.mock('@react-aria/live-announcer', () => ({ announce }));
describe('shared media presentation', () => {
  afterEach(() => {
    useSharedMediaStore.setState({ sources: {} });
    localStorage.removeItem('media-cue-reading');
    announce.mockClear();
  });
  it('offers listener-local controls and a linear current-caption list', async () => {
    const pauseSharedMedia = vi.fn(),
      resumeSharedMedia = vi.fn(async () => {});
    const client = { media: { pauseSharedMedia, resumeSharedMedia } } as unknown as MudClient;
    render(<SharedMediaPanel client={client} />);
    act(() =>
      updateSharedMediaPresentation({
        key: 'tv',
        sourceId: 'source',
        discontinuity: 0,
        retainedCueIds: ['current'],
        title: 'A film',
        state: 'paused',
        cues: [{ id: 'current', startMs: 0, endMs: 1000, text: 'The door opens.' }],
      }),
    );
    expect(screen.getByLabelText('Current captions')).toHaveTextContent('The door opens.');
    fireEvent.click(screen.getByText('Pause here'));
    fireEvent.click(screen.getByText('Resume here'));
    expect(pauseSharedMedia).toHaveBeenCalledWith('tv');
    expect(resumeSharedMedia).toHaveBeenCalledWith('tv');
    expect(announce).not.toHaveBeenCalled();
  });
  it('announces each cue transition once according to reading preference, not gain updates', () => {
    usePreferences
      .getState()
      .setSpeech({ ...usePreferences.getState().speech, autoreadMode: AutoreadMode.All });
    render(<SharedMediaPanel client={{ media: {} } as MudClient} />);
    fireEvent.click(screen.getByRole('checkbox'));
    const value = {
      key: 'tv',
      sourceId: 'source',
      discontinuity: 0,
      retainedCueIds: ['current'],
      title: 'A film',
      state: 'playing' as const,
      cues: [{ id: 'current', startMs: 0, endMs: 1000, text: 'The door opens.' }],
    };
    act(() => updateSharedMediaPresentation(value));
    act(() => updateSharedMediaPresentation({ ...value, title: 'A film, quieter' }));
    expect(announce).toHaveBeenCalledOnce();
    expect(announce).toHaveBeenCalledWith('The door opens.', 'polite');
    act(() => updateSharedMediaPresentation({ ...value, state: 'paused', cues: [] }));
    act(() => updateSharedMediaPresentation({ ...value, state: 'paused' }));
    expect(announce).toHaveBeenCalledOnce();
    act(() => updateSharedMediaPresentation({ ...value, discontinuity: 1 }));
    expect(announce).toHaveBeenCalledTimes(2);
    act(() => updateSharedMediaPresentation({ key: 'tv', removed: true }));
    expect(screen.queryByLabelText('Current captions')).not.toBeInTheDocument();
  });
});
