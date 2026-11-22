import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { TEST_CHARACTERS } from "../src/avatar/characters.fixture";
import { PORTRAIT_PIXELS, portraitPng } from "./render-portrait";

const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** Width, height and colour type of a PNG, from its signature and IHDR chunk. */
function header(png: Buffer) {
  expect(png.subarray(0, 8).equals(SIGNATURE)).toBe(true);
  expect(png.subarray(12, 16).toString("latin1")).toBe("IHDR");
  return { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
}

describe("portraitPng", () => {
  it("draws every fixture character as a 400 by 400 PNG", () => {
    for (const character of TEST_CHARACTERS) {
      const png = portraitPng(character.appearance);
      expect(header(png), character.name).toEqual({ width: PORTRAIT_PIXELS, height: PORTRAIT_PIXELS });
    }
  });

  it("draws different people differently", () => {
    const [first, second] = TEST_CHARACTERS;
    expect(portraitPng(first.appearance).equals(portraitPng(second.appearance))).toBe(false);
  });

  it("refuses an appearance with nothing to draw", () => {
    expect(() => portraitPng(null)).toThrow();
  });

  it("is the command that writes a PNG file from the JSON on stdin", () => {
    const dir = mkdtempSync(join(tmpdir(), "portrait-"));
    try {
      const out = join(dir, "p.png");
      execFileSync(process.execPath, [join(__dirname, "../node_modules/tsx/dist/cli.mjs"), join(__dirname, "render-portrait.ts"), out], {
        input: JSON.stringify(TEST_CHARACTERS[0].appearance),
      });
      expect(header(readFileSync(out))).toEqual({ width: 400, height: 400 });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
