import { useCharacterStatusStore } from "../stores/characterStatusStore";
import { useConnectionStore } from "../stores/connectionStore";
import './statusbar.css'; // Ensure CSS is imported

const Statusbar: React.FC = () => {
  const statusText = useConnectionStore((state) => state.statusText);
  const vitals = useCharacterStatusStore((state) => state.vitals);

  // Derive connection state for the status dot
  const connectionState = statusText === "Connected"
    ? "connected"
    : statusText === "Disconnected" || statusText === "Not connected"
      ? "disconnected"
      : "connecting";

  // Helper to format vitals
  const formatVital = (current?: string, max?: string): string | null => {
    if (current === undefined || max === undefined) return null;
    return `${current}/${max}`;
  };

  // Helper to get vital color class based on HP ratio
  const getVitalClass = (current?: string, max?: string): string => {
    if (current === undefined || max === undefined) return "";
    const cur = parseFloat(current);
    const mx = parseFloat(max);
    if (mx <= 0) return "";
    const ratio = cur / mx;
    if (ratio > 0.66) return "vital-good";
    if (ratio > 0.33) return "vital-warning";
    return "vital-danger";
  };

  const hp = formatVital(vitals?.hp, vitals?.maxhp);
  const mp = formatVital(vitals?.mp, vitals?.maxmp);
  const hpClass = getVitalClass(vitals?.hp, vitals?.maxhp);
  const mpClass = getVitalClass(vitals?.mp, vitals?.maxmp);
  return (
    <div className="statusbar">
      <span className={`status-dot ${connectionState}`} />
      <span className="status-connection">{statusText}</span>
      {vitals && (
        <span className="status-vitals">
          {hp && <> HP: <span className={hpClass}>{hp}</span></>}
          {mp && <> MP: <span className={mpClass}>{mp}</span></>}
        </span>
      )}
    </div>
  );
};

export default Statusbar;
