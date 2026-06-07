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

