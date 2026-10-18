import type React from "react";
import { useMemo, useState } from "react";
import { announce } from "@react-aria/live-announcer";
import type MudClient from "../client";
import { compareDirections, directionLabel } from "../map/directions";
import type { MapRoom } from "../map/mapGraph";
import { cancelWalk, startWalk } from "../map/walker";
import { useMapStore } from "../stores/mapStore";
import { stripMudAnsiTags } from "../stripMudAnsiTags";
import MapPicture from "./MapPicture";
import "./MapPanel.css";

/**
 * The Map tab. Text first: where you are and where each exit leads, then Go
 * to, which walks to any room you have visited, then the drawn map. Only
 * rooms this character has been in are known.
 */
interface MapPanelProps {
  client: MudClient;
}

const plain = (text: string) => stripMudAnsiTags(text);

const MapPanel: React.FC<MapPanelProps> = ({ client }) => {
  const map = useMapStore((state) => state.map);
  const currentRoomId = useMapStore((state) => state.currentRoomId);
  const walk = useMapStore((state) => state.walk);
  const [targetId, setTargetId] = useState("");
  const [status, setStatus] = useState("");

  const current = currentRoomId === null ? undefined : map.rooms[String(currentRoomId)];

  // Known rooms grouped by area, the current area first; a repeated name gets its room number.
  const groups = useMemo(() => {
    const rooms = Object.values(map.rooms);
    const nameCount = new Map<string, number>();
    for (const room of rooms) nameCount.set(room.name, (nameCount.get(room.name) ?? 0) + 1);
    const byArea = new Map<string, Array<{ room: MapRoom; label: string }>>();
    for (const room of rooms) {
      const label = (nameCount.get(room.name) ?? 0) > 1 ? `${plain(room.name)} (${room.id})` : plain(room.name);
      const entries = byArea.get(room.area) ?? [];
      entries.push({ room, label });
      byArea.set(room.area, entries);
    }
    return [...byArea.entries()]
      .map(([area, entries]) => ({ area, entries: entries.sort((a, b) => a.label.localeCompare(b.label)) }))
      .sort((a, b) =>
        a.area === current?.area ? -1 : b.area === current?.area ? 1 : a.area.localeCompare(b.area));
  }, [map, current?.area]);

  const go = (roomId: number) => {
    const message = startWalk(client, roomId);
    setStatus(message);
    announce(message, "polite");
  };

  if (!current) {
    return (
      <section className="map-panel" aria-labelledby="map-heading">
        <h4 id="map-heading">Map</h4>
        <p>No room yet. The map fills in as you walk.</p>
      </section>
    );
  }

  const exits = Object.entries(current.exits).sort(([a], [b]) => compareDirections(a, b));
  const knownCount = Object.keys(map.rooms).length;

  return (
    <section className="map-panel" aria-labelledby="map-heading">
      <h4 id="map-heading">Map</h4>

      <section aria-labelledby="map-here-heading">
        <h5 id="map-here-heading">Here</h5>
        <p>
          {plain(current.name)}
          {current.area && `, ${plain(current.area)}`}
          {current.environment && ` (${current.environment.toLowerCase()})`}
        </p>
        {exits.length === 0 ? (
          <p>No exits known.</p>
        ) : (
          <ul className="map-exits" aria-label="Exits">
            {exits.map(([key, to]) => {
              const destination = map.rooms[String(to)];
              return (
                <li key={key}>
                  <button type="button" onClick={() => client.sendCommand(key)}>
                    {directionLabel(key)}
                  </button>{" "}
                  {destination ? `to ${plain(destination.name)}` : "not visited"}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="map-goto-heading">
        <h5 id="map-goto-heading">Go to</h5>
        <form
          className="map-goto"
          onSubmit={(event) => {
            event.preventDefault();
            if (targetId) go(Number(targetId));
          }}
        >
          <label htmlFor="map-target">Visited room</label>
          <select id="map-target" value={targetId} onChange={(event) => setTargetId(event.currentTarget.value)}>
            <option value="">Choose a room ({knownCount} visited)</option>
            {groups.map(({ area, entries }) => (
              <optgroup key={area} label={plain(area) || "No area"}>
                {entries.map(({ room, label }) => (
                  <option key={room.id} value={String(room.id)}>
                    {label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <button type="submit" disabled={!targetId || walk !== null}>
            Go
          </button>
          {walk && (
            <button type="button" onClick={cancelWalk}>
              Stop
            </button>
          )}
        </form>
        {walk ? (
          <p>
            Walking to {plain(map.rooms[String(walk.targetId)]?.name ?? "")},{" "}
            {walk.steps.length + 1} {walk.steps.length === 0 ? "step" : "steps"} left.
          </p>
        ) : (
          status && <p>{status}</p>
        )}
      </section>

      <section aria-labelledby="map-picture-heading">
        <h5 id="map-picture-heading">Picture</h5>
        <MapPicture map={map} currentRoomId={current.id} onRoomClick={go} />
      </section>
    </section>
  );
};

export default MapPanel;
