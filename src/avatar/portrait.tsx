import type React from "react";
import { BUILDS, type FigureParams, figureParams, appearanceRecord, STUBBLE_OPACITY } from "./figure";

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
    default:
      return <ellipse {...common} cx={32} cy={28} rx={13} ry={16} />;
  }
}

/** The hair over the top of the head, by length and how far it stands out. */
function hairCap(params: FigureParams, fill: string, ink: string): React.ReactNode {
  const v = params.hairVolume;
  const rise = 12 - (v - 1) * 18;
  const width = 14 * v;
  if (v > 1.1) {
    // Curly and coily hair: a cap of overlapping round curls.
    const curls: React.ReactElement[] = [];
    const count = 9;
    for (let i = 0; i < count; i++) {
      // Along the top of the head, left to right (SVG y grows downward, so these angles are above the centre).
      const angle = Math.PI * (1 + i / (count - 1));
      const cx = 32 + Math.cos(angle) * width;
      const cy = 24 + Math.sin(angle) * (width - 1);
      curls.push(<circle key={i} cx={cx} cy={cy} r={3.2 * v} fill={fill} stroke={ink} strokeWidth={0.8} />);
    }
    return <g className="avatar-hair">{curls}</g>;
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

export function portraitElements(appearance: unknown): React.ReactNode[] | null {
  const record = appearanceRecord(appearance);
  if (!record) return null;
  const params = figureParams(record, { height: 1.75 });
  const c = params.colours;
  const ink = c.ink;
  // What is drawn on the skin uses the ink that stands out on the skin; region outlines use the seam ink.
  const faceInk = c.faceInk;
  const face =isRecord(record.face) ? record.face : {};
  const shoulders = 26 * BUILDS[params.build].shoulders;
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
      d={`M${32 - shoulders},64 C${32 - shoulders},50 ${32 - shoulders * 0.55},45 32,45 C${32 + shoulders * 0.55},45 ${32 + shoulders},50 ${32 + shoulders},64 Z`}
    />,
    <rect key="neck" className="avatar-neck" x={27} y={36} width={10} height={10} fill={c.neck} stroke={ink} strokeWidth={1.2} />,
  );
  const pointed = params.extras.includes("pointed_ears") || word(face.ears) === "pointed";
  // A hood or hat over the head covers the ears.
  for (const x of params.headCovered ? [] : [17.5, 46.5]) {
    const out = x < 32 ? -1 : 1;
    parts.push(
      pointed ? (
        <path key={`ear${x}`} className="avatar-ear" fill={c.skin} stroke={ink} strokeWidth={1} d={`M${x - out},26 L${x + out * 4},19 L${x + out * 1.5},34 Z`} />
      ) : (
        <ellipse key={`ear${x}`} className="avatar-ear" fill={c.skin} stroke={ink} strokeWidth={1} cx={x} cy={30} rx={2.6} ry={4} />
      ),
    );
  }
  parts.push(<g key="head">{headShape(word(face.shape), c.skin, ink)}</g>);

  if (params.headCovered) {
    parts.push(
      <path key="head-garment" className="avatar-garment" fill={c.head} stroke={ink} strokeWidth={1.2} d="M17,30 C15,6 49,6 47,30 C44,20 20,20 17,30 Z" />,
    );
  } else if (params.hair !== "none" && c.hair) {
    parts.push(<g key="hair">{hairCap(params, c.hair, ink)}</g>);
  }
  if (params.extras.includes("horns") || params.extras.includes("antlers")) {
    const tine = params.extras.includes("antlers");
    const fill = c.hair ?? c.skin;
    for (const side of [-1, 1]) {
      parts.push(
        <path
          key={`horn${side}`}
          fill={fill}
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
    const browWidth = { thick: 2.2, bushy: 2.4, thin: 0.9 }[word(face.brows)] ?? 1.5;
    const arched = word(face.brows) === "arched";
    const brow = c.hair ?? c.facialHair ?? faceInk;
    for (const x of [26.5, 37.5]) {
      parts.push(
        <path
          key={`brow${x}`}
          className="avatar-brow"
          fill="none"
          stroke={brow}
          strokeWidth={browWidth}
          strokeLinecap="round"
          d={arched ? `M${x - 3.5},23.5 Q${x},20.5 ${x + 3.5},23.5` : `M${x - 3.5},23 L${x + 3.5},23`}
        />,
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
    };
    parts.push(
      <path key="nose" className="avatar-nose" fill="none" stroke={faceInk} strokeWidth={1} strokeLinecap="round" d={nose[word(face.nose)] ?? "M32,28 L30.8,33.5 L33,33.5"} />,
    );
    const lips = word(face.lips);
    const mouthWidth = lips === "narrow" ? 3 : 4.5;
    parts.push(
      <path
        key="mouth"
        className="avatar-mouth"
        fill="none"
        stroke={faceInk}
        strokeWidth={lips === "full" ? 1.9 : lips === "thin" ? 0.8 : 1.2}
        strokeLinecap="round"
        d={`M${32 - mouthWidth},38 Q32,${lips === "chapped" ? 39 : 39.8} ${32 + mouthWidth},38`}
      />,
    );
    const fh = c.facialHair;
    if (fh) {
      const shapes: Record<string, React.ReactElement> = {
        stubble: <path fill={fh} fillOpacity={STUBBLE_OPACITY} stroke="none" d="M20,33 C21,45 43,45 44,33 C41,41 23,41 20,33 Z" />,
        moustache: <path fill={fh} stroke={faceInk} strokeWidth={0.8} d="M27,36 Q32,33.5 37,36 Q32,35.5 27,36 Z" />,
        goatee: <path fill={fh} stroke={faceInk} strokeWidth={0.8} d="M29,40 Q32,47 35,40 Q32,41.5 29,40 Z" />,
        beard: <path fill={fh} stroke={faceInk} strokeWidth={1} d="M19.5,30 C19,47 45,47 44.5,30 C43,38 38,41 32,41 C26,41 21,38 19.5,30 Z" />,
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
      earrings: [17.5, 46.5].map((x) => <circle key={x} cx={x} cy={33} r={1.1} fill="none" stroke={faceInk} strokeWidth={0.8} />),
      mole: <circle cx={36.5} cy={36} r={0.6} fill={faceInk} />,
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
