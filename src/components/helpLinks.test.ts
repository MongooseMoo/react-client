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

  it("does not link help used as a word in a sentence", () => {
    expect(splitHelpLine('Sorry, there is no help on "zzqq".', [])).toEqual([{ text: 'Sorry, there is no help on "zzqq".' }]);
    expect(splitHelpLine("Ask for help in the lobby.", [])).toEqual([{ text: "Ask for help in the lobby." }]);
  });

  it("does not link a usage pattern with a placeholder", () => {
    expect(splitHelpLine("More help: help index, or help search <words>", [])).toEqual([
      { text: "More help: " },
      { text: "help index", topic: "index" },
      { text: ", or help search <words>" },
    ]);
  });

  it("links help after a lead-in word", () => {
    expect(splitHelpLine("Type help moving to learn more.", [])).toEqual([
      { text: "Type " },
      { text: "help moving", topic: "moving" },
      { text: " to learn more." },
    ]);
  });

  it("does not link help with nothing after it", () => {
    expect(splitHelpLine("Type help.", [])).toEqual([{ text: "Type help." }]);
  });
});
