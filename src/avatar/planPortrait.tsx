import type React from "react";
import { type AnimalPlan, ARTHROPOD_BODY_Z, type HumanoidPlan, type QuadShape } from "./bodyPlan";
import { INK_DARK, inkFor, overlayHex } from "./colour";
import { BUILDS, type FigureParams, HORN_TONE, IVORY } from "./figure";
import { markElements, PORTRAIT_BACKDROP } from "./portrait";

/**
 * Portraits for body plans other than the human one (bodyPlan.ts), in the human portrait's 64-unit square with
 * the head inside its head crop (`HEAD_VIEWBOX`, x 12 to 52, y 5 to 45): a humanoid plan's head and shoulders, an
 * animal seen from the side facing right, and for an unknown plan a plain rounded silhouette. Colours come from
 * `figureParams`, so the portrait, the 3D figure and the plan token agree.
 */

const RING = "#f2f0ea";
const n = (x: number) => Math.round(x * 100) / 100;
/** An animal's drawing scaled about the backdrop's middle so all of it lies within the disc (radius 31). */
export const ANIMAL_FIT = "translate(32 33) scale(0.84) translate(-32 -33)";

export function planPortraitElements(p: FigureParams, record: Record<string, unknown>): React.ReactNode[] {
  const plan = p.plan;
  const parts: React.ReactNode[] = [<circle key="backdrop" className="avatar-backdrop" cx={32} cy={32} r={31} fill={PORTRAIT_BACKDROP} />];
  if (plan.kind === "humanoid") {
    parts.push(...humanoidPortrait(p, plan));
    parts.push(...markElements(record, false, p.colours.faceInk));
  } else if (plan.kind === "animal") {
    // Drawn a little smaller than the square, so the tail, coils and body stay inside the round backdrop.
    parts.push(
      <g key="animal" transform={ANIMAL_FIT}>
        {animalPortrait(p, plan)}
      </g>,
    );
  } else {
    parts.push(<rect key="placeholder" className="avatar-placeholder" x={20} y={8} width={24} height={60} rx={12} fill={p.colours.skin} stroke={p.colours.ink} strokeWidth={1.2} />);
  }
  return parts;
}

