import type React from "react";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { isLayoutPose, type RoomLayout } from "../gmcp/Room";
import { stripMudAnsiTags } from "../stripMudAnsiTags";
import { tokenColours } from "../avatar/figure";
import {
  displayName,
  exitWall,
  isPerson,
  labelOrder,
  metres,
  nearestWall,
  frontDirection,
  bodyDirection,
  bodyFootprint,
  semanticDetails,
  type PlacedThing,
  placeLabels,
  scaleBarLength,
  shortLabel,
  thingForm,
  toSvg,
  type Wall,
} from "../map/roomLayout";

/**
 * The inside of a spatial room drawn to scale from Room.Layout, north up:
 * walls, doorways with their exit names, each thing's footprint from above,
 * people distinct and you marked. Zoom and pan move the viewBox, so lines and
 * text stay crisp. It is one image to a screen reader (its label sums it up);
 * RoomLayoutView's lists say the same in words.
 *
 * The drawing carries its own stylesheet, built on the client's colour
 * tokens with their values as fallbacks, so the saved file looks the same
 * outside the client.
 */

interface ViewBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface RoomLayoutPictureProps {
  layout: RoomLayout;
  placed: PlacedThing[];
  youId: string;
  label: string;
  onExit: (name: string) => void;
  /** Called with the drawing when the player asks to save it. */
  onSave: (svg: SVGSVGElement) => void;
}

/** The colour and font tokens the drawing uses; a saved file carries their current values. */
export const LAYOUT_TOKENS = [
  "--color-bg",
  "--color-bg-elevated",
  "--color-bg-surface",
  "--color-text",
  "--color-text-secondary",
  "--color-text-muted",
  "--color-primary",
  "--color-action",
  "--color-success",
  "--font-family-base",
] as const;

