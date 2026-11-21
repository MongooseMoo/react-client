import type React from "react";
import DOMPurify from "dompurify";
import BlockquoteWithCopy from "./BlockquoteWithCopy";

// Server HTML may only carry the data attributes the client reads for
// harmless behavior. data-exit in particular must never survive: a click on
// a.exit[data-exit] sends its value to the server as a command.
const SANITIZE_CONFIG = {
  ALLOW_DATA_ATTR: false,
  ADD_ATTR: ["data-text", "data-content-type"],
};

// A name in room text the server has bound to what it names:
// <a class="thing" data-thing="#29612">portable radio</a>, or several ids for a
// grouped phrase ("#29612 #29613"). data-thing is kept only on a.thing and only
// when its whole value is that list of object ids, so it can never carry
// anything but ids. Activating one selects the thing; it sends no command.
const THING_IDS = /^#\d+(?: #\d+)*$/;

function keepBoundName(node: Node, data: { attrName: string; forceKeepAttr?: boolean }) {
  if (data.attrName !== "data-thing" || !(node instanceof Element)) return;
  // The attribute as written: the value the hook is handed has been trimmed.
  const value = node.getAttribute("data-thing") ?? "";
  if (node.nodeName === "A" && node.classList.contains("thing") && THING_IDS.test(value)) data.forceKeepAttr = true;
}

// The server sends a bound name with no href, which is not a link to a screen
// reader or a Tab stop. href="#" makes it one, as the exit link has; whatever
// destination the markup carried is replaced, since activating selects.
function linkBoundName(node: Node) {
  if (!(node instanceof Element) || !node.hasAttribute("data-thing")) return;
  node.setAttribute("href", "#");
  node.removeAttribute("target");
}

export function sanitizeServerHtml(html: string): string {
  // Hooks belong to the one shared DOMPurify; they are on only for server HTML.
  DOMPurify.addHook("uponSanitizeAttribute", keepBoundName);
  DOMPurify.addHook("afterSanitizeAttributes", linkBoundName);
  try {
    return DOMPurify.sanitize(html, SANITIZE_CONFIG) as string;
  } finally {
    DOMPurify.removeHook("uponSanitizeAttribute");
    DOMPurify.removeHook("afterSanitizeAttributes");
  }
}

// Serialize nodes through the DOM so text stays escaped. Never concatenate
// textContent into markup: it is decoded, so "&lt;img onerror&gt;" would
// turn back into a live tag after sanitizing.
function serializeNodes(doc: Document, nodes: Node[]): string {
  const container = doc.createElement("div");
  for (const node of nodes) container.appendChild(node.cloneNode(true));
  return sanitizeServerHtml(container.innerHTML);
}

function HtmlBlock({ html }: { html: string }) {
  return <div style={{ whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function renderServerHtml(html: string): React.ReactElement[] {
  const clean = sanitizeServerHtml(html);
  const doc = new DOMParser().parseFromString(clean, "text/html");
  if (doc.querySelector("blockquote") === null) {
    return [<HtmlBlock key="content" html={clean} />];
  }

  // Split the message around top-level blockquotes so each gets a copy button.
  const elements: React.ReactElement[] = [];
  let pending: Node[] = [];
  const flush = (key: string) => {
    const markup = serializeNodes(doc, pending);
    if (markup.trim()) elements.push(<HtmlBlock key={key} html={markup} />);
    pending = [];
  };

  Array.from(doc.body.childNodes).forEach((node, index) => {
    if (node.nodeName !== "BLOCKQUOTE") {
      pending.push(node);
      return;
    }
    flush(`content-${index}`);
    const blockquote = node as HTMLElement;
    elements.push(
      <BlockquoteWithCopy
        key={`blockquote-${index}`}
        contentType={blockquote.getAttribute("data-content-type") || undefined}
      >
        {sanitizeServerHtml(blockquote.innerHTML)}
      </BlockquoteWithCopy>
    );
  });
  flush("remaining-content");

  return elements;
}
