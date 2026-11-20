import type React from "react";
import type { AnimalPlan, HumanoidPlan } from "./bodyPlan";
import { INK_DARK, inkFor, overlayHex } from "./colour";
import type { FigureParams } from "./figure";
import { markElements, PORTRAIT_BACKDROP } from "./portrait";

/**
 * Portraits for body plans other than the human one (bodyPlan.ts), in the human portrait's 64-unit square with
 * the head inside its head crop (`HEAD_VIEWBOX`, x 12 to 52, y 5 to 45): a humanoid plan's head and shoulders, an
 * animal seen from the side facing right, and for an unknown plan a plain rounded silhouette. Colours come from
 * `figureParams`, so the portrait, the 3D figure and the plan token agree.
 */

const RING = "#f2f0ea";

export function planPortraitElements(p: FigureParams, record: Record<string, unknown>): React.ReactNode[] {
  const plan = p.plan;
  const parts: React.ReactNode[] = [<circle key="backdrop" className="avatar-backdrop" cx={32} cy={32} r={31} fill={PORTRAIT_BACKDROP} />];
  if (plan.kind === "humanoid") {
    parts.push(...humanoidPortrait(p, plan));
    parts.push(...markElements(record, false, p.colours.faceInk));
  } else if (plan.kind === "animal") {
    parts.push(...animalPortrait(p, plan));
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
        out.push(<ellipse key={`socket${x}`} className="avatar-socket" cx={x} cy={26} rx={3} ry={2.2} fill={overlayHex(skin, INK_DARK, 0.35)} />);
        out.push(<circle key={`eye${x}`} className="avatar-eye" cx={x} cy={26} r={1.3} fill={eyes} />);
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
    case "shark":
      out.push(shoulders("M6,64 C6,50 20,45 32,45 C44,45 58,50 58,64 Z"), neck(27, 10, 37));
      out.push(<path key="fin" className="avatar-fin" fill={skin} stroke={ink} strokeWidth={1} d="M29,15 L36,1.5 L41,15 Z" />);
      out.push(<ellipse key="head" className="avatar-head" cx={32} cy={26} rx={14} ry={12} fill={skin} stroke={ink} strokeWidth={1.2} />);
      out.push(<path key="underside" className="avatar-underside" fill={plan.accent} stroke={ink} strokeWidth={0.8} d="M18.4,28 C20,37.5 26,40 32,40 C38,40 44,37.5 45.6,28 C40,32.5 24,32.5 18.4,28 Z" />);
      out.push(<path key="mouth" className="avatar-mouth" fill="none" stroke={INK_DARK} strokeWidth={1.4} strokeLinecap="round" d="M23,32.5 Q32,37.5 41,32.5" />);
      out.push(<path key="gills" className="avatar-gill" fill="none" stroke={overlayHex(skin, INK_DARK, 0.55)} strokeWidth={0.8} d="M19.5,22 l-1,4 M21.5,22.5 l-1,4 M44.5,22 l1,4 M42.5,22.5 l1,4" />);
      out.push(<circle key="eye-l" className="avatar-eye" cx={22.5} cy={22} r={1.7} fill={eyes} />, <circle key="eye-r" className="avatar-eye" cx={41.5} cy={22} r={1.7} fill={eyes} />);
      out.push(<path key="nose" className="avatar-nose" fill="none" stroke={c.faceInk} strokeWidth={0.8} strokeLinecap="round" d="M28,20 l1.6,0.7 M36,20 l-1.6,0.7" />);
      break;
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
  }
}