function humanoidPortrait(p: FigureParams, plan: HumanoidPlan): React.ReactNode[] {
  const c = p.colours;
  const ink = c.ink;
  const skin = plan.headColour ?? c.skin;
  const eyes = c.eyes ?? INK_DARK;
  const onAccent = inkFor(plan.accent);
  const bare = c.torso === c.skin;
  const out: React.ReactNode[] = [];
  const eye = (x: number, y: number, r = 2) => [
    <circle key={`eye${x}`} className="avatar-eye" cx={x} cy={y} r={r} fill={eyes} stroke={c.faceInk} strokeWidth={0.8} />,
    <circle key={`pupil${x}`} className="avatar-pupil" cx={x} cy={y} r={r * 0.4} fill={INK_DARK} />,
  ];
  const shoulders = (d: string) => <path key="shoulders" className="avatar-garment" fill={c.torso} stroke={ink} strokeWidth={1.2} d={d} />;
  const neck = (x: number, w: number, y = 36) => <rect key="neck" className="avatar-neck" x={x} y={y} width={w} height={46 - y + 2} fill={c.neck} stroke={ink} strokeWidth={1.2} />;
  switch (plan.head) {
    case "wolf":
      out.push(shoulders("M2,64 C2,46 18,40 32,40 C46,40 62,46 62,64 Z"));
      if (bare) out.push(<path key="ruff" className="avatar-fur" fill={plan.accent} stroke={ink} strokeWidth={0.8} d="M22,64 L24,46 L28,50 L32,44 L36,50 L40,46 L42,64 Z" />);
      for (const side of [-1, 1]) {
        out.push(<path key={`ear${side}`} className="avatar-ear" fill={skin} stroke={ink} strokeWidth={1} d={`M${32 + side * 12},22 L${32 + side * 15},5 L${32 + side * 4},15 Z`} />);
        out.push(<path key={`inner${side}`} className="avatar-ear" fill={plan.accent} d={`M${32 + side * 11},18 L${32 + side * 13},9 L${32 + side * 7},15 Z`} />);
        out.push(<path key={`tuft${side}`} className="avatar-fur" fill={skin} stroke={ink} strokeWidth={0.8} d={`M${32 + side * 12},24 L${32 + side * 18},31 L${32 + side * 12.5},30.5 L${32 + side * 16},36 L${32 + side * 9},32 Z`} />);
      }
      out.push(<ellipse key="head" className="avatar-head" cx={32} cy={25} rx={13} ry={12} fill={skin} stroke={ink} strokeWidth={1.2} />);
      out.push(<ellipse key="muzzle" className="avatar-muzzle" cx={32} cy={34} rx={7.5} ry={7} fill={plan.accent} stroke={ink} strokeWidth={1} />);
      out.push(<ellipse key="nose" className="avatar-nose" cx={32} cy={30.5} rx={2.6} ry={1.8} fill={INK_DARK} />);
      out.push(<path key="mouth" className="avatar-mouth" fill="none" stroke={onAccent} strokeWidth={1} strokeLinecap="round" d="M32,32.5 L32,35 M28,36.5 Q32,38.5 36,36.5" />);
      out.push(...eye(26.5, 24), ...eye(37.5, 24));
      out.push(<path key="brows" className="avatar-brow" fill="none" stroke={c.faceInk} strokeWidth={1.2} strokeLinecap="round" d="M23.5,21 L29,22.5 M40.5,21 L35,22.5" />);
      break;
    case "slack":
      out.push(shoulders("M8,64 C8,52 18,47 32,47 C46,47 56,52 56,64 Z"), neck(27, 10));
      out.push(
        <g key="head" transform="rotate(8 32 40)">
          <ellipse className="avatar-ear" cx={19.5} cy={29} rx={2.2} ry={3.5} fill={skin} stroke={ink} strokeWidth={1} />
          <ellipse className="avatar-ear" cx={44.5} cy={29} rx={2.2} ry={3.5} fill={skin} stroke={ink} strokeWidth={1} />
          <ellipse className="avatar-head" cx={32} cy={27} rx={12} ry={14} fill={skin} stroke={ink} strokeWidth={1.2} />
          <path className="avatar-shadow" fill="none" stroke={plan.accent} strokeWidth={1.4} strokeLinecap="round" d="M23.6,29.4 Q26.5,31 29.4,29.4 M34.6,30.9 Q37.5,32.5 40.4,30.9" />
          {eye(26.5, 26, 2.3)}
          {eye(37.5, 27.5, 2.3)}
          <path className="avatar-lid" fill={plan.accent} d="M24.2,26 A2.3,2.3 0 0 1 28.8,26 Z M35.2,27.5 A2.3,2.3 0 0 1 39.8,27.5 Z" />
          <path className="avatar-nose" fill="none" stroke={c.faceInk} strokeWidth={1} strokeLinecap="round" d="M32,29 L30.8,34 L33,34" />
          <ellipse className="avatar-mouth" cx={32} cy={38.2} rx={3.6} ry={2.4} fill={overlayHex(plan.accent, INK_DARK, 0.6)} stroke={c.faceInk} strokeWidth={0.8} />
        </g>,
      );
      break;
    case "ghoul":
      out.push(shoulders("M6,64 C6,50 20,46 32,46 C44,46 58,50 58,64 Z"), neck(28, 8));
      for (const side of [-1, 1]) out.push(<path key={`ear${side}`} className="avatar-ear" fill={skin} stroke={ink} strokeWidth={1} d={`M${32 + side * 12},26 L${32 + side * 16},21 L${32 + side * 11.5},31 Z`} />);
      out.push(<path key="head" className="avatar-head" fill={skin} stroke={ink} strokeWidth={1.2} d="M21,22 C21,10 43,10 43,22 L46,36 C46,44 40,47 32,47 C24,47 18,44 18,36 Z" />);
      out.push(<path key="jaw" className="avatar-jaw" fill={plan.accent} stroke={ink} strokeWidth={0.8} d="M18.6,36 C18.6,43 24,46.5 32,46.5 C40,46.5 45.4,43 45.4,36 C41,39.5 23,39.5 18.6,36 Z" />);
      for (const x of [26.5, 37.5]) {
        out.push(<ellipse key={`socket${x}`} className="avatar-socket" cx={x} cy={26} rx={3.2} ry={2.5} fill={overlayHex(skin, INK_DARK, 0.5)} />);
        // Large enough to show at the People list's 32 px: at 1.3 they were a speck there.
        out.push(<circle key={`eye${x}`} className="avatar-eye" cx={x} cy={26} r={1.8} fill={eyes} stroke={INK_DARK} strokeWidth={0.5} />);
      }
      out.push(<path key="nose" className="avatar-nose" fill="none" stroke={c.faceInk} strokeWidth={0.9} strokeLinecap="round" d="M30.5,32.5 l-0.5,1.6 M33.5,32.5 l0.5,1.6" />);
      out.push(<path key="mouth" className="avatar-mouth" fill="none" stroke={INK_DARK} strokeWidth={1.2} strokeLinecap="round" d="M24,40.5 L40,40.5 M26.5,40.5 l0,1.6 M29.5,40.5 l0,1.6 M32.5,40.5 l0,1.6 M35.5,40.5 l0,1.6 M38,40.5 l0,1.6" />);
      break;
    case "primate":
      out.push(shoulders("M0,64 C0,46 16,40 32,40 C48,40 64,46 64,64 Z"));
      if (bare) out.push(<ellipse key="chest" className="avatar-fur" cx={32} cy={58} rx={12} ry={10} fill={plan.accent} stroke={ink} strokeWidth={0.8} />);
      for (const side of [-1, 1]) out.push(<circle key={`ear${side}`} className="avatar-ear" cx={32 + side * 14.5} cy={27} r={4} fill={plan.accent} stroke={ink} strokeWidth={1} />);
      out.push(<ellipse key="head" className="avatar-head" cx={32} cy={26} rx={14} ry={13} fill={skin} stroke={ink} strokeWidth={1.2} />);
      out.push(<path key="face" className="avatar-face" fill={plan.accent} d="M22,24 C22,18 29,19 32,21 C35,19 42,18 42,24 C44,32 40,41 32,41 C24,41 20,32 22,24 Z" />);
      out.push(<path key="brow" className="avatar-brow" fill={skin} d="M21.5,22 Q26.5,18.5 32,21 Q37.5,18.5 42.5,22 L42.5,23.8 Q37.5,21.2 32,23.2 Q26.5,21.2 21.5,23.8 Z" />);
      out.push(...eye(27, 25.8, 1.8), ...eye(37, 25.8, 1.8));
      out.push(<ellipse key="muzzle" className="avatar-muzzle" cx={32} cy={34} rx={7} ry={5} fill={plan.accent} stroke={onAccent} strokeWidth={0.6} />);
      out.push(<circle key="nostril-l" className="avatar-nose" cx={30.5} cy={32.5} r={0.8} fill={INK_DARK} />);
      out.push(<circle key="nostril-r" className="avatar-nose" cx={33.5} cy={32.5} r={0.8} fill={INK_DARK} />);
      out.push(<path key="mouth" className="avatar-mouth" fill="none" stroke={onAccent} strokeWidth={1} strokeLinecap="round" d="M26.5,37 Q32,39.5 37.5,37" />);
      break;
    case "crystal":
      out.push(shoulders("M4,64 L8,50 L20,45 L32,44 L44,45 L56,50 L60,64 Z"));
      out.push(<path key="facets-body" className="avatar-facet" fill="none" stroke={plan.accent} strokeWidth={0.8} d="M20,45 L24,64 M44,45 L40,64 M32,44 L32,64 M8,50 L18,64 M56,50 L46,64" />);
      out.push(<path key="neck" className="avatar-neck" fill={c.neck} stroke={ink} strokeWidth={1.2} d="M27,36 L37,36 L38,46 L26,46 Z" />);
      out.push(<path key="spur" className="avatar-facet" fill={plan.accent} stroke={ink} strokeWidth={1} d="M34,13 L38,2 L41,14 Z" />);
      out.push(<path key="head" className="avatar-head" fill={skin} stroke={ink} strokeWidth={1.2} d="M32,10 L43,15 L46,27 L41,40 L32,45 L23,40 L18,27 L21,15 Z" />);
      out.push(<path key="facet-light" className="avatar-facet" fill={plan.accent} fillOpacity={0.7} d="M32,10 L43,15 L32,27 Z M18,27 L23,40 L32,27 Z" />);
      out.push(<path key="facets" className="avatar-facet" fill="none" stroke={plan.accent} strokeWidth={0.7} d="M32,27 L32,10 M32,27 L46,27 M32,27 L41,40 M32,27 L23,40 M32,27 L21,15" />);
      out.push(<path key="eyes" className="avatar-eye" fill={eyes} stroke={ink} strokeWidth={0.6} d="M26.5,24 L28.5,26 L26.5,28 L24.5,26 Z M37.5,24 L39.5,26 L37.5,28 L35.5,26 Z" />);
      out.push(<path key="mouth" className="avatar-mouth" fill="none" stroke={eyes} strokeWidth={0.9} d="M28.5,36 L35.5,36" />);
      break;
    case "shark": {
      // The person's own body: shoulders and neck by their build, as the human portrait draws them.
      const shape = BUILDS[p.build] ?? BUILDS.average;
      const half = 26 * shape.shoulders;
      const rise = 50 - (shape.limbs - 1) * 12;
      const neckW = 10 * shape.limbs;
      out.push(
        shoulders(`M${n(32 - half)},64 C${n(32 - half)},${n(rise)} ${n(32 - half * 0.55)},45 32,45 C${n(32 + half * 0.55)},45 ${n(32 + half)},${n(rise)} ${n(32 + half)},64 Z`),
        neck(n(32 - neckW / 2), n(neckW), 37),
      );
      out.push(<path key="fin" className="avatar-fin" fill={skin} stroke={ink} strokeWidth={1} d="M29,15 L36,1.5 L41,15 Z" />);
      out.push(<ellipse key="head" className="avatar-head" cx={32} cy={26} rx={14} ry={12} fill={skin} stroke={ink} strokeWidth={1.2} />);
      out.push(<path key="underside" className="avatar-underside" fill={plan.accent} stroke={ink} strokeWidth={0.8} d="M18.4,28 C20,37.5 26,40 32,40 C38,40 44,37.5 45.6,28 C40,32.5 24,32.5 18.4,28 Z" />);
      out.push(<path key="mouth" className="avatar-mouth" fill="none" stroke={INK_DARK} strokeWidth={1.4} strokeLinecap="round" d="M23,32.5 Q32,37.5 41,32.5" />);
      out.push(<path key="gills" className="avatar-gill" fill="none" stroke={overlayHex(skin, INK_DARK, 0.55)} strokeWidth={0.8} d="M19.5,22 l-1,4 M21.5,22.5 l-1,4 M44.5,22 l1,4 M42.5,22.5 l1,4" />);
      out.push(<circle key="eye-l" className="avatar-eye" cx={22.5} cy={22} r={1.7} fill={eyes} />, <circle key="eye-r" className="avatar-eye" cx={41.5} cy={22} r={1.7} fill={eyes} />);
      out.push(<path key="nose" className="avatar-nose" fill="none" stroke={c.faceInk} strokeWidth={0.8} strokeLinecap="round" d="M28,20 l1.6,0.7 M36,20 l-1.6,0.7" />);
      break;
    }
  }
  return out;
}

