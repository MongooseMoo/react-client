import type React from "react";
import { BUILDS, type FigureParams, figureParams, appearanceRecord, HORN_TONE, STUBBLE_OPACITY, vocabKey } from "./figure";

/**
 * A head-and-shoulders portrait of a person drawn in SVG from their Room.Layout
 * `appearance`, with the same colours and part choices as the 3D figure. Every
 * region is outlined in the figure's ink, so neighbouring regions stay apart
 * whatever their colours; what is drawn on the face (pupils, nose, mouth,
 * marks, features) is in the face ink, which stands out on the skin. Decorative: hidden from the accessibility tree,
 * because the words beside it say who it is.
 */

export interface PortraitProps {
  appearance: unknown;
  /** Rendered size in CSS pixels. */
  size?: number;
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

/** `face.ears` sizes: the left ear's centre x (the right mirrors it about x 32) and its half width and height. */
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
      // Flat planes meeting at corners: high cheekbones, a sharp jaw and a pointed chin.
      return <path {...common} strokeLinejoin="round" d="M22,13 L42,13 L46,27 L40,39 L32,44 L24,39 L18,27 Z" />;
    default:
      return <ellipse {...common} cx={32} cy={28} rx={13} ry={16} />;
  }
}

/** A round number for SVG path text. */
const n = (x: number) => Math.round(x * 100) / 100;

/** The hair over the top of the head, by length and texture. */
function hairCap(params: FigureParams, fill: string, ink: string): React.ReactNode {
  const v = params.hairVolume;
  const rise = 12 - (v - 1) * 18;
  const width = 14 * v;
  if (params.hairTexture === "curly" || params.hairTexture === "coily") {
    // Curly hair: one row of large round curls. Coily hair: smaller, tighter curls packed in two rows.
    const rows = params.hairTexture === "curly" ? [{ count: 9, reach: width, r: 3.2 * v }] : [
      { count: 13, reach: width + 0.5, r: 2.2 * v },
      { count: 8, reach: width - 4, r: 2.2 * v },
    ];
    const curls: React.ReactElement[] = [];
    for (const [row, { count, reach, r }] of rows.entries()) {
      for (let i = 0; i < count; i++) {
        // Along the top of the head, left to right (SVG y grows downward, so these angles are above the centre).
        const angle = Math.PI * (1 + i / (count - 1));
        const cx = 32 + Math.cos(angle) * reach;
        const cy = 24 + Math.sin(angle) * (reach - 1);
        curls.push(<circle key={`${row}-${i}`} cx={n(cx)} cy={n(cy)} r={n(r)} fill={fill} stroke={ink} strokeWidth={0.7} />);
      }
    }
    return <g className="avatar-hair">{curls}</g>;
  }
  if (params.hairTexture === "wavy") {
    // Wavy hair: the cap's outer edge in a run of soft waves, each bulging out between two points on the head's curve.
    const waves = 7;
    const ry = 27 - (0.25 * 27 + 0.75 * rise);
    const at = (angle: number, k: number) => `${n(32 + Math.cos(angle) * width * k)},${n(27 + Math.sin(angle) * ry * k)}`;
    let d = `M${n(32 - width)},27`;
    for (let i = 1; i <= waves; i++) {
      const a0 = Math.PI * (1 + (i - 1) / waves);
      const a1 = Math.PI * (1 + i / waves);
      d += ` Q${at((a0 + a1) / 2, 1.14)} ${at(a1, 1)}`;
    }
    d += ` C38,20 26,20 ${n(32 - width)},27 Z`;
    return <path className="avatar-hair" fill={fill} stroke={ink} strokeWidth={1.2} d={d} />;
  }
  return (
    <path
      className="avatar-hair"
      fill={fill}
      stroke={ink}
      strokeWidth={1.2}
      d={`M${32 - width},27 C${32 - width},${rise} ${32 + width},${rise} ${32 + width},27 C${38},20 ${26},20 ${32 - width},27 Z`}
    />
  );
}

/**
 * The beard: along the jaw from ear to ear, its lower edge below the chin by its length
 * (`FigureParams.beardReach`), narrowing to a point as it grows long. Without a length, the jaw-line beard.
 */
function beardPath(reach: number | undefined): string {
  const upper = "C43,38 38,41 32,41 C26,41 21,38 19.5,30 Z";
  if (reach === undefined) return `M19.5,30 C19,47 45,47 44.5,30 ${upper}`;
  // The curve's lowest point is a quarter of the way from its ends (y 30) to its control points.
  const bottom = 41.5 + 21.5 * reach;
  const control = (bottom - 0.25 * 30) / 0.75;
  const inset = 8 * Math.max(0, (reach - 0.3) / 0.7);
  return `M19.5,30 C${n(19 + inset)},${n(control)} ${n(45 - inset)},${n(control)} 44.5,30 ${upper}`;
}

