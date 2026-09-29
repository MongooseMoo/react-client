import type React from 'react';
import { useEffect, useId, useState } from 'react';

import {
  type AudioDiagnosticEntry,
  type AudioDiagnosticsRing,
  formatAudioDiagnostics,
} from '../audio/audioDiagnostics';
import './AudioDiagnostics.css';

interface AudioDiagnosticsProps {
  diagnostics: AudioDiagnosticsRing;
}

/** Coalesce ring changes: a busy scene can record hundreds of entries a second. */
const REFRESH_MS = 250;

function plural(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? '' : 's'}`;
}

function entriesText(count: number): string {
  return `${count} ${count === 1 ? 'entry' : 'entries'}`;
}

/** Follow the ring, refreshing at most every REFRESH_MS. */
function useRingEntries(ring: AudioDiagnosticsRing): readonly AudioDiagnosticEntry[] {
  const [entries, setEntries] = useState(() => ring.entries());
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    setEntries(ring.entries());
    const unsubscribe = ring.subscribe(() => {
      timer ??= setTimeout(() => {
        timer = undefined;
        setEntries(ring.entries());
      }, REFRESH_MS);
    });
    return () => {
      unsubscribe();
      if (timer !== undefined) {
        clearTimeout(timer);
      }
    };
  }, [ring]);
  return entries;
}

function catalogText(entry: AudioDiagnosticEntry): string | undefined {
  const catalog = entry.catalog;
  if (!catalog) {
    return undefined;
  }
  const parts = [
    catalog.soundId && `sound ${catalog.soundId}`,
    catalog.assetId && `asset ${catalog.assetId}`,
    catalog.segmentId && `segment ${catalog.segmentId}`,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : undefined;
}

function sharedText(entry: AudioDiagnosticEntry): string | undefined {
  const shared = entry.shared;
  if (!shared) {
    return undefined;
  }
  const ms = (label: string, value: number | undefined) =>
    value === undefined ? undefined : `${label} ${Math.round(value)} ms`;
  const parts = [
    shared.phase,
    shared.revision === undefined ? undefined : `revision ${shared.revision}`,
    ms('RTT', shared.rttMs),
    ms('target', shared.targetCursorMs),
    ms('actual', shared.actualCursorMs),
    ms('drift', shared.driftMs),
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : undefined;
}

function detailsText(entry: AudioDiagnosticEntry): string {
  return [
    entry.name && `name ${entry.name}`,
    catalogText(entry),
    sharedText(entry),
  ]
    .filter(Boolean)
    .join('; ');
}

const AudioDiagnostics: React.FC<AudioDiagnosticsProps> = ({ diagnostics }) => {
  const headingId = useId();
  const live = useRingEntries(diagnostics);
  const [frozen, setFrozen] = useState<readonly AudioDiagnosticEntry[] | null>(null);
  const [announcement, setAnnouncement] = useState('');

  const paused = frozen !== null;
  const shown = frozen ?? live;
  const errorCount = shown.filter((entry) => entry.error).length;

  const togglePause = () => {
    if (paused) {
      setFrozen(null);
      setAnnouncement(`Resumed. ${entriesText(diagnostics.entries().length)}.`);
    } else {
      setFrozen(live);
      setAnnouncement(
        `Paused. Showing ${entriesText(live.length)}; new events are still recorded.`,
      );
    }
  };

  const clear = () => {
    diagnostics.clear();
    if (paused) {
      setFrozen([]);
    }
    setAnnouncement('Cleared.');
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(formatAudioDiagnostics(shown));
      setAnnouncement(`Copied ${entriesText(shown.length)}.`);
    } catch (error) {
      console.error('Audio diagnostics: copy failed', error);
      setAnnouncement('Copy failed.');
    }
  };

  const newestFirst = [...shown].reverse();

  return (
    <section className="audio-diagnostics" aria-labelledby={headingId}>
      <h3 id={headingId}>Audio diagnostics</h3>
      <div className="audio-diagnostics-controls">
        <button type="button" aria-pressed={paused} onClick={togglePause}>
          Pause
        </button>
        <button type="button" onClick={clear}>
          Clear
        </button>
        <button type="button" onClick={() => void copy()}>
          Copy
        </button>
      </div>
      <p role="status" className="audio-diagnostics-status">
        {announcement}
      </p>
      {shown.length === 0 ? (
        <p>No audio events recorded.</p>
      ) : (
        <>
          <p>
            {entriesText(shown.length)}, {plural(errorCount, 'error')}.
          </p>
          <div className="audio-diagnostics-table-wrap">
            <table className="audio-diagnostics-table">
              <caption>Audio events, newest first</caption>
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Time</th>
                  <th scope="col">Stage</th>
                  <th scope="col">Key</th>
                  <th scope="col">Generation</th>
                  <th scope="col">Category</th>
                  <th scope="col">Error</th>
                  <th scope="col">Details</th>
                </tr>
              </thead>
              <tbody>
                {newestFirst.map((entry) => (
                  <tr key={entry.seq} className={entry.error ? 'audio-diagnostics-error' : undefined}>
                    <th scope="row">{entry.seq}</th>
                    <td>{(entry.time / 1000).toFixed(3)} s</td>
                    <td>{entry.stage}</td>
                    <td>{entry.key ?? ''}</td>
                    <td>{entry.generation ?? ''}</td>
                    <td>{entry.category ?? ''}</td>
                    <td>
                      {entry.error
                        ? `${entry.error.code}${entry.error.message ? `: ${entry.error.message}` : ''}`
                        : ''}
                    </td>
                    <td>{detailsText(entry)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
};

export default AudioDiagnostics;
