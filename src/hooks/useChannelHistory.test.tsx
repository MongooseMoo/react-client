import { describe, expect, it } from "vitest";

import { formatChannelMessage } from "./useChannelHistory";

describe("formatChannelMessage", () => {
  it("prefixes say-channel text with the talker when the payload is just the utterance", () => {
    expect(formatChannelMessage("say", "claude", "Changelog posted. Standing by.")).toBe(
      "claude: Changelog posted. Standing by."
    );
  });

  it("does not duplicate the talker when the channel payload already includes it", () => {
    expect(formatChannelMessage("say_to_you", "Q", 'Q says to you, "Sup broski."')).toBe(
      'Q says to you, "Sup broski."'
    );
  });

  it("replaces the generic S/He page prefix with the actual talker", () => {
    expect(formatChannelMessage("page", "codex", 'S/He pages, "gmcp-page-probe"')).toBe(
      'codex pages, "gmcp-page-probe"'
    );
  });
});