function animalPortrait(p: FigureParams, plan: AnimalPlan): React.ReactNode[] {
  const ink = p.colours.ink;
  const line = { stroke: ink, strokeWidth: 1 };
  switch (plan.animal) {
    case "duck":
      return [
        <path key="tail" className="avatar-tail" fill={overlayHex(plan.skin, INK_DARK, 0.65)} {...line} d="M10,52 L2,45 L12,48 Z" />,
        <ellipse key="body" className="avatar-body" cx={30} cy={54} rx={22} ry={12} fill={plan.skin} {...line} />,
        <ellipse key="wing" className="avatar-wing" cx={24} cy={51} rx={14} ry={6} transform="rotate(-6 24 51)" fill={plan.wing} {...line} />,
        <ellipse key="breast" className="avatar-breast" cx={41} cy={50} rx={10} ry={10} fill={plan.accent} {...line} />,
        <path key="neck" className="avatar-neck" fill={plan.head} {...line} d="M31,24 L39,24 L41,44 L31,44 Z" />,
        <path key="ring" className="avatar-ring" fill={RING} d="M31,39.5 L40.5,39.5 L40.8,42.5 L31,42.5 Z" />,
        <circle key="head" className="avatar-head" cx={34} cy={21} r={9} fill={plan.head} {...line} />,
        <path key="bill" className="avatar-bill" fill={plan.beak} {...line} d="M41,19.5 C46,19 51,21.5 51.5,24.5 C49,26 43,25.5 41,24.5 Z" />,
        <circle key="eye" className="avatar-eye" cx={37} cy={19.5} r={1.4} fill={plan.eyes} />,
      ];
    case "songbird":
      return [
        <path key="tail" className="avatar-tail" fill={plan.wing} {...line} d="M15,44 L2,55 L8,59 L21,50 Z" />,
        <path key="legs" className="avatar-leg" fill="none" stroke={plan.feet} strokeWidth={1.4} strokeLinecap="round" d="M28,50 L27,60 M33,50 L34,60" />,
        <ellipse key="body" className="avatar-body" cx={28} cy={40} rx={15} ry={12} fill={plan.skin} {...line} />,
        <ellipse key="breast" className="avatar-breast" cx={35} cy={43} rx={9} ry={9} fill={plan.accent} {...line} />,
        <ellipse key="wing" className="avatar-wing" cx={24} cy={38} rx={9} ry={5.5} transform="rotate(-15 24 38)" fill={plan.wing} {...line} />,
        <circle key="head" className="avatar-head" cx={38} cy={24} r={9.5} fill={plan.head} {...line} />,
        <path key="beak" className="avatar-beak" fill={plan.beak} {...line} d="M46.5,22 L53,24.5 L46.5,27 Z" />,
        <circle key="eye" className="avatar-eye" cx={41} cy={22.5} r={1.5} fill={plan.eyes} />,
      ];
    case "snake":
      return [
        <ellipse key="coil1" className="avatar-coil" cx={32} cy={56} rx={24} ry={7} fill={plan.skin} {...line} />,
        <ellipse key="coil2" className="avatar-coil" cx={32} cy={50} rx={19} ry={6} fill={plan.accent} {...line} />,
        <ellipse key="coil3" className="avatar-coil" cx={32} cy={45} rx={14} ry={5} fill={plan.skin} {...line} />,
        <path key="neck-edge" fill="none" stroke={ink} strokeWidth={8.6} strokeLinecap="round" d="M30,45 C24,36 40,32 34,22" />,
        <path key="neck" className="avatar-neck" fill="none" stroke={plan.skin} strokeWidth={7} strokeLinecap="round" d="M30,45 C24,36 40,32 34,22" />,
        <ellipse key="head" className="avatar-head" cx={36} cy={18} rx={8} ry={5.5} transform="rotate(-10 36 18)" fill={plan.head} {...line} />,
        <circle key="eye-r" className="avatar-eye" cx={39} cy={16} r={1.4} fill={plan.eyes} />,
        <circle key="eye-l" className="avatar-eye" cx={33.5} cy={15.8} r={1.2} fill={plan.eyes} />,
        <path key="pupils" fill="none" stroke={INK_DARK} strokeWidth={0.5} d="M39,15 L39,17 M33.5,14.9 L33.5,16.7" />,
        <path key="tongue" className="avatar-tongue" fill="none" stroke={plan.beak} strokeWidth={0.9} strokeLinecap="round" d="M43.5,19 L48,20 L50,18.5 M48,20 L50,21.5" />,
      ];
    case "quadruped":
      return plan.quad ? quadrupedPortrait(plan, plan.quad, ink) : [];
    case "fish":
      return fishPortrait(plan, plan.swim ?? { girth: 0.25 }, ink);
    case "arthropod":
      return arthropodPortrait(plan, plan.bug ?? { legs: 6, segments: 3 }, ink);
    case "tentacled":
      return tentacledPortrait(plan, plan.arms ?? { count: 8 }, ink);
    case "mollusc":
      return molluscPortrait(plan, plan.shell ?? "none", ink);
  }
}

