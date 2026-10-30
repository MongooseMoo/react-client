# Object.Properties

The Properties tab browses numbered objects and edits native properties through
the player's existing authenticated GMCP connection. It advertises
`Object.Properties 1` through `Core.Supports`. It does not grant permissions or
send an actor identity. The MOO checks authority on each request.

Every request has a unique string `id`. The server echoes it and the operation
in `Object.Properties.Result`. The client accepts only the outstanding request
for the same connection generation and operation. Requests time out after 15
seconds; failures leave unsaved drafts intact. Disconnect, identity/account
change, sign-out or visitor-policy change clears the browser's transient view,
draft and pending request. Nothing is written to browser persistence.

| Message | Additional request fields |
| --- | --- |
| `Object.Properties.List` | `target`, `search`, `filter` (`all`, `local`, `writable`), `offset` |
| `Object.Properties.Get` | `target`, `name`, `edit: 1` |
| `Object.Properties.Set` | `target`, `name`, `identity`, `snapshot`, `value` |
| `Object.Properties.Set` (metadata) | `target`, `name`, `identity`, `snapshot`, `owner`, `flags` |
| `Object.Properties.Clear` | `target`, `name`, `identity`, `snapshot` |

List pages contain at most 30 rows. Opening a named property remains available
when listing the object's property table is refused. `Get` enters the property
detail editor; the server supplies the current object lifetime and property
snapshot used by subsequent edits. A stale value, metadata or lifetime must be
reloaded before saving. A value save is direct property assignment like `@set`;
it does not invoke a guessed domain setter or replace `@configure` operations.

Results contain `id`, `operation` (`List`, `Get`, `Set`, `Clear`), numeric `ok`
(`0` or `1`), `message`, `target`, and `targetName`. A successful List adds
`rows`, `total`, and `offset`. Other successful operations add `detail`.

A row contains string `name`, `type`, `definer`, `supplier`, `owner` and `flags`;
numeric `local`, `clear`, `readable`, `writable`, `builtin` and
`metadataWritable` and `ownerWritable` are each 0 or 1. Detail adds `value`, numeric `editable`, and
string `identity` and `snapshot`. Missing disclosure is an empty string, not
permission to read the omitted field. Native property ownership and flags,
built-in rules, and metadata authority remain server decisions. Object or
workspace ownership does not imply ownership of every property slot.
Native write authority may allow changing flags while owner transfer remains
unavailable; `ownerWritable` separately controls the owner field.

Values preserve MOO types:

```json
{"type":"int","text":"9223372036854775807"}
{"type":"list","items":[{"type":"str","text":"Hello"}]}
{"type":"map","entries":[[{"type":"int","text":"1"},{"type":"float","text":"1.0"}]]}
```

Scalar tags are `str`, `int`, `float`, `bool`, `obj`, and `err`, each with string
`text`. Boolean text is `true` or `false`; object references use `#number`.
Numbers stay text in JavaScript and on the wire. Map entries are ordered pairs
of typed keys and values, so numeric and string keys are not conflated by JSON.
No value is evaluated as MOO source.

`opaque` and `truncated` values carry string `text` explaining the display.
WAIF and anonymous-object identities cannot be recreated by this browser.
Either tag anywhere in a value disables whole-property replacement. A
truncated display is never submitted as though it were the full value.

The panel uses a native table with row/column headers and a separate labeled
form. Lists and maps use native disclosures; normal Tab navigation reaches
editable controls. Opening a property focuses its heading. Closing or
cancelling returns to its row. Server feedback appears once through a status
or alert region. Value edits and metadata edits are saved separately.
