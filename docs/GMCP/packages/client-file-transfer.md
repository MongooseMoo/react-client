# `Client.FileTransfer`

`Client.FileTransfer` is a Mongoose GMCP signaling protocol for WebRTC file
transfer. It is implemented in `src/gmcp/Client/FileTransfer.ts`.

## Package

- Name: `Client.FileTransfer`
- Version: `1`
- Source: Mongoose
- Direction: bidirectional

GMCP carries signaling only. File bytes are transferred through the WebRTC data
channel managed outside the GMCP package.

## Messages

### `Client.FileTransfer.Offer`

```json
{
  "sender": "alice",
  "recipient": "bob",
  "filename": "map.txt",
  "filesize": 12345,
  "offerSdp": "...",
  "hash": "sha256-or-other-transfer-id"
}
```

Received offers are stored in `fileTransferManager.pendingOffers` by `hash` and
raised through `onFileTransferOffer`.

### `Client.FileTransfer.Accept`

```json
{
  "sender": "bob",
  "hash": "sha256-or-other-transfer-id",
  "filename": "map.txt",
  "answerSdp": "..."
}
```

### `Client.FileTransfer.Reject`

```json
{
  "sender": "bob",
  "hash": "sha256-or-other-transfer-id"
}
```

### `Client.FileTransfer.Cancel`

```json
{
  "sender": "alice",
  "recipient": "bob",
  "hash": "sha256-or-other-transfer-id"
}
```

### `Client.FileTransfer.Candidate`

```json
{
  "sender": "alice",
  "recipient": "bob",
  "candidate": "{\"candidate\":\"...\"}"
}
```

`candidate` is a JSON string containing the ICE candidate object.

### `Client.FileTransfer.RequestResend`

```json
{
  "sender": "bob",
  "hash": "sha256-or-other-transfer-id"
}
```

Requests that the other side resend or restart the transfer metadata for the
identified hash.