export const LAYOUT_STYLE = `
.room-layout-svg { font-family: var(--font-family-base, sans-serif); }
.room-layout-svg .rl-bg { fill: var(--color-bg, #14141a); }
.room-layout-svg .rl-floor { fill: var(--color-bg-elevated, #1a1a22); }
.room-layout-svg .rl-grid { stroke: var(--color-text-muted, #9999aa); stroke-opacity: 0.12; stroke-width: 1px; vector-effect: non-scaling-stroke; }
.room-layout-svg .rl-wall { fill: none; stroke: var(--color-text, #e8e8ed); stroke-width: 5px; vector-effect: non-scaling-stroke; stroke-linejoin: miter; }
.room-layout-svg .rl-door-gap { stroke: var(--color-bg-elevated, #1a1a22); stroke-width: 7px; vector-effect: non-scaling-stroke; }
.room-layout-svg .rl-door { stroke: var(--color-action, #fb923c); stroke-width: 2.5px; vector-effect: non-scaling-stroke; stroke-linecap: round; cursor: pointer; }
.room-layout-svg .rl-hatch { fill: var(--color-action, #fb923c); fill-opacity: 0.25; stroke: var(--color-action, #fb923c); stroke-width: 2px; vector-effect: non-scaling-stroke; cursor: pointer; }
.room-layout-svg .rl-door-hit { stroke: transparent; stroke-width: 18px; vector-effect: non-scaling-stroke; cursor: pointer; }
.room-layout-svg .rl-exit-label { fill: var(--color-action, #fb923c); font-weight: 700; letter-spacing: 0.02em; }
.room-layout-svg .rl-thing { fill: var(--color-bg-surface, #22222d); stroke: var(--color-text-muted, #9999aa); stroke-width: 1px; vector-effect: non-scaling-stroke; }
.room-layout-svg .rl-fixed .rl-thing { stroke: var(--color-text-secondary, #a0a0b0); stroke-width: 1.5px; }
.room-layout-svg .rl-mounted .rl-thing { fill: var(--color-text-secondary, #a0a0b0); fill-opacity: 0.55; stroke: none; }
.room-layout-svg .rl-person .rl-thing { fill: var(--color-success, #4ade80); fill-opacity: 0.85; stroke: var(--color-bg-elevated, #1a1a22); stroke-width: 1.5px; }
.room-layout-svg .rl-you .rl-thing { fill: var(--color-primary, #5ba0ff); fill-opacity: 1; }
.room-layout-svg .rl-person.rl-dressed .rl-thing { fill: var(--rl-body); fill-opacity: 1; }
.room-layout-svg .rl-head { fill: var(--rl-head); stroke: var(--color-bg-elevated, #1a1a22); stroke-width: 1px; vector-effect: non-scaling-stroke; }
.room-layout-svg .rl-you-ring { fill: none; stroke: var(--color-primary, #5ba0ff); stroke-width: 2px; stroke-opacity: 0.7; vector-effect: non-scaling-stroke; }
.room-layout-svg .rl-label { fill: var(--color-text-secondary, #a0a0b0); paint-order: stroke; stroke: var(--color-bg-elevated, #1a1a22); stroke-width: 3.5px; stroke-linejoin: round; vector-effect: non-scaling-stroke; }
.room-layout-svg .rl-label-person { fill: var(--color-text, #e8e8ed); font-weight: 600; }
.room-layout-svg .rl-label-you { fill: var(--color-primary, #5ba0ff); font-weight: 700; }
.room-layout-svg .rl-symbol { fill: var(--color-text-muted, #9999aa); fill-opacity: 0.8; }
.room-layout-svg .rl-symbol-line { fill: none; stroke: var(--color-text-muted, #9999aa); stroke-width: 1px; stroke-dasharray: 3 2; vector-effect: non-scaling-stroke; }
.room-layout-svg .rl-mark { fill: var(--color-text-muted, #9999aa); }
.room-layout-svg .rl-mark-line { stroke: var(--color-text-muted, #9999aa); stroke-width: 1.5px; vector-effect: non-scaling-stroke; fill: none; }
@media (forced-colors: active) {
  .room-layout-svg .rl-bg, .room-layout-svg .rl-floor, .room-layout-svg .rl-thing { fill: Canvas; }
  .room-layout-svg .rl-wall, .room-layout-svg .rl-thing, .room-layout-svg .rl-mark-line, .room-layout-svg .rl-symbol-line { stroke: CanvasText; }
  .room-layout-svg .rl-symbol { fill: CanvasText; }
  .room-layout-svg .rl-mounted .rl-thing, .room-layout-svg .rl-person .rl-thing { fill: CanvasText; }
  .room-layout-svg .rl-door, .room-layout-svg .rl-hatch, .room-layout-svg .rl-you-ring { stroke: Highlight; }
  .room-layout-svg .rl-you .rl-thing { fill: Highlight; }
  .room-layout-svg .rl-person.rl-dressed .rl-thing { fill: CanvasText; }
  .room-layout-svg .rl-you.rl-dressed .rl-thing { fill: Highlight; }
  .room-layout-svg .rl-head { fill: Canvas; stroke: CanvasText; }
  .room-layout-svg .rl-label, .room-layout-svg .rl-exit-label, .room-layout-svg .rl-mark { fill: CanvasText; stroke: Canvas; }
}
`;

/** The whole room plus a margin for exit names, the scale bar and the north arrow. */
export function baseViewBox(layout: RoomLayout): ViewBox {
  const [w, d] = layout.size;
  const pad = Math.max(0.6, Math.max(w, d) * 0.12);
  return { x: -w / 2 - pad, y: -d / 2 - pad, w: w + pad * 2, h: d + pad * 2 };
}

/** Label text height on screen, in CSS pixels, at every zoom. */
const LABEL_PIXELS = 12;

export function labelFontSize(layout: RoomLayout): number {
  return Math.min(0.6, Math.max(0.12, Math.max(layout.size[0], layout.size[1]) / 30));
}

const MIN_ZOOM_FRACTION = 1 / 25;

/** Zooms by `factor` (>1 zooms in) keeping (cx, cy) still; never wider than the whole room view. */
export function zoomViewBox(view: ViewBox, base: ViewBox, factor: number, cx: number, cy: number): ViewBox {
  const w = Math.min(base.w, Math.max(base.w * MIN_ZOOM_FRACTION, view.w / factor));
  const scale = w / view.w;
  const h = view.h * scale;
  return clampViewBox({ x: cx - (cx - view.x) * scale, y: cy - (cy - view.y) * scale, w, h }, base);
}

/** Keeps the view's centre inside the whole room view. */
export function clampViewBox(view: ViewBox, base: ViewBox): ViewBox {
  const cx = Math.min(base.x + base.w, Math.max(base.x, view.x + view.w / 2));
  const cy = Math.min(base.y + base.h, Math.max(base.y, view.y + view.h / 2));
  return { ...view, x: cx - view.w / 2, y: cy - view.h / 2 };
}