/**
 * A side view facing right, drawn in the shape's own units (x forward, z up) and fitted so the whole animal spans
 * at most x 6 to 58, standing no lower than y 60: `at(x, z)` gives the portrait point, `len(d)` a length.
 */
function sideView(back: number, front: number, top: number) {
  const s = Math.min(52 / (back + front), 50 / top);
  const ox = 32 - ((front - back) * s) / 2;
  // A tall animal stands on y 60; a long low one (a crocodile, a fish) is raised toward the middle of the disc.
  const floor = Math.min(60, 38 + (top * s) / 2);
  const at = (x: number, z: number) => `${n(ox + x * s)},${n(floor - z * s)}`;
  const X = (x: number) => n(ox + x * s);
  const Y = (z: number) => n(floor - z * s);
  return { s, at, X, Y, len: (d: number) => n(d * s) };
}

/** The four-legged figure from the side, as bodyPlanMesh builds it: legs, body and belly, neck, head and its parts. */
function quadrupedPortrait(plan: AnimalPlan, q: QuadShape, ink: string): React.ReactNode[] {
  const line = { stroke: ink, strokeWidth: 1 };
  const g = q.girth;
  const belly = q.sprawl ? g * 0.35 : Math.max(q.leg * 2, q.height - g);
  const midZ = belly + g / 2;
  const rise = q.neck > 0.12 ? 0.9 : 0.25;
  const sx = 0.4;
  const sz = midZ + g * 0.2;
  const nx = sx + Math.cos(rise) * q.neck;
  const nz = sz + Math.sin(rise) * q.neck;
  const hr = q.head / 2;
  const hx = nx + hr * 0.7;
  const hz = nz + hr * 0.2;
  const parts = q.parts ?? [];
  const tailBack = q.tail > 0 ? 0.48 + q.tail * 0.85 : 0.5;
  const top = Math.max(midZ + g / 2, hz + hr * (parts.includes("antlers") ? 2.6 : q.ears === "long" ? 2.4 : 1.4), parts.includes("wings") ? midZ + 0.5 : 0);
  const v = sideView(tailBack, hx + hr * 1.3, top);
  const out: React.ReactNode[] = [];
  const far = overlayHex(plan.skin, INK_DARK, 0.25);
  if (parts.includes("wings")) out.push(<path key="wing-far" className="avatar-wing" fill={overlayHex(plan.wing, INK_DARK, 0.2)} {...line} d={`M${v.at(0.1, midZ + g * 0.3)} L${v.at(-0.25, midZ + 0.55)} L${v.at(-0.15, midZ + 0.2)} Z`} />);
  if (q.tail > 0) {
    const tipZ = Math.max(q.sprawl ? g * 0.12 : g * 0.08, midZ + g * 0.15 - q.tail * 0.45);
    const w = v.len(q.sprawl ? g * 0.4 : plan.covering === "fur" ? g * 0.2 : g * 0.1);
    out.push(<path key="tail-edge" fill="none" stroke={ink} strokeWidth={Math.max(1.6, w + 1.4)} strokeLinecap="round" d={`M${v.at(-0.45, midZ + g * 0.15)} L${v.at(-0.48 - q.tail * 0.85, tipZ)}`} />);
    out.push(<path key="tail" className="avatar-tail" fill="none" stroke={plan.skin} strokeWidth={Math.max(0.6, w)} strokeLinecap="round" d={`M${v.at(-0.45, midZ + g * 0.15)} L${v.at(-0.48 - q.tail * 0.85, tipZ)}`} />);
  }
  // Legs: the far pair a shade darker behind the body, the near pair in front of it.
  const legW = Math.max(1.2, v.len(q.leg * 2));
  for (const [k, x, near] of [["fb", -0.28, false], ["ff", 0.36, false], ["nb", -0.32, true], ["nf", 0.32, true]] as const) {
    const fill = near ? plan.skin : far;
    const legs = <rect key={`leg-${k}`} className="avatar-leg" x={n(Number(v.X(x)) - legW / 2)} y={v.Y(midZ)} width={n(legW)} height={n(Number(v.Y(0)) - Number(v.Y(midZ)))} fill={fill} {...line} />;
    const hoof = <rect key={`foot-${k}`} className="avatar-foot" x={n(Number(v.X(x)) - legW * 0.6)} y={n(Number(v.Y(0)) - legW * 0.5)} width={n(legW * 1.2)} height={n(legW * 0.5)} fill={plan.feet} />;
    if (!near) out.push(legs, hoof);
    else out.push(<g key={`near-${k}`}>{legs}{hoof}</g>);
  }
  // The near legs go over the body; hold them back until it is drawn.
  const nearLegs = out.splice(out.length - 2, 2);
  out.push(<ellipse key="body" className="avatar-body" cx={v.X(0)} cy={v.Y(midZ)} rx={v.len(0.5)} ry={v.len(g / 2)} fill={plan.skin} {...line} />);
  out.push(<ellipse key="belly" className="avatar-belly" cx={v.X(0.04)} cy={v.Y(midZ - g * 0.22)} rx={v.len(0.34)} ry={v.len(g * 0.2)} fill={plan.accent} />);
  if (parts.includes("shell")) out.push(<path key="shell" className="avatar-shell" fill={plan.accent} {...line} d={`M${v.at(-0.56, midZ - g * 0.1)} C${v.at(-0.5, midZ + g * 1.0)} ${v.at(0.5, midZ + g * 1.0)} ${v.at(0.56, midZ - g * 0.1)} Z`} />);
  out.push(...nearLegs);
  if (q.neck > 0.03) {
    const w = v.len(Math.max(q.leg * 2.2, g * 0.4));
    out.push(<path key="neck-edge" fill="none" stroke={ink} strokeWidth={w + 1.4} strokeLinecap="round" d={`M${v.at(sx, sz)} L${v.at(nx, nz)}`} />);
    out.push(<path key="neck" className="avatar-neck" fill="none" stroke={plan.skin} strokeWidth={w} strokeLinecap="round" d={`M${v.at(sx, sz)} L${v.at(nx, nz)}`} />);
  }
  if (parts.includes("wings")) out.push(<path key="wing" className="avatar-wing" fill={plan.wing} {...line} d={`M${v.at(0.2, midZ + g * 0.35)} L${v.at(-0.1, midZ + 0.5)} L${v.at(0.05, midZ + 0.2)} L${v.at(-0.2, midZ + 0.15)} Z`} />);
  const earAt = (dx: number, dz: number) => v.at(hx - hr * dx, hz + hr * dz);
  switch (q.ears) {
    case "pointed":
      out.push(<path key="ear" className="avatar-ear" fill={plan.head} {...line} d={`M${earAt(0.45, 0.4)} L${earAt(0.3, 1.25)} L${earAt(0.05, 0.55)} Z`} />);
      break;
    case "round":
      out.push(<circle key="ear" className="avatar-ear" cx={v.X(hx - hr * 0.3)} cy={v.Y(hz + hr * 0.75)} r={v.len(hr * 0.3)} fill={plan.head} {...line} />);
      break;
    case "long":
      out.push(<ellipse key="ear" className="avatar-ear" cx={v.X(hx - hr * 0.45)} cy={v.Y(hz + hr * 1.5)} rx={v.len(hr * 0.22)} ry={v.len(hr * 0.9)} transform={`rotate(-15 ${v.X(hx - hr * 0.45)} ${v.Y(hz + hr * 1.5)})`} fill={plan.head} {...line} />);
      break;
    case "floppy":
      out.push(<ellipse key="ear" className="avatar-ear" cx={v.X(hx - hr * 0.35)} cy={v.Y(hz)} rx={v.len(hr * 0.25)} ry={v.len(hr * 0.55)} fill={overlayHex(plan.head, INK_DARK, 0.2)} {...line} />);
      break;
    default:
      break;
  }
  out.push(<ellipse key="head" className="avatar-head" cx={v.X(hx)} cy={v.Y(hz)} rx={v.len(hr)} ry={v.len(hr * 0.75)} fill={plan.head} {...line} />);
  if (q.ears === "fan") out.push(<ellipse key="ear" className="avatar-ear" cx={v.X(hx - hr * 0.5)} cy={v.Y(hz - hr * 0.1)} rx={v.len(hr * 0.6)} ry={v.len(hr * 0.85)} fill={overlayHex(plan.head, INK_DARK, 0.12)} {...line} />);
  out.push(<ellipse key="muzzle" className="avatar-muzzle" cx={v.X(hx + hr * 0.75)} cy={v.Y(hz - hr * 0.25)} rx={v.len(hr * 0.42)} ry={v.len(hr * 0.35)} fill={plan.accent} {...line} />);
  out.push(<circle key="nose" className="avatar-nose" cx={v.X(hx + hr * 1.12)} cy={v.Y(hz - hr * 0.15)} r={Math.max(0.8, v.len(hr * 0.12))} fill={plan.beak} />);
  out.push(<circle key="eye" className="avatar-eye" cx={v.X(hx + hr * 0.35)} cy={v.Y(hz + hr * 0.25)} r={Math.max(1, v.len(hr * 0.13))} fill={plan.eyes} />);
  if (parts.includes("trunk")) {
    const w = v.len(hr * 0.4);
    const d = `M${v.at(hx + hr * 0.8, hz - hr * 0.2)} Q${v.at(hx + hr * 1.5, hz - hr * 1.2)} ${v.at(hx + hr * 1.1, Math.max(q.leg, 0.06))}`;
    out.push(<path key="trunk-edge" fill="none" stroke={ink} strokeWidth={w + 1.4} strokeLinecap="round" d={d} />, <path key="trunk" className="avatar-trunk" fill="none" stroke={plan.head} strokeWidth={w} strokeLinecap="round" d={d} />);
  }
  if (parts.includes("tusks")) out.push(<path key="tusk" className="avatar-tusk" fill={IVORY} {...line} d={`M${v.at(hx + hr * 0.6, hz - hr * 0.55)} Q${v.at(hx + hr * 1.6, hz - hr * 1.0)} ${v.at(hx + hr * 1.7, hz - hr * 0.4)} L${v.at(hx + hr * 0.75, hz - hr * 0.4)} Z`} />);
  if (parts.includes("horns")) out.push(<path key="horn" className="avatar-horn" fill={HORN_TONE} {...line} d={`M${earAt(0.1, 0.6)} Q${earAt(-0.2, 1.4)} ${earAt(-0.5, 1.3)} L${earAt(-0.15, 0.6)} Z`} />);
  if (parts.includes("antlers")) out.push(<path key="antler" className="avatar-antler" fill="none" stroke={HORN_TONE} strokeWidth={1.6} strokeLinecap="round" d={`M${earAt(0.1, 0.6)} L${earAt(0.5, 2.4)} M${earAt(0.3, 1.5)} L${earAt(-0.2, 2.0)} M${earAt(0.45, 2.1)} L${earAt(0.0, 2.5)}`} />);
  return out;
}

