import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { renderServerHtml } from "./serverHtml";

const renderHtml = (html: string) => render(<div>{renderServerHtml(html)}</div>).container;

describe("renderServerHtml", () => {
  it("keeps escaped text escaped next to a blockquote", () => {
    const container = renderHtml(
      "&lt;img src=x onerror=alert(1)&gt;<blockquote><p>quoted</p></blockquote>&lt;script&gt;x&lt;/script&gt;"
    );
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("script")).toBeNull();
    expect(container.textContent).toContain("<img src=x onerror=alert(1)>");
    expect(container.textContent).toContain("<script>x</script>");
    expect(container.textContent).toContain("quoted");
  });

  it("keeps escaped text escaped inside a blockquote", () => {
    const container = renderHtml("<blockquote>&lt;img src=x onerror=alert(1)&gt;</blockquote>");
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("blockquote")?.textContent).toContain("<img src=x onerror=alert(1)>");
  });

  it("strips data-exit so server HTML cannot forge command links", () => {
    const container = renderHtml('<a class="exit" data-exit="@quit" href="#">north</a>');
    expect(container.querySelector("[data-exit]")).toBeNull();
  });

  it("strips data-exit next to a blockquote too", () => {
    const container = renderHtml(
      '<a class="exit" data-exit="@quit" href="#">north</a><blockquote><a class="exit" data-exit="@quit">x</a></blockquote>'
    );
    expect(container.querySelector("[data-exit]")).toBeNull();
  });

  it("keeps data-text command links and blockquote content types", () => {
    const container = renderHtml(
      '<a class="command" data-text="look sword">look</a><blockquote data-content-type="text/markdown"><p>q</p></blockquote>'
    );
    expect(container.querySelector("a.command")?.getAttribute("data-text")).toBe("look sword");
    expect(container.querySelector("blockquote")?.getAttribute("data-content-type")).toBe("text/markdown");
  });

  describe("bound names (a.thing[data-thing])", () => {
    it("keeps one id and a list of ids, and makes the name a link the keyboard reaches", () => {
      const container = renderHtml(
        'On the low table are <a class="thing" data-thing="#29612">portable radio</a> and ' +
        '<a class="thing" data-thing="#29612 #29613 #29614 #29615">four biscuits</a>.'
      );
      const [radio, biscuits] = Array.from(container.querySelectorAll<HTMLAnchorElement>("a.thing"));
      expect(radio.getAttribute("data-thing")).toBe("#29612");
      expect(biscuits.getAttribute("data-thing")).toBe("#29612 #29613 #29614 #29615");
      // A link with an href is a link to a screen reader and a Tab stop; its name is its text.
      expect(radio.getAttribute("href")).toBe("#");
      expect(radio.tabIndex).toBe(0);
      expect(radio.textContent).toBe("portable radio");
      expect(radio.getAttribute("aria-label")).toBeNull();
      expect(container.textContent).toBe("On the low table are portable radio and four biscuits.");
    });

    it("never lets a bound name carry a destination of the server's", () => {
      const container = renderHtml('<a class="thing" data-thing="#5" href="https://example.org/" target="_blank">radio</a>');
      expect(container.querySelector("a.thing")?.getAttribute("href")).toBe("#");
      expect(container.querySelector("a.thing")?.hasAttribute("target")).toBe(false);
    });

    it.each([
      ["no hash", "29612"],
      ["a name", "radio"],
      ["a negative id", "#-1"],
      ["a comma", "#1,#2"],
      ["two spaces", "#1  #2"],
      ["a leading space", " #1"],
      ["a trailing space", "#1 "],
      ["a newline", "#1\n#2"],
      ["a command", "#1; @quit"],
      ["empty", ""],
    ])("removes a malformed value: %s", (_name, value) => {
      const container = renderHtml(`<a class="thing" data-thing="${value}">radio</a>`);
      expect(container.querySelector("[data-thing]")).toBeNull();
      expect(container.querySelector("a")?.hasAttribute("href")).toBe(false);
      expect(container.textContent).toBe("radio");
    });

    it("removes data-thing from anything that is not a.thing", () => {
      const container = renderHtml(
        '<span class="thing" data-thing="#1">span</span><a data-thing="#2">no class</a>' +
        '<a class="command" data-thing="#3" data-text="look">other class</a><button class="thing" data-thing="#4">button</button>'
      );
      expect(container.querySelector("[data-thing]")).toBeNull();
      expect(container.querySelector("a.command")?.getAttribute("data-text")).toBe("look");
    });

    it("still strips data-exit from a bound name", () => {
      const container = renderHtml('<a class="thing exit" data-thing="#1" data-exit="@quit">radio</a>');
      expect(container.querySelector("[data-exit]")).toBeNull();
      expect(container.querySelector("a.thing")?.getAttribute("data-thing")).toBe("#1");
    });

    it("keeps a bound name beside and inside a blockquote", () => {
      const container = renderHtml(
        '<a class="thing" data-thing="#1">radio</a><blockquote><a class="thing" data-thing="#2 #3">biscuits</a></blockquote>' +
        '<a class="thing" data-thing="bad">plate</a>'
      );
      expect(Array.from(container.querySelectorAll("a.thing[data-thing]")).map((a) => [a.getAttribute("data-thing"), a.getAttribute("href")]))
        .toEqual([["#1", "#"], ["#2 #3", "#"]]);
    });
  });

  it("keeps the order of content around blockquotes", () => {
    const container = renderHtml("<p>before</p>mid<blockquote><p>quoted</p></blockquote><p>after</p>");
    expect(container.textContent).toMatch(/before.*mid.*quoted.*after/s);
  });
});
