import { useEffect, useRef, useState } from 'react';
import { announce } from '@react-aria/live-announcer';
import type MudClient from '../client';
import { useSharedMediaStore } from '../stores/sharedMediaStore';
import { shouldSpeak } from '../channelReading';
import { usePreferences } from '../stores/preferencesStore';
import { loadStoredValue, saveStoredValue } from '../persistence';
const readingSchema = {
  key: 'media-cue-reading',
  version: 1,
  migrate: (value: unknown) => (typeof value === 'boolean' ? value : undefined),
};
export default function SharedMediaPanel({ client }: { client: MudClient }) {
  const sources = useSharedMediaStore((state) => state.sources);
  const [read, setRead] = useState(() => loadStoredValue(readingSchema, false));
  const [error, setError] = useState('');
  const readIds = useRef(new Set<string>());
  useEffect(() => {
    const retained = new Set<string>();
    const identityFor = (source: (typeof sources)[string], id: string) =>
      JSON.stringify([source.sourceId, source.discontinuity, id]);
    for (const source of Object.values(sources))
      for (const id of source.retainedCueIds) retained.add(identityFor(source, id));
    for (const id of readIds.current) if (!retained.has(id)) readIds.current.delete(id);
    for (const source of Object.values(sources))
      for (const cue of source.cues) {
        const identity = identityFor(source, cue.id);
        if (
          read &&
          !readIds.current.has(identity) &&
          shouldSpeak(usePreferences.getState().speech.autoreadMode, document.hasFocus())
        )
          announce(cue.text, 'polite');
        readIds.current.add(identity);
      }
  }, [sources, read]);
  return (
    <section aria-label="Shared media">
      <h3>Shared media</h3>
      {error && <p role="alert">{error}</p>}
      <label>
        <input
          type="checkbox"
          checked={read}
          onChange={(event) => {
            const value = event.currentTarget.checked;
            setRead(value);
            saveStoredValue(readingSchema, value);
          }}
        />
        Read captions using my reading preference
      </label>
      {!Object.keys(sources).length ? (
        <p>No shared media nearby.</p>
      ) : (
        <ul aria-label="Shared sources">
          {Object.values(sources).map((source) => (
            <li key={source.key}>
              <h4>{source.title}</h4>
              <p>
                {source.state}
                {source.message ? `: ${source.message}` : ''}
              </p>
              <button type="button" onClick={() => client.media.pauseSharedMedia(source.key)}>
                Pause here
              </button>{' '}
              <button
                type="button"
                onClick={() => {
                  setError('');
                  void client.media
                    .resumeSharedMedia(source.key)
                    .catch(() => setError('Audio could not resume. Try again.'));
                }}
              >
                Resume here
              </button>
              {source.cues.length > 0 && (
                <ul aria-label="Current captions">
                  {source.cues.map((cue) => (
                    <li key={cue.id}>{cue.text}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