/** A fish or whale from the side: body and pale belly, head, eye, fins, and an upright tail fin or a whale's flukes. */
function fishPortrait(plan: AnimalPlan, s: { girth: number; fluke?: true }, ink: string): React.ReactNode[] {
  const line = { stroke: ink, strokeWidth: 1 };
  const g = s.girth;
  const v = sideView(0.75, 0.55, Math.max(g * 1.35, 0.42));
  const lift = Math.max(0, (0.42 - g * 1.35) / 2);
  const z = (k: number) => lift + g * k;
  const tail = s.fluke
    ? `M${v.at(-0.42, z(0.5))} L${v.at(-0.72, z(0.72))} Q${v.at(-0.62, z(0.5))} ${v.at(-0.72, z(0.28))} Z`
    : `M${v.at(-0.42, z(0.5))} L${v.at(-0.72, z(1.05))} L${v.at(-0.62, z(0.5))} L${v.at(-0.72, z(-0.05))} Z`;
  const out: React.ReactNode[] = [
    <path key="tail" className="avatar-tail" fill={plan.skin} {...line} d={tail} />,
    <path key="fin-top" className="avatar-fin" fill={plan.skin} {...line} d={`M${v.at(0.08, z(0.95))} L${v.at(-0.12, z(1.3))} L${v.at(-0.2, z(0.92))} Z`} />,
    <ellipse key="body" className="avatar-body" cx={v.X(0)} cy={v.Y(z(0.5))} rx={v.len(0.5)} ry={v.len(g / 2)} fill={plan.skin} {...line} />,
    <ellipse key="belly" className="avatar-belly" cx={v.X(0.04)} cy={v.Y(z(0.3))} rx={v.len(0.4)} ry={v.len(g * 0.18)} fill={plan.accent} />,
    <ellipse key="head" className="avatar-head" cx={v.X(0.36)} cy={v.Y(z(0.52))} rx={v.len(0.16)} ry={v.len(g * 0.4)} fill={plan.head} />,
    <ellipse key="fin" className="avatar-fin" cx={v.X(0.12)} cy={v.Y(z(0.28))} rx={v.len(0.12)} ry={v.len(g * 0.12)} transform={`rotate(20 ${v.X(0.12)} ${v.Y(z(0.28))})`} fill={overlayHex(plan.skin, INK_DARK, 0.15)} {...line} />,
    <circle key="eye" className="avatar-eye" cx={v.X(0.38)} cy={v.Y(z(0.6))} r={Math.max(1, v.len(g * 0.07))} fill={plan.eyes} />,
    <path key="mouth" className="avatar-mouth" fill="none" stroke={ink} strokeWidth={0.8} strokeLinecap="round" d={`M${v.at(0.5, z(0.42))} L${v.at(0.36, z(0.4))}`} />,
  ];
  if (s.fluke) out.push(<circle key="blowhole" className="avatar-blowhole" cx={v.X(0.22)} cy={v.Y(z(0.99))} r={0.9} fill={INK_DARK} />);
  return out;
}