/** A client point in SVG units, for an svg drawn with preserveAspectRatio "xMidYMid meet". */
function clientToSvg(svg: SVGSVGElement, view: ViewBox, clientX: number, clientY: number): [number, number] {
  const rect = svg.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return [view.x + view.w / 2, view.y + view.h / 2];
  const scale = Math.min(rect.width / view.w, rect.height / view.h);
  const offsetX = (rect.width - view.w * scale) / 2;
  const offsetY = (rect.height - view.h * scale) / 2;
  return [view.x + (clientX - rect.left - offsetX) / scale, view.y + (clientY - rect.top - offsetY) / scale];
}

function svgUnitsPerPixel(svg: SVGSVGElement, view: ViewBox): number {
  const rect = svg.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return 0;
  return 1 / Math.min(rect.width / view.w, rect.height / view.h);
}

/** A doorway's ends on its wall, and the outward direction for its label. */
function doorwayGeometry(wall: Wall, at: [number, number, number], width: number, size: [number, number, number]) {
  const halfW = size[0] / 2;
  const halfD = size[1] / 2;
  const half = width / 2;
  switch (wall) {
    case "north":
      return { a: [at[0] - half, halfD], b: [at[0] + half, halfD], out: [0, 1] };
    case "south":
      return { a: [at[0] - half, -halfD], b: [at[0] + half, -halfD], out: [0, -1] };
    case "east":
      return { a: [halfW, at[1] - half], b: [halfW, at[1] + half], out: [1, 0] };
    case "west":
      return { a: [-halfW, at[1] - half], b: [-halfW, at[1] + half], out: [-1, 0] };
  }
}

/**
 * What a thing is, seen from above, drawn over its footprint: a table's leg
 * dots, a seat's back bar opposite its supplied front, a door's swing arc into
 * the room. Other forms are their footprint alone; things on the walls are
 * already wall marks.
 */
export function formSymbol(p: PlacedThing, size: [number, number, number]): React.ReactNode {
  const pose = p.thing.pose;
  const x = bodyDirection(p.thing, [1, 0, 0]);
  const y = bodyDirection(p.thing, [0, 1, 0]);
  if (isLayoutPose(pose) && pose.box && x && y) {
    const [w, d, h] = pose.dimensions_m;
    const local: PlacedThing = { ...p, thing: { ...p.thing, pose: { ...pose, body_quaternion: [1, 0, 0, 0] } },
      bounds: { x0: -w / 2, x1: w / 2, y0: -d / 2, y1: d / 2, z0: -h / 2, z1: h / 2 } };
    return <g transform={`matrix(${x[0]} ${-x[1]} ${-y[0]} ${y[1]} ${pose.centre_m[0]} ${-pose.centre_m[1]})`}>{flatFormSymbol(local, size)}</g>;
  }
  return flatFormSymbol(p, size);
}

function flatFormSymbol(p: PlacedThing, size: [number, number, number]): React.ReactNode {
  const { x0, x1, y0, y1 } = p.bounds;
  const w = x1 - x0;
  const d = y1 - y0;
  switch (thingForm(p.thing)) {
    case "table": {
      const r = Math.min(0.04, Math.min(w, d) / 6);
      const ix = Math.min(w * 0.12, 0.08);
      const iy = Math.min(d * 0.12, 0.08);
      const corners: Array<[string, number, number]> = [
        ["sw", x0 + ix, y0 + iy],
        ["se", x1 - ix, y0 + iy],
        ["nw", x0 + ix, y1 - iy],
        ["ne", x1 - ix, y1 - iy],
      ];
      return corners.map(([corner, x, y]) => {
        const [sx, sy] = toSvg(x, y);
        return <circle key={corner} className="rl-symbol" cx={sx} cy={sy} r={r} />;
      });
    }
    case "seat": {
      const front = frontDirection(p.thing);
      if (!front || Math.hypot(front[0], front[1]) < 1e-6) return null;
      const length = Math.hypot(front[0], front[1]);
      const fx = front[0] / length, fy = front[1] / length;
      const reach = Math.min(w, d) * 0.35;
      const cx = (x0 + x1) / 2 - fx * reach;
      const cy = (y0 + y1) / 2 - fy * reach;
      const [ax, ay] = toSvg(cx - fy * reach, cy + fx * reach);
      const [bx, by] = toSvg(cx + fy * reach, cy - fx * reach);
      return <line className="rl-mark-line" x1={ax} y1={ay} x2={bx} y2={by} />;
    }
    case "door": {
      // The leaf lies along its longer side; it swings about one end into the room.
      const wall = nearestWall(p.bounds, size);
      const alongX = w >= d;
      const length = alongX ? w : d;
      const into = wall === "north" || wall === "east" ? -1 : 1;
      const hinge: [number, number] = alongX
        ? [x0, wall === "north" ? y1 : y0]
        : [wall === "east" ? x1 : x0, y0];
      const points: string[] = [];
      for (let step = 0; step <= 8; step++) {
        const angle = (Math.PI / 2) * (step / 8);
        const along = Math.cos(angle) * length;
        const out = Math.sin(angle) * length * into;
        const [sx, sy] = alongX ? toSvg(hinge[0] + along, hinge[1] + out) : toSvg(hinge[0] + out, hinge[1] + along);
        points.push(`${sx},${sy}`);
      }
      const [hx, hy] = toSvg(hinge[0], hinge[1]);
      return <path className="rl-symbol-line" d={`M${points.join("L")}L${hx},${hy}`} />;
    }
    default:
      return null;
  }
}

