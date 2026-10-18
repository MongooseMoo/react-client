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

export function sanitizeServerHtml(html: string): string {
  return DOMPurify.sanitize(html, SANITIZE_CONFIG) as string;
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