/** An insect, spider or crab from the side: its body parts in a row, legs bent down to the floor, claws, wings and feelers. */
function arthropodPortrait(plan: AnimalPlan, b: NonNullable<AnimalPlan["bug"]>, ink: string): React.ReactNode[] {
  const line = { stroke: ink, strokeWidth: 1 };
  const v = sideView(0.46, b.claws ? 0.68 : 0.5, b.wings ? 0.6 : 0.5);
  const h = ARTHROPOD_BODY_Z;
  const out: React.ReactNode[] = [];
  const headX = b.segments === 3 ? 0.36 : 0.32;
  for (let i = 0; i < b.legs / 2; i++) {
    const x = 0.2 - (i * 0.3) / (b.legs / 2);
    const spread = (i - (b.legs / 2 - 1) / 2) * 0.12;
    out.push(<path key={`leg${i}`} className="avatar-leg" fill="none" stroke={plan.feet === plan.skin ? ink : plan.feet} strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" d={`M${v.at(x, h)} L${v.at(x - spread * 0.6, h + 0.14)} L${v.at(x - spread * 1.4, 0.01)}`} />);
  }
  if (b.wings) out.push(<ellipse key="wing" className="avatar-wing" cx={v.X(-0.08)} cy={v.Y(h + 0.17)} rx={v.len(0.22)} ry={v.len(0.08)} transform={`rotate(-12 ${v.X(-0.08)} ${v.Y(h + 0.17)})`} fill="#e6eef2" fillOpacity={0.8} {...line} />);
  if (b.segments === 3) {
    out.push(<ellipse key="abdomen" className="avatar-body" cx={v.X(-0.22)} cy={v.Y(h)} rx={v.len(0.24)} ry={v.len(0.15)} fill={plan.skin} {...line} />);
    for (const x of [-0.15, -0.3]) out.push(<path key={`band${x}`} className="avatar-band" fill="none" stroke={plan.accent} strokeWidth={Math.max(1, v.len(0.04))} d={`M${v.at(x, h + 0.14)} L${v.at(x, h - 0.14)}`} />);
    out.push(<ellipse key="thorax" className="avatar-body" cx={v.X(0.12)} cy={v.Y(h)} rx={v.len(0.12)} ry={v.len(0.09)} fill={plan.skin} {...line} />);
  } else {
    out.push(<ellipse key="abdomen" className="avatar-body" cx={v.X(-0.2)} cy={v.Y(h)} rx={v.len(0.24)} ry={v.len(0.19)} fill={plan.accent} {...line} />);
    out.push(<ellipse key="body" className="avatar-body" cx={v.X(0.12)} cy={v.Y(h)} rx={v.len(0.19)} ry={v.len(0.12)} fill={plan.skin} {...line} />);
  }
  out.push(<circle key="head" className="avatar-head" cx={v.X(headX)} cy={v.Y(h)} r={v.len(0.08)} fill={plan.head} {...line} />);
  out.push(<circle key="eye" className="avatar-eye" cx={v.X(headX + 0.04)} cy={v.Y(h + 0.03)} r={Math.max(0.9, v.len(0.03))} fill={plan.eyes} />);
  if (b.claws) out.push(<path key="claw" className="avatar-claw" fill={plan.skin} {...line} d={`M${v.at(0.28, h)} L${v.at(0.48, h + 0.04)} L${v.at(0.66, h + 0.08)} L${v.at(0.6, h)} L${v.at(0.66, h - 0.04)} L${v.at(0.48, h - 0.03)} Z`} />);
  if (b.antennae) out.push(<path key="antenna" className="avatar-antenna" fill="none" stroke={INK_DARK} strokeWidth={0.8} strokeLinecap="round" d={`M${v.at(headX + 0.04, h + 0.06)} Q${v.at(headX + 0.2, h + 0.3)} ${v.at(headX + 0.14, h + 0.36)}`} />);
  return out;
}

/** A jellyfish (a bell over hanging tentacles) or an octopus (mantle, head and eye, arms curling over the floor). */
function tentacledPortrait(plan: AnimalPlan, a: { count: number; mantle?: true }, ink: string): React.ReactNode[] {
  const line = { stroke: ink, strokeWidth: 1 };
  const out: React.ReactNode[] = [];
  if (!a.mantle) {
    for (let i = 0; i < Math.min(a.count, 7); i++) {
      const x = 18 + i * 4.7;
      out.push(<path key={`t${i}`} className="avatar-tentacle" fill="none" stroke={plan.accent} strokeWidth={1.2} strokeLinecap="round" d={`M${n(x)},30 Q${n(x - 3)},40 ${n(x)},48 T${n(x)},60`} />);
    }
    out.push(<path key="bell" className="avatar-body" fill={plan.skin} {...line} d="M12,31 C12,8 52,8 52,31 Q32,35 12,31 Z" />);
    out.push(<ellipse key="inner" className="avatar-belly" cx={32} cy={24} rx={11} ry={5} fill={plan.accent} />);
    return out;
  }
  for (let i = 0; i < 4; i++) {
    const x = 18 + i * 9;
    out.push(<path key={`a${i}`} className="avatar-tentacle" fill="none" stroke={plan.skin} strokeWidth={3} strokeLinecap="round" d={`M${n(x + 4)},46 Q${n(x - 4)},56 ${n(x + 2)},60 T${n(x + 8)},57`} />);
  }
  out.push(<ellipse key="mantle" className="avatar-body" cx={26} cy={26} rx={13} ry={16} transform="rotate(-25 26 26)" fill={plan.skin} {...line} />);
  out.push(<circle key="head" className="avatar-head" cx={36} cy={44} r={9} fill={plan.head} {...line} />);
  out.push(<circle key="eye" className="avatar-eye" cx={40} cy={42} r={1.8} fill={plan.eyes} />);
  return out;
}

/** A slug or snail from the side, on its foot with eye stalks raised, a snail's coiled shell on its back; or a shut clam. */
function molluscPortrait(plan: AnimalPlan, shell: "coil" | "valves" | "none", ink: string): React.ReactNode[] {
  const line = { stroke: ink, strokeWidth: 1 };
  if (shell === "valves") {
    return [
      <path key="lower" className="avatar-shell" fill={plan.skin} {...line} d="M8,44 C10,60 54,60 56,44 Z" />,
      <path key="upper" className="avatar-shell" fill={plan.accent} {...line} d="M8,44 C10,24 54,24 56,44 Z" />,
      <path key="ridges" fill="none" stroke={overlayHex(plan.accent, INK_DARK, 0.3)} strokeWidth={0.8} d="M32,44 L32,29 M32,44 L22,31 M32,44 L42,31 M32,44 L14,37 M32,44 L50,37" />,
    ];
  }
  const out: React.ReactNode[] = [
    <path key="stalks" className="avatar-stalk" fill="none" stroke={plan.head} strokeWidth={1.4} strokeLinecap="round" d="M50,50 L54,36 M47,50 L48,37" />,
    <circle key="eye-r" className="avatar-eye" cx={54} cy={35.5} r={1.4} fill={INK_DARK} />,
    <circle key="eye-l" className="avatar-eye" cx={48} cy={36.5} r={1.2} fill={INK_DARK} />,
    <path key="body" className="avatar-body" fill={plan.skin} {...line} d="M4,58 C10,52 30,50 44,48 C52,46 56,52 54,56 C52,59 30,60 4,58 Z" />,
    <path key="foot" className="avatar-belly" fill="none" stroke={plan.accent} strokeWidth={1.6} d="M8,57.5 C24,58.5 40,58.5 52,56" />,
  ];
  if (shell === "coil") {
    out.push(<circle key="shell" className="avatar-shell" cx={26} cy={40} r={13} fill={plan.accent} {...line} />);
    out.push(<path key="whorl" fill="none" stroke={overlayHex(plan.accent, INK_DARK, 0.35)} strokeWidth={1} d="M26,40 m-3,0 a3,3 0 1,1 6,0 a6,6 0 1,1 -12,0 a9,9 0 1,1 18,0" />);
  }
  return out;
}
