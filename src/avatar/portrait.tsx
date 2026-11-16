import type React from "react";
import { overlayHex } from "./colour";
import { BUILDS, type FigureParams, type HairTexture, figureParams, appearanceRecord, HORN_TONE, STUBBLE_OPACITY, vocabKey } from "./figure";

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
      // Flat planes meeting at corners below the cheekbones: a sharp jaw and a pointed chin.
      return <path {...common} strokeLinejoin="round" d="M18,27 C18,9 46,9 46,27 L40,39 L32,44 L24,39 Z" />;
    default:
      return <ellipse {...common} cx={32} cy={28} rx={13} ry={16} />;
  }
}

/** A round number for SVG path text. */
const n = (x: number) => Math.round(x * 100) / 100;

/**
 * The hair over the top of the head, by texture, `v` times as bulky as straight hair. Cropped hair
 * (`crop`) lies closer and starts higher on the forehead, its curls smaller.
 */
function hairCap(texture: HairTexture, v: number, fill: string, ink: string, crop = false): React.ReactNode {
  const rise = 12 - (v - 1) * 18 + (crop ? 1.5 : 0);
  const width = 14 * v * (crop ? 0.95 : 1);
  const hairline = crop ? 17.5 : 20;
  const curl = crop ? 0.7 : 1;
  if (texture === "curly" || texture === "coily") {
    // Curly hair: one row of large round curls. Coily hair: smaller, tighter curls packed in two rows.
    const rows = texture === "curly" ? [{ count: 9, reach: width, r: 3.2 * v * curl }] : [
      { count: 13, reach: width + 0.5, r: 2.2 * v * curl },
      { count: 8, reach: width - 4, r: 2.2 * v * curl },
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
  if (texture === "wavy") {
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
    d += ` C38,${hairline} 26,${hairline} ${n(32 - width)},27 Z`;
    return <path className="avatar-hair" fill={fill} stroke={ink} strokeWidth={1.2} d={d} />;
  }
  return (
    <path
      className="avatar-hair"
      fill={fill}
      stroke={ink}
      strokeWidth={1.2}
      d={`M${n(32 - width)},27 C${n(32 - width)},${n(rise)} ${n(32 + width)},${n(rise)} ${n(32 + width)},27 C38,${hairline} 26,${hairline} ${n(32 - width)},27 Z`}
    />
  );
}

/**
 * Texture on the close cap of tied hair (its outline from (18,27) over y 15.75 to (46,27)): curls (one row of
 * rounds) or coils (a row of small rounds and tight rings in the sheen inside) on the outline, or wave lines across
 * it in the sheen. Nothing for straight hair.
 */
function capTexture(texture: HairTexture, fill: string, ink: string, sheen: string): React.ReactNode {
  if (texture === "straight") return null;
  if (texture === "wavy") {
    return (
      <path className="avatar-hair-texture" fill="none" stroke={sheen} strokeWidth={0.8} strokeLinecap="round" d="M22,20.5 q2.5,-2 5,0 t5,0 t5,0 t5,0 M24,16.8 q2,-1.6 4,0 t4,0 t4,0 t4,0" />
    );
  }
  const curly = texture === "curly";
  const count = curly ? 9 : 13;
  const r = curly ? 2.2 : 1.5;
  const out: React.ReactElement[] = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.PI * (1 + i / (count - 1));
    out.push(<circle key={`c${i}`} className="avatar-hair-texture" cx={n(32 + Math.cos(angle) * 14)} cy={n(27 + Math.sin(angle) * 11.25)} r={r} fill={fill} stroke={ink} strokeWidth={0.6} />);
  }
  if (!curly) {
    // Tight coils inside the outline: small rings in the sheen.
    for (let i = 0; i < 7; i++) {
      const angle = Math.PI * (1.12 + (0.76 * i) / 6);
      out.push(<circle key={`k${i}`} className="avatar-hair-texture" cx={n(32 + Math.cos(angle) * 9)} cy={n(25.5 + Math.sin(angle) * 7)} r={0.9} fill="none" stroke={sheen} strokeWidth={0.6} />);
    }
  }
  return out;
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
 * What a hair style puts behind the head (`back`, drawn before the shoulders), hanging in front of the
 * shoulders (`hang`, before the head) and over the head (`cap`). `loose` is the hair as it falls.
 */
function hairStyle(params: FigureParams, fill: string, ink: string, skin: string): { back: React.ReactNode[]; hang: React.ReactNode[]; cap: React.ReactNode } {
  const v = params.hairVolume;
  const texture = params.hairTexture;
  const fallBottom = FALL_BOTTOM[params.hair] ?? 0;
  const falls = fallBottom > 0;
  const bottom = HANG_BOTTOM[params.hair];
  const line = (key: string, d: string, width = 0.8) => <path key={key} fill="none" stroke={ink} strokeWidth={width} strokeLinecap="round" d={d} />;
  // A close cap for hair drawn back from the face: smooth, whatever the texture.
  const sleek = (hairline = "C38,20 26,20") => (
    <path className="avatar-hair" fill={fill} stroke={ink} strokeWidth={1.2} d={`M18,27 C18,12 46,12 46,27 ${hairline} 18,27 Z`} />
  );
  const sheen = params.colours.hairSheen ?? ink;
  /**
   * Hair worn down also hangs in front of the shoulders beside the face, ending in a rounded tip where the hair
   * ends: above the shoulders for chin-length, on them for shoulder-length. Behind the head alone, its end was hidden
   * by the shoulders and, beside a long dark beard, chin and shoulder length looked the same.
   */
  const sideLocks = () => {
    // Shoulder-length hair lies a little way down the front of the shoulders, so its end is seen on them.
    const end = fallBottom + (params.hair === "shoulder-length" ? 2.5 : 0);
    return falls
      ? [-1, 1].map((side) => {
          const outer = 32 + side * 16.6;
          const inner = 32 + side * 12.9;
          return (
            <path
              key={`side-lock${side}`}
              className="avatar-hair"
              fill={fill}
              stroke={ink}
              strokeWidth={1}
              d={`M${n(outer)},27 L${n(outer)},${n(end - 2)} Q${n((outer + inner) / 2)},${n(end + 1.4)} ${n(inner)},${n(end - 2)} L${n(inner)},30 Z`}
            />
          );
        })
      : [];
  };
  /**
   * Hair drawn back and tied (ponytail, braids, bun, topknot) keeps its texture on the cap: curls or tight coils
   * standing on its outline, or waves across it in the hair's sheen. Without it the tied styles all looked straight.
   */
  const tiedCap = (extra: React.ReactNode = null) => (
    <g className="avatar-hair">
      {sleek()}
      {capTexture(texture, fill, ink, sheen)}
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
        cap: tiedCap(<rect x={43} y={15.5} width={3.5} height={3} rx={1} fill={ink} />),
      };
    case "braided": {
      // Two braids hanging in front of the shoulders, each a chain of plaited links ending in a tie.
      const hang: React.ReactNode[] = [];
      for (const side of [-1, 1]) {
        const x = 32 + side * 13;
        for (let y = 30; y <= bottom - 2; y += 3.4) {
          hang.push(<ellipse key={`braid${side}-${y}`} className="avatar-hair" cx={x} cy={n(y)} rx={2.6} ry={2.1} fill={fill} stroke={ink} strokeWidth={0.8} />);
        }
        hang.push(<rect key={`tie${side}`} x={x - 1.5} y={bottom - 1} width={3} height={1.8} fill={ink} />);
      }
      return { back: [], hang, cap: tiedCap(line("parting", "M32,13 L32,20.5")) };
    }
    case "bun":
      // Gathered into a round bun on the crown.
      return {
        back: [],
        hang: [],
        cap: (
          <g className="avatar-hair">
            <circle cx={32} cy={10} r={6} fill={fill} stroke={ink} strokeWidth={1.2} />
            {/* Curls or coils round a textured bun's top. */}
            {texture === "curly" || texture === "coily"
              ? [0, 1, 2, 3, 4, 5, 6].map((step) => {
                  const angle = Math.PI * (1 + step / 6);
                  const [cx, cy] = [n(32 + Math.cos(angle) * 6), n(10 + Math.sin(angle) * 6)];
                  return <circle key={`bun${cx},${cy}`} className="avatar-hair-texture" cx={cx} cy={cy} r={texture === "curly" ? 1.8 : 1.3} fill={fill} stroke={ink} strokeWidth={0.6} />;
                })
              : null}
            {tiedCap(line("bun-ring", "M28.5,10.5 Q32,6 35.5,10.5"))}
          </g>
        ),
      };
    case "topknot":
      // A small knot high on the crown, tied at its base.
      return {
        back: [],
        hang: [],
        cap: (
          tiedCap(
            <>
              <circle cx={32} cy={5.5} r={3.4} fill={fill} stroke={ink} strokeWidth={1} />
              <rect x={30.4} y={8.6} width={3.2} height={3.6} fill={ink} />
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
            <path fill={overlayHex(skin, fill, STUBBLE_OPACITY)} stroke="none" d="M19,27 C19,12 45,12 45,27 C40,21 24,21 19,27 Z" />
            <path fill={fill} stroke={ink} strokeWidth={1.2} d="M28.5,20 C27.5,10 29,1.5 32,0.5 C35,1.5 36.5,10 35.5,20 C34,21 30,21 28.5,20 Z" />
          </g>
        ),
      };
    case "swept_back":
      // Combed straight back off a high forehead; the comb lines run back over the crown.
      return {
        back: falls ? [hairBack(15, fallBottom, fill, ink)] : [],
        hang: sideLocks(),
        cap: <g className="avatar-hair">{sleek("C39,15.5 25,15.5")}{line("comb", "M26,16.5 Q25,13 27,10.5 M32,15.5 Q31.5,12 32,9.5 M38,16.5 Q39,13 37,10.5", 0.7)}</g>,
      };
    case "brushed":
      // Neatly brushed with a side parting, the fringe swept across.
      return {
        back: falls ? [hairBack(15, fallBottom, fill, ink)] : [],
        hang: sideLocks(),
        cap: <g className="avatar-hair">{sleek("C41,23 27,17")}{line("parting", "M25.5,12 Q24.5,15 23.5,18.5", 0.9)}</g>,
      };
    case "voluminous":
      // Thick and full: the hair stands well out from the head and falls wide.
      return {
        back: [hairBack(15 * v * 1.3, falls ? fallBottom + 4 : 40, fill, ink)],
        hang: [],
        cap: hairCap(texture, v * 1.3, fill, ink),
      };
    default:
      // Shaved: a shadow of the hair's colour on the scalp. Waist-length hair spreads a little as it falls.
      if (params.hair === "shaved") {
        return { back: [], hang: [], cap: <path className="avatar-hair-shadow" fill={overlayHex(skin, fill, STUBBLE_OPACITY)} stroke="none" d="M19,27 C19,12 45,12 45,27 C40,21 24,21 19,27 Z" /> };
      }
      return {
        back: falls ? [hairBack(15 * v * (params.hair === "waist-length" ? 1.1 : 1), fallBottom, fill, ink)] : [],
        hang: sideLocks(),
        cap: hairCap(texture, v, fill, ink, params.hair === "cropped"),
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
  const fullness = 1 + (shape.waist - 1) * 0.5;
  const shoulderRise = 50 - (shape.limbs - 1) * 12;
  const parts: React.ReactNode[] = [];

  // A plain disc behind the picture, so dark hair still shows on a dark page and light hair on a light one.
  parts.push(<circle key="backdrop" className="avatar-backdrop" cx={32} cy={32} r={31} fill={PORTRAIT_BACKDROP} />);
  const style = !params.headCovered && params.hair !== "none" && c.hair ? hairStyle(params, c.hair, ink, c.skin) : undefined;
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
  } else if (style) {
    parts.push(<g key="hair">{style.cap}</g>);
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
        beard: <path fill={fh} stroke={edge} strokeWidth={0.8} d={beardPath(params.beardReach, params.beardLength, shapeKey)} />,
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
