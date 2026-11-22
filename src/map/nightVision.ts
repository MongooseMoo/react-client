/**
 * How a dim room looks to a dark-adapted eye, after Jensen et al. 2000, "Night Rendering" (hub
 * `papers/Jensen_2000_NightRendering/notes.md`), as a post step on the scene's luminance (cd/m^2, before exposure):
 *
 * - Rod saturation s from each pixel's photopic luminance (p.6, `rodSaturation`).
 * - Blue shift: chromaticity moved toward (x_b, y_b) = (0.25, 0.25) by 1 - s, and luminance blended between the
 *   scotopic and photopic signals, Y' = r (1 - s) V + s Y (p.6), with V from `SCOTOPIC_FROM_LINEAR_SRGB` and r the
 *   white-field Y/V of that same V (`WHITE_Y_OVER_V`, 0.4423 from the CIE tables; the paper prints 0.4468), so a white
 *   field keeps its luminance.
 * - Loss of detail: a Gaussian blur whose width falls with local edge strength, sigma = sigma0 (g_strong - g) / g_strong
 *   (p.6), so textures soften while outlines stay. sigma0 makes a 4 cycles-per-degree grating, the finest visible
 *   under moonlight (p.7), barely visible: the client takes that as 1% contrast left (Gaussian MTF
 *   exp(-2 pi^2 sigma^2 / P^2) = 0.01), scaled by 1 - s so it fades out through the mesopic range. The paper gives
 *   neither number; GRADIENT_STRONG is likewise the client's choice, as the paper's was empirical.
 */
import * as THREE from "three";
import { MESOPIC_HIGH, MESOPIC_LOW } from "./lightUnits";
import { SCOTOPIC_FROM_LINEAR_SRGB, WHITE_Y_OVER_V } from "./lightTables";

/** Jensen et al.'s blue-shift chromaticity (p.6), a free parameter they chose from night paintings. */
export const BLUE_SHIFT_XY: readonly [number, number] = [0.25, 0.25];
/** The finest grating visible under moonlight, cycles per degree (p.7). */
export const MOONLIGHT_ACUITY_CPD = 4;
/** Contrast left in that grating after the blur: the client's reading of "barely invisible". */
export const RESIDUAL_CONTRAST = 0.01;
/** Smallest change in log10 luminance per pixel treated as an edge that is not blurred (the client's choice). */
export const GRADIENT_STRONG = 0.3;

/** three.js's linear sRGB to XYZ (`ColorManagement.js` LINEAR_REC709_TO_XYZ), the matrix the CIE tables were read with. */
const TO_XYZ = new THREE.Matrix3().set(0.4123908, 0.3575843, 0.1804808, 0.212639, 0.7151687, 0.0721923, 0.0193308, 0.1191948, 0.9505322);
/** A Matrix3 as GLSL mat3 arguments: both are column-major. */
const glslMat3 = (m: THREE.Matrix3) => m.elements.map((n) => n.toFixed(7)).join(", ");

/** sigma0 in screen pixels for a view of `fovDeg` degrees across `heightPx` pixels. */
export function blurSigmaPx(fovDeg: number, heightPx: number): number {
  const period = heightPx / fovDeg / MOONLIGHT_ACUITY_CPD;
  return period * Math.sqrt(Math.log(1 / RESIDUAL_CONTRAST) / (2 * Math.PI * Math.PI));
}

export const NightVisionShader = {
  name: "NightVisionShader",
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    texel: { value: new THREE.Vector2(1, 1) },
    sigma0: { value: 0 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform vec2 texel;
    uniform float sigma0;
    varying vec2 vUv;
    const vec3 LUM = vec3(0.212639, 0.7151687, 0.0721923);
    const vec3 SCOT = vec3(${SCOTOPIC_FROM_LINEAR_SRGB.map((c) => c.toFixed(5)).join(", ")});
    const mat3 TO_XYZ = mat3(${glslMat3(TO_XYZ)});
    const mat3 FROM_XYZ = mat3(${glslMat3(TO_XYZ.clone().invert())});

    vec3 at(vec2 uv) { return min(texture2D(tDiffuse, uv).rgb, vec3(65504.0)); }
    float logLum(vec2 uv) { return log(max(dot(at(uv), LUM), 1e-6)) / log(10.0); }
    float rodSaturation(float y) {
      float l = log(max(y, 1e-12)) / log(10.0);
      float t = clamp((l + 2.0) / 2.6, 0.0, 1.0);
      return t * t * (3.0 - 2.0 * t);
    }

    void main() {
      vec3 c = at(vUv);
      float s = rodSaturation(dot(c, LUM));
      // Loss of detail: blur width falls with edge strength (gradient of log10 luminance, central differences).
      float gx = (logLum(vUv + vec2(texel.x, 0.0)) - logLum(vUv - vec2(texel.x, 0.0))) * 0.5;
      float gy = (logLum(vUv + vec2(0.0, texel.y)) - logLum(vUv - vec2(0.0, texel.y))) * 0.5;
      float g = length(vec2(gx, gy));
      float sigma = sigma0 * (1.0 - s) * max(0.0, (${GRADIENT_STRONG.toFixed(3)} - g) / ${GRADIENT_STRONG.toFixed(3)});
      if (sigma > 0.3) {
        vec3 sum = c;
        float weight = 1.0;
        for (int ring = 1; ring <= 2; ring++) {
          float r = sigma * float(ring);
          float w = exp(-0.5 * float(ring * ring));
          for (int k = 0; k < 8; k++) {
            float a = 6.2831853 * (float(k) + 0.5 * float(ring - 1)) / 8.0;
            sum += at(vUv + vec2(cos(a), sin(a)) * r * texel) * w;
            weight += w;
          }
        }
        c = sum / weight;
      }
      // Blue shift and rod luminance (p.6).
      vec3 xyz = TO_XYZ * c;
      float total = xyz.x + xyz.y + xyz.z;
      if (total > 0.0 && s < 1.0) {
        vec2 xy = vec2(xyz.x, xyz.y) / total;
        vec2 shifted = mix(vec2(${BLUE_SHIFT_XY[0]}, ${BLUE_SHIFT_XY[1]}), xy, s);
        float y = ${WHITE_Y_OVER_V.toFixed(4)} * (1.0 - s) * dot(c, SCOT) + s * xyz.y;
        float x = shifted.x * y / shifted.y;
        float z = (1.0 - shifted.x - shifted.y) * y / shifted.y;
        c = max(FROM_XYZ * vec3(x, y, z), vec3(0.0));
      }
      gl_FragColor = vec4(c, 1.0);
    }`,
};

/** Jensen et al.'s mesopic bounds, for callers that report them. */
export const NIGHT_VISION_RANGE = { from: MESOPIC_LOW, to: MESOPIC_HIGH } as const;
