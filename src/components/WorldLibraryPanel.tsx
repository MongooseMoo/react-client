import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type MudClient from '../client';
import { compileComposition, type CompositionDraft } from '../composition/model';
import type { GMCPClientMidi } from '../gmcp/Client/Midi';
import type { CanonicalScore } from '../midi/score';

export interface WorldLibraryPanelProps {
  client: MudClient;
  draft: CompositionDraft;
  onLoad(score: CanonicalScore, name: string): void;
}
interface Entry {
  libraryId: string;
  contentId: string;
  name: string;
  libraryRevision: number;
  published: boolean;
  canEdit: boolean;
}
type Operation = 'play' | 'apply' | 'pause' | 'resume' | 'seek' | 'stop';
interface Device {
  handle: string;
  revision: number;
  allowed: readonly string[];
  sourceId?: string;
  sourceRevision?: number;
}
const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
function entry(value: unknown): Entry {
  if (
    !record(value) ||
    typeof value.libraryId !== 'string' ||
    typeof value.contentId !== 'string' ||
    typeof value.name !== 'string' ||
    typeof value.libraryRevision !== 'number' ||
    typeof value.published !== 'boolean' ||
    typeof value.canEdit !== 'boolean'
  )
    throw new Error('The library response is incomplete. Refresh the library.');
  return {
    libraryId: value.libraryId,
    contentId: value.contentId,
    name: value.name,
    libraryRevision: value.libraryRevision,
    published: value.published,
    canEdit: value.canEdit,
  };
}
function accepted(reply: Record<string, unknown>) {
  if (reply.status !== 'ok')
    throw new Error(
      typeof reply.message === 'string' ? reply.message : `World library: ${reply.status}.`,
    );
  return reply;
}
function label(value: string) {
  if (!value.trim() || value.length > 128 || /[^\x20-\x7e]/.test(value) || value.includes('\\~'))
    throw new Error('Enter a world name using 1 to 128 printable ASCII characters.');
  return value;
}

