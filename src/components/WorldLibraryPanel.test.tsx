import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type MudClient from '../client';
import { compileComposition, newComposition } from '../composition/model';
import WorldLibraryPanel from './WorldLibraryPanel';

const original = {
  libraryId: 'my-library',
  contentId: 'abdf2020-1111-4222-8333-555555555555',
  name: 'World song',
  libraryRevision: 3,
  published: false,
  canEdit: true,
};
function setup() {
  let reset = () => {};
  const draft = { ...newComposition(), name: 'Local café 🎹' };
  draft.parts = draft.parts.map((part) => ({ ...part, name: 'Piano 🎹' }));
  const score = compileComposition(draft);
  const world = {
    generation: 1,
    request: vi.fn(
      async (
        _operation: string,
        _fields: Record<string, unknown>,
        _signal?: AbortSignal,
      ): Promise<Record<string, unknown>> => ({ status: 'ok', ...original }),
    ),
    list: vi.fn(
      async (
        _scope: string,
        _cursor?: string,
        _signal?: AbortSignal,
      ): Promise<Record<string, unknown>> => ({
        status: 'ok',
        entries: [original],
        cursor: 'page-two',
      }),
    ),
    load: vi.fn(async () => ({ score, entry: { status: 'ok', ...original } })),
    save: vi.fn(
      async (
        _fields: Record<string, unknown>,
        _signal?: AbortSignal,
      ): Promise<Record<string, unknown>> => ({ status: 'ok', ...original }),
    ),
    subscribeReset: (listener: () => void) => {
      reset = listener;
      return () => {
        reset = () => {};
      };
    },
  };
  const client = { gmcp: { handlers: { 'Client.Midi': { world } } } } as unknown as MudClient;
  const onLoad = vi.fn();
  render(<WorldLibraryPanel client={client} draft={draft} onLoad={onLoad} />);
  return {
    world,
    draft,
    score,
    onLoad,
    reset: () => {
      world.generation++;
      reset();
    },
  };
}
async function select() {
  fireEvent.click(screen.getByRole('button', { name: 'Refresh library' }));
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Library refreshed.'));
  fireEvent.change(screen.getByRole('combobox', { name: 'Saved composition' }), {
    target: { value: original.libraryId },
  });
}
afterEach(cleanup);

