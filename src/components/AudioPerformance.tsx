import { useEffect, useState } from 'react';
import {
  captureAudioPerformance,
  type AudioPerformanceReading,
  type AudioPerformanceSample,
} from '../audio/audioPerformance';

interface Props {
  read: () => AudioPerformanceReading;
}
const MAX_SAMPLES = 120;
const display = (value: number | null, unit = '') =>
  value === null ? 'Unavailable' : `${Math.round(value * 10) / 10}${unit}`;

export default function AudioPerformance({ read }: Props) {
  const [samples, setSamples] = useState<AudioPerformanceSample[]>([]);
  const [baseline, setBaseline] = useState<AudioPerformanceSample | null>(null);
  const [markers, setMarkers] = useState<number[]>([]);
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState('');
  useEffect(() => {
    if (!recording) return;
    setSamples([]);
    setMarkers([]);
    setBaseline(null);
    let first = true;
    return captureAudioPerformance(read, (sample) => {
      if (first) {
        first = false;
        setBaseline(sample);
      }
      setSamples((previous) => [...previous, sample].slice(-MAX_SAMPLES));
    });
  }, [read, recording]);
  const latest = samples.at(-1);
  const underruns =
    latest && baseline && latest.underrunEvents !== null && baseline.underrunEvents !== null
      ? Math.max(0, latest.underrunEvents - baseline.underrunEvents)
      : null;

  const toggle = () => {
    setRecording(!recording);
    setStatus(
      recording
        ? 'Performance recording stopped.'
        : 'Performance recording started. Mark a crackle when you hear it.',
    );
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(
          {
            version: 1,
            createdAt: new Date().toISOString(),
            browser: navigator.userAgent,
            baseline,
            samples,
            crackleTimes: markers,
          },
          null,
          2,
        ),
      );
      setStatus('Performance report copied.');
    } catch {
      setStatus('Could not copy performance report. Try again.');
    }
  };
  return (
    <section aria-label="Playback performance">
      <h4>Playback performance</h4>
      <p>
        Record while playing, then mark a crackle when you hear one. Keeps the latest two minutes
        and up to 20 marks.
      </p>
      <div className="audio-diagnostics-controls">
        <button type="button" aria-pressed={recording} onClick={toggle}>
          {recording ? 'Stop recording' : 'Start recording'}
        </button>
        <button
          type="button"
          disabled={!recording}
          onClick={() => {
            setMarkers((previous) => [...previous, performance.now()].slice(-20));
            setStatus('Crackle marked.');
          }}
        >
          Mark crackle
        </button>
        <button type="button" disabled={!samples.length} onClick={() => void copy()}>
          Copy performance report
        </button>
      </div>
      <p role="status">{status}</p>
      {latest && (
        <dl>
          <dt>Audio context</dt>
          <dd>{latest.contextState}</dd>
          <dt>Underruns since recording started</dt>
          <dd>{display(underruns)}</dd>
          <dt>Latest UI timer delay</dt>
          <dd>{display(latest.timerDelayMs, ' ms')}</dd>
          <dt>Longest UI task in latest sample</dt>
          <dd>{display(latest.longestTaskMs, ' ms')}</dd>
          <dt>Output latency</dt>
          <dd>{display(latest.outputLatencyMs, ' ms')}</dd>
          <dt>Playing media sounds / tracked playbacks</dt>
          <dd>
            {latest.playingMediaSounds} / {latest.mediaPlaybacks}
          </dd>
        </dl>
      )}
      <p>
        Unavailable means this browser did not provide a measurement. UI delays are not CPU usage.
        Voice-chat tracks and system speech are separate from the media-sound count.
      </p>
    </section>
  );
}