const RoomLayoutPicture: React.FC<RoomLayoutPictureProps> = ({ layout, placed, youId, label, onExit, onSave }) => {
  const base = useMemo(() => baseViewBox(layout), [layout]);
  const [view, setView] = useState<ViewBox>(base);
  const [viewFor, setViewFor] = useState(layout.num);
  const ownRef = useRef<SVGSVGElement | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const dragStart = useRef<{ x: number; y: number; dragged: boolean } | null>(null);
  /** A doorway click sends its exit, unless the pointer was dragging the view. */
  const exitClick = (name: string) => () => {
    if (!dragStart.current?.dragged) onExit(name);
  };

  // A new room starts at the whole-room view; a refreshed layout of the same room keeps the zoom.
  if (viewFor !== layout.num) {
    setViewFor(layout.num);
    setView(base);
  }

  // The drawing's size on screen, so text stays LABEL_PIXELS tall at every zoom.
  const [screenSize, setScreenSize] = useState<{ w: number; h: number } | null>(null);
  useLayoutEffect(() => {
    const svg = ownRef.current;
    if (!svg || typeof ResizeObserver === "undefined") return;
    const measure = () => {
      const rect = svg.getBoundingClientRect();
      setScreenSize(rect.width > 0 && rect.height > 0 ? { w: rect.width, h: rect.height } : null);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(svg);
    return () => observer.disconnect();
  }, []);

  const [w, d] = layout.size;
  const fontSize = screenSize
    ? LABEL_PIXELS * Math.max(view.w / screenSize.w, view.h / screenSize.h)
    : labelFontSize(layout);
  const pad = -base.x - w / 2;

  const zoomAtCentre = (factor: number) =>
    setView((v) => zoomViewBox(v, base, factor, v.x + v.w / 2, v.y + v.h / 2));
  const pan = (fx: number, fy: number) =>
    setView((v) => clampViewBox({ ...v, x: v.x + v.w * fx, y: v.y + v.h * fy }, base));

  const onKeyDown = (event: React.KeyboardEvent<SVGSVGElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const actions: Record<string, () => void> = {
      "+": () => zoomAtCentre(1.25),
      "=": () => zoomAtCentre(1.25),
      "-": () => zoomAtCentre(0.8),
      _: () => zoomAtCentre(0.8),
      "0": () => setView(base),
      ArrowLeft: () => pan(-0.1, 0),
      ArrowRight: () => pan(0.1, 0),
      ArrowUp: () => pan(0, -0.1),
      ArrowDown: () => pan(0, 0.1),
    };
    const action = actions[event.key];
    if (!action) return;
    event.preventDefault();
    action();
  };

  const onWheel = (event: React.WheelEvent<SVGSVGElement>) => {
    const svg = ownRef.current;
    if (!svg || event.deltaY === 0) return;
    event.preventDefault();
    const [cx, cy] = clientToSvg(svg, view, event.clientX, event.clientY);
    setView((v) => zoomViewBox(v, base, Math.exp(-event.deltaY * 0.0015), cx, cy));
  };

  const onPointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 1) dragStart.current = { x: event.clientX, y: event.clientY, dragged: false };
  };

  const onPointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const svg = ownRef.current;
    const previous = pointers.current.get(event.pointerId);
    if (!svg || !previous) return;
    // Capture only once the pointer really drags, so a plain click still reaches a doorway.
    const start = dragStart.current;
    if (start && !start.dragged && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 4) {
      start.dragged = true;
      svg.setPointerCapture?.(event.pointerId);
    }
    const others = [...pointers.current.entries()].filter(([id]) => id !== event.pointerId).map(([, p]) => p);
    const now = { x: event.clientX, y: event.clientY };
    pointers.current.set(event.pointerId, now);
    if (others.length === 0) {
      const unit = svgUnitsPerPixel(svg, view);
      setView((v) => clampViewBox({ ...v, x: v.x - (now.x - previous.x) * unit, y: v.y - (now.y - previous.y) * unit }, base));
    } else if (others.length === 1) {
      const other = others[0];
      const before = Math.hypot(previous.x - other.x, previous.y - other.y);
      const after = Math.hypot(now.x - other.x, now.y - other.y);
      if (before === 0) return;
      const [cx, cy] = clientToSvg(svg, view, (now.x + other.x) / 2, (now.y + other.y) / 2);
      setView((v) => zoomViewBox(v, base, after / before, cx, cy));
    }
  };

  const onPointerEnd = (event: React.PointerEvent<SVGSVGElement>) => {
    pointers.current.delete(event.pointerId);
  };

  // Floor grid: one line per scale-bar step, so the bar measures the grid.
  const step = scaleBarLength(w);
  const grid: React.ReactNode[] = [];
  for (let x = Math.ceil(-w / 2 / step) * step; x < w / 2; x += step) {
    if (x > -w / 2) grid.push(<line key={`gx${x}`} className="rl-grid" x1={x} y1={-d / 2} x2={x} y2={d / 2} />);
  }
  for (let y = Math.ceil(-d / 2 / step) * step; y < d / 2; y += step) {
    if (y > -d / 2) grid.push(<line key={`gy${y}`} className="rl-grid" x1={-w / 2} y1={y} x2={w / 2} y2={y} />);
  }

  // Things lowest first, people last, so what stands on the floor is drawn over the rug under it.
  const ordered = [...placed].sort(
    (a, b) => Number(isPerson(a.thing)) - Number(isPerson(b.thing)) || a.bounds.z0 - b.bounds.z0,
  );

  // Every person is the same round token at their centre, so a body's collision box does not make one look bigger.
  const markerRadius = 0.22;
  /** A person's name goes beside their token (under it first), never on it: the token is in `avoid` below. */
  const underToken = (x: number, y: number) => ({ x, y, radius: markerRadius });
  const centreOf = (p: PlacedThing) => toSvg((p.bounds.x0 + p.bounds.x1) / 2, (p.bounds.y0 + p.bounds.y1) / 2);
  const labelled = labelOrder(placed, youId);
  const personIds = new Set([
    ...placed.filter((p) => isPerson(p.thing)).map((p) => p.thing.id),
  ]);
  const inset = fontSize * 0.2;
  const labels = placeLabels(
    [
      ...labelled.filter((p) => p.thing.id === youId || isPerson(p.thing)).map((p) => {
        const [x, y] = centreOf(p);
        return { id: p.thing.id, text: shortLabel(displayName(p.thing, youId)), ...underToken(x, y) };
      }),
      ...labelled.filter((p) => !isPerson(p.thing)).map((p) => {
        const [x, y] = centreOf(p);
        const radius = Math.max(p.bounds.x1 - p.bounds.x0, p.bounds.y1 - p.bounds.y0) / 2;
        return { id: p.thing.id, text: shortLabel(displayName(p.thing, youId)), x, y, radius };
      }),
    ],
    fontSize,
    { x0: -w / 2 + inset, x1: w / 2 - inset, y0: -d / 2 + inset, y1: d / 2 - inset },
    // No label covers a person's token.
    [
      ...placed.filter((p) => isPerson(p.thing)).map(centreOf),
      ].map(([x, y]) => ({ x0: x - markerRadius, x1: x + markerRadius, y0: y - markerRadius, y1: y + markerRadius })),
  );

  const exits = layout.exits.map((exit, index) => {
    const wall = exitWall(exit, layout.size);
    const key = `${exit.name}-${index}`;
    const exitName = stripMudAnsiTags(exit.name) || exit.name;
    const title = <title>{`Exit ${exitName}`}</title>;
    if (!wall) {
      const [x, y] = toSvg(exit.at[0], exit.at[1]);
      const r = Math.max(exit.width / 2, fontSize * 0.6);
      return (
        <g key={key} className="rl-exit" onClick={exitClick(exit.name)}>
          {title}
          <rect className="rl-hatch" x={x - r} y={y - r} width={r * 2} height={r * 2} />
          <text className="rl-exit-label" x={x} y={y + r + fontSize} fontSize={fontSize} textAnchor="middle">
            {exitName}
          </text>
        </g>
      );
    }
    const { a, b, out } = doorwayGeometry(wall, exit.at, exit.width, layout.size);
    const [ax, ay] = toSvg(a[0], a[1]);
    const [bx, by] = toSvg(b[0], b[1]);
    const [ox, oy] = toSvg(out[0], out[1]);
    const lx = (ax + bx) / 2 + ox * pad * 0.4;
    const ly = (ay + by) / 2 + oy * pad * 0.4 + fontSize * 0.35;
    return (
      <g key={key} className="rl-exit" onClick={exitClick(exit.name)}>
        {title}
        <line className="rl-door-gap" x1={ax} y1={ay} x2={bx} y2={by} />
        <line className="rl-door" x1={ax} y1={ay} x2={bx} y2={by} />
        <line className="rl-door-hit" x1={ax} y1={ay} x2={bx} y2={by} />
        <text className="rl-exit-label" x={lx} y={ly} fontSize={fontSize} textAnchor="middle">
          {exitName}
        </text>
      </g>
    );
  });

  // Scale bar under the room's south-west corner; north arrow beyond its north-east corner.
  const barY = d / 2 + pad * 0.55;
  const barX = -w / 2;
  const arrowX = w / 2 + pad * 0.5;
  const arrowY = -d / 2 - pad * 0.15;
  const arrow = Math.min(pad * 0.3, fontSize * 1.6);

  return (
    <div className="room-layout-picture">
    <div className="room-layout-controls">
      <button type="button" onClick={() => zoomAtCentre(1.25)}>
        Zoom in
      </button>
      <button type="button" onClick={() => zoomAtCentre(0.8)}>
        Zoom out
      </button>
      <button type="button" onClick={() => setView(base)}>
        Whole room
      </button>
      <button type="button" onClick={() => ownRef.current && onSave(ownRef.current)}>
        Save as SVG
      </button>
    </div>
    <svg
      ref={ownRef}
      className="room-layout-svg"
      role="img"
      aria-label={label}
      // Preact sets SVG props as attributes verbatim, and "tabIndex" is not an SVG attribute: it must be "tabindex".
      {...{ tabindex: 0 }}
      viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ aspectRatio: `${base.w} / ${base.h}` }}
      onKeyDown={onKeyDown}
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
    >
      <style>{LAYOUT_STYLE}</style>
      <rect className="rl-bg" x={base.x} y={base.y} width={base.w} height={base.h} />
      <rect className="rl-floor" x={-w / 2} y={-d / 2} width={w} height={d}><title>{layout.finishes?.floor ? `${layout.finishes.floor} floor` : "Floor"}</title></rect>
      <g>{grid}</g>
      <g>
        {ordered.map((p) => {
          const body = bodyFootprint(p.thing);
          const you = p.thing.id === youId;
          const className = [
            "rl-item",
            isPerson(p.thing) ? "rl-person" : "",
            you ? "rl-you" : "",
            p.thing.fixed && !isPerson(p.thing) ? "rl-fixed" : "",
            p.thing.mounted ? "rl-mounted" : "",
          ]
            .filter(Boolean)
            .join(" ");
          const [cx, cy] = centreOf(p);
          if (isPerson(p.thing)) {
            const r = markerRadius;
            // Seen from above: the body in the main garment's colour (or skin), the head in hair or head covering.
            const look = tokenColours(p.thing.appearance);
            const style: Record<string, string> = {};
            if (look?.body) style["--rl-body"] = look.body;
            if (look?.head) style["--rl-head"] = look.head;
            return (
              <g
                key={p.thing.id}
                className={look?.body ? `${className} rl-dressed` : className}
                data-id={p.thing.id}
                style={look ? (style as React.CSSProperties) : undefined}
              >
                <title>{[displayName(p.thing, youId), ...semanticDetails(p.thing)].join(", ")}</title>
                <circle className="rl-thing" cx={cx} cy={cy} r={r} />
                {look?.head && <circle className="rl-head" cx={cx} cy={cy} r={r * 0.5} />}
                {you && <circle className="rl-you-ring" cx={cx} cy={cy} r={r * 1.35} />}
              </g>
            );
          }
          return (
            <g key={p.thing.id} className={className} data-id={p.thing.id} data-form={thingForm(p.thing)}>
              <title>{[displayName(p.thing, youId), ...semanticDetails(p.thing)].join(", ")}</title>
              {body ? <polygon className="rl-thing" points={body.map(([x, y]) => toSvg(x, y).join(",")).join(" ")} /> : p.footprints.map((f, index) => {
                if (f.type === "circle") {
                  const [x, y] = toSvg(f.cx, f.cy);
                  return <circle key={index} className="rl-thing" cx={x} cy={y} r={f.r} />;
                }
                const [x, y] = toSvg(f.bounds.x0, f.bounds.y1);
                return (
                  <rect
                    key={index}
                    className="rl-thing"
                    x={x}
                    y={y}
                    width={f.bounds.x1 - f.bounds.x0}
                    height={f.bounds.y1 - f.bounds.y0}
                  />
                );
              })}
              {formSymbol(p, layout.size)}
            </g>
          );
        })}
      </g>
      <rect className="rl-wall" x={-w / 2} y={-d / 2} width={w} height={d} />
      <g>{exits}</g>
      <g>
        {labels.map((l) => (
          <g key={l.id}>
            <text
              className={
                l.id === youId ? "rl-label rl-label-you" : personIds.has(l.id) ? "rl-label rl-label-person" : "rl-label"
              }
              x={l.x}
              y={l.y + fontSize * 0.35}
              fontSize={fontSize}
              textAnchor="middle"
            >
              {l.text}
            </text>
          </g>
        ))}
      </g>
      <g className="rl-scale">
        <title>{`Scale: the bar is ${metres(step)}; grid lines are ${metres(step)} apart`}</title>
        <path className="rl-mark-line" d={`M${barX},${barY - fontSize * 0.3}V${barY}H${barX + step}V${barY - fontSize * 0.3}`} />
        <text className="rl-mark" x={barX + step + fontSize * 0.4} y={barY} fontSize={fontSize}>
          {metres(step)}
        </text>
      </g>
      <g className="rl-north">
        <title>North is up</title>
        <polygon
          className="rl-mark"
          points={`${arrowX},${arrowY - arrow} ${arrowX - arrow * 0.45},${arrowY + arrow * 0.5} ${arrowX},${arrowY + arrow * 0.2} ${arrowX + arrow * 0.45},${arrowY + arrow * 0.5}`}
        />
        <text className="rl-mark" x={arrowX} y={arrowY - arrow - fontSize * 0.3} fontSize={fontSize} textAnchor="middle">
          N
        </text>
      </g>
    </svg>
    </div>
  );
};

