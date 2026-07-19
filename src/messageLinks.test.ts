import { afterEach, describe, expect, it, vi } from "vitest";

import { extractLinks, openLink } from "./messageLinks";

describe("extractLinks", () => {
  it("returns an empty array when there are no links", () => {
    expect(extractLinks("just a plain chat line")).toEqual([]);
  });

  it("harvests a full http(s) URL keeping its visible text as the label", () => {
    expect(extractLinks("see http://example.com/foo here")).toEqual([
      { label: "http://example.com/foo", href: "http://example.com/foo" },
    ]);
  });

  it("normalizes a bare www. host to an https href while preserving the label", () => {
    expect(extractLinks("visit www.example.com now")).toEqual([
      { label: "www.example.com", href: "https://www.example.com" },
    ]);
  });

  it("turns an email address into a mailto link", () => {
    expect(extractLinks("ping foo.bar@example.com please")).toEqual([
      { label: "foo.bar@example.com", href: "mailto:foo.bar@example.com" },
    ]);
  });

  it("drops links whose scheme is not on the allowlist", () => {
    expect(extractLinks("grab ftp://files.example.com now")).toEqual([]);
  });

  it("collapses duplicate hrefs, keeping first-seen order", () => {
    expect(extractLinks("http://a.com/x and again http://a.com/x")).toEqual([
      { label: "http://a.com/x", href: "http://a.com/x" },
    ]);
  });

  it("returns multiple distinct links in order", () => {
    expect(extractLinks("http://a.com then http://b.com")).toEqual([
      { label: "http://a.com", href: "http://a.com" },
      { label: "http://b.com", href: "http://b.com" },
    ]);
  });
});

describe("openLink", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("opens the href in a new tab with noopener/noreferrer", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    openLink({ label: "example", href: "https://example.com" });

    expect(openSpy).toHaveBeenCalledWith(
      "https://example.com",
      "_blank",
      "noopener,noreferrer"
    );
  });
});
