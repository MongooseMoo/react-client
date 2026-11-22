/**
 * Draws a character's portrait as a PNG, for places that cannot show the web client's SVG
 * (a fediverse or Bluesky profile picture).
 *
 *   npx tsx scripts/render-portrait.ts <out.png> < appearance.json
 *
 * stdin is the appearance JSON Room.Layout sends for a person. The picture is the same
 * AvatarPortrait the client draws (the head alone for a person, the whole animal for an
 * animal form), 400 by 400 pixels, on the portrait's own backdrop grey so no pixel is transparent.
 */
import { Resvg } from "@resvg/resvg-js";
import { readFileSync, writeFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import AvatarPortrait, { PORTRAIT_BACKDROP } from "../src/avatar/portrait";

export const PORTRAIT_PIXELS = 400;

/** The portrait of APPEARANCE as a PNG of PORTRAIT_PIXELS square; throws when there is no appearance to draw. */
export function portraitPng(appearance: unknown): Buffer {
  const markup = renderToStaticMarkup(createElement(AvatarPortrait, { appearance, size: PORTRAIT_PIXELS, crop: true }));
  if (!markup) throw new Error("the appearance has nothing to draw");
  const svg = markup.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ');
  const png = new Resvg(svg, {
    fitTo: { mode: "width", value: PORTRAIT_PIXELS },
    background: PORTRAIT_BACKDROP,
  });
  return png.render().asPng();
}

if (process.argv[1]?.endsWith("render-portrait.ts")) {
  const out = process.argv[2];
  if (!out) throw new Error("usage: render-portrait.ts <out.png> < appearance.json");
  writeFileSync(out, portraitPng(JSON.parse(readFileSync(0, "utf-8"))));
}
