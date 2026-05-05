import { describe, expect, it } from "vitest";

import { formatAnnouncementMessage } from "./useChannelHistory";

describe("formatAnnouncementMessage", () => {
  it("adds the talker for channel messages whose text does not identify the speaker", () => {
    expect(
      formatAnnouncementMessage({
        id: 1,
        message: "Changelog posted. Standing by.",
        timestamp: 0,
        channel: "say",
        talker: "claude",
      })
    ).toBe("claude. Changelog posted. Standing by.");
  });

  it("preserves the original text when it already names the talker", () => {
    expect(
      formatAnnouncementMessage({
        id: 2,
        message: 'Q says to you, "Sup broski."',
        timestamp: 0,
        channel: "say_to_you",
        talker: "Q",
      })
    ).toBe('Q says to you, "Sup broski."');
  });

  it("preserves the original page message text while still announcing the talker separately", () => {
    expect(
      formatAnnouncementMessage({
        id: 3,
        message: 'S/He pages, "gmcp-page-probe"',
        timestamp: 0,
        channel: "page",
        talker: "codex",
      })
    ).toBe('codex. S/He pages, "gmcp-page-probe"');
  });
});