export default RoomLayoutPicture;

/**
 * The drawing as a standalone SVG file: the whole room (not the current
 * zoom), the client's current token values set on the root so its own
 * stylesheet resolves to the colours on screen, and a title.
 */
export function standaloneSvg(svg: SVGSVGElement, title: string, tokenSource: Element = document.documentElement): string {
  const copy = svg.cloneNode(true) as SVGSVGElement;
  const background = copy.querySelector(".rl-bg");
  if (background) {
    const x = Number(background.getAttribute("x"));
    const y = Number(background.getAttribute("y"));
    const w = Number(background.getAttribute("width"));
    const h = Number(background.getAttribute("height"));
    copy.setAttribute("viewBox", `${x} ${y} ${w} ${h}`);
    const pixelsPerMetre = 900 / Math.max(w, h);
    copy.setAttribute("width", String(Math.round(w * pixelsPerMetre)));
    copy.setAttribute("height", String(Math.round(h * pixelsPerMetre)));
  }
  copy.removeAttribute("tabindex");
  const computed = getComputedStyle(tokenSource);
  const declarations = LAYOUT_TOKENS.map((token) => [token, computed.getPropertyValue(token).trim()])
    .filter(([, value]) => value)
    .map(([token, value]) => `${token}: ${value}`)
    .join("; ");
  if (declarations) copy.setAttribute("style", declarations);
  const titleElement = document.createElementNS("http://www.w3.org/2000/svg", "title");
  titleElement.textContent = title;
  copy.insertBefore(titleElement, copy.firstChild);
  return `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(copy)}\n`;
}