describe('world music library', () => {
  it('sends only on explicit action and keeps Unicode local names separate from the ASCII label', async () => {
    const { world, draft } = setup();
    expect(world.list).not.toHaveBeenCalled();
    expect(world.save).not.toHaveBeenCalled();
    expect(screen.getByText(/Local café 🎹/)).toBeInTheDocument();
    fireEvent.input(screen.getByRole('textbox', { name: 'World name (ASCII)' }), {
      target: { value: 'café' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save as new private composition' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('printable ASCII'));
    expect(world.save).not.toHaveBeenCalled();
    fireEvent.input(screen.getByRole('textbox', { name: 'World name (ASCII)' }), {
      target: { value: 'My piano song' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save as new private composition' }));
    await waitFor(() => expect(world.save).toHaveBeenCalledOnce());
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Saved privately'));
    const first = world.save.mock.calls[0][0];
    expect(first.name).toBe('My piano song');
    expect(first).not.toHaveProperty('libraryId');
    expect(first.score).toMatchObject({ parts: [{ name: 'Piano 🎹' }] });
    expect(draft.name).toBe('Local café 🎹');
    fireEvent.click(screen.getByRole('button', { name: 'Save selected composition' }));
    await waitFor(() => expect(world.save).toHaveBeenCalledTimes(2));
    const second = world.save.mock.calls[1][0];
    expect(second).toMatchObject({ libraryId: original.libraryId, expectedLibraryRevision: 3 });
    expect(second.score).not.toMatchObject({
      contentId: (first.score as { contentId: string }).contentId,
    });
  });

  it('pages with scope and loads an explicitly selected score into the composer', async () => {
    const { world, onLoad, score } = setup();
    await select();
    fireEvent.click(screen.getByRole('button', { name: 'Load into composer' }));
    await waitFor(() => expect(onLoad).toHaveBeenCalledWith(score, original.name));
    expect(world.load).toHaveBeenCalledWith(
      { libraryId: original.libraryId },
      expect.any(AbortSignal),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Next library page' }));
    await waitFor(() =>
      expect(world.list).toHaveBeenCalledWith('mine', 'page-two', expect.any(AbortSignal)),
    );
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Library refreshed.'));
    fireEvent.change(screen.getByRole('combobox', { name: 'Library' }), {
      target: { value: 'public' },
    });
    expect(screen.getByRole('button', { name: 'Load into composer' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Refresh library' }));
    await waitFor(() =>
      expect(world.list).toHaveBeenCalledWith('public', undefined, expect.any(AbortSignal)),
    );
  });

  it('uses separate library CAS for publish, copy, unpublish and delete', async () => {
    const { world } = setup();
    await select();
    world.request.mockResolvedValueOnce({
      status: 'ok',
      ...original,
      published: true,
      libraryRevision: 4,
    });
    fireEvent.click(screen.getByRole('button', { name: 'Publish selected composition' }));
    await waitFor(() =>
      expect(world.request).toHaveBeenCalledWith(
        'EditorPublish',
        { libraryId: original.libraryId, expectedLibraryRevision: 3, published: true },
        expect.any(AbortSignal),
      ),
    );
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Unpublish selected composition' })).toBeEnabled(),
    );
    world.request.mockResolvedValueOnce({ status: 'ok', ...original, libraryRevision: 5 });
    fireEvent.click(screen.getByRole('button', { name: 'Unpublish selected composition' }));
    await waitFor(() =>
      expect(world.request).toHaveBeenCalledWith(
        'EditorPublish',
        { libraryId: original.libraryId, expectedLibraryRevision: 4, published: false },
        expect.any(AbortSignal),
      ),
    );
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Removed from the public library.'),
    );
    world.request.mockResolvedValueOnce({
      status: 'ok',
      ...original,
      libraryId: 'copied',
      libraryRevision: 1,
    });
    fireEvent.click(screen.getByRole('button', { name: 'Copy to my library' }));
    await waitFor(() =>
      expect(world.request).toHaveBeenCalledWith(
        'EditorCopy',
        { libraryId: original.libraryId, name: original.name },
        expect.any(AbortSignal),
      ),
    );
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Copied'));
    fireEvent.click(screen.getByRole('button', { name: 'Delete selected composition' }));
    await waitFor(() =>
      expect(world.request).toHaveBeenCalledWith(
        'EditorDelete',
        { libraryId: 'copied', expectedLibraryRevision: 1 },
        expect.any(AbortSignal),
      ),
    );
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Deleted your library reference'),
    );
  });

  it('preserves independent device and source revisions and gates apply by advertised policy', async () => {
    const { world } = setup();
    await select();
    expect(
      screen.getByRole('button', { name: 'Apply selected composition to performance' }),
    ).toBeDisabled();
    world.request.mockResolvedValueOnce({
      status: 'ok',
      deviceHandle: 'aabb',
      deviceRevision: 7,
      allowedOperations: ['play', 'pause', 'resume', 'seek', 'stop'],
    });
    fireEvent.click(screen.getByRole('button', { name: 'Connect personal performance' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Perform selected composition' })).toBeEnabled(),
    );
    expect(screen.getByRole('button', { name: 'Pause performance' })).toBeDisabled();
    world.request.mockResolvedValueOnce({
      status: 'ok',
      deviceRevision: 8,
      sourceId: 'source-one',
      sourceRevision: 1,
    });
    fireEvent.click(screen.getByRole('button', { name: 'Perform selected composition' }));
    await waitFor(() =>
      expect(world.request).toHaveBeenCalledWith(
        'EditorTransport',
        {
          deviceHandle: 'aabb',
          expectedDeviceRevision: 7,
          operation: 'play',
          libraryId: original.libraryId,
          expectedLibraryRevision: 3,
        },
        expect.any(AbortSignal),
      ),
    );
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Pause performance' })).toBeEnabled(),
    );
    expect(
      screen.getByRole('button', { name: 'Apply selected composition to performance' }),
    ).toBeDisabled();
    world.request.mockResolvedValueOnce({
      status: 'ok',
      deviceRevision: 8,
      sourceId: 'source-one',
      sourceRevision: 2,
    });
    fireEvent.click(screen.getByRole('button', { name: 'Pause performance' }));
    await waitFor(() =>
      expect(world.request).toHaveBeenCalledWith(
        'EditorTransport',
        {
          deviceHandle: 'aabb',
          expectedDeviceRevision: 8,
          expectedSourceRevision: 1,
          operation: 'pause',
        },
        expect.any(AbortSignal),
      ),
    );
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Performance pause accepted.'),
    );
    world.request.mockResolvedValueOnce({
      status: 'ok',
      deviceRevision: 8,
      sourceId: 'source-one',
      sourceRevision: 3,
    });
    fireEvent.input(
      screen.getByRole('spinbutton', { name: 'Performance position (score ticks)' }),
      { target: { value: '960' } },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Seek performance' }));
    await waitFor(() =>
      expect(world.request).toHaveBeenCalledWith(
        'EditorTransport',
        {
          deviceHandle: 'aabb',
          expectedDeviceRevision: 8,
          expectedSourceRevision: 2,
          operation: 'seek',
          tick: 960,
        },
        expect.any(AbortSignal),
      ),
    );
  });

  it('aborts pending work and rejects late completion after a session reset', async () => {
    const { world, reset } = setup();
    let finish: (reply: Record<string, unknown>) => void = () => {};
    world.list.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Refresh library' }));
    const signal = world.list.mock.calls[0][2];
    act(reset);
    expect(signal?.aborted).toBe(true);
    await act(async () => finish({ status: 'ok', entries: [original] }));
    expect(screen.queryByRole('option', { name: /World song/ })).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Connection changed');
    expect(screen.getByRole('button', { name: 'Perform selected composition' })).toBeDisabled();
  });

  it('moves a private copy from the public list to a visible selection in my library', async () => {
    const { world } = setup();
    world.list.mockResolvedValueOnce({
      status: 'ok',
      entries: [{ ...original, published: true, canEdit: false }],
    });
    fireEvent.change(screen.getByRole('combobox', { name: 'Library' }), {
      target: { value: 'public' },
    });
    await select();
    expect(screen.getByRole('button', { name: 'Save selected composition' })).toBeDisabled();
    world.request.mockResolvedValueOnce({
      status: 'ok',
      ...original,
      libraryId: 'my-copy',
      libraryRevision: 1,
    });
    fireEvent.click(screen.getByRole('button', { name: 'Copy to my library' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Copied'));
    expect(screen.getByRole('combobox', { name: 'Library' })).toHaveValue('mine');
    expect(screen.getByRole('combobox', { name: 'Saved composition' })).toHaveValue('my-copy');
    expect(screen.getByRole('button', { name: 'Save selected composition' })).toBeEnabled();
  });

  it('shows a denied guest save without creating an optimistic library entry', async () => {
    const { world } = setup();
    world.save.mockRejectedValueOnce(new Error('Guests cannot save world music.'));
    fireEvent.input(screen.getByRole('textbox', { name: 'World name (ASCII)' }), {
      target: { value: 'Guest song' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save as new private composition' }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Guests cannot save world music.'),
    );
    expect(screen.getByRole('button', { name: 'Save selected composition' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Refresh library' })).toBeEnabled();
  });

  it('cancels a pending upload without accepting its later acknowledgement', async () => {
    const { world } = setup();
    let finish: (reply: Record<string, unknown>) => void = () => {};
    world.save.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    fireEvent.input(screen.getByRole('textbox', { name: 'World name (ASCII)' }), {
      target: { value: 'Long song' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save as new private composition' }));
    await waitFor(() => expect(world.save).toHaveBeenCalledOnce());
    const signal = world.save.mock.calls[0][1];
    fireEvent.click(screen.getByRole('button', { name: 'Cancel world operation' }));
    expect(signal?.aborted).toBe(true);
    await act(async () => finish({ status: 'ok', ...original }));
    expect(screen.getByRole('status')).toHaveTextContent('Operation cancelled.');
    expect(screen.getByRole('button', { name: 'Save selected composition' })).toBeDisabled();
  });
});
