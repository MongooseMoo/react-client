# HTML output XSS fix (branch fix/html-output-xss), 2026-09-24

Source: glorp client XSS review. Findings 1, 2 and 4 all confirmed in code.

Done:
- New src/components/serverHtml.tsx: sanitizeServerHtml (ALLOW_DATA_ATTR false, keeps data-text + data-content-type)
  and renderServerHtml (serializes non-blockquote nodes via DOM innerHTML, never textContent; re-sanitizes final strings).
- output.tsx: handleHtml and recreateContentFromSource 'html' both call renderServerHtml. DOMPurify/BlockquoteWithCopy imports removed.
- ansiParser.tsx: three processRegex passes replaced by one sorted walk over all matches (overlaps dropped, URL > email > exit on ties).

Kept: server `<a class="command" data-text>` links (fill input only; a documented feature).

Status: committed 475f5b7. Typecheck clean, full suite 1141/1141 before adding tests; new tests pass,
ansiParser ordering tests confirmed failing on old parser. Not pushed, no PR.
Not done here: finding 3 (exit marker spoofing) needs MOO-side escaping or GMCP exits.
