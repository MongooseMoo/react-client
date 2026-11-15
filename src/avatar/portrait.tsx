import type React from "react";
import { BUILDS, type FigureParams, figureParams, appearanceRecord } from "./figure";

/**
 * A head-and-shoulders portrait of a person drawn in SVG from their Room.Layout
 * `appearance`, with the same colours and part choices as the 3D figure. Every
 * region is outlined in the figure's ink, so neighbouring regions stay apart
 * whatever their colours. Decorative: hidden from the accessibility tree,
 * because the words beside it say who it is.
 */

export interface PortraitProps {
  appearance: unknown;
  /** Rendered size in CSS pixels. */
  size?: number;
  className?: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const word = (value: unknown): string =>
  typeof value === "string" ? value.trim().toLowerCase().replace(/[\s-]+/g, "_") : "";

/** Areas of a mark drawn on a head-and-shoulders picture, and where. */
const MARK_PLACES: Readonly<Record<string, [number, number]>> = {
  forehead: [32, 18],
  face: [39.5, 33],
  cheek: [39.5, 33],
  cheeks: [39.5, 33],
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
  const params = figureParams(record, { height: 1.75, base: "#888888" });
  const c = params.colours;
  const ink = c.ink;
  const face = isRecord(record.face) ? record.face : {};
  const shoulders = 26 * BUILDS[params.build].shoulders;
  const parts: React.ReactNode[] = [];

  if (params.hair === "medium" || params.hair === "long") {
    const bottom = params.hair === "long" ? 54 : 42;
    const w = 15 * params.hairVolume;
    parts.push(
      <path
        key="hair-back"
        className="avatar-hair"
        fill={c.hair}
        stroke={ink}
        strokeWidth={1.2}
        d={`M${32 - w},26 C${32 - w},8 ${32 + w},8 ${32 + w},26 L${32 + w},${bottom} L${32 - w},${bottom} Z`}
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
  for (const x of [17.5, 46.5]) {
    const out = x < 32 ? -1 : 1;
    parts.push(
      pointed ? (
        <path key={`ear${x}`} fill={c.skin} stroke={ink} strokeWidth={1} d={`M${x - out},26 L${x + out * 4},19 L${x + out * 1.5},34 Z`} />
      ) : (
        <ellipse key={`ear${x}`} fill={c.skin} stroke={ink} strokeWidth={1} cx={x} cy={30} rx={2.6} ry={4} />
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
    const brow = c.hair ?? c.facialHair ?? ink;
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
        parts.push(<circle key={`eye${x}`} className="avatar-eye" cx={x} cy={28} r={2.2} fill={c.eyes} stroke={ink} strokeWidth={0.8} />);
      }
      parts.push(<circle key={`pupil${x}`} cx={x} cy={28} r={0.9} fill={ink} />);
    }
    const nose: Record<string, string> = {
      button: "M31,33 Q32,34.5 33,33",
      hooked: "M32,27 Q35,31 33,34 L30.5,34",
      previously_broken: "M32,27 L33,30 L31.5,32 L33,34 L30.5,34",
      pudgy: "M30,33 Q32,35.5 34,33",
    };
    parts.push(
      <path key="nose" fill="none" stroke={ink} strokeWidth={1} strokeLinecap="round" d={nose[word(face.nose)] ?? "M32,28 L30.8,33.5 L33,33.5"} />,
    );
    const lips = word(face.lips);
    const mouthWidth = lips === "narrow" ? 3 : 4.5;
    parts.push(
      <path
        key="mouth"
        fill="none"
        stroke={ink}
        strokeWidth={lips === "full" ? 1.9 : lips === "thin" ? 0.8 : 1.2}
        strokeLinecap="round"
        d={`M${32 - mouthWidth},38 Q32,${lips === "chapped" ? 39 : 39.8} ${32 + mouthWidth},38`}
      />,
    );
    const fh = c.facialHair;
    if (fh) {
      const shapes: Record<string, React.ReactElement> = {
        stubble: <path fill={fh} fillOpacity={0.45} stroke="none" d="M20,33 C21,45 43,45 44,33 C41,41 23,41 20,33 Z" />,
        moustache: <path fill={fh} stroke={ink} strokeWidth={0.8} d="M27,36 Q32,33.5 37,36 Q32,35.5 27,36 Z" />,
        goatee: <path fill={fh} stroke={ink} strokeWidth={0.8} d="M29,40 Q32,47 35,40 Q32,41.5 29,40 Z" />,
        beard: <path fill={fh} stroke={ink} strokeWidth={1} d="M19.5,30 C19,47 45,47 44.5,30 C43,38 38,41 32,41 C26,41 21,38 19.5,30 Z" />,
      };
      parts.push(
        <g key="facial-hair" className="avatar-facial-hair">
          {shapes[params.facialHair]}
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
      parts.push(<path key={key} className="avatar-mark" fill="none" stroke={ink} strokeWidth={0.9} d={`M${x - 2},${y - 2} L${x + 2},${y + 2.5}`} />);
    } else if (kind === "piercing") {
      parts.push(<circle key={key} className="avatar-mark" fill="none" stroke={ink} strokeWidth={0.8} cx={x} cy={y} r={0.9} />);
    } else {
      parts.push(
        <path key={key} className="avatar-mark" fill="none" stroke={ink} strokeWidth={0.8} d={`M${x},${y - 2} L${x + 1.6},${y} L${x},${y + 2} L${x - 1.6},${y} Z`} />,
      );
    }
  });
  return parts;
}

export const AvatarPortrait: React.FC<PortraitProps> = ({ appearance, size = 40, className }) => {
  const parts = portraitElements(appearance);
  if (!parts) return null;
  return (
    <svg
      className={["avatar-portrait", className].filter(Boolean).join(" ")}
      viewBox="0 0 64 64"
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
