import type React from "react";
import { useMemo } from "react";
import { directionLabel, directionStep } from "../map/directions";
import { layoutArea, type MapData, type PlacedRoom } from "../map/mapGraph";

/**
 * The drawn map: the current room's area and level, laid out from exit
 * directions, in a window around the player. It is one image to a screen
 * reader (its label says what it shows); the Map tab's lists and Go to are
 * the way to read and use the map without it.
 */
interface MapPictureProps {
  map: MapData;
  currentRoomId: number;
  onRoomClick: (roomId: number) => void;
}

const CELL = 32;
const ROOM = 18;
const VIEW_RADIUS = 7;

const MapPicture: React.FC<MapPictureProps> = ({ map, currentRoomId, onRoomClick }) => {
  const current = map.rooms[String(currentRoomId)];
  const placed = useMemo(() => (current ? layoutArea(map, current.area) : new Map<number, PlacedRoom>()), [map, current]);
  const here = placed.get(currentRoomId);
  if (!current || !here) return null;

  const level = [...placed.values()].filter((p) => p.z === here.z);
  const visible = level.filter(
    (p) => Math.abs(p.x - here.x) <= VIEW_RADIUS && Math.abs(p.y - here.y) <= VIEW_RADIUS,
  );
  const centre = (v: number, origin: number) => (v - origin + VIEW_RADIUS) * CELL + CELL / 2;
  const cx = (x: number) => centre(x, here.x);
  const cy = (y: number) => centre(y, here.y);
  const size = (VIEW_RADIUS * 2 + 1) * CELL;

  const lines: React.ReactNode[] = [];
  const marks: React.ReactNode[] = [];
  const drawn = new Set<string>();
  for (const p of visible) {
    for (const [key, to] of Object.entries(p.room.exits)) {
      const step = directionStep(key);
      const target = placed.get(to);
      if (step && step.dz !== 0) {
        const dy = step.dz > 0 ? -ROOM / 2 - 5 : ROOM / 2 + 5;
        marks.push(
          <polygon
            key={`${p.room.id}-${key}`}
            className="map-level-mark"
            points={`${cx(p.x) - 4},${cy(p.y) + dy + (step.dz > 0 ? 3 : -3)} ${cx(p.x) + 4},${cy(p.y) + dy + (step.dz > 0 ? 3 : -3)} ${cx(p.x)},${cy(p.y) + dy - (step.dz > 0 ? 3 : -3)}`}
          />,
        );
      } else if (target && target.z === p.z) {
        const pair = p.room.id < to ? `${p.room.id}-${to}` : `${to}-${p.room.id}`;
        if (drawn.has(pair)) continue;
        drawn.add(pair);
        lines.push(
          <line key={`${p.room.id}-${key}`} className="map-exit" x1={cx(p.x)} y1={cy(p.y)} x2={cx(target.x)} y2={cy(target.y)} />,
        );
      } else if (step) {
        lines.push(
          <line
            key={`${p.room.id}-${key}`}
            className={target ? "map-exit" : "map-exit map-exit-unknown"}
            x1={cx(p.x)}
            y1={cy(p.y)}
            x2={cx(p.x) + step.dx * (CELL / 2)}
            y2={cy(p.y) + step.dy * (CELL / 2)}
          />,
        );
      }
    }
  }

  const label = `Map of ${current.area || "this area"}${here.z !== 0 ? `, level ${here.z}` : ""}: ` +
    `${level.length} known ${level.length === 1 ? "room" : "rooms"} on this level. You are in ${current.name}.`;

  return (
    <svg
      className="map-picture"
      role="img"
      aria-label={label}
      viewBox={`0 0 ${size} ${size}`}
      width="100%"
      preserveAspectRatio="xMidYMid meet"
    >
      <g>
        {lines}
        {visible.map((p) => {
          const exits = Object.keys(p.room.exits).map(directionLabel).join(", ");
          return (
            <rect
              key={p.room.id}
              className={[
                "map-room",
                p.room.id === currentRoomId ? "map-room-current" : "",
                p.room.environment ? `map-env-${p.room.environment.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` : "",
              ].join(" ").trim()}
              x={cx(p.x) - ROOM / 2}
              y={cy(p.y) - ROOM / 2}
              width={ROOM}
              height={ROOM}
              onClick={() => onRoomClick(p.room.id)}
            >
              <title>{exits ? `${p.room.name} (exits: ${exits})` : p.room.name}</title>
            </rect>
          );
        })}
        {marks}
      </g>
    </svg>
  );
};

export default MapPicture;
