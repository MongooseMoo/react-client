import { announce } from '@react-aria/live-announcer';
import { useEffect, useRef, useState } from 'react';
import type MudClient from '../client';
import { AutoreadMode, usePreferences } from '../stores/preferencesStore';
import { formatTimerRemaining, timerRemainingMs } from '../timing/deadlines';

export default function TimersPanel({ client }: { client: MudClient }) {
  const timers = client.gmcp.require('Char.Status.Timers');
  const [snapshot, setSnapshot] = useState(timers.snapshot);
  const [serverNow, setServerNow] = useState(client.sharedClock.getServerNow());
  const expired = useRef(new Set<string>());
  useEffect(
    () =>
      timers.subscribe((next) => {
        setSnapshot(next);
        setServerNow(client.sharedClock.getServerNow());
      }),
    [client, timers],
  );
  useEffect(() => {
    timers.requestSnapshot();
  }, [timers]);
  useEffect(() => {
    if (!snapshot.timers.length) return;
    const refresh = () => {
      const now = client.sharedClock.getServerNow();
      setServerNow(now);
      if (now === undefined) return;
      const mode = usePreferences.getState().speech.autoreadMode;
      const shouldRead =
        mode === AutoreadMode.All || (mode === AutoreadMode.Unfocused && !document.hasFocus());
      for (const timer of snapshot.timers) {
        const identity = JSON.stringify([snapshot.clockId, timer.id, timer.deadlineServerMs]);
        if (timer.deadlineServerMs <= now && !expired.current.has(identity)) {
          expired.current.add(identity);
          if (shouldRead)
            announce(`${timer.label}: time elapsed; waiting for the server.`, 'polite');
        }
      }
    };
    refresh();
    const interval = setInterval(refresh, 1000);
    return () => clearInterval(interval);
  }, [client, snapshot]);
  useEffect(() => {
    const current = new Set(
      snapshot.timers.map((timer) =>
        JSON.stringify([snapshot.clockId, timer.id, timer.deadlineServerMs]),
      ),
    );
    for (const id of expired.current) if (!current.has(id)) expired.current.delete(id);
  }, [snapshot]);

  const matchingClock = client.sharedClock.estimate().clockId === snapshot.clockId;
  return (
    <section aria-label="Timers">
      <h3>Timers</h3>
      <button
        type="button"
        disabled={!client.gmcp.sessionReady}
        onClick={() => timers.requestSnapshot()}
      >
        Refresh timers
      </button>
      {!client.gmcp.sessionReady ? (
        <p>Log in to view your timers.</p>
      ) : !snapshot.received ? (
        <p>Waiting for timer information…</p>
      ) : snapshot.timers.length === 0 ? (
        <p>No active timers.</p>
      ) : (
        <ul aria-label="Active timers">
          {snapshot.timers.map((timer) => (
            <li key={timer.id}>
              <strong>{timer.label}</strong>:{' '}
              {formatTimerRemaining(timerRemainingMs(timer, matchingClock ? serverNow : undefined))}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