export function portraitElements(appearance: unknown): React.ReactNode[] | null {
  const record = appearanceRecord(appearance);
  if (!record) return null;
  const params = figureParams(record, { height: 1.75 });
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
  const fullness = 1 + (shape.waist - 1) * 0.35;
  const shoulderRise = 50 - (shape.limbs - 1) * 12;
  const parts: React.ReactNode[] = [];

  // A plain disc behind the picture, so dark hair still shows on a dark page and light hair on a light one.
  parts.push(<circle key="backdrop" className="avatar-backdrop" cx={32} cy={32} r={31} fill={PORTRAIT_BACKDROP} />);
  if (params.hair === "medium" || params.hair === "long") {
    const bottom = params.hair === "long" ? 54 : 42;
    const w = 15 * params.hairVolume;
    // Hair falling behind the head, narrowing to rounded ends rather than a box.
    const r = 6;
    parts.push(
      <path
        key="hair-back"
        className="avatar-hair"
        fill={c.hair}
        stroke={ink}
        strokeWidth={1.2}
        d={`M${32 - w},26 C${32 - w},8 ${32 + w},8 ${32 + w},26 C${32 + w},${bottom - r} ${32 + w - r},${bottom} ${32 + w - 2 * r},${bottom} L${32 - w + 2 * r},${bottom} C${32 - w + r},${bottom} ${32 - w},${bottom - r} ${32 - w},26 Z`}
      />,
    );
  }
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
  const ears = vocabKey(face.ears);
  const pointed = params.extras.includes("pointed_ears") || ears === "pointed";
  const ear = EARS[ears ?? ""] ?? EARS.average;
  // A hood or hat over the head covers the ears.
  for (const side of params.headCovered ? [] : [-1, 1]) {
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
  } else if (params.hair !== "none" && c.hair) {
    parts.push(<g key="hair">{hairCap(params, c.hair, ink)}</g>);
  }
  if (params.extras.includes("horns") || params.extras.includes("antlers")) {
    const tine = params.extras.includes("antlers");
    for (const side of [-1, 1]) {
      parts.push(
        <path
          key={`horn${side}`}
          className="avatar-horn"
          fill={HORN_TONE}
          stroke={ink}
          strokeWidth={1}
          d={
            tine
              ? `M${32 + side * 7},14 L${32 + side * 12},3 L${32 + side * 13},5 L${32 + side * 10},9 L${32 + side * 16},6 L${32 + side * 16},8 L${32 + side * 9},14 Z`
              : `M${32 + side * 6},15 L${32 + side * 11},4 L${32 + side * 10},15 Z`
          }
        />,
      );
    }
  }

  if (!params.faceHidden) {
    const brows = vocabKey(face.brows) ?? "";
    const brow = c.hair ?? c.facialHair ?? faceInk;
    for (const x of [26.5, 37.5]) {
      // Toward the nose: -1 on the left brow, +1 on the right.
      const inward = x < 32 ? 1 : -1;
      const inner = x + inward * 3.5;
      const outer = x - inward * 3.5;
      const browShape: Record<string, [number, string]> = {
        thick: [2.2, `M${outer},23 L${inner},23`],
        thin: [0.9, `M${outer},23 L${inner},23`],
        arched: [1.5, `M${outer},23.5 Q${x},20.5 ${inner},23.5`],
        // Tufted: a ragged run of short strokes along a broad brow.
        bushy: [2.3, `M${outer},23.4 l${inward * 1.4},-1.6 l${inward * 0.6},1.4 l${inward * 1.4},-1.6 l${inward * 0.6},1.4 l${inward * 1.4},-1.6 l${inward * 0.6},1.4 l${inward * 1.0},-1.2`],
        // A broad, low brow that sinks toward the nose.
        heavy: [2.9, `M${outer - inward * 0.5},23.2 L${inner},24.6`],
      };
      const [width, d] = browShape[brows] ?? [1.5, `M${outer},23 L${inner},23`];
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
    if (fh) {
      const shapes: Record<string, React.ReactElement> = {
        stubble: <path fill={fh} fillOpacity={STUBBLE_OPACITY} stroke="none" d="M20,33 C21,45 43,45 44,33 C41,41 23,41 20,33 Z" />,
        moustache: <path fill={fh} stroke={faceInk} strokeWidth={0.8} d="M27,36 Q32,33.5 37,36 Q32,35.5 27,36 Z" />,
        goatee: <path fill={fh} stroke={faceInk} strokeWidth={0.8} d="M29,40 Q32,47 35,40 Q32,41.5 29,40 Z" />,
        beard: <path fill={fh} stroke={faceInk} strokeWidth={1} d={beardPath(params.beardReach)} />,
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

  const marks = Array.isArray(record.marks) ? record.marks : [];
  marks.forEach((mark, index) => {
    if (!isRecord(mark)) return;
    const place = MARK_PLACES[word(mark.area)];
    if (!place || (params.faceHidden && word(mark.area) !== "neck")) return;
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

export const AvatarPortrait: React.FC<PortraitProps> = ({ appearance, size = 40, className }) => {
  const parts = portraitElements(appearance);
  if (!parts) return null;
  // At the People list's 32 px the whole picture gives a face about 13 px; the head alone gives about 21.
  const cropped = size < HEAD_CROP_BELOW;
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
