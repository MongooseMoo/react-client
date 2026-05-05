import { describe, expect, it } from "vitest";

import { formatAnnouncementMessage } from "./useChannelHistory";

describe("formatAnnouncementMessage", () => {
  it("always prefixes talker when talker metadata is present", () => {
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

  it("keeps the original message text intact while still announcing the talker separately", () => {
    expect(
      formatAnnouncementMessage({
        id: 2,
        message: 'Q says to you, "Sup broski."',
        timestamp: 0,
        channel: "say_to_you",
        talker: "Q",
      })
    ).toBe('Q. Q says to you, "Sup broski."');
  });

  it("does the same for page messages without rewriting the message body", () => {
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
