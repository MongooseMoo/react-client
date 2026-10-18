import { describe, expect, it } from "vitest";

import { splitHelpLine } from "./helpLinks";

describe("splitHelpLine", () => {
  it("leaves a line without a help phrase as one piece of text", () => {
    expect(splitHelpLine("You carry credits, spent in shops.", [])).toEqual([
      { text: "You carry credits, spent in shops." },
    ]);
  });

  it("keeps leading spaces", () => {
    expect(splitHelpLine("        look <object>", [])).toEqual([{ text: "        look <object>" }]);
  });

  it("does not link the title Help on its own", () => {
    expect(splitHelpLine("Help", [])).toEqual([{ text: "Help" }]);
  });

  it("links a help phrase to its one-word topic", () => {
    expect(splitHelpLine("New here? help starting-out", [])).toEqual([
      { text: "New here? " },
      { text: "help starting-out", topic: "starting-out" },
    ]);
  });

  it("strips trailing punctuation and links each phrase in a line", () => {
    expect(splitHelpLine("Try help search x, or help index.", [])).toEqual([
      { text: "Try " },
      { text: "help search x", topic: "search x" },
      { text: ", or " },
      { text: "help index", topic: "index" },
      { text: "." },
    ]);
  });

  it("keeps colons inside a topic such as an object verb", () => {
    expect(splitHelpLine("See help $foo:bar.", [])).toEqual([
      { text: "See " },
      { text: "help $foo:bar", topic: "$foo:bar" },
      { text: "." },
    ]);
  });

  it("takes every word of a search up to a comma or the end", () => {
    expect(splitHelpLine("help search fire spell", [])).toEqual([
      { text: "help search fire spell", topic: "search fire spell" },
    ]);
  });

  it("links a whole choice even when it has spaces", () => {
    expect(splitHelpLine("help look at", ["look", "look at"])).toEqual([
      { text: "help look at", topic: "look at" },
    ]);
  });

  it("does not link words that only end in help", () => {
    expect(splitHelpLine("Ask a helper or phelp me.", [])).toEqual([{ text: "Ask a helper or phelp me." }]);
  });

  it("does not link help with nothing after it", () => {
    expect(splitHelpLine("Type help.", [])).toEqual([{ text: "Type help." }]);
  });
});
