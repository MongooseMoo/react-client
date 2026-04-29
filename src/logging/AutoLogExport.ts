import DOMPurify from "dompurify";
import stripAnsi from "strip-ansi";
import { AutoLogEntry, AutoLogSession } from "./AutoLogTypes";

export type AutoLogDownloadFormat = "text" | "html";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function htmlToPlainText(html: string): string {
  const clean = DOMPurify.sanitize(html);
  const doc = new DOMParser().parseFromString(clean, "text/html");
  return doc.body.textContent || "";
}

export function autoLogEntryToPlainText(entry: AutoLogEntry): string {
  switch (entry.sourceType) {
    case "html":
      return htmlToPlainText(entry.sourceContent);
    case "ansi":
      return stripAnsi(entry.sourceContent);
    default:
      return entry.sourceContent;
  }
}

export function autoLogEntriesToText(entries: AutoLogEntry[]): string {
  return entries
    .map((entry) => {
      const timestamp = new Date(entry.timestamp).toISOString();
      return `[${timestamp}] ${autoLogEntryToPlainText(entry)}`;
    })
    .join("\n");
}

function entryToHtml(entry: AutoLogEntry): string {
  const timestamp = escapeHtml(new Date(entry.timestamp).toISOString());
  const className = `autolog-entry autolog-entry-${escapeHtml(entry.type)}`;

  if (entry.sourceType === "html") {
    return `<div class="${className}"><span class="autolog-timestamp">${timestamp}</span><div class="autolog-content">${DOMPurify.sanitize(entry.sourceContent)}</div></div>`;
  }

  const content = entry.sourceType === "ansi" ? stripAnsi(entry.sourceContent) : entry.sourceContent;
  return `<div class="${className}"><span class="autolog-timestamp">${timestamp}</span><pre class="autolog-content">${escapeHtml(content)}</pre></div>`;
}

export function autoLogEntriesToHtml(session: AutoLogSession, entries: AutoLogEntry[]): string {
  const title = escapeHtml(session.title || "Mongoose Client");
  const startedAt = escapeHtml(new Date(session.startedAt).toISOString());
  const endedAt = session.endedAt ? escapeHtml(new Date(session.endedAt).toISOString()) : "In progress";
  const url = escapeHtml(session.sanitizedUrl);

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${title} log ${startedAt}</title>
  <style>
    body { background: #0a0a0f; color: #e8e8ed; font-family: system-ui, sans-serif; margin: 0; padding: 24px; }
    main { max-width: 1100px; margin: 0 auto; }
    h1 { font-size: 20px; margin: 0 0 8px; }
    .autolog-meta { color: #a0a0b0; font-size: 13px; margin-bottom: 24px; }
    .autolog-entry { border-top: 1px solid rgba(255,255,255,0.08); padding: 8px 0; }
    .autolog-timestamp { color: #707080; display: block; font: 12px ui-monospace, SFMono-Regular, Consolas, monospace; margin-bottom: 4px; }
    .autolog-content { color: #f2f2f4; font: 14px ui-monospace, SFMono-Regular, Consolas, monospace; margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; }
    .autolog-entry-systemInfo .autolog-content { color: #a78bfa; }
    .autolog-entry-errorMessage .autolog-content { color: #f87171; }
    .autolog-entry-command .autolog-content { color: #a0a0b0; }
  </style>
</head>
<body>
  <main>
    <h1>${title}</h1>
    <div class="autolog-meta">Started: ${startedAt}<br />Ended: ${endedAt}<br />URL: ${url}</div>
    ${entries.map(entryToHtml).join("\n")}
  </main>
</body>
</html>`;
}

export function buildAutoLogFilename(session: AutoLogSession, format: AutoLogDownloadFormat): string {
  const startedAt = new Date(session.startedAt).toISOString().replace(/[:.]/g, "-");
  const title = (session.title || "mongoose-client").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
  return `${title || "mongoose-client"}-autolog-${startedAt}.${format === "html" ? "html" : "txt"}`;
}

export function downloadAutoLog(content: string, filename: string, format: AutoLogDownloadFormat): void {
  const blob = new Blob([content], { type: format === "html" ? "text/html" : "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
