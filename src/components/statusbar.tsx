import { useEffect, useState } from "react";
import {
  meterValueAt,
  metersMoving,
  percentOf,
  useCharacterStatusStore,
  type MeterKind,
} from "../stores/characterStatusStore";
import { useConnectionStore } from "../stores/connectionStore";
import { describeMeter, describeTarget } from "../status/statusText";
import './statusbar.css'; // Ensure CSS is imported

// How often a meter that is moving by its rate is redrawn.
const METER_REDRAW_MS = 1000;

function levelClass(percent: number): string {
  if (percent > 66) return "vital-good";
  if (percent > 33) return "vital-warning";
  return "vital-danger";
}

/** A bar for sight and the same percent and words as text, so colour is never the only cue. */
function StatusMeter({ kind, percent, text }: { kind: MeterKind | "target"; percent: number; text: string }) {
  return (
    <span className={`status-meter status-meter-${kind}`}>
      <span className="status-meter-bar" aria-hidden="true">
        <span className={`status-meter-fill ${levelClass(percent)}`} style={{ width: `${percent}%` }} />
      </span>
      <span className="status-meter-text">{text}</span>
    </span>
  );
}

const Statusbar: React.FC = () => {
  const statusText = useConnectionStore((state) => state.statusText);
  const latency = useConnectionStore((state) => state.latency);
  const meters = useCharacterStatusStore((state) => state.meters);
  const metersAt = useCharacterStatusStore((state) => state.metersAt);
  const effects = useCharacterStatusStore((state) => state.effects);
  const target = useCharacterStatusStore((state) => state.target);
  const [now, setNow] = useState(() => performance.now());

  useEffect(() => {
    setNow(performance.now());
    if (!metersMoving(meters, metersAt, performance.now())) return;
    const timer = window.setInterval(() => {
      const current = performance.now();
      setNow(current);
      if (!metersMoving(meters, metersAt, current)) window.clearInterval(timer);
    }, METER_REDRAW_MS);
    return () => window.clearInterval(timer);
  }, [meters, metersAt]);

  // Derive connection state for the status dot
  const connectionState = statusText === "Connected"
    ? "connected"
    : statusText === "Disconnected" || statusText === "Not connected"
      ? "disconnected"
      : "connecting";

  // The first draw after new meters can run before the effect updates the clock.
  const shownAt = Math.max(now, metersAt);
  const hasStatus = meters.length > 0 || target !== null || (effects?.length ?? 0) > 0;
  return (
    <div className="statusbar">
      <span className={`status-dot ${connectionState}`} />
      <span className="status-connection">{statusText}</span>
      {latency.status !== 'unavailable' && (
        <span className="status-latency" title="Round-trip time to the game, including network and server processing">
          {latency.status === 'current' ? `Ping: ${latency.rttMs} ms` :
            latency.status === 'stale' ? 'Ping: no reply' : 'Ping: measuring'}
        </span>
      )}
      {hasStatus && (
        <span className="status-vitals" role="group" aria-label="Status">
          {meters.map((meter) => (
            <StatusMeter key={meter.id} kind={meter.kind}
              percent={percentOf(meterValueAt(meter, metersAt, shownAt), meter.max)}
              text={describeMeter(meter, metersAt, shownAt)} />
          ))}
          {target && (
            <StatusMeter kind="target" percent={Math.round(target.value * 100)}
              text={`Target: ${describeTarget(target)}`} />
          )}
          {effects && effects.length > 0 && (
            <ul className="status-effects" aria-label="Effects">
              {effects.map((effect) => (
                <li key={`${effect.section}|${effect.name}|${effect.source}`} className="status-effect"
                  title={effect.source ? `${effect.section}: from ${effect.source}` : effect.section}>
                  {effect.name}
                </li>
              ))}
            </ul>
          )}
        </span>
      )}
    </div>
  );
};

export default Statusbar;
