import type React from "react";
import { Children, cloneElement, isValidElement } from "react";
import { overlayHex } from "./colour";
import { BUILDS, type FigureParams, type HairTexture, figureParams, appearanceRecord, HORN_TONE, STUBBLE_OPACITY, vocabKey } from "./figure";
import { resolvePlan } from "./bodyPlan";
import { planPortraitElements } from "./planPortrait";

/**
 * A head-and-shoulders portrait of a person drawn in SVG from their Room.Layout
 * `appearance`, with the same colours and part choices as the 3D figure. Skin and
 * clothing regions are outlined in the figure's ink, so neighbouring regions stay apart
 * whatever their colours; hair regions in the hair's own tone off the skin, their body
 * shaded toward the sheen where hair and skin are alike; what is drawn on the face (pupils, nose, mouth,
 * marks, features) is in the face ink, which stands out on the skin. Decorative: hidden from the accessibility tree,
 * because the words beside it say who it is.
 */

export interface PortraitProps {
  appearance: unknown;
  /** Rendered size in CSS pixels. */
  size?: number;
  /** Show the head alone (true) or the whole picture (false); by default the head alone below HEAD_CROP_BELOW pixels. */
  crop?: boolean;
  className?: string;
}

/**
 * The disc behind every portrait: one fixed mid grey, not taken from the
 * appearance. It reaches 3:1 against both near-black and near-white hair, which
 * the client's dark (or a light) page does not.
 */
export const PORTRAIT_BACKDROP = "#707080";

