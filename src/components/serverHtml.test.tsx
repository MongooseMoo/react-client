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

  it("keeps the order of content around blockquotes", () => {
    const container = renderHtml("<p>before</p>mid<blockquote><p>quoted</p></blockquote><p>after</p>");
    expect(container.textContent).toMatch(/before.*mid.*quoted.*after/s);
  });
});