/** Session-owned library controls. Drafts leave this browser only on an explicit save. */
export default function WorldLibraryPanel({ client, draft, onLoad }: WorldLibraryPanelProps) {
  const world = (client.gmcp.handlers['Client.Midi'] as GMCPClientMidi | undefined)?.world;
  const prefix = useId();
  const [scope, setScope] = useState<'mine' | 'public'>('mine');
  const [entries, setEntries] = useState<readonly Entry[]>([]);
  const [cursor, setCursor] = useState<string>();
  const [selected, setSelected] = useState<Entry>();
  const [name, setName] = useState('');
  const [device, setDevice] = useState<Device>();
  const [seekTick, setSeekTick] = useState('0');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const epoch = useRef(0);
  const pending = useRef<AbortController>();

  const run = useCallback(
    async <T,>(work: (signal: AbortSignal) => Promise<T>, commit: (result: T) => void) => {
      if (!world || pending.current) return;
      const controller = new AbortController();
      pending.current = controller;
      const token = epoch.current;
      const generation = world.generation;
      const check = () => {
        if (controller.signal.aborted || token !== epoch.current || generation !== world.generation)
          throw new DOMException('Session changed.', 'AbortError');
      };
      setBusy(true);
      setError('');
      setStatus('Working…');
      try {
        const result = await work(controller.signal);
        check();
        commit(result);
      } catch (cause) {
        if (!controller.signal.aborted && token === epoch.current) {
          setStatus('');
          setError(cause instanceof Error ? cause.message : 'The world operation failed.');
        }
      } finally {
        if (pending.current === controller) {
          pending.current = undefined;
          setBusy(false);
        }
      }
    },
    [world],
  );

  useEffect(() => {
    if (!world) return;
    const clear = () => {
      epoch.current++;
      pending.current?.abort();
      pending.current = undefined;
      setBusy(false);
      setEntries([]);
      setCursor(undefined);
      setSelected(undefined);
      setDevice(undefined);
      setName('');
      setError('');
      setStatus('Connection changed. Refresh the library to continue.');
    };
    const release = world.subscribeReset(clear);
    clear();
    return () => {
      epoch.current++;
      pending.current?.abort();
      pending.current = undefined;
      release();
    };
  }, [world]);

  function refresh(nextCursor?: string) {
    if (!world) return;
    void run(
      async (signal) => accepted(await world.list(scope, nextCursor, signal)),
      (reply) => {
        if (!Array.isArray(reply.entries)) throw new Error('The library response is incomplete.');
        setEntries(reply.entries.map(entry));
        setCursor(typeof reply.cursor === 'string' ? reply.cursor : undefined);
        setSelected(undefined);
        setStatus('Library refreshed.');
      },
    );
  }
  function retain(reply: Record<string, unknown>, message: string) {
    const saved = entry(accepted(reply));
    setSelected(saved);
    setName(saved.name);
    setCursor(undefined);
    if (scope === 'public' && !saved.published) {
      setScope('mine');
      setEntries([saved]);
    } else {
      setEntries((current) => [
        ...current.filter((item) => item.libraryId !== saved.libraryId),
        saved,
      ]);
    }
    setStatus(message);
  }
  function save(replace: boolean) {
    if (!world) return;
    const target = replace ? selected : undefined;
    void run(
      async (signal) => {
        const worldName = label(name);
        const score = compileComposition(draft, undefined, true, crypto.randomUUID());
        return world.save(
          {
            name: worldName,
            score,
            ...(target
              ? { libraryId: target.libraryId, expectedLibraryRevision: target.libraryRevision }
              : {}),
          },
          signal,
        );
      },
      (reply) => retain(reply, 'Saved privately in your world library.'),
    );
  }
  function transport(operation: Operation) {
    if (!world || !device?.allowed.includes(operation)) return;
    const current = device;
    const target = selected;
    void run(
      async (signal) => {
        const fields: Record<string, unknown> = {
          deviceHandle: current.handle,
          expectedDeviceRevision: current.revision,
          operation,
        };
        if (operation !== 'play') fields.expectedSourceRevision = current.sourceRevision;
        if (operation === 'play' || operation === 'apply') {
          if (!target) throw new Error('Select a saved world composition first.');
          fields.libraryId = target.libraryId;
          fields.expectedLibraryRevision = target.libraryRevision;
        }
        if (operation === 'seek') {
          const tick = Number(seekTick);
          if (!seekTick.trim() || !Number.isSafeInteger(tick) || tick < 0)
            throw new Error('Enter a non-negative whole score tick.');
          fields.tick = tick;
        }
        return accepted(await world.request('EditorTransport', fields, signal));
      },
      (reply) => {
        if (
          typeof reply.deviceRevision !== 'number' ||
          typeof reply.sourceId !== 'string' ||
          typeof reply.sourceRevision !== 'number'
        )
          throw new Error('Performance response is incomplete. Reconnect personal controls.');
        setDevice({
          ...current,
          revision: reply.deviceRevision,
          sourceId: reply.sourceId,
          sourceRevision: reply.sourceRevision,
        });
        setStatus(
          operation === 'play'
            ? 'Performing the saved composition for your current audience.'
            : `Performance ${operation} accepted.`,
        );
      },
    );
  }

  if (!world) return <p>World music is unavailable on this connection.</p>;
  return (
    <section aria-labelledby={`${prefix}-heading`}>
      <h4 id={`${prefix}-heading`}>World music library</h4>
      <p>
        Save sends this arrangement to the world. New saves and copies are private. Perform plays a
        saved version for your current audience; publishing makes it available in the public
        library.
      </p>
      <p role="status">{status}</p>
      {error && <p role="alert">{error}</p>}
      <button
        type="button"
        disabled={!busy}
        onClick={() => {
          epoch.current++;
          pending.current?.abort();
          pending.current = undefined;
          setBusy(false);
          setError('');
          setStatus('Operation cancelled. Refresh the library to check saved changes.');
        }}
      >
        Cancel world operation
      </button>
      <fieldset disabled={busy}>
        <legend>Browse saved compositions</legend>
        <label>
          Library
          <select
            value={scope}
            onChange={(event) => {
              setScope(event.currentTarget.value === 'public' ? 'public' : 'mine');
              setEntries([]);
              setCursor(undefined);
              setSelected(undefined);
              setStatus('Refresh to load this library.');
            }}
          >
            <option value="mine">My compositions</option>
            <option value="public">Public compositions</option>
          </select>
        </label>
        <button type="button" onClick={() => refresh()}>
          Refresh library
        </button>
        <button type="button" disabled={!cursor} onClick={() => refresh(cursor)}>
          Next library page
        </button>
        <label>
          Saved composition
          <select
            value={selected?.libraryId ?? ''}
            onChange={(event) => {
              const item = entries.find(
                (candidate) => candidate.libraryId === event.currentTarget.value,
              );
              setSelected(item);
              if (item) setName(item.name);
            }}
          >
            <option value="">Select a composition</option>
            {entries.map((item) => (
              <option key={item.libraryId} value={item.libraryId}>
                {item.name} ({item.published ? 'public' : 'private'}, revision{' '}
                {item.libraryRevision})
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={!selected}
          onClick={() => {
            if (!selected) return;
            const target = selected;
            void run(
              (signal) => world.load({ libraryId: target.libraryId }, signal),
              ({ score, entry: loaded }) => {
                accepted(loaded);
                onLoad(score, typeof loaded.name === 'string' ? loaded.name : target.name);
                setStatus('Loaded into the local composer. Save local edits explicitly.');
              },
            );
          }}
        >
          Load into composer
        </button>
      </fieldset>
      <fieldset disabled={busy}>
        <legend>Save and publish</legend>
        <p>Local draft: {draft.name}. Its name and part names can keep Unicode characters.</p>
        <label>
          World name (ASCII)
          <input
            maxLength={128}
            value={name}
            onChange={(event) => setName(event.currentTarget.value)}
          />
        </label>
        <button type="button" onClick={() => save(false)}>
          Save as new private composition
        </button>
        <button type="button" disabled={!selected?.canEdit} onClick={() => save(true)}>
          Save selected composition
        </button>
        <button
          type="button"
          disabled={!selected}
          onClick={() => {
            if (!selected) return;
            void run(
              async (signal) =>
                world.request(
                  'EditorCopy',
                  { libraryId: selected.libraryId, name: label(name) },
                  signal,
                ),
              (reply) => retain(reply, 'Copied to your private world library.'),
            );
          }}
        >
          Copy to my library
        </button>
        <button
          type="button"
          disabled={!selected?.canEdit}
          onClick={() => {
            if (!selected) return;
            void run(
              async (signal) =>
                world.request(
                  'EditorPublish',
                  {
                    libraryId: selected.libraryId,
                    expectedLibraryRevision: selected.libraryRevision,
                    published: !selected.published,
                  },
                  signal,
                ),
              (reply) =>
                retain(
                  reply,
                  selected.published
                    ? 'Removed from the public library.'
                    : 'Published to the public library.',
                ),
            );
          }}
        >
          {selected?.published ? 'Unpublish selected composition' : 'Publish selected composition'}
        </button>
        <button
          type="button"
          disabled={!selected?.canEdit}
          onClick={() => {
            if (!selected) return;
            const target = selected;
            void run(
              async (signal) =>
                accepted(
                  await world.request(
                    'EditorDelete',
                    {
                      libraryId: target.libraryId,
                      expectedLibraryRevision: target.libraryRevision,
                    },
                    signal,
                  ),
                ),
              () => {
                setEntries((current) =>
                  current.filter((item) => item.libraryId !== target.libraryId),
                );
                setSelected(undefined);
                setCursor(undefined);
                setStatus('Deleted your library reference. The local draft is retained.');
              },
            );
          }}
        >
          Delete selected composition
        </button>
        <p>
          Unpublishing prevents new public downloads. Copies already downloaded remain available to
          their recipients.
        </p>
      </fieldset>
      <fieldset disabled={busy}>
        <legend>Personal performance</legend>
        <button
          type="button"
          onClick={() => {
            void run(
              async (signal) =>
                accepted(await world.request('EditorOpen', { deviceId: 'self' }, signal)),
              (reply) => {
                if (
                  typeof reply.deviceHandle !== 'string' ||
                  typeof reply.deviceRevision !== 'number' ||
                  !Array.isArray(reply.allowedOperations)
                )
                  throw new Error('Personal performance controls are unavailable.');
                setDevice({
                  handle: reply.deviceHandle,
                  revision: reply.deviceRevision,
                  allowed: reply.allowedOperations.filter(
                    (value): value is string => typeof value === 'string',
                  ),
                });
                setStatus('Personal performance controls connected.');
              },
            );
          }}
        >
          Connect personal performance
        </button>
        <button
          type="button"
          disabled={!selected || !device?.allowed.includes('play')}
          onClick={() => transport('play')}
        >
          Perform selected composition
        </button>
        <button
          type="button"
          disabled={
            !selected || !device?.allowed.includes('apply') || device.sourceRevision === undefined
          }
          onClick={() => transport('apply')}
        >
          Apply selected composition to performance
        </button>
        {!device?.allowed.includes('apply') && (
          <p>Applying edits during a performance is unavailable on this device.</p>
        )}
        {(['pause', 'resume', 'stop'] as const).map((operation) => (
          <button
            key={operation}
            type="button"
            disabled={!device?.allowed.includes(operation) || device.sourceRevision === undefined}
            onClick={() => transport(operation)}
          >
            {operation === 'pause'
              ? 'Pause performance'
              : operation === 'resume'
                ? 'Resume performance'
                : 'Stop performance'}
          </button>
        ))}
        <label>
          Performance position (score ticks)
          <input
            type="number"
            min="0"
            step="1"
            value={seekTick}
            onChange={(event) => setSeekTick(event.currentTarget.value)}
          />
        </label>
        <button
          type="button"
          disabled={!device?.allowed.includes('seek') || device.sourceRevision === undefined}
          onClick={() => transport('seek')}
        >
          Seek performance
        </button>
      </fieldset>
    </section>
  );
}