const isRecord =(value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const word = (value: unknown): string =>
  typeof value === "string" ? value.trim().toLowerCase().replace(/[\s-]+/g, "_") : "";

/** Areas of a mark drawn on a head-and-shoulders picture, and where. */
const MARK_PLACES: Readonly<Record<string, [number, number]>> = {
  forehead: [32, 18],
  // Below the right lens of glasses, which reach down to y 31.4.
  face: [40, 35],
  cheek: [40, 35],
  cheeks: [40, 35],
  head: [32, 14],
  neck: [34, 41],
  ear: [17.5, 33],
  left_ear: [46.5, 33],
  right_ear: [17.5, 33],
  nose: [33.5, 32],
};

/** `face.ears` sizes: the left ear's centre x (the right mirrors it about x 32) and its half width and height; pointed ears are drawn as points. */
const EARS: Readonly<Record<string, { x: number; rx: number; ry: number }>> = {
  average: { x: 17.5, rx: 2.6, ry: 4 },
  small: { x: 18.6, rx: 1.8, ry: 2.7 },
  large: { x: 16.3, rx: 3.6, ry: 5.6 },
};

function headShape(shape: string, fill: string, stroke: string): React.ReactElement {
  const common = { className: "avatar-skin", fill, stroke, strokeWidth: 1.2 };
  switch (shape) {
    case "round":
      return <ellipse {...common} cx={32} cy={28} rx={14} ry={14.5} />;
    case "square":
      return <rect {...common} x={19} y={12} width={26} height={32} rx={6} />;
    case "long":
      return <ellipse {...common} cx={32} cy={28} rx={12} ry={17} />;
    case "heart":
      return <path {...common} d="M19,22 C19,10 45,10 45,22 C45,32 38,42 32,44 C26,42 19,32 19,22 Z" />;
    case "angular":
      // Flat planes meeting at corners below the cheekbones: a sharp jaw and a pointed chin.
      return <path {...common} strokeLinejoin="round" d="M18,27 C18,9 46,9 46,27 L40,39 L32,44 L24,39 Z" />;
    default:
      return <ellipse {...common} cx={32} cy={28} rx={13} ry={16} />;
  }
}

/** A round number for SVG path text. */
const n = (x: number) => Math.round(x * 100) / 100;

type Pt = [number, number];
const pt = ([x, y]: Pt) => `${n(x)},${n(y)}`;

/**
 * Points along the top of the head from the left of the face at y 27, over the crown, to the right: a squared-off
 * dome (a superellipse) `w` to each side and reaching up to `top`, so it covers the crown and the shoulders of the
 * head of every face shape, the square face's corners too. A plain arch reached only y 15.75 on heads whose tops are
 * at 11 to 13.5, and short hair read as a band across a bald crown.
 */
function domePoints(w: number, top: number, count: number, k = 1): Pt[] {
  // Sampled finely, then `count` + 1 points picked at even steps along it, so curls and waves are even in size.
  const fine: Pt[] = [];
  for (let i = 0; i <= 240; i++) {
    const a = Math.PI * (1 + i / 240);
    const c = Math.cos(a);
    const s = Math.sin(a);
    fine.push([32 + w * k * Math.sign(c) * Math.abs(c) ** (2 / 3), 27 - (27 - top) * k * Math.abs(s) ** (2 / 3)]);
  }
  const along = [0];
  for (let i = 1; i < fine.length; i++) along.push(along[i - 1] + Math.hypot(fine[i][0] - fine[i - 1][0], fine[i][1] - fine[i - 1][1]));
  const total = along[along.length - 1];
  const out: Pt[] = [];
  let j = 0;
  for (let i = 0; i <= count; i++) {
    const want = (total * i) / count;
    while (j < fine.length - 2 && along[j + 1] < want) j++;
    const t = Math.min(1, (want - along[j]) / (along[j + 1] - along[j] || 1));
    out.push([fine[j][0] + (fine[j + 1][0] - fine[j][0]) * t, fine[j][1] + (fine[j + 1][1] - fine[j][1]) * t]);
  }
  return out;
}

/** A smooth curve through the points (as cubic segments, Catmull-Rom), from the first to the last; the first is not moved to. */
function through(points: Pt[]): string {
  let d = "";
  for (let i = 0; i < points.length - 1; i++) {
    const [p0, p1, p2, p3] = [points[Math.max(0, i - 1)], points[i], points[i + 1], points[Math.min(points.length - 1, i + 2)]];
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${pt(c1)} ${pt(c2)} ${pt(p2)}`;
  }
  return d;
}

/**
 * Scallops between each pair of points, bulging away from `centre` by `depth` times the gap between them: the edge of
 * a mass of curls (round scallops) or coils (smaller, shallower ones). One outline round the whole mass, never a ring
 * of separately outlined curls, which read as beads.
 */
function scallops(points: Pt[], depth: number, centre: Pt): string {
  let d = "";
  for (let i = 0; i < points.length - 1; i++) {
    const [a, b] = [points[i], points[i + 1]];
    const mid: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const gap = Math.hypot(b[0] - a[0], b[1] - a[1]);
    // The normal to the gap, turned to point away from the centre.
    let [nx, ny] = [(a[1] - b[1]) / gap, (b[0] - a[0]) / gap];
    if (nx * (mid[0] - centre[0]) + ny * (mid[1] - centre[1]) < 0) [nx, ny] = [-nx, -ny];
    const h = depth * gap * (4 / 3);
    d += ` C${pt([a[0] + nx * h, a[1] + ny * h])} ${pt([b[0] + nx * h, b[1] + ny * h])} ${pt(b)}`;
  }
  return d;
}

/** Curls (`curly`) and coils (`coily`): how many scallops round the top of the head, and how deep. */
const CURLS: Readonly<Partial<Record<HairTexture, { count: number; depth: number }>>> = { curly: { count: 11, depth: 0.42 }, coily: { count: 17, depth: 0.32 } };

/**
 * How the cap lies for each kind of hair: `cropped` close over the crown with the forehead clear; `short` fuller on
 * top, with a fringe of locks (waves, curls) over the forehead; `full` the cap of hair to the jaw and longer, and of
 * tied styles. Its top, its half width at `v` 1, and how high the hairline comes at the middle of the forehead.
 */
type CapBand = "cropped" | "short" | "full";
const CAP_BANDS: Readonly<Record<CapBand, { top: number; width: number; hairline: number }>> = {
  cropped: { top: 10.2, width: 14.6, hairline: 17 },
  // Short hair stands 3.2 higher and 2.2 wider than cropped: at 1.6 and 0.8 the two differed only modestly on light skin.
  short: { top: 7, width: 16.8, hairline: 20 },
  full: { top: 9.5, width: 14.6, hairline: 20 },
};

/**
 * A short cut's fringe, from the right temple to the left: locks whose tips come down to y 21, above the brows (their
 * tops at about 22.3), and notches between them at 18.8; pointed for straight hair, rounded waves for wavy, small
 * scallops for curls and coils.
 */
function fringe(texture: HairTexture, width: number): string {
  const tips: Pt[] = [[40.2, 21], [35.4, 21.2], [30.6, 21], [25.8, 21.2]];
  const notches: Pt[] = [[37.8, 18.8], [33, 18.9], [28.2, 18.8]];
  const curls = CURLS[texture];
  const left: Pt = [32 - width, 27];
  const way: Pt[] = [[44, 20.4], ...tips.flatMap((t, i) => (i < notches.length ? [t, notches[i]] : [t])), [20, 20.4]];
  // Down the right temple to the fringe's end, along the fringe, and down the left temple.
  let d = ` C${pt([32 + width, 23])} ${pt([45.5, 21.5])} ${pt(way[0])}`;
  if (curls) {
    // Curls along the hairline, each bulging down onto the forehead (away from a point above the head).
    // Curls 4.4 apart, so each comes down about 2 units, to y 21 at most.
    d += scallops([[44, 20.4], [39.6, 18.9], [35.2, 18.9], [30.8, 18.9], [26.4, 18.9], [22, 19.2], [20, 20.4]], curls.depth, [32, 10]);
  } else {
    for (let i = 1; i < way.length; i++) {
      const [a, b] = [way[i - 1], way[i]];
      d += texture === "wavy" ? ` Q${pt([(a[0] + b[0]) / 2, Math.max(a[1], b[1]) + 1.2])} ${pt(b)}` : ` L${pt(b)}`;
    }
  }
  return `${d} C${pt([18.5, 21.5])} ${pt([32 - width, 23])} ${pt(left)}`;
}

/**
 * The hair over the top of the head, by texture, `v` times as bulky as straight hair, lying as its band does
 * (`CAP_BANDS`): one mass over the crown, its edge smooth, in waves, or scalloped with curls or coils, with strands,
 * waves or curl marks inside. Tied styles use the full cap at `v` 1 as their close cap. Only its outer edge, against
 * the backdrop, is drawn in the edge tone: a stroke along the hairline was a grey band across the forehead that made
 * dark hair on dark skin a beanie.
 */
function hairCap(texture: HairTexture, v: number, fill: string, ink: string, sheen: string, band: CapBand = "full"): React.ReactNode {
  const shape = CAP_BANDS[band];
  const top = shape.top - (v - 1) * 10;
  const width = shape.width * v;
  const hairline = shape.hairline;
  const start = `M${n(32 - width)},27`;
  const curls = CURLS[texture];
  let close = ` C38,${hairline} 26,${hairline} ${n(32 - width)},27 Z`;
  if (band === "short") close = `${fringe(texture, width)} Z`;
  else if (band === "cropped" && curls) {
    // Close curls or coils end along the forehead in curls too, each bulging down onto it; one smooth curve there read
    // as the brim of a cap at 48 px.
    const count = texture === "coily" ? 10 : 7;
    const [a, b, c, d]: Pt[] = [[32 + width, 27], [38, hairline], [26, hairline], [32 - width, 27]];
    const points = Array.from({ length: count + 1 }, (_, i) => {
      const t = i / count;
      const u = 1 - t;
      return [u ** 3 * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t ** 3 * d[0], u ** 3 * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t ** 3 * d[1]] as Pt;
    });
    close = `${scallops(points, curls.depth, [32, 5])} Z`;
  } else if (band === "full" && curls) {
    // Curls and coils of chin length and longer come down each temple beside the face to y 29.5, then run across the
    // forehead in curls: closed by one smooth curve from the mass's outer corners, their lower edge was a straight brim
    // sticking out past the face, a woolly hat's.
    const side = (s: number): Pt[] => [[32 + s * width, 27], [32 + s * 13.6, 29.5], [32 + s * 12.6, 24.5], [32 + s * 11, hairline + 0.6]];
    const right = side(1);
    const left = side(-1).reverse();
    const count = texture === "coily" ? 9 : 6;
    const across: Pt[] = Array.from({ length: count + 1 }, (_, i) => [right[3][0] + ((left[0][0] - right[3][0]) * i) / count, right[3][1] - Math.sin((Math.PI * i) / count)]);
    // Down the right temple bulging onto the face, across the forehead bulging down, up the left temple.
    close = `${scallops(right, curls.depth, [32 + 20, 26])}${scallops(across, curls.depth, [32, 5])}${scallops(left, curls.depth, [32 - 20, 26])} Z`;
  }
  let edge: string;
  if (curls) edge = scallops(domePoints(width, top, curls.count), curls.depth, [32, 27]);
  else if (texture === "wavy") {
    // Soft waves, each bulging out between two points on the dome.
    const waves = 7;
    const peaks = domePoints(width, top, 2 * waves, 1.12);
    const ends = domePoints(width, top, waves);
    edge = "";
    for (let i = 1; i <= waves; i++) edge += ` Q${pt(peaks[2 * i - 1])} ${pt(ends[i])}`;
  } else edge = through(domePoints(width, top, 16));
  const body = <path className="avatar-hair" fill={fill} stroke="none" d={`${start}${edge}${close}`} />;
  const outline = <path className="avatar-hair-edge" fill="none" stroke={ink} strokeWidth={1.2} strokeLinejoin="round" strokeLinecap="round" d={`${start}${edge}`} />;
  // Marks inside the mass, in the sheen: combed strands from the crown to the hairline (straight), wave lines (wavy),
  // or the curls' turns, short open hooks (curly) or small tight ones in rows (coily); never filled shapes.
  let marks = "";
  if (texture === "wavy") marks = "M22,20.5 q2.5,-2 5,0 t5,0 t5,0 t5,0 M24,16.8 q2,-1.6 4,0 t4,0 t4,0 t4,0";
  else if (!curls) {
    for (const [x, y] of domePoints(width, top, 8, 0.78).slice(1, -1)) {
      const t = (x - 32) / width;
      // A short cut's strands run down into its fringe, so their ends mark where the hair ends on the forehead.
      const endY = band === "short" ? 20.3 - 6 * t * t : 27 - (27 - hairline) * 0.75 * (1 - t * t) - 2;
      marks += `M${n(x)},${n(y)} Q${n(32 + (x - 32) * 1.25)},${n((y + endY) / 2)} ${n(32 + (x - 32) * 1.12)},${n(endY)} `;
    }
  } else {
    const rows = texture === "curly" ? [{ k: 0.66, count: 5, r: 1.6 }, { k: 0.38, count: 3, r: 1.6 }] : [{ k: 0.76, count: 8, r: 1 }, { k: 0.54, count: 6, r: 1 }, { k: 0.32, count: 3, r: 1 }];
    for (const { k, count, r } of rows) {
      for (const [x, y] of domePoints(width, top, count + 1, k).slice(1, -1)) {
        if (y > hairline - 1) continue;
        marks += `M${n(x - r)},${n(y)} Q${n(x - r)},${n(y - r)} ${n(x)},${n(y - r)} Q${n(x + r)},${n(y - r)} ${n(x + r)},${n(y)} `;
      }
    }
  }
  // Hair of the skin's own darkness or paleness (its edge toned off the skin) shows its light as these marks, a little
  // heavier, over its own colour: a shrunken copy of the cap in the sheen ended in a line across the forehead, the
  // peak of a cap.
  const massed = ink !== fill;
  const classes = [texture === "straight" ? "avatar-hair-strand" : "avatar-hair-texture", massed ? "avatar-hair-sheen" : ""].filter(Boolean).join(" ");
  return (
    <g className="avatar-hair">
      {massed ? cloneElement(body, { "data-lit": "marks" }) : body}
      {outline}
      <path className={classes} fill="none" stroke={sheen} strokeWidth={massed ? 0.9 : 0.6} strokeLinecap="round" d={marks.trim()} />
    </g>
  );
}

/** Hair falling behind the head to `bottom`, `w` to each side, narrowing to rounded ends rather than a box. */
function hairBack(w: number, bottom: number, fill: string, ink: string): React.ReactElement {
  const r = 6;
  return (
    <path
      key="hair-back"
      className="avatar-hair"
      fill={fill}
      stroke={ink}
      strokeWidth={1.2}
      d={`M${n(32 - w)},26 C${n(32 - w)},8 ${n(32 + w)},8 ${n(32 + w)},26 C${n(32 + w)},${bottom - r} ${n(32 + w - r)},${bottom} ${n(32 + w - 2 * r)},${bottom} L${n(32 - w + 2 * r)},${bottom} C${n(32 - w + r)},${bottom} ${n(32 - w)},${bottom - r} ${n(32 - w)},26 Z`}
    />
  );
}

/** How far down hanging hair (braids, locks, a ponytail) reaches in the portrait, by the hair's length. */
const HANG_BOTTOM: Readonly<Record<FigureParams["hair"], number>> = {
  none: 0,
  shaved: 0,
  cropped: 34,
  short: 38,
  "chin-length": 44,
  "shoulder-length": 50,
  long: 56,
  "waist-length": 62,
};
/** How far hair worn down falls behind the head, by band: to the jaw, the shoulders, past them, and off the picture. */
const FALL_BOTTOM: Readonly<Partial<Record<FigureParams["hair"], number>>> = { "chin-length": 42, "shoulder-length": 48, long: 55, "waist-length": 64 };

/**
 * How hair worn down hangs beside the face, by band, on the left (the right mirrors it): rows of [y, outer, inner], the
 * outer and inner edges as distances from the face's middle line (x 32), from the cheekbone to where the hair ends.
 * Chin-length ends at the jaw, beside it (clear of a long beard); shoulder-length falls past the jaw onto the shoulders;
 * long hair falls in front of the face's sides and in over the front of the shoulders (`front`, drawn over the head),
 * waist-length fuller and further in. The People list shows only the head inside a circle (centre 32, 25, radius 20),
 * which cuts every end below the jaw off: each band has to differ from the next above y 45 and inside x 12 to 52.
 * So each band also hangs fuller than the one before (`back`, the half width of the hair behind the head, and the
 * locks' outer edge), as longer hair carries more weight beside the face.
 */
const LOCKS: Readonly<Partial<Record<FigureParams["hair"], { front: boolean; back: number; rows: ReadonlyArray<[number, number, number]> }>>> = {
  "chin-length": { front: false, back: 14.2, rows: [[27, 15, 12.9], [36, 15.2, 12.7], [41, 14.8, 12.6]] },
  "shoulder-length": { front: false, back: 15.8, rows: [[27, 16.6, 12.7], [40, 17, 12.7], [50.5, 17.2, 12.7]] },
  long: { front: true, back: 17.8, rows: [[26, 18.6, 10.6], [36, 19, 9.8], [45, 19.2, 6], [55, 18.2, 5.6]] },
  "waist-length": { front: true, back: 19.8, rows: [[26, 20.6, 9.5], [35, 21, 8.2], [43, 21.2, 2.8], [63, 20.2, 2.6]] },
};

/**
 * Where a shaved scalp's stubble points are: a staggered grid inside its shadow (the dome `scalp` draws, 14.6 to
 * each side and up to y 10.2, above its lower edge, which is at y 19.5 in the middle), kept above the brows.
 */
const SCALP_DOTS: ReadonlyArray<[number, number]> = (() => {
  const out: Array<[number, number]> = [];
  for (let row = 0; row < 8; row++) {
    const y = 11.4 + row * 1.35;
    for (let x = 18.6 + (row % 2) * 0.8; x <= 45.4; x += 1.6) {
      const d = (x - 32) / 14.6;
      const dome = Math.abs(d * 1.07) ** 3 + ((27 - y) / 16.8 / 0.96) ** 3;
      if (dome < 1 && y < 19.5 + 7.5 * d * d - 0.9 && y < 21) out.push([n(x), n(y)]);
    }
  }
  return out;
})();

/** Points every `step` or so along the polyline through `points`, its corners kept. */
function resample(points: Pt[], step: number): Pt[] {
  const out: Pt[] = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const [a, b] = [points[i - 1], points[i]];
    const k = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
    for (let j = 1; j <= k; j++) out.push([a[0] + ((b[0] - a[0]) * j) / k, a[1] + ((b[1] - a[1]) * j) / k]);
  }
  return out;
}

/**
 * What a hair style puts behind the head (`back`, drawn before the shoulders), hanging in front of the
 * shoulders (`hang`, before the head) and over the head (`cap`). `loose` is the hair as it falls. `ink` here (and in
 * the helpers it calls) is the hair's edge, `hairEdge`, never the figure's outline ink; lines and ties drawn on the
 * hair are in its sheen.
 */
function hairStyle(params: FigureParams, fill: string, ink: string, skin: string): { back: React.ReactNode[]; hang: React.ReactNode[]; cap: React.ReactNode } {
  const v = params.hairVolume;
  const texture = params.hairTexture;
  /** How far curls and coils at chin length spring up from where straight hair of that length ends. */
  const rise = params.hair === "chin-length" ? { coily: 4, curly: 3.5, wavy: 3 }[texture as "coily" | "curly" | "wavy"] ?? 0 : 0;
  const fallBottom = (FALL_BOTTOM[params.hair] ?? 0) - rise;
  const falls = fallBottom > 0;
  const bottom = HANG_BOTTOM[params.hair];
  const sheen = params.colours.hairSheen ?? ink;
  // Hair of the skin's own darkness or paleness, its edge toned off the skin: its light is drawn as lines in the sheen.
  const massed = ink !== fill;
  const line = (key: string, d: string, width = 0.8, lit = false) => (
    <path key={key} className={lit ? "avatar-hair-sheen" : undefined} fill="none" stroke={sheen} strokeWidth={width} strokeLinecap="round" d={d} />
  );
  /**
   * A shaved scalp (and a mohawk's sides): a shadow of the hair's colour over the crown, covering the head's outline
   * there, its outer edge in the hair's edge tone as other hair's is. The old low arch left the head's ink outline (white
   * on deep skin) running over the scalp above it.
   */
  const scalp = () => {
    const dome = domePoints(14.6, 10.2, 16);
    const edge = through(dome);
    return (
      <g key="scalp" className="avatar-hair">
        <path className="avatar-hair-shadow" fill={overlayHex(skin, fill, STUBBLE_OPACITY)} stroke="none" d={`M${pt(dome[0])}${edge} C40,17 24,17 ${pt(dome[0])} Z`} />
        <path className="avatar-hair-edge" fill="none" stroke={ink} strokeWidth={1.2} strokeLinecap="round" d={`M${pt(dome[0])}${edge}`} />
        {/*
          Stubble: short hairs in the hair's tone off the skin, as on a stubbled chin. The shadow alone, black at 45%
          over deep skin, looked the same as cropped black hair.
        */}
        {SCALP_DOTS.map(([x, y]) => (
          <circle key={`${x},${y}`} className="avatar-stubble-dot" cx={x} cy={y} r={0.42} fill={ink} />
        ))}
      </g>
    );
  };
  // A close cap for hair drawn back from the face: smooth, whatever the texture.
  const sleek = () => hairCap("straight", 1, fill, ink, sheen);
  /**
   * Hair worn down also hangs beside the face (`LOCKS`), ending in a rounded tip where the hair ends. Behind the head
   * alone, its end was hidden by the shoulders and, beside a long dark beard, chin and shoulder length looked the same.
   * Each lock is drawn in its texture: smooth with strands, in waves, or with curls or coils down both edges and their
   * turns inside it, filled in the hair's colour with its light drawn as those marks; only its outer edge and end are
   * in the edge tone. A straight panel, ringed in the edge tone and with a shrunken grey copy inside, read as straight
   * grey hair beside a curly cap.
   */
  const locks = LOCKS[params.hair];
  const curlsHere = CURLS[texture] !== undefined;
  const sideLocks = () =>
    locks && falls
      ? [-1, 1].map((side) => {
          const at = (y: number, from: number): Pt => [32 + side * from, y];
          // Curly and coily hair stands out further, as the cap and the hair behind do (`v`), and at chin length springs
          // up into a mass ending above the jaw (`rise`).
          const rows = locks.rows.map(([y, o, i]) => [y > 30 ? y - rise : y, o + (v - 1) * 2, i] as const);
          // Curls and coils hanging in front start up at the temples, under the cap's curls there: starting at the
          // cheekbone, the hair behind the head showed between the cap and the lock.
          // Their tops lie inside the cap's own width, by more than their curls bulge (its curls' outline beside them),
          // and spread out to their full width at the cap's lower corner: at their full width from the top they jutted
          // out beside the cap at the temple.
          if (curlsHere && locks.front) {
            rows[0] = [28, rows[0][1], rows[0][2]];
            rows.unshift([23, Math.min(rows[0][1], CAP_BANDS.full.width * v - 1.5), rows[0][2]]);
          }
          const outer = rows.map(([y, o]) => at(y, o));
          const inner = rows.map(([y, , i]) => at(y, i)).reverse();
          const [yEnd, oEnd, iEnd] = rows[rows.length - 1];
          const tip = ` Q${pt(at(yEnd + 2.4, (oEnd + iEnd) / 2))} ${pt(inner[0])}`;
          const curls = CURLS[texture];
          // Curls and coils bulge away from the lock's middle line; waves swing from side to side.
          const away: Pt = at(40, 14.5);
          const edge = (points: Pt[]) => {
            if (curls) return scallops(resample(points, texture === "coily" ? 2.4 : 3), curls.depth, away);
            if (texture === "wavy") return through(resample(points, 2).map(([x, y], k) => [x + (k % 2 ? 0.5 : -0.5), y] as Pt));
            return through(points);
          };
          const outerEdge = `M${pt(outer[0])}${edge(outer)}${tip}`;
          // The marks down the lock: strands (straight), waves, or the curls' turns, in the sheen.
          let marks = "";
          const middle = (share: number) => rows.map(([y, o, i]) => at(y, o + (i - o) * share));
          if (curls) {
            const r = texture === "coily" ? 0.9 : 1.3;
            for (const share of texture === "coily" ? [0.3, 0.7] : [0.5]) {
              for (const [x, y] of resample(middle(share), texture === "coily" ? 2.8 : 3.8).slice(1, -1)) {
                marks += `M${n(x - r)},${n(y)} Q${n(x - r)},${n(y - r)} ${n(x)},${n(y - r)} Q${n(x + r)},${n(y - r)} ${n(x + r)},${n(y)} `;
              }
            }
          } else {
            for (const share of [0.35, 0.7]) {
              const line = middle(share).slice(0, -1);
              marks += `M${pt(line[0])}${texture === "wavy" ? through(resample(line, 2).map(([x, y], k) => [x + (k % 2 ? 0.4 : -0.4), y] as Pt)) : through(line)} `;
            }
          }
          const classes = [texture === "straight" ? "avatar-hair-strand" : "avatar-hair-texture", massed ? "avatar-hair-sheen" : ""].filter(Boolean).join(" ");
          return (
            <g key={`side-lock${side}`} className="avatar-hair">
              <path className="avatar-hair avatar-hair-lock" fill={fill} stroke="none" data-lit="marks" d={`${outerEdge}${edge(inner)} Z`} />
              <path className="avatar-hair-edge" fill="none" stroke={ink} strokeWidth={1} strokeLinejoin="round" strokeLinecap="round" d={outerEdge} />
              <path className={classes} fill="none" stroke={sheen} strokeWidth={massed ? 0.9 : 0.6} strokeLinecap="round" d={marks.trim()} />
            </g>
          );
        })
      : [];
  /** Where the locks go: behind the head, or (long and waist-length) in front of the face's sides, under the cap. */
  const worn = (cap: React.ReactNode): { hang: React.ReactNode[]; cap: React.ReactNode } =>
    locks?.front && falls ? { hang: [], cap: <g className="avatar-hair">{sideLocks()}{cap}</g> } : { hang: sideLocks(), cap };
  /**
   * Hair drawn back and tied (ponytail, braids, bun, topknot) keeps its texture on the cap: a curly or coily edge with
   * curl marks, or waves. Without it the tied styles all looked straight.
   */
  const tiedCap = (extra: React.ReactNode = null) => (
    <g className="avatar-hair">
      {hairCap(texture, 1, fill, ink, sheen)}
      {extra}
    </g>
  );
  switch (params.hairStyle) {
    case "ponytail":
      // Drawn back into a tail that shows past the right of the head, tied at the back.
      return {
        back: [
          <path key="tail" className="avatar-hair" fill={fill} stroke={ink} strokeWidth={1.2} d={`M40,15 C52,16 53,28 50,${bottom - 4} C49,${bottom} 45,${bottom} 45.5,${bottom - 4} C47,30 46,22 40,20 Z`} />,
        ],
        hang: [],
        cap: tiedCap(<rect x={43} y={15.5} width={3.5} height={3} rx={1} fill={sheen} />),
      };
    case "braided": {
      // Two braids hanging in front of the shoulders, each a chain of plaited links ending in a tie.
      const hang: React.ReactNode[] = [];
      for (const side of [-1, 1]) {
        const x = 32 + side * 13;
        for (let y = 30; y <= bottom - 2; y += 3.4) {
          hang.push(<ellipse key={`braid${side}-${y}`} className="avatar-hair" cx={x} cy={n(y)} rx={2.6} ry={2.1} fill={fill} stroke={ink} strokeWidth={0.8} />);
        }
        hang.push(<rect key={`tie${side}`} x={x - 1.5} y={bottom - 1} width={3} height={1.8} fill={sheen} />);
      }
      return { back: [], hang, cap: tiedCap(line("parting", "M32,13 L32,20.5")) };
    }
    case "bun": {
      // Gathered into a round bun sitting on the crown, drawn over the cap; a curly or coily bun has a scalloped edge.
      // Nothing is drawn inside it: an arch of sheen there read as a frowning mouth.
      const curls = CURLS[texture];
      // Round the bun: half as many scallops as round the head, the last point back on the first.
      const ring: Pt[] = [];
      const around = curls ? (curls.count >> 1) + 1 : 0;
      // Its top at y 5, the top of the head-only crop at list size, so the bun is whole at 32 px.
      for (let i = 0; i <= around; i++) ring.push([32 + 4.6 * Math.cos((2 * Math.PI * i) / around), 10.5 + 4.6 * Math.sin((2 * Math.PI * i) / around)]);
      // On hair of the skin's own darkness or paleness, a scalloped bun keeps the hair's colour like the cap under it
      // (its edge shows its curls); a grey copy inside it made it a pompom on a dark cap.
      const bun = curls ? (
        <path key="bun" fill={fill} stroke={ink} strokeWidth={1.2} strokeLinejoin="round" data-lit={ink !== fill ? "edge" : undefined} d={`M${pt(ring[0])}${scallops(ring, curls.depth, [32, 10.5])} Z`} />
      ) : (
        <circle key="bun" cx={32} cy={10.5} r={5.5} fill={fill} stroke={ink} strokeWidth={1.2} />
      );
      return { back: [], hang: [], cap: tiedCap(bun) };
    }
    case "topknot":
      // A small knot high on the crown, tied at its base.
      return {
        back: [],
        hang: [],
        cap: (
          tiedCap(
            <>
              <circle cx={32} cy={5.5} r={3.4} fill={fill} stroke={ink} strokeWidth={1} />
              <rect x={30.4} y={8.6} width={3.2} height={3.6} fill={sheen} />
            </>,
          )
        ),
      };
    case "dreadlocks": {
      // Thick ropes from the crown falling round the face and over the shoulders.
      const hang: React.ReactNode[] = [];
      [17, 20.5, 43.5, 47].forEach((x, i) => {
        const end = bottom - (i % 2) * 4;
        hang.push(<rect key={`lock${x}`} className="avatar-hair" x={x - 1.7} y={20} width={3.4} height={end - 20} rx={1.7} fill={fill} stroke={ink} strokeWidth={0.8} />);
      });
      const back = [24, 28, 32, 36, 40].map((x, i) => (
        <rect key={`lockb${x}`} className="avatar-hair" x={x - 1.7} y={14} width={3.4} height={bottom - 14 + (i % 2) * 3} rx={1.7} fill={fill} stroke={ink} strokeWidth={0.8} />
      ));
      return { back, hang, cap: <g className="avatar-hair">{sleek()}{line("locks", "M24,15 L24,20 M28,13 L28,20 M32,12.5 L32,20 M36,13 L36,20 M40,15 L40,20")}</g> };
    }
    case "spiky": {
      // Standing up in spikes round the top of the head.
      const spikes = 9;
      let d = "M18,27";
      for (let i = 0; i < spikes; i++) {
        const a0 = Math.PI * (1 + i / spikes);
        const a1 = Math.PI * (1 + (i + 1) / spikes);
        const tip = (a0 + a1) / 2;
        d += ` L${n(32 + Math.cos(tip) * 20)},${n(25 + Math.sin(tip) * 21)} L${n(32 + Math.cos(a1) * 14)},${n(25 + Math.sin(a1) * 13)}`;
      }
      d += " C38,20 26,20 18,27 Z";
      return { back: [], hang: [], cap: <path className="avatar-hair" fill={fill} stroke={ink} strokeWidth={1.2} strokeLinejoin="round" d={d} /> };
    }
    case "mohawk":
      // The sides shaved to a shadow on the skin, one tall crest down the middle.
      return {
        back: [],
        hang: [],
        cap: (
          <g className="avatar-hair">
            {scalp()}
            {/* Its light drawn as strands up the crest: a shrunken grey copy inside it made a dark crest grey. */}
            <path fill={fill} stroke={ink} strokeWidth={1.2} data-lit="marks" d="M28.5,20 C27.5,10 29,1.5 32,0.5 C35,1.5 36.5,10 35.5,20 C34,21 30,21 28.5,20 Z" />
            {line("crest", "M30.4,18.5 Q30,10 31.6,3.5 M33.6,18.5 Q34,10 32.4,3.5", massed ? 0.9 : 0.6, massed)}
          </g>
        ),
      };
    case "swept_back":
      // Lifted off a high forehead and combed back: the hair stands high over the crown (at least 6 units above a loose
      // cap of its length, 5 px at 32 px), the hairline well up the forehead, comb lines running back. With only a higher hairline
      // and thin comb strokes it looked like loose hair at portrait size.
      return {
        back: falls ? [hairBack(locks?.back ?? 15, fallBottom, fill, ink)] : [],
        ...worn(
          <g className="avatar-hair">
            <path className="avatar-hair" fill={fill} stroke={ink} strokeWidth={1.2} d="M18,27 C17,10 21.5,0.8 31.5,0.8 C41.5,0.8 47,10 46,27 C40,13 24,13 18,27 Z" />
            {line("comb", "M25,16.5 Q23.5,10.5 27.5,6.8 M32,15.3 Q31.4,10 32,6 M39,16.5 Q40.5,10.5 36.5,6.8", 0.8)}
          </g>,
        ),
      };
    case "brushed":
      // A side parting, open at the crown as a notch in the outline, the larger side brushed across the forehead in a
      // swept fringe. A thin parting stroke on a plain cap looked like loose hair at portrait size.
      return {
        back: falls ? [hairBack(locks?.back ?? 15, fallBottom, fill, ink)] : [],
        ...worn(
          <g className="avatar-hair">
            {/*
              The parting: the scalp showing between the two sides, in the hair's shadow on the skin, under the head's
              outline there, with the outer edge running on across it. Left open, the head's outline (white on deep
              skin) showed across the notch.
            */}
            <path className="avatar-hair-shadow" fill={overlayHex(skin, fill, STUBBLE_OPACITY)} stroke="none" d="M22.9,11.45 L26.5,11.05 L24.9,21 L23.5,20.4 Z" />
            <path className="avatar-hair-edge" fill="none" stroke={ink} strokeWidth={1.2} strokeLinecap="round" d="M23.2,11.4 L26.2,11.1" />
            {/* Their light drawn as the brushed lines (heavier on hair of the skin's darkness), never a shrunken grey copy. */}
            <path className="avatar-hair" fill={fill} stroke={ink} strokeWidth={1.2} strokeLinejoin="round" data-lit="marks" d="M17.6,27 C17,16.5 18.6,12.6 23.2,11.4 L23.8,19 C21.5,20.5 19.2,23.5 17.6,27 Z" />
            <path className="avatar-hair" fill={fill} stroke={ink} strokeWidth={1.2} strokeLinejoin="round" data-lit="marks" d="M26.2,11.1 C36.5,7.6 47.9,9.4 46.6,27 C44.5,22.5 40,19.6 34.5,19.6 C30.5,19.6 27,20.6 24.6,22 L24.6,19 Z" />
            {line("brushed", "M28,14 Q36.5,12.2 43.5,17.5 M27.5,17.5 Q34,15.8 40.5,18.2 M20,24 Q20.5,18 22.6,14.5", massed ? 0.9 : 0.8, massed)}
          </g>,
        ),
      };
    case "voluminous":
      // Thick and full: the hair stands well out from the head and falls wide.
      return {
        back: [hairBack(15 * v * 1.3, falls ? fallBottom + 4 : 40, fill, ink)],
        hang: [],
        cap: hairCap(texture, v * 1.3, fill, ink, sheen),
      };
    default:
      // Shaved: a shadow of the hair's colour on the scalp. Hair worn down hangs fuller with each band (`LOCKS`).
      if (params.hair === "shaved") return { back: [], hang: [], cap: scalp() };
      return {
        // Behind a curly or coily cap the hair behind the head stays inside the cap's curls (its full half width is
        // 14.6 v): wider, its smooth outline showed beside them as a grey line near the picture's edge.
        back: falls ? [hairBack(Math.min((locks?.back ?? 15) + (v - 1) * 2, CURLS[texture] ? 14.6 * v - 1.3 : Number.POSITIVE_INFINITY), fallBottom, fill, ink)] : [],
        ...worn(hairCap(texture, v, fill, ink, sheen, params.hair === "cropped" ? "cropped" : params.hair === "short" ? "short" : "full")),
      };
  }
}

/**
 * The beard: along the jaw from ear to ear, its lower edge below the chin by its length
 * (`FigureParams.beardReach`), narrowing to a point as it grows long. Without a length, the jaw-line beard.
 */
function beardPath(reach: number | undefined, lengthCm: number | undefined, shape: string): string {
  if (reach === undefined || lengthCm === undefined) return `M19.5,30 C19,47 45,47 44.5,30 C43,38 38,41 32,41 C26,41 21,38 19.5,30 Z`;
  // A beard covers the cheeks and the chin: its upper edge runs from the sideburn in front of each ear down over the
  // cheek to beside the mouth and under the lower lip. Drawn as the jaw alone, a short beard read as a jaw outline.
  const upper = `L44.5,${CHEEK_TOP} ${BEARD_UPPER} L19.5,30 Z`;
  if (lengthCm < 15) {
    // Short and full beards follow the face's own jaw, standing out from it by their length, so an angular chin
    // stays angular: 0.8 at 2 to 3 cm, rising to 3 at 6 cm.
    const g = 0.8 + 2.2 * Math.min(1, Math.max(0, (lengthCm - 3) / 3));
    return `M19.5,30 ${jawEdge(shape, g)} ${upper}`;
  }
  // The curve's lowest point is a quarter of the way from its ends (y 30) to its control points.
  const bottom = 41.5 + 21.5 * reach;
  const control = (bottom - 0.25 * 30) / 0.75;
  const inset = 8 * Math.max(0, (reach - 0.3) / 0.7);
  return `M19.5,30 C${n(19 + inset)},${n(control)} ${n(45 - inset)},${n(control)} 44.5,30 ${upper}`;
}

/** How high a beard's upper edge is at `d` from the face's middle line (the lower lip at 0, the sideburns at 12.5), roughly. */
function beardTopY(d: number): number {
  const knots: Array<[number, number]> = [[0, 41.6], [6, 39.6], [8.5, 35.5], [11.5, 33], [12.5, 27]];
  for (let i = 1; i < knots.length; i++) {
    const [d0, y0] = knots[i - 1];
    const [d1, y1] = knots[i];
    if (d <= d1) return y0 + ((y1 - y0) * (d - d0)) / (d1 - d0);
  }
  return 27;
}

/** Where stubble's points are: a staggered grid kept inside its area (under the beard's upper edge, inside the jaw). */
const STUBBLE_DOTS: ReadonlyArray<[number, number]> = (() => {
  const out: Array<[number, number]> = [];
  for (let row = 0; row < 10; row++) {
    const y = 29.8 + row * 1.45;
    for (let x = 20.3 + (row % 2) * 0.8; x <= 43.7; x += 1.6) {
      const d = Math.abs(x - 32);
      const jaw = 28 + 16 * Math.sqrt(Math.max(0, 1 - (d / 13) ** 2)) - 1;
      if (y > beardTopY(d) + 0.6 && y < jaw) out.push([n(x), n(y)]);
    }
  }
  return out;
})();

/** How high the beard and stubble reach at the sideburns, beside the ears. */
const CHEEK_TOP = 27;
/** The upper edge of a beard or stubble, from the right sideburn (44.5, CHEEK_TOP) to the left one: down the cheek, under the lip. */
const BEARD_UPPER = `C43.5,33 40.5,35.5 38,39.6 Q32,43.6 26,39.6 C23.5,35.5 20.5,33 19.5,${CHEEK_TOP}`;

/**
 * The lower edge of a beard that follows the jaw of `shape` (as `headShape` draws it), `g` further out, from the
 * left of the face at y 30 to the right. Every shape but the angular one is a single curve, its lowest point at the
 * chin plus `g` (a curve's lowest point is a quarter of the way from its ends to its control points).
 */
function jawEdge(shape: string, g: number): string {
  if (shape === "angular") return `L${n(24 - g * 0.6)},${n(39 + g * 0.8)} L32,${n(44 + g)} L${n(40 + g * 0.6)},${n(39 + g * 0.8)} L44.5,30`;
  if (shape === "square") return `L${n(19 - g * 0.3)},38 Q${n(19 - g * 0.3)},${n(44 + g)} 25,${n(44 + g)} L39,${n(44 + g)} Q${n(45 + g * 0.3)},${n(44 + g)} ${n(45 + g * 0.3)},38 L44.5,30`;
  const chin = { round: 42.5, long: 45, heart: 44 }[shape] ?? 44;
  const control = (chin + g - 7.5) / 0.75;
  return `C19,${n(control)} 45,${n(control)} 44.5,30`;
}

/**
 * Every shape filled in `hair` within `node`, followed by a smaller copy of itself in `sheen`: the light on the
 * hair's body, set toward its top, with a rim of the hair's own colour left round it.
 */
function withSheen(node: React.ReactNode, hair: string, sheen: string): React.ReactNode {
  if (Array.isArray(node)) return node.map((x) => withSheen(x, hair, sheen));
  if (!isValidElement(node)) return node;
  const props = node.props as Record<string, unknown>;
  if (props.children !== undefined) {
    return cloneElement(node, {}, ...Children.toArray(props.children as React.ReactNode).map((x) => withSheen(x, hair, sheen)));
  }
  // A shape that shows its light another way (straight hair's strands) gets no shrunken copy.
  if (props.fill !== hair || props["data-lit"]) return node;
  const num = (name: string) => Number(props[name] ?? 0);
  let box: [number, number, number, number];
  if (node.type === "path") {
    const points = [...String(props.d).matchAll(/(-?[\d.]+),(-?[\d.]+)/g)].map((m) => [Number(m[1]), Number(m[2])]);
    const xs = points.map(([x]) => x);
    const ys = points.map(([, y]) => y);
    box = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  } else if (node.type === "circle") {
    // A curl: a highlight on its upper side, toward the light, not a lighter middle that made it a bead.
    const r = num("r");
    return [
      node,
      <circle key={`${node.key ?? ""}sheen`} className="avatar-hair-sheen" cx={n(num("cx") - r * 0.2)} cy={n(num("cy") - r * 0.35)} r={n(r * 0.45)} fill={sheen} stroke="none" />,
    ];
  } else if (node.type === "ellipse") {
    const rx = num("rx");
    const ry = num("ry");
    box = [num("cx") - rx, num("cy") - ry, num("cx") + rx, num("cy") + ry];
  } else if (node.type === "rect") {
    box = [num("x"), num("y"), num("x") + num("width"), num("y") + num("height")];
  } else {
    return node;
  }
  // Shrunk toward a point in the upper quarter, so the light sits on the top of the mass and the hair's own colour
  // runs along its lower edge (the hairline over the forehead). Set nearer the middle, the light's lower edge ran
  // straight across the forehead like the peak of a cap.
  const [x0, y0, x1, y1] = box;
  const [px, py] = [n((x0 + x1) / 2), n(y0 + (y1 - y0) * 0.22)];
  const light = cloneElement(node, {
    key: `${node.key ?? ""}sheen`,
    className: "avatar-hair-sheen",
    fill: sheen,
    stroke: "none",
    transform: `translate(${px} ${py}) scale(${SHEEN_SCALE}) translate(${-px} ${-py})`,
  });
  return [node, light];
}

/** How large the sheen on a hair shape is, as a share of the shape. */
const SHEEN_SCALE = 0.62;

/**
 * Strands over a beard of the skin's own darkness or paleness, in its tone off the skin: short staggered strokes down
 * each column of the beard, from under its upper edge to above its lower edge (the jaw for a beard under 15 cm, the
 * beard's own end for a longer one). Without them it showed only its thin edge, an outline of a beard.
 */
function beardStrands(reach: number, lengthCm: number, shape: string, edge: string): React.ReactElement[] {
  const g = 0.8 + 2.2 * Math.min(1, Math.max(0, (lengthCm - 3) / 3));
  const chin = { round: 42.5, long: 45, heart: 44 }[shape] ?? 44;
  // How low the beard reaches at `d` from the face's middle line, kept inside the shape `beardPath` draws.
  const low = (d: number): number => {
    if (lengthCm >= 15) {
      const bottom = 41.5 + 21.5 * reach;
      const half = 12.5 - 5 * Math.max(0, (reach - 0.3) / 0.7);
      return 30 + (bottom - 30) * Math.sqrt(Math.max(0, 1 - (d / half) ** 2));
    }
    if (shape === "angular") return d <= 8 ? 44 + g - (d * (5 + 0.2 * g)) / 8 : 39 + 0.8 * g - ((d - 8) * (9 + 0.8 * g)) / 4.5;
    return 28 + (chin + g - 28) * Math.sqrt(Math.max(0, 1 - (d / 13) ** 2));
  };
  const out: React.ReactElement[] = [];
  const step = 1.6;
  for (let column = 0, x = 20.4; x <= 43.6; column++, x += step) {
    const d = Math.abs(x - 32);
    const top = beardTopY(d) + 0.8;
    const bottom = low(d) - 0.9;
    // Strokes 1.6 long with gaps of 0.8, every other column half a stroke lower where there is room.
    for (let y = top + (bottom - top > 3 ? (column % 2) * 1.2 : 0); y + 0.5 <= bottom; y += 2.4) {
      const end = Math.min(y + 1.6, bottom);
      out.push(<path key={`strand${n(x)},${n(y)}`} className="avatar-beard-strand" fill="none" stroke={edge} strokeWidth={0.6} strokeLinecap="round" d={`M${n(x)},${n(y)} L${n(x + 0.3)},${n(end)}`} />);
    }
  }
  return out;
}

/**
 * One antler on the `side` of the head (-1 left, +1 right), as a path of three strokes: the beam from the crown up and
 * out to a tip, and two tines rising from it. Every point lies inside the head crop (`HEAD_VIEWBOX`).
 */
export function antlerPath(side: number): string {
  const x = (dx: number) => n(32 + side * dx);
  return [
    `M${x(6)},14 Q${x(10.5)},11 ${x(14)},8.5 Q${x(16.5)},7 ${x(18)},6`,
    `M${x(9)},11.9 L${x(8)},6.6`,
    `M${x(13.2)},9 L${x(13)},5.8`,
  ].join(" ");
}

export function portraitElements(appearance: unknown): React.ReactNode[] | null {
  const record = appearanceRecord(appearance);
  if (!record) return null;
  const params = figureParams(record, { height: 1.75 });
  if (params.plan.kind !== "human") return planPortraitElements(params, record);
  const c = params.colours;
  const ink = c.ink;
  // What is drawn on the skin uses the ink that stands out on the skin; region outlines use the seam ink.
  const faceInk = c.faceInk;
  const face = isRecord(record.face) ? record.face : {};
  const shape = BUILDS[params.build];
  const shoulders = 26 * shape.shoulders;
  // The build shows above the collar as well: neck by the limbs, the face fuller or leaner with the waist,
  // and the shoulders rising toward the neck on a heavily muscled build.
  const neck = 10 * shape.limbs;
  const fullness = 1 + (shape.waist - 1) * 0.5;
  const shoulderRise = 50 - (shape.limbs - 1) * 12;
  const parts: React.ReactNode[] = [];

  // A plain disc behind the picture, so dark hair still shows on a dark page and light hair on a light one.
  parts.push(<circle key="backdrop" className="avatar-backdrop" cx={32} cy={32} r={31} fill={PORTRAIT_BACKDROP} />);
  const drawn = !params.headCovered && params.hair !== "none" && c.hair ? hairStyle(params, c.hair, c.hairEdge, c.skin) : undefined;
  // Hair that had to have its edge toned off the skin (black on deep brown, white on palest) is nearly the skin's
  // colour: its body is shaded toward the sheen too, so it reads as a mass of hair and not as rings of outline.
  const massed = c.hair && c.hairSheen && c.hairEdge !== c.hair ? { hair: c.hair, sheen: c.hairSheen } : undefined;
  const style =
    drawn && massed
      ? { back: drawn.back.map((x) => withSheen(x, massed.hair, massed.sheen)), hang: drawn.hang.map((x) => withSheen(x, massed.hair, massed.sheen)), cap: withSheen(drawn.cap, massed.hair, massed.sheen) }
      : drawn;
  parts.push(...(style?.back ?? []));
  parts.push(
    <path
      key="shoulders"
      className="avatar-garment"
      fill={c.torso}
      stroke={ink}
      strokeWidth={1.2}
      d={`M${n(32 - shoulders)},64 C${n(32 - shoulders)},${n(shoulderRise)} ${n(32 - shoulders * 0.55)},45 32,45 C${n(32 + shoulders * 0.55)},45 ${n(32 + shoulders)},${n(shoulderRise)} ${n(32 + shoulders)},64 Z`}
    />,
    <rect key="neck" className="avatar-neck" x={n(32 - neck / 2)} y={36} width={n(neck)} height={10} fill={c.neck} stroke={ink} strokeWidth={1.2} />,
  );
  parts.push(...(style?.hang ?? []));
  const pointed = params.ears === "pointed";
  const ear = EARS[params.ears] ?? EARS.average;
  // A hood or hat, or hair over them, covers the ears: by the rule the 3D figure uses too (`earsCovered`).
  for (const side of params.earsHidden ? [] : [-1, 1]) {
    const x = 32 + side * (32 - ear.x) * fullness;
    parts.push(
      pointed ? (
        <path key={`ear${side}`} className="avatar-ear" fill={c.skin} stroke={ink} strokeWidth={1} d={`M${n(x - side)},26 L${n(x + side * 4)},19 L${n(x + side * 1.5)},34 Z`} />
      ) : (
        <ellipse key={`ear${side}`} className="avatar-ear" fill={c.skin} stroke={ink} strokeWidth={1} cx={n(x)} cy={30} rx={ear.rx} ry={ear.ry} />
      ),
    );
  }
  parts.push(
    <g key="head" transform={fullness === 1 ? undefined : `translate(32 0) scale(${n(fullness)} 1) translate(-32 0)`}>
      {headShape(vocabKey(face.shape) ?? "", c.skin, ink)}
    </g>,
  );
  if (fullness >= 1.08) {
    // A soft second chin under a full face.
    parts.push(<path key="chin" className="avatar-chin" fill="none" stroke={faceInk} strokeWidth={0.7} strokeLinecap="round" d="M28.5,45.2 Q32,46.8 35.5,45.2" />);
  }

  if (params.headCovered) {
    parts.push(
      <path key="head-garment" className="avatar-garment" fill={c.head} stroke={ink} strokeWidth={1.2} d="M17,30 C15,6 49,6 47,30 C44,20 20,20 17,30 Z" />,
    );
  } else if (style) {
    // Widened with a fuller face, so the hair still covers the head's sides.
    parts.push(
      <g key="hair" transform={fullness === 1 ? undefined : `translate(32 0) scale(${n(fullness)} 1) translate(-32 0)`}>
        {style.cap}
      </g>,
    );
  }
  if (params.extras.includes("antlers")) {
    // Branching antlers, as the 3D figure has: a beam curving up and out from the crown with two tines rising from
    // it, drawn as a bone-toned stroke over a wider ink one so each branch reads at the People list's 32 px.
    for (const side of [-1, 1]) {
      const d = antlerPath(side);
      parts.push(
        <path key={`antler-edge${side}`} className="avatar-horn-edge" fill="none" stroke={ink} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" d={d} />,
        <path key={`horn${side}`} className="avatar-horn" fill="none" stroke={HORN_TONE} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d={d} />,
      );
    }
  } else if (params.extras.includes("horns")) {
    for (const side of [-1, 1]) {
      parts.push(
        <path
          key={`horn${side}`}
          className="avatar-horn"
          fill={HORN_TONE}
          stroke={ink}
          strokeWidth={1}
          d={`M${32 + side * 6},15 L${32 + side * 11},4 L${32 + side * 10},15 Z`}
        />,
      );
    }
  }

  if (!params.faceHidden) {
    const brows = vocabKey(face.brows) ?? "";
    // The hair's colour toned off the skin: black brows vanished on dark skin.
    const brow = c.brow;
    for (const x of [26.5, 37.5]) {
      // Toward the nose: -1 on the left brow, +1 on the right.
      const inward = x < 32 ? 1 : -1;
      const inner = x + inward * 3.5;
      const outer = x - inward * 3.5;
      // Set a little below the hairline (about y 21.5 here), so a brow in the hair's colour stands apart from the hair.
      const browShape: Record<string, [number, string]> = {
        thick: [2.2, `M${outer},24 L${inner},24`],
        thin: [0.9, `M${outer},24 L${inner},24`],
        arched: [1.5, `M${outer},24.5 Q${x},21.5 ${inner},24.5`],
        // Tufted: a ragged run of short strokes along a broad brow.
        bushy: [2.3, `M${outer},24.4 l${inward * 1.4},-1.6 l${inward * 0.6},1.4 l${inward * 1.4},-1.6 l${inward * 0.6},1.4 l${inward * 1.4},-1.6 l${inward * 0.6},1.4 l${inward * 1.0},-1.2`],
        // A broad, low brow that sinks toward the nose.
        heavy: [2.9, `M${outer - inward * 0.5},24 L${inner},25.2`],
      };
      const [width, d] = browShape[brows] ?? [1.5, `M${outer},24 L${inner},24`];
      parts.push(
        <path key={`brow${x}`} className="avatar-brow" fill="none" stroke={brow} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" d={d} />,
      );
      if (c.eyes) {
        parts.push(<circle key={`eye${x}`} className="avatar-eye" cx={x} cy={28} r={2.2} fill={c.eyes} stroke={faceInk} strokeWidth={0.8} />);
      }
      parts.push(<circle key={`pupil${x}`} className="avatar-pupil" cx={x} cy={28} r={0.9} fill={faceInk} />);
    }
    const nose: Record<string, string> = {
      button: "M31,33 Q32,34.5 33,33",
      hooked: "M32,27 Q35,31 33,34 L30.5,34",
      previously_broken: "M32,27 L33,30 L31.5,32 L33,34 L30.5,34",
      pudgy: "M30,33 Q32,35.5 34,33",
      // A wide base with both nostrils flaring out.
      broad: "M32,28 L31,32.5 M28.6,33.6 Q29.6,31.8 31,33.4 Q32,34.6 33,33.4 Q34.4,31.8 35.4,33.6",
      // The tip turning up, its nostril showing beneath.
      upturned: "M32,27.5 Q31,31.5 31.6,32.6 Q32.8,33.4 34,31.6 M32.4,33.9 L33.2,33.9",
    };
    parts.push(
      <path key="nose" className="avatar-nose" fill="none" stroke={faceInk} strokeWidth={1} strokeLinecap="round" d={nose[vocabKey(face.nose) ?? ""] ?? "M32,28 L30.8,33.5 L33,33.5"} />,
    );
    const lips = vocabKey(face.lips);
    const mouthWidth = lips === "narrow" ? 3 : 4.5;
    parts.push(
      <path
        key="mouth"
        className="avatar-mouth"
        fill="none"
        stroke={faceInk}
        strokeWidth={lips === "full" ? 1.9 : lips === "thin" ? 0.8 : 1.2}
        strokeLinecap="round"
        d={`M${32 - mouthWidth},38 Q32,39.8 ${32 + mouthWidth},38${lips === "chapped" ? " M30,37.4 l0.5,1.5 M32,37.9 l0.5,1.5 M34,37.4 l0.5,1.5" : ""}`}
      />,
    );
    const fh = c.facialHair;
    // Facial hair's edge in its own tone off the skin: a black beard on dark skin was ringed in white, a chin strap.
    const edge = c.facialHairEdge ?? faceInk;
    const shapeKey = vocabKey(face.shape) ?? "";
    if (fh) {
      const shapes: Record<string, React.ReactElement> = {
        // A shadow over the cheeks and chin, and a stipple of short hairs in the stubble's tone off the skin, which
        // shows where the shadow alone barely changes dark skin.
        stubble: (
          <>
            <path fill={fh} fillOpacity={STUBBLE_OPACITY} stroke="none" d={`M19.5,30 ${jawEdge(shapeKey, 0.3)} L44.5,${CHEEK_TOP} ${BEARD_UPPER} L19.5,30 Z`} />
            {STUBBLE_DOTS.map(([x, y]) => (
              <circle key={`${x},${y}`} className="avatar-stubble-dot" cx={x} cy={y} r={0.42} fill={edge} />
            ))}
          </>
        ),
        moustache: <path fill={fh} stroke={edge} strokeWidth={0.8} d="M27,36 Q32,33.5 37,36 Q32,35.5 27,36 Z" />,
        goatee: <path fill={fh} stroke={edge} strokeWidth={0.8} d="M29,40 Q32,47 35,40 Q32,41.5 29,40 Z" />,
        beard: (
          <>
            <path fill={fh} stroke={edge} strokeWidth={0.8} d={beardPath(params.beardReach, params.beardLength, shapeKey)} />
            {edge !== fh && params.beardReach !== undefined && params.beardLength !== undefined ? beardStrands(params.beardReach, params.beardLength, shapeKey, edge) : null}
          </>
        ),
      };
      parts.push(
        <g key="facial-hair" className="avatar-facial-hair">
          {shapes[params.facialHair]}
        </g>,
      );
    }
    // Features carry no colour of their own, so they are drawn in the face ink.
    const feature: Record<string, React.ReactNode> = {
      freckles: [
        [23.5, 32],
        [26, 33.5],
        [24.5, 34.5],
        [40.5, 32],
        [38, 33.5],
        [39.5, 34.5],
      ].map(([x, y]) => <circle key={`${x},${y}`} cx={x} cy={y} r={0.45} fill={faceInk} />),
      glasses: (
        <path fill="none" stroke={faceInk} strokeWidth={1} d="M22.5,28 a4,3.4 0 1,0 8,0 a4,3.4 0 1,0 -8,0 M33.5,28 a4,3.4 0 1,0 8,0 a4,3.4 0 1,0 -8,0 M30.5,27.5 Q32,26.5 33.5,27.5" />
      ),
      sunglasses: (
        <path fill={faceInk} stroke={faceInk} strokeWidth={1} d="M22.5,27 h8 v2.5 a4,2.5 0 0,1 -8,0 Z M33.5,27 h8 v2.5 a4,2.5 0 0,1 -8,0 Z M30.5,27.5 h3" />
      ),
      eyepatch: <path fill={faceInk} stroke={faceInk} strokeWidth={0.8} d="M34,25 h7 v5 a3.5,3 0 0,1 -7,0 Z M19,22 L34,26 M41,26 L45,24" />,
      // On the earlobe, over skin, so the face ink shows; below it they fell on the page background.
      earrings: [-1, 1].map((side) => (
        <circle key={side} cx={n(32 + side * (32 - ear.x) * fullness)} cy={n(30 + ear.ry - 1)} r={1.1} fill="none" stroke={faceInk} strokeWidth={0.8} />
      )),
      beauty_mark: <circle cx={36.5} cy={36} r={0.6} fill={faceInk} />,
      dimples: [27, 37].map((x) => <path key={x} fill="none" stroke={faceInk} strokeWidth={0.6} strokeLinecap="round" d={`M${x},37 q-0.6,0.8 0,1.6`} />),
    };
    for (const name of params.features) {
      parts.push(
        <g key={`feature-${name}`} className="avatar-feature" data-feature={name}>
          {feature[name]}
        </g>,
      );
    }
  }

  parts.push(...markElements(record, params.faceHidden, faceInk));
  return parts;
}

/** The record's uncovered marks on the head and neck (only the neck's on a hidden face), in `faceInk`. */
export function markElements(record: Record<string, unknown>, faceHidden: boolean, faceInk: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const marks = Array.isArray(record.marks) ? record.marks : [];
  marks.forEach((mark, index) => {
    if (!isRecord(mark)) return;
    const place = MARK_PLACES[word(mark.area)];
    if (!place || (faceHidden && word(mark.area) !== "neck")) return;
    const [x, y] = place;
    const kind = word(mark.kind);
    const key = `mark${index}`;
    if (kind === "scar" || kind === "cursed_scar" || kind === "burn") {
      parts.push(<path key={key} className="avatar-mark" fill="none" stroke={faceInk} strokeWidth={0.9} d={`M${x - 2},${y - 2} L${x + 2},${y + 2.5}`} />);
    } else if (kind === "piercing") {
      parts.push(<circle key={key} className="avatar-mark" fill="none" stroke={faceInk} strokeWidth={0.8} cx={x} cy={y} r={0.9} />);
    } else {
      parts.push(
        <path key={key} className="avatar-mark" fill="none" stroke={faceInk} strokeWidth={0.8} d={`M${x},${y - 2} L${x + 1.6},${y} L${x},${y + 2} L${x - 1.6},${y} Z`} />,
      );
    }
  });
  return parts;
}

/** Below this many CSS pixels the portrait shows the head alone, so the face has room to read. */
export const HEAD_CROP_BELOW = 48;
/** The head and the top of the shoulders, in the drawing's 64-unit square. */
export const HEAD_VIEWBOX = "12 5 40 40";

export const AvatarPortrait: React.FC<PortraitProps> = ({ appearance, size = 40, crop, className }) => {
  const parts = portraitElements(appearance);
  if (!parts) return null;
  // At the People list's 32 px the whole picture gives a face about 13 px; the head alone gives about 21. An animal is
  // drawn whole from the side, and its whole shape is what tells a duck from a snake, so it is never cropped.
  const record = appearanceRecord(appearance);
  const cropped = (crop ?? size < HEAD_CROP_BELOW) && !(record && resolvePlan(record).kind === "animal");
  return (
    <svg
      className={["avatar-portrait", cropped ? "avatar-portrait-head" : "", className].filter(Boolean).join(" ")}
      viewBox={cropped ? HEAD_VIEWBOX : "0 0 64 64"}
      style={cropped ? { borderRadius: "50%" } : undefined}
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      {parts}
    </svg>
  );
};

export default AvatarPortrait;
