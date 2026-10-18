# `Client.FileTransfer`

`Client.FileTransfer` is a Mongoose GMCP signaling protocol for WebRTC file
transfer. The package is implemented in `src/gmcp/Client/FileTransfer.ts`; the
transfers themselves are run by the engine in `src/fileTransfer/`, which talks to
the package through `src/fileTransfer/gmcpSignaling.ts`.

## Package

- Name: `Client.FileTransfer`
- Version: `1`
- Source: Mongoose
- Direction: bidirectional

GMCP carries signaling only. File bytes travel over a WebRTC data channel between
the two clients; see [Data channel protocol](#data-channel-protocol).

This client relies on the server to relay each message to the player it is
addressed to. It names that player in `recipient` (or, for `Accept` and `Reject`,
in `sender`: the sender of the offer being answered) and reads `sender` in a
message it receives as the player the message came from.

A message that does not have the shape described here is dropped by the receiving
client with a console warning.

## The transfer id: `hash`

`hash` identifies a file by its content. It is 64 lower-case hexadecimal
characters:

```
hash = hex(SHA-256(SHA-256(piece 0) || SHA-256(piece 1) || ...))
```

where the pieces are consecutive 16 KiB (16384-byte) slices of the file and the
last one may be shorter. An empty file has no pieces, so its `hash` is the SHA-256
of the empty input. See `src/fileTransfer/contentId.ts`.

The receiver agrees to this value by accepting an offer and checks the assembled
file against it before saving anything. An offer whose `hash` is not of this form
is ignored.

Between two players, a `hash` names at most one transfer at a time, whatever its
direction: `Accept`, `Reject`, `Cancel` and `Candidate` carry nothing else to tell
transfers apart.

## Messages

### `Client.FileTransfer.Offer`

```json
{
  "sender": "alice",
  "recipient": "bob",
  "filename": "map.txt",
  "filesize": 12345,
  "offerSdp": "{\"type\":\"offer\",\"sdp\":\"...\"}",
  "hash": "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"
}
```

`offerSdp` is a JSON string holding the WebRTC session description of a new peer
connection. `filesize` is the size in bytes, a non-negative integer.

An offer that resumes a transfer whose connection was lost carries
`"resume": true` inside the `offerSdp` JSON, beside `type` and `sdp`:

```json
"offerSdp": "{\"type\":\"offer\",\"sdp\":\"...\",\"resume\":true}"
```

See [Resume](#resume) for how such an offer is answered.

A client rejects an offer without showing it when the file is larger than it
accepts (100 MiB), when it already holds four offers from the offering player
that its user has not decided on, or 64 from all players together, or when it is
itself sending the same content to the offering player. An offer its user has not
decided on within five minutes is rejected as well.

### `Client.FileTransfer.Accept`

```json
{
  "sender": "bob",
  "hash": "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
  "filename": "map.txt",
  "answerSdp": "{\"type\":\"answer\",\"sdp\":\"...\"}"
}
```

`answerSdp` is a JSON string holding the session description that answers the
offer. Every offer that is accepted, a resume offer included, is answered with
its own `Accept`.

### `Client.FileTransfer.Reject`

```json
{
  "sender": "bob",
  "hash": "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"
}
```

Sent by the player an offer was made to; it ends the transfer for the offering
side.

### `Client.FileTransfer.Cancel`

```json
{
  "sender": "alice",
  "recipient": "bob",
  "hash": "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"
}
```

Sent by either side to end a transfer the other side knows of. The offering side
also sends it when its offer has gone unanswered for five minutes.

### `Client.FileTransfer.Candidate`

```json
{
  "sender": "alice",
  "recipient": "bob",
  "candidate": "{\"transfer\":\"9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08\",\"candidate\":{\"candidate\":\"...\",\"sdpMid\":\"0\",\"sdpMLineIndex\":0}}"
}
```

`candidate` is a JSON string of the form
`{ "transfer": <hash>, "candidate": {...} }`: the inner `candidate` is the ICE
candidate object and `transfer` is the `hash` of the transfer whose connection it
belongs to. The message has no `hash` field of its own, and each transfer has its
own peer connection, so this is what keeps the candidates of several transfers
between the same two players apart. A candidate without the `transfer` tag is
dropped.

### `Client.FileTransfer.RequestResend`

No longer sent by this client, and never handled by it. A transfer that lost its
connection is resumed by a new `Offer`; see [Resume](#resume).

## Data channel protocol

Each transfer has its own `RTCPeerConnection` with one ordered data channel,
labelled `fileTransfer`, opened by the sending client. The receiving client
creates its end only after its user accepted the offer. The frames are defined in
`src/fileTransfer/wire.ts`.

A frame is one binary data-channel message. Its first byte is its type:

| Type | Name | Direction | Rest of the frame |
| --- | --- | --- | --- |
| `1` | `piece` | sender to receiver | piece index as an unsigned 32-bit big-endian integer, then the piece's bytes |
| `2` | `ready` | receiver to sender | UTF-8 JSON `{ "have": [[start, end], ...] }` |
| `3` | `complete` | receiver to sender | nothing |
| `4` | `abort` | either | UTF-8 JSON `{ "reason": "<code>" }` |
| `5` | `stored` | receiver to sender | a count as an unsigned 32-bit big-endian integer; the frame is exactly five bytes |

Piece `i` is bytes `i * 16384` up to `(i + 1) * 16384` of the file, the same
pieces the `hash` is computed over. A frame carries no transfer id, because the
channel belongs to one transfer.

The flow on one connection:

1. When the channel opens, the receiver sends `ready`. `have` lists the pieces it
   already holds as half-open ranges of piece indices, ascending and not
   overlapping; it is empty for a transfer that starts from nothing.
2. The sender sends every piece not listed, in ascending order, within the
   window described under [Flow control](#flow-control). If `ready` lists every
   piece, it sends none.
3. Once the receiver holds every piece, it checks the file against the `hash` it
   accepted, saves the file, and then sends `complete`.
4. The sender reports the transfer as complete only when it receives `complete`.

Either side sends `abort` when it has to give up for a reason the other side
cannot see. `reason` is one of `integrity`, `storage`, `protocol`, `delivery` or
`unreadable`; anything else is taken as `protocol`. A frame that is out of place,
or a piece whose index or length does not fit the offered file, is a protocol
error and is answered with `abort`.

### Flow control

The receiver decides how fast pieces arrive, so that pieces it has not yet
written to storage cannot pile up in its memory.

- The receiver counts the pieces it has dealt with on the connection: those it
  stored, and those it ignored because it already held them. Each time that count
  reaches a multiple of 16 it sends `stored` with the count.
- The sender never has more than 64 pieces sent on the connection beyond the last
  count it was told. When it has, it waits for the next `stored`.
- The count starts at zero on every connection. A `stored` whose count is lower
  than the one before it, or higher than the number of pieces sent, is a protocol
  error.
- A receiver on which more than 64 pieces wait to be dealt with treats that as a
  protocol error too.

### Who closes the connection

Closing a connection may lose a frame that was just sent on it. So the side that
receives the last frame of a transfer (`complete` or `abort`) closes the
connection, and the side that sent it keeps the connection open until the other
side has closed it, or for 30 seconds at most.

### Resume

A connection counts as lost when it fails, when the other side closes it without
a last frame, or when it shows no progress for 30 seconds while it is being set
up or while pieces are moving. Once every piece has been sent the sender waits
longer, because checking and saving the file can take the receiver a while and
it sends nothing meanwhile: five minutes for `complete` or `abort`. What follows
applies once an offer has been accepted; a connection lost before that ends the
transfer as failed.

- The sender then opens a new peer connection and sends a new `Offer` with the
  same `hash`, `filename` and `filesize` and with `"resume": true` in `offerSdp`.
  It does so up to three times in a row; a `ready` from the receiver starts the
  count again. The next loss after that ends the transfer as failed.
- The receiver keeps the pieces it has and waits up to 60 seconds for that offer.
  It answers it with `Accept` without asking its user again, and its `ready` on
  the new connection lists the pieces it holds, so only the missing ones are sent.
- A receiver that is still checking or saving the file answers the offer in the
  same way, at once. Its `ready` then lists every piece, and `complete` or
  `abort` follows on that connection when it has finished.
- A receiver that had already saved the file answers a resume offer too, and
  sends only `complete` on the new connection: the sender had missed it.
- A receiver takes four such offers in a row without a piece stored in between.
  A fifth ends a transfer still under way as failed, and it is answered with
  `Reject`, as is a fifth for a file already saved.
- A receiver whose transfer ended for any other reason than a lost connection
  answers a resume offer with `Reject`.
- A receiver that gave up waiting for the offer, or that no longer knows the
  transfer, for example after a page reload, treats the offer as a new one and
  asks its user. The pieces it stored earlier
  for the same player and `hash` are still used, unless they have gone untouched
  for seven days.

A client built before this protocol frames the data channel differently and
sends candidates without the `transfer` tag, so it cannot exchange files with a
client that implements this document.
