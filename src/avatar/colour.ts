/**
 * Colour arithmetic for avatars: hex checking and WCAG 2.2 contrast
 * (SC 1.4.11 asks 3:1 between adjacent graphical regions). No three.js here.
 */

const HEX = /^#[0-9a-f]{6}$/i;

/** A `#rrggbb` string as given, lower-cased, or undefined when it is not one. */
export function hexOrUndefined(value: unknown): string | undefined {
  return typeof value === "string" && HEX.test(value) ? value.toLowerCase() : undefined;
}

/** The colour's `hex` when the value is a `{hex}` map with a valid one. */
export function colourHex(value: unknown): string | undefined {
  return value !== null && typeof value === "object" ? hexOrUndefined((value as { hex?: unknown }).hex) : undefined;
}

export function hexToRgb(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.slice(1), 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

/**
 * `over` laid on `under` at opacity `t`, in sRGB as a browser composites SVG `fill-opacity`:
 * what the portrait's stubble (45% over the skin) looks like, for the 3D figure to paint.
 */
export function overlayHex(under: string, over: string, t: number): string {
  const a = hexToRgb(under);
  const b = hexToRgb(over);
  return `#${a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, "0")).join("")}`;
}

export function hexToNumber(hex: string): number {
  return Number.parseInt(hex.slice(1), 16);
}

/** WCAG relative luminance of an sRGB `#rrggbb`. */
export function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio, 1 to 21. */
export function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** The ratio adjacent regions need, or an outline between them. */
export const MIN_CONTRAST = 3;

/** Outline colours: the one standing out more from both neighbours is used. */
export const INK_DARK = "#111118";
export const INK_LIGHT = "#f5f5f7";

export function inkFor(...neighbours: string[]): string {
  const worst = (ink: string) => Math.min(...neighbours.map((c) => contrast(ink, c)));
  return worst(INK_DARK) >= worst(INK_LIGHT) ? INK_DARK : INK_LIGHT;
}

/**
 * `base` as it is when it stands MIN_CONTRAST off `against`; otherwise `base` moved toward the ink that
 * stands out on `against`, by the fewest twentieths that reach it (the ink itself when none does).
 * A black brow or beard edge on dark skin becomes a grey of the same hair, not a white line.
 */
export function toneOff(base: string, against: string): string {
  if (contrast(base, against) >= MIN_CONTRAST) return base;
  const ink = inkFor(against);
  for (let i = 1; i < 20; i++) {
    const tone = overlayHex(base, ink, i / 20);
    if (contrast(tone, against) >= MIN_CONTRAST) return tone;
  }
  return ink;
}

/**
 * A sheen on hair: dark hair a step lighter, light hair a step darker. Drawn on curls and coils, on a bun and
 * on strands, so texture and form show on hair whose colour lighting alone barely changes (black, white).
 */
export function sheenFor(hair: string): string {
  return luminance(hair) < 0.25 ? overlayHex(hair, INK_LIGHT, 0.4) : overlayHex(hair, INK_DARK, 0.3);
}
