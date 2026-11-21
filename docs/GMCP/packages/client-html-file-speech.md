# `Client.Html`, `Client.File`, and `Client.Speech`

These are Mongoose client-side convenience packages for rich output, browser
downloads, and text to speech.

## `Client.Html`

- Source: Mongoose
- Direction: server to client
- Implementation: `src/gmcp/Client/Html.ts`

### `Client.Html.Add_html`

```json
{
  "data": [
    "<p>Hello</p>"
  ]
}
```

Joins `data` with newlines and emits the resulting HTML through the client's
`html` event.

The transcript sanitizes the HTML before showing it
(`src/components/serverHtml.tsx`). Of the `data-` attributes only these are
kept, and each does one harmless thing:

| Markup | What the client does |
|---|---|
| `<a class="command" data-text="look sword">` | Clicking puts `data-text` in the input. Nothing is sent. |
| `<blockquote data-content-type="text/markdown">` | With `text/markdown`, the quotation's Copy button copies it as Markdown; otherwise as its text. |
| `<a class="thing" data-thing="#29612">portable radio</a>` | A bound name: activating it selects that thing in the Room tab. Nothing is sent. |

`data-thing` is one or more object ids (`#` and digits) separated by single
spaces, for example `data-thing="#29613 #29614"` for a grouped phrase. It is
kept only on `a.thing` and only when the whole value has that form; the client
adds `href="#"` so the name is a link the keyboard and screen readers reach.
The server sends no `href`. What activating does is in
`docs/room-layout.md`, "Names in the room's text".

`data-exit` is always removed from server HTML: exit links, which send a
command when clicked, come only from the client's own parsing of ANSI lines.

### `Client.Html.Add_markdown`

```json
{
  "data": [
    "# Title",
    "",
    "Markdown body."
  ]
}
```

Joins `data`, renders it with `marked` using GitHub-flavored Markdown and
line-break support, trims the trailing newline that `marked` adds to block
output, and emits HTML through the client's `html` event.

## `Client.File`

- Source: Mongoose
- Direction: server to client
- Implementation: `src/gmcp/Client/File.ts`

### `Client.File.Download`

```json
{
  "url": "https://example.invalid/file.txt"
}
```

Opens the URL in a new browser tab/window when `url` is non-empty.

## `Client.Speech`

- Source: Mongoose
- Direction: server to client
- Implementation: `src/gmcp/Client/Speech.ts`

### `Client.Speech.Speak`

```json
{
  "text": "Incoming message.",
  "rate": 1,
  "pitch": 1,
  "volume": 0.5
}
```

Creates a `SpeechSynthesisUtterance` and sends it to `speechSynthesis.speak`.

