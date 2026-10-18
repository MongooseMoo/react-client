import { describe, expect, it } from "vitest";
import { stripMudAnsiTags } from "./stripMudAnsiTags";

const ESC = String.fromCharCode(27);

describe("stripMudAnsiTags", () => {
  it("strips the bracketed markup the MUD embeds in GMCP room names", () => {
    expect(
      stripMudAnsiTags("[red]O[bold][red]ute[red]r R[bold][red]i[red]m[normal]"),
    ).toBe("Outer Rim");
  });

  it("matches tags case-insensitively", () => {
    expect(stripMudAnsiTags("[RED]Vault[Normal]")).toBe("Vault");
  });

  it("strips real ANSI escapes as well", () => {
    expect(stripMudAnsiTags(`${ESC}[31mOuter Rim${ESC}[0m`)).toBe("Outer Rim");
  });

  it("trims padding left behind by the markup", () => {
    expect(stripMudAnsiTags("[red] Outer Rim [normal]")).toBe("Outer Rim");
  });

  it("returns an empty string when the value is nothing but markup", () => {
    expect(stripMudAnsiTags("[red][normal]")).toBe("");
  });

  it("leaves bracketed text that is not a known tag alone", () => {
    expect(stripMudAnsiTags("The Bank [closed] [red]vault")).toBe("The Bank [closed] vault");
  });
});
